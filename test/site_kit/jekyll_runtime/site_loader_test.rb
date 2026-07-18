# frozen_string_literal: true

require 'test_helper'

module SiteKit
  module JekyllRuntime
    class SiteLoaderTest < Minitest::Test
      def setup
        @previous_config = ENV.fetch('JEKYLL_CONFIG', nil)
      end

      def teardown
        if @previous_config.nil?
          ENV.delete('JEKYLL_CONFIG')
        else
          ENV['JEKYLL_CONFIG'] = @previous_config
        end
      end

      def test_resolved_config_paths_from_explicit_array
        loader = SiteLoader.new(config: ['site-src/_config.yml', '/tmp/pages.yml'])

        assert_equal ['site-src/_config.yml', '/tmp/pages.yml'], loader.send(:resolved_config_paths)
      end

      def test_resolved_config_paths_from_env
        ENV['JEKYLL_CONFIG'] = 'site-src/_config.yml, /tmp/pages.yml'
        loader = SiteLoader.new

        assert_equal ['site-src/_config.yml', '/tmp/pages.yml'], loader.send(:resolved_config_paths)
      end

      def test_explicit_config_overrides_env
        ENV['JEKYLL_CONFIG'] = 'ignored.yml'
        loader = SiteLoader.new(config: 'site-src/_config.yml')

        assert_equal ['site-src/_config.yml'], loader.send(:resolved_config_paths)
      end

      def test_configuration_options_include_config_when_present
        loader = SiteLoader.new(config: 'site-src/_config.yml')
        options = loader.send(:configuration_options, '/tmp/site')

        assert_equal 'site-src', File.basename(options.fetch('source'))
        assert_equal '/tmp/site', options.fetch('destination')
        assert_equal ['site-src/_config.yml'], options.fetch('config')
      end

      def test_configuration_options_omit_config_when_absent
        ENV.delete('JEKYLL_CONFIG')
        loader = SiteLoader.new
        options = loader.send(:configuration_options, '/tmp/site')

        refute options.key?('config')
      end
    end
  end
end
