# frozen_string_literal: true

module SiteKit
  class SearchWritingRecordBuilder
    KIND = 'Writing'

    def initialize(documents:, factory:)
      @documents = documents
      @factory = factory
    end

    def records
      documents.map do |document|
        factory.build(
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

    attr_reader :documents, :factory
  end
end
