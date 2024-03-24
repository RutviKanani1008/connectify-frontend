import { ChevronUp } from 'react-feather';
import { createPortal } from 'react-dom';
import React, { useMemo, useState } from 'react';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import { convertHtmlToPlain, hexToRGB } from '../../../../utility/Utils';

const StatusInnerListDropdown = ({
  taskOptions,
  currentStatusOrPriorityChangingIds,
  changePriorityOrStatusLoading,
  setCurrentStatusOrPriorityChangingIds,
  handleUpdateStatusOrPriority,
  item,
  isMobile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus =
    taskOptions.find((obj) => obj._id === item.status) || {};

  const isDisabled =
    currentStatusOrPriorityChangingIds?.includes(
      `${item._id}-${currentStatus?._id}`
    ) && changePriorityOrStatusLoading;

  const dropdownContent = (
    <DropdownMenu className='task-status-dropdown'>
      {taskOptions
        ?.filter(
          (t) =>
            t._id !== 'unassigned' &&
            t.type === 'status' &&
            t._id !== currentStatus._id
        )
        ?.map((obj, index) => (
          <DropdownItem
            key={index}
            onClick={(e) => {
              e.preventDefault();
              setCurrentStatusOrPriorityChangingIds([
                ...currentStatusOrPriorityChangingIds,
                `${item._id}-${currentStatus._id}`,
              ]);
              handleUpdateStatusOrPriority(item, obj, 'status');
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

  // ** Tooltip **
  const statusTooltip = useMemo(() => {
    return item?.latestUpdates?.content ? (
      <>
        {new Date(item?.latestUpdates?.createdAt).toLocaleString('default', {
          month: 'short',
        })}{' '}
        {new Date(item?.latestUpdates?.createdAt)
          .getDate()
          .toString()
          .padStart(2, '0')}
        {' - '}
        {item?.latestUpdates?.createdBy.firstName}{' '}
        {item?.latestUpdates?.createdBy.lastName}
        <br />
        {convertHtmlToPlain(item?.latestUpdates?.content)}
      </>
    ) : (
      <>
        <span className='d-block'>Status : </span>
        <span>{currentStatus.label || 'Unassigned'}</span>
      </>
    );
  }, [item?.latestUpdates, currentStatus]);

  return (
    <>
      {isMobile ? (
        <div className='mobile-task-status-wrapper' style={{ display: 'none' }}>
          <UncontrolledButtonDropdown
            className='task-status'
            onClick={(e) => {
              e.stopPropagation();
            }}
            isOpen={isOpen}
            toggle={() => {
              setIsOpen(!isOpen);
            }}
          >
            <DropdownToggle
              id={`status_handle_${item?._id}`}
              disabled={isDisabled}
              tag='span'
              caret
              className={`badgeLoyal-wrapper`}
            >
              <span
                className='dot'
                style={{
                  border: `1px solid ${currentStatus.color}`,
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0) 50%, ${currentStatus.color} 50%)`,
                }}
              ></span>
              <span className='name' style={{ color: currentStatus.color }}>
                {currentStatus.label || 'Select status'}
              </span>
              <span
                className='bg-wrapper'
                style={{ backgroundColor: currentStatus.color }}
              ></span>
              <span
                className='border-wrapper'
                style={{ border: `1px solid ${currentStatus.color}` }}
              ></span>
            </DropdownToggle>
            <UncontrolledTooltip
              className='task-heading-tooltip'
              key={`status_handle_${item?._id}`}
              style={{ width: '100rem', overflow: 'hidden', maxHeight: '50px' }}
              placement='top'
              target={`status_handle_${item?._id}`}
            >
              {statusTooltip}
            </UncontrolledTooltip>
          </UncontrolledButtonDropdown>
        </div>
      ) : (
        <>
          <UncontrolledButtonDropdown
            className='task-status'
            onClick={(e) => {
              e.stopPropagation();
            }}
            isOpen={isOpen}
            toggle={() => {
              setIsOpen(!isOpen);
            }}
          >
            <DropdownToggle
              id={`status_handle_${item?._id}`}
              disabled={isDisabled}
              tag='span'
              caret
              style={{
                backgroundColor: hexToRGB(
                  currentStatus.color || '#000000',
                  currentStatus.color ? 0.2 : 0.05
                ),
                color: currentStatus.color,
                opacity: isDisabled ? 0.5 : 1,
              }}
              className={`task-status-toggle`}
            >
              <span className='text'>
                {currentStatus.label || 'Select status'}
              </span>
              <ChevronUp className='' size={16} />
            </DropdownToggle>
            <UncontrolledTooltip
              className='task-heading-tooltip'
              key={`status_handle_${item?._id}`}
              style={{ width: '100rem', overflow: 'hidden', maxHeight: '50px' }}
              placement='top'
              target={`status_handle_${item?._id}`}
            >
              {statusTooltip}
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

export default StatusInnerListDropdown;
