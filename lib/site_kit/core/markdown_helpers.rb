# frozen_string_literal: true

module SiteKit
  module Core
    module MarkdownHelpers
      module_function

      MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\((?<reference><[^>]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\)/

      def raw_github_url(source_url_base, relative_path)
        return '' if source_url_base.to_s.empty?

        case source_url_base
        when %r{\Ahttps://github\.com/([^/]+/[^/]+)/(?:blob|tree)/([^/]+)\z}
          "https://raw.githubusercontent.com/#{Regexp.last_match(1)}/#{Regexp.last_match(2)}/#{relative_path}"
        else
          [source_url_base.delete_suffix('/'), relative_path].join('/')
        end
      end

      def rewrite_markdown_images(markdown, base_directory, source_url_base, source_root: SiteKit::Core::Helpers.repo_root)
        return markdown.to_s.strip if markdown.to_s.empty?

        rewritten = markdown.to_s.gsub(MARKDOWN_IMAGE_PATTERN) do |match_text|
          reference = Regexp.last_match[:reference].to_s
          raw_reference = sanitize_asset_path(reference)
          next match_text if raw_reference.empty? || raw_reference.start_with?('http://', 'https://', '/')

          source_path = File.expand_path(raw_reference, base_directory)
          next match_text unless File.exist?(source_path)

          relative_asset_path = SiteKit::Core::Helpers.relative_path(source_root, source_path)
          public_reference = raw_github_url(source_url_base, relative_asset_path)
          match_text.sub(reference, public_reference)
        end

        rewritten.strip
      end

      def sanitize_asset_path(raw_path)
        path = raw_path.to_s.strip
        return path[1...-1].to_s if path.start_with?('<') && path.end_with?('>')

        path.split(/\s+/).first.to_s
      end
    end
  end
end
