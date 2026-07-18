# frozen_string_literal: true

module SiteKit
  module Eureka
    class PageFactory
      def initialize(project_slug:, route_base:, browser_record:, topics_record:, page_link_resolver:)
        @project_slug = project_slug
        @route_base = route_base
        @browser_record = browser_record
        @topics_record = topics_record
        @paths = SiteKit::Core::ResourcePaths.new(route_base: route_base)
        @pages = SiteKit::Pages::DefinitionBuilder.new(
          project_slug: project_slug,
          page_link_resolver: page_link_resolver
        )
      end

      def problem_pages
        browser_record.fetch('problems').map do |problem|
          problem_slug = problem.fetch('problem_slug')
          topics = problem_topics(problem_slug)

          pages.build(
            dir: paths.item('problems', problem_slug),
            page_type: EUREKA_PROBLEM_PAGE_TYPE,
            title: problem.fetch('title'),
            description: "#{problem.fetch('title')} solutions",
            data: {
              'problem_slug' => problem_slug,
              'problem_record' => problem,
              'problem_topics' => topics,
              'header_links' => pages.links_for('problem_detail')
            }.merge(problem_external_link(problem))
          )
        end
      end

      def embed_pages
        browser_record.fetch('problems').map do |problem|
          problem_slug = problem.fetch('problem_slug')

          pages.build(
            dir: paths.embed('problems', problem_slug),
            page_type: EUREKA_EMBED_PAGE_TYPE,
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

      attr_reader :project_slug, :route_base, :browser_record, :topics_record, :paths, :pages

      def problem_topics(problem_slug)
        topic_record = topics_record.fetch('problems').fetch(problem_slug)

        topic_record.merge(
          'categories' => topic_record.fetch('categories'),
          'template_references' => problem_record(problem_slug).fetch('template_references', [])
        )
      end

      def problem_record(problem_slug)
        problems_by_slug.fetch(problem_slug)
      end

      def problems_by_slug
        @problems_by_slug ||= browser_record.fetch('problems').to_h do |problem|
          [problem.fetch('problem_slug'), problem]
        end
      end

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
