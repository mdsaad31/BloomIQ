import React, { useState, useEffect } from 'react';
import { PlantLoader } from '../loaders';

/**
 * UniversalLoader - A wrapper that ensures PlantLoader plays at least once
 * before showing content, and continues until data is loaded
 * 
 * @param {boolean} isLoading - Whether data is still loading
 * @param {string} loadingText - Text to show while loading
 * @param {number} minLoadTime - Minimum load time in ms (default 2000ms for one full animation)
 * @param {ReactNode} children - Content to show after loading
 */
const UniversalLoader = ({ 
  isLoading, 
  loadingText = 'Loading...', 
  minLoadTime = 2000,
  children 
}) => {
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Start timer to ensure animation plays at least once
    const timer = setTimeout(() => {
      setHasPlayedOnce(true);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  useEffect(() => {
    // Show content only when both conditions are met:
    // 1. Animation has played at least once
    // 2. Data loading is complete
    if (hasPlayedOnce && !isLoading) {
      setShowContent(true);
    }
  }, [hasPlayedOnce, isLoading]);

  if (!showContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PlantLoader size={250} text={loadingText} />
      </div>
    );
  }

  return <>{children}</>;
};

export default UniversalLoader;
