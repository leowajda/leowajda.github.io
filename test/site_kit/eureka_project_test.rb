# frozen_string_literal: true

require_relative "../test_helper"

class SiteKitEurekaProjectTest < SiteKitTestCase
  def test_builds_browser_topics_and_generated_pages_with_resolved_page_data
    project = build_context.eureka_context.projects.fetch("eureka")

    browser = project.browser_record
    topics = project.topics_record
    problem_page = project.generated_problem_pages.find { |page| page[:dir] == "/eureka/problems/binary-search/" }
    single_language_problem_page = project.generated_problem_pages.find { |page| page[:dir] == "/eureka/problems/find-if-path-exists-in-graph/" }
    implementation_page = project.generated_implementation_pages.find { |page| page[:page_type] == "eureka_implementation_page" }
    single_language_problem = browser.fetch("problems").find { |problem| problem.fetch("problem_slug") == "find-if-path-exists-in-graph" }

    assert browser.fetch("languages").any? { |language| language.fetch("slug") == "java" }
    binary_search = browser.fetch("problems").find { |problem| problem.fetch("problem_slug") == "binary-search" }
    assert binary_search
    assert single_language_problem
    assert_equal %w[language variant], binary_search.dig("code_collection", "toolbar_groups").map { |group| group.fetch("kind") }
    assert_equal %w[language variant], single_language_problem.dig("code_collection", "toolbar_groups").map { |group| group.fetch("kind") }
    refute binary_search.key?("implementations_by_id")
    assert topics.dig("categories", "Binary Search", "topic_ids").any?
    assert problem_page
    assert single_language_problem_page
    assert implementation_page
    assert_instance_of SiteKit::PageDefinition, problem_page
    assert_instance_of SiteKit::PageDefinition, implementation_page
    assert_equal "binary-search", problem_page.dig(:data, "problem_record", "problem_slug")
    assert problem_page.dig(:data, "problem_topics", "categories").any?
    assert_equal "/writing/algorithmic-templates/#binary-search", problem_page.dig(:data, "problem_topics", "categories", 1, "template_url")
    assert_equal "", single_language_problem_page.dig(:data, "problem_topics", "categories", 0, "template_url")
    assert_equal "", single_language_problem_page.dig(:data, "problem_topics", "categories", 1, "template_url")
    assert_equal "/writing/algorithmic-templates/#union-find", single_language_problem_page.dig(:data, "problem_topics", "categories", 2, "template_url")
    assert_equal "", single_language_problem_page.dig(:data, "problem_topics", "categories", 3, "template_url")
    assert_equal implementation_page[:data]["problem_slug"], implementation_page.dig(:data, "problem_record", "problem_slug")
    assert_equal implementation_page[:data]["implementation_id"], implementation_page.dig(:data, "selected_implementation_record", "implementation_id")
    assert_equal "", implementation_page[:content].to_s
  end
end
