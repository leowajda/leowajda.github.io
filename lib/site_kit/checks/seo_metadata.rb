# frozen_string_literal: true

require 'nokogiri'
require 'pathname'
require 'uri'

module SiteKit
  module Checks
    class SeoMetadata
      SITE_DIR = File.expand_path('../../../_site', __dir__)
      MIN_TITLE_LENGTH = 8
      MIN_DESCRIPTION_LENGTH = 8

      def initialize(site_dir: SITE_DIR)
        @site_dir = site_dir
      end

      def failures
        sitemap = sitemap_paths
        html_files.flat_map do |path|
          document = parse_html(path)
          if noindex?(document)
            noindex_failures(path, sitemap)
          else
            indexable_failures(path, document, sitemap)
          end
        end
      end

      private

      attr_reader :site_dir

      def html_files
        Dir.glob(File.join(site_dir, '**', '*.html'))
      end

      def parse_html(path)
        Nokogiri::HTML(File.read(path))
      end

      def sitemap_paths
        sitemap_path = File.join(site_dir, 'sitemap.xml')
        return Set.new unless File.exist?(sitemap_path)

        document = Nokogiri::XML(File.read(sitemap_path))
        document.remove_namespaces!
        document.css('loc').filter_map { |loc| uri_path(loc.text.strip) }.to_set
      end

      def uri_path(url)
        uri = URI.parse(url)
        path = uri.path.empty? ? '/' : uri.path
        path.end_with?('/') || File.extname(path) != '' ? path : "#{path}/"
      rescue URI::InvalidURIError
        nil
      end

      def noindex?(document)
        document.css('meta[name="robots"]').any? do |node|
          node['content'].to_s.downcase.split(/\s*,\s*|\s+/).include?('noindex')
        end
      end

      def indexable_failures(path, document, sitemap)
        url_path = rendered_path(path)
        title_nodes = document.css('title')
        canonical_nodes = canonical_links(document)
        description_nodes = document.css('meta[name="description"]')
        h1_nodes = document.css('h1')

        [
          count_failure(path, 'title', title_nodes, 1),
          text_length_failure(path, 'title', element_text(title_nodes.first), MIN_TITLE_LENGTH),
          count_failure(path, 'canonical link', canonical_nodes, 1),
          count_failure(path, 'meta description', description_nodes, 1),
          text_length_failure(path, 'meta description', description_nodes.first&.[]('content').to_s,
                              MIN_DESCRIPTION_LENGTH),
          count_failure(path, 'h1', h1_nodes, 1),
          sitemap_failure(path, sitemap, url_path)
        ].compact
      end

      def sitemap_failure(path, sitemap, url_path)
        return nil if sitemap.include?(url_path)

        "#{relative_path(path)} -> indexable page missing from sitemap.xml: #{url_path}"
      end

      def noindex_failures(path, sitemap)
        url_path = rendered_path(path)
        return [] unless sitemap.include?(url_path)

        ["#{relative_path(path)} -> noindex page is present in sitemap.xml: #{url_path}"]
      end

      def canonical_links(document)
        document.css('link[rel]').select { |node| node['rel'].to_s.split.include?('canonical') }
      end

      def count_failure(path, label, nodes, expected)
        return nil if nodes.size == expected

        "#{relative_path(path)} -> expected #{expected} #{label}, found #{nodes.size}"
      end

      def text_length_failure(path, label, text, minimum)
        return nil if text.length >= minimum

        "#{relative_path(path)} -> #{label} is too short"
      end

      def element_text(node)
        node&.text.to_s.gsub(/\s+/, ' ').strip
      end

      def rendered_path(path)
        relative = relative_path(path)
        return '/' if relative == 'index.html'
        return "/#{relative.delete_suffix('index.html')}" if relative.end_with?('/index.html')

        "/#{relative}"
      end

      def relative_path(path)
        Pathname.new(path).relative_path_from(Pathname.new(site_dir)).to_s
      end
    end
  end
end
