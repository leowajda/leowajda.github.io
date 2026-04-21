# frozen_string_literal: true

require "bundler/setup"
require "fileutils"
require "minitest/autorun"
require "tmpdir"
require "jekyll"

require_relative "../lib/site_kit"

class SiteKitTestCase < Minitest::Test
  def teardown
    super
    FileUtils.remove_entry(@tmp_destination, true) if defined?(@tmp_destination) && @tmp_destination && Dir.exist?(@tmp_destination)
  end

  private

  def build_site
    @build_site ||= begin
      @tmp_destination = Dir.mktmpdir("site-kit-test-")
      site = Jekyll::Site.new(
        Jekyll.configuration(
          "source" => SiteKit::Helpers.site_source,
          "destination" => @tmp_destination,
          "quiet" => true
        )
      )
      site.read
      site
    end
  end

  def build_context
    @build_context ||= SiteKit::BuildContext.for(build_site)
  end

  def generated_site
    @generated_site ||= begin
      site = build_site
      site.generate
      site
    end
  end
end
