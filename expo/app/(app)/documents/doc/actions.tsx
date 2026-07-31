import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen, TAB_SCREEN_EDGES } from '@/components/Screen';
import { selectApp, selectModule } from '@/features/core/coreSlice';
import { findModuleBySifDv } from '@/features/core/menuHelpers';
import {
  createLinkedDocument,
  moduleHasActions,
  openRadniNalogFromUpit,
} from '@/features/documents/documentsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

/**
 * gen tab Akcije — paritet s src/pages/gen/tabs/TabAkcije.jsx (Kreiraj radni nalog).
 */
export default function DocumentActionsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const route = useAppSelector((state) => state.documents.route);
  const layout = useAppSelector((state) => state.documents.layout);
  const apps = useAppSelector((state) => state.core.apps);
  const [busy, setBusy] = useState(false);

  if (!moduleHasActions(route, layout)) {
    return null;
  }

  const onCreateRadniNalog = async () => {
    setBusy(true);
    try {
      const created = await dispatch(createLinkedDocument()).unwrap();

      Alert.alert(
        created.brojdokumenta
          ? `Kreiran je radni nalog broj: '${created.brojdokumenta}'`
          : 'Radni nalog je kreiran',
        'Želite li ga otvoriti?',
        [
          {
            text: 'Odustani',
            style: 'cancel',
            onPress: () => {
              router.replace('/documents/list' as Href);
            },
          },
          {
            text: 'Otvori',
            onPress: async () => {
              try {
                await dispatch(
                  openRadniNalogFromUpit({ sifdv: created.sifdv, dglid: created.dglid }),
                ).unwrap();
                // Ionic openSRN: prebaci CC kontekst na RN modul — inače header/list ostaju "Upiti".
                const menuMatch = findModuleBySifDv(apps, created.sifdv);
                if (menuMatch) {
                  dispatch(selectApp(menuMatch.app));
                  dispatch(selectModule(menuMatch.module));
                } else {
                  dispatch(
                    selectModule({
                      appid: '',
                      title: created.sifdv,
                      sifdv: created.sifdv,
                      url: `/docs/dgl/${created.sifdv}`,
                    }),
                  );
                }
                router.replace('/documents/doc' as Href);
              } catch (error) {
                Alert.alert('Greška', typeof error === 'string' ? error : 'Otvaranje radnog naloga nije uspjelo.');
              }
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert('Greška', typeof error === 'string' ? error : 'Kreiranje radnog naloga nije uspjelo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={TAB_SCREEN_EDGES} scroll>
      <View style={styles.content}>
        <PrimaryButton label="Kreiraj radni nalog" onPress={onCreateRadniNalog} loading={busy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
});
