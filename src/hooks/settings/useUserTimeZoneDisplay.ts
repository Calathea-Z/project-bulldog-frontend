import { useEffect, useMemo, useState } from 'react';
import { getUserTimeZoneId } from '@/utils/timezone';
import { useUser } from '@/context/UserContext';

export function useUserTimeZoneDisplay(): string {
  const { user } = useUser();
  const [display, setDisplay] = useState('');

  const timeZoneId = useMemo(() => user?.timeZoneId || getUserTimeZoneId(), [user]);

  useEffect(() => {
    if (!timeZoneId) return;

    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timeZoneId,
        timeZoneName: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
      const parts = formatter.formatToParts(now);
      const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || timeZoneId;
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const target = new Date(utc.toLocaleString('en-US', { timeZone: timeZoneId }));
      const offset = (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
      const sign = offset >= 0 ? '+' : '';
      const offsetStr = (Math.round(offset * 100) / 100).toString();
      setDisplay(`${tzName} (UTC${sign}${offsetStr})`);
    } catch (err) {
      console.error(`Invalid timezone '${timeZoneId}':`, err);
      setDisplay(timeZoneId);
    }
  }, [timeZoneId]);

  return display || 'Unknown time zone';
}
