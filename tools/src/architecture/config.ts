import { Effect, Schema } from "effect"
import path from "node:path"
import { ArchitectureConfigError } from "../core/errors.js"
import { architectureDirectory } from "../core/paths.js"
import { decodeYaml } from "../core/yaml.js"
import type { FileStoreService } from "../core/workspace.js"
import { FileStore, WorkspaceLive } from "../core/workspace.js"
import {
  ArchitectureDiagramDefinitionSchema,
  ArchitectureGroupDefinitionSchema,
  ArchitectureModuleDefinitionSchema,
  TopologyConfigSchema,
  type ArchitectureConfig
} from "./schema.js"

const GroupsFileSchema = Schema.Struct({
  groups: Schema.Array(ArchitectureGroupDefinitionSchema)
})

const ModulesFileSchema = Schema.Struct({
  modules: Schema.Array(ArchitectureModuleDefinitionSchema)
})
const diagramsDirectory = path.join(architectureDirectory, "diagrams")

const dedupeById = <A extends { readonly id: string }>(values: ReadonlyArray<A>, file: string) => {
  const seen = new Set<string>()

  for (const value of values) {
    if (seen.has(value.id)) {
      return Effect.fail(new ArchitectureConfigError({ file, reason: `Duplicate id '${value.id}'` }))
    }
    seen.add(value.id)
  }

  return Effect.succeed(values)
}

const loadConfigFile = <A>(fileStore: FileStoreService, fileName: string, schema: Schema.Schema<A, any, never>) =>
  Effect.gen(function* () {
    const filePath = path.join(architectureDirectory, fileName)
    const raw = yield* fileStore.readText(filePath).pipe(
      Effect.mapError((error) => new ArchitectureConfigError({ file: fileName, reason: String(error) }))
    )

    return yield* decodeYaml(fileName, raw, schema).pipe(
      Effect.mapError((error) => new ArchitectureConfigError({ file: fileName, reason: String(error) }))
    )
  })

const loadDiagramDefinitions = (fileStore: FileStoreService) => Effect.gen(function* () {
  const entries = yield* fileStore.readDirectory(diagramsDirectory).pipe(
    Effect.mapError((error) => new ArchitectureConfigError({ file: "architecture/diagrams", reason: String(error) }))
  )
  const diagramFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yml"))
    .map((entry) => entry.name)
    .sort()

  const diagrams = yield* Effect.forEach(diagramFiles, (fileName) =>
    fileStore.readText(path.join(diagramsDirectory, fileName)).pipe(
      Effect.mapError((error) => new ArchitectureConfigError({ file: `diagrams/${fileName}`, reason: String(error) })),
      Effect.flatMap((raw) => decodeYaml(`diagrams/${fileName}`, raw, ArchitectureDiagramDefinitionSchema)),
      Effect.mapError((error) => new ArchitectureConfigError({ file: `diagrams/${fileName}`, reason: String(error) }))
    )
  )

  return yield* dedupeById(diagrams, "architecture/diagrams")
})

const validateReferences = (config: ArchitectureConfig) => {
  const groupIds = new Set(config.groups.map((group) => group.id))

  for (const module of config.modules) {
    if (!groupIds.has(module.group)) {
      return Effect.fail(new ArchitectureConfigError({ file: "modules.yml", reason: `Unknown group '${module.group}' on module '${module.id}'` }))
    }
  }

  for (const node of [...config.topology.nodes, ...config.topology.projectNodes]) {
    if (!groupIds.has(node.group)) {
      return Effect.fail(new ArchitectureConfigError({ file: "topology.yml", reason: `Unknown group '${node.group}' on node '${node.id}'` }))
    }
  }

  for (const diagram of config.diagrams) {
    for (const annotation of diagram.annotations) {
      if (!groupIds.has(annotation.tone)) {
        return Effect.fail(new ArchitectureConfigError({
          file: `diagrams/${diagram.id}.yml`,
          reason: `Unknown annotation tone '${annotation.tone}'`
        }))
      }
    }
  }

  return Effect.succeed(config)
}

export class ArchitectureConfigRepository extends Effect.Service<ArchitectureConfigRepository>()("ArchitectureConfigRepository", {
  effect: Effect.gen(function* () {
    const fileStore = yield* FileStore

    return {
      load: () =>
        Effect.gen(function* () {
          const groupsFile = yield* loadConfigFile(fileStore, "groups.yml", GroupsFileSchema)
          const modulesFile = yield* loadConfigFile(fileStore, "modules.yml", ModulesFileSchema)
          const topology = yield* loadConfigFile(fileStore, "topology.yml", TopologyConfigSchema)
          const diagrams = yield* loadDiagramDefinitions(fileStore)
          const groups = yield* dedupeById(groupsFile.groups, "groups.yml")
          const modules = yield* dedupeById(modulesFile.modules, "modules.yml")

          return yield* validateReferences({
            groups,
            modules,
            topology,
            diagrams
          }).pipe(
            Effect.withLogSpan("architecture.config.load"),
            Effect.annotateLogs({ component: "architecture-config" })
          )
        })
    }
  }),
  dependencies: [WorkspaceLive],
  accessors: true
}) {}
