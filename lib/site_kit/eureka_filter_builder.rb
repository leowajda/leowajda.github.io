# frozen_string_literal: true

module SiteKit
  class EurekaFilterBuilder
    def initialize(problem_records:, language_page_records:)
      @problem_records = problem_records
      @language_page_records = language_page_records
    end

    def build
      {
        "difficulties" => problem_records.map { |problem| problem.fetch("difficulty") }.uniq,
        "categories" => problem_records.flat_map { |problem| problem.fetch("categories") }.uniq,
        "languages" => language_page_records.map { |language| language.slice("slug", "label", "url") }
      }
    end

    private

    attr_reader :problem_records, :language_page_records
  end
end
