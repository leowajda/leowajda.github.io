# frozen_string_literal: true

require 'digest'

module SiteKit
  module Checks
    class VendorAssets
      MANIFEST_PATH = 'config/vendor-assets.yml'

      def initialize(manifest_path: File.join(SiteKit::Core::Helpers.repo_root, MANIFEST_PATH))
        @manifest_path = manifest_path
      end

      def validate!
        records.each do |record|
          validate_asset_group!(record)
        end
      end

      private

      attr_reader :manifest_path

      def records
        manifest = SiteKit::Core::Helpers.parse_yaml(
          SiteKit::Core::Helpers.read_text(manifest_path),
          "Unable to decode #{MANIFEST_PATH}"
        )
        SiteKit::Core::Helpers.ensure_array(manifest.fetch('assets'), "#{MANIFEST_PATH}.assets")
      end

      def validate_asset_group!(record)
        asset = SiteKit::Core::Helpers.ensure_hash(record, "#{MANIFEST_PATH}.assets[]")
        name = SiteKit::Core::Helpers.ensure_string(asset.fetch('name'), "#{MANIFEST_PATH}.assets[].name")
        SiteKit::Core::Helpers.ensure_array(asset.fetch('files'), "Vendor asset #{name}.files").each do |file|
          validate_file!(name, SiteKit::Core::Helpers.ensure_hash(file, "Vendor asset #{name}.files[]"))
        end
        validate_globs!(name, asset.fetch('globs', []))
      end

      def validate_file!(name, file)
        path = SiteKit::Core::Helpers.ensure_string(file.fetch('path'), "Vendor asset #{name}.files[].path")
        expected_sha = SiteKit::Core::Helpers.ensure_string(file.fetch('sha256'),
                                                            "Vendor asset #{name} #{path}.sha256")
        absolute_path = File.join(SiteKit::Core::Helpers.repo_root, path)

        raise SiteKit::CatalogError, "Vendor asset #{name} is missing #{path}" unless File.file?(absolute_path)

        actual_sha = Digest::SHA256.file(absolute_path).hexdigest
        unless actual_sha == expected_sha
          raise SiteKit::CatalogError,
                "Vendor asset #{name} #{path} has sha256 #{actual_sha}, expected #{expected_sha}"
        end

        validate_required_text!(name, path, absolute_path, file.fetch('contains', []))
      end

      def validate_globs!(name, globs)
        SiteKit::Core::Helpers.ensure_array(globs, "Vendor asset #{name}.globs").each do |entry|
          glob = SiteKit::Core::Helpers.ensure_hash(entry, "Vendor asset #{name}.globs[]")
          pattern = SiteKit::Core::Helpers.ensure_string(glob.fetch('pattern'), "Vendor asset #{name}.globs[].pattern")
          expected_count = SiteKit::Core::Helpers.ensure_integer(glob.fetch('count'),
                                                                 "Vendor asset #{name} #{pattern}.count")
          matches = Dir.glob(File.join(SiteKit::Core::Helpers.repo_root, pattern))
          next if matches.size == expected_count

          raise SiteKit::CatalogError,
                "Vendor asset #{name} #{pattern} matched #{matches.size} files, expected #{expected_count}"
        end
      end

      def validate_required_text!(name, path, absolute_path, values)
        SiteKit::Core::Helpers.ensure_array(values, "Vendor asset #{name} #{path}.contains").each do |value|
          expected_text = SiteKit::Core::Helpers.ensure_string(value, "Vendor asset #{name} #{path}.contains[]")
          next if SiteKit::Core::Helpers.read_text(absolute_path).include?(expected_text)

          raise SiteKit::CatalogError, "Vendor asset #{name} #{path} must include #{expected_text.inspect}"
        end
      end
    end
  end
end
