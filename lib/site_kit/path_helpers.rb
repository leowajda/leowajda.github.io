# frozen_string_literal: true

require "pathname"

module SiteKit
  module PathHelpers
    extend self

    def repo_root
      @repo_root ||= File.expand_path("../..", __dir__)
    end

    def site_source
      @site_source ||= File.join(repo_root, "site-src")
    end

    def slugify(value)
      value.downcase.gsub(/[^a-z0-9_-]/, "-")
    end

    def human_label(value)
      value
        .tr("_", " ")
        .split(" ")
        .map { |part| part[0] ? part[0].upcase + part[1..] : part }
        .join(" ")
    end

    def relative_path(from_path, to_path)
      Pathname.new(to_path).relative_path_from(Pathname.new(from_path)).to_s.tr(File::SEPARATOR, "/")
    end

    def slugify_path_segment(value)
      value
        .gsub(/([a-z0-9])([A-Z])/, '\1-\2')
        .gsub(/[_\s]+/, "-")
        .gsub(/[^a-zA-Z0-9-]/, "-")
        .downcase
        .gsub(/-+/, "-")
        .gsub(/\A-|-+\z/, "")
    end

    def build_route_path(relative_path)
      segments = relative_path.split("/")
      segments.each_with_index.map do |segment, index|
        next slugify_path_segment(segment) unless index == segments.length - 1

        slugify_path_segment(File.basename(segment, File.extname(segment)))
      end.reject(&:empty?).join("/")
    end
  end
end
