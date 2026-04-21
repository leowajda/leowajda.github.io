# frozen_string_literal: true

module SiteKit
  module MarkdownHelpers
    extend self

    MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/

    def raw_github_url(source_url_base, relative_path)
      return "" if source_url_base.to_s.empty?

      case source_url_base
      when %r{\Ahttps://github\.com/([^/]+/[^/]+)/(?:blob|tree)/([^/]+)\z}
        "https://raw.githubusercontent.com/#{Regexp.last_match(1)}/#{Regexp.last_match(2)}/#{relative_path}"
      else
        [source_url_base.sub(%r{/\z}, ""), relative_path].join("/")
      end
    end

    def rewrite_markdown_images(markdown, base_directory, source_url_base, source_root: Helpers.repo_root)
      return markdown.to_s.strip if markdown.to_s.empty?

      rewritten = markdown.dup
      markdown.to_enum(:scan, MARKDOWN_IMAGE_PATTERN).map { Regexp.last_match }.each do |match|
        raw_reference = sanitize_asset_path(match[2].to_s)
        next if raw_reference.empty? || raw_reference.start_with?("http://", "https://", "/")

        source_path = File.expand_path(raw_reference, base_directory)
        next unless File.exist?(source_path)

        relative_asset_path = Helpers.relative_path(source_root, source_path)
        public_reference = raw_github_url(source_url_base, relative_asset_path)
        rewritten.gsub!("](#{raw_reference})", "](#{public_reference})")
        rewritten.gsub!("](<#{raw_reference}>)", "](#{public_reference})")
      end

      rewritten.strip
    end

    def sanitize_asset_path(raw_path)
      raw_path.gsub(/\A<|>\z/, "").split(/\s+/).first.to_s
    end
  end
end
