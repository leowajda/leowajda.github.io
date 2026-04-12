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

export class ProjectSourceMissingError extends Data.TaggedError("ProjectSourceMissingError")<{
  readonly slug: string
  readonly sourcePath: string
}> {}

export class EurekaSourceError extends Data.TaggedError("EurekaSourceError")<{
  readonly slug: string
  readonly reason: string
}> {}

export class SourceNotesError extends Data.TaggedError("SourceNotesError")<{
  readonly slug: string
  readonly phase: string
  readonly reason: string
}> {}

export class CodeGraphError extends Data.TaggedError("CodeGraphError")<{
  readonly project: string
  readonly workspace: string
  readonly phase: string
  readonly reason: string
}> {}

export class AssetBuildError extends Data.TaggedError("AssetBuildError")<{
  readonly reason: string
}> {}

export class ArchitectureDiscoveryError extends Data.TaggedError("ArchitectureDiscoveryError")<{
  readonly phase: string
  readonly reason: string
}> {}

export class ArchitectureConfigError extends Data.TaggedError("ArchitectureConfigError")<{
  readonly file: string
  readonly reason: string
}> {}

export class ProjectManifestError extends Data.TaggedError("ProjectManifestError")<{
  readonly file: string
  readonly reason: string
}> {}

export class ArchitectureGraphError extends Data.TaggedError("ArchitectureGraphError")<{
  readonly reason: string
}> {}

export class ArchitectureCompileError extends Data.TaggedError("ArchitectureCompileError")<{
  readonly diagram: string
  readonly reason: string
}> {}

export class DiagramRenderError extends Data.TaggedError("DiagramRenderError")<{
  readonly diagram: string
  readonly reason: string
}> {}

export class ArchitectureArtifactWriteError extends Data.TaggedError("ArchitectureArtifactWriteError")<{
  readonly target: string
  readonly reason: string
}> {}
