# frozen_string_literal: true

module SiteKit
  module Search
    module Contract
      DATA_PATH = File.join(SiteKit::Core::Helpers.repo_root, 'site-src', '_data', 'site', 'search_contract.yml')
      DATA = SiteKit::Core::Helpers.parse_yaml(
        SiteKit::Core::Helpers.read_text(DATA_PATH),
        'site search contract'
      ).freeze
      KIND_DATA = DATA.fetch('kinds').freeze
      FILTER_DATA = DATA.fetch('filters').freeze

      KIND_FLOWCHART = KIND_DATA.fetch('flowchart').fetch('label')
      KIND_PAGE = KIND_DATA.fetch('page').fetch('label')
      KIND_PROBLEM = KIND_DATA.fetch('problem').fetch('label')
      KIND_SOURCE = KIND_DATA.fetch('source').fetch('label')
      KIND_TEMPLATE = KIND_DATA.fetch('template').fetch('label')
      KIND_WRITING = KIND_DATA.fetch('writing').fetch('label')

      FILTER_CATEGORY = FILTER_DATA.fetch('category')
      FILTER_DIFFICULTY = FILTER_DATA.fetch('difficulty')
      FILTER_FLOWCHART_KIND = FILTER_DATA.fetch('flowchart_kind')
      FILTER_KIND = FILTER_DATA.fetch('kind')
      FILTER_LANGUAGE = FILTER_DATA.fetch('language')
      FILTER_MODULE = FILTER_DATA.fetch('module')
      FILTER_PROJECT = FILTER_DATA.fetch('project')
      FILTER_SOURCE_FORMAT = FILTER_DATA.fetch('source_format')
      FILTER_TEMPLATE = FILTER_DATA.fetch('template')

      ENTRIES = KIND_DATA.transform_values do |record|
        [
          record.fetch('label'),
          {
            priority: record.fetch('priority'),
            meta_keys: record.fetch('meta_keys').sort,
            filter_keys: record.fetch('filter_keys').sort
          }
        ]
      end.values.to_h.freeze

      module_function

      def entry(kind)
        ENTRIES.fetch(kind) do
          raise SiteKit::InvariantError, "Unknown search kind: #{kind}"
        end
      end

      def kinds
        ENTRIES.keys
      end

      def priority(kind)
        entry(kind).fetch(:priority)
      end

      def meta_keys(kind)
        entry(kind).fetch(:meta_keys)
      end

      def filter_keys(kind)
        entry(kind).fetch(:filter_keys)
      end
    end
  end
end
