# frozen_string_literal: true

module SiteKit
  module SourceNotes
    class DocumentBuilder
      def initialize(app_config:, source_url_base:, source_root:)
        @app_config = app_config
        @source_url_base = source_url_base
        @source_root = source_root
      end

      def build(module_definition:, absolute_root:, language_context:, root_label:, file_path:) # rubocop:disable Metrics/MethodLength
        relative_to_root = SiteKit::Core::Helpers.relative_path(absolute_root, file_path)
        route_path = SiteKit::Core::Helpers.build_route_path(relative_to_root)
        tree_path = "#{root_label}/#{relative_to_root}"
        metadata = app_config.source_notes.fetch('text_file_metadata').fetch(file_path.extname.downcase)
        raw_content = SiteKit::Core::Helpers.read_text(file_path)
        format = metadata.fetch('format')
        route_url = "#{language_context.fetch('language_url')}#{module_definition.slug}/#{route_path}/"
        record = {
          'project_slug' => language_context.fetch('project_slug'),
          'language_slug' => language_context.fetch('language_slug'),
          'module_slug' => module_definition.slug,
          'title' => file_path.basename.to_s,
          'url' => route_url,
          'route_url' => route_url,
          'embed_url' => "#{route_url}embed/",
          'tree_path' => tree_path,
          'format' => format,
          'body' => formatted_body(raw_content, metadata, file_path)
        }
        return record unless format == 'code'

        syntax = metadata.fetch('syntax')
        record.merge(
          'code_entries' => [{
            'entry_id' => 'source',
            'language' => language_context.fetch('language_slug'),
            'language_label' => language_context.fetch('language_title'),
            'variant' => 'default',
            'variant_label' => 'Default',
            'code' => raw_content.rstrip,
            'code_language' => syntax,
            'detail_url' => route_url,
            'embed_url' => "#{route_url}embed/"
          }]
        )
      end

      private

      attr_reader :app_config, :source_url_base, :source_root

      def formatted_body(raw_content, metadata, file_path)
        if metadata.fetch('format') == 'markdown'
          return SiteKit::Core::Helpers.rewrite_markdown_images(raw_content, file_path.dirname, source_url_base,
                                                                source_root: source_root)
        end

        syntax = metadata.fetch('syntax')
        "~~~#{syntax}\n#{raw_content.rstrip}\n~~~\n"
      end
    end
  end
end
