# frozen_string_literal: true

require_relative '../../../test_helper'

class SiteKitTemplateLanguageCoverageTest < SiteKitTestCase
  def test_rejects_template_entries_with_missing_supported_languages
    template = build_context.template_library_context.templates.find { |entry| entry.template_id == 'binary-search' }
    entries = complete_entries_for('binary-search').reject { |entry| entry.fetch('language') == 'scala' }

    error = assert_raises(SiteKit::Error) do
      SiteKit::Templates::CodeCollections::Registry.new(
        templates: [template],
        entries_by_template: { template.template_id => entries },
        language_catalog: template_language_catalog,
        code_collection_config: build_context.app_config.code_collection
      ).record
    end

    assert_match(/must define every supported language: missing scala/, error.message)
  end

  def test_every_template_exposes_every_supported_language
    expected_languages = template_language_catalog.keys.sort

    build_context.template_library_context.code_collections.each do |template_id, collection|
      actual_languages = collection.fetch('items').map { |item| item.fetch('language_slug') }.sort

      assert_equal expected_languages, actual_languages, "Wrong language coverage for #{template_id}"
    end
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
