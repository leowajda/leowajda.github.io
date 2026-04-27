#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require_relative '../lib/site_kit'

failures = SiteKit::Checks::InternalLinks.new.failures

if failures.empty?
  puts 'Internal links verified.'
  exit 0
end

warn 'Internal link check failed:'
failures.each { |failure| warn "  - #{failure}" }
exit 1
