import { useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  ReduceMotion,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { Body } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import { getZodiacIconName } from "@shared/utils/zodiac";
import type { ZodiacSignId } from "@shared/utils/zodiac";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_SIZE = SCREEN_WIDTH * 0.7;
const STAR_COUNT = 20;
const DURATION = 8000;

type ConstellationRevealProps = {
  sign: ZodiacSignId;
  onComplete: () => void;
};

type StarPoint = { x: number; y: number; delay: number; size: number };

const generateStars = (): StarPoint[] => {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    x: Math.random() * CANVAS_SIZE,
    y: Math.random() * CANVAS_SIZE,
    delay: (i / STAR_COUNT) * (DURATION * 0.7),
    size: 2 + Math.random() * 4,
  }));
};

const AnimatedStar = ({ star }: { star: StarPoint }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      star.delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never })
    );
    scale.value = withDelay(
      star.delay,
      withSequence(
        withTiming(1.5, { duration: 300, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never }),
        withTiming(1, { duration: 300, reduceMotion: ReduceMotion.Never })
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: "#d4af37",
          shadowColor: "#d4af37",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: star.size * 2,
        },
        style,
      ]}
    />
  );
};

export const ConstellationReveal = ({ sign, onComplete }: ConstellationRevealProps) => {
  const { t } = useTranslation();
  const stars = useRef(generateStars());
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.3);
  const ringRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const dotsOpacity = useSharedValue(0.4);

  useEffect(() => {
    const iconDelay = 500;

    iconOpacity.value = withDelay(
      iconDelay,
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never })
    );
    iconScale.value = withDelay(
      iconDelay,
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)), reduceMotion: ReduceMotion.Never })
    );
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear, reduceMotion: ReduceMotion.Never }),
      -1,
      false
    );
    glowOpacity.value = withDelay(
      iconDelay + 500,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, reduceMotion: ReduceMotion.Never }),
          withTiming(0.2, { duration: 1500, reduceMotion: ReduceMotion.Never })
        ),
        -1,
        true
      )
    );
    dotsOpacity.value = withDelay(
      0,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 2000, reduceMotion: ReduceMotion.Never }),
          withTiming(0.3, { duration: 2000, reduceMotion: ReduceMotion.Never })
        ),
        -1,
        true
      )
    );

    const timer = setTimeout(onComplete, DURATION);
    return () => clearTimeout(timer);
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${ringRotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        <Animated.View style={[StyleSheet.absoluteFill, dotsStyle]}>
          {stars.current.map((star, i) => (
            <AnimatedStar key={i} star={star} />
          ))}
        </Animated.View>

        <Animated.View style={[styles.glow, glowStyle]} />

        <Animated.View style={[styles.ring, ringStyle]}>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const r = 70;
            const size = i % 3 === 0 ? 5 : 3;
            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: 70 + Math.cos(angle) * r - size / 2,
                  top: 70 + Math.sin(angle) * r - size / 2,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: colors.gold,
                  opacity: i % 3 === 0 ? 0.9 : 0.4,
                }}
              />
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <MaterialCommunityIcons
            name={getZodiacIconName(sign) as any}
            size={90}
            color={colors.gold}
          />
        </Animated.View>
      </View>
      <Body style={styles.thinkingText}>{t("discover.stars.thinking")}</Body>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 140,
    height: 140,
  },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  thinkingText: {
    fontSize: 14,
    color: colors.gold,
    opacity: 0.7,
    fontFamily: "Inter-Medium",
  },
});
