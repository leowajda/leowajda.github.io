# frozen_string_literal: true

module SiteKit
  module Core
    # Site-wide URL algebra: /{project}/{collection}/{id}/[+embed/][+#fragment]
    class ResourcePaths
      def initialize(route_base:)
        @route_base = normalize_segment(route_base)
      end

      def root
        join
      end

      def path(*segments)
        join(*segments)
      end

      alias catalog path
      alias item path

      def embed(*segments)
        join(*segments, 'embed')
      end

      def with_fragment(path, fragment)
        token = fragment.to_s.strip
        return path if token.empty?

        "#{path}##{token}"
      end

      private

      attr_reader :route_base

      def join(*segments)
        parts = [route_base, *segments.map { |segment| normalize_segment(segment) }].compact
        return '/' if parts.empty?

        "/#{parts.join('/')}/"
      end

      def normalize_segment(value)
        segment = value.to_s.strip.delete_prefix('/').delete_suffix('/')
        segment.empty? ? nil : segment
      end
    end
  end
end
