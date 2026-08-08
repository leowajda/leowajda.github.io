# frozen_string_literal: true

# rubocop:disable Style/OneClassPerFile

require 'tmpdir'

module SiteKit
  module JekyllRuntime
    class SiteLoader
      def initialize(source: SiteKit::Core::Helpers.site_source, destination: nil, quiet: true, config: nil)
        @source = source
        @destination = destination
        @quiet = quiet
        @config = config
      end

      def read
        with_destination do |resolved_destination|
          site = build_site(resolved_destination)
          site.read
          yield site if block_given?
          site
        end
      end

      private

      attr_reader :source, :destination, :quiet, :config

      def with_destination(&)
        return yield(destination) if destination

        Dir.mktmpdir('site-kit-jekyll-', &)
      end

      def build_site(resolved_destination)
        Jekyll::Site.new(Jekyll.configuration(configuration_options(resolved_destination)))
      end

      def configuration_options(resolved_destination)
        options = {
          'source' => source,
          'destination' => resolved_destination,
          'quiet' => quiet
        }
        config_paths = resolved_config_paths
        options['config'] = config_paths if config_paths
        options
      end

      def resolved_config_paths
        return normalize_config_paths(config) unless config.nil?

        env_config = ENV.fetch('JEKYLL_CONFIG', nil)
        return if env_config.nil? || env_config.strip.empty?

        normalize_config_paths(env_config)
      end

      def normalize_config_paths(value)
        paths =
          case value
          when Array
            value
          when String
            value.split(',')
          else
            Array(value)
          end

        normalized = paths.map { |path| path.to_s.strip }.reject(&:empty?)
        normalized.empty? ? nil : normalized
      end
    end
  end
end

require 'jekyll'

module SiteKit
  module JekyllRuntime
    class GeneratedPage < ::Jekyll::PageWithoutAFile
      def initialize(site:, dir:, page_type:, data:, content: '')
        normalized_dir = dir.delete_prefix('/').delete_suffix('/')
        source_name = content.to_s.strip.empty? ? 'index.html' : 'index.md'
        super(site, site.source, normalized_dir, source_name)

        @page_type = page_type
        self.content = content
        self.data = data.transform_keys(&:to_s)
        self.data.default_proc = proc do |_, key|
          site.frontmatter_defaults.find(relative_path, @page_type, key)
        end
      end

      def type
        @page_type
      end
    end
  end
end

# rubocop:enable Style/OneClassPerFile
