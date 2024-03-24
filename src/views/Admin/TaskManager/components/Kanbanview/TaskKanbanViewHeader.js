import React from 'react';
import { MoreVertical, Plus } from 'react-feather';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';

const disabledIds = ['unassignedItem'];

const TaskKanbanViewHeader = ({
  id,
  title,
  onDeleteStage,
  onEditStage,
  stage,
  currentKanbanView,
  handleAddNewTask = () => {},
}) => {
  return (
    <div
      className='taskKanbanView-col-header'
      style={{ borderTop: `3px solid ${stage?.stageDetails?.color}` }}
    >
      <h3 className='title' id={`title_${id}`}>
        {title}
      </h3>
      <div
        className='cursor-pointer'
        id={`add_task_${id}`}
        onClick={() => {
          handleAddNewTask();
        }}
      >
        <Plus id='add_category_btn' className='cursor-pointer' size={16} />
      </div>
      <UncontrolledTooltip
        placement='top'
        autohide={true}
        target={`add_task_${id}`}
      >
        Add New Task
      </UncontrolledTooltip>
      {!disabledIds.includes(id) && (
        <>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`title_${id}`}
          >
            Reorder this stage by dragging it left or right
          </UncontrolledTooltip>
          {id !== 'unassigned' && (
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
                    onEditStage(stage?.stageDetails, currentKanbanView);
                  }}
                >
                  Rename
                </DropdownItem>
                <DropdownItem
                  href='/'
                  onClick={(e) => {
                    e.preventDefault();
                    onDeleteStage(stage?.stageDetails);
                  }}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          )}
        </>
      )}
    </div>
  );
};

export default TaskKanbanViewHeader;
