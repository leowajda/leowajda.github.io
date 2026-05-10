# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitAssetVersionManifestTest < SiteKitTestCase
  def test_versions_static_generated_and_pagefind_assets
    manifest = SiteKit::Assets::VersionManifest.new(site: build_site).build
    versions = manifest.fetch('versions')

    assert_match(/\A\d+\z/, versions.fetch('/assets/js/core.js'))
    assert_match(/\A\d+\z/, versions.fetch('/assets/css/main.css'))
    assert_match(/\A\d+\z/, versions.fetch('/site.webmanifest'))
    assert_equal manifest.fetch('build_version'), versions.fetch('/pagefind/pagefind.js')
  end

  def test_import_map_versions_local_javascript_modules
    manifest = SiteKit::Assets::VersionManifest.new(site: build_site).build
    imports = manifest.fetch('import_map').fetch('imports')

    assert_match(%r{\A/assets/js/dom\.js\?v=\d+\z}, imports.fetch('/assets/js/dom.js'))
    assert_match(%r{\A/assets/js/eureka-flowchart-node-state\.js\?v=\d+\z},
                 imports.fetch('/assets/js/eureka-flowchart-node-state.js'))
    refute_includes imports.keys, '/assets/css/main.css'
  end
end
