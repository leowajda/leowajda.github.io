# frozen_string_literal: true

# rubocop:disable Style/OneClassPerFile, Metrics/ClassLength, Metrics/ParameterLists

module SiteKit
  module SourceNotes
    class TreeBuilder
      def self.build(root_label:, entries:)
        new(root_label:, entries:).build
      end

      def initialize(root_label:, entries:)
        @root_label = root_label
        @entries = entries
      end

      def build
        root = entries.each_with_object([]) do |entry, nodes|
          insert(nodes, entry)
        end
        annotate(sort_nodes(root))
      end

      private

      attr_reader :root_label, :entries

      def insert(root, entry)
        segments = entry.fetch(:relative_path).split('/').reject(&:empty?)
        cursor = root

        segments.each_with_index do |segment, index|
          tree_path = "#{root_label}/#{segments[0..index].join('/')}"
          leaf = index == segments.length - 1
          node = cursor.find do |candidate|
            candidate.fetch('title') == segment && candidate.fetch('tree_path') == tree_path
          end
          unless node
            node = {
              'kind' => leaf ? 'file' : 'directory',
              'title' => segment,
              'tree_path' => tree_path,
              'url' => leaf ? entry.fetch(:url) : '',
              'url_prefix' => '',
              'children' => []
            }
            cursor << node
          end
          cursor = node.fetch('children')
        end
      end

      def sort_nodes(nodes)
        nodes
          .sort_by { |node| [node.fetch('kind') == 'directory' ? 0 : 1, node.fetch('title').downcase] }
          .map { |node| node.merge('children' => sort_nodes(node.fetch('children'))) }
      end

      def annotate(nodes)
        nodes.each do |node|
          children = annotate(node.fetch('children'))
          node['children'] = children
          if node.fetch('kind') == 'directory'
            urls = descendant_urls(node)
            node['url_prefix'] = common_prefix(urls)
          end
        end
        nodes
      end

      def descendant_urls(node)
        if node.fetch('kind') == 'file'
          url = node.fetch('url')
          return url.empty? ? [] : [url]
        end

        node.fetch('children').flat_map { |child| descendant_urls(child) }
      end

      def common_prefix(urls)
        return '' if urls.empty?

        parts = urls.map { |url| url.split('/').reject(&:empty?) }
        shared = parts.first.take_while.with_index do |segment, index|
          parts.all? { |candidate| candidate[index] == segment }
        end
        return '' if shared.empty?

        "/#{shared.join('/')}/"
      end
    end
  end
end

require 'pathname'

module SiteKit
  module SourceNotes
    LanguageDefinition = Data.define(:slug, :title, :path, :modules)
    ModuleDefinition = Data.define(:slug, :title, :path, :source_roots)
    Catalog = Data.define(:source_url_base, :languages)

    class CatalogLoader
      def initialize(manifest:, app_config:)
        @manifest = manifest
        @app_config = app_config
        @repo_root = Pathname(manifest.source_root(SiteKit::Core::Helpers.repo_root))
      end

      def load
        source = raw_catalog

        SiteKit::SourceNotes::Catalog.new(
          source_url_base: SiteKit::Core::Helpers.ensure_string(source.fetch('source_url_base'),
                                                                "#{catalog_label}.source_url_base"),
          languages: parse_languages(source.fetch('languages'))
        )
      end

      private

      attr_reader :manifest, :app_config, :repo_root

      def raw_catalog
        @raw_catalog ||= begin
          raw = SiteKit::Core::Helpers.read_text(repo_root.join('data', 'modules.yml'))
          source = SiteKit::Core::Helpers.ensure_hash(
            SiteKit::Core::Helpers.parse_yaml(raw, "Unable to decode #{catalog_label}"),
            catalog_label
          )
          version = source['version']
          expected_version = app_config.source_notes.fetch('catalog_version')
          unless version == expected_version
            raise SiteKit::CatalogError, "#{catalog_label}.version must be #{expected_version}"
          end

          project = SiteKit::Core::Helpers.ensure_hash(source.fetch('project'), "#{catalog_label}.project")
          project_slug = SiteKit::Core::Helpers.ensure_string(project.fetch('slug'), "#{catalog_label}.project.slug")
          unless project_slug == manifest.slug
            raise SiteKit::CatalogError,
                  "#{catalog_label}.project.slug must match '#{manifest.slug}'"
          end

          source
        end
      end

      def parse_languages(value)
        SiteKit::Core::Helpers.ensure_hash(value, "#{catalog_label}.languages").map do |language_slug, entry|
          raw_language = SiteKit::Core::Helpers.ensure_hash(entry, "Language '#{language_slug}'")
          modules = SiteKit::Core::Helpers.ensure_hash(
            raw_language.fetch('modules'),
            "Language '#{language_slug}'.modules"
          ).map do |module_slug, module_entry|
            raw_module = SiteKit::Core::Helpers.ensure_hash(module_entry, "Module '#{language_slug}/#{module_slug}'")

            SiteKit::SourceNotes::ModuleDefinition.new(
              slug: module_slug,
              title: SiteKit::Core::Helpers.ensure_string(raw_module.fetch('title'),
                                                          "Module '#{language_slug}/#{module_slug}'.title"),
              path: SiteKit::Core::Helpers.ensure_string(raw_module.fetch('path'),
                                                         "Module '#{language_slug}/#{module_slug}'.path"),
              source_roots: SiteKit::Core::Helpers.ensure_array_of_strings(
                raw_module.fetch('source_roots'),
                "Module '#{language_slug}/#{module_slug}'.source_roots"
              )
            )
          end
          raise SiteKit::CatalogError, "Language '#{language_slug}' must define at least one module" if modules.empty?

          SiteKit::SourceNotes::LanguageDefinition.new(
            slug: language_slug,
            title: SiteKit::Core::Helpers.ensure_string(raw_language.fetch('title'),
                                                        "Language '#{language_slug}'.title"),
            path: SiteKit::Core::Helpers.ensure_string(raw_language.fetch('path'), "Language '#{language_slug}'.path"),
            modules: modules.sort_by { |module_record| module_record.title.downcase }
          )
        end.sort_by { |language| language.title.downcase }
      end

      def catalog_label
        @catalog_label ||= "#{manifest.title} source-notes catalog"
      end
    end
  end
end

module SiteKit
  module SourceNotes
    class DocumentBuilder
      def initialize(app_config:, source_url_base:, source_root:)
        @app_config = app_config
        @source_url_base = source_url_base
        @source_root = source_root
      end

      def build(module_definition:, absolute_root:, language_context:, root_label:, file_path:)
        relative_to_root = SiteKit::Core::Helpers.relative_path(absolute_root, file_path)
        route_path = SiteKit::Core::Helpers.build_route_path(relative_to_root)
        metadata = app_config.source_notes.fetch('text_file_metadata').fetch(file_path.extname.downcase)
        raw_content = SiteKit::Core::Helpers.read_text(file_path)
        paths = document_paths(language_context, module_definition.slug, route_path)
        base = {
          'project_slug' => language_context.fetch('project_slug'),
          'language_slug' => language_context.fetch('language_slug'),
          'module_slug' => module_definition.slug,
          'title' => file_path.basename.to_s,
          'url' => paths.path,
          'route_url' => paths.path,
          'embed_url' => paths.embed,
          'tree_path' => "#{root_label}/#{relative_to_root}",
          'format' => metadata.fetch('format'),
          'body' => formatted_body(raw_content, metadata, file_path)
        }
        return base unless metadata.fetch('format') == 'code'

        base.merge('entries' => [code_entry(raw_content, metadata, language_context, paths)])
      end

      private

      attr_reader :app_config, :source_url_base, :source_root

      def document_paths(language_context, module_slug, route_path)
        language_url = language_context.fetch('language_url').delete_prefix('/').delete_suffix('/')
        SiteKit::Core::ResourcePaths.new(route_base: "#{language_url}/#{module_slug}/#{route_path}")
      end

      def code_entry(raw_content, metadata, language_context, paths)
        SiteKit::Core::CodeEntry.normalize(
          {
            'entry_id' => 'source',
            'language' => language_context.fetch('language_slug'),
            'language_label' => language_context.fetch('language_title'),
            'variant' => 'default',
            'variant_label' => 'Default',
            'code' => raw_content.rstrip,
            'code_language' => metadata.fetch('syntax'),
            'detail_url' => paths.path,
            'embed_url' => paths.embed
          },
          context: "Source document #{paths.path}"
        )
      end

      def formatted_body(raw_content, metadata, file_path)
        if metadata.fetch('format') == 'markdown'
          return SiteKit::Core::Helpers.rewrite_markdown_images(raw_content, file_path.dirname, source_url_base,
                                                                source_root: source_root)
        end

        "~~~#{metadata.fetch('syntax')}\n#{raw_content.rstrip}\n~~~\n"
      end
    end
  end
end

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

        documents = build_documents(module_definition, language_context)

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

      def build_documents(module_definition, language_context)
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

      def walk_text_files(directory, traversal_root = directory)
        directory.children.sort_by(&:to_s).flat_map do |entry|
          validate_traversed_path!(traversal_root, entry)

          if entry.directory?
            next [] if ignored_directory?(entry.basename.to_s)

            walk_text_files(entry, traversal_root)
          elsif app_config.source_notes.fetch('text_file_metadata').key?(entry.extname.downcase)
            [entry]
          else
            []
          end
        end
      end

      def ignored_directory?(name)
        name.start_with?('.') || app_config.source_notes.fetch('ignored_directories').include?(name)
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
        SiteKit::Core::Helpers.confined_path(
          repo_root,
          relative_path,
          context: context,
          error_class: SiteKit::SourceError
        )
      end

      def validate_traversed_path!(root, entry)
        return unless entry.exist?

        real_root = root.realpath
        real_entry = entry.realpath
        return if SiteKit::Core::Helpers.inside_path?(real_root, real_entry)

        raise SiteKit::SourceError, "Source entry '#{entry}' escapes the source root '#{root}'"
      end
    end
  end
end

module SiteKit
  module SourceNotes
    class RegistryBuilder
      def initialize(manifest:, app_config:)
        @manifest = manifest
        @app_config = app_config
        @repo_root = Pathname(manifest.source_root(SiteKit::Core::Helpers.repo_root))
      end

      def record
        languages = language_records

        {
          'project_slug' => manifest.slug,
          'project_title' => manifest.title,
          'project_description' => manifest.description,
          'project_url' => project_home_url,
          'project_home_url' => project_home_url,
          'project_source_url' => manifest.source_url,
          'modules' => languages.flat_map do |language|
            language.fetch('modules').map do |module_record|
              homepage_module_record(language, module_record)
            end
          end,
          'languages' => languages
        }
      end

      private

      attr_reader :manifest, :app_config, :repo_root

      def source_catalog
        @source_catalog ||= SiteKit::SourceNotes::CatalogLoader.new(manifest: manifest, app_config: app_config).load
      end

      def language_records
        @language_records ||= source_catalog.languages.map do |language|
          language_url = SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base).path(language.slug)
          language_context = {
            'project_slug' => manifest.slug,
            'project_title' => manifest.title,
            'project_url' => project_home_url,
            'project_source_url' => manifest.source_url,
            'language_slug' => language.slug,
            'language_title' => language.title,
            'language_url' => language_url
          }

          {
            'project_slug' => manifest.slug,
            'project_title' => manifest.title,
            'project_url' => project_home_url,
            'project_source_url' => manifest.source_url,
            'language_slug' => language.slug,
            'language_title' => language.title,
            'url' => language_url,
            'source_url' => module_builder.tree_source_url(language.path),
            'modules' => language.modules.map do |module_definition|
              module_builder.build(module_definition: module_definition, language_context: language_context)
            end
          }
        end
      end

      def homepage_module_record(language, module_record)
        {
          'language_slug' => language.fetch('language_slug'),
          'language_title' => language.fetch('language_title'),
          'module_slug' => module_record.fetch('module_slug'),
          'title' => module_record.fetch('title'),
          'url' => module_record.fetch('url')
        }
      end

      def project_home_url
        return manifest.entry_url unless manifest.entry_url.empty?

        SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base).root
      end

      def module_builder
        @module_builder ||= SiteKit::SourceNotes::ModuleBuilder.new(
          app_config: app_config,
          manifest: manifest,
          source_url_base: source_catalog.source_url_base,
          repo_root: repo_root
        )
      end
    end
  end
end

module SiteKit
  module SourceNotes
    class PageFactory # rubocop:disable Metrics/ClassLength
      def initialize(manifest:, registry_record:)
        @manifest = manifest
        @registry_record = registry_record
        @paths = SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base)
      end

      def home_page
        SiteKit::Emit.page(
          project_slug: manifest.slug,
          dir: paths.root,
          page_type: SOURCE_HOME_PAGE_TYPE,
          title: registry_record.fetch('project_title'),
          description: registry_record.fetch('project_description'),
          data: {
            'source_home' => {
              'title' => registry_record.fetch('project_title'),
              'description' => registry_record.fetch('project_description'),
              'source_url' => registry_record.fetch('project_source_url'),
              'languages' => languages.map { |language| language_summary(language) }
            }
          }
        )
      end

      def language_pages
        languages.map do |language|
          title = language.fetch('language_title')
          SiteKit::Emit.page(
            project_slug: manifest.slug,
            dir: language.fetch('url'),
            page_type: SOURCE_LANGUAGE_PAGE_TYPE,
            title: title,
            description: "Source notes for #{title}.",
            data: {
              'language_slug' => language.fetch('language_slug'),
              'source_language' => language_summary(language).merge(
                'source_url' => language.fetch('source_url')
              ),
              'source_header' => header(registry_record.fetch('project_title'), title)
            }
          )
        end
      end

      def module_pages
        each_module.map do |language, module_record|
          title = module_record.fetch('title')
          crumbs = [
            crumb('Home', '/'),
            crumb(registry_record.fetch('project_title'), paths.root),
            crumb(language.fetch('language_title'), language.fetch('url')),
            crumb(title, module_record.fetch('url'))
          ]
          emit(
            dir: module_record.fetch('url'),
            page_type: SOURCE_MODULE_PAGE_TYPE,
            title: title,
            language_slug: language.fetch('language_slug'),
            module_slug: module_record.fetch('module_slug'),
            header: header(language.fetch('language_title'), title),
            schema: schema(
              [registry_record.fetch('project_title'), language.fetch('language_title'), title],
              crumbs
            ),
            source_module: slice(module_record, %w[slug module_slug title url readme_markdown roots])
          )
        end
      end

      def document_pages
        each_module.flat_map do |language, module_record|
          module_record.fetch('documents').flat_map do |document|
            document_pages_for(language, module_record, document)
          end
        end
      end

      private

      attr_reader :manifest, :registry_record, :paths

      def document_pages_for(language, module_record, document)
        entries = document['entries'] || []
        source_document = document_payload(document, entries)
        pages = [document_page(language, module_record, document, source_document, entries)]
        return pages if entries.empty?

        pages << document_embed_page(language, module_record, document, source_document, entries)
        pages
      end

      def document_payload(document, entries)
        {
          'route_url' => document.fetch('route_url'),
          'title' => document.fetch('title'),
          'format' => document.fetch('format'),
          'body' => document.fetch('body'),
          'embed_url' => document.fetch('embed_url'),
          'entries' => entries
        }
      end

      def document_page(language, module_record, document, source_document, entries)
        title = document.fetch('title')
        crumbs = document_crumbs(language, module_record, document)
        emit(
          dir: document.fetch('route_url'),
          page_type: SOURCE_DOCUMENT_PAGE_TYPE,
          title: title,
          language_slug: language.fetch('language_slug'),
          module_slug: module_record.fetch('module_slug'),
          header: header(module_record.fetch('title'), title),
          schema: schema(
            [registry_record.fetch('project_title'), module_record.fetch('title'),
             language.fetch('language_title')],
            crumbs,
            code_repository: registry_record.fetch('project_source_url'),
            programming_language: language.fetch('language_title')
          ),
          source_module: slice(module_record, %w[slug module_slug title url roots]),
          document_url: document.fetch('route_url'),
          source_document: source_document,
          format: document.fetch('format'),
          entries: entries
        )
      end

      def document_embed_page(language, module_record, document, source_document, entries)
        title = document.fetch('title')
        crumbs = document_crumbs(language, module_record, document)
        emit(
          dir: document.fetch('embed_url'),
          page_type: SOURCE_EMBED_PAGE_TYPE,
          title: "#{title} · Embed",
          language_slug: language.fetch('language_slug'),
          module_slug: module_record.fetch('module_slug'),
          header: header(module_record.fetch('title'), title),
          schema: schema(
            [registry_record.fetch('project_title'), module_record.fetch('title'),
             language.fetch('language_title')],
            crumbs
          ),
          source_module: slice(module_record, %w[slug module_slug title url roots]),
          document_url: document.fetch('route_url'),
          source_document: source_document,
          format: document.fetch('format'),
          detail_url: document.fetch('route_url'),
          embed: true,
          entries: entries
        )
      end

      def document_crumbs(language, module_record, document)
        [
          crumb('Home', '/'),
          crumb(registry_record.fetch('project_title'), paths.root),
          crumb(language.fetch('language_title'), language.fetch('url')),
          crumb(module_record.fetch('title'), module_record.fetch('url')),
          crumb(document.fetch('title'), document.fetch('route_url'))
        ]
      end

      def languages
        registry_record.fetch('languages')
      end

      def each_module
        languages.flat_map { |language| language.fetch('modules').map { |mod| [language, mod] } }
      end

      def language_summary(language)
        {
          'slug' => language.fetch('language_slug'),
          'title' => language.fetch('language_title'),
          'url' => language.fetch('url'),
          'modules' => language.fetch('modules').map do |mod|
            { 'title' => mod.fetch('title'), 'url' => mod.fetch('url') }
          end
        }
      end

      def emit(dir:, page_type:, title:, language_slug:, header:, schema:, source_module:, **extra) # rubocop:disable Metrics/ParameterLists
        SiteKit::Emit.page(
          project_slug: manifest.slug,
          dir: dir,
          page_type: page_type,
          title: title,
          description: "#{title} notes",
          data: {
            'language_slug' => language_slug,
            'source_header' => header,
            'source_schema' => schema,
            'source_module' => source_module,
            'module_slug' => extra[:module_slug],
            'document_url' => extra[:document_url],
            'source_document' => extra[:source_document],
            'format' => extra[:format],
            'detail_url' => extra[:detail_url],
            'embed' => extra[:embed],
            'entries' => extra[:entries]
          }.compact
        )
      end

      def header(eyebrow, title)
        { 'eyebrow' => eyebrow, 'title' => title }
      end

      def schema(about, breadcrumbs, code_repository: nil, programming_language: nil)
        {
          'about' => about,
          'breadcrumbs' => breadcrumbs,
          'code_repository' => code_repository,
          'programming_language' => programming_language
        }.compact
      end

      def crumb(name, item)
        { 'name' => name, 'item' => item }
      end

      def slice(record, keys)
        keys.to_h { |key| [key, record.fetch(key)] }
      end
    end
  end
end

module SiteKit
  module SourceNotes
    class Project
      def initialize(manifest:, app_config:)
        @manifest = manifest
        @app_config = app_config
      end

      def slug
        manifest.slug
      end

      def registry_record
        @registry_record ||= SiteKit::SourceNotes::RegistryBuilder.new(
          manifest: manifest,
          app_config: app_config
        ).record
      end

      def generated_pages
        factory = page_factory
        [factory.home_page] + factory.language_pages + factory.module_pages + factory.document_pages
      end

      private

      attr_reader :manifest, :app_config

      def page_factory
        @page_factory ||= SiteKit::SourceNotes::PageFactory.new(
          manifest: manifest,
          registry_record: registry_record
        )
      end
    end
  end
end

module SiteKit
  module SourceNotes
    class Context
      def initialize(manifests:, app_config:)
        @manifests = manifests
        @app_config = app_config
      end

      def projects
        @projects ||= manifests.to_h do |manifest|
          [manifest.slug, SiteKit::SourceNotes::Project.new(manifest: manifest, app_config: app_config)]
        end
      end

      def registries
        @registries ||= projects.transform_values(&:registry_record)
      end

      def generated_pages
        @generated_pages ||= projects.values.flat_map(&:generated_pages)
      end

      private

      attr_reader :manifests, :app_config
    end
  end
end

# rubocop:enable Style/OneClassPerFile, Metrics/ClassLength, Metrics/ParameterLists
