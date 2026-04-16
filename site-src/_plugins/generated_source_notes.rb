module GeneratedSourceNotes
  class DataPage < Jekyll::PageWithoutAFile
    def initialize(site:, dir:, data:, content:)
      super(site, site.source, dir, "index.md")
      self.content = content
      self.data = data
    end
  end

  class SourceNotesGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      namespace = site.config.fetch("generated_data_namespace", "generated")
      generated = site.data.fetch(namespace, {})
      source_notes = generated.fetch("source_notes", {})

      source_notes.each do |project_key, project_data|
        Array(project_data["modules"]).each do |mod|
          site.pages << DataPage.new(
            site: site,
            dir: page_dir(mod["url"]),
            content: mod["readme_markdown"].to_s,
            data: module_page_data(project_key, mod)
          )

          Array(mod["documents"]).each do |document|
            site.pages << DataPage.new(
              site: site,
              dir: page_dir(document["url"]),
              content: document["body"].to_s,
              data: document_page_data(project_key, document)
            )
          end
        end
      end
    end

    private

    def page_dir(url)
      url.to_s.sub(%r{^/}, "").sub(%r{/$}, "")
    end

    def module_page_data(project_key, mod)
      {
        "layout" => "source_module",
        "title" => mod["title"],
        "description" => "#{mod['title']} notes",
        "project_key" => project_key,
        "module_slug" => mod["slug"],
        "page_source_url" => mod["source_url"],
        "source_url" => mod["source_url"],
        "hero_image_url" => mod["hero_image_url"],
        "language_labels" => mod["language_labels"],
        "document_count" => mod["document_count"],
        "roots" => mod["roots"],
        "tree_path" => "",
        "url" => mod["url"]
      }.merge(mod)
    end

    def document_page_data(project_key, document)
      {
        "layout" => "source_document",
        "title" => document["title"],
        "description" => "#{document['title']} notes",
        "project_key" => project_key,
        "module_slug" => document["module_slug"],
        "document_id" => document["id"],
        "page_source_url" => document["source_url"],
        "source_path" => document["source_path"],
        "source_url" => document["source_url"],
        "language" => document["language"],
        "format" => document["format"],
        "breadcrumbs" => document["breadcrumbs"],
        "tree_path" => document["tree_path"],
        "url" => document["url"]
      }.merge(document)
    end
  end
end
