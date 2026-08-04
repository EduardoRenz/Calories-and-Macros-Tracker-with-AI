---
schema_version: "compozy.tasks/v2"
workflow: seo-technical-vitals
graph:
  nodes:
    - id: task_01
      file: task_01.md
    - id: task_02
      file: task_02.md
    - id: task_03
      file: task_03.md
    - id: task_04
      file: task_04.md
  edges:
    - from: task_01
      to: task_02
    - from: task_01
      to: task_03
    - from: task_02
      to: task_03
    - from: task_02
      to: task_04
    - from: task_03
      to: task_04
---

# SEO, Core Web Vitals & Organic Growth Engine Task List

Manifest graph of execution tasks for `seo-technical-vitals`.

## Task Index

- **task_01**: Módulo Puro de SEO, Metadata Dinâmica, Canonicais e JSON-LD (`task_01.md`)
- **task_02**: Infraestrutura Next.js App Router (Sitemap.xml, Robots.txt, Fontes e Layout A11y) (`task_02.md`)
- **task_03**: Calculadora Pública de Macros com Gráficos e SEO (`task_03.md`)
- **task_04**: Analytics, Search Console Verification e Pipeline de Auditoria Lighthouse CI (`task_04.md`)
