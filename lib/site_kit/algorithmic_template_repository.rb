# frozen_string_literal: true

module SiteKit
  AlgorithmicTemplate = Data.define(
    :template_id,
    :title,
    :group_id,
    :group_title,
    :group_order,
    :order,
    :description,
    :eureka_categories,
    :flowchart_nodes
  )

  class AlgorithmicTemplateRepository
    def initialize(documents:, groups:)
      @documents = documents
      @groups = groups
    end

    def load
      @load ||= begin
        group_index = build_group_index

        templates = documents.map do |document|
          data = Helpers.ensure_hash(document.data, "Algorithmic template #{document.relative_path}")
          template_id = Helpers.ensure_string(data["template_id"], "Algorithmic template #{document.relative_path}.template_id")
          group_id = Helpers.ensure_string(data["group"], "Algorithmic template #{template_id}.group")
          group_record = group_index.fetch(group_id) do
            raise "Algorithmic template '#{template_id}' references unknown group '#{group_id}'"
          end

          AlgorithmicTemplate.new(
            template_id: template_id,
            title: Helpers.ensure_string(data["title"], "Algorithmic template #{template_id}.title"),
            group_id: group_id,
            group_title: group_record.fetch("title"),
            group_order: group_record.fetch("order"),
            order: Helpers.ensure_integer(data["order"], "Algorithmic template #{template_id}.order"),
            description: Helpers.ensure_string(data["description"], "Algorithmic template #{template_id}.description"),
            eureka_categories: Helpers.ensure_array_of_strings(
              data["eureka_categories"] || [],
              "Algorithmic template #{template_id}.eureka_categories"
            ),
            flowchart_nodes: Helpers.ensure_array_of_strings(
              data["flowchart_nodes"] || [],
              "Algorithmic template #{template_id}.flowchart_nodes"
            )
          )
        end

        template_ids = templates.map(&:template_id)
        duplicate_template_ids = template_ids.group_by(&:itself).select { |_, ids| ids.size > 1 }.keys
        unless duplicate_template_ids.empty?
          raise "Algorithmic template ids must be unique: #{duplicate_template_ids.join(', ')}"
        end

        templates.sort_by { |template| [template.group_order, template.order, template.title.downcase] }
      end
    end

    private

    attr_reader :documents, :groups

    def build_group_index
      Helpers.ensure_array(groups, "Template groups").each_with_object({}) do |entry, result|
        group = Helpers.ensure_hash(entry, "Template groups[]")
        group_id = Helpers.ensure_string(group["id"], "Template group.id")
        result[group_id] = {
          "title" => Helpers.ensure_string(group["title"], "Template group.title"),
          "order" => Helpers.ensure_integer(group["order"], "Template group.order")
        }
      end
    end
  end
end
