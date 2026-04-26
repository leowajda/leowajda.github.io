#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require 'jekyll'
require 'tmpdir'
require_relative '../lib/site_kit'

module SiteKit
  class SourceValidator
    def initialize(
      source: Helpers.site_source,
      destination: nil
    )
      @source = source
      @destination = destination
    end

    def run
      with_destination do |destination|
        site = Jekyll::Site.new(
          Jekyll.configuration(
            'source' => source,
            'destination' => destination,
            'quiet' => true
          )
        )
        site.read

        BuildContext.for(site).validate!
      end

      puts 'Validated site source catalogs and generated registries.'
    end

    private

    attr_reader :source, :destination

    def with_destination(&)
      return yield(destination) if destination

      Dir.mktmpdir('site-kit-validation-', &)
    end
  end
end

SiteKit::SourceValidator.new.run
