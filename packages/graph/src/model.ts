import { Schema } from "effect"

export const CodeReferencesVersion = 1 as const

export const CodeReferenceUrlKindSchema = Schema.Literal("internal", "external", "none")

export const CodeReferenceSchema = Schema.Struct({
  title: Schema.String,
  file_path: Schema.String,
  language: Schema.String,
  url: Schema.String,
  url_kind: CodeReferenceUrlKindSchema
})

export const CodeReferencesPanelSchema = Schema.Struct({
  version: Schema.Literal(CodeReferencesVersion),
  focus_file_path: Schema.String,
  focus_title: Schema.String,
  language: Schema.String,
  uses: Schema.Array(CodeReferenceSchema),
  used_by: Schema.Array(CodeReferenceSchema)
})

export type CodeReferenceUrlKind = Schema.Schema.Type<typeof CodeReferenceUrlKindSchema>
export type CodeReference = Schema.Schema.Type<typeof CodeReferenceSchema>
export type CodeReferencesPanel = Schema.Schema.Type<typeof CodeReferencesPanelSchema>
