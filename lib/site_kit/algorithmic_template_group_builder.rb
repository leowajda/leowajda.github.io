# frozen_string_literal: true

module SiteKit
  AlgorithmicTemplateLibrary = Data.define(:records, :groups)

  class AlgorithmicTemplateGroupBuilder
    def initialize(templates:, code_collections:)
      @templates = templates
      @code_collections = code_collections
    end

    def build
      template_records = templates.map do |template|
        {
          "template_id" => template.template_id,
          "title" => template.title,
          "group" => template.group_id,
          "group_title" => template.group_title,
          "group_order" => template.group_order,
          "order" => template.order,
          "description" => template.description,
          "eureka_categories" => template.eureka_categories,
          "flowchart_nodes" => template.flowchart_nodes,
          "code_collection" => code_collections.fetch(template.template_id)
        }
      end

      AlgorithmicTemplateLibrary.new(
        records: template_records,
        groups: template_records
          .group_by { |template| template.fetch("group") }
          .map do |group_id, grouped_templates|
            first = grouped_templates.first
            {
              "id" => group_id,
              "title" => first.fetch("group_title"),
              "order" => first.fetch("group_order"),
              "templates" => grouped_templates.sort_by { |template| [template.fetch("order"), template.fetch("title").downcase] }
            }
          end
          .sort_by { |group| [group.fetch("order"), group.fetch("title").downcase] }
      )
    end

    private

    attr_reader :templates, :code_collections
  end
end
