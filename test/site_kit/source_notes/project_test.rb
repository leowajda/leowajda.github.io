# frozen_string_literal: true

require 'pathname'
require_relative '../../test_helper'

class SiteKitSourceNotesProjectTest < SiteKitTestCase
  def test_builds_registry_and_generates_resolved_pages
    project = build_context.source_notes_context.projects.fetch('zibaldone')
    registry = project.registry_record
    scala = registry.fetch('languages').find { |language| language.fetch('language_slug') == 'scala' }
    cats_effect = scala.fetch('modules').find { |module_record| module_record.fetch('module_slug') == 'cats-effect' }
    language_page = project.generated_language_pages.find { |page| page[:dir] == '/zibaldone/scala/' }
    module_page = project.generated_module_pages.find { |page| page[:dir] == cats_effect.fetch('url') }
    document_page = project.generated_document_pages.first

    assert_match %r{https://raw\.githubusercontent\.com/.+/scala/cats-effect/cats-effect\.png}, cats_effect.fetch('readme_markdown')
    refute_includes cats_effect.fetch('readme_markdown'), '/sources/zibaldone/'
    refute_includes cats_effect.fetch('readme_markdown'), '/assets/generated/'
    assert_predicate cats_effect.fetch('documents'), :any?
    assert_equal scala.fetch('modules').first.fetch('url'), language_page.dig(:data, 'redirect_to')
    assert module_page
    assert document_page
    assert_instance_of SiteKit::Pages::Definition, module_page
    assert_instance_of SiteKit::Pages::Definition, document_page
    assert_equal 'cats-effect', module_page.dig(:data, 'source_module', 'module_slug')
    assert_equal 'Scala', module_page.dig(:data, 'source_header', 'eyebrow')
    assert_equal %w[about breadcrumbs], module_page.dig(:data, 'source_schema').keys
    assert_equal %w[slug module_slug title url roots], document_page.dig(:data, 'source_module').keys
    assert_equal document_page[:data]['document_url'], document_page.dig(:data, 'source_document', 'route_url')
    assert_equal %w[about breadcrumbs code_repository programming_language], document_page.dig(:data, 'source_schema').keys
    assert_equal '', module_page[:content].to_s
  end

  def test_source_note_traversal_rejects_symlinks_that_escape_the_source_root
    Dir.mktmpdir do |directory|
      repo = Pathname(directory).join('repo')
      external = Pathname(directory).join('external')
      source_root = repo.join('scala', 'module', 'src')
      FileUtils.mkdir_p(source_root)
      FileUtils.mkdir_p(external)
      File.write(external.join('Escape.md'), '# Escape')
      File.symlink(external, source_root.join('escape'))

      builder = SiteKit::SourceNotes::ModuleBuilder.new(
        app_config: build_context.app_config,
        manifest: Struct.new(:source_url, keyword_init: true).new(source_url: 'https://example.test/repo'),
        source_url_base: 'https://example.test/repo/blob/main',
        repo_root: repo
      )
      module_definition = SiteKit::SourceNotes::ModuleDefinition.new(
        slug: 'module',
        title: 'Module',
        path: 'scala/module',
        source_roots: ['src']
      )

      error = assert_raises(SiteKit::SourceError) do
        builder.build(
          module_definition: module_definition,
          language_context: language_context
        )
      end

      assert_match(/escapes the source root/, error.message)
    end
  end

  private

  def language_context
    {
      'project_slug' => 'notes',
      'project_title' => 'Notes',
      'project_url' => '',
      'project_source_url' => 'https://example.test/repo',
      'language_slug' => 'scala',
      'language_title' => 'Scala',
      'language_url' => '/notes/scala/'
    }
  end
end
