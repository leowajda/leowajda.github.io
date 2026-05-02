# frozen_string_literal: true

module SiteKit
  module Core
    module RecordHelpers
      module_function

      def compact_string_keys(**attributes)
        attributes.each_with_object({}) do |(key, value), result|
          result[key.to_s] = value unless value.nil?
        end
      end

      def compact_hash(attributes)
        attributes.each_with_object({}) do |(key, value), result|
          result[key] = value unless blank_value?(value)
        end
      end

      def blank_value?(value)
        value.nil? || (value.respond_to?(:empty?) && value.empty?)
      end
    end
  end
end
