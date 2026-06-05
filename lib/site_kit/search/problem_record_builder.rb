# frozen_string_literal: true

module SiteKit
  module Search
    class ProblemRecordBuilder
      KIND = SiteKit::Search::Contract::KIND_PROBLEM

      def initialize(browsers:)
        @browsers = browsers
      end

      def records
        browsers.values.flat_map do |browser|
          project = browser.fetch('project_title')
          browser.fetch('problems').map { |problem| problem_record(problem, project) }
        end
      end

      private

      attr_reader :browsers

      def problem_record(problem, project)
        languages = problem.fetch('languages').map { |language| language.fetch('label') }
        approaches = problem.fetch('implementations').map { |entry| entry.fetch('approach_label') }.uniq
        template_labels = problem.fetch('template_references', []).map { |reference| reference.fetch('label') }

        SiteKit::Search::Record.build(
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
            SiteKit::Search::Contract::FILTER_DIFFICULTY => problem.fetch('difficulty'),
            SiteKit::Search::Contract::FILTER_LANGUAGE => languages,
            SiteKit::Search::Contract::FILTER_CATEGORY => problem.fetch('categories'),
            SiteKit::Search::Contract::FILTER_TEMPLATE => template_labels
          },
          priority: SiteKit::Search::Contract.priority(KIND)
        )
      end
    end
  end
end
