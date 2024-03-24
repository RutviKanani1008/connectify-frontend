/* eslint-disable no-tabs */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MoreVertical } from 'react-feather';
import Avatar from '@components/avatar';
import { Icon } from '@iconify/react';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import defaultAvatar from '@src/assets/images/avatars/avatar-blank.png';
import moment from 'moment';
import { getFullName } from '../../../../../utility/Utils';

const TaskKanbanViewTaskCard = ({
  taskData,
  viewCardDetails,
  handleChangeParentModal,
  handleTaskDelete,
  stageId,
  handleUpdateTask,
  handleSnoozeTask,
  handleCompleteTask,
  handleSnoozeOffTasks,
}) => {
  const [open, setOpen] = useState(null);

  return (
    <>
      <div className='taskKanbanCard__box'>
        <div className='inner-wrapper-tc'>
          <div
            className='titleWrapper'
            onClick={(event) => {
              event.stopPropagation();
              viewCardDetails(taskData);
            }}
          >
            <div className='top-header'>
              <div className='left-wrapper'>
                <div className='move-icon-cell'>
                  <div className='move-icon-wrapper'>
                    <MoreVertical className='drag-icon' />
                    <MoreVertical className='drag-icon' />
                  </div>
                </div>
                <span className='task-number'>#{taskData.taskNumber}</span>
              </div>
              <div className='right-action'>
                {false && (
                  <div className='task-checkbox-wrapper'>
                    <div className='switch-checkbox'>
                      <Input
                        key={`${taskData?.completed}_${taskData._id}`}
                        id={`complete_${taskData._id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        checked={!!taskData?.completed}
                        className={`${
                          [].includes(taskData?._id) ? 'opacity-50' : ''
                        } task-checkbox`}
                        type='checkbox'
                        onChange={(e) => {
                          handleCompleteTask(
                            taskData,
                            e.target.checked,
                            stageId
                          );
                        }}
                      />
                      <span className='switch-design'></span>
                    </div>
                    <UncontrolledTooltip
                      data-trigger='hover'
                      autohide
                      key={`complete_${taskData._id}`}
                      placement='top'
                      target={`complete_${taskData._id}`}
                    >
                      {taskData?.completed
                        ? 'Reopen The Task'
                        : 'Mark As Archived Task'}
                    </UncontrolledTooltip>
                  </div>
                )}
                <div className='action-btn-wrapper'>
                  <div
                    className='action-btn task-snooze-btn'
                    id={`snoozeTask_${taskData?._id}`}
                  >
                    {taskData?.snoozeDetail?._id ? (
                      <div
                        className='inner-wrapper'
                        onClick={(event) => {
                          event.stopPropagation();
                          if (taskData?.snoozeDetail?._id) {
                            handleSnoozeOffTasks(taskData, stageId);
                          } else {
                            handleSnoozeTask(taskData, stageId);
                          }
                        }}
                      >
                        <svg
                          version='1.1'
                          id='Layer_1'
                          x='0px'
                          y='0px'
                          viewBox='0 0 40 40'
                          xmlSpace='preserve'
                        >
                          <path
                            d='M35,25.5c-1.9-3.2-2.9-6.8-2.9-10.5v-2.3c0-5.5-4.5-10-10-10h-4.2c-1.5,0-2.8,0.3-4.1,0.9l2,2.8C16.4,6.1,17.1,6,17.9,6h4.2
	c3.7,0,6.7,3,6.7,6.7V15c0,4.3,1.2,8.5,3.4,12.2c0.2,0.3,0.3,0.6,0.3,0.9c0,0.4-0.1,0.7-0.3,1l2,2.7c0,0,0.1-0.1,0.1-0.1
	c0.9-0.9,1.5-2.2,1.5-3.6C35.7,27.2,35.5,26.3,35,25.5z M9.3,29.9c-1,0-1.8-0.8-1.8-1.8c0-0.3,0.1-0.6,0.3-0.9
	c2.2-3.7,3.4-7.9,3.4-12.2v-2.3c0-1.8,0.7-3.4,1.8-4.6L11,5.4c-2,1.8-3.2,4.4-3.2,7.3V15c0,3.7-1,7.3-2.9,10.5
	c-0.5,0.8-0.7,1.7-0.7,2.6c0,1.4,0.6,2.7,1.5,3.6c0.9,0.9,2.2,1.5,3.6,1.5h21.3c0.1,0,0.3,0,0.4,0l-2.4-3.3H9.3z'
                          />
                          <path
                            d='M26.6,35.6c0.5-0.8,0.3-1.8-0.5-2.3s-1.8-0.3-2.3,0.5c-1.1,1.6-2.3,2.4-3.9,2.4s-2.8-0.8-3.9-2.4c-0.5-0.8-1.5-1-2.3-0.5
	c-0.8,0.5-1,1.5-0.5,2.3c1.7,2.6,3.9,3.9,6.6,3.9S24.9,38.2,26.6,35.6z'
                          />
                          <g>
                            <path
                              d='M30,36.9L6.5,4.2C5.9,3.5,6.1,2.5,6.9,1.9l0,0c0.7-0.5,1.8-0.4,2.3,0.4L32.7,35c0.5,0.7,0.4,1.8-0.4,2.3l0,0
		C31.5,37.8,30.5,37.6,30,36.9z'
                            />
                          </g>
                        </svg>
                      </div>
                    ) : (
                      <div
                        className='inner-wrapper'
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSnoozeTask(taskData, stageId);
                        }}
                      >
                        <svg
                          version='1.1'
                          id='Layer_1'
                          x='0px'
                          y='0px'
                          viewBox='0 0 40 40'
                          xmlSpace='preserve'
                        >
                          <path
                            d='M29.7,31.8C29.7,31.8,29.7,31.8,29.7,31.8H10.3c0,0,0,0,0,0c-2.4,0-4.4-2-4.4-4.4c0-0.8,0.2-1.6,0.6-2.3
	c1.8-2.9,2.7-6.3,2.7-9.7v-2.1c0-4.9,4-8.9,8.9-8.9h3.8c0,0,0,0,0,0c1.7,0,3.4,0.5,4.8,1.4c0.6,0.4,0.7,1.2,0.4,1.7
	c-0.4,0.6-1.2,0.7-1.7,0.4c-1-0.7-2.2-1-3.5-1c0,0,0,0,0,0h-3.8c-3.5,0-6.4,2.9-6.4,6.4v2.1c0,3.9-1,7.6-3,11
	c-0.2,0.3-0.3,0.6-0.3,1c0,1,0.8,1.9,1.9,1.9c0,0,0,0,0,0h19.4c0,0,0,0,0,0c0.3,0,0.7-0.1,1-0.3c0.4-0.3,0.7-0.7,0.9-1.2
	c0.1-0.5,0-1-0.2-1.4c-2-3.3-3-7.1-3-11c0-0.7,0.6-1.2,1.2-1.2s1.2,0.6,1.2,1.2c0,3.4,0.9,6.8,2.7,9.7c0.6,1,0.8,2.2,0.5,3.3
	c-0.3,1.1-1,2.1-2,2.7C31.3,31.6,30.5,31.8,29.7,31.8z M25.8,34.1c0.4-0.6,0.2-1.4-0.3-1.7c-0.6-0.4-1.3-0.2-1.7,0.3
	c-1,1.5-2.2,2.3-3.7,2.3s-2.7-0.8-3.7-2.3c-0.4-0.6-1.2-0.7-1.7-0.3c-0.6,0.4-0.7,1.2-0.3,1.7c1.5,2.3,3.5,3.4,5.8,3.4
	C22.3,37.5,24.3,36.3,25.8,34.1z M25.1,17.2c0-0.7-0.6-1.2-1.2-1.2h-1.5l2.5-3.8c0.3-0.4,0.3-0.9,0.1-1.3c-0.2-0.4-0.6-0.7-1.1-0.7
	H20c-0.7,0-1.2,0.6-1.2,1.2s0.6,1.2,1.2,1.2h1.5L19,16.5c-0.3,0.4-0.3,0.9-0.1,1.3c0.2,0.4,0.6,0.7,1.1,0.7h3.8
	C24.5,18.4,25.1,17.9,25.1,17.2z M34.6,11.5c0-0.7-0.6-1.2-1.2-1.2h-3.2l4.2-5.6c0.3-0.4,0.3-0.9,0.1-1.3s-0.6-0.7-1.1-0.7h-5.7
	c-0.7,0-1.2,0.6-1.2,1.2s0.6,1.2,1.2,1.2h3.2l-4.2,5.6c-0.3,0.4-0.3,0.9-0.1,1.3s0.6,0.7,1.1,0.7h5.7C34,12.7,34.6,12.2,34.6,11.5z'
                          />
                        </svg>
                      </div>
                    )}
                    <UncontrolledTooltip
                      className='task-heading-tooltip'
                      placement='top'
                      target={`snoozeTask_${taskData?._id}`}
                    >
                      {taskData?.snoozeDetail?._id
                        ? 'Unsnooze Task'
                        : 'Snooze Task'}
                    </UncontrolledTooltip>
                  </div>
                  <div
                    className='action-btn task-update-btn'
                    id={`update_${taskData?._id}`}
                  >
                    <div
                      className='inner-wrapper'
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUpdateTask(taskData);
                      }}
                    >
                      <Icon icon='ci:chat-add' className={`cursor-pointer`} />
                    </div>
                    <UncontrolledTooltip
                      className='task-heading-tooltip'
                      placement='top'
                      target={`update_${taskData?._id}`}
                    >
                      Add Update
                    </UncontrolledTooltip>
                  </div>
                  <div className='action-btn task-toggle-btn'>
                    <div className='task-action-wrapper dropdown'>
                      <div className='task-action-icon-wrapper'>
                        <UncontrolledDropdown
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                          className='more-options-dropdown'
                        >
                          <DropdownToggle
                            className='btn-icon p-0'
                            color='transparent'
                            size='sm'
                          >
                            <MoreVertical size='18' />
                          </DropdownToggle>
                          <DropdownMenu
                            end
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            <DropdownItem
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                viewCardDetails(taskData);
                              }}
                            >
                              Edit Task
                            </DropdownItem>
                            <DropdownItem
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleChangeParentModal(taskData);
                              }}
                            >
                              Change Parent Task
                            </DropdownItem>
                            <DropdownItem
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleTaskDelete(taskData, stageId);
                              }}
                            >
                              {taskData?.completed
                                ? 'Reopen The Task'
                                : 'Mark As Archived Task'}
                            </DropdownItem>
                            <DropdownItem
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleTaskDelete(taskData, stageId);
                              }}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='taskName-wrapper'>
              <span className='task-name' id={`task_name_${taskData._id}`}>
                {taskData.name}
                <UncontrolledTooltip
                  key={`task_name_${taskData._id}`}
                  className='task-heading-tooltip'
                  placement='top'
                  target={`task_name_${taskData._id}`}
                >
                  {taskData.name}
                </UncontrolledTooltip>
              </span>
            </div>
            <div className='task-priority-status'>
              <div className='mobile-task-priority-wrapper'>
                <div className='task-priority btn-group'>
                  <span className='badgeLoyal-wrapper dropdown-toggle'>
                    <span
                      className='dot'
                      style={{
                        border: `1px solid ${taskData?.priority?.color}`,
                        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0) 50%, ${taskData?.priority?.color} 50%)`,
                      }}
                    ></span>
                    <span
                      className='name'
                      style={{ color: taskData?.priority?.color }}
                    >
                      {taskData?.priority?.label}
                    </span>
                    <span
                      className='bg-wrapper'
                      style={{ backgroundColor: taskData?.priority?.color }}
                    ></span>
                    <span
                      className='border-wrapper'
                      style={{
                        border: `1px solid ${taskData?.priority?.color}`,
                      }}
                    ></span>
                  </span>
                </div>
              </div>
              <div className='mobile-task-status-wrapper'>
                <div className='task-status btn-group'>
                  <span className='badgeLoyal-wrapper dropdown-toggle'>
                    <span
                      className='dot'
                      style={{
                        border: `1px solid ${taskData?.status?.color}`,
                        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0) 50%, ${taskData?.status?.color} 50%)`,
                      }}
                    ></span>
                    <span
                      className='name'
                      style={{ color: taskData?.status?.color }}
                    >
                      {taskData?.status?.label}
                    </span>
                    <span
                      className='bg-wrapper'
                      style={{ backgroundColor: taskData?.status?.color }}
                    ></span>
                    <span
                      className='border-wrapper'
                      style={{ border: `1px solid ${taskData?.status?.color}` }}
                    ></span>
                  </span>
                </div>
              </div>
            </div>
            <div className='contact-date-wrapper'>
              <div className='contact-wrapper'>
                <div className='label'>Contact :</div>
                {taskData?.contact && (
                  <>
                    <div className='contact-details'>
                      <div className='contactImg'>
                        {taskData?.contact?.userProfile ? (
                          <Avatar
                            className='user-profile'
                            img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${taskData?.contact?.userProfile}`}
                            content={`${taskData.title}`}
                            initials
                          />
                        ) : (
                          <Avatar
                            className='user-profile'
                            color={'light-primary'}
                            content={`${taskData.title}`}
                            initials
                          />
                        )}
                      </div>
                      <span className='contactName'>
                        {getFullName(
                          taskData?.contact?.firstName,
                          taskData?.contact?.lastName
                        ) || taskData?.contact?.email}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className='date-wrapper'>
                <div className='label'>Start End Date :</div>
                <div className='value'>
                  <span className='start-date'>
                    <div>
                      <div className='date-picker-error-wp'>
                        <input
                          className='form-control'
                          type='text'
                          defaultValue={moment(taskData?.startDate)?.format(
                            'MMM DD'
                          )}
                        />
                      </div>
                    </div>
                  </span>
                  <span className='end-date'>
                    <div>
                      <div className='date-picker-error-wp'>
                        <input
                          className='form-control'
                          type='text'
                          defaultValue={moment(taskData?.endDate)?.format(
                            'MMM DD'
                          )}
                        />
                      </div>
                    </div>
                  </span>
                </div>
              </div>
            </div>
            <div className='assignee-subtask-wrapper'>
              <div className='assignee-wrapper'>
                <div className='task-assignee-wrapper btn-group'>
                  <span className='task-assignee-toggle dropdown-toggle'>
                    <div className='avatar-group'>
                      {taskData?.assigned?.length ? (
                        <>
                          {taskData?.assigned.map((assign, index) => {
                            return (
                              <div className='avatar pull-up' key={index}>
                                {!['false', false, null, undefined].includes(
                                  assign?.userProfile
                                ) ? (
                                  <>
                                    <img
                                      src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${assign?.userProfile}`}
                                      alt=''
                                    />
                                  </>
                                ) : (assign?.firstName || assign.lastName) &&
                                  (assign?.firstName !== '' ||
                                    assign.lastName !== '') ? (
                                  <>
                                    <Avatar
                                      color={'light-primary'}
                                      content={`${assign?.firstName || ''} ${
                                        assign?.lastName || ''
                                      }`}
                                      initials
                                    />
                                  </>
                                ) : (
                                  <>
                                    <Avatar
                                      img={defaultAvatar}
                                      imgHeight='32'
                                      imgWidth='32'
                                    />
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </>
                      ) : null}
                    </div>
                  </span>
                </div>
              </div>
              {taskData?.sub_tasks?.length > 0 && (
                <span
                  className='subtask-wrapper'
                  onClick={(event) => {
                    event.stopPropagation();
                    if (taskData?.totalSubTasks) {
                      open === taskData?._id
                        ? setOpen(null)
                        : setOpen(taskData?._id);
                    }
                  }}
                >
                  <span className='label'>Subtask :</span>
                  <span className='subtask-count badge bg-secondary rounded-pill'>
                    <span className='inner-wrapper'>
                      {taskData?.totalSubTasks || 0}
                    </span>
                  </span>
                  <span className='arrow__btn'>
                    {open === taskData?._id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </span>
                </span>
              )}
            </div>
            {open === taskData?._id ? (
              <div className='subTask-listing'>
                {taskData?.sub_tasks?.length > 0 &&
                  taskData?.sub_tasks?.map((subTask, index) => {
                    return (
                      <div
                        key={index}
                        className='subTask-row'
                        onClick={(event) => {
                          event.stopPropagation();
                          viewCardDetails(subTask, taskData?._id);
                        }}
                      >
                        <span className='subtaskNumber'>
                          #{subTask?.taskNumber}
                        </span>
                        <span className='subtaskName'>{subTask?.name} </span>
                      </div>
                    );
                  })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskKanbanViewTaskCard;
