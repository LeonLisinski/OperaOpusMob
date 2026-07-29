import { Linking, StyleSheet, Text } from 'react-native';

import { isHtmlValue, parseHtmlSegments } from '@/features/documents/htmlValue';
import { typography } from '@/theme';

interface RichDetailTextProps {
  value: unknown;
  textColor: string;
  linkColor: string;
}

/** Prikaz HTML vrijednosti detalja — tel linkovi su klikabilni, ostalo se stripa kao tekst. */
export function RichDetailText({ value, textColor, linkColor }: RichDetailTextProps) {
  const raw = String(value);

  if (!isHtmlValue(raw)) {
    return (
      <Text style={[styles.value, { color: textColor }]} selectable>
        {raw}
      </Text>
    );
  }

  const segments = parseHtmlSegments(raw);

  return (
    <Text style={[styles.value, { color: textColor }]} selectable>
      {segments.map((segment, index) => {
        if (segment.kind === 'text') {
          return <Text key={index}>{segment.text}</Text>;
        }

        const href = segment.href.startsWith('tel:') || segment.href.startsWith('mailto:') || segment.href.startsWith('http')
          ? segment.href
          : segment.href;

        return (
          <Text
            key={index}
            style={[styles.link, { color: linkColor }]}
            onPress={() => Linking.openURL(href).catch(() => undefined)}
            accessibilityRole="link"
          >
            {segment.label}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: typography.size.md,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
