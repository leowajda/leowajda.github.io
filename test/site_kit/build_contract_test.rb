# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitBuildContractTest < SiteKitTestCase
  def test_pages_use_flat_entries_and_unique_routes
    build = build_context
    pages = build.pages
    routes = pages.map { |page| page[:dir] }

    assert_operator pages.size, :>, 100
    assert_equal routes, routes.uniq

    problem = pages.find { |page| page[:dir] == '/eureka/problems/binary-search/' }
    embed = pages.find { |page| page[:dir] == '/eureka/problems/binary-search/embed/' }
    template_embed = pages.find { |page| page[:dir] == '/templates/binary-search/embed/' }

    assert problem
    assert embed
    assert template_embed

    entries = problem.fetch(:data).fetch('entries')

    assert_operator entries.size, :>=, 1
    entry = entries.first

    %w[entry_id language language_label variant variant_label code code_language].each do |key|
      assert entry.key?(key), "missing #{key}"
    end
    refute entry.key?('approach')
    assert_equal entries, problem.dig(:data, 'problem_record', 'entries')
    assert embed.fetch(:data).fetch('embed')
    assert template_embed.fetch(:data).fetch('entries').first.key?('embed_url')
  end

  def test_explorer_and_guide_shapes
    build = build_context
    explorer = build.eureka.explorers.fetch('eureka')
    guide = build.templates.guide

    assert_predicate explorer.fetch('problems'), :any?
    assert_predicate explorer.fetch('filters').fetch('languages'), :any?
    refute explorer.fetch('filters').key?('patterns')

    assert_predicate guide.fetch('patterns'), :any?
    assert_predicate guide.fetch('template_panels'), :any?
    assert guide.fetch('default_target')
    assert guide.fetch('redirects').fetch('binary-search')
  end

  def test_search_extras_are_template_hash_targets_only
    records = build_context.search_extras

    assert(records.any? { |record| record.meta.fetch('kind') == 'Template' })
    refute(records.any? { |record| record.meta.fetch('kind') == 'Flowchart' })
    assert(records.all? { |record| record.url.include?('#') })
    refute(records.any? { |record| record.url.include?('/embed/') })
  end

  def test_attach_sets_explorer_on_problems_page
    site = generated_site
    page = site.pages.find { |document| document.url == '/eureka/problems/' }

    assert page.data['explorer']
    assert_predicate page.data['explorer'].fetch('problems'), :any?
  end

  def test_template_panels_expose_entries
    panel = build_context.templates.guide.fetch('template_panels').first

    assert panel.fetch('target')
    assert_predicate panel.fetch('entries'), :any?
    entry = panel.fetch('entries').first

    assert entry.fetch('entry_id')
    assert_includes entry.fetch('embed_url'), '/embed/'
  end

  def test_source_code_pages_expose_entries_and_embeds
    pages = build_context.pages
    code_doc = pages.find do |page|
      page[:page_type] == 'source_document_page' && Array(page.dig(:data, 'entries')).any?
    end

    assert code_doc, 'expected a source code document page'

    entries = code_doc.fetch(:data).fetch('entries')

    assert_equal 1, entries.size
    assert entries.first.fetch('code_language')

    embed_dir = code_doc.fetch(:data).fetch('source_document').fetch('embed_url')
    embed = pages.find { |page| page[:dir] == embed_dir }

    assert embed
    assert embed.fetch(:data).fetch('embed')
    assert_equal(entries.map { |e| e.fetch('entry_id') },
                 embed.fetch(:data).fetch('entries').map { |e| e.fetch('entry_id') })
  end
end
