# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitTemplateCodeCollectionRegistryTest < SiteKitTestCase
  def test_builds_precomputed_template_code_collections
    collection = build_context.template_library_context.code_collections.fetch('binary-search')

    assert_equal 'binary-search-java', collection.fetch('default_entry_id')
    assert_predicate collection.fetch('items'), :any?
    assert_equal 'java', collection.fetch('items').first.fetch('code_language')
    assert collection.fetch('items').first.fetch('active')
    assert_equal 1, collection.fetch('toolbar_groups').size
    assert_equal 'language', collection.fetch('toolbar_groups').first.fetch('kind')
    assert_equal 'Java', collection.fetch('toolbar_groups').first.fetch('controls').first.fetch('label')
    assert collection.fetch('toolbar_groups').first.fetch('controls').first.fetch('active')
  end

  def test_derives_language_metadata_from_the_catalog
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }
    entries = complete_entries_for('binary-search').map do |entry|
      entry.fetch('language') == 'python' ? entry.merge('code' => 'def search(values): return 0') : entry
    end

    collection = SiteKit::TemplateCodeCollectionRegistry.new(
      templates: [template],
      entries_by_template: { template.template_id => entries },
      language_catalog: template_language_catalog,
      code_collection_config: build_context.app_config.code_collection
    ).record.fetch(template.template_id)

    python_item = collection.fetch('items').find { |item| item.fetch('language_slug') == 'python' }
    python_control = collection.fetch('toolbar_groups').first.fetch('controls').find do |control|
      control.fetch('slug') == 'python'
    end

    assert_equal 'python', python_item.fetch('code_language')
    assert_equal 'Python', python_control.fetch('label')
  end

  def test_rejects_unknown_template_languages
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }
    entry = {
      'entry_id' => 'binary-search-ruby',
      'language' => 'ruby',
      'code' => 'def search(values) = 0'
    }

    error = assert_raises(RuntimeError) do
      SiteKit::TemplateCodeCollectionRegistry.new(
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

    error = assert_raises(RuntimeError) do
      SiteKit::TemplateCodeCollectionRegistry.new(
        templates: [template],
        entries_by_template: { template.template_id => [entry] },
        language_catalog: template_language_catalog,
        code_collection_config: build_context.app_config.code_collection
      ).record
    end

    assert_match(/non-template boilerplate/, error.message)
  end

  def test_rejects_duplicate_template_code_entry_ids
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }
    entry = {
      'entry_id' => 'binary-search-java',
      'language' => 'java',
      'language_label' => 'Java',
      'code_language' => 'java',
      'code' => 'int search() { return 0; }'
    }

    error = assert_raises(RuntimeError) do
      SiteKit::TemplateCodeCollectionRegistry.new(
        templates: [template],
        entries_by_template: { template.template_id => [entry, entry] },
        language_catalog: template_language_catalog,
        code_collection_config: build_context.app_config.code_collection
      ).record
    end

    assert_match(/code entry ids must be unique: binary-search-java/, error.message)
  end

  def test_rejects_duplicate_template_language_variant_pairs
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }
    entries = [
      {
        'entry_id' => 'binary-search-java',
        'language' => 'java',
        'language_label' => 'Java',
        'code_language' => 'java',
        'code' => 'int search() { return 0; }'
      },
      {
        'entry_id' => 'binary-search-java-alt',
        'language' => 'java',
        'language_label' => 'Java',
        'code_language' => 'java',
        'code' => 'int search() { return 0; }'
      }
    ]

    error = assert_raises(RuntimeError) do
      SiteKit::TemplateCodeCollectionRegistry.new(
        templates: [template],
        entries_by_template: { template.template_id => entries },
        language_catalog: template_language_catalog,
        code_collection_config: build_context.app_config.code_collection
      ).record
    end

    assert_match(%r{language and variant pairs must be unique: java/default}, error.message)
  end

  def test_rejects_template_code_entries_under_the_wrong_template
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'mst' }
    entry = {
      'entry_id' => 'trie-python',
      'language' => 'python',
      'language_label' => 'Python',
      'code_language' => 'python',
      'code' => 'class Trie: pass'
    }

    error = assert_raises(RuntimeError) do
      SiteKit::TemplateCodeCollectionRegistry.new(
        templates: [template],
        entries_by_template: { template.template_id => [entry] },
        language_catalog: template_language_catalog,
        code_collection_config: build_context.app_config.code_collection
      ).record
    end

    assert_match(/Template 'mst' code entry id 'trie-python' must start with 'mst-'/, error.message)
  end

  private

  def template_language_catalog
    build_site.data.fetch('eureka').fetch('template_languages')
  end

  def complete_entries_for(template_id)
    template_language_catalog.keys.map do |language|
      {
        'entry_id' => "#{template_id}-#{language}",
        'language' => language,
        'code' => "#{language}_template()"
      }
    end
  end
end
