# frozen_string_literal: true

require_relative '../../../test_helper'

class SiteKitTemplateGuideRepositoryTest < SiteKitTestCase
  def test_builds_flat_major_patterns_with_redirects
    guide = build_context.template_library_context.guide
    pattern_labels = guide.fetch('patterns').map { |pattern| pattern.fetch('label') }

    assert_includes pattern_labels, 'Sequence'
    assert_includes pattern_labels, 'Graph'
    refute_includes pattern_labels, 'Traversal'
    refute_includes pattern_labels, 'State'
    assert_equal 'graph/bfs', guide.fetch('redirects').fetch('graph-bfs')
    assert_equal 'dynamic-programming/one-dimensional',
                 guide.fetch('patterns').find { |pattern| pattern.fetch('id') == 'dynamic-programming' }.fetch('default_target')
  end

  def test_problem_matching_returns_template_reference_sets
    guide = build_context.template_library_context.guide
    resolver = SiteKit::Templates::Guide::ReferenceResolver.new(guide: guide)

    binary_search = resolver.references_for_categories(['Array', 'Binary Search'])
    graph_problem = resolver.references_for_categories(
      ['Depth-First Search', 'Breadth-First Search', 'Union-Find', 'Graph Theory']
    )

    assert_equal(['binary-search/boundary'], binary_search.map { |reference| reference.fetch('target') })
    assert_equal(%w[graph/dfs graph/bfs graph/union-find], graph_problem.map { |reference| reference.fetch('target') })
  end

  def test_problem_matching_contracts_are_table_driven
    guide = build_context.template_library_context.guide
    resolver = SiteKit::Templates::Guide::ReferenceResolver.new(guide: guide)
    cases = {
      ['Array', 'Binary Search'] => ['binary-search/boundary'],
      ['Depth-First Search', 'Breadth-First Search', 'Union-Find', 'Graph Theory'] => %w[graph/dfs graph/bfs graph/union-find],
      ['Array', 'Dynamic Programming', 'Backtracking', 'Breadth-First Search', 'Memoization', 'Matrix'] =>
        %w[grid/bfs backtracking/aggregate dynamic-programming],
      ['Hash Table', 'String', 'Sliding Window'] => %w[array-sequence hashing/lookup],
      ['Depth-First Search', 'Binary Tree'] => ['tree/dfs']
    }

    cases.each do |categories, expected_targets|
      actual_targets = resolver.references_for_categories(categories).map { |reference| reference.fetch('target') }

      assert_equal expected_targets, actual_targets
    end
  end

  def test_problem_matching_returns_only_public_reference_keys
    guide = build_context.template_library_context.guide
    resolver = SiteKit::Templates::Guide::ReferenceResolver.new(guide: guide)

    references = resolver.references_for_categories(['Array', 'Binary Search'])

    assert_equal [%w[kind label label_parts pattern_label target variant_label]],
                 references.map { |reference| reference.keys.sort }.uniq
  end

  def test_multi_pattern_problem_matching_preserves_all_relevant_references
    guide = build_context.template_library_context.guide
    resolver = SiteKit::Templates::Guide::ReferenceResolver.new(guide: guide)

    sliding_puzzle = resolver.references_for_categories(
      ['Array', 'Dynamic Programming', 'Backtracking', 'Breadth-First Search', 'Memoization', 'Matrix']
    )
    sliding_window = resolver.references_for_categories(['Hash Table', 'String', 'Sliding Window'])

    assert_includes sliding_puzzle.map { |reference| reference.fetch('target') }, 'grid/bfs'
    assert_includes sliding_puzzle.map { |reference| reference.fetch('target') }, 'dynamic-programming'
    assert_includes sliding_puzzle.map { |reference| reference.fetch('target') }, 'backtracking/aggregate'
    assert_equal(['array-sequence', 'hashing/lookup'],
                 sliding_window.map { |reference| reference.fetch('target') })
  end

  def test_rejects_duplicate_template_guide_references
    data = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    duplicate_variant = data.fetch('patterns')
                            .find { |pattern| pattern.fetch('id') == 'graph' }
                            .fetch('variants')
                            .find { |variant| variant.fetch('id') == 'dfs' }
    duplicate_variant['template'] = 'graph-bfs'

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::Guide::Repository.new(
        data: data,
        templates: build_context.template_library_context.templates,
        code_collections: build_context.template_library_context.code_collections,
        flowchart_data: build_context.flowchart_data
      ).build
    end

    assert_match(/references template 'graph-bfs' more than once/, error.message)
  end

  def test_rejects_template_flowchart_mismatches
    data = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    graph_bfs = data.fetch('patterns')
                    .find { |pattern| pattern.fetch('id') == 'graph' }
                    .fetch('variants')
                    .find { |variant| variant.fetch('id') == 'bfs' }
    graph_bfs['flowchart_nodes'] = ['graph-small-constraints-graph-bfs']

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::Guide::Repository.new(
        data: data,
        templates: build_context.template_library_context.templates,
        code_collections: build_context.template_library_context.code_collections,
        flowchart_data: build_context.flowchart_data
      ).build
    end

    assert_match(/Template guide must cover every flowchart solution node: shortest-path-graph-bfs/, error.message)
  end

  def test_rejects_unknown_flowchart_solution_references
    data = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    graph_bfs = data.fetch('patterns')
                    .find { |pattern| pattern.fetch('id') == 'graph' }
                    .fetch('variants')
                    .find { |variant| variant.fetch('id') == 'bfs' }
    graph_bfs['flowchart_nodes'] = graph_bfs.fetch('flowchart_nodes', []) + ['not-a-solution-node']

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::Guide::Repository.new(
        data: data,
        templates: build_context.template_library_context.templates,
        code_collections: build_context.template_library_context.code_collections,
        flowchart_data: build_context.flowchart_data
      ).build
    end

    assert_match(/references unknown flowchart solution nodes: not-a-solution-node/, error.message)
  end

  def test_rejects_unknown_default_targets
    data = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    data['default_target'] = 'not-a-template-target'

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::Guide::Repository.new(
        data: data,
        templates: build_context.template_library_context.templates,
        code_collections: build_context.template_library_context.code_collections,
        flowchart_data: build_context.flowchart_data
      ).build
    end

    assert_match(/default target 'not-a-template-target' is not defined/, error.message)
  end

  def test_rejects_duplicate_guide_targets
    data = Marshal.load(Marshal.dump(build_site.data.fetch('eureka').fetch('template_guide')))
    data.fetch('patterns')
        .find { |pattern| pattern.fetch('id') == 'graph' }
        .fetch('variants')
        .find { |variant| variant.fetch('id') == 'bfs' }
        .merge!('id' => 'dfs', 'template' => 'graph-bfs')

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::Guide::Repository.new(
        data: data,
        templates: build_context.template_library_context.templates,
        code_collections: build_context.template_library_context.code_collections,
        flowchart_data: build_context.flowchart_data
      ).build
    end

    assert_match(%r{Template guide targets must be unique: graph/dfs}, error.message)
  end

  def test_flowchart_mappings_use_guide_targets
    guide = build_context.template_library_context.guide

    stack_targets = guide.dig('flowchart_nodes', 'parse-symbols-stack').map { |entry| entry.fetch('target') }

    assert_equal ['stack/parse'], stack_targets
    assert_equal(['dynamic-programming'], guide.dig('flowchart_nodes', 'counting-dp').map { |entry| entry.fetch('target') })
    assert_equal(['graph/bfs'], guide.dig('flowchart_nodes', 'shortest-path-graph-bfs').map { |entry| entry.fetch('target') })
    assert_equal(['grid/bfs'], guide.dig('flowchart_nodes', 'shortest-path-grid-bfs').map { |entry| entry.fetch('target') })
  end
end
