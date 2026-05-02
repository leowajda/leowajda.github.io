# frozen_string_literal: true

module SiteKit
  module Checks
    class SiteInvariants
      def initialize(site:)
        @site = site
      end

      def validate!
        validate_page_links!
        validate_rendered_routes!
        validate_generated_page_defaults!
        validate_sitemap_visibility!
      end

      private

      attr_reader :site

      def validate_page_links!
        site_pages = SiteKit::Core::Helpers.ensure_hash(site.data.fetch('site').fetch('pages'), 'site.pages')
        page_links = SiteKit::Core::Helpers.ensure_hash(site.data.fetch('site').fetch('page_links'), 'site.page_links')

        site_pages.each do |key, record|
          page = SiteKit::Core::Helpers.ensure_hash(record, "site.pages.#{key}")
          SiteKit::Core::Helpers.ensure_string(page.fetch('label'), "site.pages.#{key}.label")
          SiteKit::Core::Helpers.ensure_string(page.fetch('url'), "site.pages.#{key}.url")
        end

        page_links.each do |group_key, page_keys|
          SiteKit::Core::Helpers.ensure_array_of_strings(page_keys, "site.page_links.#{group_key}").each do |page_key|
            next if site_pages.key?(page_key)

            raise SiteKit::InvariantError, "site.page_links.#{group_key} references unknown page '#{page_key}'"
          end
        end
      end

      def validate_rendered_routes!
        SiteKit::Core::Helpers.ensure_unique!(renderable_pages.map(&:url), 'Rendered page URLs must be unique')
      end

      def validate_generated_page_defaults!
        generated_pages.each do |page|
          layout = page.data['layout']
          if layout.to_s.empty?
            raise SiteKit::InvariantError,
                  "Generated page '#{page.url}' is missing a layout default"
          end
        end
      end

      def validate_sitemap_visibility!
        offenders = renderable_pages.filter_map do |page|
          next unless hidden_from_index?(page)
          next if page.data['sitemap'] == false

          page.url
        end

        return if offenders.empty?

        raise SiteKit::InvariantError, "Noindex or redirect pages must set sitemap: false: #{offenders.join(', ')}"
      end

      def renderable_pages
        @renderable_pages ||= site.pages + site.collections.values.flat_map(&:docs)
      end

      def generated_pages
        @generated_pages ||= site.pages.grep(SiteKit::JekyllRuntime::GeneratedPage)
      end

      def hidden_from_index?(page)
        page.data['noindex'] == true || page.data['layout'] == 'redirect' || page.data['layout'] == 'problem_embed'
      end
    end
  end
end
