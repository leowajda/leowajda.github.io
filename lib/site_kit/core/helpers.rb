# frozen_string_literal: true

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
