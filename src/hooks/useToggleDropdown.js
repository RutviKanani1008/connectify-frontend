import { useEffect, useRef, useState } from 'react';

export const useToggleDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownList, setIsDropdownList] = useState({
    isOpen: false,
    id: null,
  });
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleDropdownForList = ({ id, isOpen }) => {
    setIsDropdownList({ id, isOpen });
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownList({
        id: null,
        isOpen: false,
      });
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    setIsDropdownList,
    isDropdownOpen,
    toggleDropdown,
    dropdownRef,
    toggleDropdownForList,
    isDropdownList,
  };
};
