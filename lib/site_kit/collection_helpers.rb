# frozen_string_literal: true

module SiteKit
  module CollectionHelpers
    extend self

    def index_by(values)
      values.each_with_object({}) do |value, result|
        result[yield(value)] = value
      end
    end
  end
end
