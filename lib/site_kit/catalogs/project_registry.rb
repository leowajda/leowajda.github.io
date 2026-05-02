# frozen_string_literal: true

module SiteKit
  module Catalogs
    ProjectRegistryRecord = Data.define(:manifests) do
      def for_kind(kind)
        manifests.select { |manifest| manifest.kind == kind }
      end
    end

    class ProjectRegistry
      def initialize(records:, repo_root:)
        @records = records
        @repo_root = repo_root
      end

      def record
        @record ||= SiteKit::Catalogs::ProjectRegistryRecord.new(manifests: available_manifests)
      end

      private

      attr_reader :records, :repo_root

      def available_manifests
        SiteKit::Catalogs::ProjectManifestRepository.new(records).load.select do |manifest|
          source_available?(manifest)
        end
      end

      def source_available?(manifest)
        source_root = manifest.source_root(repo_root)
        return true if File.exist?(source_root)
        return false if manifest.source_optional?

        raise SiteKit::CatalogError, "Project '#{manifest.slug}' source is missing at '#{source_root}'"
      end
    end
  end
end
