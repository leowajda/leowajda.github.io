# frozen_string_literal: true

module SiteKit
  module Templates
    Template = Data.define(
      :template_id,
      :topic_id,
      :title,
      :kind,
      :order,
      :description,
      :aliases,
      :problem_rules,
      :flowchart_nodes
    )

    class LibraryContext
      def initialize(topics:, template_guide:, flowchart_data:, code_source_root:, language_catalog:)
        @topic_records = topics
        @template_guide_data = template_guide
        @flowchart_data = flowchart_data
        @code_source_root = code_source_root
        @language_catalog = language_catalog
      end

      def topics
        @topics ||= SiteKit::Templates::TopicRepository.new(
          topics: topic_records,
          flowchart_data: flowchart_data
        ).load
      end

      def templates
        @templates ||= begin
          loaded = topics.select(&:template?).map do |topic|
            SiteKit::Templates::Template.new(
              template_id: topic.template_id,
              topic_id: topic.id,
              title: topic.label,
              kind: topic.kind,
              order: topic.order,
              description: topic.description,
              aliases: topic.aliases,
              problem_rules: topic.problem_rules,
              flowchart_nodes: topic.flowchart_nodes
            )
          end
          SiteKit::Core::Helpers.ensure_unique!(loaded.map(&:template_id), 'Algorithmic template ids must be unique')
          loaded.sort_by { |template| [template.order, template.title.downcase] }
        end
      end

      def code_collections
        @code_collections ||= SiteKit::Templates::CodeCollections::Registry.new(
          templates: templates,
          entries_by_template: template_code_entries,
          language_catalog: language_catalog
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

      attr_reader :topic_records, :template_guide_data, :flowchart_data, :code_source_root, :language_catalog
    end
  end
end
