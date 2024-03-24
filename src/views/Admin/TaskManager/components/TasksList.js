import React from 'react';
import classnames from 'classnames';
import { MoreVertical } from 'react-feather';
import { AccordionBody, AccordionItem, Badge } from 'reactstrap';

const TasksList = ({
  currentTasks,
  currentFilter,
  currentCategoryId,
  isMobile,
  handleTaskClick,
  user,
  markNotificationAsRead,
}) => {
  return [...currentTasks]
    .sort((a, b) => (b?.pinned || 0) - (a?.pinned || 0))
    ?.sort(({ snoozeDetail: a }, { snoozeDetail: b }) => !!a - !!b)
    .map((item, index) => {
      return (
        <AccordionItem
          className={`task-manager-row ${item.pinned ? 'pin-row' : ''}`}
          /** don't change data-task-id, data-category-id as it is being used to determine item, on adding item to another category */
          data-task-id={item._id}
          data-category-id={currentCategoryId}
          key={`${index}_${item?.pinned}`}
        >
          <div
            className={`${classnames('inner-wrapper', {
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
                    className='move-icon-wrapper drag-icon'
                    onClick={(e) => e.stopPropagation()}
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
                <div className='task-number-cell'>
                  <span className='task-number' id={`t${item.taskNumber}`}>
                    {item?.taskNumber ? `#${item.taskNumber}` : ''}
                  </span>
                  {/* <UncontrolledTooltip
                    placement='top'
                    target={`t${item.taskNumber}`}
                  >
                    {item?.taskNumber ? `#${item.taskNumber}` : ''}
                  </UncontrolledTooltip> */}
                </div>
                <div className='task-name-cell'>
                  <div className='task-name-wrapper'>
                    <span
                      className='task-name'
                      id={`task_name_${index}_${item._id}`}
                    >
                      <span className='inner-wrapper'>{item.name}</span>
                      {/* <UncontrolledTooltip
                        key={`task_name_${index}_${item._id}`}
                        className='task-heading-tooltip'
                        placement='top'
                        target={`task_name_${index}_${item._id}`}
                      >
                        {item.name}
                      </UncontrolledTooltip> */}
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
                        {/* <UncontrolledTooltip
                          className='task-heading-tooltip'
                          style={{
                            width: '100rem',
                            overflow: 'hidden',
                            maxHeight: '50px',
                          }}
                          placement='top'
                          target={`update_badge_${item._id}`}
                        >
                          <>
                            {new Date(
                              item?.latestUpdates?.createdAt
                            ).toLocaleString('default', {
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
                            {item?.latestUpdates?.content &&
                              convertHtmlToPlain(
                                item?.latestUpdates?.content
                              )}
                          </>
                        </UncontrolledTooltip> */}
                      </div>
                    )}
                    {(currentFilter.trash === false ||
                      currentFilter.trash === null) &&
                      (currentFilter.completed === false ||
                        currentFilter.completed === null) &&
                      (currentFilter.snoozedTask === false ||
                        currentFilter.snoozedTask === null) && (
                        <>
                          <>
                            <Badge
                              style={{
                                visibility:
                                  item?.sub_tasks === 0 ? 'hidden' : 'visible',
                              }}
                              id={`subtask_${index}_${item._id}`}
                              className='subtask-count'
                              pill
                            >
                              <span className='inner-wrapper'>
                                {item?.sub_tasks || 0}
                              </span>
                            </Badge>
                            {/* <UncontrolledTooltip
                              placement='top'
                              target={`subtask_${index}_${item._id}`}
                            >
                              {item?.sub_tasks} subtasks
                            </UncontrolledTooltip> */}
                          </>
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
                    {/* <UncontrolledTooltip
                      placement='top'
                      target={`newtask_${index}_${item._id}`}
                    >
                      New Task
                    </UncontrolledTooltip> */}
                  </div>
                )}
              </div>
            </div>
          </div>
          <AccordionBody
            className='subtask-manager-row'
            accordionId={`${index}`}
          >
            {/* {open.includes(`${index}`) && (
              <SubTaskList
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
            )} */}
          </AccordionBody>
        </AccordionItem>
      );
    });
};

export default TasksList;
