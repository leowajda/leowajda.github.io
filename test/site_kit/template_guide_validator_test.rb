# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitTemplateGuideValidatorTest < SiteKitTestCase
  def test_rejects_visual_separator_in_human_facing_labels
    guide = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    guide.fetch('patterns')
         .find { |pattern| pattern.fetch('id') == 'graph' }
         .fetch('variants')
         .find { |variant| variant.fetch('id') == 'bfs' }['label'] = 'Graph / BFS'

    error = assert_raises(RuntimeError) do
      SiteKit::TemplateGuideRepository.new(
        data: guide,
        templates: build_context.template_library_context.templates,
        code_collections: build_context.template_library_context.code_collections,
        flowchart_data: build_context.flowchart_data
      ).build
    end

    assert_match(%r{Human-facing labels must not use ' / '}, error.message)
  end

  def test_rejects_multiple_template_targets_for_one_flowchart_solution_node
    guide = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    guide.fetch('patterns')
         .find { |pattern| pattern.fetch('id') == 'grid' }
         .fetch('variants')
         .find { |variant| variant.fetch('id') == 'bfs' }
         .fetch('flowchart_nodes') << 'shortest-path-graph-bfs'

    error = assert_raises(RuntimeError) do
      SiteKit::TemplateGuideRepository.new(
        data: guide,
        templates: build_context.template_library_context.templates,
        code_collections: build_context.template_library_context.code_collections,
        flowchart_data: build_context.flowchart_data
      ).build
    end

    assert_match(/Flowchart solution nodes must map to one template guide target: shortest-path-graph-bfs/,
                 error.message)
  end

  def test_guide_variants_do_not_expose_stale_navigation_flags
    guide = build_context.template_library_context.guide
    variants = guide.fetch('patterns').flat_map { |pattern| pattern.fetch('variants') }

    refute(variants.any? { |variant| variant.key?('navigation_visible') })
  end
end
