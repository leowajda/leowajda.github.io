# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitEurekaPageFactoryTest < SiteKitTestCase
  def test_problem_and_embed_pages_use_flat_problem_record
    problem = {
      'problem_slug' => 'two-sum',
      'title' => 'Two Sum',
      'url' => '/eureka/problems/two-sum/',
      'problem_source_url' => 'https://leetcode.com/problems/two-sum/',
      'implementations' => [],
      'template_references' => []
    }
    factory = SiteKit::Eureka::PageFactory.new(
      project_slug: 'eureka',
      route_base: '/eureka',
      browser_record: {
        'languages' => [],
        'problems' => [problem]
      },
      page_link_resolver: build_context.page_link_resolver
    )

    problem_page = factory.problem_pages.first
    embed_page = factory.embed_pages.first

    assert_equal '/eureka/problems/two-sum/', problem_page[:dir]
    assert_equal problem, problem_page.dig(:data, 'problem_record')
    refute problem_page[:data].key?('problem_topics')
    assert_equal '/eureka/problems/two-sum/embed/', embed_page[:dir]
    assert embed_page.dig(:data, 'embed')
    assert_equal '/eureka/problems/two-sum/', embed_page.dig(:data, 'detail_url')
  end
end
