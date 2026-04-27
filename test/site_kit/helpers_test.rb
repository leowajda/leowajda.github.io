# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitHelpersTest < SiteKitTestCase
  def test_raw_github_url_converts_github_blob_urls
    url = SiteKit::Helpers.raw_github_url(
      'https://github.com/example/repo/blob/main',
      'docs/guide.md'
    )

    assert_equal(
      'https://raw.githubusercontent.com/example/repo/main/docs/guide.md',
      url
    )
  end

  def test_rewrite_markdown_images_rewrites_relative_asset_paths
    Dir.mktmpdir do |directory|
      File.write(File.join(directory, 'cover.png'), 'placeholder')

      rewritten = SiteKit::Helpers.rewrite_markdown_images(
        '![Cover](cover.png)',
        directory,
        'https://github.com/example/repo/blob/main',
        source_root: directory
      )

      assert_includes rewritten, 'https://raw.githubusercontent.com/example/repo/main/'
      assert_includes rewritten, '/cover.png'
    end
  end

  def test_rewrite_markdown_images_preserves_titles_and_angle_references
    Dir.mktmpdir do |directory|
      File.write(File.join(directory, 'cover image.png'), 'placeholder')

      rewritten = SiteKit::Helpers.rewrite_markdown_images(
        '![Cover](<cover image.png> "Cover image")',
        directory,
        'https://github.com/example/repo/blob/main',
        source_root: directory
      )

      assert_includes rewritten, 'https://raw.githubusercontent.com/example/repo/main/'
      assert_includes rewritten, 'cover image.png'
      assert_includes rewritten, '"Cover image"'
    end
  end

  def test_parse_yaml_rejects_duplicate_mapping_keys
    error = assert_raises(RuntimeError) do
      SiteKit::Helpers.parse_yaml("title: First\ntitle: Second\n", 'Duplicate fixture')
    end

    assert_match(/Duplicate mapping key 'title'/, error.message)
  end

  def test_slugify_collapses_and_trims_separators
    assert_equal 'hello-world', SiteKit::Helpers.slugify(' Hello,   World! ')
  end

  def test_record_helpers_compact_string_keys
    record = SiteKit::RecordHelpers.compact_string_keys(label: 'Graph', count: 2, empty: nil)

    assert_equal({ 'label' => 'Graph', 'count' => 2 }, record)
  end
end
