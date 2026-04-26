# frozen_string_literal: true

module SiteKit
  class SourceNotesDocumentBuilder
    def initialize(app_config:, source_url_base:, source_root:)
      @app_config = app_config
      @source_url_base = source_url_base
      @source_root = source_root
    end

    def build(module_definition:, absolute_root:, language_context:, root_label:, file_path:)
      relative_to_root = Helpers.relative_path(absolute_root, file_path)
      route_path = Helpers.build_route_path(relative_to_root)
      tree_path = "#{root_label}/#{relative_to_root}"
      metadata = app_config.source_notes.text_file_metadata.fetch(file_path.extname.downcase)
      raw_content = Helpers.read_text(file_path)

      {
        'project_slug' => language_context.fetch('project_slug'),
        'language_slug' => language_context.fetch('language_slug'),
        'module_slug' => module_definition.slug,
        'title' => file_path.basename.to_s,
        'url' => "#{language_context.fetch('language_url')}#{module_definition.slug}/#{route_path}/",
        'route_url' => "#{language_context.fetch('language_url')}#{module_definition.slug}/#{route_path}/",
        'tree_path' => tree_path,
        'format' => metadata.fetch('format'),
        'body' => formatted_body(raw_content, metadata, file_path)
      }
    end

    private

    attr_reader :app_config, :source_url_base, :source_root

    def formatted_body(raw_content, metadata, file_path)
      if metadata.fetch('format') == 'markdown'
        return Helpers.rewrite_markdown_images(raw_content, file_path.dirname, source_url_base,
                                               source_root: source_root)
      end

      syntax = metadata.fetch('syntax')
      "~~~#{syntax}\n#{raw_content.rstrip}\n~~~\n"
    end
  end
end
