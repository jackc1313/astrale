import { useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import { colors } from "@shared/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PARTICLE_COUNT = 30;

type Particle = {
  angle: number;
  distance: number;
  size: number;
  delay: number;
  color: string;
};

const generateParticles = (): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    angle: Math.random() * Math.PI * 2,
    distance: 80 + Math.random() * 120,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 200,
    color: Math.random() > 0.3
      ? `rgba(212, 175, 55, ${0.6 + Math.random() * 0.4})`
      : `rgba(255, 255, 255, ${0.4 + Math.random() * 0.4})`,
  }));
};

type ParticleBurstProps = {
  visible: boolean;
  onComplete?: () => void;
};

const AnimatedParticle = ({ particle, trigger }: { particle: Particle; trigger: boolean }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      progress.value = 0;
      progress.value = withDelay(
        particle.delay,
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
    }
  }, [trigger]);

  const style = useAnimatedStyle(() => {
    const x = Math.cos(particle.angle) * particle.distance * progress.value;
    const y = Math.sin(particle.angle) * particle.distance * progress.value;
    const opacity = progress.value < 0.7 ? 1 : 1 - (progress.value - 0.7) / 0.3;
    const scale = progress.value < 0.3 ? progress.value / 0.3 : 1 - (progress.value - 0.3) * 0.5;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: Math.max(scale, 0) },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        style,
      ]}
    />
  );
};

type BurstOrigin = { top: number; left: number };

export const ParticleBurst = ({ visible, onComplete }: ParticleBurstProps) => {
  const particlesLeft = generateParticles();
  const particlesRight = generateParticles();

  const wheelSize = SCREEN_WIDTH * 0.75;
  const centerY = wheelSize / 2;

  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <Animated.View style={[styles.container, { top: centerY, left: wheelSize * 0.15 }]} pointerEvents="none">
        {particlesLeft.map((p, i) => (
          <AnimatedParticle key={`l${i}`} particle={p} trigger={visible} />
        ))}
      </Animated.View>
      <Animated.View style={[styles.container, { top: centerY, left: wheelSize * 0.85 }]} pointerEvents="none">
        {particlesRight.map((p, i) => (
          <AnimatedParticle key={`r${i}`} particle={p} trigger={visible} />
        ))}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 0,
    height: 0,
    zIndex: 100,
  },
});
