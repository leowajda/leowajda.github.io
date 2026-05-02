# frozen_string_literal: true

require 'fileutils'
require 'json'

module SiteKit
  module Build
    class SearchRecordExporter
      def initialize(destination:, output_path:)
        @destination = destination
        @output_path = output_path
      end

      def export
        site = SiteKit::JekyllRuntime::SiteLoader.new(destination: destination).process
        records = SiteKit::Build::Context.for(site).search_records.map(&:to_h)
        write_records(records)
        records
      end

      private

      attr_reader :destination, :output_path

      def write_records(records)
        FileUtils.mkdir_p(File.dirname(output_path))
        File.write(output_path, "#{JSON.pretty_generate(records)}\n")
      end
    end
  end
end
