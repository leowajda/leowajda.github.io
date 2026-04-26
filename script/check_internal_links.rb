#!/usr/bin/env ruby
# frozen_string_literal: true

require 'cgi'
require 'bundler/setup'
require 'nokogiri'
require 'pathname'

SITE_DIR = File.expand_path('../_site', __dir__)
IGNORED_SCHEMES = %w[http:// https:// mailto: tel: javascript: data:].freeze
ARIA_REFERENCE_ATTRIBUTES = %w[aria-controls aria-describedby aria-labelledby].freeze

def html_files
  Dir.glob(File.join(SITE_DIR, '**', '*.html'))
end

def parse_html(path)
  Nokogiri::HTML(File.read(path))
end

def anchor_targets(path)
  document = parse_html(path)
  ids = document.css('[id]').filter_map { |node| node['id'] }.to_set
  names = document.css('[name]').filter_map { |node| node['name'] }.to_set
  ids | names
end

def hrefs(document)
  document.css('[href]').filter_map { |node| node['href'] }
end

def internal_href?(href)
  return false if href.nil? || href.empty?

  IGNORED_SCHEMES.none? { |prefix| href.start_with?(prefix) }
end

def resolve_path(current_file, href)
  path_part, anchor = href.split('#', 2)
  decoded_path = CGI.unescape(path_part.to_s)
  decoded_anchor = CGI.unescape(anchor.to_s)

  return [current_file, decoded_anchor] if decoded_path.empty?

  target_base =
    if decoded_path.start_with?('/')
      File.join(SITE_DIR, decoded_path.delete_prefix('/'))
    else
      File.expand_path(decoded_path, File.dirname(current_file))
    end

  candidates =
    if File.extname(target_base) != ''
      [target_base]
    elsif decoded_path.end_with?('/')
      [File.join(target_base, 'index.html')]
    else
      [target_base, "#{target_base}.html", File.join(target_base, 'index.html')]
    end

  [candidates.find { |candidate| File.exist?(candidate) }, decoded_anchor]
end

def collect_failures
  cached_targets = {}
  html_files.flat_map do |current_file|
    document = parse_html(current_file)
    document_failures(current_file, document) + href_failures(current_file, document, cached_targets)
  end
end

def document_failures(path, document)
  duplicate_id_failures(path, document) + semantic_failures(path, document)
end

def duplicate_id_failures(path, document)
  duplicate_ids(document).map { |id| "#{relative_path(path)} -> duplicate id ##{id}" }
end

def href_failures(path, document, cached_targets)
  hrefs(document).filter_map do |raw_href|
    href = raw_href.to_s.strip
    next unless internal_href?(href)

    href_failure(path, href, cached_targets)
  end
end

def href_failure(path, href, cached_targets)
  target_file, anchor = resolve_path(path, href)
  return "#{relative_path(path)} -> missing target #{href}" unless target_file && File.exist?(target_file)
  return if anchor.empty?

  cached_targets[target_file] ||= anchor_targets(target_file)
  return if cached_targets.fetch(target_file).include?(anchor)

  "#{relative_path(path)} -> missing anchor #{href}"
end

def duplicate_ids(document)
  ids = document.css('[id]').filter_map { |node| node['id'] }
  ids.group_by(&:itself).select { |_, values| values.size > 1 }.keys.sort
end

def semantic_failures(path, document)
  ids = document.css('[id]').filter_map { |node| node['id'] }.to_set
  [
    aria_reference_failures(path, document, ids),
    empty_control_failures(path, document),
    hidden_active_failures(path, document)
  ].flatten
end

def aria_reference_failures(path, document, ids)
  ARIA_REFERENCE_ATTRIBUTES.flat_map do |attribute|
    document.css("[#{attribute}]").flat_map do |node|
      node[attribute].to_s.split.filter_map do |id|
        next if ids.include?(id)

        "#{relative_path(path)} -> missing #{attribute} reference ##{id}"
      end
    end
  end
end

def empty_control_failures(path, document)
  document.css('a[href], button').filter_map do |node|
    next if inside_template?(node)

    label = [node['aria-label'], node['title'], node.text].compact.join(' ').strip
    next unless label.empty?

    "#{relative_path(path)} -> empty #{node.name}"
  end
end

def hidden_active_failures(path, document)
  document.css('[hidden].is-active, [hidden][aria-pressed="true"], [hidden][aria-expanded="true"]').filter_map do |node|
    next if inside_template?(node)

    "#{relative_path(path)} -> hidden active #{node.name}"
  end
end

def inside_template?(node)
  node.ancestors.any? { |ancestor| ancestor.name == 'template' }
end

def relative_path(path)
  Pathname.new(path).relative_path_from(Pathname.new(SITE_DIR)).to_s
end

failures = collect_failures

if failures.empty?
  puts 'Internal links verified.'
  exit 0
end

warn 'Internal link check failed:'
failures.each { |failure| warn "  - #{failure}" }
exit 1
