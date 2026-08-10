import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Screen } from '@/components/Screen';
import { useRegisterRasporedPush } from '@/features/push/useRegisterRasporedPush';
import {
  aktualnoRange,
  dayLabel,
  formatDayDisplay,
  formatHistoryWeekTitle,
  groupRidesByDay,
  historyWeekRange,
  isRideVisuallyDone,
  rideStableKey,
  sutraRange,
} from '@/features/raspored/dates';
import { PendingDayCard } from '@/features/raspored/PendingDayCard';
import { RasporedTabsBar } from '@/features/raspored/RasporedTabsBar';
import type {
  PendingDayInbox,
  RasporedDaySection,
  RasporedTab,
  VozniRedRow,
} from '@/features/raspored/types';
import { useRasporedObavijesti } from '@/features/raspored/useRasporedObavijesti';
import { useVozniRed } from '@/features/raspored/useVozniRed';
import { VoznjaCard } from '@/features/raspored/VoznjaCard';
import { radius, spacing, typography, useTheme } from '@/theme';

const HISTORY_WEEK_MAX = 11;

type ListRow =
  | { kind: 'pending'; item: PendingDayInbox }
  | { kind: 'section'; item: RasporedDaySection }
  | { kind: 'pending-actions' }
  | { kind: 'confirmed-title' };

function parseRasporedTab(value: string | string[] | undefined): RasporedTab | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'aktualno' || raw === 'sutra' || raw === 'povijest') return raw;
  return null;
}

export default function RasporedScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ tab?: string | string[]; fromPush?: string | string[] }>();
  const { colors } = useTheme();

  const [tab, setTab] = useState<RasporedTab>('aktualno');
  const [weekOffset, setWeekOffset] = useState(0);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [manualDone, setManualDone] = useState<Set<string>>(() => new Set());
  const [manualUndone, setManualUndone] = useState<Set<string>>(() => new Set());
  const [nowTick, setNowTick] = useState(() => Date.now());
  const listRef = useRef<FlatList<ListRow>>(null);
  const lastPushRefreshKey = useRef<string | null>(null);

  useRegisterRasporedPush(true);

  useEffect(() => {
    navigation.setOptions({ title: 'Raspored' });
  }, [navigation]);

  useEffect(() => {
    const next = parseRasporedTab(params.tab);
    if (next) setTab(next);
  }, [params.tab]);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const range = useMemo(() => {
    if (tab === 'aktualno') return aktualnoRange();
    if (tab === 'sutra') return sutraRange();
    return historyWeekRange(weekOffset);
  }, [tab, weekOffset]);

  const {
    rows,
    loading,
    pullRefreshing,
    awaitingRange,
    error: ridesError,
    sifOsobe,
    driverName,
    refresh: refreshRides,
  } = useVozniRed(range);

  const {
    rows: obavijesti,
    error: obavijestError,
    confirming,
    refresh: refreshObavijesti,
    confirmDay,
    confirmDays,
  } = useRasporedObavijesti(tab === 'povijest' ? null : range, sifOsobe);

  useEffect(() => {
    const fromPushRaw = params.fromPush;
    const fromPush = Array.isArray(fromPushRaw) ? fromPushRaw[0] : fromPushRaw;
    if (!fromPush) return;
    const key = `${String(params.tab ?? '')}|${fromPush}`;
    if (lastPushRefreshKey.current === key) return;
    lastPushRefreshKey.current = key;
    void refreshRides();
    void refreshObavijesti();
  }, [params.fromPush, params.tab, refreshRides, refreshObavijesti]);

  const statusByDatum = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of obavijesti) {
      map.set(row.datum, row.status.toUpperCase());
    }
    return map;
  }, [obavijesti]);

  const pendingInbox = useMemo((): PendingDayInbox[] => {
    if (tab !== 'aktualno') return [];
    const now = new Date();
    return obavijesti
      .filter((o) => o.status.toUpperCase() === 'POSLANO')
      .map((o) => {
        const { label } = dayLabel(o.datum, now);
        return {
          datum: o.datum,
          label,
          obavijest: o,
          rides: rows.filter((r) => r.datumvoznje === o.datum),
        };
      })
      .sort((a, b) => a.datum.localeCompare(b.datum));
  }, [obavijesti, rows, tab]);

  const sections = useMemo(() => {
    if (tab === 'povijest') {
      return groupRidesByDay(rows, range.datumOd, range.datumDo, { includeEmptyDays: true });
    }

    if (tab === 'sutra') {
      const status = statusByDatum.get(range.datumOd)?.toUpperCase();
      if (status !== 'PRIHVACENO') {
        return [];
      }
      return groupRidesByDay(rows, range.datumOd, range.datumDo, { includeEmptyDays: false });
    }

    // Aktualno: samo PRIHVACENO dani (POSLANO ide u inbox).
    const confirmed = rows.filter((r) => statusByDatum.get(r.datumvoznje)?.toUpperCase() === 'PRIHVACENO');
    return groupRidesByDay(confirmed, range.datumOd, range.datumDo, { includeEmptyDays: false });
  }, [range.datumDo, range.datumOd, rows, statusByDatum, tab]);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const section of sections) {
      if (tab === 'povijest') {
        next[section.datum] = true;
      } else {
        next[section.datum] = section.accent !== 'today';
      }
    }
    setCollapsed((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (
        prevKeys.length === nextKeys.length &&
        nextKeys.every((datum) => prev[datum] === next[datum])
      ) {
        return prev;
      }
      return next;
    });
  }, [sections, tab, weekOffset]);

  const listRows = useMemo((): ListRow[] => {
    if (tab === 'aktualno') {
      const out: ListRow[] = [];
      if (pendingInbox.length > 1) {
        out.push({ kind: 'pending-actions' });
      }
      for (const item of pendingInbox) {
        out.push({ kind: 'pending', item });
      }
      if (pendingInbox.length > 0 && sections.length > 0) {
        out.push({ kind: 'confirmed-title' });
      }
      for (const item of sections) {
        out.push({ kind: 'section', item });
      }
      return out;
    }
    return sections.map((item) => ({ kind: 'section' as const, item }));
  }, [pendingInbox, sections, tab]);

  const toggleDay = (datum: string) => {
    setCollapsed((prev) => ({ ...prev, [datum]: !prev[datum] }));
  };

  const markDone = (rideKey: string) => {
    setManualUndone((prev) => {
      if (!prev.has(rideKey)) return prev;
      const next = new Set(prev);
      next.delete(rideKey);
      return next;
    });
    setManualDone((prev) => {
      const next = new Set(prev);
      next.add(rideKey);
      return next;
    });
  };

  const unmarkDone = (rideKey: string) => {
    setManualDone((prev) => {
      if (!prev.has(rideKey)) return prev;
      const next = new Set(prev);
      next.delete(rideKey);
      return next;
    });
    setManualUndone((prev) => {
      const next = new Set(prev);
      next.add(rideKey);
      return next;
    });
  };

  const accentColor = (accent: RasporedDaySection['accent']) => {
    if (accent === 'today') return colors.primary;
    if (accent === 'tomorrow') return colors.info;
    return colors.primaryBorder;
  };

  const canGoOlder = weekOffset < HISTORY_WEEK_MAX;
  const canGoNewer = weekOffset > 0;
  const now = useMemo(() => new Date(nowTick), [nowTick]);
  const allowSwipe = tab === 'aktualno' || tab === 'sutra';

  const sutraStatus = tab === 'sutra' ? statusByDatum.get(range.datumOd)?.toUpperCase() : undefined;
  const sutraRides = useMemo(() => (tab === 'sutra' ? (sections[0]?.rides ?? []) : []), [sections, tab]);
  const sutraDateMeta = useMemo(() => formatDayDisplay(range.datumOd), [range.datumOd]);

  const emptyDescription =
    tab === 'sutra'
      ? sutraStatus === 'POSLANO'
        ? 'Raspored za sutra čeka potvrdu u Aktualno.'
        : 'Još nema rasporeda za sutra.'
      : tab === 'aktualno'
        ? pendingInbox.length > 0
          ? 'Nema potvrđenog rasporeda — potvrdi nove dodjele iznad.'
          : 'Nema još dodijeljenog rasporeda.'
        : 'Nema planiranih vožnji u ovom tjednu.';

  const refreshAll = async () => {
    setNowTick(Date.now());
    await Promise.all([refreshRides(), refreshObavijesti()]);
  };

  const onConfirmDay = async (datum: string) => {
    try {
      await confirmDay(datum);
      await refreshRides();
    } catch {
      Alert.alert('Potvrda', 'Potvrda nije uspjela. Pokušaj ponovo.');
    }
  };

  const onConfirmAll = async () => {
    try {
      await confirmDays(pendingInbox.map((p) => p.datum));
      await refreshRides();
    } catch {
      Alert.alert('Potvrda', 'Potvrda nije uspjela. Pokušaj ponovo.');
    }
  };

  const header = (
    <View style={styles.headerBlock}>
      {tab === 'povijest' ? (
        <View style={styles.weekNav}>
          <Pressable
            onPress={() => {
              if (!canGoOlder) return;
              setWeekOffset((v) => Math.min(HISTORY_WEEK_MAX, v + 1));
            }}
            disabled={!canGoOlder}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Stariji tjedan"
            style={[styles.weekNavBtn, !canGoOlder ? { opacity: 0.35 } : null]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={[styles.weekTitle, { color: colors.text }]}>
            {formatHistoryWeekTitle(range.datumOd, range.datumDo)}
          </Text>
          <Pressable
            onPress={() => {
              if (!canGoNewer) return;
              setWeekOffset((v) => Math.max(0, v - 1));
            }}
            disabled={!canGoNewer}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Noviji tjedan"
            style={[styles.weekNavBtn, !canGoNewer ? { opacity: 0.35 } : null]}
          >
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </Pressable>
        </View>
      ) : null}

      {tab === 'sutra' && sutraRides.length > 0 ? (
        <Text style={[styles.sutraDate, { color: colors.textMuted }]}>
          {sutraDateMeta.weekday} · {sutraDateMeta.date}
        </Text>
      ) : null}

      {!sifOsobe ? <ErrorMessage message="Nedostaje sifosobe u sesiji. Provjeri ERP login." /> : null}
      <ErrorMessage message={ridesError} />
      <ErrorMessage message={obavijestError} />
    </View>
  );

  const driverBanner = (
    <View style={[styles.driverBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.driverIcon, { backgroundColor: colors.primarySurface }]}>
        <Ionicons name="person" size={16} color={colors.primary} />
      </View>
      <Text style={[styles.driverName, { color: colors.text }]} numberOfLines={1}>
        {driverName ?? '—'}
        {sifOsobe ? <Text style={{ color: colors.textMuted }}>{` · ${sifOsobe}`}</Text> : null}
      </Text>
    </View>
  );

  const changeTab = (next: RasporedTab) => {
    setWeekOffset(0);
    setTab(next);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  };

  const renderRide = (ride: VozniRedRow, index: number, total: number) => {
    const key = rideStableKey(ride);
    const done = isRideVisuallyDone(ride, {
      now,
      manualDoneKeys: manualDone,
      manualUndoneKeys: manualUndone,
    });
    return (
      <VoznjaCard
        key={`${key}-${index}`}
        ride={ride}
        isLast={index === total - 1}
        done={done}
        allowSwipeDone={allowSwipe}
        onMarkDone={() => markDone(key)}
        onUnmarkDone={() => unmarkDone(key)}
      />
    );
  };

  const listEmpty =
    loading ? (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    ) : awaitingRange ? (
      <View style={styles.centered} />
    ) : tab === 'aktualno' && pendingInbox.length > 0 ? null : (
      <EmptyState title="Nema vožnji" description={emptyDescription} icon="calendar-outline" />
    );

  const renderSection = (section: RasporedDaySection) => {
    const count = section.rides.length;
    const isCollapsed = collapsed[section.datum] === true;
    const accent = accentColor(section.accent);
    const canCollapse = tab === 'povijest' || count > 0;

    return (
      <View
        style={[
          styles.dayBlock,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: accent,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            if (!canCollapse) return;
            toggleDay(section.datum);
          }}
          style={styles.dayHeader}
          accessibilityRole="button"
          accessibilityState={{ expanded: !isCollapsed }}
        >
          <View style={styles.dayHeaderText}>
            <Text style={[styles.dayTitle, { color: colors.text }]}>{section.label}</Text>
            <Text style={[styles.dayCount, { color: colors.textMuted }]}>
              {count === 0 ? 'Nema vožnji' : count === 1 ? '1 vožnja' : `${count} vožnje`}
            </Text>
          </View>
          {canCollapse ? (
            <Ionicons
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
              color={colors.textMuted}
            />
          ) : null}
        </Pressable>

        {!isCollapsed ? (
          <View style={[styles.dayBody, { borderTopColor: colors.border }]}>
            {count === 0 ? (
              <Text style={[styles.emptyDay, { color: colors.textMuted }]}>Nema planiranih vožnji</Text>
            ) : (
              section.rides.map((ride, index) => renderRide(ride, index, section.rides.length))
            )}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <Screen
      edges={['left', 'right']}
      contentStyle={styles.screen}
      footer={<RasporedTabsBar active={tab} onChange={changeTab} />}
    >
      <View style={styles.body}>
        <View style={styles.stickyHeader}>{driverBanner}</View>
        {tab === 'sutra' ? (
          <FlatList
            key={`sutra-${range.datumOd}-${sutraStatus ?? 'none'}`}
            ref={listRef as RefObject<FlatList>}
            data={sutraRides.length > 0 ? [{ kind: 'section' as const, item: sections[0]! }] : []}
            keyExtractor={() => 'sutra-rides'}
            ListHeaderComponent={header}
            contentContainerStyle={styles.listContent}
            refreshing={pullRefreshing}
            onRefresh={() => {
              void refreshAll();
            }}
            ListEmptyComponent={listEmpty}
            renderItem={() => (
              <View
                style={[
                  styles.ridesSurface,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {sutraRides.map((ride, index) => renderRide(ride, index, sutraRides.length))}
              </View>
            )}
          />
        ) : (
          <FlatList
            key={`${tab}-${range.datumOd}-${range.datumDo}`}
            ref={listRef}
            data={listRows}
            keyExtractor={(row, index) => {
              if (row.kind === 'pending') return `pending-${row.item.datum}`;
              if (row.kind === 'section') return `section-${row.item.datum}`;
              return `${row.kind}-${index}`;
            }}
            ListHeaderComponent={header}
            contentContainerStyle={styles.listContent}
            refreshing={pullRefreshing}
            onRefresh={() => {
              void refreshAll();
            }}
            ListEmptyComponent={listEmpty}
            renderItem={({ item: row }) => {
              if (row.kind === 'pending-actions') {
                return (
                  <Pressable
                    onPress={() => void onConfirmAll()}
                    disabled={confirming}
                    style={({ pressed }) => [
                      styles.confirmAll,
                      {
                        backgroundColor: colors.primarySurface,
                        borderColor: colors.primaryBorder,
                        opacity: confirming ? 0.7 : pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    {confirming ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
                        <Text style={[styles.confirmAllText, { color: colors.primary }]}>
                          Potvrdi sve ({pendingInbox.length})
                        </Text>
                      </>
                    )}
                  </Pressable>
                );
              }
              if (row.kind === 'confirmed-title') {
                return (
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Potvrđeni raspored</Text>
                );
              }
              if (row.kind === 'pending') {
                return (
                  <PendingDayCard
                    item={row.item}
                    confirming={confirming}
                    onConfirm={() => void onConfirmDay(row.item.datum)}
                  />
                );
              }
              return renderSection(row.item);
            }}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 0,
  },
  body: {
    flex: 1,
  },
  stickyHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexGrow: 1,
    gap: spacing.md,
  },
  headerBlock: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  driverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  driverIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  sutraDate: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    textTransform: 'capitalize',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  weekNavBtn: {
    padding: spacing.xs,
  },
  weekTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  confirmAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  confirmAllText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  sectionLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  dayBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dayHeaderText: {
    flex: 1,
    gap: 2,
  },
  dayTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textTransform: 'capitalize',
  },
  dayCount: {
    fontSize: typography.size.xs,
  },
  dayBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  ridesSurface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  emptyDay: {
    fontSize: typography.size.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  centered: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
});
