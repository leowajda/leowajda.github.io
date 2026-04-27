# frozen_string_literal: true

module SiteKit
  class TemplateLibraryPageContextBuilder
    def initialize(template_guide:, eureka_browsers:, page_link_resolver:)
      @template_guide = template_guide
      @eureka_browsers = eureka_browsers
      @page_link_resolver = page_link_resolver
    end

    def attach(document)
      default_target = template_guide.fetch('default_target')

      document.data['template_guide'] = view_record(default_target)
      document.data['default_template_target'] = default_target
      project_slug = document.data.fetch('project_slug')
      document.data['project_title'] ||= eureka_browsers.fetch(project_slug).fetch('project_title')
      document.data['header_links'] = page_link_resolver.links_for('algorithmic_templates')
    end

    private

    attr_reader :template_guide, :eureka_browsers, :page_link_resolver

    def view_record(default_target)
      rendered_target = rendered_default_target(default_target)
      template_guide.merge(
        'patterns' => pattern_records(default_target, rendered_target),
        'template_panels' => template_panel_records(rendered_target)
      )
    end

    def pattern_records(default_target, rendered_target)
      template_guide.fetch('patterns').map do |pattern|
        pattern.merge(
          'active' => pattern_active?(pattern, default_target, rendered_target),
          'variants' => variant_records(pattern, rendered_target)
        )
      end
    end

    def variant_records(pattern, rendered_target)
      pattern.fetch('variants').map do |variant|
        variant.merge(
          'active' => variant.fetch('target') == rendered_target
        )
      end
    end

    def template_panel_records(rendered_target)
      template_guide.fetch('template_panels').map do |template|
        template.merge(
          'active' => template.fetch('target') == rendered_target,
          'code_collection_id' => "#{template.fetch('target').tr('/', '-')}-code"
        )
      end
    end

    def rendered_default_target(default_target)
      target_pattern = template_guide.fetch('patterns').find { |pattern| pattern.fetch('target') == default_target }
      return target_pattern.fetch('default_target') if target_pattern

      default_target
    end

    def pattern_active?(pattern, default_target, rendered_target)
      pattern.fetch('target') == default_target ||
        pattern.fetch('variants').any? { |variant| variant.fetch('target') == rendered_target }
    end
  end
end
