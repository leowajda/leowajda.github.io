# frozen_string_literal: true

require 'json'
require_relative '../../test_helper'

class SiteKitPluginGenerationTest < SiteKitTestCase
  def test_generators_publish_named_registries_and_pages
    site = generated_site
    home_page = site.pages.find { |page| page.url == '/' }
    explorer_page = site.pages.find { |page| page.url == '/eureka/problems/' }
    templates_post = site.posts.docs.find { |post| post.url == '/writing/algorithmic-templates/' }

    refute site.data.key?('source_notes')
    refute site.data.fetch('site').key?('projects')
    assert(home_page.data['home_projects'].any? { |project| project.fetch('slug') == 'eureka' })
    assert explorer_page.data['browser_record']
    assert_predicate explorer_page.data['header_links'], :any?
    assert explorer_page.data['problem_filter_panel']
    assert_predicate explorer_page.data['problem_table'].fetch('rows'), :any?
    assert(site.pages.any? { |page| page.url == '/eureka/problems/binary-search/' })
    assert templates_post.data['template_guide']
  end

  def test_search_record_exporter_writes_records_from_the_processed_jekyll_site
    Dir.mktmpdir do |directory|
      records_path = File.join(directory, 'search-records.json')
      destination = File.join(directory, 'site')

      SiteKit::Build::SearchRecordExporter.new(
        destination: destination,
        output_path: records_path
      ).export

      records = JSON.parse(File.read(records_path))
      routes = records.map { |record| record.fetch('url').split('#', 2).first }

      assert_operator records.size, :>, 400
      assert_includes routes, '/eureka/problems/binary-search/'
      assert_includes routes, '/writing/algorithmic-templates/'
    end
  end
end
