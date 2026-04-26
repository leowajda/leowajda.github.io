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
      raise "#{context} must be an array of strings" unless value.is_a?(Array) && value.all?(String)

      value
    end

    def duplicates(values)
      values.group_by(&:itself).select { |_, entries| entries.size > 1 }.keys.sort
    end

    def ensure_unique!(values, context)
      duplicate_values = duplicates(values)
      return if duplicate_values.empty?

      raise "#{context}: #{duplicate_values.join(', ')}"
    end
  end
end
