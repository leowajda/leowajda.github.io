# frozen_string_literal: true

module SiteKit
  module Search
    class ProblemRecordBuilder
      KIND = 'Problem'

      def initialize(browsers:, factory:)
        @browsers = browsers
        @factory = factory
      end

      def records
        browsers.values.flat_map do |browser|
          project = browser.fetch('project_title')
          browser.fetch('problems').map { |problem| problem_record(problem, project) }
        end
      end

      private

      attr_reader :browsers, :factory

      def problem_record(problem, project)
        languages = problem.fetch('languages').map { |language| language.fetch('label') }
        approaches = problem.fetch('implementations').map { |entry| entry.fetch('approach_label') }.uniq
        template_labels = problem.fetch('template_references', []).map { |reference| reference.fetch('label') }

        factory.build(
          kind: KIND,
          title: problem.fetch('title'),
          url: problem.fetch('url'),
          project:,
          summary: "#{problem.fetch('difficulty')}. #{problem.fetch('categories').join(', ')}",
          content: [
            problem.fetch('title'),
            problem.fetch('problem_slug'),
            problem.fetch('difficulty'),
            problem.fetch('categories'),
            languages,
            approaches,
            template_labels
          ],
          filters: {
            'difficulty' => problem.fetch('difficulty'),
            'language' => languages,
            'category' => problem.fetch('categories'),
            'template' => template_labels
          },
          priority: 90
        )
      end
    end
  end
end
