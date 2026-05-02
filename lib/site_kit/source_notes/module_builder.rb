# frozen_string_literal: true

module SiteKit
  module SourceNotes
    class ModuleBuilder
      def initialize(app_config:, manifest:, source_url_base:, repo_root:)
        @app_config = app_config
        @manifest = manifest
        @source_url_base = source_url_base
        @repo_root = repo_root
        @document_builder = SiteKit::SourceNotes::DocumentBuilder.new(
          app_config: app_config,
          source_url_base: source_url_base,
          source_root: repo_root
        )
      end

      def build(module_definition:, language_context:)
        absolute_path = source_path(module_definition.path, "Module '#{module_definition.slug}' path")
        unless absolute_path.directory?
          raise SiteKit::SourceError,
                "Module '#{module_definition.slug}' is missing at '#{absolute_path}'"
        end

        documents = build_documents(module_definition, absolute_path, language_context)

        {
          'project_slug' => language_context.fetch('project_slug'),
          'project_title' => language_context.fetch('project_title'),
          'project_url' => language_context.fetch('project_url'),
          'project_source_url' => language_context.fetch('project_source_url'),
          'language_slug' => language_context.fetch('language_slug'),
          'language_title' => language_context.fetch('language_title'),
          'language_url' => language_context.fetch('language_url'),
          'slug' => module_definition.slug,
          'module_slug' => module_definition.slug,
          'title' => module_definition.title,
          'source_url' => tree_source_url(module_definition.path),
          'url' => "#{language_context.fetch('language_url')}#{module_definition.slug}/",
          'readme_markdown' => SiteKit::Core::Helpers.rewrite_markdown_images(
            SiteKit::Core::Helpers.maybe_read_text(absolute_path.join('README.md')),
            absolute_path,
            source_url_base,
            source_root: repo_root
          ),
          'documents' => documents,
          'roots' => build_roots(module_definition, documents)
        }
      end

      def tree_source_url(relative_path)
        tree_url_base = source_url_base.sub(%r{/blob/([^/]+)\z}, '/tree/\1')
        base = tree_url_base == source_url_base ? manifest.source_url : tree_url_base

        relative_path.empty? ? base : "#{base}/#{relative_path}"
      end

      private

      attr_reader :app_config, :manifest, :source_url_base, :repo_root, :document_builder

      def build_documents(module_definition, _absolute_path, language_context)
        documents = module_definition.source_roots.flat_map do |root_label|
          absolute_root = source_path(File.join(module_definition.path, root_label),
                                      "Module '#{module_definition.slug}' root '#{root_label}'")
          unless absolute_root.directory?
            raise SiteKit::SourceError,
                  "Module '#{module_definition.slug}' root '#{root_label}' is missing at '#{absolute_root}'"
          end

          walk_text_files(absolute_root).map do |file_path|
            document_builder.build(
              module_definition: module_definition,
              absolute_root: absolute_root,
              language_context: language_context,
              root_label: root_label,
              file_path: file_path
            )
          end
        end
        validate_unique_document_routes!(module_definition, documents)
        documents
      end

      def walk_text_files(directory)
        directory.children.sort_by(&:to_s).flat_map do |entry|
          if entry.directory?
            next [] if ignored_directory?(entry.basename.to_s)

            walk_text_files(entry)
          elsif app_config.source_notes.text_file_metadata.key?(entry.extname.downcase)
            [entry]
          else
            []
          end
        end
      end

      def ignored_directory?(name)
        name.start_with?('.') || app_config.source_notes.ignored_directories.include?(name)
      end

      def build_roots(module_definition, documents)
        module_definition.source_roots.map do |root_label|
          prefix = "#{root_label}/"
          entries = documents
                    .select { |document| document.fetch('tree_path').start_with?(prefix) }
                    .map do |document|
            { relative_path: document.fetch('tree_path').delete_prefix(prefix),
              url: document.fetch('url') }
          end

          {
            'label' => root_label,
            'tree_path' => prefix,
            'nodes' => SiteKit::SourceNotes::TreeBuilder.build(root_label: root_label, entries: entries)
          }
        end
      end

      def validate_unique_document_routes!(module_definition, documents)
        SiteKit::Core::Helpers.ensure_unique!(
          documents.map { |document| document.fetch('route_url') },
          "Module '#{module_definition.slug}' document routes must be unique"
        )
      end

      def source_path(relative_path, context)
        path = repo_root.join(relative_path).expand_path
        root = repo_root.expand_path.to_s
        return path if path.to_s == root || path.to_s.start_with?("#{root}#{File::SEPARATOR}")

        raise SiteKit::SourceError, "#{context} escapes the source root"
      end
    end
  end
end
