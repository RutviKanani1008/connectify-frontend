import { useEffect, useState } from 'react';

const useGroupPersist = () => {
  const [selectedGroup, setSelectedGroup] = useState(() => {
    const group = localStorage.getItem('group');

    return group !== null && group !== 'null' ? JSON.parse(group) : null;
  });

  useEffect(() => {
    localStorage.setItem('group', JSON.stringify(selectedGroup));
  }, [selectedGroup]);

  return [selectedGroup, setSelectedGroup];
};

export default useGroupPersist;
