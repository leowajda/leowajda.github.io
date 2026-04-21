# frozen_string_literal: true

module SiteKit
  class SourceNotesContext
    def initialize(manifests:, app_config:)
      @manifests = manifests
      @app_config = app_config
    end

    def projects
      @projects ||= manifests.to_h do |manifest|
        [manifest.slug, SourceNotesProject.new(manifest: manifest, app_config: app_config)]
      end
    end

    def registries
      @registries ||= projects.transform_values(&:registry_record)
    end

    def generated_pages
      @generated_pages ||= projects.values.flat_map(&:generated_pages)
    end

    private

    attr_reader :manifests, :app_config
  end
end
