import { useEffect, useMemo, useState } from 'react';
import { getUserTimeZoneId, toIana } from '@/utils/timezone';
import { useUser } from '@/context/UserContext';

export function useUserTimeZoneDisplay(): string {
  const { user } = useUser();
  const [display, setDisplay] = useState('...'); // Show ... until hydrated
  const [hydrated, setHydrated] = useState(false);

  const timeZoneId = useMemo(() => user?.timeZoneId || getUserTimeZoneId(), [user]);

  useEffect(() => {
    setHydrated(true);
    if (!timeZoneId) {
      setDisplay('UTC');
      return;
    }
    const ianaTz = toIana(timeZoneId);
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: ianaTz,
        timeZoneName: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
      const parts = formatter.formatToParts(now);
      const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || ianaTz;
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const target = new Date(utc.toLocaleString('en-US', { timeZone: ianaTz }));
      const offset = (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
      // Round to nearest half hour
      const roundedOffset = Math.round(offset * 2) / 2;
      const sign = roundedOffset >= 0 ? '+' : '';
      setDisplay(`${tzName} (UTC${sign}${roundedOffset})`);
    } catch (err) {
      setDisplay('UTC');
    }
  }, [timeZoneId]);

  return hydrated ? display : '...';
}
