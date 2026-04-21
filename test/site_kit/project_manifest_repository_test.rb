# frozen_string_literal: true

require_relative "../test_helper"

class SiteKitProjectManifestRepositoryTest < SiteKitTestCase
  def test_loads_project_manifests_from_data_file
    records = YAML.safe_load_file(File.join(SiteKit::Helpers.site_source, "_data", "projects.yml"))
    manifests = SiteKit::ProjectManifestRepository.new(records).load

    assert_equal %w[eureka zibaldone], manifests.map(&:slug)
    assert_equal %w[eureka source-notes], [manifests.first.kind, manifests.last.kind]
    assert_equal "/eureka/problems/", manifests.first.entry_url
  end
end
