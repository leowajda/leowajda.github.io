# frozen_string_literal: true

require 'tmpdir'

module SiteKit
  class JekyllSiteLoader
    def initialize(source: Helpers.site_source, destination: nil, quiet: true)
      @source = source
      @destination = destination
      @quiet = quiet
    end

    def read
      with_destination do |resolved_destination|
        site = build_site(resolved_destination)
        site.read
        yield site if block_given?
        site
      end
    end

    private

    attr_reader :source, :destination, :quiet

    def with_destination(&)
      return yield(destination) if destination

      Dir.mktmpdir('site-kit-jekyll-', &)
    end

    def build_site(resolved_destination)
      Jekyll::Site.new(
        Jekyll.configuration(
          'source' => source,
          'destination' => resolved_destination,
          'quiet' => quiet
        )
      )
    end
  end
end
