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
      :problem_rules
    )

    class LibraryContext
      def initialize(topics:, template_guide:, code_source_root:, language_catalog:)
        @topic_records = topics
        @template_guide_data = template_guide
        @code_source_root = code_source_root
        @language_catalog = language_catalog
      end

      def topics
        @topics ||= SiteKit::Templates::TopicRepository.new(
          topics: topic_records
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
              problem_rules: topic.problem_rules
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
          code_collections: code_collections
        ).build
      end

      def embed_pages
        @embed_pages ||= templates.map do |template|
          entries = code_collections.fetch(template.template_id)
          target = guide.fetch('redirects').fetch(template.template_id)
          detail_url = "#{SiteKit::TEMPLATES_URL}##{target}"
          linked = entries.map do |entry|
            entry.merge('detail_url' => detail_url)
          end
          SiteKit::Emit.page(
            dir: "#{SiteKit::TEMPLATES_URL}#{template.template_id}/embed/",
            page_type: TEMPLATE_EMBED_PAGE_TYPE,
            project_slug: 'eureka',
            title: "#{template.title} · Embed",
            description: "#{template.title} template embed",
            data: {
              'template_id' => template.template_id,
              'entries' => linked,
              'detail_url' => detail_url,
              'embed' => true
            }
          )
        end
      end

      private

      def template_code_entries
        @template_code_entries ||= SiteKit::Templates::CodeSources::Repository.new(
          root: code_source_root,
          language_catalog: language_catalog
        ).entries_by_template(templates)
      end

      attr_reader :topic_records, :template_guide_data, :code_source_root, :language_catalog
    end
  end
end
