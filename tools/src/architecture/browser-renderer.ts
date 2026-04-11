import {
  convertToExcalidrawElements,
  exportToSvg,
  serializeAsJSON
} from "@excalidraw/excalidraw"
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw"

declare global {
  interface Window {
    __renderArchitectureDiagram?: (mermaid: string) => Promise<{
      readonly svg: string
      readonly scene: string
    }>
  }
}

window.__renderArchitectureDiagram = async (mermaid) => {
  const { elements, files } = await parseMermaidToExcalidraw(mermaid)
  const excalidrawElements = convertToExcalidrawElements(elements)
  const binaryFiles = files ?? {}
  const appState = {
    exportBackground: true,
    exportEmbedScene: false,
    exportWithDarkMode: false,
    viewBackgroundColor: "#ffffff"
  } as const
  const svg = await exportToSvg({
    elements: excalidrawElements,
    files: binaryFiles,
    appState: appState as any,
    exportPadding: 24
  } as any)

  return {
    svg: new XMLSerializer().serializeToString(svg),
    scene: serializeAsJSON(excalidrawElements, appState as any, binaryFiles, "local")
  }
}
