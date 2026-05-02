# frozen_string_literal: true

require_relative '../../../test_helper'

class SiteKitTemplateGuideMetadataTest < SiteKitTestCase
  def test_template_metadata_is_inherited_when_guide_variant_omits_it
    data = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    dijkstra = data.fetch('patterns')
                   .find { |pattern| pattern.fetch('id') == 'graph' }
                   .fetch('variants')
                   .find { |variant| variant.fetch('id') == 'dijkstra' }
    dijkstra.delete('flowchart_nodes')

    guide = SiteKit::Templates::Guide::Repository.new(
      data: data,
      templates: build_context.template_library_context.templates,
      code_collections: build_context.template_library_context.code_collections,
      flowchart_data: build_context.flowchart_data
    ).build

    targets = guide.dig('flowchart_nodes', 'shortest-path-dijkstra').map { |entry| entry.fetch('target') }

    assert_equal ['graph/dijkstra'], targets
  end

  def test_template_metadata_can_be_explicitly_suppressed_by_guide_variant
    guide = build_context.template_library_context.guide
    stack = guide.fetch('patterns')
                 .find { |pattern| pattern.fetch('id') == 'stack' }
                 .fetch('variants')
                 .find { |variant| variant.fetch('id') == 'parse' }

    assert_empty stack.fetch('aliases')
    assert_empty stack.fetch('problem_rules')
    assert_equal ['parse-symbols-stack'], stack.fetch('flowchart_nodes')
  end
end
