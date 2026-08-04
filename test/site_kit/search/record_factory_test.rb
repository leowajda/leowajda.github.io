# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitSearchRecordFactoryTest < SiteKitTestCase
  def test_plain_text_cleanup_preserves_code_like_tokens
    factory = SiteKit::Search::RecordFactory.new

    text = factory.clean_text(['#include <vector>', 'List<Integer>', 'if (left < right)'])

    assert_includes text, '#include <vector>'
    assert_includes text, 'List<Integer>'
    assert_includes text, 'left < right'
  end

  def test_html_cleanup_strips_markup_when_requested
    factory = SiteKit::Search::RecordFactory.new

    assert_equal 'Use BFS for grids.', factory.clean_html('<p>Use <strong>BFS</strong> for grids.</p>')
  end

  def test_records_validate_pagefind_custom_record_shape
    record = SiteKit::Search::Record.new(
      url: '/broken/',
      content: 'Broken',
      language: 'en',
      meta: { 'title' => 'Broken' },
      filters: { 'kind' => 'Problem' },
      sort: { 'priority' => '10' }
    )

    error = assert_raises(SiteKit::Error) do
      record.to_h
    end

    assert_match(/filter values must be arrays of strings/, error.message)
  end
end
