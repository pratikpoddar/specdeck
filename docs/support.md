# SpecPort Support

OpenAPI & Swagger Docs for Confluence Cloud

**Need help?** Email **pratik.phodu@gmail.com** with the subject "SpecPort support". We reply within 2 business days (India time, IST). Please include your Confluence site URL, the page link, and a screenshot or the error message.

## Getting started
1. In the Confluence editor, type /OpenAPI and pick "OpenAPI / Swagger Docs (SpecPort)".
2. Choose a source: paste YAML or JSON, use a file attached to the page, or a public GitHub file link.
3. Click "Check spec" to validate, then Save.

Tip: pasting a GitHub link to a .yaml, .yml or .json file straight into a page turns it into SpecPort docs automatically.

## Moving from another Swagger or OpenAPI app
1. Go to Space settings, then "Migrate API docs to SpecPort".
2. Click "Scan this space" to list pages that use other API-doc macros.
3. Click "Convert" on each page. Each conversion saves a new page version, so you can roll back from page history.

Macros marked "(manual)" couldn't be mapped automatically. Re-add them with SpecPort, or email us and we'll help.

## Troubleshooting
**"Couldn't load the spec: GitHub returned 404"**: The file must be public. Private repos are coming soon; for now, attach the file to the page.

**"Attachment was not found on this page"**: The file must be attached to the same page, and the name must match exactly, including the extension.

**"This does not look like an OpenAPI 3 or Swagger 2 document"**: The file needs a top-level "openapi" or "swagger" field.

**My GitHub change isn't showing**: GitHub specs are cached for up to 10 minutes.

**"Try it out" is missing**: An editor must switch it on in the macro settings, and it's a paid feature. Calls go from your browser to your API, so that API must allow requests from your Confluence site (CORS).

**PDF or Word export shows a table instead of the interactive docs**: That's expected. Exports print a Method, Path and Summary table of every endpoint.

## Plans
Free for up to 10 users, with every feature. Paid plans add one-click migration, "Try it out", and soon private GitHub, GitLab and Bitbucket repos. Atlassian handles billing and trials under Apps, then Manage apps.

## Privacy and security
SpecPort runs entirely on Atlassian Forge, stores no personal data, and only contacts raw.githubusercontent.com to fetch public spec files you link.

## Feature requests and bugs
Email pratik.phodu@gmail.com. We read every one.
