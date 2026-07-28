import { useNavigation } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { DocumentContextStrip } from '@/components/DocumentContextStrip';
import { DocumentTabsBar } from '@/components/DocumentTabsBar';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/theme';

/**
 * Dokument je jedan ekran s tabovima, a ne pet zasebnih Stack ekrana kao prije —
 * prijelaz je animiran, stanje svakog taba ostaje živo i header/kontekstna traka
 * se ne ponovno crtaju. Vidljivost tabova rješava DocumentTabsBar.
 */
export default function DocumentTabsLayout() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const selectedModule = useAppSelector((state) => state.core.selectedModule);

  useEffect(() => {
    navigation.setOptions({ title: selectedModule?.title ?? 'Dokument' });
  }, [navigation, selectedModule]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DocumentContextStrip />
      <Tabs tabBar={(props) => <DocumentTabsBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="lines" />
        <Tabs.Screen name="work" />
        <Tabs.Screen name="attachments" />
        <Tabs.Screen name="signature" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
