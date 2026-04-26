# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitAlgorithmicTemplateRepositoryTest < SiteKitTestCase
  def test_loads_templates_from_algorithmic_topics
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }

    assert template
    assert_equal 'Binary Search', template.title
    assert_equal ['Binary Search'], template.aliases
  end

  def test_rejects_duplicate_topic_ids
    topics = [
      { 'id' => 'binary-search', 'label' => 'Binary Search', 'kind' => 'algorithm', 'order' => 1,
        'description' => 'Search sorted data.', 'aliases' => [] },
      { 'id' => 'binary-search', 'label' => 'Boundary Search', 'kind' => 'algorithm', 'order' => 2,
        'description' => 'Find a boundary.', 'aliases' => [] }
    ]

    error = assert_raises(RuntimeError) do
      SiteKit::AlgorithmicTopicRepository.new(
        topics: topics,
        flowchart_data: { 'nodes' => [] }
      ).load
    end

    assert_match(/Algorithmic topic ids must be unique: binary-search/, error.message)
  end
end
