# frozen_string_literal: true

module SiteKit
  module Eureka
    class PageFactory
      def initialize(project_slug:, route_base:, browser_record:, topics_record:, page_link_resolver:)
        @project_slug = project_slug
        @route_base = route_base
        @browser_record = browser_record
        @topics_record = topics_record
        @pages = SiteKit::Pages::DefinitionBuilder.new(
          project_slug: project_slug,
          page_link_resolver: page_link_resolver
        )
      end

      def language_pages
        browser_record.fetch('languages').map do |language|
          pages.build(
            dir: "#{route_base}/#{language.fetch('slug')}/",
            page_type: EUREKA_LANGUAGE_PAGE_TYPE,
            title: language.fetch('title'),
            description: language.fetch('description'),
            data: {
              'language_filter' => language.fetch('slug'),
              'browser_record' => browser_record,
              'active_language_record' => language,
              'header_links' => pages.links_for('problem_explorer')
            }
          )
        end
      end

      def problem_pages
        browser_record.fetch('problems').map do |problem|
          problem_slug = problem.fetch('problem_slug')
          topics = problem_topics(problem_slug)

          pages.build(
            dir: "#{route_base}/problems/#{problem_slug}/",
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

      def implementation_pages
        browser_record.fetch('problems').flat_map do |problem|
          problem.fetch('implementations').map do |implementation|
            problem_slug = implementation.fetch('problem_slug')
            implementation_id = implementation.fetch('implementation_id')

            pages.build(
              dir: "#{route_base}/problems/#{problem_slug}/embed/#{implementation_id}/",
              page_type: EUREKA_IMPLEMENTATION_PAGE_TYPE,
              title: implementation.fetch('title'),
              description: implementation.fetch('description'),
              data: {
                'problem_slug' => problem_slug,
                'implementation_id' => implementation_id,
                'problem_record' => problem,
                'selected_implementation_record' => implementation
              }.merge(problem_external_link(implementation))
            )
          end
        end
      end

      private

      attr_reader :project_slug, :route_base, :browser_record, :topics_record, :pages

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
