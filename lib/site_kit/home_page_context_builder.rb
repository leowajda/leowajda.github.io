# frozen_string_literal: true

module SiteKit
  class HomePageContextBuilder
    def initialize(site_projects:)
      @site_projects = site_projects
    end

    def attach(document)
      document.data["home_projects"] = site_projects
    end

    private

    attr_reader :site_projects
  end
end
