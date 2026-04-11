import { Effect, Schema } from "effect"
import { ArchitectureConfigError } from "../core/errors.js"
import { decodeYaml } from "../core/yaml.js"

export const dedupeBy = <A>(values: ReadonlyArray<A>, keyOf: (value: A) => string): ReadonlyArray<A> =>
  Array.from(new Map(values.map((value) => [keyOf(value), value])).values())

export const interpolate = (template: string, variables: Record<string, string>) =>
  template.replace(/\$\{([^}]+)\}/g, (_, key: string) => variables[key] ?? "")

export const decodeArchitectureYaml = <A>(file: string, raw: string, schema: Schema.Schema<A, any, never>) =>
  decodeYaml(file, raw, schema).pipe(
    Effect.mapError((error) => new ArchitectureConfigError({ file, reason: String(error) }))
  )
