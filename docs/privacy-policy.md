# SpecDeck Privacy Policy

Last updated: [DATE]

SpecDeck ("the app") is a Confluence Cloud app published by [LEGAL NAME / BUSINESS NAME] ("we", "us"). This policy explains what data the app handles. Contact: [SUPPORT EMAIL].

## What the app does
SpecDeck renders OpenAPI and Swagger specifications as interactive documentation inside Confluence pages, and can convert other apps' API-documentation macros into SpecDeck macros.

## Data we process
- **Macro configuration**: the spec text you paste, the attachment name, or the GitHub file URL you enter. Confluence stores this inside your page, like any other macro setting.
- **Spec files**: specs loaded from page attachments or public GitHub URLs are read only to display them. Specs fetched from GitHub may be cached for up to 10 minutes in Atlassian's Forge storage for your site.
- **Page content (importer only)**: when a space admin runs the importer, the app reads pages in that space to find API-doc macros, and updates only the pages the admin chooses to convert.

## Data we do not collect
- We do not collect, store or process personal data such as names, emails or account IDs.
- We run no servers of our own. All processing and storage happens on Atlassian's Forge platform, inside your Atlassian cloud site's region.
- We use no analytics, tracking, cookies or advertising.

## Third parties
- **GitHub (raw.githubusercontent.com)**: when you link a GitHub file, the app requests that public file URL. Nothing else is sent.
- **"Try it out" requests**: if an editor enables this, the API calls a reader makes are sent from the reader's browser directly to the API described in the spec. The app never receives them.

## Retention and deletion
Cached specs expire after 10 minutes. Uninstalling the app deletes its Forge storage. Macro settings stay in your pages until you edit or delete those pages.

## Security
The app requests only the Confluence permissions it needs: read pages, read attachments, write pages (importer only), and app storage.

## Changes
We'll post updates here and change the date above.
