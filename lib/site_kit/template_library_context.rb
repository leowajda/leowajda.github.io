# frozen_string_literal: true

module SiteKit
  class TemplateLibraryContext
    def initialize(documents:, groups:, entries_by_template:, code_collection_config:)
      @documents = documents
      @group_records = groups
      @entries_by_template = entries_by_template
      @code_collection_config = code_collection_config
    end

    def templates
      @templates ||= AlgorithmicTemplateRepository.new(
        documents: documents,
        groups: group_records
      ).load
    end

    def code_collections
      @code_collections ||= TemplateCodeCollectionRegistry.new(
        templates: templates,
        entries_by_template: entries_by_template,
        code_collection_config: code_collection_config
      ).record
    end

    def library
      @library ||= AlgorithmicTemplateGroupBuilder.new(
        templates: templates,
        code_collections: code_collections
      ).build
    end

    def groups
      library.groups
    end

    private

    attr_reader :documents, :group_records, :entries_by_template, :code_collection_config
  end
end
