# frozen_string_literal: true

module SiteKit
  module Pages
    class DefinitionBuilder
      def initialize(project_slug:, page_link_resolver: nil)
        @project_slug = project_slug
        @page_link_resolver = page_link_resolver
      end

      def build(dir:, page_type:, title:, description:, data: {}, content: '')
        SiteKit::Pages::Definition.build(
          dir: dir,
          page_type: page_type,
          data: base_data.merge(
            'title' => title,
            'description' => description
          ).merge(data),
          content: content
        )
      end

      def links_for(group_key)
        return [] unless page_link_resolver

        page_link_resolver.links_for(group_key)
      end

      private

      attr_reader :project_slug, :page_link_resolver

      def base_data
        { 'project_slug' => project_slug }.compact
      end
    end
  end
end
