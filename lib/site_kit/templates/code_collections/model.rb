# frozen_string_literal: true

module SiteKit
  module Templates
    module CodeCollections
      module Model
        module_function

        def build(entries:, default_entry_id: nil, options: SiteKit::Templates::CodeCollections::Options.build)
          normalized_entries = Array(entries)
          default_entry = normalized_entries.find do |entry|
            entry_id(entry) == default_entry_id
          end || normalized_entries.first
          resolved_default_entry_id = default_entry ? entry_id(default_entry) : ''
          controls = SiteKit::Templates::CodeCollections::ControlBuilder.new(
            entries: normalized_entries,
            default_entry: default_entry,
            options: options
          ).build
          actions = SiteKit::Templates::CodeCollections::ActionBuilder.new(
            entries: normalized_entries,
            default_entry_id: resolved_default_entry_id,
            embed: options.embed,
            problem_source_url: options.problem_source_url
          ).build

          {
            'items' => normalized_entries.map do |entry|
              item_record(entry, active: entry_id(entry) == resolved_default_entry_id)
            end,
            'default_entry_id' => resolved_default_entry_id,
            'toolbar_aria' => options.toolbar_aria,
            'sync_hash' => options.sync_hash,
            **controls.to_h,
            **actions.to_h
          }
        end

        def entry_id(entry)
          return '' if entry.nil? || entry.empty?

          entry.fetch('entry_id', '')
        end

        def item_record(entry, active:)
          {
            'entry_id' => entry.fetch('entry_id', ''),
            'language_slug' => entry.fetch('language', 'default'),
            'variant_slug' => entry.fetch('variant', 'default'),
            'code' => entry['code'],
            'code_language' => entry['code_language'],
            'content' => entry['content'],
            'active' => active
          }
        end
      end
    end
  end
end
