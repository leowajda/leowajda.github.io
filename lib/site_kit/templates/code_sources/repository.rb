# frozen_string_literal: true

require 'pathname'

module SiteKit
  module Templates
    module CodeSources
      class Repository
        def initialize(root:, language_catalog:)
          @root = Pathname(root)
          @language_catalog = normalize_language_catalog(language_catalog)
        end

        def entries_by_template(templates)
          template_ids = templates.map(&:template_id)
          validate_source_root!
          validate_known_template_directories!(template_ids)

          template_ids.to_h do |template_id|
            [template_id, entries_for(template_id)]
          end
        end

        private

        attr_reader :root, :language_catalog

        def normalize_language_catalog(value)
          SiteKit::Core::Helpers.ensure_hash(value, 'Template language catalog').transform_values do |entry|
            record = SiteKit::Core::Helpers.ensure_hash(entry, 'Template language catalog entry')
            code_language = SiteKit::Core::Helpers.ensure_string(
              record.fetch('code_language'),
              'Template language catalog entry.code_language'
            )
            {
              'code_language' => code_language,
              'source_extension' => SiteKit::Core::Helpers.ensure_string(
                record.fetch('source_extension', code_language),
                'Template language catalog entry.source_extension'
              )
            }
          end
        end

        def validate_source_root!
          return if root.directory?

          raise SiteKit::CatalogError, "Template code source root does not exist: #{root}"
        end

        def validate_known_template_directories!(template_ids)
          stray_directories = root.children.select(&:directory?).map { |path| path.basename.to_s } - template_ids
          return if stray_directories.empty?

          raise SiteKit::CatalogError,
                "Template code sources reference unknown templates: #{stray_directories.sort.join(', ')}"
        end

        def entries_for(template_id)
          language_catalog.map do |language, record|
            {
              'entry_id' => "#{template_id}-#{language}",
              'language' => language,
              'code' => read_code(template_id, language, record)
            }
          end
        end

        def read_code(template_id, language, record)
          relative_path = File.join(template_id, "#{language}.#{record.fetch('source_extension')}")
          path = SiteKit::Core::Helpers.confined_path(
            root,
            relative_path,
            context: "Template code source #{template_id}/#{language}",
            error_class: SiteKit::CatalogError
          )
          unless path.file?
            raise SiteKit::CatalogError, "Template '#{template_id}' is missing #{language} code source #{relative_path}"
          end

          SiteKit::Core::Helpers.read_text(path).rstrip
        end
      end
    end
  end
end
