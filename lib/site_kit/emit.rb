# frozen_string_literal: true

module SiteKit
  module Emit
    module_function

    def page(dir:, layout:, title:, description:, data: {}, content: '', project_slug: nil, shell: nil, # rubocop:disable Metrics/ParameterLists
             noindex: false, sitemap: nil)
      chrome = { 'layout' => layout }
      chrome['shell'] = shell if shell
      chrome['noindex'] = true if noindex
      chrome['sitemap'] = false if sitemap == false
      {
        dir: dir,
        content: content.to_s,
        data: chrome.merge(
          {
            'project_slug' => project_slug,
            'title' => title,
            'description' => description
          }.compact
        ).merge(data)
      }
    end

    def validate_pages!(pages)
      pages.each do |page|
        unless page.is_a?(Hash) && page[:dir] && page.dig(:data, 'layout')
          raise SiteKit::InvariantError, 'Generated pages must be hashes with :dir and a layout'
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
