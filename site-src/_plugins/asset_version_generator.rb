# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class AssetVersionGenerator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      site.data['asset_versions'] = SiteKit::Assets::VersionManifest.new(site: site).build
    end
  end
end
