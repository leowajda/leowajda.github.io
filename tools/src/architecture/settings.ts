import { Config, Effect } from "effect"

export type ArchitectureSettingsData = {
  readonly architectureRoots: ReadonlyArray<string>
  readonly trackedExtensions: ReadonlyArray<string>
  readonly scanConcurrency: number
  readonly rootScanConcurrency: number
  readonly renderConcurrency: number
}

export class ArchitectureSettings extends Effect.Service<ArchitectureSettings>()("ArchitectureSettings", {
  effect: Config.all({
    architectureRoots: Config.array(Config.string(), "ARCHITECTURE_ROOTS").pipe(
      Config.withDefault(["tools/src", "packages/ui/src", "packages/theme/src", "site-src"])
    ),
    trackedExtensions: Config.array(Config.string(), "ARCHITECTURE_TRACKED_EXTENSIONS").pipe(
      Config.withDefault([".ts", ".tsx", ".js", ".jsx", ".scss", ".css", ".html", ".md", ".yml"])
    ),
    scanConcurrency: Config.integer("ARCHITECTURE_SCAN_CONCURRENCY").pipe(Config.withDefault(8)),
    rootScanConcurrency: Config.integer("ARCHITECTURE_ROOT_SCAN_CONCURRENCY").pipe(Config.withDefault(4)),
    renderConcurrency: Config.integer("ARCHITECTURE_RENDER_CONCURRENCY").pipe(Config.withDefault(1))
  }) as Config.Config<ArchitectureSettingsData>
}) {}
