#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require 'jekyll'
require_relative '../lib/site_kit'

SiteKit::JekyllRuntime::SiteLoader.new(source: SiteKit::Core::Helpers.site_source).read do |site|
  SiteKit::Build::Context.for(site).validate!
end
SiteKit::Checks::VendorAssets.new.validate!
puts 'Validated site source catalogs and generated registries.'
