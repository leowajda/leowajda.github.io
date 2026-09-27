# frozen_string_literal: true

module SiteKit
  module Emit
    module_function

    def page(dir:, page_type:, title:, description:, data: {}, content: '', project_slug: nil) # rubocop:disable Metrics/ParameterLists
      {
        dir: dir,
        page_type: page_type,
        content: content.to_s,
        data: chrome_for(page_type).merge(
          {
            'project_slug' => project_slug,
            'title' => title,
            'description' => description
          }.compact
        ).merge(data)
      }
    end

    def chrome_for(page_type)
      case page_type
      when EUREKA_PROBLEM_PAGE_TYPE
        { 'layout' => 'problem', 'shell' => 'wide', 'seo' => { 'type' => 'WebPage' } }
      when EUREKA_EMBED_PAGE_TYPE, TEMPLATE_EMBED_PAGE_TYPE, SOURCE_EMBED_PAGE_TYPE
        { 'layout' => 'code_embed', 'noindex' => true, 'sitemap' => false, 'seo' => { 'type' => 'WebPage' } }
      when SOURCE_HOME_PAGE_TYPE, SOURCE_LANGUAGE_PAGE_TYPE
        { 'layout' => 'source_list', 'shell' => 'wide', 'seo' => { 'type' => 'WebPage' } }
      when SOURCE_MODULE_PAGE_TYPE, SOURCE_DOCUMENT_PAGE_TYPE
        { 'layout' => 'source', 'shell' => 'source', 'seo' => { 'type' => 'WebPage' } }
      else
        raise SiteKit::InvariantError, "Unknown generated page type '#{page_type}'"
      end
    end

    def validate_pages!(pages)
      pages.each do |page|
        unless page.is_a?(Hash) && page[:dir] && page[:page_type] && page[:data]
          raise SiteKit::InvariantError, 'Generated pages must be hashes with :dir, :page_type, :data'
        end

        route = normalized_route(page[:dir])
        raise SiteKit::InvariantError, 'Generated page route must not be empty' if route.empty?
      end

      SiteKit::Core::Helpers.ensure_unique!(
        pages.map { |page| normalized_route(page[:dir]) },
        'Generated page routes must be unique'
      )
    end

    def normalized_route(route)
      "/#{route.to_s.sub(%r{\A/+}, '').sub(%r{/+\z}, '')}/"
    end
  end
end
