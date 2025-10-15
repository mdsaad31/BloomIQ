import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';

interface PlantLoaderProps {
  message?: string;
  size?: number;
}

const PlantLoader: React.FC<PlantLoaderProps> = ({ 
  message = 'Loading...', 
  size = 200 
}) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/lottie/plant-loader.json')}
        autoPlay
        loop
        style={[styles.animation, { width: size, height: size }]}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default PlantLoader;
