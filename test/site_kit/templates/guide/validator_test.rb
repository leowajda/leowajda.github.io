# frozen_string_literal: true

require_relative '../../../test_helper'

class SiteKitTemplateGuideValidatorTest < SiteKitTestCase
  def test_rejects_visual_separator_in_human_facing_labels
    guide = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    guide.fetch('patterns')
         .find { |pattern| pattern.fetch('id') == 'graph' }
         .fetch('variants')
         .find { |variant| variant.fetch('id') == 'bfs' }['label'] = 'Graph / BFS'

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::Guide::Repository.new(
        data: guide,
        templates: build_context.templates.templates,
        code_collections: build_context.templates.code_collections
      ).build
    end

    assert_match(%r{Human-facing labels must not use ' / '}, error.message)
  end

  def test_guide_variants_do_not_expose_stale_navigation_flags
    guide = build_context.templates.guide
    variants = guide.fetch('patterns').flat_map { |pattern| pattern.fetch('variants') }

    refute(variants.any? { |variant| variant.key?('navigation_visible') })
    refute(variants.any? { |variant| variant.key?('flowchart_nodes') })
  end
end
