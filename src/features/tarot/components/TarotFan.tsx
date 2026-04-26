import { useCallback } from "react";
import { StyleSheet, View, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { colors } from "@shared/theme";
import type { TarotCard as TarotCardType } from "../types";
import { majorArcana } from "../data/majorArcana";
import { TarotCard } from "./TarotCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 80;
const CARD_HEIGHT = 125;
const FAN_RADIUS = SCREEN_WIDTH * 0.9;
const ANGLE_SPREAD = 3;
const TOTAL_ANGLE = ANGLE_SPREAD * (majorArcana.length - 1);

type TarotFanProps = {
  onSelect: (card: TarotCardType) => void;
  disabled?: boolean;
};

export const TarotFan = ({ onSelect, disabled = false }: TarotFanProps) => {
  const scrollOffset = useSharedValue(0);
  const savedOffset = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedOffset.value = scrollOffset.value;
    })
    .onUpdate((e) => {
      scrollOffset.value = savedOffset.value + e.translationX * 0.15;
    })
    .onEnd((e) => {
      scrollOffset.value = withSpring(
        Math.max(
          Math.min(scrollOffset.value + e.velocityX * 0.05, TOTAL_ANGLE / 2),
          -TOTAL_ANGLE / 2
        ),
        { damping: 20, stiffness: 90 }
      );
    });

  const renderCard = useCallback(
    (card: TarotCardType, index: number) => {
      const centerIndex = (majorArcana.length - 1) / 2;
      const baseAngle = (index - centerIndex) * ANGLE_SPREAD;

      return (
        <AnimatedFanCard
          key={card.id}
          card={card}
          baseAngle={baseAngle}
          scrollOffset={scrollOffset}
          onSelect={() => !disabled && onSelect(card)}
        />
      );
    },
    [disabled, onSelect, scrollOffset]
  );

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <View style={styles.fanCenter}>
          {majorArcana.map((card, i) => renderCard(card, i))}
        </View>
      </View>
    </GestureDetector>
  );
};

type AnimatedFanCardProps = {
  card: TarotCardType;
  baseAngle: number;
  scrollOffset: Animated.SharedValue<number>;
  onSelect: () => void;
};

const AnimatedFanCard = ({
  card,
  baseAngle,
  scrollOffset,
  onSelect,
}: AnimatedFanCardProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const angle = baseAngle + scrollOffset.value;
    const radians = (angle * Math.PI) / 180;

    const translateX = Math.sin(radians) * FAN_RADIUS * 0.35;
    const translateY = -Math.cos(radians) * FAN_RADIUS * 0.1 + Math.abs(angle) * 0.8;

    const scale = interpolate(
      Math.abs(angle),
      [0, 15, 40],
      [1, 0.85, 0.65],
      Extrapolation.CLAMP
    );

    const zIndex = interpolate(
      Math.abs(angle),
      [0, 40],
      [100, 0],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      Math.abs(angle),
      [0, 30, 50],
      [1, 0.7, 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { rotateZ: `${angle * 0.5}deg` },
        { scale },
      ],
      zIndex: Math.round(zIndex),
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.cardPosition, animatedStyle]}>
      <Pressable onPress={onSelect}>
        <TarotCard card={card} side="back" width={CARD_WIDTH} height={CARD_HEIGHT} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fanCenter: {
    width: SCREEN_WIDTH,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  cardPosition: {
    position: "absolute",
  },
});
