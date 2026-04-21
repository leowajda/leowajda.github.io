# frozen_string_literal: true

require_relative "../test_helper"

class SiteKitAlgorithmicTemplateRepositoryTest < SiteKitTestCase
  def test_loads_templates_from_the_collection
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == "binary-search" }

    assert template
    assert_equal "Binary Search", template.title
    assert_equal "Search And Window", template.group_title
    assert_equal ["Binary Search"], template.eureka_categories
  end
end
