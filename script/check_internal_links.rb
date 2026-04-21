#!/usr/bin/env ruby
# frozen_string_literal: true

require "cgi"
require "pathname"

SITE_DIR = File.expand_path("../_site", __dir__)
HREF_PATTERN = /href=(["'])(.*?)\1/i
ID_PATTERN = /\sid=(["'])(.*?)\1/i
NAME_PATTERN = /\sname=(["'])(.*?)\1/i
IGNORED_SCHEMES = %w[http:// https:// mailto: tel: javascript: data:].freeze

def html_files
  Dir.glob(File.join(SITE_DIR, "**", "*.html")).sort
end

def anchor_targets(path)
  content = File.read(path)
  ids = content.scan(ID_PATTERN).map { |_quote, id| id }.to_set
  names = content.scan(NAME_PATTERN).map { |_quote, name| name }.to_set
  [content, ids | names]
end

def internal_href?(href)
  return false if href.nil? || href.empty?

  IGNORED_SCHEMES.none? { |prefix| href.start_with?(prefix) }
end

def resolve_path(current_file, href)
  path_part, anchor = href.split("#", 2)
  decoded_path = CGI.unescape(path_part.to_s)
  decoded_anchor = CGI.unescape(anchor.to_s)

  if decoded_path.empty?
    return [current_file, decoded_anchor]
  end

  target_base =
    if decoded_path.start_with?("/")
      File.join(SITE_DIR, decoded_path.delete_prefix("/"))
    else
      File.expand_path(decoded_path, File.dirname(current_file))
    end

  candidates =
    if File.extname(target_base) != ""
      [target_base]
    elsif decoded_path.end_with?("/")
      [File.join(target_base, "index.html")]
    else
      [target_base, "#{target_base}.html", File.join(target_base, "index.html")]
    end

  [candidates.find { |candidate| File.exist?(candidate) }, decoded_anchor]
end

def collect_failures
  require "set"

  cached_targets = {}
  failures = []

  html_files.each do |current_file|
    content = File.read(current_file)

    content.scan(HREF_PATTERN).each do |_quote, raw_href|
      href = raw_href.to_s.strip
      next unless internal_href?(href)

      target_file, anchor = resolve_path(current_file, href)
      unless target_file && File.exist?(target_file)
        failures << "#{relative_path(current_file)} -> missing target #{href}"
        next
      end

      next if anchor.empty?

      cached_targets[target_file] ||= anchor_targets(target_file)
      _target_content, targets = cached_targets[target_file]
      next if targets.include?(anchor)

      failures << "#{relative_path(current_file)} -> missing anchor #{href}"
    end
  end

  failures
end

def relative_path(path)
  Pathname.new(path).relative_path_from(Pathname.new(SITE_DIR)).to_s
end

failures = collect_failures

if failures.empty?
  puts "Internal links verified."
  exit 0
end

warn "Internal link check failed:"
failures.each { |failure| warn "  - #{failure}" }
exit 1
