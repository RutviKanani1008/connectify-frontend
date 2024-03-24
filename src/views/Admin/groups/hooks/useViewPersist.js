import { useEffect, useState } from 'react';

const useActiveViewPersist = ({ moduleKey, defaultValue }) => {
  const [activeView, setActiveView] = useState(() => {
    const cachedActiveView = localStorage.getItem('active-view');

    return cachedActiveView !== null && cachedActiveView !== 'null'
      ? JSON.parse(cachedActiveView)
      : null;
  });

  const updateActiveView = (value) => {
    setActiveView({ ...activeView, [moduleKey]: value });
  };

  const getActiveView = () => {
    return activeView?.[moduleKey] || defaultValue;
  };

  useEffect(() => {
    console.log('here', activeView);
    localStorage.setItem('active-view', JSON.stringify(activeView));
  }, [activeView]);

  return [getActiveView(), updateActiveView];
};

export default useActiveViewPersist;
