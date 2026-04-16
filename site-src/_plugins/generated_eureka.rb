module GeneratedEureka
  class DataPage < Jekyll::PageWithoutAFile
    def initialize(site:, dir:, data:, content: "")
      super(site, site.source, dir, "index.md")
      self.content = content
      self.data = data
    end
  end

  class EurekaGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      namespace = site.config.fetch("generated_data_namespace", "generated")
      generated = site.data.fetch(namespace, {})
      eureka = generated.fetch("eureka", {})
      problem_index = eureka.fetch("problems", {})

      Array(problem_index["problems"]).each do |problem|
        site.pages << DataPage.new(
          site: site,
          dir: page_dir(problem["detail_url"]),
          data: {
            "layout" => "problem",
            "title" => problem["title"],
            "description" => "#{problem['title']} solutions",
            "project_key" => problem_index["project_key"],
            "url" => problem["detail_url"]
          }.merge(problem)
        )

        site.pages << DataPage.new(
          site: site,
          dir: page_dir(problem["embed_url"]),
          data: {
            "layout" => "problem_embed",
            "title" => problem["title"],
            "description" => "#{problem['title']} solutions",
            "project_key" => problem_index["project_key"],
            "implementation_id" => "",
            "url" => problem["embed_url"]
          }.merge(problem)
        )

        Array(problem["implementations"]).each do |implementation|
          site.pages << DataPage.new(
            site: site,
            dir: page_dir(implementation["embed_url"]),
            data: {
              "layout" => "problem_embed",
              "title" => problem["title"],
              "description" => "#{problem['title']} solutions",
              "project_key" => problem_index["project_key"],
              "implementation_id" => implementation["id"],
              "url" => implementation["embed_url"]
            }.merge(problem)
          )
        end
      end

      Array(problem_index["languages"]).each do |language|
        site.pages << DataPage.new(
          site: site,
          dir: page_dir(language["url"]),
          data: {
            "layout" => "problems",
            "title" => language["title"],
            "description" => language["description"],
            "project_key" => problem_index["project_key"],
            "language_filter" => language["slug"],
            "url" => language["url"]
          }
        )
      end
    end

    private

    def page_dir(url)
      url.to_s.sub(%r{^/}, "").sub(%r{/$}, "")
    end
  end
end
