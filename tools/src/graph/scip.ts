import { Effect } from "effect"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import protobuf from "protobufjs"
import { CodeGraphError } from "../core/errors.js"
import { GraphArtifactVersion, type GraphArtifact, type GraphArtifactReference, type GraphWorkspaceInput } from "./model.js"

type ScipRelationship = {
  readonly symbol?: string
  readonly is_reference?: boolean
  readonly is_implementation?: boolean
  readonly is_type_definition?: boolean
}

type ScipSymbolInformation = {
  readonly symbol?: string
  readonly relationships?: ReadonlyArray<ScipRelationship>
}

type ScipOccurrence = {
  readonly symbol?: string
  readonly symbol_roles?: number
}

type ScipDocument = {
  readonly language?: string
  readonly relative_path?: string
  readonly occurrences?: ReadonlyArray<ScipOccurrence>
  readonly symbols?: ReadonlyArray<ScipSymbolInformation>
}

type ScipIndex = {
  readonly documents?: ReadonlyArray<ScipDocument>
}

const scipProtoPath = fileURLToPath(new URL("./scip.proto", import.meta.url))

const SymbolRoleDefinition = 0x1

let scipIndexType: protobuf.Type | null = null

const loadScipIndexType = () => {
  if (scipIndexType) {
    return scipIndexType
  }

  const source = fs.readFileSync(scipProtoPath, "utf8")
  const parsed = protobuf.parse(source, { keepCase: true })
  scipIndexType = parsed.root.lookupType("scip.Index") as protobuf.Type
  return scipIndexType
}

const hasRole = (bitset: number | undefined, role: number) =>
  ((bitset ?? 0) & role) === role

const isLocalSymbol = (symbol: string) =>
  symbol.startsWith("local ")

const decodeScipIndex = (
  projectSlug: string,
  workspaceSlug: string,
  content: Uint8Array
): Effect.Effect<ScipIndex, CodeGraphError> =>
  Effect.try({
    try: () => {
      const type = loadScipIndexType()
      const decoded = type.decode(content)
      return type.toObject(decoded, {
        arrays: true,
        defaults: false,
        enums: String,
        longs: Number
      }) as ScipIndex
    },
    catch: (error) => new CodeGraphError({
      project: projectSlug,
      workspace: workspaceSlug,
      phase: "scip-decode",
      reason: String(error)
    })
  })

const addReference = (
  references: Map<string, GraphArtifactReference>,
  sourceFilePath: string,
  targetFilePath: string
) => {
  if (!sourceFilePath || !targetFilePath || sourceFilePath === targetFilePath) {
    return
  }

  const id = `${sourceFilePath}:${targetFilePath}`
  if (references.has(id)) {
    return
  }

  references.set(id, {
    id,
    source_file_path: sourceFilePath,
    target_file_path: targetFilePath
  })
}

export const buildGraphArtifactFromScip = (
  workspace: GraphWorkspaceInput,
  rawIndex: Uint8Array
): Effect.Effect<GraphArtifact, CodeGraphError> =>
  Effect.gen(function* () {
    const index = yield* decodeScipIndex(workspace.project_slug, workspace.workspace_slug, rawIndex)
    const documents = index.documents ?? []
    const symbolOwners = new Map<string, string>()
    const references = new Map<string, GraphArtifactReference>()

    documents.forEach((document) => {
      const relativePath = document.relative_path
      if (!relativePath) {
        return
      }

      document.symbols?.forEach((symbolInformation) => {
        const symbol = symbolInformation.symbol
        if (!symbol || isLocalSymbol(symbol)) {
          return
        }

        symbolOwners.set(symbol, relativePath)
      })
    })

    documents.forEach((document) => {
      const relativePath = document.relative_path
      if (!relativePath) {
        return
      }

      document.symbols?.forEach((symbolInformation) => {
        symbolInformation.relationships?.forEach((relationship) => {
          const targetSymbol = relationship.symbol
          if (!targetSymbol || isLocalSymbol(targetSymbol)) {
            return
          }

          const targetFilePath = symbolOwners.get(targetSymbol)
          if (!targetFilePath) {
            return
          }

          if (relationship.is_implementation || relationship.is_type_definition || relationship.is_reference) {
            addReference(references, relativePath, targetFilePath)
          }
        })
      })

      document.occurrences?.forEach((occurrence) => {
        const targetSymbol = occurrence.symbol
        if (!targetSymbol || isLocalSymbol(targetSymbol) || hasRole(occurrence.symbol_roles, SymbolRoleDefinition)) {
          return
        }

        const targetFilePath = symbolOwners.get(targetSymbol)
        if (!targetFilePath) {
          return
        }

        addReference(references, relativePath, targetFilePath)
      })
    })

    return {
      version: GraphArtifactVersion,
      project_slug: workspace.project_slug,
      workspace_slug: workspace.workspace_slug,
      root_path: workspace.root_path,
      primary_language: workspace.primary_language,
      references: Array.from(references.values())
    }
  })
