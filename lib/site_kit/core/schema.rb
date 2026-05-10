# frozen_string_literal: true

module SiteKit
  module Core
    class Schema
      def initialize(record, context)
        @record = SiteKit::Core::ValidationHelpers.ensure_hash(record, context)
        @context = context
      end

      def required_hash(key)
        SiteKit::Core::ValidationHelpers.ensure_hash(record.fetch(key), field_context(key))
      end

      def required_array(key)
        SiteKit::Core::ValidationHelpers.ensure_array(record.fetch(key), field_context(key))
      end

      def required_array_of_strings(key)
        SiteKit::Core::ValidationHelpers.ensure_array_of_strings(record.fetch(key), field_context(key))
      end

      def required_string(key)
        SiteKit::Core::ValidationHelpers.ensure_string(record.fetch(key), field_context(key))
      end

      def required_integer(key)
        SiteKit::Core::ValidationHelpers.ensure_integer(record.fetch(key), field_context(key))
      end

      def optional_array(key, default: [])
        SiteKit::Core::ValidationHelpers.ensure_array(record.fetch(key, default), field_context(key))
      end

      def optional_array_of_strings(key, default: [])
        SiteKit::Core::ValidationHelpers.ensure_array_of_strings(record.fetch(key, default), field_context(key))
      end

      def optional_string(key, default: '')
        SiteKit::Core::ValidationHelpers.ensure_string(record.fetch(key, default), field_context(key))
      end

      def key?(key)
        record.key?(key)
      end

      def fetch(key, *fallback, &)
        record.fetch(key, *fallback, &)
      end

      private

      attr_reader :record, :context

      def field_context(key)
        "#{context}.#{key}"
      end
    end
  end
end
