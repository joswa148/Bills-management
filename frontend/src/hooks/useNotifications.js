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
    if (!Array.isArray(subscriptions)) return [];
    
    return subscriptions
      .filter(sub => sub?.status?.toLowerCase() === 'active')
      .map(sub => {
        if (!sub?.validityDate) return null;
        const daysLeft = differenceInDays(parseISO(sub.validityDate), today);
        if (daysLeft >= 0 && daysLeft <= 7) {
          return {
            id: `alert_${sub.id}`,
            message: `${sub.serviceName} is due for renewal in ${daysLeft} days.`,
            type: daysLeft <= 2 ? 'critical' : 'warning',
            date: sub.validityDate,
            subName: sub.serviceName
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [subscriptions]);

  return { notifications };
}
