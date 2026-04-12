import { Context, Layer } from "effect"

export type GraphBuildMode = "build" | "cache-only" | "refresh"

interface GraphBuildSettingsService {
  readonly mode: GraphBuildMode
}

export class GraphBuildSettings extends Context.Tag("GraphBuildSettings")<
  GraphBuildSettings,
  GraphBuildSettingsService
>() {
  static layer = (mode: GraphBuildMode) =>
    Layer.succeed(this, { mode })
}
