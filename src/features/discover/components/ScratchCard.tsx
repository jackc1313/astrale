import { useRef, useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Canvas, Path, Skia, Rect, Group } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";

const CARD_WIDTH = Dimensions.get("window").width - 80;
const CARD_HEIGHT = 200;
const STROKE_WIDTH = 40;
const REVEAL_THRESHOLD = 0.6;

type ScratchCardProps = {
  content: string;
  onReveal: () => void;
};

export const ScratchCard = ({ content, onReveal }: ScratchCardProps) => {
  const [revealed, setRevealed] = useState(false);
  const scratchPath = useRef(Skia.Path.Make());
  const touchCount = useRef(0);
  const totalCells = useRef(Math.ceil((CARD_WIDTH * CARD_HEIGHT) / (STROKE_WIDTH * STROKE_WIDTH)));
  const touchedCells = useRef(new Set<string>());
  const [, forceUpdate] = useState(0);

  const checkReveal = () => {
    const coverage = touchedCells.current.size / totalCells.current;
    if (coverage >= REVEAL_THRESHOLD && !revealed) {
      setRevealed(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onReveal();
    }
  };

  const trackCell = (x: number, y: number) => {
    const cellX = Math.floor(x / STROKE_WIDTH);
    const cellY = Math.floor(y / STROKE_WIDTH);
    touchedCells.current.add(`${cellX},${cellY}`);
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      scratchPath.current.moveTo(e.x, e.y);
      trackCell(e.x, e.y);
      touchCount.current++;
      forceUpdate((n) => n + 1);
    })
    .onUpdate((e) => {
      scratchPath.current.lineTo(e.x, e.y);
      trackCell(e.x, e.y);
      touchCount.current++;
      if (touchCount.current % 5 === 0) {
        forceUpdate((n) => n + 1);
        checkReveal();
      }
    })
    .onEnd(() => {
      checkReveal();
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
        <View style={styles.canvasLayer}>
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
        </View>
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
