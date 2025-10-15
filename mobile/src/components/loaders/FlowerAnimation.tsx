import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface FlowerAnimationProps {
  size?: number;
}

const FlowerAnimation: React.FC<FlowerAnimationProps> = ({ size = 80 }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/lottie/flower.json')}
        autoPlay
        loop
        style={[styles.animation, { width: size, height: size }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 80,
    height: 80,
  },
});

export default FlowerAnimation;
