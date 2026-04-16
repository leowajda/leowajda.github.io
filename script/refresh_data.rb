#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"
require "json"
require "open3"
require "pathname"
require "yaml"

module RefreshData
  ROOT = File.expand_path("..", __dir__)
  SITE_SOURCE = File.join(ROOT, "site-src")
  GENERATED_DATA_DIRECTORY = File.join(SITE_SOURCE, "_data", "generated")
  GENERATED_MANIFEST_PATH = File.join(SITE_SOURCE, ".generated-files.json")
  PROJECTS_DIRECTORY = File.join(ROOT, "projects")

  module Helpers
    module_function

    def read_text(path)
      File.read(path)
    rescue StandardError => error
      raise "Unable to read '#{path}': #{error.message}"
    end

    def maybe_read_text(path)
      File.exist?(path) ? read_text(path) : ""
    end

    def write_text(path, content)
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, content)
    end

    def copy_file(source_path, target_path)
      FileUtils.mkdir_p(File.dirname(target_path))
      FileUtils.cp(source_path, target_path)
    end

    def parse_yaml(raw, context)
      YAML.safe_load(raw, aliases: false) || {}
    rescue StandardError => error
      raise "#{context}: #{error.message}"
    end

    def load_yaml_file(path, context)
      parse_yaml(read_text(path), context)
    end

    def pretty_json(value)
      JSON.pretty_generate(value).gsub(/\[\n\s*\]/, "[]")
    end

    def ensure_hash(value, context)
      return value if value.is_a?(Hash)

      raise "#{context} must be a mapping"
    end

    def ensure_string(value, context)
      return value if value.is_a?(String)

      raise "#{context} must be a string"
    end

    def ensure_boolean_or_nil(value, context)
      return value if value.nil? || value == true || value == false

      raise "#{context} must be a boolean"
    end

    def ensure_array_of_strings(value, context)
      unless value.is_a?(Array) && value.all? { |item| item.is_a?(String) }
        raise "#{context} must be an array of strings"
      end

      value
    end

    def ensure_string_map(value, context)
      ensure_hash(value, context).each_with_object({}) do |(key, entry), result|
        result[ensure_string(key, "#{context} key")] = ensure_string(entry, "#{context}.#{key}")
      end
    end

    def normalize_remote_url(remote_url)
      if remote_url.start_with?("git@github.com:")
        return "https://github.com/#{remote_url.delete_prefix('git@github.com:').sub(/\.git$/, '')}"
      end

      remote_url.sub(/\.git$/, "")
    end

    def run_command(*args, chdir:)
      stdout, status = Open3.capture2(*args, chdir: chdir)
      raise "Command '#{args.join(' ')}' failed in '#{chdir}'" unless status.success?

      stdout.strip
    end

    def repository_metadata(repo_root)
      source_url = normalize_remote_url(run_command("git", "remote", "get-url", "origin", chdir: repo_root))
      branch = run_command("git", "rev-parse", "--abbrev-ref", "HEAD", chdir: repo_root)
      { "source_url" => source_url, "branch" => branch }
    rescue StandardError
      { "source_url" => "", "branch" => "master" }
    end

    def relative_site_path(path)
      pathname = Pathname.new(path)
      site_pathname = Pathname.new(SITE_SOURCE)
      relative = pathname.relative_path_from(site_pathname).to_s
      return nil if relative.start_with?("..")

      relative
    rescue ArgumentError
      nil
    end

    def load_generated_manifest
      parsed = JSON.parse(read_text(GENERATED_MANIFEST_PATH))
      files = parsed["files"]
      return [] unless parsed["version"] == 1 && files.is_a?(Array) && files.all? { |item| item.is_a?(String) }

      files
    rescue StandardError
      []
    end

    def clear_generated_outputs
      load_generated_manifest.each do |relative_path|
        FileUtils.rm_rf(File.join(SITE_SOURCE, relative_path))
      end
      FileUtils.rm_f(GENERATED_MANIFEST_PATH)
    end

    def write_generated_manifest(paths)
      files = paths.filter_map { |path| relative_site_path(path) }.uniq.sort
      write_text(GENERATED_MANIFEST_PATH, pretty_json({ version: 1, files: files }) + "\n")
    end

    def slugify(value)
      value.downcase.gsub(/[^a-z0-9_-]/, "-")
    end

    def human_label(value)
      value
        .tr("_", " ")
        .split(" ")
        .map { |part| part[0] ? part[0].upcase + part[1..] : part }
        .join(" ")
    end

    def append_unique!(target, values)
      values.each do |value|
        target << value unless target.include?(value)
      end
    end
  end

  class ManifestRepository
    include Helpers

    def load
      Dir.glob(File.join(PROJECTS_DIRECTORY, "*.yml")).sort.map do |path|
        parse(load_yaml_file(path, "Unable to decode project manifest '#{File.basename(path)}'"), File.basename(path))
      end
    end

    private

    def parse(value, label)
      record = Helpers.ensure_hash(value, "Project manifest #{label}")
      {
        "kind" => Helpers.ensure_string(record["kind"], "Project manifest #{label}.kind"),
        "slug" => Helpers.ensure_string(record["slug"], "Project manifest #{label}.slug"),
        "title" => Helpers.ensure_string(record["title"], "Project manifest #{label}.title"),
        "description" => Helpers.ensure_string(record["description"], "Project manifest #{label}.description"),
        "route_base" => Helpers.ensure_string(record["route_base"], "Project manifest #{label}.route_base"),
        "source_repo_path" => Helpers.ensure_string(record["source_repo_path"], "Project manifest #{label}.source_repo_path"),
        "source_optional" => Helpers.ensure_boolean_or_nil(record["source_optional"], "Project manifest #{label}.source_optional")
      }
    end
  end

  class EurekaBuilder
    METADATA_KEYS = %w[name url difficulty categories].freeze

    def initialize(manifest)
      @manifest = manifest
      @source_root = File.join(ROOT, manifest.fetch("source_repo_path"))
    end

    def build
      source = decode_source(Helpers.read_text(File.join(@source_root, "_data", "problems.yml")))
      metadata = Helpers.repository_metadata(@source_root)
      model = build_model(source)

      {
        card: build_card(metadata.fetch("source_url")),
        files: [
          {
            path: generated_data_path(@manifest.fetch("slug"), "problem_filters.json"),
            content: Helpers.pretty_json(model.fetch(:problem_filters)) + "\n"
          },
          {
            path: generated_data_path(@manifest.fetch("slug"), "problems.json"),
            content: Helpers.pretty_json(model.fetch(:content)) + "\n"
          }
        ],
        assets: []
      }
    end

    private

    def build_card(source_url)
      {
        "slug" => @manifest.fetch("slug"),
        "title" => @manifest.fetch("title"),
        "description" => @manifest.fetch("description"),
        "url" => "#{@manifest.fetch('route_base')}/",
        "source_url" => source_url
      }
    end

    def decode_source(raw)
      source = Helpers.ensure_hash(Helpers.parse_yaml(raw, "Unable to decode Eureka problem table"), "Eureka source")
      languages = Helpers.ensure_hash(source["languages"], "Eureka source.languages").each_with_object({}) do |(slug, value), result|
        record = Helpers.ensure_hash(value, "Eureka source.languages.#{slug}")
        result[slug] = {
          "label" => Helpers.ensure_string(record["label"], "Eureka source.languages.#{slug}.label"),
          "code_language" => Helpers.ensure_string(record["code_language"], "Eureka source.languages.#{slug}.code_language")
        }
      end

      problems = Helpers.ensure_hash(source["problems"], "Eureka source.problems").each_with_object({}) do |(slug, value), result|
        result[slug] = decode_problem(slug, Helpers.ensure_hash(value, "Problem '#{slug}'"), languages)
      end

      { "languages" => languages, "problems" => problems }
    end

    def decode_problem(slug, raw_problem, languages)
      unknown_keys = raw_problem.keys - METADATA_KEYS - languages.keys
      unless unknown_keys.empty?
        raise "Problem '#{slug}' references unsupported keys: #{unknown_keys.join(', ')}"
      end

      implementations = languages.keys.each_with_object({}) do |language_slug, result|
        next unless raw_problem.key?(language_slug)

        result[language_slug] = Helpers.ensure_string_map(raw_problem[language_slug], "Problem '#{slug}' implementations for '#{language_slug}'")
      end

      raise "Problem '#{slug}' has no implementations" if implementations.empty?

      {
        "name" => Helpers.ensure_string(raw_problem["name"], "Problem '#{slug}'.name"),
        "url" => Helpers.ensure_string(raw_problem["url"], "Problem '#{slug}'.url"),
        "difficulty" => Helpers.ensure_string(raw_problem["difficulty"], "Problem '#{slug}'.difficulty"),
        "categories" => Helpers.ensure_array_of_strings(raw_problem["categories"], "Problem '#{slug}'.categories"),
        "implementations" => implementations
      }
    end

    def build_model(source)
      language_entries = source.fetch("languages").to_a
      problem_entries = source.fetch("problems").to_a
      codes = {}

      problem_entries.each do |_slug, problem|
        list_problem_implementations(language_entries, problem).each do |implementation|
          codes[implementation_key(implementation.fetch(:language_slug), implementation.fetch(:approach), implementation.fetch(:source_url))] =
            load_code(implementation.fetch(:source_url))
        end
      end

      problem_pages = problem_entries.map do |slug, problem|
        build_problem_page(language_entries, slug, problem, codes)
      end

      categories = []
      difficulties = []
      problem_pages.each do |problem_page|
        Helpers.append_unique!(categories, problem_page.fetch("categories"))
        Helpers.append_unique!(difficulties, [problem_page.fetch("difficulty")])
      end

      {
        content: {
          "project_key" => @manifest.fetch("slug"),
          "route_base" => @manifest.fetch("route_base"),
          "languages" => language_entries.map do |slug, language|
            {
              "slug" => slug,
              "label" => language.fetch("label"),
              "title" => "#{language.fetch('label')} Solutions",
              "description" => "All LeetCode solutions in #{language.fetch('label')}.",
              "url" => "#{@manifest.fetch('route_base')}/#{slug}/"
            }
          end,
          "problems" => problem_pages
        },
        problem_filters: {
          "difficulties" => difficulties,
          "categories" => categories,
          "languages" => language_entries.map { |slug, language| { "slug" => slug, "label" => language.fetch("label") } }
        }
      }
    end

    def build_problem_page(language_entries, slug, problem, codes)
      implementations = list_problem_implementations(language_entries, problem).map do |implementation|
        build_implementation(
          slug,
          implementation.fetch(:language_slug),
          implementation.fetch(:language),
          implementation.fetch(:approach),
          implementation.fetch(:source_url),
          codes[implementation_key(implementation.fetch(:language_slug), implementation.fetch(:approach), implementation.fetch(:source_url))] || ""
        )
      end

      implementations_by_language = implementations.group_by { |implementation| implementation.fetch("language") }
      languages = language_entries.filter_map do |language_slug, language|
        next unless implementations_by_language.key?(language_slug)

        {
          "slug" => language_slug,
          "label" => language.fetch("label"),
          "count" => implementations_by_language.fetch(language_slug).size
        }
      end

      {
        "problem_slug" => slug,
        "title" => problem.fetch("name"),
        "problem_source_url" => problem.fetch("url"),
        "difficulty" => problem.fetch("difficulty"),
        "difficulty_slug" => Helpers.slugify(problem.fetch("difficulty")),
        "categories" => problem.fetch("categories"),
        "languages" => languages,
        "implementations" => implementations,
        "implementation_count" => implementations.size,
        "detail_url" => "#{@manifest.fetch('route_base')}/problems/#{slug}/",
        "embed_url" => "#{@manifest.fetch('route_base')}/problems/#{slug}/embed/",
        "search_title" => problem.fetch("name").downcase
      }
    end

    def list_problem_implementations(language_entries, problem)
      language_entries.flat_map do |language_slug, language|
        sources = problem.fetch("implementations")[language_slug]
        next [] unless sources

        sources.map do |approach, source_url|
          {
            language_slug: language_slug,
            language: language,
            approach: approach,
            source_url: source_url
          }
        end
      end
    end

    def build_implementation(problem_slug, language_slug, language, approach, source_url, code)
      implementation_id = Helpers.slugify("#{language_slug}-#{approach}")
      {
        "id" => implementation_id,
        "language" => language_slug,
        "approach" => approach,
        "approach_label" => Helpers.human_label(approach),
        "source_url" => source_url,
        "code" => code,
        "code_language" => language.fetch("code_language"),
        "detail_url" => "#{@manifest.fetch('route_base')}/problems/#{problem_slug}/##{implementation_id}",
        "embed_url" => "#{@manifest.fetch('route_base')}/problems/#{problem_slug}/embed/#{implementation_id}/"
      }
    end

    def implementation_key(language_slug, approach, source_url)
      "#{language_slug}:#{approach}:#{source_url}"
    end

    def local_source_path(github_url)
      match = github_url.match(%r{\Ahttps://github\.com/[^/]+/([^/]+)/blob/[^/]+/(.+)\z})
      return nil unless match

      File.join(@source_root, match[1], match[2])
    end

    def load_code(github_url)
      source_path = local_source_path(github_url)
      return "" unless source_path && File.exist?(source_path)

      Helpers.read_text(source_path)
    end

    def generated_data_path(*segments)
      File.join(GENERATED_DATA_DIRECTORY, *segments)
    end
  end

  class SourceNotesBuilder
    SUPPORTED_SOURCE_ROOTS = [
      { "language" => "java", "label" => "src/main/java" },
      { "language" => "scala", "label" => "src/main/scala" }
    ].freeze

    IGNORED_DIRECTORY_NAMES = %w[.git .idea .bsp build dist node_modules out target].freeze

    TEXT_FILE_METADATA = {
      ".conf" => { "format" => "code", "syntax" => "conf", "language" => "config" },
      ".gradle" => { "format" => "code", "syntax" => "groovy", "language" => "groovy" },
      ".java" => { "format" => "code", "syntax" => "java", "language" => "java" },
      ".json" => { "format" => "code", "syntax" => "json", "language" => "json" },
      ".kts" => { "format" => "code", "syntax" => "kotlin", "language" => "kotlin" },
      ".md" => { "format" => "markdown", "syntax" => "", "language" => "markdown" },
      ".properties" => { "format" => "code", "syntax" => "properties", "language" => "properties" },
      ".scala" => { "format" => "code", "syntax" => "scala", "language" => "scala" },
      ".sc" => { "format" => "code", "syntax" => "scala", "language" => "scala" },
      ".sbt" => { "format" => "code", "syntax" => "scala", "language" => "scala" },
      ".sql" => { "format" => "code", "syntax" => "sql", "language" => "sql" },
      ".txt" => { "format" => "markdown", "syntax" => "", "language" => "text" },
      ".xml" => { "format" => "code", "syntax" => "xml", "language" => "xml" },
      ".yaml" => { "format" => "code", "syntax" => "yaml", "language" => "yaml" },
      ".yml" => { "format" => "code", "syntax" => "yaml", "language" => "yaml" }
    }.freeze

    MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/

    def initialize(manifest)
      @manifest = manifest
      @repo_root = File.join(ROOT, manifest.fetch("source_repo_path"))
    end

    def build
      metadata = Helpers.repository_metadata(@repo_root)
      repo_readme = rewrite_markdown_assets(
        Helpers.maybe_read_text(File.join(@repo_root, "README.md")),
        @repo_root,
        "#{@manifest.fetch('slug')}/project"
      )
      module_candidates = discover_module_candidates
      raise "No displayable modules found in '#{@repo_root}'" if module_candidates.empty?

      built_modules = module_candidates.map { |module_candidate| build_module(module_candidate, metadata) }
      card = build_card(metadata.fetch("source_url"))
      project_data = {
        "project" => card,
        "modules" => built_modules.map { |built_module| built_module.fetch(:module) }
      }

      {
        card: card,
        files: [
          {
            path: File.join(GENERATED_DATA_DIRECTORY, "source_notes", "#{@manifest.fetch('slug')}.json"),
            content: Helpers.pretty_json(project_data) + "\n"
          }
        ],
        assets: repo_readme.fetch(:assets) + built_modules.flat_map { |built_module| built_module.fetch(:assets) }
      }
    end

    private

    def build_card(source_url)
      {
        "slug" => @manifest.fetch("slug"),
        "title" => @manifest.fetch("title"),
        "description" => @manifest.fetch("description"),
        "url" => "",
        "source_url" => source_url
      }
    end

    def discover_module_candidates
      root_candidate = {
        "slug" => "root",
        "title" => "#{@manifest.fetch('title')} Source",
        "absolute_path" => @repo_root,
        "relative_path" => "",
        "roots" => detect_module_roots(@repo_root)
      }

      child_candidates = Dir.children(@repo_root).sort.filter_map do |name|
        full_path = File.join(@repo_root, name)
        next unless File.directory?(full_path)
        next if name.start_with?(".") || IGNORED_DIRECTORY_NAMES.include?(name)

        roots = detect_module_roots(full_path)
        {
          "slug" => slugify_module_name(name),
          "title" => titleize_module_name(name),
          "absolute_path" => full_path,
          "relative_path" => name,
          "roots" => roots
        }
      end

      displayable_children = child_candidates.select { |candidate| !candidate.fetch("roots").empty? }
      return displayable_children unless displayable_children.empty?

      root_candidate.fetch("roots").empty? ? [] : [root_candidate]
    end

    def detect_module_roots(absolute_path)
      SUPPORTED_SOURCE_ROOTS.filter_map do |root|
        root_path = File.join(absolute_path, root.fetch("label"))
        next unless File.directory?(root_path)

        {
          "language" => root.fetch("language"),
          "label" => root.fetch("label"),
          "absolute_path" => root_path
        }
      end
    end

    def build_module(module_candidate, metadata)
      readme = rewrite_markdown_assets(
        Helpers.maybe_read_text(File.join(module_candidate.fetch("absolute_path"), "README.md")),
        module_candidate.fetch("absolute_path"),
        "#{@manifest.fetch('slug')}/#{module_candidate.fetch('slug')}"
      )
      documents = build_module_documents(module_candidate, metadata)
      module_source_url = build_module_source_url(module_candidate, metadata)
      module_record = build_module_record(module_candidate, readme.fetch(:first_image_url), module_source_url, documents)
      module_data = module_record.merge(
        "readme_markdown" => readme.fetch(:markdown),
        "documents" => documents.map { |document| document.fetch(:generated) }
      )

      {
        assets: readme.fetch(:assets),
        module: module_data
      }
    end

    def build_module_documents(module_candidate, metadata)
      module_candidate.fetch("roots").flat_map do |root|
        walk_text_files(root.fetch("absolute_path")).map do |file_path|
          content = Helpers.read_text(file_path)
          build_source_document(
            module_candidate: module_candidate,
            root: root,
            file_path: file_path,
            content: content,
            metadata: metadata
          )
        end
      end
    end

    def walk_text_files(directory)
      Dir.children(directory).sort.flat_map do |name|
        full_path = File.join(directory, name)
        if File.directory?(full_path)
          next [] if name.start_with?(".") || IGNORED_DIRECTORY_NAMES.include?(name)

          walk_text_files(full_path)
        else
          TEXT_FILE_METADATA.key?(File.extname(name).downcase) ? [full_path] : []
        end
      end
    end

    def build_source_document(module_candidate:, root:, file_path:, content:, metadata:)
      relative_to_root = relative_path(root.fetch("absolute_path"), file_path)
      route_path = build_route_path(relative_to_root)
      tree_path = "#{root.fetch('label')}/#{relative_to_root}"
      source_path = relative_path(@repo_root, file_path)
      document_metadata = TEXT_FILE_METADATA[File.extname(file_path).downcase]
      document = {
        "id" => "#{module_candidate.fetch('slug')}:#{tree_path}",
        "project_key" => @manifest.fetch("slug"),
        "module_slug" => module_candidate.fetch("slug"),
        "title" => File.basename(file_path),
        "url" => "#{@manifest.fetch('route_base')}/#{module_candidate.fetch('slug')}/#{route_path}/",
        "tree_path" => tree_path,
        "source_path" => source_path,
        "source_url" => metadata.fetch("source_url").empty? ? "" : "#{metadata.fetch('source_url')}/blob/#{metadata.fetch('branch')}/#{source_path}",
        "language" => document_metadata ? document_metadata.fetch("language") : root.fetch("language"),
        "format" => document_metadata ? document_metadata.fetch("format") : "code",
        "breadcrumbs" => build_document_breadcrumbs(module_candidate.fetch("slug"), module_candidate.fetch("title"), relative_to_root)
      }
      body = build_document_body(content, document_metadata)

      {
        metadata: document,
        generated: document.merge("body" => body)
      }
    end

    def build_document_body(content, metadata)
      return content if metadata.nil? || metadata.fetch("format") == "markdown"

      "~~~#{metadata.fetch('syntax')}\n#{content.rstrip}\n~~~\n"
    end

    def build_document_breadcrumbs(module_slug, module_title, relative_path)
      breadcrumbs = [
        { "label" => @manifest.fetch("title"), "url" => "" },
        { "label" => module_title, "url" => "#{@manifest.fetch('route_base')}/#{module_slug}/" }
      ]

      relative_path.split("/")[0...-1].each do |segment|
        breadcrumbs << { "label" => segment, "url" => "" }
      end

      breadcrumbs
    end

    def build_route_path(relative_path)
      segments = relative_path.split("/")
      segments.each_with_index.map do |segment, index|
        index == segments.length - 1 ? slugify_module_name(File.basename(segment, File.extname(segment))) : slugify_module_name(segment)
      end.reject(&:empty?).join("/")
    end

    def build_module_source_url(module_candidate, metadata)
      return "" if metadata.fetch("source_url").empty?

      if module_candidate.fetch("relative_path").empty?
        "#{metadata.fetch('source_url')}/tree/#{metadata.fetch('branch')}"
      else
        "#{metadata.fetch('source_url')}/tree/#{metadata.fetch('branch')}/#{module_candidate.fetch('relative_path')}"
      end
    end

    def build_module_record(module_candidate, hero_image_url, module_source_url, documents)
      document_entries = documents.map { |document| document.fetch(:metadata) }
      {
        "project_key" => @manifest.fetch("slug"),
        "slug" => module_candidate.fetch("slug"),
        "title" => module_candidate.fetch("title"),
        "url" => "#{@manifest.fetch('route_base')}/#{module_candidate.fetch('slug')}/",
        "source_url" => module_source_url,
        "hero_image_url" => hero_image_url,
        "language_labels" => module_candidate.fetch("roots").map { |root| titleize_module_name(root.fetch("language")) }.uniq,
        "document_count" => document_entries.size,
        "roots" => build_module_roots(module_candidate, document_entries),
        "documents" => document_entries
      }
    end

    def build_module_roots(module_candidate, documents)
      module_candidate.fetch("roots").map do |root|
        prefix = "#{root.fetch('label')}/"
        entries = documents
          .select { |document| document.fetch("tree_path").start_with?(prefix) }
          .map do |document|
            {
              relative_path: document.fetch("tree_path").delete_prefix(prefix),
              url: document.fetch("url")
            }
          end

        {
          "label" => root.fetch("label"),
          "tree_path" => prefix,
          "nodes" => build_file_tree(root.fetch("label"), entries)
        }
      end
    end

    def build_file_tree(root_label, entries)
      root = []

      entries.each do |entry|
        segments = entry.fetch(:relative_path).split("/").reject(&:empty?)
        cursor = root
        segments.each_with_index do |segment, index|
          tree_path = "#{root_label}/#{segments[0..index].join('/')}"
          existing = cursor.find { |node| node.fetch("title") == segment && node.fetch("tree_path") == tree_path }
          if existing
            cursor = existing.fetch("children")
            next
          end

          is_leaf = index == segments.length - 1
          node = {
            "kind" => is_leaf ? "file" : "directory",
            "title" => segment,
            "tree_path" => tree_path,
            "url" => is_leaf ? entry.fetch(:url) : "",
            "children" => []
          }
          cursor << node
          cursor = node.fetch("children")
        end
      end

      sort_tree_nodes(root)
      root
    end

    def sort_tree_nodes(nodes)
      nodes.sort_by! { |node| [node.fetch("kind") == "directory" ? 0 : 1, node.fetch("title").downcase] }
      nodes.each { |node| sort_tree_nodes(node.fetch("children")) }
    end

    def rewrite_markdown_assets(markdown, base_directory, asset_scope)
      seen = {}
      assets = []
      first_image_url = ""

      markdown.to_enum(:scan, MARKDOWN_IMAGE_PATTERN).map { Regexp.last_match }.each do |match|
        raw_reference = match[2].to_s
        clean_reference = sanitize_asset_path(raw_reference)
        next if clean_reference.empty? || clean_reference.start_with?("http://", "https://", "/")
        next if seen.key?(clean_reference)

        source_path = File.expand_path(clean_reference, base_directory)
        next unless File.exist?(source_path)

        target_path = File.join(SITE_SOURCE, "assets", "generated", asset_scope, sanitize_asset_target_path(clean_reference))
        public_url = "/#{Pathname.new(target_path).relative_path_from(Pathname.new(SITE_SOURCE)).to_s.tr(File::SEPARATOR, '/')}"
        seen[clean_reference] = public_url
        assets << { source_path: source_path, target_path: target_path }
        first_image_url = public_url if first_image_url.empty?
      end

      rewritten = markdown.dup
      seen.each do |reference, public_url|
        rewritten.gsub!("](#{reference})", "](#{public_url})")
        rewritten.gsub!("](<#{reference}>)", "](#{public_url})")
      end

      {
        markdown: rewritten.strip,
        assets: assets,
        first_image_url: first_image_url
      }
    end

    def sanitize_asset_path(raw_path)
      raw_path.gsub(/\A<|>\z/, "").split(/\s+/).first.to_s
    end

    def sanitize_asset_target_path(asset_path)
      normalized = asset_path.split("/").reject { |segment| segment.empty? || segment == "." || segment == ".." }.join("/")
      normalized.empty? ? File.basename(asset_path) : normalized
    end

    def relative_path(from_path, to_path)
      Pathname.new(to_path).relative_path_from(Pathname.new(from_path)).to_s.tr(File::SEPARATOR, "/")
    end

    def slugify_module_name(value)
      value
        .gsub(/([a-z0-9])([A-Z])/, '\1-\2')
        .gsub(/[_\s]+/, "-")
        .gsub(/[^a-zA-Z0-9-]/, "-")
        .downcase
        .gsub(/-+/, "-")
        .gsub(/\A-|-?\z/, "")
    end

    def titleize_module_name(value)
      value
        .gsub(/([a-z0-9])([A-Z])/, '\1 \2')
        .tr("_-", " ")
        .split(/\s+/)
        .reject(&:empty?)
        .map { |part| part[0] ? part[0].upcase + part[1..] : part }
        .join(" ")
    end
  end

  class Runner
    def run
      Helpers.clear_generated_outputs
      manifests = ManifestRepository.new.load
      builds = manifests.filter_map { |manifest| build_project(manifest) }
      generated_paths = write_outputs(builds)
      Helpers.write_generated_manifest(generated_paths)
    end

    private

    def build_project(manifest)
      source_path = File.join(ROOT, manifest.fetch("source_repo_path"))
      return nil if !File.exist?(source_path) && manifest["source_optional"]
      raise "Project '#{manifest.fetch('slug')}' source is missing at '#{source_path}'" unless File.exist?(source_path)

      case manifest.fetch("kind")
      when "eureka"
        EurekaBuilder.new(manifest).build
      when "source-notes"
        SourceNotesBuilder.new(manifest).build
      else
        raise "Unsupported project kind '#{manifest.fetch('kind')}'"
      end
    end

    def write_outputs(builds)
      project_cards = builds.map { |build| build.fetch(:card) }
      files = builds.flat_map { |build| build.fetch(:files) }
      assets = builds.flat_map { |build| build.fetch(:assets) }
      projects_data_path = File.join(GENERATED_DATA_DIRECTORY, "projects.json")
      Helpers.write_text(projects_data_path, Helpers.pretty_json(project_cards) + "\n")
      files.each { |file| Helpers.write_text(file.fetch(:path), file.fetch(:content)) }
      assets.each { |asset| Helpers.copy_file(asset.fetch(:source_path), asset.fetch(:target_path)) }
      files.map { |file| file.fetch(:path) } + assets.map { |asset| asset.fetch(:target_path) } + [projects_data_path]
    end
  end
end

RefreshData::Runner.new.run
