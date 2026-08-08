# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitPluginGenerationTest < SiteKitTestCase
  def test_generators_publish_named_registries_and_pages
    site = generated_site
    home_page = site.pages.find { |page| page.url == '/' }
    explorer_page = site.pages.find { |page| page.url == '/eureka/problems/' }
    templates_page = site.pages.find { |page| page.url == '/templates/' }

    refute site.data.key?('source_notes')
    refute site.data.fetch('site').key?('projects')
    assert(home_page.data['home_projects'].any? { |project| project.fetch('slug') == 'eureka' })
    assert explorer_page.data['explorer']
    assert_predicate explorer_page.data['explorer'].fetch('problems'), :any?
    assert_predicate explorer_page.data['explorer'].fetch('filters').fetch('languages'), :any?
    assert(site.pages.any? { |page| page.url == '/eureka/problems/binary-search/' })
    assert(site.pages.any? { |page| page.url == '/eureka/problems/binary-search/embed/' })
    assert(site.pages.any? { |page| page.url == '/zibaldone/' })
    assert templates_page.data['template_guide']
    refute(site.pages.any? { |page| page.url == '/eureka/flowchart/' })
  end

  def test_pagefind_extras_cover_template_hash_targets
    records = build_context.search_records
    urls = records.map(&:url)

    assert(records.any? { |record| record.meta.fetch('kind') == 'Template' })
    refute(records.any? { |record| record.meta.fetch('kind') == 'Flowchart' })
    assert(urls.any? { |url| url.start_with?('/templates/#') })
    refute(urls.any? { |url| url.start_with?('/eureka/flowchart/#') })
    refute(urls.any? { |url| url.include?('/embed/') })
  end
end
