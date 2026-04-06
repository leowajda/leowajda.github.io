---
layout: home
title: Leonardo Wajda
description: ""
---

## Projects

<div class="card-grid">
  {%- for project in site.data.generated.projects -%}
    <article class="content-card">
      <h3><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h3>
      <p>{{ project.description }}</p>
    </article>
  {%- endfor -%}
</div>

<h2>Writing</h2>

{% if site.posts.size > 0 %}
<div class="card-grid">
  {% for post in site.posts limit: 6 %}
    <article class="content-card">
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p>{{ post.excerpt | strip_html | strip }}</p>
      <div class="content-card__meta">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: site.theme_config.date_format }}</time>
      </div>
    </article>
  {% endfor %}
</div>
{% else %}
<p>No writing published yet.</p>
{% endif %}
