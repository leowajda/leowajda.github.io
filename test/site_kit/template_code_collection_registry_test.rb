# frozen_string_literal: true

require_relative "../test_helper"

class SiteKitTemplateCodeCollectionRegistryTest < SiteKitTestCase
  def test_builds_precomputed_template_code_collections
    collection = build_context.template_library_context.code_collections.fetch("binary-search")

    assert_equal "binary-search-java", collection.fetch("default_entry_id")
    assert collection.fetch("items").any?
    assert_equal 1, collection.fetch("toolbar_groups").size
    assert_equal "language", collection.fetch("toolbar_groups").first.fetch("kind")
  end
end
