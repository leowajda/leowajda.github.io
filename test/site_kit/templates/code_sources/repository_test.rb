# frozen_string_literal: true

require_relative '../../../test_helper'

class SiteKitTemplatesCodeSourcesRepositoryTest < SiteKitTestCase
  def test_template_code_sources_feed_code_collections_from_language_files
    collection = build_context.template_library_context.code_collections.fetch('binary-search')
    java = collection.fetch('items').find { |item| item.fetch('language_slug') == 'java' }

    assert_equal 'binary-search-java', java.fetch('entry_id')
    assert_includes java.fetch('code'), 'int lowerBound'
  end

  def test_template_code_source_root_rejects_unknown_template_directories
    Dir.mktmpdir do |directory|
      FileUtils.mkdir_p(File.join(directory, 'unknown-template'))

      error = assert_raises(SiteKit::Error) do
        repository(directory).entries_by_template([template('binary-search')])
      end

      assert_match(/unknown templates: unknown-template/, error.message)
    end
  end

  def test_template_code_sources_must_cover_each_language_file
    Dir.mktmpdir do |directory|
      FileUtils.mkdir_p(File.join(directory, 'binary-search'))

      error = assert_raises(SiteKit::Error) do
        repository(directory).entries_by_template([template('binary-search')])
      end

      assert_match(%r{missing java code source binary-search/java\.java}, error.message)
    end
  end

  private

  def repository(directory)
    SiteKit::Templates::CodeSources::Repository.new(
      root: directory,
      language_catalog: build_site.data.fetch('eureka').fetch('template_languages')
    )
  end

  def template(template_id)
    build_context.template_library_context.templates.find { |entry| entry.template_id == template_id }
  end
end
