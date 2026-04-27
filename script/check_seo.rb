#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require_relative '../lib/site_kit'

failures = SiteKit::Checks::SeoMetadata.new.failures

if failures.empty?
  puts 'Rendered SEO metadata verified.'
  exit 0
end

warn 'Rendered SEO check failed:'
failures.each { |failure| warn "  - #{failure}" }
exit 1
