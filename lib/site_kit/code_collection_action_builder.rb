# frozen_string_literal: true

module SiteKit
  CodeCollectionActionSet = Data.define(:entry_action_groups, :global_actions) do
    def to_h
      {
        "entry_action_groups" => entry_action_groups,
        "global_actions" => global_actions
      }
    end
  end

  class CodeCollectionActionBuilder
    def initialize(entries:, embed:, problem_source_url:)
      @entries = Array(entries)
      @embed = embed
      @problem_source_url = problem_source_url
    end

    def build
      CodeCollectionActionSet.new(
        entry_action_groups: entry_action_groups,
        global_actions: [source_action(problem_source_url, "leetcode", "Open LeetCode problem"), copy_action].compact
      )
    end

    private

    attr_reader :entries, :embed, :problem_source_url

    def entry_action_groups
      entries.filter_map do |entry|
        actions = [embed_action(entry), source_action(entry.fetch("source_url", ""))].compact
        next if actions.empty?

        {
          "entry_id" => entry.fetch("entry_id", ""),
          "actions" => actions
        }
      end
    end

    def embed_action(entry)
      if embed
        detail_url = entry.fetch("detail_url", "")
        return nil if detail_url.empty?

        link_action(detail_url, "open-page", "Open full page", external: false)
      else
        embed_url = entry.fetch("embed_url", "")
        return nil if embed_url.empty?

        link_action(embed_url, "code", "Open embed page", external: false)
      end
    end

    def source_action(url, icon = "github", label = "Source on GitHub")
      return nil if url.to_s.empty?

      link_action(url, icon, label)
    end

    def copy_action
      {
        "kind" => "button",
        "icon" => "copy",
        "label" => "Copy",
        "class" => "icon-action--compact",
        "attributes" => 'data-code-copy-button data-copy-default-label="Copy"'
      }
    end

    def link_action(url, icon, label, external: true)
      {
        "kind" => "link",
        "href" => url,
        "icon" => icon,
        "label" => label,
        "external" => external,
        "class" => "icon-action--compact"
      }
    end
  end
end
