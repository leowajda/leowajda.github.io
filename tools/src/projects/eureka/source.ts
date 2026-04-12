import { Effect, Schema } from "effect"
import { decodeYaml } from "../../core/yaml.js"
import { EurekaSourceError } from "../../core/errors.js"
import {
  EurekaSourceSchema,
  ImplementationSourcesSchema,
  ProblemMetadataSchema,
  type RawProblemRecord,
  type SourceLanguage,
  type ImplementationSources
} from "./schema.js"

export type ProblemSourceRecord = Schema.Schema.Type<typeof ProblemMetadataSchema> & {
  readonly implementations: Readonly<Record<string, ImplementationSources>>
}

export type EurekaSource = {
  readonly languages: Readonly<Record<string, SourceLanguage>>
  readonly problems: Readonly<Record<string, ProblemSourceRecord>>
}

const metadataKeys = new Set(["name", "url", "difficulty", "categories"])

const decodeProblem = (
  slug: string,
  rawProblem: RawProblemRecord,
  languages: Readonly<Record<string, SourceLanguage>>
) =>
  Effect.gen(function* () {
    const unknownKeys = Object.keys(rawProblem).filter((key) => !metadataKeys.has(key) && !(key in languages))
    if (unknownKeys.length > 0) {
      return yield* Effect.fail(new EurekaSourceError({
        slug,
        reason: `references unsupported keys: ${unknownKeys.join(", ")}`
      }))
    }

    const metadata = yield* Schema.decodeUnknown(ProblemMetadataSchema)(rawProblem).pipe(
      Effect.mapError((error) => new EurekaSourceError({
        slug,
        reason: `invalid metadata\n${error.message}`
      }))
    )

    const implementations = Object.fromEntries(
      (
        yield* Effect.forEach(Object.keys(languages), (language) => {
          const rawImplementations = rawProblem[language]
          if (rawImplementations === undefined) {
            return Effect.succeed(null)
          }

          return Schema.decodeUnknown(ImplementationSourcesSchema)(rawImplementations).pipe(
            Effect.map((value) => [language, value] as const),
            Effect.mapError((error) => new EurekaSourceError({
              slug,
              reason: `invalid implementations for '${language}'\n${error.message}`
            }))
          )
        })
      ).filter((entry): entry is readonly [string, ImplementationSources] => entry !== null)
    )

    if (!Object.keys(implementations).length) {
      return yield* Effect.fail(new EurekaSourceError({ slug, reason: "has no implementations" }))
    }

    return {
      ...metadata,
      implementations
    } satisfies ProblemSourceRecord
  })

export const decodeEurekaSource = (raw: string) =>
  decodeYaml("Unable to decode Eureka problem table", raw, EurekaSourceSchema).pipe(
    Effect.flatMap((source) =>
      Effect.forEach(Object.entries(source.problems), ([slug, rawProblem]) =>
        decodeProblem(slug, rawProblem, source.languages).pipe(Effect.map((problem) => [slug, problem] as const))
      ).pipe(
        Effect.map((problems) => ({
          languages: source.languages,
          problems: Object.fromEntries(problems)
        } satisfies EurekaSource))
      )
    )
  )
