import { useCallback } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { colors } from "@shared/theme";
import type { WheelItem } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WHEEL_SIZE = SCREEN_WIDTH * 0.7;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const CENTER = WHEEL_RADIUS;

const SEGMENT_COLORS = [
  "#1a1028", "#2a1838", "#d4af37", "#1a1028",
  "#2a1838", "#3a2848", "#d4af37", "#1a1028",
];

type FortuneWheelProps = {
  items: WheelItem[];
  spinning: boolean;
  onSpinEnd: (angle: number) => void;
  onSpinStart: () => void;
  disabled?: boolean;
};

export const FortuneWheel = ({
  items,
  spinning,
  onSpinEnd,
  onSpinStart,
  disabled = false,
}: FortuneWheelProps) => {
  const rotation = useSharedValue(0);

  const handleSpinEnd = useCallback((finalAngle: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSpinEnd(finalAngle);
  }, [onSpinEnd]);

  const flingGesture = Gesture.Pan()
    .enabled(!disabled && !spinning)
    .onStart(() => {
      runOnJS(onSpinStart)();
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onEnd((e) => {
      const velocity = Math.abs(e.velocityY) > Math.abs(e.velocityX)
        ? e.velocityY
        : e.velocityX;

      rotation.value = withDecay(
        {
          velocity: velocity * 0.5,
          deceleration: 0.997,
        },
        (finished) => {
          if (finished) {
            const finalAngle = ((rotation.value % 360) + 360) % 360;
            runOnJS(handleSpinEnd)(finalAngle);
          }
        }
      );
    });

  const animatedWheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const segmentCount = items.length > 0 ? items.length : 8;
  const segmentAngle = (2 * Math.PI) / segmentCount;

  const buildSegmentPath = (index: number): string => {
    const startAngle = index * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;

    const x1 = CENTER + WHEEL_RADIUS * Math.cos(startAngle);
    const y1 = CENTER + WHEEL_RADIUS * Math.sin(startAngle);
    const x2 = CENTER + WHEEL_RADIUS * Math.cos(endAngle);
    const y2 = CENTER + WHEEL_RADIUS * Math.sin(endAngle);

    const largeArc = segmentAngle > Math.PI ? 1 : 0;

    return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <GestureDetector gesture={flingGesture}>
      <View style={styles.container}>
        <Animated.View style={[styles.wheel, animatedWheelStyle]}>
          <Canvas style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
            {Array.from({ length: segmentCount }, (_, i) => {
              const path = Skia.Path.MakeFromSVGString(buildSegmentPath(i));
              if (!path) return null;

              return (
                <Path
                  key={i}
                  path={path}
                  color={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                />
              );
            })}
          </Canvas>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_RADIUS,
    borderWidth: 2,
    borderColor: colors.goldBorder,
    overflow: "hidden",
  },
});
