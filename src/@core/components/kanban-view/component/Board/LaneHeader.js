import React from 'react';
import { MoreVertical } from 'react-feather';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';

const disabledIds = ['unAssigned', 'unassignedItem'];

const LaneHeader = ({ id, title, onDeleteStage, onEditStage, stage }) => {
  return (
    <div className='header'>
      <h3 className='title' id={`title_${id}`}>
        {title}
      </h3>
      {!disabledIds.includes(id) && (
        <>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`title_${id}`}
          >
            Reorder this stage by dragging it left or right
          </UncontrolledTooltip>
          <UncontrolledDropdown className='more-options-dropdown'>
            <DropdownToggle
              className='btn-icon p-0'
              color='transparent'
              size='sm'
            >
              <MoreVertical size='18' />
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem
                href='/'
                onClick={(e) => {
                  e.preventDefault();
                  onEditStage({ id, data: stage });
                }}
              >
                Rename
              </DropdownItem>
              <DropdownItem
                href='/'
                onClick={(e) => {
                  e.preventDefault();
                  onDeleteStage({ id, data: stage });
                }}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </>
      )}
    </div>
  );
};

export default LaneHeader;
