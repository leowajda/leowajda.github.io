# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitSearchIndexBuilderTest < SiteKitTestCase
  EXPECTED_KINDS = %w[Flowchart Page Problem Source Template Writing].freeze

  def test_builds_structured_pagefind_records
    records = search_records
    problem = record_by_title('Sliding Puzzle')
    template = record_by_title('Grid BFS')
    flowchart = records.find { |record| record.meta.fetch('kind') == 'Flowchart' }
    source = records.find { |record| record.meta.fetch('kind') == 'Source' }

    assert_operator records.size, :>, 100
    assert_equal 'Problem', problem.meta.fetch('kind')
    assert_includes problem.filters.fetch('category'), 'Dynamic Programming'
    assert_includes problem.filters.fetch('template'), 'Grid BFS'
    assert_equal '/writing/algorithmic-templates/#grid/bfs', template.url
    assert_equal 'grid/bfs', template.meta.fetch('target')
    assert_equal 'Grid', template.meta.fetch('section')
    assert flowchart
    assert_includes %w[Decision Solution], flowchart.meta.fetch('section')
    assert source
  end

  def test_search_records_have_required_pagefind_fields
    search_records.each do |record|
      assert_match(%r{\A/}, record.url)
      refute_empty record.content
      assert_equal 'en', record.language
      refute_empty record.meta.fetch('title')
      assert_includes EXPECTED_KINDS, record.meta.fetch('kind')
      assert_includes record.filters.fetch('kind'), record.meta.fetch('kind')
      assert_match(/\A\d+\z/, record.sort.fetch('priority'))
    end
  end

  def test_search_index_size_stays_bounded
    assert_operator search_records.size, :>=, 400
    assert_operator search_records.size, :<=, 800
    assert(search_records.all? { |record| record.content.length <= SiteKit::Search::RecordFactory::MAX_CONTENT_LENGTH })
  end

  def test_search_records_do_not_duplicate_the_same_result
    duplicates = search_records
                 .group_by { |record| [record.url, record.meta.fetch('title')] }
                 .select { |_, records| records.size > 1 }

    assert_empty duplicates
  end

  def test_duplicate_flowchart_titles_include_route_context
    grid_bfs_records = search_records.select do |record|
      record.meta.fetch('kind') == 'Flowchart' && record.meta.fetch('title') == 'Grid BFS'
    end

    assert_equal 2, grid_bfs_records.size
    assert_equal(
      ['Small constraints / Solution', 'Unweighted shortest paths / Solution'],
      grid_bfs_records.map { |record| record.meta.fetch('section') }.sort
    )
  end

  def test_duplicate_source_titles_include_module_context
    records = search_records.select do |record|
      record.meta.fetch('kind') == 'Source' && record.meta.fetch('title') == 'FsCommands.java'
    end

    assert_operator records.size, :>, 1
    assert(records.all? { |record| record.meta.fetch('section', '').include?('Spring Boot') })
    assert_equal records.size, records.map { |record| record.meta.fetch('section') }.uniq.size
  end

  def test_search_record_urls_point_to_rendered_pages
    routes = rendered_routes

    search_records.each do |record|
      route = record.url.split('#', 2).first

      assert_includes routes, route, "Search record points to missing page: #{record.url}"
    end
  end

  def test_search_records_do_not_index_embed_pages
    refute(search_records.any? { |record| record.url.include?('/embed/') })
  end

  private

  def search_records
    @search_records ||= SiteKit::Search::IndexBuilder.new(context: build_context, site: build_site).records
  end

  def record_by_title(title)
    search_records.find { |record| record.meta.fetch('title') == title }
  end

  def rendered_routes
    @rendered_routes ||= begin
      site = generated_site
      page_urls = site.pages.map(&:url)
      document_urls = site.collections.values.flat_map { |collection| collection.docs.map(&:url) }

      (page_urls + document_urls).to_set
    end
  end
end
