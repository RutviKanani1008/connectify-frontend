import { ChevronUp } from 'react-feather';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import { hexToRGB } from '../../../../utility/Utils';
import { createPortal } from 'react-dom';
import React, { useMemo, useState } from 'react';

const PriorityInnerListDropdown = ({
  taskOptions,
  item,
  currentStatusOrPriorityChangingIds,
  changePriorityOrStatusLoading,
  setCurrentStatusOrPriorityChangingIds,
  handleUpdateStatusOrPriority,
  isMobile,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentPriority =
    taskOptions.find((obj) => obj._id === item.priority) || {};

  const isDisabled =
    currentStatusOrPriorityChangingIds?.includes(
      `${item._id}-${currentPriority?._id}`
    ) && changePriorityOrStatusLoading;

  const dropdownContent = useMemo(() => {
    return (
      <DropdownMenu className='task-priority-dropdown'>
        {taskOptions
          ?.filter(
            (t) => t.type === 'priority' && t._id !== currentPriority._id
          )
          ?.map((obj, index) => (
            <DropdownItem
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setCurrentStatusOrPriorityChangingIds([
                  ...currentStatusOrPriorityChangingIds,
                  `${item._id}-${currentPriority._id}`,
                ]);
                handleUpdateStatusOrPriority(item, obj, 'priority');
              }}
            >
              <span
                className={`bullet bullet-${obj?.color} bullet-sm me-50`}
                style={{ backgroundColor: obj?.color }}
              ></span>
              {obj.label}
            </DropdownItem>
          ))}
      </DropdownMenu>
    );
  }, [currentPriority, taskOptions]);

  return (
    <>
      {isMobile ? (
        <div
          className='mobile-task-priority-wrapper'
          style={{ display: 'none' }}
        >
          <UncontrolledButtonDropdown
            className='task-priority'
            onClick={(e) => {
              e.stopPropagation();
            }}
            isOpen={isOpen}
            toggle={() => {
              setIsOpen(!isOpen);
            }}
          >
            <DropdownToggle
              id={`priority_handle_${item?._id}`}
              disabled={isDisabled}
              tag='span'
              caret
              className={`badgeLoyal-wrapper`}
            >
              <span
                className='dot'
                style={{
                  border: `1px solid ${currentPriority.color}`,
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0) 50%, ${currentPriority.color} 50%)`,
                }}
              ></span>
              <span className='name' style={{ color: currentPriority.color }}>
                {currentPriority.label || 'Select Priority'}
              </span>
              <span
                className='bg-wrapper'
                style={{ backgroundColor: currentPriority.color }}
              ></span>
              <span
                className='border-wrapper'
                style={{ border: `1px solid ${currentPriority.color}` }}
              ></span>
            </DropdownToggle>
            <UncontrolledTooltip
              placement='top'
              target={`priority_handle_${item?._id}`}
            >
              <span className='d-block'>Priority : </span>
              <span>{currentPriority.label || 'Unassigned'}</span>
            </UncontrolledTooltip>
          </UncontrolledButtonDropdown>
        </div>
      ) : (
        <>
          <UncontrolledButtonDropdown
            className='task-priority'
            onClick={(e) => {
              e.stopPropagation();
            }}
            isOpen={isOpen}
            toggle={() => {
              setIsOpen(!isOpen);
            }}
          >
            <DropdownToggle
              id={`priority_handle_${item?._id}`}
              disabled={isDisabled}
              tag='span'
              caret
              style={{
                backgroundColor: hexToRGB(
                  currentPriority.color || '#000000',
                  currentPriority.color ? 0.2 : 0.05
                ),
                color: currentPriority.color,
                opacity: isDisabled ? 0.5 : 1,
              }}
              className={`task-priority-toggle`}
            >
              <span className='text'>
                {currentPriority.label || 'Select Priority'}
              </span>
              <ChevronUp className='' size={16} />
            </DropdownToggle>
            <UncontrolledTooltip
              placement='top'
              target={`priority_handle_${item?._id}`}
            >
              <span className='d-block'>Priority : </span>
              <span>{currentPriority.label || 'Unassigned'}</span>
            </UncontrolledTooltip>
            {isOpen && dropdownContent && (
              <React.Fragment>
                {createPortal(dropdownContent, document.body)}
              </React.Fragment>
            )}
          </UncontrolledButtonDropdown>
        </>
      )}
    </>
  );
};

export default PriorityInnerListDropdown;
