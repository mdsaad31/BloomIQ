import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface TomatoStatusProps {
  status: 'fully_ripened' | 'half_ripened' | 'l_green';
  size?: number;
}

const TomatoStatus: React.FC<TomatoStatusProps> = ({ status, size = 100 }) => {
  const getAnimationSource = () => {
    switch (status) {
      case 'fully_ripened':
        return require('../../assets/lottie/red-tomato.json');
      case 'half_ripened':
      case 'l_green':
        return require('../../assets/lottie/green-tomato.json');
      default:
        return require('../../assets/lottie/green-tomato.json');
    }
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={getAnimationSource()}
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
    width: 100,
    height: 100,
  },
});

export default TomatoStatus;
