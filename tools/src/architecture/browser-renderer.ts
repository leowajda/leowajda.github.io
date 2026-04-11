import {
  convertToExcalidrawElements,
  exportToSvg,
  serializeAsJSON
} from "@excalidraw/excalidraw"
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw"
import { diagramElementId } from "./mermaid.js"
import type { DiagramPlacement, DiagramRenderLayout, DiagramRenderResult, DiagramRenderSpec, RenderGroupTheme } from "./schema.js"

type BinaryFiles = Record<string, unknown>

type SceneElement = {
  readonly id: string
  readonly type: string
  readonly x: number
  readonly y: number
  readonly width?: number
  readonly height?: number
  readonly strokeColor?: string
  readonly backgroundColor?: string
  readonly fillStyle?: string
  readonly strokeWidth?: number
  readonly roundness?: unknown
  readonly text?: string
  readonly containerId?: string | null
  readonly startBinding?: { readonly elementId: string } | null
  readonly endBinding?: { readonly elementId: string } | null
}

declare global {
  interface Window {
    __renderArchitectureDiagram?: (payload: DiagramRenderSpec) => Promise<DiagramRenderResult>
  }
}

const isRenderableShape = (element: SceneElement) =>
  element.type === "rectangle" || element.type === "ellipse" || element.type === "diamond"

const minBy = (values: ReadonlyArray<number>) => Math.min(...values)
const sign = (value: number) => value === 0 ? 0 : value > 0 ? 1 : -1

const centerOf = (element: Pick<SceneElement, "x" | "y" | "width" | "height">) => ({
  x: element.x + (element.width ?? 0) / 2,
  y: element.y + (element.height ?? 0) / 2
})

const edgePointTowards = (
  rect: Pick<SceneElement, "x" | "y" | "width" | "height">,
  target: { readonly x: number; readonly y: number }
) => {
  const width = rect.width ?? 0
  const height = rect.height ?? 0
  const center = centerOf(rect)
  const dx = target.x - center.x
  const dy = target.y - center.y
  const halfW = width / 2
  const halfH = height / 2

  if (dx === 0 && dy === 0) {
    return center
  }

  const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : halfW / Math.abs(dx)
  const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : halfH / Math.abs(dy)
  const scale = Math.min(scaleX, scaleY)
  const padding = 8

  return {
    x: center.x + dx * scale + sign(dx) * padding,
    y: center.y + dy * scale + sign(dy) * padding
  }
}

const countTextLines = (text: string) => text.split("\n").length
const longestLineLength = (text: string) => Math.max(...text.split("\n").map((line) => line.length))

const buildNoteRect = (
  target: Pick<SceneElement, "x" | "y" | "width" | "height">,
  placement: DiagramPlacement,
  noteWidth: number,
  noteHeight: number,
  gap: number
) => {
  const targetWidth = target.width ?? 0
  const targetHeight = target.height ?? 0
  const targetCenter = centerOf(target)

  switch (placement) {
    case "top":
      return {
        x: targetCenter.x - noteWidth / 2,
        y: target.y - gap - noteHeight
      }
    case "right":
      return {
        x: target.x + targetWidth + gap,
        y: targetCenter.y - noteHeight / 2
      }
    case "bottom":
      return {
        x: targetCenter.x - noteWidth / 2,
        y: target.y + targetHeight + gap
      }
    case "left":
      return {
        x: target.x - gap - noteWidth,
        y: targetCenter.y - noteHeight / 2
      }
  }
}

const rectsOverlap = (
  left: Pick<SceneElement, "x" | "y" | "width" | "height">,
  right: Pick<SceneElement, "x" | "y" | "width" | "height">
) =>
  left.x < right.x + (right.width ?? 0) &&
  left.x + (left.width ?? 0) > right.x &&
  left.y < right.y + (right.height ?? 0) &&
  left.y + (left.height ?? 0) > right.y

const moveRect = (
  rect: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  placement: DiagramPlacement,
  step: number
) => {
  switch (placement) {
    case "top":
      return { ...rect, y: rect.y - step }
    case "right":
      return { ...rect, x: rect.x + step }
    case "bottom":
      return { ...rect, y: rect.y + step }
    case "left":
      return { ...rect, x: rect.x - step }
  }
}

const resolveAnnotationRect = (
  target: Pick<SceneElement, "x" | "y" | "width" | "height">,
  placement: DiagramPlacement,
  noteWidth: number,
  noteHeight: number,
  gap: number,
  occupiedRects: ReadonlyArray<Pick<SceneElement, "x" | "y" | "width" | "height">>
) => {
  let rect = {
    ...buildNoteRect(target, placement, noteWidth, noteHeight, gap),
    width: noteWidth,
    height: noteHeight
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (!occupiedRects.some((entry) => rectsOverlap(rect, entry))) {
      return rect
    }
    rect = moveRect(rect, placement, gap)
  }

  return rect
}

const resolveNodeShape = (elements: ReadonlyArray<SceneElement>, nodeId: string, label: string): SceneElement | undefined => {
  const targetId = diagramElementId(nodeId)
  const directMatch = elements.find((element) => element.id === targetId && isRenderableShape(element))
  if (directMatch) {
    return directMatch
  }

  const boundText = elements.find((element) => element.type === "text" && element.text === label && element.containerId)
  return boundText?.containerId
    ? elements.find((element) => element.id === boundText.containerId && isRenderableShape(element))
    : undefined
}

const buildLegendSkeletons = (
  originX: number,
  originY: number,
  groups: ReadonlyArray<RenderGroupTheme>,
  legendColumns: number
) =>
  groups.flatMap((group, index) => {
    const column = index % legendColumns
    const row = Math.floor(index / legendColumns)
    const x = originX + column * 200
    const y = originY + row * 68
    const id = `legend-${group.id}`
    return [
      {
        id,
        type: "rectangle",
        x,
        y,
        width: 180,
        height: 52,
        strokeColor: group.palette.stroke,
        backgroundColor: group.palette.fill,
        fillStyle: "solid",
        roundness: { type: 3 },
        strokeWidth: 2,
        label: {
          text: group.title,
          fontSize: 18,
          strokeColor: group.palette.text
        }
      }
    ]
  })

const buildAnnotationSkeletons = (payload: DiagramRenderSpec, elements: ReadonlyArray<SceneElement>) =>
  payload.annotations.reduce<Array<any>>((acc, annotation) => {
    const renderLayout = payload.render
    const node = payload.nodes.find((entry) => entry.id === annotation.target)
    const target = node ? resolveNodeShape(elements, node.id, node.label) : undefined
    const group = payload.groups.find((entry) => entry.id === annotation.tone)
    if (!target || !group || target.width === undefined || target.height === undefined) {
      return acc
    }

    const noteWidth = Math.max(renderLayout.noteWidth, longestLineLength(annotation.text) * 9.2 + 44)
    const noteHeight = Math.max(100, countTextLines(annotation.text) * 22 + 34)
    const occupiedRects = [
      ...elements.filter(isRenderableShape).map((element) => ({
        x: element.x,
        y: element.y,
        width: element.width ?? 0,
        height: element.height ?? 0
      })),
      ...acc
        .filter((entry) => entry.type === "rectangle")
        .map((entry) => ({ x: entry.x, y: entry.y, width: entry.width ?? 0, height: entry.height ?? 0 }))
    ]
    const noteRect = resolveAnnotationRect(target, annotation.placement, noteWidth, noteHeight, renderLayout.noteGap, occupiedRects)
    const noteId = annotation.id
    const targetRect = { x: target.x, y: target.y, width: target.width, height: target.height }
    const arrowStart = edgePointTowards(noteRect, centerOf(targetRect))
    const arrowEnd = edgePointTowards(targetRect, centerOf(noteRect))

    acc.push(
      {
        id: noteId,
        type: "rectangle",
        x: noteRect.x,
        y: noteRect.y,
        width: noteWidth,
        height: noteHeight,
        strokeColor: group.palette.stroke,
        backgroundColor: group.palette.fill,
        fillStyle: "solid",
        roundness: { type: 3 },
        strokeWidth: 2,
        label: {
          text: annotation.text,
          fontSize: 18,
          strokeColor: group.palette.text,
          textAlign: "left",
          verticalAlign: "middle"
        }
      },
      {
        id: `${noteId}-arrow`,
        type: "arrow",
        x: arrowStart.x,
        y: arrowStart.y,
        strokeColor: group.palette.stroke,
        backgroundColor: "transparent",
        strokeWidth: 2,
        points: [
          [0, 0],
          [arrowEnd.x - arrowStart.x, arrowEnd.y - arrowStart.y]
        ],
        endArrowhead: "triangle"
      }
    )

    return acc
  }, [])

const decorateElements = (
  elements: ReadonlyArray<SceneElement>,
  payload: DiagramRenderSpec
): ReadonlyArray<SceneElement> => {
  const nodeById = new Map(payload.nodes.map((node) => [diagramElementId(node.id), node]))
  const paletteEntries: Array<readonly [string, RenderGroupTheme["palette"]]> = []

  for (const node of payload.nodes) {
    const group = payload.groups.find((entry) => entry.id === node.group)
    if (group) {
      paletteEntries.push([diagramElementId(node.id), group.palette] as const)
    }
  }

  const paletteByNodeId = new Map<string, RenderGroupTheme["palette"]>(paletteEntries)

  return elements.map((element) => {
    const nodePalette = paletteByNodeId.get(element.id)
    if (nodePalette && isRenderableShape(element)) {
      return {
        ...element,
        strokeColor: nodePalette.stroke,
        backgroundColor: nodePalette.fill,
        fillStyle: "solid",
        strokeWidth: 2.5,
        roundness: element.type === "rectangle" ? { type: 3 } : element.roundness
      }
    }

    if (element.type === "text" && element.containerId) {
      const containerNode = nodeById.get(element.containerId)
      if (containerNode) {
        const palette = paletteByNodeId.get(element.containerId)
        if (palette) {
          return {
            ...element,
            strokeColor: palette.text
          }
        }
      }
    }

    if (element.type === "arrow") {
      const sourcePalette = element.startBinding?.elementId ? paletteByNodeId.get(element.startBinding.elementId) : undefined
      if (sourcePalette) {
        return {
          ...element,
          strokeColor: sourcePalette.stroke,
          backgroundColor: sourcePalette.stroke,
          strokeWidth: 2.2
        }
      }
    }

    return element
  })
}

window.__renderArchitectureDiagram = async (payload) => {
  const { elements, files } = await parseMermaidToExcalidraw(payload.mermaid, {
    flowchart: {
      curve: payload.renderMermaid?.curve === "basis" ? "basis" : "linear"
    },
    themeVariables: payload.renderMermaid?.fontSize
      ? { fontSize: `${payload.renderMermaid.fontSize}px` }
      : undefined
  })
  const phaseOneElements = convertToExcalidrawElements(elements, { regenerateIds: false }) as ReadonlyArray<SceneElement>
  const minX = minBy(phaseOneElements.map((element) => element.x))
  const minY = minBy(phaseOneElements.map((element) => element.y))
  const renderLayout = payload.render
  const legendRows = Math.max(1, Math.ceil(payload.groups.length / renderLayout.legendColumns))
  const legendOriginY = minY - 96 - legendRows * 68

  const decorations = [
    {
      id: `${payload.id}-title`,
      type: "text",
      x: minX,
      y: legendOriginY - 64,
      text: payload.title,
      fontSize: 34,
      strokeColor: "#111827"
    },
    ...buildLegendSkeletons(minX, legendOriginY, payload.groups, renderLayout.legendColumns),
    ...buildAnnotationSkeletons(payload, phaseOneElements)
  ]

  const finalElements = decorateElements(
    convertToExcalidrawElements([...elements, ...decorations], { regenerateIds: false }) as ReadonlyArray<SceneElement>,
    payload
  )
  const binaryFiles = (files ?? {}) as BinaryFiles
  const appState = {
    exportBackground: true,
    exportEmbedScene: false,
    exportWithDarkMode: false,
    viewBackgroundColor: "#ffffff"
  } as const
  const svg = await exportToSvg({
    elements: finalElements as any,
    files: binaryFiles as any,
    appState: appState as any,
    exportPadding: 32
  } as any)

  return {
    svg: new XMLSerializer().serializeToString(svg),
    scene: serializeAsJSON(finalElements as any, appState as any, binaryFiles as any, "local")
  }
}
