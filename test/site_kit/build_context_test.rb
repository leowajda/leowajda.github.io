# frozen_string_literal: true

require_relative "../test_helper"

class SiteKitBuildContextTest < SiteKitTestCase
  def test_exposes_app_config_and_grouped_templates
    eureka_context = build_context.eureka_context
    source_notes_context = build_context.source_notes_context
    template_library = build_context.template_library_context

    assert_equal 2, build_context.app_config.eureka.catalog_version
    assert_equal 1, build_context.app_config.source_notes.catalog_version
    assert_equal "iterative", build_context.app_config.code_collection.variant_icons.fetch("iterative")
    assert_equal "/eureka/problems/", build_context.site_projects.find { |project| project.fetch("slug") == "eureka" }.fetch("home_url")
    assert build_context.site_projects.find { |project| project.fetch("slug") == "zibaldone" }.fetch("home_url").start_with?("/zibaldone/")
    assert eureka_context.browsers.fetch("eureka")
    assert eureka_context.topics.fetch("eureka")
    assert source_notes_context.registries.fetch("zibaldone")
    assert build_context.site_projects.find { |project| project.fetch("slug") == "zibaldone" }.fetch("home_groups").any?
    assert template_library.templates.any? { |template| template.template_id == "binary-search" }
    assert template_library.code_collections.fetch("binary-search")
    assert template_library.groups.any? { |group| group.fetch("templates").any? { |template| template.fetch("template_id") == "binary-search" } }
    assert eureka_context.flowcharts.fetch("eureka")
  end

  def test_injects_context_into_authored_pages
    home_page = generated_site.pages.find { |page| page.url == "/" }
    explorer_page = generated_site.pages.find { |page| page.url == "/eureka/problems/" }
    flowchart_page = generated_site.collections.fetch("posts").docs.find { |page| page.url == "/writing/algorithmic-flowchart/" }
    templates_page = generated_site.collections.fetch("posts").docs.find { |page| page.url == "/writing/algorithmic-templates/" }

    assert home_page.data["home_projects"]
    assert explorer_page.data["browser_record"]
    assert explorer_page.data["header_links"].any?
    assert explorer_page.data["problem_filter_panel"]
    assert explorer_page.data["problem_table"].fetch("rows").any?
    assert flowchart_page.data["flowchart_canvas"]
    assert flowchart_page.data["header_links"].any?
    assert flowchart_page.data["flowchart_canvas"].fetch("node_payloads").any?
    refute flowchart_page.data["flowchart_canvas"].key?("topic_registry")
    refute flowchart_page.data["flowchart_canvas"].key?("flowchart_summaries")
    assert templates_page.data["template_groups"]
    assert templates_page.data["header_links"].any?
  end
end
