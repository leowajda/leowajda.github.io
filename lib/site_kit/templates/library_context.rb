# frozen_string_literal: true

module SiteKit
  module Templates
    class LibraryContext
      def initialize(topics:, template_guide:, flowchart_data:, code_source_root:, language_catalog:,
                     code_collection_config:)
        @topic_records = topics
        @template_guide_data = template_guide
        @flowchart_data = flowchart_data
        @code_source_root = code_source_root
        @language_catalog = language_catalog
        @code_collection_config = code_collection_config
      end

      def topics
        @topics ||= SiteKit::Templates::TopicRepository.new(
          topics: topic_records,
          flowchart_data: flowchart_data
        ).load
      end

      def templates
        @templates ||= SiteKit::Templates::TemplateRepository.new(
          topics: topics
        ).load
      end

      def code_collections
        @code_collections ||= SiteKit::Templates::CodeCollections::Registry.new(
          templates: templates,
          entries_by_template: template_code_entries,
          language_catalog: language_catalog,
          code_collection_config: code_collection_config
        ).record
      end

      def guide
        @guide ||= SiteKit::Templates::Guide::Repository.new(
          data: template_guide_data,
          templates: templates,
          code_collections: code_collections,
          flowchart_data: flowchart_data
        ).build
      end

      private

      def template_code_entries
        @template_code_entries ||= SiteKit::Templates::CodeSources::Repository.new(
          root: code_source_root,
          language_catalog: language_catalog
        ).entries_by_template(templates)
      end

      attr_reader :topic_records, :template_guide_data, :flowchart_data, :code_source_root, :language_catalog,
                  :code_collection_config
    end
  end
end
