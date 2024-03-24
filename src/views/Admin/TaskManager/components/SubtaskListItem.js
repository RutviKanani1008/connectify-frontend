import React, { memo } from 'react';
import { MoreVertical } from 'react-feather';
import { Badge, Input, UncontrolledTooltip } from 'reactstrap';
import moment from 'moment';

import RenderTaskAvatar from './RenderTaskAvatar';
import PriorityInnerListDropdown from './PriorityInnerListDropdown';
import StatusInnerListDropdown from './StatusInnerListDropdown';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import AssigneeInnerListDropdown from './AssigneeInnerListDropdown';
import { ReactComponent as SnoozeBell } from '../../../../assets/svgs/snooze-bell.svg';
import { ReactComponent as DisableBell } from '../../../../assets/svgs/disable-bell.svg';
import { Icon } from '@iconify/react';
import { SubPinTask } from './tasksMiniComponents';
import TaskActionMenu from './TaskActionMenu';

const SubtaskListItem = ({
  user,
  currentFilter,
  subTaskItem,
  provided,
  index,
  markNotificationAsRead,
  item,
  convertHtmlToPlain,
  changePriorityOrStatusLoading,
  handleUpdateDueDate,
  currentStatusOrPriorityChangingIds,
  handleChangeParentModal,
  setCurrentStatusOrPriorityChangingIds,
  handleUpdateStatusOrPriority,
  taskOptions,
  handleUpdateStartDate,
  usersOptions,
  setSubTasks,
  subTasks,
  handleSnoozeOffTasks,
  setCurrentSnoozeTask,
  setShowTaskUpdates,
  markAsLoadingArray,
  handleTaskComplete,
  handleTaskDelete,
}) => {
  return (
    <div className='inner-wrapper'>
      <div className='task-manager-title'>
        <div className='left'>
          {user.role === 'admin' && (
            <div
              className={`move-icon-cell ${
                user.role === 'admin' &&
                !currentFilter.trash &&
                !currentFilter.completed
                  ? 'active'
                  : ''
              } `}
            >
              <div {...provided.dragHandleProps} className='move-icon-wrapper'>
                <MoreVertical
                  className='drag-icon'
                  onClick={(e) => e.stopPropagation()}
                />
                <MoreVertical
                  className='drag-icon'
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          <div className='task-number-cell'>
            <span id={`sub${subTaskItem.taskNumber}`} className='task-number'>
              {subTaskItem?.taskNumber ? `#${subTaskItem.taskNumber}` : ''}
            </span>
            <UncontrolledTooltip
              placement='top'
              target={`sub${subTaskItem.taskNumber}`}
            >
              {`#${subTaskItem.taskNumber}`}
            </UncontrolledTooltip>
          </div>
          <div className='task-name-cell'>
            <div className='task-name-wrapper'>
              <div
                className='task-name'
                id={`sub_task_name_${index}_${subTaskItem._id}`}
              >
                <span className='inner-wrapper'>{subTaskItem.name}</span>
              </div>
              <UncontrolledTooltip
                className='task-heading-tooltip'
                placement='top'
                target={`sub_task_name_${index}_${subTaskItem._id}`}
              >
                {subTaskItem.name}
              </UncontrolledTooltip>
              {subTaskItem?.isUnreadUpdates && (
                <div className='me-1'>
                  <span
                    id={`update_badge_${subTaskItem._id}`}
                    className='badge-dot-warning'
                    onMouseOutCapture={() => {
                      markNotificationAsRead(subTaskItem);
                    }}
                  ></span>
                  <UncontrolledTooltip
                    className='task-heading-tooltip'
                    style={{
                      width: '100rem',
                      overflow: 'hidden',
                      maxHeight: '50px',
                    }}
                    placement='top'
                    target={`update_badge_${subTaskItem._id}`}
                  >
                    <>
                      {new Date(item?.latestUpdates?.createdAt).toLocaleString(
                        'default',
                        {
                          month: 'short',
                        }
                      )}{' '}
                      {new Date(item?.latestUpdates?.createdAt)
                        .getDate()
                        .toString()
                        .padStart(2, '0')}
                      {' - '}
                      {item?.latestUpdates?.createdBy.firstName}{' '}
                      {item?.latestUpdates?.createdBy.lastName}
                      <br />
                      {item?.latestUpdates?.content &&
                        convertHtmlToPlain(item?.latestUpdates?.content)}
                    </>
                  </UncontrolledTooltip>
                </div>
              )}
              {subTaskItem.unread && (
                <>
                  <Badge
                    id={`subtask2_${index}`}
                    className='subtask-count'
                    color='light-danger'
                    pill
                  >
                    New
                  </Badge>
                  <UncontrolledTooltip
                    placement='top'
                    target={`subtask2_${index}`}
                  >
                    New Task
                  </UncontrolledTooltip>
                </>
              )}
            </div>
          </div>
        </div>
        <div className='right'>
          <div className='contact-cell'>
            <div className='contact-wrapper'>
              <RenderTaskAvatar
                obj={subTaskItem}
                userKey={'contact'}
                additialTooltipText={subTaskItem?.contact?.company_name}
              />
            </div>
          </div>
          <div className='task-priority-cell'>
            <PriorityInnerListDropdown
              item={subTaskItem}
              changePriorityOrStatusLoading={changePriorityOrStatusLoading}
              currentStatusOrPriorityChangingIds={
                currentStatusOrPriorityChangingIds
              }
              handleUpdateStatusOrPriority={handleUpdateStatusOrPriority}
              setCurrentStatusOrPriorityChangingIds={
                setCurrentStatusOrPriorityChangingIds
              }
              taskOptions={taskOptions}
            />
          </div>
          <div className='task-status-cell'>
            <StatusInnerListDropdown
              item={subTaskItem}
              changePriorityOrStatusLoading={changePriorityOrStatusLoading}
              currentStatusOrPriorityChangingIds={
                currentStatusOrPriorityChangingIds
              }
              handleUpdateStatusOrPriority={handleUpdateStatusOrPriority}
              setCurrentStatusOrPriorityChangingIds={
                setCurrentStatusOrPriorityChangingIds
              }
              taskOptions={taskOptions}
            />
          </div>
          <div className='task-date-cell'>
            <div className='task-date'>
              {subTaskItem.startDate ? (
                subTaskItem?.completed || subTaskItem?.trash ? (
                  <>
                    {new Date(subTaskItem.startDate).toLocaleString('default', {
                      month: 'short',
                    })}{' '}
                    {new Date(subTaskItem.startDate)
                      .getDate()
                      .toString()
                      .padStart(2, '0')}
                  </>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <CustomDatePicker
                      renderInBody
                      options={{
                        defaultDate: moment(subTaskItem.startDate).format(
                          'MM-DD-YYYY'
                        ),
                        dateFormat: 'm-d-Y',
                        enable: [
                          function (date) {
                            const today = new Date(
                              new Date().setHours(0, 0, 0, 0)
                            );
                            return date >= today;
                          },
                          moment(subTaskItem.startDate).format('MM-DD-YYYY'),
                        ],
                        altInput: true,
                        altFormat: 'M d',
                      }}
                      value={moment(subTaskItem.startDate).format('MM-DD-YYYY')}
                      className='form-control invoice-edit-input due-date-picker'
                      name='startDate'
                      enableTime={false}
                      onChange={(startDate) => {
                        handleUpdateStartDate(subTaskItem, startDate[0]);
                      }}
                    />
                  </div>
                )
              ) : null}
            </div>
          </div>
          <div className='task-date-cell'>
            <div className='task-date'>
              {subTaskItem.endDate ? (
                subTaskItem?.completed || subTaskItem?.trash ? (
                  <>
                    {new Date(subTaskItem.endDate).toLocaleString('default', {
                      month: 'short',
                    })}{' '}
                    {new Date(subTaskItem.endDate)
                      .getDate()
                      .toString()
                      .padStart(2, '0')}
                  </>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <CustomDatePicker
                      renderInBody
                      options={{
                        defaultDate: moment(subTaskItem.endDate).format(
                          'MM-DD-YYYY'
                        ),
                        dateFormat: 'm-d-Y',
                        enable: [
                          function (date) {
                            const today = new Date(
                              new Date().setHours(0, 0, 0, 0)
                            );
                            return date >= today;
                          },
                          moment(subTaskItem.endDate).format('MM-DD-YYYY'),
                        ],
                        altInput: true,
                        altFormat: 'M d',
                      }}
                      value={moment(subTaskItem.endDate).format('MM-DD-YYYY')}
                      className='form-control invoice-edit-input due-date-picker'
                      name='dueDate'
                      enableTime={false}
                      onChange={(dueDate) => {
                        handleUpdateDueDate(subTaskItem, dueDate[0]);
                      }}
                    />
                  </div>
                )
              ) : null}
            </div>
          </div>
          <div className='task-assignee-cell'>
            <AssigneeInnerListDropdown
              item={subTaskItem}
              options={usersOptions.data}
              setSubTasks={setSubTasks}
              subTasks={subTasks}
            />
          </div>
          {!currentFilter.trash && !currentFilter.completed && (
            <div className='task-snooze-cell'>
              <div
                className='task-snooze-btn'
                id={`snooze_${index}_${subTaskItem?._id}`}
              >
                {subTaskItem?.snoozeDetail?._id ? (
                  <>
                    <DisableBell
                      onClick={(e) => {
                        e.stopPropagation();
                        if (subTaskItem?.snoozeDetail?._id) {
                          handleSnoozeOffTasks(subTaskItem, item?._id);
                        } else {
                          setCurrentSnoozeTask({
                            taskDetail: subTaskItem,
                            isSubTask: item?._id,
                          });
                        }
                      }}
                    />
                  </>
                ) : (
                  <SnoozeBell
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item?.snoozeDetail?._id) {
                        handleSnoozeOffTasks(item);
                      } else {
                        setCurrentSnoozeTask({
                          taskDetail: subTaskItem,
                          isSubTask: item?._id,
                        });
                      }
                    }}
                  />
                )}
                <UncontrolledTooltip
                  className='task-heading-tooltip'
                  placement='top'
                  target={`snooze_${index}_${subTaskItem?._id}`}
                >
                  {item?.snoozeUntil ? 'Off Snooze Task' : 'Snooze Task'}
                </UncontrolledTooltip>
              </div>
            </div>
          )}
          <div className='task-update-cell'>
            <div
              className='task-update-btn'
              id={`update_${index}_${subTaskItem?._id}`}
            >
              <Icon
                icon='ci:chat-add'
                className={`cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTaskUpdates({
                    isOpen: true,
                    taskDetail: subTaskItem,
                  });
                }}
              />
              <UncontrolledTooltip
                className='task-heading-tooltip'
                placement='top'
                target={`update_${index}_${subTaskItem?._id}`}
              >
                Update Task
              </UncontrolledTooltip>
            </div>
          </div>
          <div className='task-pintask-cell'>
            <SubPinTask
              key={subTaskItem.pinned}
              taskId={subTaskItem._id}
              pinned={subTaskItem.pinned}
              setSubTasks={setSubTasks}
              parentId={item._id}
            />
          </div>
          <div className='task-checkbox-cell'>
            <div id={`complete_${subTaskItem?._id}`}>
              <Input
                onClick={(e) => {
                  e.stopPropagation();
                }}
                checked={!!subTaskItem?.completed}
                className={`${
                  markAsLoadingArray.includes(subTaskItem?._id)
                    ? 'opacity-50'
                    : ''
                }`}
                type='checkbox'
                onChange={(e) => {
                  !markAsLoadingArray.includes(subTaskItem?._id) &&
                    handleTaskComplete(subTaskItem, e.target.checked, true);
                }}
              />
            </div>
            {subTaskItem?._id && (
              <UncontrolledTooltip
                data-trigger='hover'
                autohide
                placement='top'
                target={`complete_${subTaskItem?._id}`}
              >
                {subTaskItem?.completed
                  ? 'Reopen The Task'
                  : 'Mark As Archived Task'}
              </UncontrolledTooltip>
            )}
          </div>
          <div className='task-action-cell'>
            <TaskActionMenu
              item={subTaskItem}
              handleTaskDelete={(subTaskItem) =>
                handleTaskDelete(subTaskItem, item)
              }
              handleChangeParentModal={(subTaskItem) =>
                handleChangeParentModal(subTaskItem, item)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SubtaskListItem);
