# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitRenderedChecksTest < SiteKitTestCase
  def test_internal_link_check_reports_missing_targets
    Dir.mktmpdir do |directory|
      File.write(File.join(directory, 'index.html'), '<!doctype html><a href="/missing/">Missing</a>')

      failures = SiteKit::Checks::InternalLinks.new(site_dir: directory).failures

      assert_equal ['index.html -> missing target /missing/'], failures
    end
  end

  def test_internal_link_check_ignores_cache_busting_queries
    Dir.mktmpdir do |directory|
      FileUtils.mkdir_p(File.join(directory, 'assets', 'css'))
      FileUtils.mkdir_p(File.join(directory, 'guide'))
      File.write(File.join(directory, 'assets', 'css', 'main.css'), '')
      File.write(File.join(directory, 'guide', 'index.html'), '<!doctype html><h1 id="intro">Guide</h1>')
      File.write(File.join(directory, 'index.html'), <<~HTML)
        <!doctype html>
        <link rel="stylesheet" href="/assets/css/main.css?v=123">
        <a href="/guide/?v=456#intro">Guide</a>
        <a href="?v=789#home">Home</a>
        <h1 id="home">Home</h1>
      HTML

      assert_empty SiteKit::Checks::InternalLinks.new(site_dir: directory).failures
    end
  end

  def test_seo_check_accepts_indexable_page_in_sitemap
    Dir.mktmpdir do |directory|
      File.write(File.join(directory, 'index.html'), <<~HTML)
        <!doctype html>
        <html>
          <head>
            <title>Meaningful title</title>
            <link rel="canonical" href="https://example.test/">
            <meta name="description" content="Meaningful description.">
          </head>
          <body><h1>Home</h1></body>
        </html>
      HTML
      File.write(File.join(directory, 'sitemap.xml'), <<~XML)
        <urlset><url><loc>https://example.test/</loc></url></urlset>
      XML

      assert_empty SiteKit::Checks::SeoMetadata.new(site_dir: directory).failures
    end
  end

  def test_seo_check_rejects_noindex_pages_in_sitemap
    Dir.mktmpdir do |directory|
      FileUtils.mkdir_p(File.join(directory, 'search'))
      File.write(File.join(directory, 'search', 'index.html'), <<~HTML)
        <!doctype html>
        <html><head><meta name="robots" content="noindex"></head><body></body></html>
      HTML
      File.write(File.join(directory, 'sitemap.xml'), <<~XML)
        <urlset><url><loc>https://example.test/search/</loc></url></urlset>
      XML

      failures = SiteKit::Checks::SeoMetadata.new(site_dir: directory).failures

      assert_equal ['search/index.html -> noindex page is present in sitemap.xml: /search/'], failures
    end
  end
end
