import { useRef, useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Canvas, Path, Skia, Rect, Group, Circle, Line } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withTiming, Easing, ReduceMotion } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Body, Label } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { StoneReading } from "../types";

const CARD_WIDTH = Dimensions.get("window").width - 80;
const CARD_HEIGHT = 200;
const STROKE_WIDTH = 28;
const CELL_SIZE = 18;
const REVEAL_THRESHOLD = 0.25;

type ScratchCardProps = {
  stone: StoneReading;
  onReveal: () => void;
};

const generateGritTexture = () => {
  const dots: { x: number; y: number; r: number; color: string }[] = [];
  const scratches: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];

  for (let i = 0; i < 300; i++) {
    dots.push({
      x: Math.random() * CARD_WIDTH,
      y: Math.random() * CARD_HEIGHT,
      r: Math.random() * 1.5 + 0.5,
      color: Math.random() > 0.5 ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.06)",
    });
  }

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * CARD_WIDTH;
    const y = Math.random() * CARD_HEIGHT;
    scratches.push({
      x1: x,
      y1: y,
      x2: x + (Math.random() - 0.5) * 30,
      y2: y + (Math.random() - 0.5) * 8,
      color: Math.random() > 0.5 ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
    });
  }

  return { dots, scratches };
};

export const ScratchCard = ({ stone, onReveal }: ScratchCardProps) => {
  const [revealed, setRevealed] = useState(false);
  const grit = useRef(generateGritTexture());
  const scratchPath = useRef(Skia.Path.Make());
  const touchCount = useRef(0);
  const totalCells = useRef(Math.ceil((CARD_WIDTH * CARD_HEIGHT) / (CELL_SIZE * CELL_SIZE)));
  const touchedCells = useRef(new Set<string>());
  const [, forceUpdate] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const checkReveal = () => {
    const coverage = touchedCells.current.size / totalCells.current;
    if (coverage >= REVEAL_THRESHOLD && !revealed) {
      overlayOpacity.value = withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never }, (finished) => {
        if (finished) {
          runOnJS(setRevealed)(true);
        }
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onReveal();
    }
  };

  const trackCell = (x: number, y: number) => {
    const cellX = Math.floor(x / CELL_SIZE);
    const cellY = Math.floor(y / CELL_SIZE);
    touchedCells.current.add(`${cellX},${cellY}`);
  };

  const handleStart = useCallback((x: number, y: number) => {
    scratchPath.current.moveTo(x, y);
    trackCell(x, y);
    touchCount.current++;
    forceUpdate((n) => n + 1);
  }, []);

  const handleUpdate = useCallback((x: number, y: number) => {
    scratchPath.current.lineTo(x, y);
    trackCell(x, y);
    touchCount.current++;
    if (touchCount.current % 5 === 0) {
      forceUpdate((n) => n + 1);
      checkReveal();
    }
  }, []);

  const handleEnd = useCallback(() => {
    checkReveal();
  }, []);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      runOnJS(handleStart)(e.x, e.y);
    })
    .onUpdate((e) => {
      runOnJS(handleUpdate)(e.x, e.y);
    })
    .onEnd(() => {
      runOnJS(handleEnd)();
    });

  const stoneContent = (
    <>
      <MaterialCommunityIcons name={stone.icon as any} size={32} color={colors.gold} />
      <Body style={styles.stoneName}>{stone.name}</Body>
      <Label style={styles.stoneProperties}>{stone.properties}</Label>
      <Body style={styles.stoneMessage}>{stone.message}</Body>
    </>
  );

  if (revealed) {
    return (
      <View style={styles.revealedCard}>
        {stoneContent}
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.contentLayer, !contentVisible && { opacity: 0 }]}>
        {stoneContent}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.canvasLayer, animatedOverlayStyle]}>
          <Canvas style={styles.canvas}>
            <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="#2a1838" />
            <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="#d4af3730" />
            {grit.current.dots.map((dot, i) => (
              <Circle key={`d${i}`} cx={dot.x} cy={dot.y} r={dot.r} color={dot.color} />
            ))}
            {grit.current.scratches.map((s, i) => (
              <Line key={`s${i}`} p1={{ x: s.x1, y: s.y1 }} p2={{ x: s.x2, y: s.y2 }} color={s.color} strokeWidth={0.5} />
            ))}
            <Group blendMode="clear">
              <Path
                path={scratchPath.current}
                style="stroke"
                strokeWidth={STROKE_WIDTH}
                strokeCap="round"
                strokeJoin="round"
                color="black"
              />
            </Group>
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: radius.xl,
    overflow: "hidden", borderWidth: 1, borderColor: colors.goldBorder,
  },
  contentLayer: {
    position: "absolute", width: CARD_WIDTH, height: CARD_HEIGHT,
    justifyContent: "center", alignItems: "center", padding: spacing.lg,
    backgroundColor: colors.deepPurple, gap: spacing.xs,
  },
  stoneEmoji: { fontSize: 32 },
  stoneName: {
    fontFamily: "PlayfairDisplay-Bold", fontSize: 18,
    color: colors.gold, textAlign: "center",
  },
  stoneProperties: {
    fontSize: 11, color: colors.gold, textAlign: "center",
    opacity: 0.8, letterSpacing: 0.5,
  },
  stoneMessage: {
    fontSize: 12, color: colors.pearlWhite, textAlign: "center",
    lineHeight: 18, opacity: 0.85, marginTop: spacing.xs,
  },
  canvasLayer: { width: CARD_WIDTH, height: CARD_HEIGHT },
  canvas: { width: CARD_WIDTH, height: CARD_HEIGHT },
  revealedCard: {
    width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.goldBorder, backgroundColor: colors.deepPurple,
    justifyContent: "center", alignItems: "center", padding: spacing.lg, gap: spacing.xs,
  },
});
