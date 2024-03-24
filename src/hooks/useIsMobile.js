import { useState, useEffect } from 'react';

const maxMobileSize = 767;
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < maxMobileSize);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= maxMobileSize);
  };

  return isMobile;
};

export default useIsMobile;
