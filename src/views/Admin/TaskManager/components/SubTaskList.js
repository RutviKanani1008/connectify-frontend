import { Fragment, useEffect, useState, useMemo } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { Spinner } from 'reactstrap';
import { useSelector } from 'react-redux';
import { Draggable, Droppable } from 'react-beautiful-dnd';

import AddQuickTask from './AddQuickTask';
import SubtaskListItem from './SubtaskListItem';
import TaskListHeader from './TaskListHeader';

import { userData } from '../../../../redux/user';

import { convertHtmlToPlain } from '../../../../utility/Utils';

const SubTaskList = ({
  measureHeight,
  subTasks,
  setSubTasks,
  loading,
  item,
  handleTaskClick,
  changePriorityOrStatusLoading,
  currentStatusOrPriorityChangingIds,
  handleUpdateStatusOrPriority,
  handleUpdateStartDate,
  handleUpdateDueDate,
  setCurrentStatusOrPriorityChangingIds,
  taskOptions,
  handleTaskDelete,
  setOpen,
  handleTaskComplete,
  markAsLoadingArray,
  setCurrentTasks,
  open,
  currentTasks,
  notifyUserForNewTask,
  handleChangeParentModal,
  usersOptions,
  currentFilter,
  setCurrentFilter,
  initialContactData,
  getSubTasks,
  setCurrentTaskPagination,
  currentCategory,
  setCurrentSnoozeTask,
  handleSnoozeOffTasks,
  markNotificationAsRead,
  setShowTaskUpdates,
}) => {
  const user = useSelector(userData);

  const [quickAddSubTaskVisible, setQuickAddSubTaskVisible] = useState(false);

  useEffect(() => {
    setQuickAddSubTaskVisible(false);
  }, [open]);

  useEffect(() => {
    measureHeight();
  }, [quickAddSubTaskVisible]);

  const readSubTask = (itemId) => {
    if (subTasks && _.isArray(subTasks[itemId])) {
      setSubTasks((pre) => ({
        ...pre,
        [itemId]: subTasks[itemId].map((item) => {
          return item.unread ? { ...item, unread: false } : item;
        }),
      }));
    }
  };

  const subTasksList = useMemo(() => {
    return [...(subTasks[item._id] || [])]
      ?.sort((a, b) => a.completed - b?.completed)
      .sort((a, b) => (b?.pinned || 0) - (a?.pinned || 0))
      ?.sort(({ snoozeDetail: a }, { snoozeDetail: b }) => !!a - !!b);
  }, [subTasks, item]);

  return (
    <Fragment key={`${quickAddSubTaskVisible}-${subTasks?.[item._id]?.length}`}>
      {quickAddSubTaskVisible && (
        <AddQuickTask
          usersOptions={usersOptions}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
          initialContactData={initialContactData}
          currentTasks={currentTasks}
          setCurrentTasks={setCurrentTasks}
          subTasks={subTasks}
          setSubTasks={setSubTasks}
          setOpen={setOpen}
          setVisible={setQuickAddSubTaskVisible}
          isSubTask={item}
          taskOptions={taskOptions}
          notifyUserForNewTask={notifyUserForNewTask}
          setCurrentTaskPagination={setCurrentTaskPagination}
          currentCategory={currentCategory}
        />
      )}
      <Droppable
        droppableId={`sub-tasks-${item._id}`}
        type='TASK'
        renderClone={(provided, snapshot, rubric) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={{
                ...provided.draggableProps.style,
              }}
              className={`${classnames('task-manager-row', {
                completed: subTasksList[rubric.source.index].completed,
              })}`}
            >
              <SubtaskListItem
                user={user}
                currentFilter={currentFilter}
                subTaskItem={subTasksList[rubric.source.index]}
                provided={provided}
                index={rubric.source.index}
                markNotificationAsRead={markNotificationAsRead}
                item={item}
                convertHtmlToPlain={convertHtmlToPlain}
                changePriorityOrStatusLoading={changePriorityOrStatusLoading}
                handleUpdateDueDate={handleUpdateDueDate}
                currentStatusOrPriorityChangingIds={
                  currentStatusOrPriorityChangingIds
                }
                handleChangeParentModal={handleChangeParentModal}
                setCurrentStatusOrPriorityChangingIds={
                  setCurrentStatusOrPriorityChangingIds
                }
                handleUpdateStatusOrPriority={handleUpdateStatusOrPriority}
                taskOptions={taskOptions}
                handleUpdateStartDate={handleUpdateStartDate}
                usersOptions={usersOptions}
                setSubTasks={setSubTasks}
                subTasks={subTasks}
                handleSnoozeOffTasks={handleSnoozeOffTasks}
                setCurrentSnoozeTask={setCurrentSnoozeTask}
                setShowTaskUpdates={setShowTaskUpdates}
                markAsLoadingArray={markAsLoadingArray}
                handleTaskComplete={handleTaskComplete}
                handleTaskDelete={handleTaskDelete}
              />
            </div>
          );
        }}
      >
        {(provided) => {
          return (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                width: '102%',
              }}
            >
              <TaskListHeader
                taskLoading={loading}
                setCurrentFilter={setCurrentFilter}
                currentFilter={currentFilter}
                childHeader={true}
                getSubTasks={getSubTasks}
                parentTask={item}
                handleTaskClick={handleTaskClick}
                setQuickAddSubTaskVisible={setQuickAddSubTaskVisible}
              />
              {loading.includes(item._id) &&
                !(subTasks[item._id]?.length > 0) && (
                  <div className='d-flex align-items-center justify-content-center pb-2'>
                    <Spinner />
                  </div>
                )}
              {!!subTasks[item._id]?.length > 0 && (
                <>
                  {subTasksList.map((subTaskItem, index) => {
                    return (
                      <Draggable
                        key={subTaskItem?._id}
                        draggableId={subTaskItem?._id}
                        index={index}
                      >
                        {(provided) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              key={index}
                              style={{
                                userSelect: 'none',
                                width: '99%',
                                ...provided.draggableProps.style,
                              }}
                              className={`${classnames('task-manager-row', {
                                completed: subTaskItem.completed,
                              })}`}
                              onClick={() => {
                                handleTaskClick(subTaskItem, item);
                                readSubTask(item._id);
                              }}
                            >
                              <SubtaskListItem
                                user={user}
                                currentFilter={currentFilter}
                                subTaskItem={subTaskItem}
                                provided={provided}
                                index={index}
                                markNotificationAsRead={markNotificationAsRead}
                                item={item}
                                convertHtmlToPlain={convertHtmlToPlain}
                                changePriorityOrStatusLoading={
                                  changePriorityOrStatusLoading
                                }
                                handleUpdateDueDate={handleUpdateDueDate}
                                currentStatusOrPriorityChangingIds={
                                  currentStatusOrPriorityChangingIds
                                }
                                handleChangeParentModal={
                                  handleChangeParentModal
                                }
                                setCurrentStatusOrPriorityChangingIds={
                                  setCurrentStatusOrPriorityChangingIds
                                }
                                handleUpdateStatusOrPriority={
                                  handleUpdateStatusOrPriority
                                }
                                taskOptions={taskOptions}
                                handleUpdateStartDate={handleUpdateStartDate}
                                usersOptions={usersOptions}
                                setSubTasks={setSubTasks}
                                subTasks={subTasks}
                                handleSnoozeOffTasks={handleSnoozeOffTasks}
                                setCurrentSnoozeTask={setCurrentSnoozeTask}
                                setShowTaskUpdates={setShowTaskUpdates}
                                markAsLoadingArray={markAsLoadingArray}
                                handleTaskComplete={handleTaskComplete}
                                handleTaskDelete={handleTaskDelete}
                              />
                            </div>
                          );
                        }}
                      </Draggable>
                    );
                  })}
                </>
              )}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </Fragment>
  );
};

export default SubTaskList;
