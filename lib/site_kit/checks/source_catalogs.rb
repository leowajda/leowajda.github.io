# frozen_string_literal: true

module SiteKit
  module Checks
    class SourceCatalogs
      def initialize(source: SiteKit::Core::Helpers.site_source, destination: nil)
        @source = source
        @destination = destination
      end

      def validate!
        SiteKit::JekyllRuntime::SiteLoader.new(source:, destination:).read do |site|
          SiteKit::Build::Context.for(site).validate!
        end
      end

      private

      attr_reader :source, :destination
    end
  end
end
