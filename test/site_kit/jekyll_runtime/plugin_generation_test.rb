# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitPluginGenerationTest < SiteKitTestCase
  def test_generators_publish_named_registries_and_pages
    site = generated_site
    home_page = site.pages.find { |page| page.url == '/' }
    explorer_page = site.pages.find { |page| page.url == '/eureka/problems/' }
    templates_page = site.pages.find { |page| page.url == '/templates/' }
    flowchart_page = site.pages.find { |page| page.url == '/eureka/flowchart/' }

    refute site.data.key?('source_notes')
    refute site.data.fetch('site').key?('projects')
    assert(home_page.data['home_projects'].any? { |project| project.fetch('slug') == 'eureka' })
    assert explorer_page.data['browser_record']
    assert_predicate explorer_page.data['header_links'], :any?
    assert_predicate explorer_page.data['browser_record'].fetch('problems'), :any?
    assert_predicate explorer_page.data['browser_record'].fetch('filters').fetch('languages'), :any?
    assert(site.pages.any? { |page| page.url == '/eureka/problems/binary-search/' })
    assert(site.pages.any? { |page| page.url == '/eureka/problems/binary-search/embed/' })
    assert(site.pages.any? { |page| page.url == '/zibaldone/' })
    assert templates_page.data['template_guide']
    assert flowchart_page.data['flowchart_canvas']
  end

  def test_pagefind_extras_cover_template_and_flowchart_hash_targets
    records = build_context.search_records
    urls = records.map(&:url)

    assert(records.any? { |record| record.meta.fetch('kind') == 'Template' })
    assert(records.any? { |record| record.meta.fetch('kind') == 'Flowchart' })
    assert(urls.any? { |url| url.start_with?('/templates/#') })
    assert(urls.any? { |url| url.start_with?('/eureka/flowchart/#') })
    refute(urls.any? { |url| url.include?('/embed/') })
  end
end
