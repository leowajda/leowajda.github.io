# frozen_string_literal: true

require 'pathname'

module SiteKit
  class EurekaCatalogLoader
    def initialize(manifest:, app_config:, flowchart_data:)
      @manifest = manifest
      @app_config = app_config
      @flowchart_data = flowchart_data
      @source_root = Pathname(manifest.source_root(Helpers.repo_root))
    end

    def load
      source_catalog = EurekaSourceCatalogLoader.new(
        manifest: manifest,
        app_config: app_config,
        flowchart_data: flowchart_data
      ).load

      EurekaProblemRegistryBuilder.new(
        manifest: manifest,
        app_config: app_config,
        source_catalog: source_catalog,
        source_root: source_root
      ).build
    end

    private

    attr_reader :manifest, :app_config, :flowchart_data, :source_root
  end
end
