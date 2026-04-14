import { Schema } from "effect"
import { CodeReferencesPanelSchema } from "../../../../packages/graph/src/index.js"

export const EurekaLanguageSchema = Schema.Struct({
  label: Schema.String,
  code_language: Schema.String
})

export const ProblemMetadataSchema = Schema.Struct({
  name: Schema.String,
  url: Schema.String,
  difficulty: Schema.String,
  categories: Schema.Array(Schema.String)
})

export const RawProblemSchema = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export const ImplementationSourcesSchema = Schema.Record({ key: Schema.String, value: Schema.String })
export const EurekaSourceSchema = Schema.Struct({
  languages: Schema.Record({ key: Schema.String, value: EurekaLanguageSchema }),
  problems: Schema.Record({ key: Schema.String, value: RawProblemSchema })
})

export const LanguageSummarySchema = Schema.Struct({
  slug: Schema.String,
  label: Schema.String,
  count: Schema.Number
})

export const ImplementationRecordSchema = Schema.Struct({
  id: Schema.String,
  language: Schema.String,
  approach: Schema.String,
  approach_label: Schema.String,
  source_url: Schema.String,
  code: Schema.String,
  code_language: Schema.String,
  detail_url: Schema.String,
  embed_url: Schema.String,
  code_references: Schema.NullOr(CodeReferencesPanelSchema)
})

export const ProblemPageRecordSchema = Schema.Struct({
  problem_slug: Schema.String,
  title: Schema.String,
  problem_source_url: Schema.String,
  difficulty: Schema.String,
  difficulty_slug: Schema.String,
  categories: Schema.Array(Schema.String),
  languages: Schema.Array(LanguageSummarySchema),
  implementations: Schema.Array(ImplementationRecordSchema),
  implementation_count: Schema.Number,
  detail_url: Schema.String,
  embed_url: Schema.String,
  search_title: Schema.String
})

export const ProblemFiltersSchema = Schema.Struct({
  difficulties: Schema.Array(Schema.String),
  categories: Schema.Array(Schema.String),
  languages: Schema.Array(Schema.Struct({
    slug: Schema.String,
    label: Schema.String
  }))
})
export type SourceLanguage = Schema.Schema.Type<typeof EurekaLanguageSchema>
export type ProblemMetadata = Schema.Schema.Type<typeof ProblemMetadataSchema>
export type RawProblemRecord = Schema.Schema.Type<typeof RawProblemSchema>
export type ImplementationSources = Schema.Schema.Type<typeof ImplementationSourcesSchema>
export type EurekaSourceRecord = Schema.Schema.Type<typeof EurekaSourceSchema>
export type LanguageSummary = Schema.Schema.Type<typeof LanguageSummarySchema>
export type ImplementationRecord = Schema.Schema.Type<typeof ImplementationRecordSchema>
export type ProblemPageRecord = Schema.Schema.Type<typeof ProblemPageRecordSchema>
export type ProblemFilters = Schema.Schema.Type<typeof ProblemFiltersSchema>
