# frozen_string_literal: true

module SiteKit
  module Build
    class Validator
      def initialize(context:)
        @context = context
      end

      def validate!
        errors = []
        check(errors, 'template library') { validate_template_library! }
        check(errors, 'eureka projects') { validate_eureka_projects! }
        check(errors, 'source notes projects') { validate_source_notes_projects! }
        check(errors, 'site project navigation') { context.site_projects }
        check(errors, 'generated pages') { context.generated_pages }
        check(errors, 'vendor assets') { SiteKit::Checks::VendorAssets.new.validate! }
        return if errors.empty?

        raise SiteKit::InvariantError, "Build validation failed:\n- #{errors.join("\n- ")}"
      end

      private

      attr_reader :context

      def check(errors, label)
        yield
      rescue SiteKit::Error => e
        errors << "#{label}: #{e.message}"
      end

      def validate_template_library!
        library = context.template_library_context
        library.templates
        library.code_collections
        library.guide
      end

      def validate_eureka_projects!
        context.eureka_context.browsers
        context.eureka_context.topics
        validate_template_reference_rules!
        validate_flowchart!
        context.eureka_context.projects.each_value do |project|
          validate_eureka_browser!(project.browser_record)
          project.generated_language_pages
          project.generated_problem_pages
          project.generated_implementation_pages
        end
      end

      def validate_template_reference_rules!
        unknown_labels = template_reference_rule_labels - known_problem_category_labels
        return if unknown_labels.empty?

        raise SiteKit::InvariantError,
              "Template guide reference rules use unknown problem categories: #{unknown_labels.sort.join(', ')}"
      end

      def validate_flowchart!
        SiteKit::Flowcharts::GraphIndex.new(flowchart: context.flowchart_data).incoming_edges_by_target
      end

      def validate_eureka_browser!(browser)
        if browser.fetch('filters').key?('patterns')
          raise SiteKit::InvariantError,
                'Problem explorer filters must not include template patterns'
        end

        browser.fetch('problems').each do |problem|
          validate_problem_template_references!(problem)
        end
      end

      def validate_problem_template_references!(problem)
        disallowed_problem_keys.each do |key|
          if problem.key?(key)
            raise SiteKit::InvariantError,
                  "Problem '#{problem.fetch('problem_slug')}' must not include #{key}"
          end
        end

        problem.fetch('template_references').each do |reference|
          validate_template_reference!(problem.fetch('problem_slug'), reference)
        end
      end

      def validate_template_reference!(problem_slug, reference)
        target = reference.fetch('target')
        unless guide_targets.include?(target)
          raise SiteKit::InvariantError,
                "Problem '#{problem_slug}' references unknown template guide target '#{target}'"
        end
        return unless reference.fetch('url', '').empty?

        raise SiteKit::InvariantError, "Problem '#{problem_slug}' template reference '#{target}' is missing a URL"
      end

      def disallowed_problem_keys
        DISALLOWED_PROBLEM_TEMPLATE_KEYS
      end

      def guide_targets
        @guide_targets ||= context.template_library_context.guide.fetch('patterns').flat_map do |pattern|
          [pattern.fetch('target'), *pattern.fetch('variants').map { |variant| variant.fetch('target') }]
        end
      end

      def template_reference_rule_labels
        context.template_library_context.guide.fetch('reference_rules').flat_map do |rule|
          rule.fetch('problem_rule').values.flatten
        end.uniq
      end

      def known_problem_category_labels
        context.eureka_context.topics.values.flat_map do |registry|
          registry.fetch('categories').keys
        end.uniq
      end

      def validate_source_notes_projects!
        context.source_notes_context.registries
        context.source_notes_context.projects.each_value do |project|
          project.generated_language_pages
          project.generated_module_pages
          project.generated_document_pages
        end
      end
    end
  end
end
