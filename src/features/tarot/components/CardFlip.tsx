import { type ReactNode } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";

type CardFlipProps = {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  duration?: number;
  onFlipComplete?: () => void;
};

export const CardFlip = ({ front, back, flipped, duration = 800, onFlipComplete }: CardFlipProps) => {
  const rotation = useSharedValue(0);

  const flip = () => {
    rotation.value = withTiming(flipped ? 180 : 0, {
      duration,
      easing: Easing.inOut(Easing.ease),
    }, (finished) => {
      if (finished && onFlipComplete) {
        runOnJS(onFlipComplete)();
      }
    });
  };

  if (flipped && rotation.value === 0) { flip(); }
  else if (!flipped && rotation.value === 180) { flip(); }

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: "hidden" as const,
    opacity: rotation.value <= 90 ? 1 : 0,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: "hidden" as const,
    position: "absolute" as const,
    opacity: rotation.value > 90 ? 1 : 0,
  }));

  return (
    <>
      <Animated.View style={frontStyle}>{back}</Animated.View>
      <Animated.View style={backStyle}>{front}</Animated.View>
    </>
  );
};
