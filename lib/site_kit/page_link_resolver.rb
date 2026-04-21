# frozen_string_literal: true

module SiteKit
  class PageLinkResolver
    def initialize(site_pages:, page_links:)
      @site_pages = Helpers.ensure_hash(site_pages, "site data.site.pages")
      @page_links = Helpers.ensure_hash(page_links, "site data.site.page_links")
    end

    def links_for(group_key)
      Helpers.ensure_array_of_strings(page_links.fetch(group_key.to_s, []), "site data.site.page_links.#{group_key}")
        .map { |page_key| page_link(page_key) }
    end

    def page_link(page_key)
      page_record = Helpers.ensure_hash(site_pages.fetch(page_key), "site data.site.pages.#{page_key}")

      {
        "label" => Helpers.ensure_string(page_record.fetch("label"), "site data.site.pages.#{page_key}.label"),
        "url" => Helpers.ensure_string(page_record.fetch("url"), "site data.site.pages.#{page_key}.url")
      }
    end

    private

    attr_reader :site_pages, :page_links
  end
end
