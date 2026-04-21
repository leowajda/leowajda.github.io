---
layout: home
title: Leonardo Wajda
description: "Algorithm solutions, source notes, and technical writing."
---

## Projects

<div class="content-stack">
  {%- assign projects = page.home_projects | default: empty -%}
  {%- for project in projects -%}
    {%- assign project_body = '' -%}
      {%- assign project_url = project.home_url | default: '' -%}
      {%- assign source_groups = project.home_groups | default: empty -%}
      {%- if project.kind == "source-notes" and source_groups.size > 0 -%}
      {%- capture project_body -%}
      <ul class="project-tree" aria-label="{{ project.title }} entries">
        {%- for group in source_groups -%}
        <li class="project-tree__group">
          <p class="project-tree__label">{{ group.language_title }}</p>
          <ul class="project-tree__children">
            {%- for module in group.modules -%}
            <li class="project-tree__item">
              <a class="project-tree__entry" href="{{ module.url | relative_url }}">{{ module.title }}</a>
            </li>
            {%- endfor -%}
          </ul>
        </li>
        {%- endfor -%}
      </ul>
      {%- endcapture -%}
      {%- endif -%}

      {%- include content_link_card.html
        class="home-card"
        title=project.title
        url=project_url
        source_url=project.source_url
        summary=project.description
        body=project_body
      -%}
  {%- endfor -%}
</div>

<h2>Writing</h2>

{% assign writing_posts = site.posts %}
{% if writing_posts.size > 0 %}
<div class="content-stack">
  {% for post in writing_posts limit: 6 %}
    {%- capture post_footer -%}
        <p class="page-note">
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
        </p>
    {%- endcapture -%}
    {%- include content_link_card.html
      class="home-card"
      title=post.title
      url=post.url
      summary=post.description
      footer=post_footer
    -%}
  {% endfor %}
</div>
{% else %}
<p>No writing published yet.</p>
{% endif %}
