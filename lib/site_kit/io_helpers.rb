# frozen_string_literal: true

require "time"
require "yaml"

module SiteKit
  module IoHelpers
    extend self

    def read_text(path)
      File.read(path)
    rescue StandardError => error
      raise "Unable to read '#{path}': #{error.message}"
    end

    def maybe_read_text(path)
      File.exist?(path) ? read_text(path) : ""
    end

    def parse_yaml(raw, context)
      YAML.safe_load(raw, permitted_classes: [Time], aliases: false) || {}
    rescue StandardError => error
      raise "#{context}: #{error.message}"
    end
  end
end
