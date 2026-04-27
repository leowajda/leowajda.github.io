#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require 'jekyll'
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
      JekyllSiteLoader.new(source:, destination:).read do |site|
        BuildContext.for(site).validate!
      end

      puts 'Validated site source catalogs and generated registries.'
    end

    private

    attr_reader :source, :destination
  end
end

SiteKit::SourceValidator.new.run
