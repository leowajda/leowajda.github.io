# frozen_string_literal: true

module SiteKit
  module Eureka
    class PageFactory
      def initialize(project_slug:, route_base:, browser_record:, page_link_resolver:)
        @project_slug = project_slug
        @route_base = route_base
        @browser_record = browser_record
        @paths = SiteKit::Core::ResourcePaths.new(route_base: route_base)
        @page_link_resolver = page_link_resolver
      end

      def problem_pages
        browser_record.fetch('problems').map do |problem|
          problem_slug = problem.fetch('problem_slug')
          SiteKit::Emit.page(
            dir: paths.item('problems', problem_slug),
            page_type: EUREKA_PROBLEM_PAGE_TYPE,
            project_slug: project_slug,
            title: problem.fetch('title'),
            description: "#{problem.fetch('title')} solutions",
            data: {
              'problem_slug' => problem_slug,
              'problem_record' => problem,
              'header_links' => page_link_resolver.links_for('problem_detail')
            }.merge(problem_external_link(problem))
          )
        end
      end

      def embed_pages
        browser_record.fetch('problems').map do |problem|
          problem_slug = problem.fetch('problem_slug')
          SiteKit::Emit.page(
            dir: paths.embed('problems', problem_slug),
            page_type: EUREKA_EMBED_PAGE_TYPE,
            project_slug: project_slug,
            title: "#{problem.fetch('title')} · Embed",
            description: "#{problem.fetch('title')} solutions embed",
            data: {
              'problem_slug' => problem_slug,
              'problem_record' => problem,
              'detail_url' => problem.fetch('url'),
              'embed' => true
            }.merge(problem_external_link(problem))
          )
        end
      end

      private

      attr_reader :project_slug, :route_base, :browser_record, :paths, :page_link_resolver

      def problem_external_link(record)
        problem_source_url = record.fetch('problem_source_url')
        {
          'problem_source_url' => problem_source_url,
          'nav_external_url' => problem_source_url,
          'nav_external_icon' => 'leetcode',
          'nav_external_label' => 'Open LeetCode problem'
        }
      end
    end
  end
end
