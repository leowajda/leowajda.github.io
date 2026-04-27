# frozen_string_literal: true

module SiteKit
  SearchRecord = Data.define(:url, :content, :language, :meta, :filters, :sort) do
    def to_h
      {
        'url' => url,
        'content' => content,
        'language' => language,
        'meta' => meta,
        'filters' => filters,
        'sort' => sort
      }
    end
  end
end
