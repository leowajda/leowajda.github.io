# frozen_string_literal: true

# rubocop:disable Style/OneClassPerFile

require 'cgi'
require 'nokogiri'
require 'pathname'

module SiteKit
  module Checks
    class InternalLinks
      SITE_DIR = File.expand_path('../../_site', __dir__)
      IGNORED_SCHEMES = %w[http:// https:// mailto: tel: javascript: data:].freeze
      ARIA_REFERENCE_ATTRIBUTES = %w[aria-controls aria-describedby aria-labelledby].freeze

      def initialize(site_dir: SITE_DIR)
        @site_dir = site_dir
      end

      def failures
        cached_targets = {}
        html_files.flat_map do |current_file|
          document = parse_html(current_file)
          document_failures(current_file, document) + href_failures(current_file, document, cached_targets)
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

      def document_failures(path, document)
        duplicate_id_failures(path, document) + semantic_failures(path, document)
      end

      def duplicate_id_failures(path, document)
        duplicate_ids(document).map { |id| "#{relative_path(path)} -> duplicate id ##{id}" }
      end

      def href_failures(path, document, cached_targets)
        hrefs(document).filter_map do |raw_href|
          href = raw_href.to_s.strip
          next unless internal_href?(href)

          href_failure(path, href, cached_targets)
        end
      end

      def href_failure(path, href, cached_targets)
        target_file, anchor = resolve_path(path, href)
        return "#{relative_path(path)} -> missing target #{href}" unless target_file && File.exist?(target_file)
        return if anchor.empty?

        cached_targets[target_file] ||= anchor_targets(target_file)
        return if cached_targets.fetch(target_file).include?(anchor)

        "#{relative_path(path)} -> missing anchor #{href}"
      end

      def resolve_path(current_file, href)
        path_part, anchor = href.split('#', 2)
        path_without_query = path_part.to_s.split('?', 2).first
        decoded_path = CGI.unescape(path_without_query.to_s)
        decoded_anchor = CGI.unescape(anchor.to_s)

        return [current_file, decoded_anchor] if decoded_path.empty?

        [target_candidate(current_file, decoded_path), decoded_anchor]
      end

      def target_candidate(current_file, decoded_path)
        target_base =
          if decoded_path.start_with?('/')
            File.join(site_dir, decoded_path.delete_prefix('/'))
          else
            File.expand_path(decoded_path, File.dirname(current_file))
          end

        target_candidates(target_base, decoded_path).find { |candidate| File.exist?(candidate) }
      end

      def target_candidates(target_base, decoded_path)
        return [target_base] if File.extname(target_base) != ''
        return [File.join(target_base, 'index.html')] if decoded_path.end_with?('/')

        [target_base, "#{target_base}.html", File.join(target_base, 'index.html')]
      end

      def anchor_targets(path)
        document = parse_html(path)
        ids = document.css('[id]').filter_map { |node| node['id'] }.to_set
        names = document.css('[name]').filter_map { |node| node['name'] }.to_set
        ids | names
      end

      def hrefs(document)
        document.css('[href]').filter_map { |node| node['href'] }
      end

      def internal_href?(href)
        !href.nil? && !href.empty? && IGNORED_SCHEMES.none? { |prefix| href.start_with?(prefix) }
      end

      def duplicate_ids(document)
        ids = document.css('[id]').filter_map { |node| node['id'] }
        ids.group_by(&:itself).select { |_id, values| values.size > 1 }.keys.sort
      end

      def semantic_failures(path, document)
        ids = document.css('[id]').filter_map { |node| node['id'] }.to_set
        [
          aria_reference_failures(path, document, ids),
          empty_control_failures(path, document),
          hidden_active_failures(path, document)
        ].flatten
      end

      def aria_reference_failures(path, document, ids)
        ARIA_REFERENCE_ATTRIBUTES.flat_map do |attribute|
          document.css("[#{attribute}]").flat_map do |node|
            node[attribute].to_s.split.filter_map do |id|
              "#{relative_path(path)} -> missing #{attribute} reference ##{id}" unless ids.include?(id)
            end
          end
        end
      end

      def empty_control_failures(path, document)
        document.css('a[href], button').filter_map do |node|
          next if inside_template?(node)

          label = [node['aria-label'], node['title'], node.text].compact.join(' ').strip
          "#{relative_path(path)} -> empty #{node.name}" if label.empty?
        end
      end

      def hidden_active_failures(path, document)
        selector = '[hidden].is-active, [hidden][aria-pressed="true"], [hidden][aria-expanded="true"]'
        document.css(selector).filter_map do |node|
          next if inside_template?(node)

          "#{relative_path(path)} -> hidden active #{node.name}"
        end
      end

      def inside_template?(node)
        node.ancestors.any? { |ancestor| ancestor.name == 'template' }
      end

      def relative_path(path)
        Pathname.new(path).relative_path_from(Pathname.new(site_dir)).to_s
      end
    end
  end
end

require 'uri'

module SiteKit
  module Checks
    class SeoMetadata
      SITE_DIR = File.expand_path('../../_site', __dir__)
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
        page.data['noindex'] == true ||
          page.data['layout'] == 'redirect' ||
          page.data['layout'] == 'code_embed' ||
          [
            EUREKA_EMBED_PAGE_TYPE,
            TEMPLATE_EMBED_PAGE_TYPE,
            SOURCE_EMBED_PAGE_TYPE
          ].include?(page.data['page_type'])
      end
    end
  end
end

module SiteKit
  module Checks
    class SourceCatalogs
      def initialize(source: SiteKit::Core::Helpers.site_source, destination: nil)
        @source = source
        @destination = destination
      end

      def validate!
        SiteKit::JekyllRuntime::SiteLoader.new(source:, destination:).read do |site|
          SiteKit::Build.for(site).validate!
        end
      end

      private

      attr_reader :source, :destination
    end
  end
end

require 'digest'

module SiteKit
  module Checks
    class VendorAssets
      MANIFEST_PATH = 'config/vendor-assets.yml'

      def initialize(manifest_path: File.join(SiteKit::Core::Helpers.repo_root, MANIFEST_PATH))
        @manifest_path = manifest_path
      end

      def validate!
        records.each do |record|
          validate_asset_group!(record)
        end
      end

      private

      attr_reader :manifest_path

      def records
        manifest = SiteKit::Core::Helpers.parse_yaml(
          SiteKit::Core::Helpers.read_text(manifest_path),
          "Unable to decode #{MANIFEST_PATH}"
        )
        SiteKit::Core::Helpers.ensure_array(manifest.fetch('assets'), "#{MANIFEST_PATH}.assets")
      end

      def validate_asset_group!(record)
        asset = SiteKit::Core::Helpers.ensure_hash(record, "#{MANIFEST_PATH}.assets[]")
        name = SiteKit::Core::Helpers.ensure_string(asset.fetch('name'), "#{MANIFEST_PATH}.assets[].name")
        SiteKit::Core::Helpers.ensure_array(asset.fetch('files'), "Vendor asset #{name}.files").each do |file|
          validate_file!(name, SiteKit::Core::Helpers.ensure_hash(file, "Vendor asset #{name}.files[]"))
        end
        validate_globs!(name, asset.fetch('globs', []))
      end

      def validate_file!(name, file)
        path = SiteKit::Core::Helpers.ensure_string(file.fetch('path'), "Vendor asset #{name}.files[].path")
        expected_sha = SiteKit::Core::Helpers.ensure_string(file.fetch('sha256'),
                                                            "Vendor asset #{name} #{path}.sha256")
        absolute_path = File.join(SiteKit::Core::Helpers.repo_root, path)

        raise SiteKit::CatalogError, "Vendor asset #{name} is missing #{path}" unless File.file?(absolute_path)

        actual_sha = Digest::SHA256.file(absolute_path).hexdigest
        unless actual_sha == expected_sha
          raise SiteKit::CatalogError,
                "Vendor asset #{name} #{path} has sha256 #{actual_sha}, expected #{expected_sha}"
        end

        validate_required_text!(name, path, absolute_path, file.fetch('contains', []))
      end

      def validate_globs!(name, globs)
        SiteKit::Core::Helpers.ensure_array(globs, "Vendor asset #{name}.globs").each do |entry|
          glob = SiteKit::Core::Helpers.ensure_hash(entry, "Vendor asset #{name}.globs[]")
          pattern = SiteKit::Core::Helpers.ensure_string(glob.fetch('pattern'), "Vendor asset #{name}.globs[].pattern")
          expected_count = SiteKit::Core::Helpers.ensure_integer(glob.fetch('count'),
                                                                 "Vendor asset #{name} #{pattern}.count")
          matches = Dir.glob(File.join(SiteKit::Core::Helpers.repo_root, pattern))
          next if matches.size == expected_count

          raise SiteKit::CatalogError,
                "Vendor asset #{name} #{pattern} matched #{matches.size} files, expected #{expected_count}"
        end
      end

      def validate_required_text!(name, path, absolute_path, values)
        SiteKit::Core::Helpers.ensure_array(values, "Vendor asset #{name} #{path}.contains").each do |value|
          expected_text = SiteKit::Core::Helpers.ensure_string(value, "Vendor asset #{name} #{path}.contains[]")
          next if SiteKit::Core::Helpers.read_text(absolute_path).include?(expected_text)

          raise SiteKit::CatalogError, "Vendor asset #{name} #{path} must include #{expected_text.inspect}"
        end
      end
    end
  end
end

# rubocop:enable Style/OneClassPerFile
