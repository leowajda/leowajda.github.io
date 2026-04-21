# frozen_string_literal: true

require_relative "../test_helper"

class SiteKitHelpersTest < SiteKitTestCase
  def test_raw_github_url_converts_github_blob_urls
    url = SiteKit::Helpers.raw_github_url(
      "https://github.com/example/repo/blob/main",
      "docs/guide.md"
    )

    assert_equal(
      "https://raw.githubusercontent.com/example/repo/main/docs/guide.md",
      url
    )
  end

  def test_rewrite_markdown_images_rewrites_relative_asset_paths
    Dir.mktmpdir do |directory|
      File.write(File.join(directory, "cover.png"), "placeholder")

      rewritten = SiteKit::Helpers.rewrite_markdown_images(
        "![Cover](cover.png)",
        directory,
        "https://github.com/example/repo/blob/main",
        source_root: directory
      )

      assert_includes rewritten, "https://raw.githubusercontent.com/example/repo/main/"
      assert_includes rewritten, "/cover.png"
    end
  end
end
