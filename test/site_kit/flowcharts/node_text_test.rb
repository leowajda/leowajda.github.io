# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitFlowchartNodeTextTest < SiteKitTestCase
  def test_layout_builder_uses_canonical_node_text_for_generated_copy
    node = build_context.flowchart_data.fetch('nodes').find { |entry| entry.fetch('id') == 'kth-smallest' }

    assert_equal 'Need the $k$th smallest or largest?', node.fetch('text')
    assert_equal 'Need the $k$th smallest or largest?', node.fetch('canvas_text')
    assert_equal 'Need the $k$th smallest or largest?', node.fetch('search_title')
    refute node.key?('title')
    refute node.key?('label')
  end

  def test_layout_builder_rejects_legacy_node_text_keys
    error = assert_raises(SiteKit::Error) do
      SiteKit::Flowcharts::LayoutBuilder.new(flowchart_data: flowchart_with_node('label' => 'A')).build
    end

    assert_match(/uses legacy text keys: label/, error.message)
  end

  def test_layout_builder_rejects_non_question_decisions
    error = assert_raises(SiteKit::Error) do
      SiteKit::Flowcharts::LayoutBuilder.new(flowchart_data: flowchart_with_node('text' => 'A')).build
    end

    assert_match(/decision 'a' text must be phrased as a question/, error.message)
  end

  def test_layout_builder_rejects_question_solutions
    error = assert_raises(SiteKit::Error) do
      SiteKit::Flowcharts::LayoutBuilder.new(
        flowchart_data: flowchart_with_node('kind' => 'solution', 'text' => 'A?')
      ).build
    end

    assert_match(/solution 'a' text must not be phrased as a question/, error.message)
  end

  private

  def flowchart_with_node(overrides)
    {
      'chart' => { 'width' => 100 },
      'nodes' => [
        {
          'id' => 'a',
          'kind' => 'decision',
          'text' => 'A?',
          'layout' => { 'column' => 'main', 'row' => 0 }
        }.merge(overrides)
      ],
      'edges' => []
    }
  end
end
