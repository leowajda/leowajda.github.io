# frozen_string_literal: true

require 'pathname'

module SiteKit
  module Core
    module PathHelpers
      module_function

      def repo_root
        @repo_root ||= File.expand_path('../../..', __dir__)
      end

      def site_source
        @site_source ||= File.join(repo_root, 'site-src')
      end

      def slugify(value)
        value
          .to_s
          .downcase
          .gsub(/[^a-z0-9_-]/, '-')
          .squeeze('-')
          .gsub(/\A-|-+\z/, '')
      end

      def human_label(value)
        value
          .tr('_', ' ')
          .split
          .map { |part| part[0] ? part[0].upcase + part[1..] : part }
          .join(' ')
      end

      def relative_path(from_path, to_path)
        Pathname.new(to_path).relative_path_from(Pathname.new(from_path)).to_s.tr(File::SEPARATOR, '/')
      end

      def inside_path?(root_path, candidate_path)
        root = Pathname(root_path).cleanpath.to_s
        candidate = Pathname(candidate_path).cleanpath.to_s

        candidate == root || candidate.start_with?("#{root}#{File::SEPARATOR}")
      end

      def confined_path(root_path, relative_path, context:, error_class:)
        root = Pathname(root_path).expand_path
        path = root.join(relative_path).expand_path
        raise error_class, "#{context} escapes the source root" unless inside_path?(root, path)

        return path unless path.exist?

        real_root = root.realpath
        real_path = path.realpath
        return real_path if inside_path?(real_root, real_path)

        raise error_class, "#{context} escapes the source root"
      end

      def slugify_path_segment(value)
        value
          .gsub(/([a-z0-9])([A-Z])/, '\1-\2')
          .gsub(/[_\s]+/, '-')
          .gsub(/[^a-zA-Z0-9-]/, '-')
          .downcase
          .squeeze('-')
          .gsub(/\A-|-+\z/, '')
      end

      def build_route_path(relative_path)
        segments = relative_path.split('/')
        segments.each_with_index.map do |segment, index|
          next slugify_path_segment(segment) unless index == segments.length - 1

          slugify_path_segment(File.basename(segment, File.extname(segment)))
        end.reject(&:empty?).join('/')
      end
    end
  end
end
