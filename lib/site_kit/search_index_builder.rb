# frozen_string_literal: true

module SiteKit
  class SearchIndexBuilder
    def initialize(context:, site:)
      @context = context
      @site = site
      @factory = SearchRecordFactory.new
    end

    def records
      @records ||= record_builders.flat_map(&:records)
    end

    private

    attr_reader :context, :site, :factory

    def record_builders
      [
        page_builder,
        problem_builder,
        template_builder,
        flowchart_builder,
        source_builder,
        writing_builder
      ]
    end

    def page_builder
      @page_builder ||= SearchPageRecordBuilder.new(
        factory:
      )
    end

    def problem_builder
      @problem_builder ||= SearchProblemRecordBuilder.new(
        browsers: context.eureka_context.browsers,
        factory:
      )
    end

    def template_builder
      @template_builder ||= SearchTemplateRecordBuilder.new(
        guide: context.template_library_context.guide,
        factory:
      )
    end

    def flowchart_builder
      @flowchart_builder ||= SearchFlowchartRecordBuilder.new(
        flowchart: context.flowchart_data,
        summaries: eureka_data.fetch('flowchart_summaries', {}),
        factory:
      )
    end

    def source_builder
      @source_builder ||= SearchSourceRecordBuilder.new(
        registries: context.source_notes_context.registries,
        factory:
      )
    end

    def writing_builder
      @writing_builder ||= SearchWritingRecordBuilder.new(
        documents: site.collections.fetch('posts').docs,
        factory:
      )
    end

    def eureka_data
      @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE)
    end
  end
end
