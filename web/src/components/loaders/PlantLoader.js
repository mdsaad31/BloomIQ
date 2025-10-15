import React from 'react';
import Lottie from 'lottie-react';
import plantAnimation from '../../assets/lottie/plant-loader.json';

const PlantLoader = ({ size = 200, text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div style={{ width: size, height: size }}>
        <Lottie 
          animationData={plantAnimation} 
          loop={true}
          autoplay={true}
        />
      </div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default PlantLoader;
