# frozen_string_literal: true

module SiteKit
  module Eureka
    module Topics
      module_function

      def record(project_slug:, topics:, templates:, template_guide:, problem_records:)
        _ = project_slug
        validate_templates!(topics, templates)
        categories = category_index(topics)
        validate_problem_categories!(problem_records, categories)

        resolver = SiteKit::Templates::Guide::ReferenceResolver.new(guide: template_guide)
        problems = problem_records.to_h do |problem|
          labels = problem.fetch('categories')
          [
            problem.fetch('problem_slug'),
            { 'template_references' => resolver.references_for_categories(labels) }
          ]
        end

        {
          'categories' => categories,
          'problems' => problems
        }
      end

      def validate_templates!(topics, templates)
        template_ids = templates.to_h { |template| [template.template_id, true] }
        topics.each do |topic|
          next unless topic.template?

          next if template_ids.key?(topic.template_id)

          raise SiteKit::CatalogError,
                "Algorithmic topic '#{topic.id}' references missing template '#{topic.template_id}'"
        end
      end

      def category_index(topics)
        index = {}
        topics.each do |topic|
          category_labels(topic).each do |label|
            index[label] ||= { 'topic_ids' => [] }
            index[label]['topic_ids'] |= [topic.id]
          end
        end
        index
      end

      def category_labels(topic)
        rule_labels = topic.problem_rules.flat_map { |rule| rule.fetch('all', []) + rule.fetch('any', []) }
        (topic.aliases + rule_labels).uniq
      end

      def validate_problem_categories!(problem_records, categories)
        unknown = problem_records.flat_map { |problem| problem.fetch('categories') }.uniq - categories.keys
        return if unknown.empty?

        raise SiteKit::CatalogError,
              "Eureka problem categories are not mapped to local topics: #{unknown.sort.join(', ')}"
      end
    end
  end
end
