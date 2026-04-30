import { StyleSheet, View, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing } from '@shared/theme';
import { Body } from '@shared/components';

const TAB_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  index: 'star-four-points-outline',
  tarot: 'cards-outline',
  discover: 'compass-outline',
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || spacing.md }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = (options.title ?? route.name) as string;
        const iconName = TAB_ICONS[route.name] ?? 'circle';

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
            <MaterialCommunityIcons
              name={iconName}
              size={22}
              color={isFocused ? colors.gold : colors.whiteDim}
            />
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
  tabLabel: { fontSize: 10, fontFamily: 'Inter-Medium' },
});
