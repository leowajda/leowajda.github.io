# frozen_string_literal: true

module SiteKit
  CodeCollectionControlSet = Data.define(
    :toolbar_groups
  ) do
    def to_h
      { "toolbar_groups" => toolbar_groups }
    end
  end

  class CodeCollectionControlBuilder
    def initialize(entries:, variant_catalog:, variant_group_label:, variant_group_visibility:, variant_presentation:, variant_icon_map:)
      @entries = Array(entries)
      @variant_catalog = Array(variant_catalog)
      @variant_group_label = variant_group_label
      @variant_group_visibility = variant_group_visibility
      @variant_presentation = variant_presentation
      @variant_icon_map = variant_icon_map
    end

    def build
      languages = language_controls
      variants = variant_controls

      CodeCollectionControlSet.new(
        toolbar_groups: [language_group(languages), variant_group(variants)].compact
      )
    end

    private

    attr_reader :entries, :variant_catalog, :variant_group_label, :variant_group_visibility, :variant_presentation, :variant_icon_map

    def language_controls
      unique_entries_for("language").map do |entry|
        {
          "slug" => entry.fetch("language", "default"),
          "label" => entry.fetch("language_label", entry.fetch("language", "Code")),
          "target_entry_id" => entry.fetch("entry_id", "")
        }
      end
    end

    def variant_controls
      return catalog_variant_controls if variant_catalog.any?

      unique_entries_for("variant").map do |entry|
        slug = entry.fetch("variant", "default")
        control_record(
          slug:,
          label: entry.fetch("variant_label", "Default"),
          icon: variant_icon_map.fetch(slug, ""),
          target_entry_id: entry.fetch("entry_id", "")
        )
      end
    end

    def catalog_variant_controls
      variant_catalog.map do |option|
        slug = option.fetch("slug", option.fetch("id", "default"))
        control_record(
          slug: slug,
          label: option.fetch("label", option.fetch("title", "Default")),
          icon: option.fetch("icon", ""),
          target_entry_id: entries.first&.fetch("entry_id", "") || ""
        )
      end
    end

    def control_record(slug:, label:, icon:, target_entry_id:)
      {
        "slug" => slug,
        "label" => label,
        "icon" => icon,
        "target_entry_id" => target_entry_id,
        "icon_only" => variant_presentation == "icons" && !icon.empty?
      }
    end

    def language_group(language_controls)
      return nil unless language_controls.any?

      {
        "kind" => "language",
        "class" => "code-collection__options code-collection__options--languages",
        "aria_label" => "Language",
        "controls" => language_controls
      }
    end

    def variant_group(variant_controls)
      return nil unless show_variant_group?(variant_controls)

      {
        "kind" => "variant",
        "class" => "code-collection__options code-collection__options--variants",
        "aria_label" => variant_group_label,
        "keep_visible" => variant_group_visibility == "always",
        "controls" => variant_controls
      }
    end

    def show_variant_group?(variant_controls)
      return variant_controls.any? if variant_group_visibility == "always"

      variant_controls.size > 1
    end

    def unique_entries_for(key)
      entries.uniq { |entry| entry.fetch(key, "default") }
    end
  end
end
