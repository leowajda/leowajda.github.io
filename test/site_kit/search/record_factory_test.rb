# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitSearchExtrasTest < SiteKitTestCase
  def test_plain_text_cleanup_preserves_code_like_tokens
    text = SiteKit::Extras::Pagefind.clean_text(['#include <vector>', 'List<Integer>', 'if (left < right)'])

    assert_includes text, '#include <vector>'
    assert_includes text, 'List<Integer>'
    assert_includes text, 'left < right'
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
