# frozen_string_literal: true

module SiteKit
  class ProblemTableBuilder
    def initialize(browser:, active_language:)
      @browser = browser
      @active_language = active_language
    end

    def build
      {
        'mode' => active_language ? 'single-language' : 'matrix',
        'language_filter' => active_language&.fetch('slug', '') || '',
        'columns' => visible_languages,
        'rows' => visible_rows
      }
    end

    private

    attr_reader :browser, :active_language

    def visible_languages
      @visible_languages ||= visible_languages_record
    end

    def visible_rows
      browser.fetch('problems').filter_map do |problem|
        next if active_language && !problem_visible_for_language?(problem)

        {
          'problem_slug' => problem.fetch('problem_slug'),
          'difficulty' => problem.fetch('difficulty'),
          'difficulty_slug' => problem.fetch('difficulty_slug'),
          'categories' => problem.fetch('categories'),
          'language_slugs' => problem.fetch('languages').map { |language| language.fetch('slug') },
          'title' => problem.fetch('title'),
          'url' => problem.fetch('url'),
          'cells' => visible_languages.map do |language|
            {
              'language_slug' => language.fetch('slug'),
              'language_label' => language.fetch('label'),
              'implementations' => problem.fetch('implementations_by_language', {}).fetch(language.fetch('slug'), [])
            }
          end
        }
      end
    end

    def problem_visible_for_language?(problem)
      problem.fetch('languages').any? { |language| language.fetch('slug') == active_language.fetch('slug') }
    end

    def visible_languages_record
      languages = browser.fetch('filters').fetch('languages')
      return languages unless active_language

      languages.select { |language| language.fetch('slug') == active_language.fetch('slug') }
    end
  end
end
