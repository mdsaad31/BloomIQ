import React from 'react';
import Lottie from 'lottie-react';
import redTomatoAnimation from '../../assets/lottie/red-tomato.json';
import greenTomatoAnimation from '../../assets/lottie/green-tomato.json';
import flowerAnimation from '../../assets/lottie/flower.json';

/**
 * TomatoStatus Component - Shows animated status icons
 * @param {string} type - 'red' | 'green' | 'flower'
 * @param {number} size - Size of the animation
 * @param {string} label - Optional label text
 */
const TomatoStatus = ({ type = 'red', size = 100, label = '', className = '' }) => {
  const getAnimation = () => {
    switch (type) {
      case 'red':
      case 'fully_ripened':
      case 'l_fully_ripened':
        return redTomatoAnimation;
      case 'green':
      case 'half_ripened':
      case 'l_half_ripened':
      case 'l_green':
        return greenTomatoAnimation;
      case 'flower':
      case 'flowering':
      case 'b_green':
        return flowerAnimation;
      default:
        return redTomatoAnimation;
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div style={{ width: size, height: size }}>
        <Lottie 
          animationData={getAnimation()} 
          loop={true}
          autoplay={true}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700 mt-2">
          {label}
        </span>
      )}
    </div>
  );
};

export default TomatoStatus;
