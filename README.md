# SpecPort: OpenAPI / Swagger docs for Confluence Cloud

A Forge app that replaces the stale Connect API-doc macros. Insert `/OpenAPI` on a page, or just paste a GitHub spec link and it auto-converts.

## Run it (about 15 minutes)
1. Install the Forge CLI: `npm i -g @forge/cli`, then `forge login` using an Atlassian API token from id.atlassian.com.
2. Get a free dev site at go.atlassian.com/cloud-dev.
3. In this folder, run `forge register` (this writes the real app id into manifest.yml), then `npm run setup` and `npm run build`.
4. Run `forge deploy`, then `forge install` and pick Confluence and your dev site.
5. Iterate with `forge tunnel` (backend) and `npm run build` + `forge deploy` (UI).

Tests: `npm test`. `forge lint` needs a login, so run it after step 1.

## What v0.1 does
- Three sources: a pasted spec (YAML/JSON), a page attachment, or a public GitHub file (blob or raw link).
- Pasting a GitHub `.yaml/.yml/.json` link turns it into the macro automatically.
- Interactive Swagger UI viewer. "Try it out" is off by default and can be switched on per macro.
- A config modal with a **Check spec** button that shows the title, version and endpoint count, or a clear error.
- PDF/Word export renders a Method / Path / Summary table instead of a blank iframe.
- GitHub fetches are cached for 10 minutes in Forge KVS. Egress is only raw.githubusercontent.com.

## MVP roadmap, in order
1. **Private GitHub, GitLab and Bitbucket repos.** Add an OAuth provider (Forge `providers`) and branch selection. This is the #1 paid feature.
2. **Importer for the dead apps.** A space-settings page that scans pages for the old Connect macros (Open API (Swagger) Integration, Visualize OpenAPI, Swagger UI for Confluence) and rewrites them to SpecPort with the same spec. This is the wedge: those customers lose support on 31 Jan 2027.
3. **Redoc layout toggle** and dark mode.
4. **Spec diff on update:** show what changed since the page was last published (new and removed endpoints).
5. **Rovo agent:** answer "how do I call X?" from the specs on a page.
6. **AsyncAPI support and an API catalog page** that lists every spec across spaces.

## Pricing (Paid via Atlassian)
- Free for up to 10 users, which drives installs and ranking.
- Then about $0.80/user/month under 100 users, tapering down. That's roughly 20% under the incumbents.
- Private repos and the importer are paid-only.

## Listing checklist
- Become a Marketplace partner (free), add a privacy policy and EULA page, and a support URL (a JSM portal works).
- Keep the app Forge-only with OAuth and no Connect modules, so it qualifies for 100% revenue up to $1M lifetime.
- Screenshots: the viewer, the config modal, a PDF export, and the importer before/after.
- Category: Documentation / Macros. Keywords: OpenAPI, Swagger, API documentation, REST, YAML.

## Known gaps in v0.1 (verify on a dev site)
- The attachment download uses the v1 download route. Confirm the scope set on first deploy.
- The macro `icon` path and the auto-convert patterns need checking in the editor.
- The Swagger UI bundle is about 1.5 MB. Consider lazy-loading or Redoc.

## Importer (v0.2)
- Find it in Space settings, under **Migrate API docs to SpecPort**. It scans pages for any macro whose key mentions swagger or openapi, then converts them in one click and adds a page version.
- After `forge register`, run `forge variables set APP_UUID <uuid from manifest app id>`.
- To verify: install the old Connect apps on a dev site and check their real macro keys and parameter names. Macros it can't map show as "(manual)".
