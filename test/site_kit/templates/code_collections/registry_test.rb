# frozen_string_literal: true

require_relative '../../../test_helper'

class SiteKitTemplateCodeCollectionRegistryTest < SiteKitTestCase
  def test_builds_flat_template_code_entries
    entries = build_context.template_library_context.code_collections.fetch('binary-search')

    assert_equal 'binary-search-java', entries.first.fetch('entry_id')
    assert_predicate entries, :any?
    assert_equal 'java', entries.first.fetch('code_language')
    assert_equal 'java', entries.first.fetch('language')
    assert_equal 'Java', entries.first.fetch('language_label')
    refute entries.first.key?('toolbar_groups')
  end

  def test_derives_language_metadata_from_the_catalog
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }
    entries = complete_entries_for('binary-search').map do |entry|
      entry.fetch('language') == 'python' ? entry.merge('code' => 'def search(values): return 0') : entry
    end

    collection = SiteKit::Templates::CodeCollections::Registry.new(
      templates: [template],
      entries_by_template: { template.template_id => entries },
      language_catalog: template_language_catalog,
      code_collection_config: build_context.app_config.code_collection
    ).record.fetch(template.template_id)

    python_item = collection.find { |item| item.fetch('language') == 'python' }

    assert_equal 'python', python_item.fetch('code_language')
    assert_equal 'Python', python_item.fetch('language_label')
  end

  def test_rejects_unknown_template_languages
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }
    entry = {
      'entry_id' => 'binary-search-ruby',
      'language' => 'ruby',
      'code' => 'def search(values) = 0'
    }

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::CodeCollections::Registry.new(
        templates: [template],
        entries_by_template: { template.template_id => [entry] },
        language_catalog: template_language_catalog,
        code_collection_config: build_context.app_config.code_collection
      ).record
    end

    assert_match(/references unknown template language 'ruby'/, error.message)
  end

  def test_rejects_non_template_boilerplate_in_snippets
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }
    entry = {
      'entry_id' => 'binary-search-java',
      'language' => 'java',
      'code' => 'class Solution {}'
    }

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::CodeCollections::Registry.new(
        templates: [template],
        entries_by_template: { template.template_id => [entry] },
        language_catalog: template_language_catalog,
        code_collection_config: build_context.app_config.code_collection
      ).record
    end

    assert_match(/non-template boilerplate/, error.message)
  end

  private

  def complete_entries_for(template_id)
    template_language_catalog.keys.map do |language|
      {
        'entry_id' => "#{template_id}-#{language}",
        'language' => language,
        'code' => "#{language}_template()"
      }
    end
  end

  def template_language_catalog
    build_site.data.fetch('eureka').fetch('template_languages')
  end
end
