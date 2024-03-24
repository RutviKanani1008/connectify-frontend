import Tippy from '@tippyjs/react';
import React, { useEffect, useRef, useState } from 'react';

const defaultTippyProps = {
  theme: 'light',
};

const TippyDropdown = (props) => {
  const {
    children,
    content,
    hideOnClick = true,
    placement = 'bottom-start',
    className = '',
    appendTo,
    dynamicTippyProps,
    customOnClick,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (hideOnClick) {
      document.addEventListener('mousedown', onClick, true);
      return () => {
        document.removeEventListener('mousedown', onClick, true);
      };
    }
  });

  const onClick = (event) => {
    if (instanceRef.current) {
      const { popper, reference, state } = instanceRef.current;

      if (
        !popper.contains(event.target) &&
        !reference.contains(event.target) &&
        !(state.isVisible && reference.contains(event.target))
      ) {
        close();
      }
    }
  };

  const open = () => {
    if (instanceRef.current) {
      const { state } = instanceRef.current;
      customOnClick?.(state);
      if (!state.isVisible) {
        setIsOpen(true);
      } else {
        close();
      }
    }
  };

  const close = () => {
    setIsOpen(false);
  };

  const tippyContent = content({ close, isOpen, setIsOpen });

  return (
    <Tippy
      className={`tippy__dropdown ${className}`}
      {...defaultTippyProps}
      {...dynamicTippyProps}
      onCreate={(instance) => {
        instanceRef.current = instance;
      }}
      visible={isOpen}
      content={tippyContent}
      placement={placement}
      appendTo={appendTo}
    >
      {React.cloneElement(children, { onClick: open })}
    </Tippy>
  );
};

export default TippyDropdown;
