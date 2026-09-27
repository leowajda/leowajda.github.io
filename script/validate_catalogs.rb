#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require 'jekyll'
require_relative '../lib/site_kit'

SiteKit::Checks::SourceCatalogs.new.validate!
puts 'Validated site source catalogs and generated registries.'
