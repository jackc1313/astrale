import { useCallback, useRef, useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Canvas, Path, Skia, Circle, Line } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  runOnJS,
  ReduceMotion,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { colors } from "@shared/theme";
import type { WheelItem } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WHEEL_SIZE = SCREEN_WIDTH * 0.75;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const CENTER = WHEEL_RADIUS;

const SEGMENT_COLORS = [
  "#1a1028", "#2a1838", "#3d2a4a", "#1a1028",
  "#2a1838", "#3d2a4a", "#1a1028", "#2a1838",
];

const SEGMENT_ACCENTS = [
  "#d4af37", "#c4a030", "#e4bf47", "#d4af37",
  "#c4a030", "#e4bf47", "#d4af37", "#c4a030",
];

const generateSparkles = () => {
  const sparkles: { x: number; y: number; r: number; color: string }[] = [];
  const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];

  for (let i = 0; i < 600; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * WHEEL_RADIUS * 0.95;
    const x = CENTER + Math.cos(angle) * dist;
    const y = CENTER + Math.sin(angle) * dist;

    sparkles.push({
      x,
      y,
      r: Math.random() * 1.8 + 0.3,
      color: Math.random() > 0.5
        ? `rgba(212,175,55,${0.15 + Math.random() * 0.4})`
        : `rgba(255,255,255,${0.05 + Math.random() * 0.15})`,
    });
  }

  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * WHEEL_RADIUS * 0.8 + WHEEL_RADIUS * 0.1;
    const x = CENTER + Math.cos(angle) * dist;
    const y = CENTER + Math.sin(angle) * dist;
    const len = Math.random() * 6 + 2;
    const a = Math.random() * Math.PI * 2;

    lines.push({
      x1: x - Math.cos(a) * len,
      y1: y - Math.sin(a) * len,
      x2: x + Math.cos(a) * len,
      y2: y + Math.sin(a) * len,
      color: `rgba(212,175,55,${0.08 + Math.random() * 0.15})`,
    });
  }

  return { sparkles, lines };
};

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
  const sparkleData = useRef(generateSparkles());

  const isGestureSpin = useRef(false);

  const setGestureFlag = useCallback((value: boolean) => {
    isGestureSpin.current = value;
  }, []);

  const handleSpinEnd = useCallback((finalAngle: number) => {
    isGestureSpin.current = false;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSpinEnd(finalAngle);
  }, [onSpinEnd]);

  const triggerSpin = useCallback(() => {
    const randomVelocity = 5000 + Math.random() * 4000;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    rotation.value = withDecay(
      {
        velocity: randomVelocity,
        deceleration: 0.9997,
        reduceMotion: ReduceMotion.Never,
      },
      (finished) => {
        if (finished) {
          const finalAngle = ((rotation.value % 360) + 360) % 360;
          runOnJS(handleSpinEnd)(finalAngle);
        }
      }
    );
  }, [handleSpinEnd]);

  useEffect(() => {
    if (spinning && !isGestureSpin.current) {
      triggerSpin();
    }
  }, [spinning]);

  const flingGesture = Gesture.Pan()
    .enabled(!disabled && !spinning)
    .onStart(() => {
      runOnJS(setGestureFlag)(true);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onEnd((e) => {
      const velocity = Math.abs(e.velocityY) > Math.abs(e.velocityX)
        ? e.velocityY
        : e.velocityX;

      const boostedVelocity = velocity * 2.5 + (velocity > 0 ? 4000 : -4000);

      rotation.value = withDecay(
        {
          velocity: boostedVelocity,
          deceleration: 0.9997,
          reduceMotion: ReduceMotion.Never,
        },
        (finished) => {
          if (finished) {
            const finalAngle = ((rotation.value % 360) + 360) % 360;
            runOnJS(handleSpinEnd)(finalAngle);
          }
        }
      );

      runOnJS(onSpinStart)();
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

  const buildDividerLine = (index: number) => {
    const angle = index * segmentAngle - Math.PI / 2;
    return {
      x1: CENTER,
      y1: CENTER,
      x2: CENTER + WHEEL_RADIUS * Math.cos(angle),
      y2: CENTER + WHEEL_RADIUS * Math.sin(angle),
    };
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

            {Array.from({ length: segmentCount }, (_, i) => {
              const line = buildDividerLine(i);
              return (
                <Line
                  key={`div-${i}`}
                  p1={{ x: line.x1, y: line.y1 }}
                  p2={{ x: line.x2, y: line.y2 }}
                  color="rgba(212,175,55,0.3)"
                  strokeWidth={1}
                />
              );
            })}

            {sparkleData.current.sparkles.map((s, i) => (
              <Circle key={`sp-${i}`} cx={s.x} cy={s.y} r={s.r} color={s.color} />
            ))}
            {sparkleData.current.lines.map((l, i) => (
              <Line
                key={`sl-${i}`}
                p1={{ x: l.x1, y: l.y1 }}
                p2={{ x: l.x2, y: l.y2 }}
                color={l.color}
                strokeWidth={0.5}
              />
            ))}

            <Circle cx={CENTER} cy={CENTER} r={18} color="#1a1028" />
            <Circle cx={CENTER} cy={CENTER} r={18} color="rgba(212,175,55,0.4)" style="stroke" strokeWidth={2} />
            <Circle cx={CENTER} cy={CENTER} r={4} color="#d4af37" />
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
    borderWidth: 3,
    borderColor: colors.gold,
    overflow: "hidden",
  },
});
