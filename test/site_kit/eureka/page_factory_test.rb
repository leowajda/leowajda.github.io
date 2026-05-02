# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitEurekaPageFactoryTest < SiteKitTestCase
  def test_problem_pages_fail_fast_when_topic_record_is_missing
    factory = SiteKit::Eureka::PageFactory.new(
      project_slug: 'eureka',
      route_base: '/eureka',
      browser_record: {
        'languages' => [],
        'problems' => [{ 'problem_slug' => 'missing-topic' }]
      },
      topics_record: { 'problems' => {} },
      page_link_resolver: build_context.page_link_resolver
    )

    error = assert_raises(KeyError) { factory.problem_pages }

    assert_match(/missing-topic/, error.message)
  end

  def test_problem_pages_fail_fast_when_topic_categories_are_missing
    factory = SiteKit::Eureka::PageFactory.new(
      project_slug: 'eureka',
      route_base: '/eureka',
      browser_record: {
        'languages' => [],
        'problems' => [{ 'problem_slug' => 'missing-categories' }]
      },
      topics_record: {
        'problems' => {
          'missing-categories' => {}
        }
      },
      page_link_resolver: build_context.page_link_resolver
    )

    error = assert_raises(KeyError) { factory.problem_pages }

    assert_match(/categories/, error.message)
  end
end
