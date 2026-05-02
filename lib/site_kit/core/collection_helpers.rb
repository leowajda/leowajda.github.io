# frozen_string_literal: true

module SiteKit
  module Core
    module CollectionHelpers
      module_function

      def index_by(values)
        values.to_h do |value|
          [yield(value), value]
        end
      end
    end
  end
end
