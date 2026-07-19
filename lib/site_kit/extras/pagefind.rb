# frozen_string_literal: true

module SiteKit
  module Extras
    # Hash-target Pagefind records (templates + flowchart nodes only).
    module Pagefind
      module_function

      def records(template_guide:, flowchart:, flowchart_summaries: {})
        factory = SiteKit::Search::RecordFactory.new
        [
          SiteKit::Search::TemplateRecordBuilder.new(guide: template_guide, factory: factory),
          SiteKit::Search::FlowchartRecordBuilder.new(
            flowchart: flowchart,
            summaries: flowchart_summaries,
            factory: factory
          )
        ].flat_map(&:records)
      end
    end
  end
end
