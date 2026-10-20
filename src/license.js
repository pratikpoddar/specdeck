// License state. Forge only passes `context.license` for paid apps in production.
// In dev/staging it is undefined, so we treat that as licensed unless LICENSE_OVERRIDE says otherwise
// (forge variables set --environment development LICENSE_OVERRIDE inactive).
export function isLicensed(context) {
  const override = process.env.LICENSE_OVERRIDE?.toLowerCase();
  if (override === 'active') return true;
  if (override === 'inactive') return false;
  if (context?.license === undefined) return true;
  return context.license?.active === true;
}
// Free forever: rendering from paste, attachment, public GitHub; PDF export; scanning for legacy macros.
// Paid: one-click conversion (importer), "Try it out", and (coming) private repos.
export const PAID_MESSAGE = 'This is a paid SpecPort feature. A site admin can start a free trial from Apps > Manage apps.';
