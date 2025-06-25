import { useEffect, useState } from 'react';
import { api, clearCachedUserTimeZone } from '@/services';
import { toast } from 'react-hot-toast';
import { TimeZone } from '@/types';
import { useUser } from '@/context/UserContext';
import { deduplicateTimeZones } from '@/utils/timezone';

export function useUserSettings() {
  const { user, isLoading: isUserLoading, refetch: refetchUser } = useUser();
  const [timeZones, setTimeZones] = useState<TimeZone[]>([]);
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Load available timezones on component mount
  useEffect(() => {
    (async () => {
      try {
        // Fetch timezone options
        const timeZoneRes = await api.get<TimeZone[]>('/users/timezones');
        // Remove duplicate timezones and store unique options
        const uniqueTimeZones = deduplicateTimeZones(timeZoneRes.data);
        setTimeZones(uniqueTimeZones);
      } catch (err) {
        console.error('Failed to load settings:', err);
        toast.error('Failed to load settings');
      }
    })();
  }, []);

  // Set selected timezone when user changes
  useEffect(() => {
    if (user) {
      setSelectedTimeZone(user.timeZoneId || '');
    }
  }, [user]);

  /**
   * Updates the user's timezone preference and clears cached timezone data
   */
  const updateTimeZone = async () => {
    if (!user) return;

    const previousTimeZone = selectedTimeZone;

    try {
      setIsSaving(true);

      toast.success('Timezone updated successfully');

      // Update user's timezone on the server
      await api.put(`/users/${user.id}`, { timeZoneId: selectedTimeZone });
      clearCachedUserTimeZone();

      // Refetch user data to ensure consistency
      await refetchUser();
    } catch (err) {
      console.error('Failed to update timezone:', err);

      setSelectedTimeZone(previousTimeZone);
      toast.error('Failed to update timezone');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    user,
    timeZones,
    selectedTimeZone,
    isLoading: isUserLoading,
    isSaving,
    setSelectedTimeZone,
    updateTimeZone,
  };
}
