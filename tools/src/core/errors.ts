import { Data } from "effect"

export class FileSystemError extends Data.TaggedError("FileSystemError")<{
  readonly operation: string
  readonly target: string
  readonly reason: string
}> {}

export class CommandExecutionError extends Data.TaggedError("CommandExecutionError")<{
  readonly command: string
  readonly workingDirectory: string
  readonly reason: string
}> {}

export class YamlParseError extends Data.TaggedError("YamlParseError")<{
  readonly context: string
  readonly reason: string
}> {}

export class SchemaValidationError extends Data.TaggedError("SchemaValidationError")<{
  readonly context: string
  readonly reason: string
}> {}

export class ProjectRegistryError extends Data.TaggedError("ProjectRegistryError")<{
  readonly kind: string
}> {}

export class EurekaSourceError extends Data.TaggedError("EurekaSourceError")<{
  readonly slug: string
  readonly reason: string
}> {}

export class AssetBuildError extends Data.TaggedError("AssetBuildError")<{
  readonly reason: string
}> {}

export class ArchitectureDiscoveryError extends Data.TaggedError("ArchitectureDiscoveryError")<{
  readonly reason: string
}> {}

export class DiagramRenderError extends Data.TaggedError("DiagramRenderError")<{
  readonly diagram: string
  readonly reason: string
}> {}

export class ReadmeUpdateError extends Data.TaggedError("ReadmeUpdateError")<{
  readonly reason: string
}> {}
