# frozen_string_literal: true

module SiteKit
  module JekyllRuntime
    GeneratedPageRegistryRecord = Data.define(:pages)

    class GeneratedPageRegistry
      def initialize(eureka_context:, source_notes_context:)
        @eureka_context = eureka_context
        @source_notes_context = source_notes_context
      end

      def record
        @record ||= begin
          page_definitions = eureka_context.generated_pages + source_notes_context.generated_pages
          validate_page_definitions!(page_definitions)
          SiteKit::JekyllRuntime::GeneratedPageRegistryRecord.new(pages: page_definitions)
        end
      end

      private

      attr_reader :eureka_context, :source_notes_context

      def validate_page_definitions!(page_definitions)
        page_definitions.each do |page_definition|
          unless page_definition.is_a?(SiteKit::Pages::Definition)
            raise SiteKit::InvariantError,
                  'Generated pages must be SiteKit::Pages::Definition records'
          end

          route = normalized_route(page_definition.dir)
          raise SiteKit::InvariantError, 'Generated page route must not be empty' if route.empty?
        end

        SiteKit::Core::Helpers.ensure_unique!(
          page_definitions.map { |page_definition| normalized_route(page_definition.dir) },
          'Generated page routes must be unique'
        )
      end

      def normalized_route(route)
        "/#{route.to_s.sub(%r{\A/+}, '').sub(%r{/+\z}, '')}/"
      end
    end
  end
end
