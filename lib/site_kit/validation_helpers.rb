# frozen_string_literal: true

module SiteKit
  module ValidationHelpers
    extend self

    def ensure_hash(value, context)
      return value if value.is_a?(Hash)

      raise "#{context} must be a mapping"
    end

    def ensure_string(value, context)
      return value if value.is_a?(String)

      raise "#{context} must be a string"
    end

    def ensure_array(value, context)
      return value if value.is_a?(Array)

      raise "#{context} must be an array"
    end

    def ensure_integer_or_nil(value, context)
      return nil if value.nil?
      return value if value.is_a?(Integer)

      raise "#{context} must be an integer"
    end

    def ensure_integer(value, context)
      return value if value.is_a?(Integer)

      raise "#{context} must be an integer"
    end

    def ensure_boolean_or_nil(value, context)
      return value if value.nil? || value == true || value == false

      raise "#{context} must be a boolean"
    end

    def ensure_array_of_strings(value, context)
      unless value.is_a?(Array) && value.all? { |item| item.is_a?(String) }
        raise "#{context} must be an array of strings"
      end

      value
    end
  end
end
