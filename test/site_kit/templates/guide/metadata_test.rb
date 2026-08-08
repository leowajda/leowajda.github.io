# frozen_string_literal: true

require_relative '../../../test_helper'

class SiteKitTemplateGuideMetadataTest < SiteKitTestCase
  def test_template_metadata_can_be_explicitly_suppressed_by_guide_variant
    guide = build_context.templates.guide
    stack = guide.fetch('patterns')
                 .find { |pattern| pattern.fetch('id') == 'stack' }
                 .fetch('variants')
                 .find { |variant| variant.fetch('id') == 'parse' }

    assert_empty stack.fetch('aliases')
    assert_empty stack.fetch('problem_rules')
    refute stack.key?('flowchart_nodes')
  end
end
