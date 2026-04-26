# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitProjectManifestRepositoryTest < SiteKitTestCase
  def test_loads_project_manifests_from_data_file
    records = YAML.safe_load_file(File.join(SiteKit::Helpers.site_source, '_data', 'projects.yml'))
    manifests = SiteKit::ProjectManifestRepository.new(records).load

    assert_equal %w[eureka zibaldone], manifests.map(&:slug)
    assert_equal %w[eureka source-notes], [manifests.first.kind, manifests.last.kind]
    assert_equal '/eureka/problems/', manifests.first.entry_url
  end

  def test_rejects_duplicate_project_slugs
    records = [project_record('notes'), project_record('notes')]

    error = assert_raises(RuntimeError) do
      SiteKit::ProjectManifestRepository.new(records).load
    end

    assert_match(/Project manifest values must be unique: notes/, error.message)
  end

  def test_project_registry_filters_optional_missing_sources
    Dir.mktmpdir do |directory|
      existing_source = File.join(directory, 'existing')
      FileUtils.mkdir_p(existing_source)
      records = [
        project_record('existing', 'source_repo_path' => 'existing'),
        project_record('optional', 'source_repo_path' => 'missing', 'source_optional' => true)
      ]

      registry = SiteKit::ProjectRegistry.new(records:, repo_root: directory).record

      assert_equal ['existing'], registry.manifests.map(&:slug)
    end
  end

  private

  def project_record(slug, overrides = {})
    {
      'slug' => slug,
      'kind' => SiteKit::SOURCE_NOTES_PROJECT_KIND,
      'title' => slug.capitalize,
      'description' => "#{slug} description",
      'route_base' => "/#{slug}",
      'entry_url' => '',
      'source_url' => "https://example.com/#{slug}",
      'source_repo_path' => slug
    }.merge(overrides)
  end
end
