// ** Third Party Components
import _ from 'lodash';
import {
  List,
  InfiniteLoader,
  AutoSizer,
  CellMeasurerCache,
} from 'react-virtualized';
import reactDom from 'react-dom';

// ** Reactstrap Imports
import { Spinner, Accordion, Label } from 'reactstrap';
import {
  useDeleteSnoozeTask,
  useDeleteTask,
  useReOrderTask,
  useUpdateTask,
} from '../service/task.services';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import {
  Fragment,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { userData } from '../../../../redux/user';
import { useSelector } from 'react-redux';
import { toggleElementFromArray } from '../../../../utility/Utils';
import TaskListHeader from './TaskListHeader';
import { SnoozeTaskModal } from './SnoozeTaskModal';
import { useDeleteReadTasks } from '../service/taskNotifyUsers.services';
import { NotificationType } from '../../../../constant';
import TaskUpdateModal from './TaskUpdateModal';
import useIsMobile from '../../../../hooks/useIsMobile';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import TasksListItemDraggable from './TasksListItemDraggable';
import TasksListItem from './TasksListItem';
import AddQuickTask from './AddQuickTask';
import { encrypt } from '../../../../helper/common.helper';
import { useHistory } from 'react-router-dom';

const Tasks = (props, ref) => {
  // ** Props
  const {
    setOpen,
    open,
    currentTasks,
    setUpdateTask,
    setShow,
    getTasks,
    taskLoading,
    setIsSubTask,
    taskOptions,
    currentFilter,
    setCurrentFilter,
    getSubTasks,
    subTasks,
    setCurrentTasks,
    setSubTasks,
    initialContactData,
    initialUserData,
    notifyUserForNewTask,
    setIsLoadingVisible,
    isLoadingVisible,
    currentTaskPagination,
    setCurrentTaskPagination,
    currentCategory, // does not includes unassigned, in that case - null
    currentCategoryId, // includes unassigned id
    currentTaskRef,
    subTaskRef,
    setCurrentCategoryTaskModal,
    setCurrentTaskPaginationMain,
    updateCategoryCounts,
    setTotalSnoozedTasks,
    usersOptions,
  } = props;

  // ** Redux **
  const user = useSelector(userData);

  // ** Hooks **
  const history = useHistory();

  // ** State
  const [quickAddTaskVisible, setQuickAddTaskVisible] = useState(false);
  const [markAsLoadingArray, setMarkAsLoadingArray] = useState([]);
  const [currentSnoozeTask, setCurrentSnoozeTask] = useState({
    taskDetail: null,
    isSubTask: false,
  });
  const [showTaskUpdates, setShowTaskUpdates] = useState({
    isOpen: false,
    taskDetail: null,
  });

  const markAsLoadingArrayRef = useRef(markAsLoadingArray);
  markAsLoadingArrayRef.current = markAsLoadingArray;

  // ** Custom Hooks **
  const isMobile = useIsMobile();
  const { deleteTask } = useDeleteTask();
  const { updateTask: updateTaskDetail } = useUpdateTask();
  const { reOrderTask } = useReOrderTask();
  const { removeReadTasks: removeReadUpdates } = useDeleteReadTasks();
  const { deleteSnoozeTask } = useDeleteSnoozeTask();

  // ** Function to selectTask on click
  const handleTaskClick = (item, isSubTask = false) => {
    if (currentCategory) {
      setCurrentCategoryTaskModal(currentCategory);
    }
    setUpdateTask(item);
    setIsSubTask(isSubTask);
    setShow(true);
    // Here set the URL
    const url = new URL(window.location);
    url.searchParams.set('task', encrypt(item._id));
    history.push({
      pathname: history?.location?.pathname,
      search: url.searchParams.toString(),
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      handleQuickAdd(open) {
        setQuickAddTaskVisible(open);
      },
    }),
    []
  );

  const handleTaskDelete = async (item, isParentTask = false) => {
    const result = await showWarnAlert({
      text: `${
        item.trash
          ? 'Are you sure you want to delete this task ?'
          : 'Are you sure you want to move this task to trash ?'
      }`,
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      const { error } = await deleteTask(item?._id, 'Task deleting');
      if (!error) {
        if (item?.snoozeDetail?._id) {
          setTotalSnoozedTasks((prev) => Number(prev) - 1);
        }
        if (!isParentTask) {
          let tempCurrentTasks = JSON.parse(JSON.stringify(currentTasks));
          tempCurrentTasks = tempCurrentTasks.filter(
            (task) => task._id !== item._id
          );
          if (currentTaskPagination.loadMore && tempCurrentTasks.length <= 20) {
            setIsLoadingVisible(false);
            reLoadData();
          } else {
            setCurrentTaskPagination({
              ...currentTaskPagination,
              pagination: {
                ...currentTaskPagination?.pagination,
                total:
                  currentTaskPagination?.pagination?.total - 1 < 0
                    ? 0
                    : currentTaskPagination?.pagination?.total - 1 || 0,
              },
            });
          }
          setCurrentTasks(tempCurrentTasks);
        } else {
          const tempCurrentTasks = JSON.parse(JSON.stringify(subTasks));
          if (tempCurrentTasks?.[isParentTask?._id]) {
            tempCurrentTasks[isParentTask?._id] = tempCurrentTasks?.[
              isParentTask?._id
            ]?.filter((task) => task._id !== item._id);
          }
          const tempParentCurrentTasks = JSON.parse(
            JSON.stringify(currentTasks)
          );
          tempParentCurrentTasks?.map((task) => {
            if (task?._id === isParentTask?._id && task?.sub_tasks) {
              task.sub_tasks = task.sub_tasks - 1;
            }
          });
          setCurrentTasks(tempParentCurrentTasks);
          setSubTasks(tempCurrentTasks);
        }
      }
    }
  };

  const handleRestoreTask = async (item) => {
    const result = await showWarnAlert({
      text: 'are you sure you want to restore this task?',
      confirmButtonText: 'Yes',
    });

    if (item.assigned) {
      delete item.assigned;
    }

    if (result.value) {
      item.trash = false;
      const { error } = await updateTaskDetail(
        item._id,
        item,
        'Task restoring...'
      );
      if (!error) {
        setOpen([]);
        reLoadData();
      }
    }
  };

  const toggle = (id) => {
    setOpen((prev) => toggleElementFromArray(prev, id));
  };

  const fetchData = () => {
    setCurrentTaskPagination({
      ...currentTaskPagination,
      page: currentTaskPagination.page + 1,
    });
  };

  const reLoadData = () => {
    if (currentTaskPagination.page === 1) {
      getTasks();
    } else {
      setCurrentTaskPagination({ ...currentTaskPagination, page: 1 });
    }
  };

  const markNotificationAsRead = async (item) => {
    const { error } = await removeReadUpdates(user._id, {
      taskIds: [item._id],
      notificationFor: NotificationType.NEW_UPDATE,
    });
    if (!error) {
      if (!item.parent_task) {
        const tempCurrentTasks = [...currentTasks];
        const itemIndex = tempCurrentTasks.findIndex(
          (task) => task._id === item._id
        );
        if (itemIndex > -1) {
          tempCurrentTasks[itemIndex] = {
            ...tempCurrentTasks[itemIndex],
            isUnreadUpdates: false,
          };
          setCurrentTasks(tempCurrentTasks);
        }
      } else {
        const tempCurrentTasks = JSON.parse(JSON.stringify(subTasks));
        if (tempCurrentTasks?.[item.parent_task]) {
          const itemIndex = tempCurrentTasks?.[item.parent_task].findIndex(
            (task) => task._id === item._id
          );
          if (itemIndex > -1) {
            tempCurrentTasks[item.parent_task][itemIndex] = {
              ...tempCurrentTasks[item.parent_task][itemIndex],
              isUnreadUpdates: false,
            };
            setSubTasks(tempCurrentTasks);
          }
        }
      }
    }
  };

  const handleTaskComplete = async (itemArg, checked) => {
    const item = { ...itemArg };
    const tempCurrentTasks = [...currentTaskRef.current];

    const result = await showWarnAlert({
      text: checked
        ? 'Are you sure you want to archive this task?'
        : 'Are you sure you want to remove this task from archived list?',
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      if (item?.parent_task) {
        if (!checked) {
          currentTaskRef.current = tempCurrentTasks.filter(
            (task) => task._id !== item?._id
          );
        } else {
          currentTaskRef.current = tempCurrentTasks.map((task) =>
            task._id === item?.parent_task
              ? {
                  ...task,
                  sub_tasks: task.sub_tasks
                    ? checked
                      ? task.sub_tasks - 1
                      : task.sub_tasks + 1
                    : task.sub_tasks,
                }
              : { ...task }
          );
          subTaskRef.current = {
            ...subTaskRef.current,
            [item?.parent_task]: (
              subTaskRef.current[item?.parent_task] || []
            ).filter((obj) => obj._id !== item?._id),
          };
        }
      } else {
        currentTaskRef.current = tempCurrentTasks.filter(
          (task) => task._id !== item._id
        );
      }

      let tempSetMarkAsLoadingArray = [
        ...markAsLoadingArrayRef.current,
        item._id,
      ];
      setMarkAsLoadingArray(tempSetMarkAsLoadingArray);
      markAsLoadingArrayRef.current = tempSetMarkAsLoadingArray;
      // --> end

      item.completed = checked;

      if (item.contact) {
        delete item.contact;
      }
      if (item.assigned) {
        delete item.assigned;
      }
      if (item.createdBy) {
        delete item.createdBy;
      }
      item.message = checked
        ? 'Task archived successfully.'
        : 'Task reopen successfully.';
      const { error } = await updateTaskDetail(item._id, item, 'Loading...');

      tempSetMarkAsLoadingArray = tempSetMarkAsLoadingArray.filter(
        (id) => id !== item._id
      );
      markAsLoadingArrayRef.current = tempSetMarkAsLoadingArray;
      setMarkAsLoadingArray(tempSetMarkAsLoadingArray);
      if (!error) {
        if (item?.parent_task) {
          if (!checked) {
            setCurrentTasks(
              tempCurrentTasks.filter((task) => task._id !== item?._id)
            );
          } else {
            setCurrentTasks(
              tempCurrentTasks.map((task) =>
                task._id === item?.parent_task
                  ? {
                      ...task,
                      sub_tasks: task.sub_tasks
                        ? checked
                          ? task.sub_tasks - 1
                          : task.sub_tasks + 1
                        : task.sub_tasks,
                    }
                  : { ...task }
              )
            );

            setSubTasks((prev) => ({
              ...prev,
              [item?.parent_task]: (prev[item?.parent_task] || []).filter(
                (obj) => obj._id !== item?._id
              ),
            }));
          }
        } else {
          setCurrentTasks(
            tempCurrentTasks.filter((task) => task._id !== item._id)
          );
        }

        if (item?.snoozeDetail?._id) {
          setTotalSnoozedTasks((prev) => Number(prev) - 1);
        }

        // if data has more and data length less then 20 that time we need fetch more data because we user infinite scroll
        if (currentTaskPagination.loadMore && currentTasks.length <= 20) {
          fetchData();
        }
      }
    }
  };

  const handleCloseSnoozeModal = (isUpdated = null) => {
    if (isUpdated) {
      if (isUpdated?.hideSnoozeTask) {
        if (currentSnoozeTask?.isSubTask) {
          setSubTasks((prev) => ({
            ...prev,
            [currentSnoozeTask?.isSubTask]: (
              prev[currentSnoozeTask?.isSubTask] || []
            ).filter((obj) => obj._id !== isUpdated?.task),
          }));

          const tempCurrentTasks = [...currentTaskRef.current];

          setCurrentTasks(
            tempCurrentTasks.map((task) =>
              task._id === currentSnoozeTask?.isSubTask
                ? {
                    ...task,
                    sub_tasks: task.sub_tasks ? task.sub_tasks - 1 : 0,
                  }
                : { ...task }
            )
          );
        } else {
          setCurrentTasks(
            currentTasks.filter((task) => task._id !== isUpdated?.task)
          );
          setCurrentTaskPagination({
            ...currentTaskPagination,
            pagination: {
              ...currentTaskPagination?.pagination,
              total:
                currentTaskPagination?.pagination?.total - 1 < 0
                  ? 0
                  : currentTaskPagination?.pagination?.total - 1 || 0,
            },
          });
        }
      } else {
        if (currentSnoozeTask?.isSubTask) {
          setSubTasks((prev) => ({
            ...prev,
            [currentSnoozeTask?.isSubTask]: (
              prev[currentSnoozeTask?.isSubTask] || []
            ).map((obj) =>
              obj._id === isUpdated?.task
                ? { ...obj, snoozeDetail: isUpdated, pinned: false }
                : { ...obj }
            ),
          }));
        } else {
          setCurrentTasks(
            currentTasks.map((task) =>
              task._id === isUpdated?.task
                ? {
                    ...task,
                    snoozeDetail: isUpdated,
                    pinned: false,
                  }
                : { ...task }
            )
          );
        }
      }
      setTotalSnoozedTasks((prev) => Number(prev) + 1);
    }
    setCurrentSnoozeTask({
      taskDetail: null,
      isSubTask: false,
    });
  };

  const handleSnoozeOffTasks = async (tasks, isSubTask = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to unsnooze this task?',
    });
    if (result.value) {
      // const obj
      const { error } = await deleteSnoozeTask(tasks?.snoozeDetail?._id);
      if (!error) {
        if (currentFilter.snoozedTask) {
          setCurrentTasks(
            currentTasks.filter((task) => task._id !== tasks?._id)
          );
          setCurrentTaskPagination({
            ...currentTaskPagination,
            pagination: {
              ...currentTaskPagination?.pagination,
              total:
                currentTaskPagination?.pagination?.total - 1 < 0
                  ? 0
                  : currentTaskPagination?.pagination?.total - 1 || 0,
            },
          });
        } else {
          if (isSubTask) {
            //
            setSubTasks((prev) => ({
              ...prev,
              [isSubTask]: (prev[isSubTask] || []).map((obj) =>
                obj._id === tasks?._id
                  ? { ...obj, snoozeDetail: null }
                  : { ...obj }
              ),
            }));
          } else {
            setCurrentTasks(
              currentTasks.map((task) =>
                task._id === tasks?._id
                  ? {
                      ...task,
                      snoozeDetail: null,
                    }
                  : { ...task }
              )
            );
          }
        }
        setTotalSnoozedTasks((prev) => Number(prev) - 1);
      }
    }
  };

  const getClassName = () => {
    if (currentFilter?.open) {
      return 'open-tasks';
    }
    if (currentFilter?.completed) {
      return 'archived';
    }
    if (currentFilter?.trash) {
      return 'trash';
    }
    if (currentFilter?.snoozedTask) {
      return 'snoozed-tasks';
    }
    return 'open-tasks';
  };

  const handleCloseUpdateTask = () => {
    setShowTaskUpdates({
      isOpen: false,
      taskDetail: null,
    });
  };

  const updateTaskCounts = (tasksToUpdate) => {
    setCurrentTasks((prevTasks) => {
      const mainMap = new Map(prevTasks.map((task) => [task._id, { ...task }]));
      tasksToUpdate.forEach((task) => {
        const mainTask = mainMap.get(task.id);
        if (mainTask) {
          mainTask.sub_tasks += task.count;
        }
      });
      return Array.from(mainMap.values());
    });
  };

  const updateParentTask = async ({
    taskId,
    parentTaskId = null,
    existingParentId = null,
    existingCategoryId = null,
    order = null,
  }) => {
    const payload = {
      parent_task: parentTaskId,
      ...(order !== null && { order }),
    };

    if (currentCategoryId) {
      payload.category = {
        _id: currentCategoryId === 'unassigned' ? null : currentCategoryId,
      };
    }

    const { error } = await updateTaskDetail(
      taskId,
      payload,
      'updating task...'
    );

    if (!error) {
      const taskCounts = [];
      // If a new parentTaskId is provided, increment the task count for the new parent
      if (parentTaskId) {
        let parentTaskCount = 1;
        // If the task is parent task, add the subtask of the task to the new parent task
        if (!existingParentId) {
          const taskDetails = currentTasks.find((task) => task._id === taskId);
          parentTaskCount += taskDetails.sub_tasks || 0;
        } else {
          taskCounts.push({ id: existingParentId, count: -1 });
        }
        taskCounts.push({ id: parentTaskId, count: parentTaskCount });
      }
      updateTaskCounts(taskCounts);

      const categoryCounts = [{ id: currentCategoryId, count: 1 }];
      // If this task is a parent task (no existingParentId), decrement the category count for the existing category
      if (!existingParentId) {
        categoryCounts.push({ id: existingCategoryId, count: -1 });
      }
      updateCategoryCounts?.(categoryCounts);
    }
  };

  function isRowLoaded({ index }) {
    return !!currentTasks[index];
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    const { droppableId: sDroppableId, index: sIndex } = source;
    const { droppableId: dDroppableId, index: dIndex } = destination || {};

    if (!destination || (sDroppableId === dDroppableId && sIndex === dIndex)) {
      return;
    }

    const sParentTaskId = sDroppableId.split('sub-tasks-')[1];
    const dParentTaskId = dDroppableId.split('sub-tasks-')[1];

    if (sDroppableId === dDroppableId) {
      /* Default listing (parentTasks & subTasks) */

      if (source.droppableId === 'main-tasks') {
        setCurrentTasks((prev) => {
          const updatedTasks = reorder(prev, sIndex, dIndex);
          reOrderTask(updatedTasks.map((obj) => ({ _id: obj._id })));
          return updatedTasks;
        });
        setOpen((prev) =>
          prev.map((id) => (dIndex <= Number(id) ? `${Number(id) + 1}` : id))
        );
      } else {
        setSubTasks((prev) => {
          const clonedPrev = _.cloneDeep(prev);
          const updated = reorder(clonedPrev[sParentTaskId], sIndex, dIndex);
          reOrderTask(updated.map((obj) => ({ _id: obj._id })));
          clonedPrev[sParentTaskId] = updated;
          return clonedPrev;
        });
      }
    } else {
      if (dDroppableId === 'main-tasks') {
        /* subTasks to parentTasks */

        setSubTasks((prev) => {
          const clonedPrev = _.cloneDeep(prev);
          clonedPrev[sParentTaskId].splice(sIndex, 1);
          return clonedPrev;
        });
        updateTaskCounts([{ id: sParentTaskId, count: -1 }]);

        const newOrder = dIndex ? dIndex - 1 : dIndex;
        const newParent = subTasks[sParentTaskId].find(
          (_, id) => sIndex === id
        );

        setCurrentTasks((prev) => {
          const clonedPrev = _.cloneDeep(prev);
          clonedPrev.splice(dIndex, 0, newParent);
          return clonedPrev;
        });

        updateParentTask({
          taskId: newParent._id,
          parentTaskId: null,
          existingParentId: sParentTaskId,
          existingCategoryId: null,
          order: newOrder,
        });

        setOpen((prev) =>
          prev.map((id) => (dIndex <= Number(id) ? `${Number(id) + 1}` : id))
        );
      } else if (sDroppableId === 'main-tasks') {
        /* parentTasks to subTasks */

        const newOrder = dIndex ? dIndex - 1 : dIndex;

        const newSubTask = currentTasks.find((_, id) => sIndex === id);

        setSubTasks((prev) => {
          const clonedPrev = _.cloneDeep(prev);
          clonedPrev[dParentTaskId].splice(dIndex, 0, {
            ...newSubTask,
            sub_tasks: null,
          });
          return clonedPrev;
        });

        setCurrentTasks((prev) => {
          const clonedPrev = _.cloneDeep(prev);
          clonedPrev.splice(sIndex, 1);
          return clonedPrev;
        });

        setOpen((prev) =>
          prev.map((id) => (sIndex < Number(id) ? `${Number(id) - 1}` : id))
        );

        await updateParentTask({
          taskId: newSubTask._id,
          parentTaskId: dParentTaskId,
          existingParentId: null,
          existingCategoryId: null,
          order: newOrder,
        });

        if (newSubTask.sub_tasks > 0) {
          getSubTasks(dParentTaskId);
        }
      } else {
        /* one parent subTasks to another parent subTasks */

        const clonedSubTasks = _.cloneDeep(subTasks);
        const [removedSubTask] = clonedSubTasks[sParentTaskId].splice(
          sIndex,
          1
        );
        clonedSubTasks[dParentTaskId].splice(dIndex, 0, removedSubTask);
        setSubTasks(clonedSubTasks);

        const newOrder = dIndex ? dIndex - 1 : dIndex;
        updateParentTask({
          taskId: removedSubTask._id,
          parentTaskId: dParentTaskId,
          existingParentId: sParentTaskId,
          existingCategoryId: null,
          order: newOrder,
        });
      }
    }
  };

  const cache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 56,
      defaultHeight: 56,
    });
  }, []);

  const loadMoreRows = () => {
    if (
      currentTasks.length < currentTaskPagination.pagination?.total &&
      !taskLoading
    ) {
      fetchData();
    }
  };

  const renderTasks = () => {
    const taskListItemProps = {
      ...props,
      user,
      toggle,
      isMobile,
      handleTaskClick,
      markNotificationAsRead,
      handleSnoozeOffTasks,
      handleTaskComplete,
      handleRestoreTask,
      handleTaskDelete,
      setCurrentSnoozeTask,
      setShowTaskUpdates,
      markAsLoadingArray,
    };

    return (
      <div className={`task-manager-body ${getClassName()}`}>
        <>
          {taskLoading &&
          currentTaskPagination.page === 1 &&
          isLoadingVisible ? (
            <>
              <div className='d-flex align-content-center justify-content-center py-2'>
                <Spinner />
              </div>
            </>
          ) : (
            <Fragment>
              <Accordion
                className='task-manager-main-accordion'
                open={open}
                key={currentFilter}
              >
                <TaskListHeader
                  taskLoading={taskLoading}
                  setIsLoadingVisible={setIsLoadingVisible}
                  setCurrentFilter={setCurrentFilter}
                  currentFilter={currentFilter}
                  childHeader={false}
                  initialContactData={initialContactData}
                  initialUserData={initialUserData}
                  setCurrentTaskPaginationMain={setCurrentTaskPaginationMain}
                />
                {quickAddTaskVisible && (
                  <AddQuickTask
                    usersOptions={usersOptions}
                    subTasks={subTasks}
                    setSubTasks={setSubTasks}
                    initialContactData={initialContactData}
                    initialUserData={initialUserData}
                    setCurrentTasks={setCurrentTasks}
                    currentTasks={currentTasks}
                    setOpen={setOpen}
                    setVisible={setQuickAddTaskVisible}
                    taskOptions={taskOptions}
                    getSubTasks={getSubTasks}
                    setCurrentFilter={setCurrentFilter}
                    currentFilter={currentFilter}
                    notifyUserForNewTask={notifyUserForNewTask}
                    setCurrentTaskPagination={setCurrentTaskPagination}
                    currentCategory={currentCategory}
                  />
                )}

                {currentTasks.length ? (
                  <div
                    className={`taskRowlistingHeightWrapper ${
                      taskLoading && 'bottomLoaderActive'
                    }`}
                  >
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable
                        type='TASK'
                        droppableId='main-tasks'
                        mode='virtual'
                        renderClone={(provided, snapshot, rubric) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                userSelect: 'none',
                                ...provided.draggableProps.style,
                              }}
                            >
                              <TasksListItem
                                provided={provided}
                                item={currentTasks[rubric.source.index]}
                                index={rubric.source.index}
                                style={{ margin: 0, background: 'red' }}
                                parent={parent}
                                cache={cache}
                                {...taskListItemProps}
                              />
                            </div>
                          );
                        }}
                      >
                        {(droppableProvided) => (
                          <>
                            <AutoSizer>
                              {({ height, width }) => {
                                return (
                                  <div
                                    ref={droppableProvided.innerRef}
                                    {...droppableProvided.droppableProps}
                                    style={{
                                      width: '100%',
                                    }}
                                  >
                                    <InfiniteLoader
                                      isRowLoaded={isRowLoaded}
                                      loadMoreRows={loadMoreRows}
                                      rowCount={
                                        currentTaskPagination.pagination
                                          ?.total || 0
                                      }
                                      // HELLO
                                      // rowCount={1000}
                                      threshold={1}
                                    >
                                      {({ onRowsRendered, registerChild }) => {
                                        return (
                                          <>
                                            <List
                                              {...(!isMobile && {
                                                style: {
                                                  minWidth: '1200px',
                                                },
                                              })}
                                              className='task__list__container'
                                              height={height}
                                              {...(!isMobile && {
                                                containerStyle: {
                                                  minWidth: '1200px',
                                                },
                                              })}
                                              rowCount={currentTasks.length}
                                              deferredMeasurementCache={cache}
                                              rowHeight={cache.rowHeight}
                                              width={width}
                                              autoContainerWidth
                                              onRowsRendered={onRowsRendered}
                                              ref={(ref) => {
                                                if (ref) {
                                                  const whatHasMyLifeComeTo =
                                                    // eslint-disable-next-line react/no-find-dom-node
                                                    reactDom.findDOMNode(ref);
                                                  if (
                                                    whatHasMyLifeComeTo instanceof
                                                    HTMLElement
                                                  ) {
                                                    droppableProvided.innerRef(
                                                      whatHasMyLifeComeTo
                                                    );
                                                  }
                                                }
                                                registerChild(ref);
                                              }}
                                              rowRenderer={({
                                                key,
                                                index,
                                                style,
                                                parent,
                                              }) => {
                                                return (
                                                  <TasksListItemDraggable
                                                    key={key}
                                                    index={index}
                                                    style={style}
                                                    parent={parent}
                                                    cache={cache}
                                                    {...taskListItemProps}
                                                  />
                                                );
                                              }}
                                            />
                                            {taskLoading && (
                                              <div
                                                className='task-manger-loader d-flex align-content-center justify-content-center py-2'
                                                style={{
                                                  position: 'absolute',
                                                  bottom: 0,
                                                  left: 0,
                                                  right: 0,
                                                }}
                                              >
                                                <Spinner />
                                              </div>
                                            )}
                                          </>
                                        );
                                      }}
                                    </InfiniteLoader>
                                  </div>
                                );
                              }}
                            </AutoSizer>
                          </>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                ) : (
                  <div className='d-flex align-content-center justify-content-center py-2'>
                    <Label>No Task Found</Label>
                  </div>
                )}
              </Accordion>
              <div className='showing-task-manager-footer'>
                {currentTasks.length ? (
                  <>
                    Showing 1 to {currentTasks.length} of{' '}
                    {currentTaskPagination.pagination?.total || 1} tasks
                  </>
                ) : (
                  <></>
                )}
              </div>
              {currentSnoozeTask && (
                <SnoozeTaskModal
                  showSnoozeTaskModal={currentSnoozeTask}
                  handleCloseSnoozeModal={handleCloseSnoozeModal}
                />
              )}
            </Fragment>
          )}
        </>
        {showTaskUpdates.isOpen && (
          <TaskUpdateModal
            isTaskUpdateModal={showTaskUpdates}
            handleCloseUpdateTask={handleCloseUpdateTask}
          />
        )}
      </div>
    );
  };

  return <>{renderTasks()}</>;
};

export default forwardRef(Tasks);
