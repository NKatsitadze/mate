export const HOUR_MS = 60 * 60 * 1000;

const GEORGIA_UTC_OFFSET_HOURS = 4;

export function startOfTodayInGeorgia(): Date {
  const shifted = new Date(Date.now() + GEORGIA_UTC_OFFSET_HOURS * HOUR_MS);
  const startOfDay = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  return new Date(startOfDay - GEORGIA_UTC_OFFSET_HOURS * HOUR_MS);
}
