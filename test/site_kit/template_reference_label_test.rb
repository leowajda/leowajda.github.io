# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitTemplateReferenceLabelTest < SiteKitTestCase
  def test_formats_pattern_label
    label = SiteKit::TemplateReferenceLabel.call(pattern: { 'label' => 'Graph' })

    assert_equal 'Graph', label
  end

  def test_formats_pattern_label_parts
    parts = SiteKit::TemplateReferenceLabel.parts(pattern: { 'label' => 'Graph' })

    assert_equal({ 'child' => 'Graph' }, parts)
  end

  def test_formats_pattern_and_variant_without_visual_separator
    label = SiteKit::TemplateReferenceLabel.call(
      pattern: { 'label' => 'Graph' },
      variant: { 'label' => 'BFS' }
    )

    assert_equal 'Graph BFS', label
    refute_includes label, '/'
  end

  def test_formats_variant_label_parts
    parts = SiteKit::TemplateReferenceLabel.parts(
      pattern: { 'label' => 'Graph' },
      variant: { 'label' => 'BFS' }
    )

    assert_equal({ 'parent' => 'Graph', 'child' => 'BFS' }, parts)
  end

  def test_strips_configured_whitespace
    label = SiteKit::TemplateReferenceLabel.call(
      pattern: { 'label' => ' Tree ' },
      variant: { 'label' => ' DFS ' }
    )

    assert_equal 'Tree DFS', label
  end
end
