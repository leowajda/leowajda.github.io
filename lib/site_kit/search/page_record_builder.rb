# frozen_string_literal: true

module SiteKit
  module Search
    class PageRecordBuilder
      KIND = 'Page'

      def initialize(factory:)
        @factory = factory
      end

      def records
        [
          problem_explorer_record
        ]
      end

      private

      attr_reader :factory

      def problem_explorer_record
        factory.build(
          kind: KIND,
          title: 'Problem Explorer',
          url: '/eureka/problems/',
          project: 'Eureka',
          summary: 'Browse LeetCode solutions by category, difficulty, and language.',
          content: 'Problem Explorer Eureka LeetCode solutions categories difficulty languages.',
          priority: 70
        )
      end
    end
  end
end
