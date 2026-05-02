# frozen_string_literal: true

module SiteKit
  module Eureka
    class FilterPanelBuilder
      def initialize(browser:, active_language:)
        @browser = browser
        @active_language = active_language
      end

      def build
        {
          'sections' => [search_section, *language_sections, difficulty_section, category_section].compact
        }
      end

      private

      attr_reader :browser, :active_language

      def search_section
        section(
          kind: 'search',
          title: 'Search',
          class: 'side-panel__section--search',
          title_tag: 'label',
          title_for: 'problem-search'
        )
      end

      def language_sections
        return [scope_section, route_section] if active_language

        [languages_section]
      end

      def scope_section
        section(
          kind: 'scope',
          title: 'Scope',
          label: active_language.fetch('label'),
          url: browser.fetch('browser_url'),
          link_label: 'Show all languages'
        )
      end

      def route_section
        section(
          kind: 'links',
          title: 'Routes',
          aria_label: 'Eureka views',
          links: [
            link_item(label: 'All languages', url: browser.fetch('browser_url'))
          ] + browser.fetch('languages').map do |language|
            link_item(
              label: language.fetch('label'),
              url: language.fetch('url'),
              active: active_language.fetch('slug') == language.fetch('slug')
            )
          end
        )
      end

      def difficulty_section
        section(
          kind: 'radios',
          title: 'Difficulty',
          aria_label: 'Difficulty',
          input_name: 'difficulty',
          items: [
            choice_item(value: '', label: 'All difficulties', checked: true)
          ] + browser.fetch('filters').fetch('difficulties').map do |difficulty|
            choice_item(value: difficulty, label: difficulty)
          end
        )
      end

      def category_section
        section(
          kind: 'categories',
          title: 'Categories',
          items: browser.fetch('filters').fetch('categories').map do |category|
            choice_item(value: category, label: category)
          end
        )
      end

      def languages_section
        section(
          kind: 'checkboxes',
          title: 'Languages',
          aria_label: 'Languages',
          items: browser.fetch('filters').fetch('languages').map do |language|
            choice_item(
              value: language.fetch('slug'),
              label: language.fetch('label'),
              search_value: language.fetch('label'),
              checked: true,
              class_name: 'filter-option filter-option--stacked filter-option--language'
            )
          end,
          wrapper_class: 'filter-options filter-options--stacked filter-options--languages',
          input_name: 'language'
        )
      end

      def section(kind:, title:, **attributes)
        record(kind:, title:, **attributes)
      end

      def link_item(label:, url:, active: nil)
        record(label:, url:, active:)
      end

      def choice_item(value:, label:, checked: nil, class_name: nil, count: nil, search_value: nil)
        record(value:, label:, checked:, class: class_name, count:, search_value:)
      end

      def record(**attributes)
        SiteKit::Core::RecordHelpers.compact_string_keys(**attributes)
      end
    end
  end
end
