import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { parsePushData, resolvePushRoute } from '@/features/push/notificationRouter';

if (Platform.OS !== 'web') {
  /**
   * Foreground: prikaži OS banner umjesto tihog gutanja.
   * Mora biti postavljeno jednom prije listenera.
   */
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Jednom u autentificiranom stablu: tap / cold-start response → router.
 * Registracija tokena ostaje na Raspored ekranu (uži scope).
 */
export function PushBootstrap() {
  const router = useRouter();
  const handledResponseIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const navigateFromResponse = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const responseId = response.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) return;
      handledResponseIds.current.add(responseId);

      const data = parsePushData(response.notification.request.content.data as Record<string, unknown>);
      const action = resolvePushRoute(data);
      if (action.kind === 'navigate') {
        router.push(action.href);
        return;
      }
      if (__DEV__) {
        console.log('[push] Response ignoriran:', action.reason, data);
      }
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(navigateFromResponse);

    void Notifications.getLastNotificationResponseAsync().then(navigateFromResponse);

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}
