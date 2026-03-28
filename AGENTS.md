this is a project used to publish my writings to a github repo using Jekyll

when I tell you to publish some article, you need to do:
1) copy from the original path to the _posts/ in this project, rename it using 'YYYY-MM-DD-title.md'
2) add YAML to the begining of article to let Jekyll know what it is, an example:
```markdown
---
layout: post
title: "时间窗口里的工作法"
---
```
3) if the source article starts with a top-level markdown title like `# Title`, remove that heading from the published version to avoid showing the title twice, because Jekyll already renders the page title from YAML
4) other than the YAML front matter and possible removal of the duplicated top-level title, keep the article content unchanged from the source
5) commit and push
6) verify the final article on the live site after GitHub Pages rebuilds; at minimum check that:
- the URL is correct and reachable
- the title is not duplicated
- math expressions render correctly when present

lessons learned from the first publication:
- `AGENTS.md` should stay excluded from the built site via `_config.yml`
- math expressions are supported by the site through MathJax, so LaTeX-style inline math like `$...$` and display math like `\[...\]` can be published directly
- the expected article URL pattern is `/YYYY/MM/DD/slug.html` once GitHub Pages is enabled for the repo
