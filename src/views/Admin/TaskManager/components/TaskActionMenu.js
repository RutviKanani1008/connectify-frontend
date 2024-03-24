import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  Edit,
  MoreVertical,
  Repeat,
  RotateCcw,
  Trash,
  Link as LinkIcon,
} from 'react-feather';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from 'reactstrap';
import { encrypt } from '../../../../helper/common.helper';
import { TOASTTYPES, showToast } from '../../../../utility/toast-helper';

const TaskActionMenu = ({
  handleTaskEdit,
  handleTaskDelete,
  handleChangeParentModal = false,
  handleRestoreTask = false,
  item,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownContent = useMemo(() => {
    return (
      <DropdownMenu end className='task-action-dropdown'>
        <DropdownItem
          tag='div'
          className='w-100 edit-tsak-item'
          onClick={(e) => {
            e.stopPropagation();
            handleTaskEdit?.(item);
          }}
        >
          <Edit color='var(--primaryColorDark)' size={14} className='me-50' />
          <span className='align-middle'>Edit Task</span>
        </DropdownItem>
        {!(item.trash || item.completed) && handleChangeParentModal && (
          <DropdownItem
            tag='div'
            className='w-100'
            onClick={(e) => {
              e.stopPropagation();
              handleChangeParentModal(item);
            }}
          >
            <Repeat
              color='var(--primaryColorDark)'
              size={14}
              className='me-50'
            />
            <span className='align-middle'>Change Parent Task</span>
          </DropdownItem>
        )}
        {item.trash && handleRestoreTask && (
          <DropdownItem
            tag='div'
            className='w-100'
            onClick={(e) => {
              e.stopPropagation();
              handleRestoreTask(item);
            }}
          >
            <RotateCcw size={14} className='me-50' />
            <span className='align-middle'> Restore Task</span>
          </DropdownItem>
        )}
        <DropdownItem
          tag='div'
          className='w-100'
          onClick={(e) => {
            e.stopPropagation();
            handleTaskDelete(item);
          }}
        >
          <Trash color='var(--primaryColorDark)' size={14} className='me-50' />
          <span className='align-middle'>Delete</span>
        </DropdownItem>
        <CopyToClipboard
          text={`${window.location.origin}/task-manager?task=${encrypt(
            item._id
          )}`}
        >
          <DropdownItem
            tag='div'
            className='w-100'
            onClick={(e) => {
              e.stopPropagation();
              const toastId = showToast(TOASTTYPES.loading, '', 'Copy Link...');
              showToast(TOASTTYPES.success, toastId, 'Task Link Copied');
            }}
          >
            <LinkIcon size={15} className='cursor-pointer me-50' />
            Copy Task Link
          </DropdownItem>
        </CopyToClipboard>
      </DropdownMenu>
    );
  }, [item]);

  return (
    <UncontrolledDropdown
      className='task-action-wrapper'
      isOpen={isOpen}
      toggle={() => {
        setIsOpen(!isOpen);
      }}
    >
      <DropdownToggle
        tag='div'
        className='task-action-icon-wrapper'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <MoreVertical size={17} className='cursor-pointer' />
      </DropdownToggle>
      {isOpen && dropdownContent && (
        <React.Fragment>
          {createPortal(dropdownContent, document.body)}
        </React.Fragment>
      )}
    </UncontrolledDropdown>
  );
};

export default TaskActionMenu;
