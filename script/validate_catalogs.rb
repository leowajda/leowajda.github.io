#!/usr/bin/env ruby
# frozen_string_literal: true

require "bundler/setup"
require "jekyll"
require "tmpdir"
require_relative "../lib/site_kit"

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
            "source" => source,
            "destination" => destination,
            "quiet" => true
          )
        )
        site.read

        context = BuildContext.for(site)
        context.eureka_context.browsers
        context.eureka_context.topics
        context.source_notes_context.registries
        context.template_library_context.templates
        context.template_library_context.code_collections
        context.template_library_context.groups
        context.eureka_context.flowcharts
        context.eureka_context.projects.each_value do |project|
          project.generated_language_pages
          project.generated_problem_pages
          project.generated_implementation_pages
        end
        context.source_notes_context.projects.each_value do |project|
          project.generated_language_pages
          project.generated_module_pages
          project.generated_document_pages
        end
      end

      puts "Validated site source catalogs and generated registries."
    end

    private

    attr_reader :source, :destination

    def with_destination
      return yield(destination) if destination

      Dir.mktmpdir("site-kit-validation-") do |directory|
        yield(directory)
      end
    end
  end
end

SiteKit::SourceValidator.new.run
