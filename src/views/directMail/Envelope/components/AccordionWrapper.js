import classNames from 'classnames';
import React, { useState } from 'react';

const AccordionWrapper = ({
  className = '',
  children,
  defaultOpen = false,
  title = '',
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={classNames(className, {
        active: isOpen,
        'field-has-error': !isOpen && hasError,
      })}
    >
      <div className='accordian-loyal-header'>
        <div className='inner-wrapper' onClick={() => setIsOpen(!isOpen)}>
          {title && <h3 className='title'>{title}</h3>}
          <div className='down-arrow'></div>
        </div>
      </div>
      {isOpen && children}
    </div>
  );
};

export default AccordionWrapper;
