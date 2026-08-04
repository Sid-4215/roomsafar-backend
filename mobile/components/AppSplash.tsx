import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface AppSplashProps {
  /** When true the splash fades out and calls onDone */
  ready: boolean;
  onDone: () => void;
}

export default function AppSplash({ ready, onDone }: AppSplashProps) {
  // --- entrance animations ---
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;

  // --- three bouncing dots ---
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // --- exit fade ---
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Entrance: logo → brand text → tagline
  useEffect(() => {
    Animated.sequence([
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // Brand name fades up
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Tagline fades up
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Bouncing dots loop
    const bounceDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -8,
            duration: 320,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ])
      );

    const d1 = bounceDot(dot1, 0);
    const d2 = bounceDot(dot2, 140);
    const d3 = bounceDot(dot3, 280);
    d1.start(); d2.start(); d3.start();
    return () => { d1.stop(); d2.stop(); d3.stop(); };
  }, []);

  // Exit: fade the whole screen out when auth is ready
  useEffect(() => {
    if (!ready) return;
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 400,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => onDone());
  }, [ready]);

  const textTranslate = textOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });
  const tagTranslate = tagOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar style="dark" />

      {/* Background blobs for depth */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="home-search" size={52} color="#FF385C" />
        </View>
        {/* Small accent dot */}
        <View style={styles.accentDot} />
      </Animated.View>

      {/* Brand name */}
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textTranslate }],
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        <Text style={styles.brandText}>
          Room<Text style={styles.brandAccent}>Safar</Text>
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={{
          opacity: tagOpacity,
          transform: [{ translateY: tagTranslate }],
          marginTop: 8,
        }}
      >
        <Text style={styles.tagline}>Find your perfect room</Text>
      </Animated.View>

      {/* Bouncing dots */}
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              i === 1 && styles.dotMid,
              { transform: [{ translateY: anim }] },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FFF0F2',
    opacity: 0.7,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFF5F0',
    opacity: 0.6,
  },
  logoWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 32,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF385C',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  accentDot: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF385C',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  brandText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#222222',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#FF385C',
  },
  tagline: {
    fontSize: 15,
    color: '#888888',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
  },
  dotMid: {
    backgroundColor: '#FF385C',
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});
