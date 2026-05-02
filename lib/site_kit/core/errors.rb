# frozen_string_literal: true

module SiteKit
  class Error < StandardError; end

  class CatalogError < Error; end

  class ConfigurationError < Error; end

  class InvariantError < Error; end

  class SourceError < Error; end
end
