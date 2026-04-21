# frozen_string_literal: true

require_relative "../test_helper"

class SiteKitSourceNotesProjectTest < SiteKitTestCase
  def test_builds_registry_and_generates_resolved_pages
    project = build_context.source_notes_context.projects.fetch("zibaldone")
    registry = project.registry_record
    scala = registry.fetch("languages").find { |language| language.fetch("language_slug") == "scala" }
    cats_effect = scala.fetch("modules").find { |module_record| module_record.fetch("module_slug") == "cats-effect" }
    module_page = project.generated_module_pages.find { |page| page[:dir] == cats_effect.fetch("url") }
    document_page = project.generated_document_pages.first

    assert_match %r{https://raw\.githubusercontent\.com/.+/scala/cats-effect/cats-effect\.png}, cats_effect.fetch("readme_markdown")
    refute_includes cats_effect.fetch("readme_markdown"), "/sources/zibaldone/"
    refute_includes cats_effect.fetch("readme_markdown"), "/assets/generated/"
    assert cats_effect.fetch("documents").any?
    assert module_page
    assert document_page
    assert_instance_of SiteKit::PageDefinition, module_page
    assert_instance_of SiteKit::PageDefinition, document_page
    assert_equal "cats-effect", module_page.dig(:data, "source_module", "module_slug")
    assert_equal "Scala", module_page.dig(:data, "source_header", "eyebrow")
    assert_equal %w[about breadcrumbs], module_page.dig(:data, "source_schema").keys
    assert_equal %w[slug module_slug title url roots], document_page.dig(:data, "source_module").keys
    assert_equal document_page[:data]["document_url"], document_page.dig(:data, "source_document", "route_url")
    assert_equal %w[about breadcrumbs code_repository programming_language], document_page.dig(:data, "source_schema").keys
    assert_equal "", module_page[:content].to_s
  end
end
