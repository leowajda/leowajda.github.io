# frozen_string_literal: true

module SiteKit
  SiteProjectRecord = Data.define(
    :slug,
    :kind,
    :title,
    :description,
    :source_url,
    :homepage_order,
    :home_url,
    :home_groups
  ) do
    def to_h
      {
        "slug" => slug,
        "kind" => kind,
        "title" => title,
        "description" => description,
        "source_url" => source_url,
        "homepage_order" => homepage_order,
        "home_url" => home_url,
        "home_groups" => home_groups
      }
    end
  end

  class SiteProjectPresenter
    def initialize(manifests:, source_registries:)
      @manifests = manifests
      @source_registries = source_registries
    end

    def records
      manifests
        .sort_by(&:homepage_order)
        .map { |manifest| project_record(manifest).to_h }
    end

    private

    attr_reader :manifests, :source_registries

    def project_record(manifest)
      SiteProjectRecord.new(
        slug: manifest.slug,
        kind: manifest.kind,
        title: manifest.title,
        description: manifest.description,
        source_url: manifest.source_url,
        homepage_order: manifest.homepage_order,
        home_url: project_home_url(manifest),
        home_groups: homepage_groups(manifest)
      )
    end

    def project_home_url(manifest)
      return manifest.entry_url unless manifest.entry_url.empty?
      return source_registries.fetch(manifest.slug).fetch("project_home_url", "") if manifest.kind == SOURCE_NOTES_PROJECT_KIND && source_registries.key?(manifest.slug)

      ""
    end

    def homepage_groups(manifest)
      return [] unless manifest.kind == SOURCE_NOTES_PROJECT_KIND && source_registries.key?(manifest.slug)

      source_registries
        .fetch(manifest.slug)
        .fetch("languages", [])
        .map do |language|
          {
            "language_title" => language.fetch("language_title"),
            "modules" => language.fetch("modules").map do |module_record|
              {
                "title" => module_record.fetch("title"),
                "url" => module_record.fetch("url")
              }
            end
          }
        end
    end
  end
end
