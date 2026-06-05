# frozen_string_literal: true

module SiteKit
  module Search
    class WritingRecordBuilder
      KIND = SiteKit::Search::Contract::KIND_WRITING

      def initialize(documents:)
        @documents = documents
      end

      def records
        documents.map do |document|
          SiteKit::Search::Record.build(
            kind: KIND,
            title: document.data.fetch('title'),
            url: document.url,
            project: document.data.fetch('project_title', ''),
            summary: document.data.fetch('description', ''),
            content: [
              document.data.fetch('title'),
              document.data.fetch('description', ''),
              document.content
            ],
            priority: 50
          )
        end
      end

      private

      attr_reader :documents
    end
  end
end
