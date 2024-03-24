import React, { memo, useEffect } from 'react';
import classNames from 'classnames';
import { Icon } from '@iconify/react';
import { ChevronDown, ChevronUp, MoreVertical } from 'react-feather';
import {
  AccordionBody,
  AccordionItem,
  Badge,
  Input,
  UncontrolledTooltip,
} from 'reactstrap';

// ** Custom Components **
import RenderTaskAvatar from './RenderTaskAvatar';
import PriorityInnerListDropdown from './PriorityInnerListDropdown';
import StatusInnerListDropdown from './StatusInnerListDropdown';
import TaskListStartDate from './TaskListStartDate';
import TaskListEndDate from './TaskListEndDate';
import AssigneeInnerListDropdown from './AssigneeInnerListDropdown';
import { PinTask } from './tasksMiniComponents';
import TaskActionMenu from './TaskActionMenu';

// ** SVG **
import { ReactComponent as SnoozeBell } from '../../../../assets/svgs/snooze-bell.svg';
import { ReactComponent as DisableBell } from '../../../../assets/svgs/disable-bell.svg';
import SubTaskList from './SubTaskList';
import { getFullName } from '../../../../utility/Utils';
import useTaskManagerTooltip from '../hooks/useTaskManagerTooltip';

const TasksListItem = ({
  provided,
  measure,
  item,
  index,
  open,
  currentFilter,
  isMobile,
  handleTaskClick,
  user,
  markNotificationAsRead,
  initialContactData,
  changePriorityOrStatusLoading,
  currentStatusOrPriorityChangingIds,
  handleUpdateStatusOrPriority,
  setCurrentStatusOrPriorityChangingIds,
  taskOptions,
  handleUpdateStartDate,
  handleUpdateDueDate,
  usersOptions,
  currentTasks,
  setCurrentTasks,
  handleSnoozeOffTasks,
  setCurrentSnoozeTask,
  setShowTaskUpdates,
  markAsLoadingArray,
  handleTaskComplete,
  handleRestoreTask,
  handleTaskDelete,
  handleChangeParentModal,
  toggle,
  getSubTasks,
  setSubTasks,
  setCurrentFilter,
  initialUserData,
  setOpen,
  subTaskLoading,
  subTasks,
  notifyUserForNewTask,
  setCurrentTaskPagination,
  currentCategory,
}) => {
  const isOpenItem = open.includes(`${index}`);
  const isItemLoading = subTaskLoading.includes(item?._id);

  // ** Custom Hooks **
  const { updateToolTip } = useTaskManagerTooltip({
    item,
  });

  useEffect(() => {
    measureHeight();
  }, [isOpenItem, isItemLoading, subTasks[item?._id]]);

  const measureHeight = () => {
    measure && measure();
  };

  return (
    <>
      <AccordionItem
        className={`task-manager-row ${item.pinned ? 'pin-row' : ''}`}
        key={`${index}_${item?.pinned}`}
      >
        <div
          className={`${classNames('inner-wrapper', {
            completed: item.completed,
          })}`}
        >
          <div
            className='task-manager-title'
            onClick={() => {
              if (!isMobile) handleTaskClick(item);
            }}
          >
            <div className='left'>
              <div
                className={`move-icon-cell ${
                  user.role === 'admin' &&
                  !currentFilter.trash &&
                  !currentFilter.completed
                    ? 'active'
                    : ''
                } `}
              >
                <div
                  {...provided.dragHandleProps}
                  className='move-icon-wrapper drag-icon'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {open.includes(`${index}`) ? (
                    <div
                      className='down-up-btn up-btn'
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(`${index}`);
                      }}
                    >
                      <ChevronUp />
                    </div>
                  ) : (
                    <>
                      <MoreVertical
                        className='drag-icon'
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MoreVertical
                        className='drag-icon'
                        onClick={(e) => e.stopPropagation()}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className='task-number-cell'>
                <span className='task-number' id={`t${item.taskNumber}`}>
                  {item?.taskNumber ? `#${item.taskNumber}` : ''}
                </span>
                <UncontrolledTooltip
                  placement='top'
                  target={`t${item.taskNumber}`}
                >
                  {item?.taskNumber ? `#${item.taskNumber}` : ''}
                </UncontrolledTooltip>
              </div>
              <div className='task-name-cell'>
                <div className='task-name-wrapper'>
                  <span
                    className='task-name'
                    id={`task_name_${index}_${item._id}`}
                  >
                    <span className='inner-wrapper'>{item.name}</span>
                    <UncontrolledTooltip
                      key={`task_name_${index}_${item._id}`}
                      className='task-heading-tooltip'
                      placement='top'
                      target={`task_name_${index}_${item._id}`}
                    >
                      {item.name}
                    </UncontrolledTooltip>
                  </span>
                  {item.isUnreadUpdates && (
                    <div className='me-1'>
                      <span
                        id={`update_badge_${item._id}`}
                        className='badge-dot-warning'
                        onMouseOutCapture={() => {
                          markNotificationAsRead(item);
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
                        target={`update_badge_${item._id}`}
                      >
                        {updateToolTip}
                      </UncontrolledTooltip>
                    </div>
                  )}
                  {(currentFilter.trash === false ||
                    currentFilter.trash === null) &&
                    (currentFilter.completed === false ||
                      currentFilter.completed === null) &&
                    (currentFilter.snoozedTask === false ||
                      currentFilter.snoozedTask === null) && (
                      <>
                        <Badge
                          style={{
                            visibility:
                              item?.sub_tasks > 0 ? 'visible' : 'hidden',
                          }}
                          id={`subtask_${index}_${item._id}`}
                          className='subtask-count'
                          pill
                        >
                          <span className='inner-wrapper'>
                            {item?.sub_tasks || 0}
                          </span>
                        </Badge>
                        <UncontrolledTooltip
                          placement='top'
                          target={`subtask_${index}_${item._id}`}
                        >
                          {item?.sub_tasks} subtasks
                        </UncontrolledTooltip>
                      </>
                    )}
                </div>
              </div>
              {item.unread && (
                <div>
                  <Badge
                    id={`newtask_${index}_${item._id}`}
                    className='text-capitalize me-1'
                    color='light-danger'
                    pill
                  >
                    New
                  </Badge>
                  <UncontrolledTooltip
                    placement='top'
                    target={`newtask_${index}_${item._id}`}
                  >
                    New Task
                  </UncontrolledTooltip>
                </div>
              )}
            </div>
            <div className='right'>
              {!initialContactData?._id && (
                <div className='contact-cell'>
                  <div className='contact-wrapper'>
                    <RenderTaskAvatar
                      obj={item}
                      userKey={'contact'}
                      additialTooltipText={item?.contact?.company_name}
                    />
                  </div>
                </div>
              )}
              <div className='task-priority-cell'>
                <PriorityInnerListDropdown
                  item={item}
                  isMobile={isMobile}
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
                  isMobile={isMobile}
                  item={item}
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
                <TaskListStartDate
                  item={item}
                  handleUpdateStartDate={handleUpdateStartDate}
                />
              </div>
              <div className='task-date-cell'>
                <TaskListEndDate
                  item={item}
                  handleUpdateDueDate={handleUpdateDueDate}
                />
              </div>
              {currentFilter.completed ? (
                <div className='task-date-cell'>
                  <div className='task-date'>
                    {item?.completed && item?.completedAt ? (
                      <>
                        {new Date(item.completedAt).toLocaleString('default', {
                          month: 'short',
                        })}{' '}
                        {new Date(item.completedAt)
                          .getDate()
                          .toString()
                          .padStart(2, '0')}
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className='task-assignee-cell'>
                <AssigneeInnerListDropdown
                  key={item._id}
                  item={item}
                  options={usersOptions.data}
                  currentTasks={currentTasks}
                  setCurrentTasks={setCurrentTasks}
                />
              </div>
              {!currentFilter.trash && !currentFilter.completed && (
                <div
                  className={`task-snooze-cell ${
                    item?.snoozeDetail?._id ? 'not-icon' : ''
                  }`}
                >
                  <div
                    className='task-snooze-btn'
                    id={`snooze_${index}_${item._id}`}
                  >
                    {item?.snoozeDetail?._id ? (
                      <DisableBell
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item?.snoozeDetail?._id) {
                            handleSnoozeOffTasks(item);
                          }
                        }}
                      />
                    ) : (
                      <SnoozeBell
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item?.snoozeDetail?._id) {
                            handleSnoozeOffTasks(item);
                          } else {
                            setCurrentSnoozeTask({
                              taskDetail: item,
                              isSubTask: false,
                            });
                          }
                        }}
                      />
                    )}
                    <UncontrolledTooltip
                      className='task-heading-tooltip'
                      placement='top'
                      target={`snooze_${index}_${item._id}`}
                    >
                      {item?.snoozeDetail?._id
                        ? 'Unsnooze Task'
                        : 'Snooze Task'}
                    </UncontrolledTooltip>
                  </div>
                </div>
              )}
              <div className='task-update-cell'>
                <div
                  className='task-update-btn'
                  id={`update_${index}_${item._id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTaskUpdates({
                      isOpen: true,
                      taskDetail: item,
                    });
                  }}
                >
                  <Icon icon='ci:chat-add' className={`cursor-pointer`} />
                  <UncontrolledTooltip
                    className='task-heading-tooltip'
                    placement='top'
                    target={`update_${index}_${item._id}`}
                  >
                    Add Update
                  </UncontrolledTooltip>
                </div>
              </div>
              <div className='task-pintask-cell'>
                <PinTask
                  key={item.pinned}
                  taskId={item._id}
                  pinned={item.pinned}
                  setCurrentTasks={setCurrentTasks}
                />
              </div>
              <>
                {!currentFilter.trash && (
                  <>
                    <div className='task-checkbox-cell'>
                      <Input
                        key={`${item?.completed}_${item._id}`}
                        id={`complete_${index}_${item._id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        checked={item?.completed}
                        className={`${
                          markAsLoadingArray.includes(item?._id)
                            ? 'opacity-50'
                            : ''
                        } task-checkbox`}
                        type='checkbox'
                        onChange={(e) => {
                          !markAsLoadingArray.includes(item?._id) &&
                            handleTaskComplete(item, e.target.checked);
                        }}
                      />
                      <UncontrolledTooltip
                        data-trigger='hover'
                        autohide
                        key={`complete_${index}_${item._id}`}
                        placement='top'
                        target={`complete_${index}_${item._id}`}
                      >
                        {item?.completed
                          ? 'Reopen The Task'
                          : 'Mark As Archived Task'}
                      </UncontrolledTooltip>
                    </div>
                  </>
                )}
                <div className='task-action-cell'>
                  <TaskActionMenu
                    item={item}
                    handleRestoreTask={handleRestoreTask}
                    handleTaskDelete={handleTaskDelete}
                    handleChangeParentModal={handleChangeParentModal}
                    handleTaskEdit={handleTaskClick}
                  />
                </div>
              </>
              {!currentFilter.trash &&
                !currentFilter.completed &&
                !currentFilter.snoozedTask && (
                  <div className='down-up-btn-cell'>
                    {open.includes(`${index}`) ? (
                      <div
                        className='down-up-btn up-btn'
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(`${index}`);
                        }}
                      >
                        <ChevronUp />
                      </div>
                    ) : (
                      <div
                        className='down-up-btn down-btn'
                        onClick={(e) => {
                          item?.sub_tasks
                            ? !open.includes(`${index}`) &&
                              getSubTasks(item._id)
                            : setSubTasks((pre) => ({
                                ...pre,
                                [item._id]: [],
                              }));
                          e.stopPropagation();
                          toggle(`${index}`);
                        }}
                      >
                        <ChevronDown />
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
        {open.includes(`${index}`) && (
          <AccordionBody
            className='subtask-manager-row'
            accordionId={`${index}`}
          >
            <SubTaskList
              measureHeight={measureHeight}
              usersOptions={usersOptions}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
              initialContactData={initialContactData}
              initialUserData={initialUserData}
              open={open}
              currentTasks={currentTasks}
              setCurrentTasks={setCurrentTasks}
              setSubTasks={setSubTasks}
              setOpen={setOpen}
              handleTaskComplete={handleTaskComplete}
              markAsLoadingArray={markAsLoadingArray}
              loading={subTaskLoading}
              subTasks={subTasks}
              item={item}
              handleTaskClick={handleTaskClick}
              setCurrentSnoozeTask={setCurrentSnoozeTask}
              changePriorityOrStatusLoading={changePriorityOrStatusLoading}
              currentStatusOrPriorityChangingIds={
                currentStatusOrPriorityChangingIds
              }
              handleUpdateStatusOrPriority={handleUpdateStatusOrPriority}
              handleUpdateStartDate={handleUpdateStartDate}
              handleUpdateDueDate={handleUpdateDueDate}
              setCurrentStatusOrPriorityChangingIds={
                setCurrentStatusOrPriorityChangingIds
              }
              taskOptions={taskOptions}
              handleTaskDelete={handleTaskDelete}
              notifyUserForNewTask={notifyUserForNewTask}
              handleChangeParentModal={handleChangeParentModal}
              getSubTasks={getSubTasks}
              setCurrentTaskPagination={setCurrentTaskPagination}
              currentCategory={currentCategory}
              handleSnoozeOffTasks={handleSnoozeOffTasks}
              markNotificationAsRead={markNotificationAsRead}
              setShowTaskUpdates={setShowTaskUpdates}
            />
          </AccordionBody>
        )}
      </AccordionItem>

      {isMobile && (
        <div className='mobile-task-manager-row'>
          <div className='task-manager-row  accordion-item'>
            <div
              className={`${classNames('inner-wrapper', {
                completed: item.completed,
              })}`}
            >
              <div className='task-manager-title'>
                <div className='top-header'>
                  <div className='left-wrapper'>
                    <div
                      className={`move-icon-cell ${
                        user.role === 'admin' &&
                        !currentFilter.trash &&
                        !currentFilter.completed
                          ? 'active'
                          : ''
                      } `}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className='move-icon-wrapper drag-icon'
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
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
                    <span className='task-number' id={`t${item.taskNumber}`}>
                      {item?.taskNumber ? `#${item.taskNumber}` : ''}
                    </span>
                  </div>
                  <div className='right-action'>
                    {!currentFilter.trash && (
                      <div className='task-checkbox-wrapper'>
                        <div className='switch-checkbox'>
                          <Input
                            key={`${item?.completed}_${item._id}`}
                            id={`complete_${index}_${item._id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            checked={item?.completed}
                            className={`${
                              markAsLoadingArray.includes(item?._id)
                                ? 'opacity-50'
                                : ''
                            } task-checkbox`}
                            type='checkbox'
                            onChange={(e) => {
                              !markAsLoadingArray.includes(item?._id) &&
                                handleTaskComplete(item, e.target.checked);
                            }}
                          />
                          <span className='switch-design'></span>
                          <UncontrolledTooltip
                            data-trigger='hover'
                            autohide
                            key={`complete_${index}_${item._id}`}
                            placement='top'
                            target={`complete_${index}_${item._id}`}
                          >
                            {item?.completed
                              ? 'Reopen The Task'
                              : 'Mark As Archived Task'}
                          </UncontrolledTooltip>
                        </div>
                      </div>
                    )}
                    <div className='action-btn-wrapper'>
                      {!currentFilter.trash && !currentFilter.completed && (
                        <div
                          className={`action-btn task-snooze-btn ${
                            item?.snoozeDetail?._id ? 'not-icon' : ''
                          }`}
                        >
                          <div
                            className='inner-wrapper'
                            id={`snooze_${index}_${item._id}`}
                          >
                            {item?.snoozeDetail?._id ? (
                              <DisableBell
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item?.snoozeDetail?._id) {
                                    handleSnoozeOffTasks(item);
                                  }
                                }}
                              />
                            ) : (
                              <SnoozeBell
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item?.snoozeDetail?._id) {
                                    handleSnoozeOffTasks(item);
                                  } else {
                                    setCurrentSnoozeTask({
                                      taskDetail: item,
                                      isSubTask: false,
                                    });
                                  }
                                }}
                              />
                            )}
                            <UncontrolledTooltip
                              className='task-heading-tooltip'
                              placement='top'
                              target={`snooze_${index}_${item._id}`}
                            >
                              {item?.snoozeDetail?._id
                                ? 'Unsnooze Task'
                                : 'Snooze Task'}
                            </UncontrolledTooltip>
                          </div>
                        </div>
                      )}
                      <div className='action-btn task-update-btn'>
                        <div
                          className='inner-wrapper'
                          id={`update_${index}_${item._id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTaskUpdates({
                              isOpen: true,
                              taskDetail: item,
                            });
                          }}
                        >
                          <Icon
                            icon='ci:chat-add'
                            className={`cursor-pointer`}
                          />
                          <UncontrolledTooltip
                            className='task-heading-tooltip'
                            placement='top'
                            target={`update_${index}_${item._id}`}
                          >
                            Add Update
                          </UncontrolledTooltip>
                        </div>
                      </div>
                      <div className='action-btn task-pintask-btn'>
                        <PinTask
                          key={item.pinned}
                          taskId={item._id}
                          pinned={item.pinned}
                          setCurrentTasks={setCurrentTasks}
                        />
                      </div>
                      <div className='action-btn task-toggle-btn'>
                        <TaskActionMenu
                          item={item}
                          handleRestoreTask={handleRestoreTask}
                          handleTaskDelete={handleTaskDelete}
                          handleChangeParentModal={handleChangeParentModal}
                          handleTaskEdit={handleTaskClick}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='taskName-wrapper'>
                  <span
                    className='task-name'
                    id={`task_name_${index}_${item._id}`}
                  >
                    {item.name}
                    <UncontrolledTooltip
                      key={`task_name_${index}_${item._id}`}
                      className='task-heading-tooltip'
                      placement='top'
                      target={`task_name_${index}_${item._id}`}
                    >
                      {item.name}
                    </UncontrolledTooltip>
                  </span>
                </div>
                <div className='task-priority-status'>
                  <PriorityInnerListDropdown
                    item={item}
                    isMobile={isMobile}
                    changePriorityOrStatusLoading={
                      changePriorityOrStatusLoading
                    }
                    currentStatusOrPriorityChangingIds={
                      currentStatusOrPriorityChangingIds
                    }
                    handleUpdateStatusOrPriority={handleUpdateStatusOrPriority}
                    setCurrentStatusOrPriorityChangingIds={
                      setCurrentStatusOrPriorityChangingIds
                    }
                    taskOptions={taskOptions}
                  />
                  <StatusInnerListDropdown
                    isMobile={isMobile}
                    item={item}
                    changePriorityOrStatusLoading={
                      changePriorityOrStatusLoading
                    }
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
                <div className='contact-date-wrapper'>
                  <div className='contact-wrapper'>
                    <div className='label'>Contact :</div>
                    <div className='contact-details'>
                      {!initialContactData?._id && !initialUserData?._id ? (
                        <>
                          <div className='contactImg'>
                            <RenderTaskAvatar
                              obj={item}
                              userKey={'contact'}
                              additialTooltipText={item?.contact?.company_name}
                            />
                          </div>
                          <span className='contactName'>
                            {getFullName(
                              item?.contact?.firstName,
                              item?.contact?.lastName
                            ) || item?.contact?.email}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className='date-wrapper'>
                    <div className='label'>Start End Date :</div>
                    <div className='value'>
                      <span className='start-date'>
                        {item.startDate ? (
                          <>
                            {new Date(item.startDate).toLocaleString(
                              'default',
                              {
                                month: 'short',
                              }
                            )}{' '}
                            {new Date(item.startDate)
                              .getDate()
                              .toString()
                              .padStart(2, '0')}
                          </>
                        ) : (
                          <></>
                        )}
                      </span>
                      <span className='end-date'>
                        {item.endDate ? (
                          <>
                            {new Date(item.endDate).toLocaleString('default', {
                              month: 'short',
                            })}{' '}
                            {new Date(item.endDate)
                              .getDate()
                              .toString()
                              .padStart(2, '0')}
                          </>
                        ) : (
                          <></>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {currentFilter.completed ? (
                  <div className='contact-date-wrapper'>
                    <div className='date-wrapper'>
                      <div className='label'>Archived Date :</div>
                      <div className='value'>
                        <span className='start-date'>
                          {item?.completed && item.completedAt ? (
                            <>
                              {new Date(item.completedAt).toLocaleString(
                                'default',
                                {
                                  month: 'short',
                                }
                              )}{' '}
                              {new Date(item.completedAt)
                                .getDate()
                                .toString()
                                .padStart(2, '0')}
                            </>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className='assignee-subtask-wrapper'>
                  <div className='assignee-wrapper'>
                    <AssigneeInnerListDropdown
                      key={item._id}
                      item={item}
                      options={usersOptions.data}
                      currentTasks={currentTasks}
                      setCurrentTasks={setCurrentTasks}
                    />
                  </div>
                  <div className='subtask-wrapper'>
                    <span className='label'>Subtask :</span>
                    {(currentFilter.trash === false ||
                      currentFilter.trash === null) &&
                      (currentFilter.completed === false ||
                        currentFilter.completed === null) &&
                      (currentFilter.snoozedTask === false ||
                        currentFilter.snoozedTask === null) && (
                        <>
                          <Badge
                            style={{
                              visibility:
                                item?.sub_tasks === 0 ? 'hidden' : 'visible',
                            }}
                            id={`subtask_${index}_${item._id}`}
                            className='subtask-count'
                            pill
                            onClick={() => handleTaskClick(item)}
                          >
                            <span className='inner-wrapper'>
                              {item?.sub_tasks || 0}
                            </span>
                          </Badge>
                          <UncontrolledTooltip
                            placement='top'
                            target={`subtask_${index}_${item._id}`}
                          >
                            {item?.sub_tasks} subtasks
                          </UncontrolledTooltip>
                        </>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(TasksListItem);
