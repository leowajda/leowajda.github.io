# frozen_string_literal: true

module SiteKit
  module Pages
    Definition = Data.define(:dir, :page_type, :data, :content) do
      def self.build(dir:, page_type:, data:, content: '')
        new(dir: dir, page_type: page_type, data: data, content: content)
      end

      def [](key)
        public_send(key)
      end

      def dig(key, *rest)
        value = self[key]
        return value if rest.empty?

        value&.dig(*rest)
      end

      def to_h
        { dir: dir, page_type: page_type, data: data, content: content }
      end
    end
  end
end
