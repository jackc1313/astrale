import { useRef, useState, useCallback } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Canvas, Path, Skia, Rect, Group } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";

const CARD_WIDTH = Dimensions.get("window").width - 80;
const CARD_HEIGHT = 200;
const STROKE_WIDTH = 28;
const CELL_SIZE = 18;
const REVEAL_THRESHOLD = 0.7;

type ScratchCardProps = {
  content: string;
  onReveal: () => void;
};

export const ScratchCard = ({ content, onReveal }: ScratchCardProps) => {
  const [revealed, setRevealed] = useState(false);
  const scratchPath = useRef(Skia.Path.Make());
  const touchCount = useRef(0);
  const totalCells = useRef(Math.ceil((CARD_WIDTH * CARD_HEIGHT) / (CELL_SIZE * CELL_SIZE)));
  const touchedCells = useRef(new Set<string>());
  const [, forceUpdate] = useState(0);
  const overlayOpacity = useSharedValue(1);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const checkReveal = () => {
    const coverage = touchedCells.current.size / totalCells.current;
    if (coverage >= REVEAL_THRESHOLD && !revealed) {
      overlayOpacity.value = withTiming(0, { duration: 600 }, (finished) => {
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

  if (revealed) {
    return (
      <View style={styles.revealedCard}>
        <Body style={styles.contentText}>{content}</Body>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentLayer}>
        <Body style={styles.contentText}>{content}</Body>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.canvasLayer, animatedOverlayStyle]}>
          <Canvas style={styles.canvas}>
            <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="#2a1838" />
            <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="#d4af3730" />
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
    justifyContent: "center", alignItems: "center", padding: spacing.xl,
    backgroundColor: colors.deepPurple,
  },
  contentText: {
    fontFamily: "PlayfairDisplay-Bold", fontSize: 16,
    color: colors.pearlWhite, textAlign: "center", lineHeight: 24,
  },
  canvasLayer: { width: CARD_WIDTH, height: CARD_HEIGHT },
  canvas: { width: CARD_WIDTH, height: CARD_HEIGHT },
  revealedCard: {
    width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.goldBorder, backgroundColor: colors.deepPurple,
    justifyContent: "center", alignItems: "center", padding: spacing.xl,
  },
});
