# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitSearchIndexBuilderTest < SiteKitTestCase
  EXPECTED_KINDS = %w[Flowchart Template].freeze
  RECORD_CONTRACTS = {
    'Flowchart' => {
      meta: %w[kind project section summary target title],
      filters: %w[flowchart_kind kind project]
    },
    'Template' => {
      meta: %w[kind pattern project section summary target title],
      filters: %w[kind project template]
    }
  }.freeze

  def test_builds_hash_target_extras_only
    records = search_records
    template = record_by_title('Grid BFS')
    flowchart = records.find { |record| record.meta.fetch('kind') == 'Flowchart' }

    assert_operator records.size, :>, 50
    assert_operator records.size, :<, 400
    assert_equal '/templates/#grid/bfs', template.url
    assert_equal 'grid/bfs', template.meta.fetch('target')
    assert_equal 'Grid', template.meta.fetch('section')
    assert flowchart
    assert_includes %w[Decision Solution], flowchart.meta.fetch('section')
    refute(records.any? { |record| record.meta.fetch('kind') == 'Problem' })
  end

  def test_search_records_have_required_pagefind_fields
    search_records.each do |record|
      assert_match(%r{\A/}, record.url)
      refute_predicate record.content.to_s.strip, :empty?
      assert_equal 'en', record.language
      assert_equal record.meta.fetch('kind'), record.filters.fetch('kind').first
      assert_match(/\A\d+\z/, record.sort.fetch('priority'))
    end
  end

  def test_search_records_keep_kind_specific_pagefind_contracts
    records_by_kind = search_records.group_by { |record| record.meta.fetch('kind') }

    assert_equal EXPECTED_KINDS.sort, records_by_kind.keys.sort

    SiteKit::Search::Contract::ENTRIES.each do |kind, contract|
      records_by_kind.fetch(kind).each do |record|
        assert_equal contract.fetch(:meta_keys), record.meta.keys.sort, "#{kind} meta keys changed for #{record.url}"
        assert_equal contract.fetch(:filter_keys), record.filters.keys.sort, "#{kind} filter keys changed for #{record.url}"
      end
    end
  end

  def test_search_records_do_not_duplicate_the_same_result
    duplicates = search_records
                 .group_by { |record| [record.url, record.meta.fetch('title')] }
                 .select { |_, records| records.size > 1 }

    assert_empty duplicates
  end

  def test_flowchart_records_use_canonical_node_text_as_result_title
    record = search_records.find { |entry| entry.url == '/eureka/flowchart/#kth-smallest' }

    assert record
    assert_includes record.meta.fetch('title').downcase, 'smallest'
  end

  def test_extras_do_not_index_embed_pages
    refute(search_records.any? { |record| record.url.include?('/embed/') })
  end

  private

  def search_records
    @search_records ||= build_context.search_records
  end

  def record_by_title(title)
    search_records.find { |record| record.meta.fetch('title') == title }
  end
end
