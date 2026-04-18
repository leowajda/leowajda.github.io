---
layout: home
title: Leonardo Wajda
description: "Algorithm solutions, source notes, and technical writing."
---

## Projects

<div class="content-stack">
  {%- assign projects = site.projects | sort: "homepage_order" -%}
  {%- for project in projects -%}
    {%- assign project_modules = site.source_modules | where: "project_slug", project.slug | sort: "title" -%}
    <article class="content-card content-card--compact">
      {%- if project.entry_url != "" -%}
      <h3><a href="{{ project.entry_url | relative_url }}">{{ project.title }}</a></h3>
      {%- else -%}
      <h3>{{ project.title }}</h3>
      {%- endif -%}
      <p>{{ project.description }}</p>
      <div class="content-card__meta">
        <a href="{{ project.source_url }}" target="_blank" rel="noreferrer">source</a>
      </div>

      {%- if project_modules and project_modules.size > 0 -%}
      <ul class="project-collection" aria-label="{{ project.title }} entries">
        {%- for module in project_modules -%}
        <li class="project-collection__item">
          <a class="project-collection__entry" href="{{ module.url | relative_url }}">{{ module.title }}</a>
        </li>
        {%- endfor -%}
      </ul>
      {%- endif -%}
    </article>
  {%- endfor -%}
</div>

<h2>Writing</h2>

{% if site.posts.size > 0 %}
<div class="content-stack">
  {% for post in site.posts limit: 6 %}
    <article class="content-card content-card--compact">
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <div class="content-card__meta">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: site.theme_config.date_format }}</time>
      </div>
    </article>
  {% endfor %}
</div>
{% else %}
<p>No writing published yet.</p>
{% endif %}
