# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitEurekaProjectTest < SiteKitTestCase
  def test_builds_browser_topics_and_generated_pages_with_resolved_page_data
    project = build_context.eureka_context.projects.fetch('eureka')

    browser = project.browser_record
    topics = project.topics_record
    problem_page = project.generated_problem_pages.find { |page| page[:dir] == '/eureka/problems/binary-search/' }
    single_language_problem_page = project.generated_problem_pages.find { |page| page[:dir] == '/eureka/problems/find-if-path-exists-in-graph/' }
    implementation_page = project.generated_implementation_pages.find { |page| page[:page_type] == 'eureka_implementation_page' }
    single_language_problem = browser.fetch('problems').find { |problem| problem.fetch('problem_slug') == 'find-if-path-exists-in-graph' }

    assert(browser.fetch('languages').any? { |language| language.fetch('slug') == 'java' })
    binary_search = browser.fetch('problems').find { |problem| problem.fetch('problem_slug') == 'binary-search' }

    assert binary_search
    assert single_language_problem
    assert_equal ['Array', 'Binary Search'], binary_search.fetch('categories')
    refute browser.fetch('filters').key?('patterns')
    assert_equal(%w[language variant], binary_search.dig('code_collection', 'toolbar_groups').map { |group| group.fetch('kind') })
    assert_equal(%w[language variant], single_language_problem.dig('code_collection', 'toolbar_groups').map { |group| group.fetch('kind') })
    refute binary_search.key?('implementations_by_id')
    assert_predicate topics.dig('categories', 'Binary Search', 'topic_ids'), :any?
    tree_targets = topics.dig('flowchart_nodes', 'tree-dfs').map { |entrypoint| entrypoint.fetch('target') }

    assert_equal ['tree/dfs'], tree_targets
    assert problem_page
    assert single_language_problem_page
    assert implementation_page
    assert_instance_of SiteKit::Pages::Definition, problem_page
    assert_instance_of SiteKit::Pages::Definition, implementation_page
    assert_equal 'binary-search', problem_page.dig(:data, 'problem_record', 'problem_slug')
    assert_predicate problem_page.dig(:data, 'problem_topics', 'categories'), :any?
    assert_equal '/writing/algorithmic-templates/#binary-search/boundary',
                 problem_page.dig(:data, 'problem_topics', 'template_references').first.fetch('url')
    assert_operator single_language_problem_page.dig(:data, 'problem_topics', 'template_references').size, :>, 1
    assert_equal implementation_page[:data]['problem_slug'], implementation_page.dig(:data, 'problem_record', 'problem_slug')
    assert_equal implementation_page[:data]['implementation_id'], implementation_page.dig(:data, 'selected_implementation_record', 'implementation_id')
    assert_equal '', implementation_page[:content].to_s
  end

  def test_browser_problem_records_keep_template_references_problem_scoped
    project = build_context.eureka_context.projects.fetch('eureka')
    binary_search = project.browser_record.fetch('problems').find do |problem|
      problem.fetch('problem_slug') == 'binary-search'
    end
    menu_actions = binary_search.dig('code_collection', 'entry_action_groups').first.fetch('actions').select do |action|
      action.fetch('kind') == 'menu'
    end

    assert_equal(['binary-search/boundary'],
                 binary_search.fetch('template_references').map { |reference| reference.fetch('target') })
    assert_equal(%w[kind label label_parts pattern_label target url variant_label],
                 binary_search.fetch('template_references').first.keys.sort)
    assert binary_search.dig('code_collection', 'entry_action_groups').first.fetch('active')
    assert_empty menu_actions
    refute binary_search.fetch('template_references').first.key?('action_label')
    refute binary_search.dig('code_collection', 'items').first.key?('template_references')
    refute binary_search.key?('template_pattern_ids')
    refute binary_search.key?('template_guide_primary')
    refute binary_search.key?('topic_ids')
    refute binary_search.key?('topics')
    refute binary_search.key?('category_topics')
  end

  def test_implementation_page_data_does_not_duplicate_problem_template_references
    project = build_context.eureka_context.projects.fetch('eureka')
    implementation_page = project.generated_implementation_pages.find { |page| page[:page_type] == 'eureka_implementation_page' }

    refute implementation_page.dig(:data, 'selected_implementation_record').key?('template_references')
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
      page.dig(:data, 'problem_topics', 'template_references').each do |reference|
        assert_includes guide_targets, reference.fetch('target'), "Unknown template guide target for #{page[:dir]}"
      end
    end
  end

  private

  def problem_template_references(project, slug)
    project.generated_problem_pages
           .find { |page| page[:dir] == "/eureka/problems/#{slug}/" }
           .dig(:data, 'problem_topics', 'template_references')
  end
end
