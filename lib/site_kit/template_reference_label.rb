# frozen_string_literal: true

module SiteKit
  module TemplateReferenceLabel
    module_function

    def call(pattern:, variant: nil)
      parts(pattern:, variant:).values.reject(&:empty?).join(' ')
    end

    def parts(pattern:, variant: nil)
      pattern_label = text(pattern)
      return { 'child' => pattern_label } unless variant

      {
        'parent' => pattern_label,
        'child' => text(variant)
      }
    end

    def text(record)
      record.fetch('label').to_s.strip
    end
  end
end
