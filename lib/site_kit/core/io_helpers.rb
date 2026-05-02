# frozen_string_literal: true

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
