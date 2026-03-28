import { useMemo } from 'react';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Hook to manage renewal notifications
 */
export function useNotifications() {
  const { subscriptions } = useSubscriptionStore();

  const notifications = useMemo(() => {
    const today = new Date();
    return subscriptions
      .filter(sub => sub.status === 'Active')
      .map(sub => {
        const daysLeft = differenceInDays(parseISO(sub.validityDate), today);
        if (daysLeft >= 0 && daysLeft <= 7) {
          return {
            id: `alert_${sub.id}`,
            message: `${sub.name} is due for renewal in ${daysLeft} days.`,
            type: daysLeft <= 2 ? 'critical' : 'warning',
            date: sub.validityDate,
            subName: sub.name
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [subscriptions]);

  return { notifications };
}
