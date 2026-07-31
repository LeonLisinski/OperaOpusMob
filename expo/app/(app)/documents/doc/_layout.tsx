import { useNavigation } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { DocumentContextStrip } from '@/components/DocumentContextStrip';
import { DocumentTabsBar } from '@/components/DocumentTabsBar';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/theme';

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
        <Tabs.Screen name="actions" />
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
