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
end
