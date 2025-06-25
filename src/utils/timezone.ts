/**
 * Get the user's timezone ID
 * @returns The timezone ID (e.g., "America/Denver", "America/New_York")
 */
export function getUserTimeZoneId(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to get user timezone, falling back to UTC');
    return 'UTC';
  }
}

/**
 * Get the user's timezone ID consistently across devices
 * First tries to fetch from backend, then falls back to browser detection
 * @returns Promise<string> The timezone ID
 */
export async function getUserTimeZoneIdConsistent(): Promise<string> {
  try {
    // Try to fetch from backend first (for cross-device consistency)
    const { api } = await import('@/services');
    const res = await api.get<{ timeZoneId?: string }>('/users/me');
    if (res.data.timeZoneId) {
      return res.data.timeZoneId;
    }
  } catch (error) {
    console.warn('Failed to fetch user timezone from backend, using browser detection');
  }

  // Fall back to browser detection
  return getUserTimeZoneId();
}

/**
 * Get timezone options for display
 * @returns Array of timezone options with display names
 */
export function getTimeZoneOptions(): Array<{ id: string; displayName: string }> {
  const timeZones = Intl.supportedValuesOf('timeZone');

  return timeZones
    .map((tz) => ({
      id: tz,
      displayName: formatTimeZoneDisplay(tz),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Format timezone for display
 * @param timeZoneId The timezone ID
 * @returns Formatted display name
 */
function formatTimeZoneDisplay(timeZoneId: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timeZoneId,
      timeZoneName: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find((part) => part.type === 'timeZoneName')?.value || timeZoneId;
    const offset = getTimeZoneOffset(timeZoneId);

    return `${timeZoneName} (${offset})`;
  } catch (error) {
    return `${timeZoneId} (Unknown offset)`;
  }
}

/**
 * Get timezone offset string
 * @param timeZoneId The timezone ID
 * @returns Offset string (e.g., "UTC-7", "UTC+1")
 */
function getTimeZoneOffset(timeZoneId: string): string {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const target = new Date(utc.toLocaleString('en-US', { timeZone: timeZoneId }));
    const offset = Math.round(((target.getTime() - utc.getTime()) / (1000 * 60 * 60)) * 10) / 10;

    const sign = offset >= 0 ? '+' : '';
    return `UTC${sign}${offset}`;
  } catch (error) {
    return 'UTC';
  }
}

/**
 * Deduplicate timezones by ID, keeping the first occurrence of each ID
 * @param timeZones Array of timezone objects
 * @returns Array of unique timezones
 */
export function deduplicateTimeZones<T extends { id: string }>(timeZones: T[]): T[] {
  return Array.from(new Map(timeZones.map((tz) => [tz.id, tz])).values());
}
