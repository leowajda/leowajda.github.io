# frozen_string_literal: true

module SiteKit
  module Templates
    module CodeCollections
      ControlSet = Data.define(
        :toolbar_groups
      ) do
        def to_h
          { 'toolbar_groups' => toolbar_groups }
        end
      end

      OPTION_DEFAULTS = {
        toolbar_aria: '',
        variant_catalog: [],
        variant_group_label: '',
        variant_group_visibility: '',
        variant_presentation: 'text',
        variant_icon_map: {},
        sync_hash: false,
        problem_source_url: '',
        embed: false
      }.freeze

      Options = Data.define(
        :toolbar_aria,
        :variant_catalog,
        :variant_group_label,
        :variant_group_visibility,
        :variant_presentation,
        :variant_icon_map,
        :sync_hash,
        :problem_source_url,
        :embed
      ) do
        def self.build(**attributes)
          new(**SiteKit::Templates::CodeCollections::OPTION_DEFAULTS, **attributes)
        end
      end

      class ControlBuilder
        def initialize(entries:, default_entry:, options:)
          @entries = Array(entries)
          @default_entry = default_entry || @entries.first || {}
          @options = options
        end

        def build
          languages = language_controls
          variants = variant_controls

          SiteKit::Templates::CodeCollections::ControlSet.new(
            toolbar_groups: [language_group(languages), variant_group(variants)].compact
          )
        end

        private

        attr_reader :entries, :default_entry, :options

        def language_controls
          unique_entries_for('language').map do |entry|
            slug = entry.fetch('language', 'default')
            {
              'slug' => slug,
              'label' => entry.fetch('language_label', entry.fetch('language', 'Code')),
              'active' => slug == default_language_slug
            }
          end
        end

        def variant_controls
          return catalog_variant_controls if options.variant_catalog.any?

          unique_entries_for('variant').map do |entry|
            slug = entry.fetch('variant', 'default')
            control_record(
              slug:,
              label: entry.fetch('variant_label', 'Default'),
              icon: options.variant_icon_map.fetch(slug, '')
            )
          end
        end

        def catalog_variant_controls
          options.variant_catalog.map do |option|
            slug = option.fetch('slug', option.fetch('id', 'default'))
            control_record(
              slug: slug,
              label: option.fetch('label', option.fetch('title', 'Default')),
              icon: option.fetch('icon', '')
            )
          end
        end

        def control_record(slug:, label:, icon:)
          {
            'slug' => slug,
            'label' => label,
            'icon' => icon,
            'icon_only' => options.variant_presentation == 'icons' && !icon.empty?,
            'active' => slug == default_variant_slug
          }
        end

        def language_group(language_controls)
          return nil unless language_controls.any?

          {
            'kind' => 'language',
            'class' => 'code-collection__options code-collection__options--languages',
            'aria_label' => 'Language',
            'controls' => language_controls
          }
        end

        def variant_group(variant_controls)
          return nil unless show_variant_group?(variant_controls)

          {
            'kind' => 'variant',
            'class' => 'code-collection__options code-collection__options--variants',
            'aria_label' => options.variant_group_label,
            'keep_visible' => options.variant_group_visibility == 'always',
            'controls' => variant_controls
          }
        end

        def show_variant_group?(variant_controls)
          return variant_controls.any? if options.variant_group_visibility == 'always'

          variant_controls.size > 1
        end

        def unique_entries_for(key)
          entries.uniq { |entry| entry.fetch(key, 'default') }
        end

        def default_language_slug
          default_entry.fetch('language', 'default')
        end

        def default_variant_slug
          default_entry.fetch('variant', 'default')
        end
      end
    end
  end
end
