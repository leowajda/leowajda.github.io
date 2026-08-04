---
layout: home
title: Leonardo Wajda
description: "a modest offering to the data gods"
---

## Projects

{% include home_projects.html projects=page.home_projects %}

{% if site.posts.size > 0 %}
## Writing

{% include home_writing.html posts=site.posts %}
{% endif %}
