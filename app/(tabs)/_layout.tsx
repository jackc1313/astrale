import { StyleSheet, View, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@shared/theme';
import { Body } from '@shared/components';

const TAB_ICONS: Record<string, string> = {
  index: '\u2609',
  tarot: '\u2721',
  discover: '\u2728',
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || spacing.md }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = (options.title ?? route.name) as string;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tab}
          >
            <Body
              style={[
                styles.tabIcon,
                { color: isFocused ? colors.gold : colors.whiteDim },
              ]}
            >
              {TAB_ICONS[route.name] ?? '\u25CF'}
            </Body>
            <Body
              style={[
                styles.tabLabel,
                { color: isFocused ? colors.gold : colors.whiteDim },
              ]}
            >
              {label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="tarot" options={{ title: t('tabs.tarot') }} />
      <Tabs.Screen name="discover" options={{ title: t('tabs.discover') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.black,
    borderTopWidth: 1,
    borderTopColor: colors.whiteBorder,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontFamily: 'Inter-Medium' },
});
