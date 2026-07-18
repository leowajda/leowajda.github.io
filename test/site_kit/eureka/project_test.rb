# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitEurekaProjectTest < SiteKitTestCase
  def test_builds_browser_topics_and_generated_pages_with_resolved_page_data
    project = build_context.eureka_context.projects.fetch('eureka')

    browser = project.browser_record
    topics = project.topics_record
    problem_page = project.generated_problem_pages.find { |page| page[:dir] == '/eureka/problems/binary-search/' }
    single_language_problem_page = project.generated_problem_pages.find do |page|
      page[:dir] == '/eureka/problems/find-if-path-exists-in-graph/'
    end
    embed_page = project.generated_embed_pages.find { |page| page[:dir] == '/eureka/problems/binary-search/embed/' }
    single_language_problem = browser.fetch('problems').find do |problem|
      problem.fetch('problem_slug') == 'find-if-path-exists-in-graph'
    end

    assert(browser.fetch('languages').any? { |language| language.fetch('slug') == 'java' })
    refute(browser.fetch('languages').any? { |language| language.key?('url') })
    binary_search = browser.fetch('problems').find { |problem| problem.fetch('problem_slug') == 'binary-search' }

    assert binary_search
    assert single_language_problem
    assert_equal ['Array', 'Binary Search'], binary_search.fetch('categories')
    assert_equal '/eureka/problems/binary-search/embed/', binary_search.fetch('embed_url')
    refute browser.fetch('filters').key?('patterns')
    assert_operator binary_search.fetch('implementations').size, :>=, 1
    assert binary_search.fetch('implementations').first.key?('entry_id')
    assert binary_search.fetch('implementations').first.key?('code')
    refute binary_search.key?('code_collection')
    refute binary_search.key?('implementations_by_id')
    assert_predicate topics.dig('categories', 'Binary Search', 'topic_ids'), :any?
    tree_targets = topics.dig('flowchart_nodes', 'tree-dfs').map { |entrypoint| entrypoint.fetch('target') }

    assert_equal ['tree/dfs'], tree_targets
    assert problem_page
    assert single_language_problem_page
    assert embed_page
    assert_instance_of SiteKit::Pages::Definition, problem_page
    assert_instance_of SiteKit::Pages::Definition, embed_page
    assert_equal 'binary-search', problem_page.dig(:data, 'problem_record', 'problem_slug')
    assert_predicate problem_page.dig(:data, 'problem_record', 'template_references'), :any?
    assert_equal '/templates/#binary-search/boundary',
                 problem_page.dig(:data, 'problem_record', 'template_references').first.fetch('url')
    assert_operator single_language_problem_page.dig(:data, 'problem_record', 'template_references').size, :>, 1
    assert_equal 'binary-search', embed_page.dig(:data, 'problem_record', 'problem_slug')
    assert embed_page.dig(:data, 'embed')
    assert_equal '/eureka/problems/binary-search/', embed_page.dig(:data, 'detail_url')
    assert_equal '', embed_page[:content].to_s
  end

  def test_browser_problem_records_keep_template_references_problem_scoped
    project = build_context.eureka_context.projects.fetch('eureka')
    binary_search = project.browser_record.fetch('problems').find do |problem|
      problem.fetch('problem_slug') == 'binary-search'
    end

    assert_equal(['binary-search/boundary'],
                 binary_search.fetch('template_references').map { |reference| reference.fetch('target') })
    assert_equal(%w[kind label label_parts pattern_label target url variant_label],
                 binary_search.fetch('template_references').first.keys.sort)
    refute binary_search.fetch('template_references').first.key?('action_label')
    refute binary_search.key?('template_pattern_ids')
    refute binary_search.key?('template_guide_primary')
    refute binary_search.key?('topic_ids')
    refute binary_search.key?('topics')
    refute binary_search.key?('category_topics')
  end

  def test_embed_page_shares_full_implementations
    project = build_context.eureka_context.projects.fetch('eureka')
    embed_page = project.generated_embed_pages.find { |page| page[:dir] == '/eureka/problems/binary-search/embed/' }
    implementations = embed_page.dig(:data, 'problem_record', 'implementations')

    assert_operator implementations.size, :>, 1
    assert(implementations.any? { |entry| entry.fetch('detail_url').include?('/eureka/problems/binary-search/') })
  end

  def test_sliding_puzzle_exposes_all_derived_template_references
    project = build_context.eureka_context.projects.fetch('eureka')
    references = problem_template_references(project, 'sliding-puzzle')

    assert_includes references.map { |reference| reference.fetch('target') }, 'grid/bfs'
    assert_includes references.map { |reference| reference.fetch('target') }, 'backtracking/aggregate'
    refute_includes references.map { |reference| reference.fetch('target') }, 'backtracking/choose-undo'
    assert_includes references.map { |reference| reference.fetch('target') }, 'dynamic-programming'
  end

  def test_every_problem_template_reference_points_to_a_known_guide_target
    project = build_context.eureka_context.projects.fetch('eureka')
    guide_targets = build_context.template_library_context.guide.fetch('patterns').flat_map do |pattern|
      [pattern.fetch('target'), *pattern.fetch('variants').map { |variant| variant.fetch('target') }]
    end

    project.generated_problem_pages.each do |page|
      Array(page.dig(:data, 'problem_record', 'template_references')).each do |reference|
        assert_includes guide_targets, reference.fetch('target'), "Unknown template guide target for #{page[:dir]}"
      end
    end
  end

  private

  def problem_template_references(project, slug)
    project.generated_problem_pages
           .find { |page| page[:dir] == "/eureka/problems/#{slug}/" }
           .dig(:data, 'problem_record', 'template_references')
  end
end
