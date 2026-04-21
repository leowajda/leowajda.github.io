# frozen_string_literal: true

module SiteKit
  module CodeCollectionModel
    module_function

    def build(
      entries:,
      default_entry_id: nil,
      toolbar_aria: "",
      variant_catalog: [],
      variant_group_label: "",
      variant_group_visibility: "",
      variant_presentation: "text",
      variant_icon_map: {},
      sync_hash: false,
      problem_source_url: "",
      embed: false
    )
      normalized_entries = Array(entries)
      default_entry = normalized_entries.find { |entry| entry_id(entry) == default_entry_id } || normalized_entries.first
      resolved_default_entry_id = default_entry ? entry_id(default_entry) : ""
      controls = CodeCollectionControlBuilder.new(
        entries: normalized_entries,
        variant_catalog: variant_catalog,
        variant_group_label: variant_group_label,
        variant_group_visibility: variant_group_visibility,
        variant_presentation: variant_presentation,
        variant_icon_map: variant_icon_map
      ).build
      actions = CodeCollectionActionBuilder.new(
        entries: normalized_entries,
        embed: embed,
        problem_source_url: problem_source_url
      ).build

      {
        "items" => normalized_entries.map { |entry| item_record(entry) },
        "default_entry_id" => resolved_default_entry_id,
        "toolbar_aria" => toolbar_aria,
        "sync_hash" => sync_hash,
        **controls.to_h,
        **actions.to_h
      }
    end

    def entry_id(entry)
      return "" if entry.nil? || entry.empty?

      entry.fetch("entry_id", "")
    end

    def item_record(entry)
      {
        "entry_id" => entry.fetch("entry_id", ""),
        "language_slug" => entry.fetch("language", "default"),
        "variant_slug" => entry.fetch("variant", "default"),
        "code" => entry["code"],
        "code_language" => entry["code_language"],
        "content" => entry["content"]
      }
    end
  end
end
