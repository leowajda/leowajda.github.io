# frozen_string_literal: true

module SiteKit
  module Invariants
    module_function

    def check!(guide:, explorers:, topics:)
      check_template_reference_rules!(guide, topics)
      check_explorers!(explorers)
    end

    def check_template_reference_rules!(guide, topics)
      known = topics.values.flat_map { |registry| registry.fetch('categories').keys }.uniq
      unknown = guide.fetch('reference_rules').flat_map do |rule|
        rule.fetch('problem_rule').values.flatten
      end.uniq - known
      return if unknown.empty?

      raise SiteKit::InvariantError,
            "Template guide reference rules use unknown problem categories: #{unknown.sort.join(', ')}"
    end

    def check_explorers!(explorers)
      explorers.each_value do |explorer|
        if explorer.fetch('filters').key?('patterns')
          raise SiteKit::InvariantError, 'Problem explorer filters must not include template patterns'
        end

        explorer.fetch('problems').each do |problem|
          DISALLOWED_PROBLEM_TEMPLATE_KEYS.each do |key|
            next unless problem.key?(key)

            raise SiteKit::InvariantError,
                  "Problem '#{problem.fetch('problem_slug')}' must not include #{key}"
          end

          problem.fetch('template_references').each do |reference|
            next unless reference.fetch('url', '').empty?

            raise SiteKit::InvariantError,
                  "Problem '#{problem.fetch('problem_slug')}' template reference " \
                  "'#{reference.fetch('target')}' is missing a URL"
          end
        end
      end
    end
  end
end
