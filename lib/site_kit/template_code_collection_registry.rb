# frozen_string_literal: true

module SiteKit
  class TemplateCodeCollectionRegistry
    def initialize(templates:, entries_by_template:, code_collection_config:)
      @templates = templates
      @entries_by_template = entries_by_template
      @code_collection_config = code_collection_config
    end

    def record
      @record ||= begin
        known_template_ids = templates.map(&:template_id)
        stray_entry_ids = entries_by_template.keys.map(&:to_s) - known_template_ids
        unless stray_entry_ids.empty?
          raise "Template entries reference unknown templates: #{stray_entry_ids.sort.join(', ')}"
        end

        templates.each_with_object({}) do |template, result|
          entries = Helpers.ensure_array(
            entries_by_template.fetch(template.template_id) do
              raise "Template '#{template.template_id}' is missing code entries"
            end,
            "Template entries for #{template.template_id}"
          ).map { |entry| normalize_entry(entry) }

          result[template.template_id] = CodeCollectionModel.build(
            entries: entries,
            default_entry_id: entries.first && entries.first["entry_id"],
            toolbar_aria: code_collection_config.default_toolbar_label,
            variant_group_label: code_collection_config.default_variant_label,
            variant_icon_map: code_collection_config.variant_icons
          )
        end
      end
    end

    private

    attr_reader :templates, :entries_by_template, :code_collection_config

    def normalize_entry(entry)
      {
        "entry_id" => entry.fetch("entry_id"),
        "language" => entry.fetch("language"),
        "language_label" => entry.fetch("language_label"),
        "code_language" => entry.fetch("code_language"),
        "code" => entry.fetch("code"),
        "variant" => "default",
        "variant_label" => "Default"
      }
    end
  end
end
