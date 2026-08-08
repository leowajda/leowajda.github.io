# frozen_string_literal: true

module SiteKit
  module Core
    class ResourcePaths
      def initialize(route_base:)
        @route_base = normalize(route_base)
      end

      def root
        join
      end

      def path(*segments)
        join(*segments)
      end

      def embed(*segments)
        join(*segments, 'embed')
      end

      def with_fragment(path, fragment)
        token = fragment.to_s.strip
        token.empty? ? path : "#{path}##{token}"
      end

      private

      attr_reader :route_base

      def join(*segments)
        parts = [route_base, *segments.map { |segment| normalize(segment) }].compact
        return '/' if parts.empty?

        "/#{parts.join('/')}/"
      end

      def normalize(value)
        segment = value.to_s.strip.delete_prefix('/').delete_suffix('/')
        segment.empty? ? nil : segment
      end
    end
  end
end
