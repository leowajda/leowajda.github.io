# frozen_string_literal: true

# rubocop:disable Style/OneClassPerFile

module SiteKit
  class Error < StandardError; end

  class CatalogError < Error; end

  class ConfigurationError < Error; end

  class InvariantError < Error; end

  class SourceError < Error; end
end

module SiteKit
  EUREKA_NAMESPACE = 'eureka'
  EUREKA_PROJECT_KIND = 'eureka'
  SOURCE_NOTES_PROJECT_KIND = 'source-notes'
  TEMPLATES_URL = '/templates/'

  EUREKA_PROBLEM_PAGE_TYPE = 'eureka_problem_page'
  EUREKA_EMBED_PAGE_TYPE = 'eureka_embed_page'
  TEMPLATE_EMBED_PAGE_TYPE = 'template_embed_page'
  SOURCE_LANGUAGE_PAGE_TYPE = 'source_language_page'
  SOURCE_HOME_PAGE_TYPE = 'source_home_page'
  SOURCE_MODULE_PAGE_TYPE = 'source_module_page'
  SOURCE_DOCUMENT_PAGE_TYPE = 'source_document_page'
  SOURCE_EMBED_PAGE_TYPE = 'source_embed_page'

  DISALLOWED_PROBLEM_TEMPLATE_KEYS = %w[
    template_guide_primary
    template_guide_url
    template_pattern_ids
    template_patterns
  ].freeze
end

require 'time'
require 'yaml'

module SiteKit
  module Core
    module IoHelpers
      module_function

      def read_text(path)
        File.read(path)
      rescue StandardError => e
        raise SourceError, "Unable to read '#{path}': #{e.message}"
      end

      def maybe_read_text(path)
        File.exist?(path) ? read_text(path) : ''
      end

      def parse_yaml(raw, context)
        validate_yaml_mapping_keys!(raw, context)
        YAML.safe_load(raw, permitted_classes: [Time], aliases: false) || {}
      rescue StandardError => e
        raise CatalogError, "#{context}: #{e.message}"
      end

      def validate_yaml_mapping_keys!(raw, _context)
        document = Psych.parse_stream(raw)
        Array(document.children).each { |node| validate_yaml_node_keys!(node) }
      end

      def validate_yaml_node_keys!(node)
        return unless node.respond_to?(:children)

        if node.is_a?(Psych::Nodes::Mapping)
          seen = {}
          Array(node.children).each_slice(2) do |key_node, value_node|
            key = yaml_key_label(key_node)
            raise CatalogError, "Duplicate mapping key '#{key}'" if seen.key?(key)

            seen[key] = true
            validate_yaml_node_keys!(value_node)
          end
        else
          Array(node.children).each { |child| validate_yaml_node_keys!(child) }
        end
      end

      def yaml_key_label(key_node)
        key_node.respond_to?(:value) ? key_node.value.to_s : key_node.to_s
      end
    end
  end
end

module SiteKit
  module Core
    module ValidationHelpers
      module_function

      def ensure_hash(value, context)
        return value if value.is_a?(Hash)

        raise CatalogError, "#{context} must be a mapping"
      end

      def ensure_string(value, context)
        return value if value.is_a?(String)

        raise CatalogError, "#{context} must be a string"
      end

      def ensure_array(value, context)
        return value if value.is_a?(Array)

        raise CatalogError, "#{context} must be an array"
      end

      def ensure_integer_or_nil(value, context)
        return nil if value.nil?
        return value if value.is_a?(Integer)

        raise CatalogError, "#{context} must be an integer"
      end

      def ensure_integer(value, context)
        return value if value.is_a?(Integer)

        raise CatalogError, "#{context} must be an integer"
      end

      def ensure_boolean_or_nil(value, context)
        return value if value.nil? || value == true || value == false

        raise CatalogError, "#{context} must be a boolean"
      end

      def ensure_array_of_strings(value, context)
        raise CatalogError, "#{context} must be an array of strings" unless value.is_a?(Array) && value.all?(String)

        value
      end

      def duplicates(values)
        values.group_by(&:itself).select { |_, entries| entries.size > 1 }.keys.sort
      end

      def ensure_unique!(values, context)
        duplicate_values = duplicates(values)
        return if duplicate_values.empty?

        raise CatalogError, "#{context}: #{duplicate_values.join(', ')}"
      end
    end
  end
end

module SiteKit
  module Core
    class Schema
      def initialize(record, context)
        @record = SiteKit::Core::ValidationHelpers.ensure_hash(record, context)
        @context = context
      end

      def required_hash(key)
        SiteKit::Core::ValidationHelpers.ensure_hash(record.fetch(key), field_context(key))
      end

      def required_array(key)
        SiteKit::Core::ValidationHelpers.ensure_array(record.fetch(key), field_context(key))
      end

      def required_array_of_strings(key)
        SiteKit::Core::ValidationHelpers.ensure_array_of_strings(record.fetch(key), field_context(key))
      end

      def required_string(key)
        SiteKit::Core::ValidationHelpers.ensure_string(record.fetch(key), field_context(key))
      end

      def required_integer(key)
        SiteKit::Core::ValidationHelpers.ensure_integer(record.fetch(key), field_context(key))
      end

      def optional_array(key, default: [])
        SiteKit::Core::ValidationHelpers.ensure_array(record.fetch(key, default), field_context(key))
      end

      def optional_array_of_strings(key, default: [])
        SiteKit::Core::ValidationHelpers.ensure_array_of_strings(record.fetch(key, default), field_context(key))
      end

      def optional_string(key, default: '')
        SiteKit::Core::ValidationHelpers.ensure_string(record.fetch(key, default), field_context(key))
      end

      def key?(key)
        record.key?(key)
      end

      def fetch(key, *fallback, &)
        record.fetch(key, *fallback, &)
      end

      private

      attr_reader :record, :context

      def field_context(key)
        "#{context}.#{key}"
      end
    end
  end
end

require 'pathname'

module SiteKit
  module Core
    module PathHelpers
      module_function

      def repo_root
        @repo_root ||= File.expand_path('../..', __dir__)
      end

      def site_source
        @site_source ||= File.join(repo_root, 'site-src')
      end

      def slugify(value)
        value
          .to_s
          .downcase
          .gsub(/[^a-z0-9_-]/, '-')
          .squeeze('-')
          .gsub(/\A-|-+\z/, '')
      end

      def human_label(value)
        value
          .tr('_', ' ')
          .split
          .map { |part| part[0] ? part[0].upcase + part[1..] : part }
          .join(' ')
      end

      def relative_path(from_path, to_path)
        Pathname.new(to_path).relative_path_from(Pathname.new(from_path)).to_s.tr(File::SEPARATOR, '/')
      end

      def inside_path?(root_path, candidate_path)
        root = Pathname(root_path).cleanpath.to_s
        candidate = Pathname(candidate_path).cleanpath.to_s

        candidate == root || candidate.start_with?("#{root}#{File::SEPARATOR}")
      end

      def confined_path(root_path, relative_path, context:, error_class:)
        root = Pathname(root_path).expand_path
        path = root.join(relative_path).expand_path
        raise error_class, "#{context} escapes the source root" unless inside_path?(root, path)

        return path unless path.exist?

        real_root = root.realpath
        real_path = path.realpath
        return real_path if inside_path?(real_root, real_path)

        raise error_class, "#{context} escapes the source root"
      end

      def slugify_path_segment(value)
        value
          .gsub(/([a-z0-9])([A-Z])/, '\1-\2')
          .gsub(/[_\s]+/, '-')
          .gsub(/[^a-zA-Z0-9-]/, '-')
          .downcase
          .squeeze('-')
          .gsub(/\A-|-+\z/, '')
      end

      def build_route_path(relative_path)
        segments = relative_path.split('/')
        segments.each_with_index.map do |segment, index|
          next slugify_path_segment(segment) unless index == segments.length - 1

          slugify_path_segment(File.basename(segment, File.extname(segment)))
        end.reject(&:empty?).join('/')
      end
    end
  end
end

module SiteKit
  module Core
    class ResourcePaths
      def initialize(route_base:)
        @route_base = normalize(route_base)
      end

      def root
        join
      end

      def path(*segments)
        join(*segments)
      end

      def embed(*segments)
        join(*segments, 'embed')
      end

      def with_fragment(path, fragment)
        token = fragment.to_s.strip
        token.empty? ? path : "#{path}##{token}"
      end

      private

      attr_reader :route_base

      def join(*segments)
        parts = [route_base, *segments.map { |segment| normalize(segment) }].compact
        return '/' if parts.empty?

        "/#{parts.join('/')}/"
      end

      def normalize(value)
        segment = value.to_s.strip.delete_prefix('/').delete_suffix('/')
        segment.empty? ? nil : segment
      end
    end
  end
end

module SiteKit
  module Core
    module CodeEntry
      module_function

      REQUIRED = %w[
        entry_id
        language
        language_label
        variant
        variant_label
        code
        code_language
      ].freeze

      OPTIONAL = %w[source_url detail_url embed_url].freeze

      def normalize(raw, context:)
        record = SiteKit::Core::Helpers.ensure_hash(raw, context)
        entry = {
          'entry_id' => SiteKit::Core::Helpers.ensure_string(record.fetch('entry_id'), "#{context}.entry_id"),
          'language' => SiteKit::Core::Helpers.ensure_string(record.fetch('language'), "#{context}.language"),
          'language_label' => SiteKit::Core::Helpers.ensure_string(
            record.fetch('language_label'),
            "#{context}.language_label"
          ),
          'variant' => SiteKit::Core::Helpers.ensure_string(record.fetch('variant'), "#{context}.variant"),
          'variant_label' => SiteKit::Core::Helpers.ensure_string(
            record.fetch('variant_label'),
            "#{context}.variant_label"
          ),
          'code' => SiteKit::Core::Helpers.ensure_string(record.fetch('code'), "#{context}.code"),
          'code_language' => SiteKit::Core::Helpers.ensure_string(
            record.fetch('code_language'),
            "#{context}.code_language"
          )
        }
        OPTIONAL.each do |key|
          value = record[key].to_s
          entry[key] = value unless value.empty?
        end
        entry
      end

      def with_urls(entry, detail_url:, embed_url:)
        entry.merge(
          'detail_url' => detail_url,
          'embed_url' => embed_url
        )
      end
    end
  end
end

module SiteKit
  module Core
    module MarkdownHelpers
      module_function

      MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\((?<reference><[^>]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\)/

      def raw_github_url(source_url_base, relative_path)
        return '' if source_url_base.to_s.empty?

        case source_url_base
        when %r{\Ahttps://github\.com/([^/]+/[^/]+)/(?:blob|tree)/([^/]+)\z}
          "https://raw.githubusercontent.com/#{Regexp.last_match(1)}/#{Regexp.last_match(2)}/#{relative_path}"
        else
          [source_url_base.delete_suffix('/'), relative_path].join('/')
        end
      end

      def rewrite_markdown_images(markdown, base_directory, source_url_base, source_root: SiteKit::Core::Helpers.repo_root)
        return markdown.to_s.strip if markdown.to_s.empty?

        rewritten = markdown.to_s.gsub(MARKDOWN_IMAGE_PATTERN) do |match_text|
          reference = Regexp.last_match[:reference].to_s
          raw_reference = sanitize_asset_path(reference)
          next match_text if raw_reference.empty? || raw_reference.start_with?('http://', 'https://', '/')

          source_path = File.expand_path(raw_reference, base_directory)
          next match_text unless File.exist?(source_path)

          relative_asset_path = SiteKit::Core::Helpers.relative_path(source_root, source_path)
          public_reference = raw_github_url(source_url_base, relative_asset_path)
          match_text.sub(reference, public_reference)
        end

        rewritten.strip
      end

      def sanitize_asset_path(raw_path)
        path = raw_path.to_s.strip
        return path[1...-1].to_s if path.start_with?('<') && path.end_with?('>')

        path.split(/\s+/).first.to_s
      end
    end
  end
end

module SiteKit
  module Core
    module CollectionHelpers
      module_function

      def index_by(values)
        values.to_h do |value|
          [yield(value), value]
        end
      end
    end
  end
end

module SiteKit
  module Core
    module RecordHelpers
      module_function

      def compact_hash(attributes)
        attributes.each_with_object({}) do |(key, value), result|
          result[key] = value unless blank_value?(value)
        end
      end

      def blank_value?(value)
        value.nil? || (value.respond_to?(:empty?) && value.empty?)
      end
    end
  end
end

require 'forwardable'

module SiteKit
  module Core
    module Helpers
      extend SingleForwardable

      def_delegators SiteKit::Core::IoHelpers,
                     :read_text,
                     :maybe_read_text,
                     :parse_yaml,
                     :validate_yaml_mapping_keys!,
                     :validate_yaml_node_keys!,
                     :yaml_key_label
      def_delegators SiteKit::Core::ValidationHelpers,
                     :ensure_hash,
                     :ensure_string,
                     :ensure_array,
                     :ensure_integer_or_nil,
                     :ensure_integer,
                     :ensure_boolean_or_nil,
                     :ensure_array_of_strings,
                     :duplicates,
                     :ensure_unique!
      def_delegators SiteKit::Core::PathHelpers,
                     :repo_root,
                     :site_source,
                     :slugify,
                     :human_label,
                     :relative_path,
                     :inside_path?,
                     :confined_path,
                     :slugify_path_segment,
                     :build_route_path
      def_delegators SiteKit::Core::MarkdownHelpers,
                     :raw_github_url,
                     :rewrite_markdown_images,
                     :sanitize_asset_path
      def_delegators SiteKit::Core::CollectionHelpers,
                     :index_by
    end
  end
end

# rubocop:enable Style/OneClassPerFile
