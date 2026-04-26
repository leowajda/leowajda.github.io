# frozen_string_literal: true

module SiteKit
  module CollectionHelpers
    extend self

    def index_by(values)
      values.to_h do |value|
        [yield(value), value]
      end
    end
  end
end
