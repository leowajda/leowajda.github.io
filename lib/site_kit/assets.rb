# frozen_string_literal: true

module SiteKit
  module Assets
    class VersionManifest
      JAVASCRIPT_ASSET_PREFIX = '/assets/js/'
      PAGEFIND_BUNDLE_PATH = '/pagefind/pagefind.js'
      ROOT_ASSET_PATHS = ['/site.webmanifest'].freeze

      def initialize(site:)
        @site = site
      end

      def build
        versions = asset_versions
        {
          'build_version' => build_version,
          'versions' => versions,
          'import_map' => {
            'imports' => javascript_imports(versions)
          }
        }
      end

      private

      attr_reader :site

      def asset_versions
        paths.to_h { |path| [path, version_for(path)] }
      end

      def javascript_imports(versions)
        versions.each_with_object({}) do |(path, version), result|
          next unless path.start_with?(JAVASCRIPT_ASSET_PREFIX)

          result[relative_url(path)] = "#{relative_url(path)}?v=#{version}"
        end
      end

      def paths
        [
          *static_asset_paths,
          *page_asset_paths,
          *existing_root_asset_paths,
          PAGEFIND_BUNDLE_PATH
        ].uniq.sort
      end

      def static_asset_paths
        site.static_files.map { |file| normalize_path(file.relative_path) }
      end

      def page_asset_paths
        site.pages.filter_map do |page|
          next unless asset_page?(page)

          normalize_path(page.url)
        end
      end

      def asset_page?(page)
        page.url.start_with?('/assets/')
      end

      def existing_root_asset_paths
        ROOT_ASSET_PATHS.select do |path|
          File.file?(File.join(site.source, path.delete_prefix('/')))
        end
      end

      def version_for(path)
        static_file = static_file_by_path[path]
        return static_file.modified_time.to_i.to_s if static_file

        page = asset_page_by_url[path]
        source_path = page_source_path(page)
        return File.mtime(source_path).to_i.to_s if source_path && File.file?(source_path)

        root_asset_path = File.join(site.source, path.delete_prefix('/'))
        return File.mtime(root_asset_path).to_i.to_s if File.file?(root_asset_path)

        build_version
      end

      def static_file_by_path
        @static_file_by_path ||= site.static_files.to_h do |file|
          [normalize_path(file.relative_path), file]
        end
      end

      def asset_page_by_url
        @asset_page_by_url ||= site.pages.each_with_object({}) do |page, result|
          result[normalize_path(page.url)] = page if asset_page?(page)
        end
      end

      def page_source_path(page)
        return unless page

        File.join(site.source, page.path)
      end

      def build_version
        @build_version ||= site.time.to_i.to_s
      end

      def relative_url(path)
        "#{baseurl}#{normalize_path(path)}"
      end

      def baseurl
        @baseurl ||= site.config.fetch('baseurl', '').to_s.delete_suffix('/')
      end

      def normalize_path(path)
        normalized = path.to_s
        normalized.start_with?('/') ? normalized : "/#{normalized}"
      end
    end
  end
end
