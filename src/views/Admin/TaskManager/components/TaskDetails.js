// ** React Imports
import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

// ** external packages
import _ from 'lodash';
import moment from 'moment';

// ** Todo App Components
import Tasks from './Tasks';

// ** Styles
import '@styles/react/apps/app-todo.scss';

// ** Apis
import { useGetTasksAPI, useUpdateTask } from '../service/task.services';

//  ** redux
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';

// ** others
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { givenElementRemoveFromArray } from '../../../../utility/Utils';
import { useExpandAllTask } from '../hooks/useTaskService';
import { useDeleteReadTasks } from '../service/taskNotifyUsers.services';
import useGetTasks from '../hooks/useGetTasks';
import TaskParentChangeModal from './TaskParentChangeModal';
import StatusUpdateModal from './StatusUpdateModal';
import TaskModal from './TaskModal/TaskModal';

const TaskDetails = forwardRef(
  (
    {
      currentCategory = false, // does not includes unassigned, in that case - null
      currentCategoryId = false, // includes unassigned id
      initialContactData = false,
      initialUserData = false,
      currentFilter,
      setCurrentFilter,
      expandAll,
      setExpandAll,
      setIsExpandingAll,
      setOpen,
      open,
      usersOptions,
      taskOptionLoading,
      taskOptions,
      setTaskOptions,
      setIsSubTask,
      isSubTask,
      show: showTaskModal,
      setShow: setShowTaskModal,
      notifyUserForNewTask,
      clearTasksData,
      currentTaskPaginationMain,
      setCurrentTaskPaginationMain,
      refreshCategories,
      updateCategoryCounts,
      setTotalSnoozedTasks,
      updateTask,
      setUpdateTask,
      handleClearAddUpdateTask,
      isPersistFilterAlreadySet = false,
    },
    ref
  ) => {
    // ** Redux **
    const user = useSelector(userData);

    // ** States
    const [subTasks, setSubTasks] = useState({});
    const [openTaskSidebar, setOpenTaskSidebar] = useState(false);
    const [isLoadingVisible, setIsLoadingVisible] = useState(true);
    const [currentTasks, setCurrentTasks] = useState([]);
    const currentTaskRef = useRef(currentTasks);
    currentTaskRef.current = currentTasks;
    const [changeParentModalVisible, setChangeParentModalVisible] =
      useState(false);
    const [changeStatusModal, setChangeStatusModal] = useState({
      task: null,
      toggle: false,
      currentOption: null,
    });
    const [allTasks, setAllTasks] = useState([]);
    const [
      currentStatusOrPriorityChangingIds,
      setCurrentStatusOrPriorityChangingIds,
    ] = useState([]);
    const [subtaskLoading, setSubtaskLoading] = useState([]);
    const [unreadTaskIds, setUnreadTaskIds] = useState([]);
    const [currentTaskPagination, setCurrentTaskPagination] = useState(
      currentTaskPaginationMain
    );
    const [currentCategoryTaskModal, setCurrentCategoryTaskModal] =
      useState(currentCategory);

    // ** Ref **
    const currentStatusOrPriorityChangingIdsRef = useRef(
      currentStatusOrPriorityChangingIds
    );
    currentStatusOrPriorityChangingIdsRef.current =
      currentStatusOrPriorityChangingIds;
    const taskListRef = useRef(null);
    const subtaskLoadingRef = useRef([]);
    const subTaskRef = useRef(subTasks);
    subTaskRef.current = subTasks;
    const currentFilterRef = useRef(currentFilter);
    currentFilterRef.current = { ...currentFilter, ...currentTaskPagination };

    // ** Custom hooks **
    const { expandAllTask } = useExpandAllTask({
      user,
      setExpandAll,
      setIsExpandingAll,
      setSubTasks,
      setOpen,
      currentFilter,
    });
    const { getTasks, isLoading: parentTaskLoading } = useGetTasks({
      allTasks,
      setOpen,
      currentFilter: { ...currentFilter, ...currentTaskPagination },
      currentFilterRef,
      currentTasks,
      expandAll,
      expandAllTask,
      setAllTasks,
      setCurrentFilter,
      setCurrentTasks,
      setIsLoadingVisible,
      user,
      setCurrentTaskPagination,
      currentTaskPagination,
      setTotalSnoozedTasks,
    });
    const {
      updateTask: updateTaskDetail,
      isLoading: changePriorityOrStatusLoading,
    } = useUpdateTask();
    const { getTasks: getTasksAPI } = useGetTasksAPI();
    const { removeReadTasks } = useDeleteReadTasks();

    useEffect(() => {
      setCurrentTaskPagination(currentTaskPaginationMain);
    }, [currentTaskPaginationMain]);

    useEffect(() => {
      if (expandAll) {
        expandAllTask(currentTasks);
      } else {
        setSubTasks({});
        setOpen([]);
      }
    }, [expandAll]);

    useEffect(() => {
      if (clearTasksData) {
        setCurrentTasks([]);
        setSubTasks({});
        setOpen([]);
      }
    }, [clearTasksData]);

    useEffect(() => {
      if (currentTaskPagination.refreshPage) {
        getTasks();
        addNotificationBadge();
      }
    }, [currentTaskPagination.refreshPage]);

    useEffect(() => {
      if (isPersistFilterAlreadySet) {
        getTasks();
        addNotificationBadge();
      }
    }, [
      currentTaskPagination.page,
      currentFilter.search,
      currentFilter.includeSubTasks,
      currentFilter.open,
      currentFilter.priority?.length,
      currentFilter.status?.length,
      currentFilter.trash,
      currentFilter.snoozedTask,
      currentFilter.contact,
      currentFilter.frequency,
      currentFilter.assigned,
      currentFilter.sort,
      currentFilter.group,
      currentFilter.groupStatus,
      currentFilter.groupCategory,
      currentFilter.tags?.length,
      currentFilter.pipeline,
      currentFilter.pipelineStage,
      initialContactData?._id,
      !initialUserData?._id,
      isPersistFilterAlreadySet,
    ]);

    useEffect(() => {
      addNotificationBadge();
    }, [unreadTaskIds, currentTasks.length]);

    useEffect(() => {
      if (updateTask && updateTask.unread) {
        setCurrentTasks((prev) =>
          prev.map((t) =>
            t._id === updateTask?._id ? { ...t, unread: false } : t
          )
        );
        setAllTasks((prev) =>
          prev.map((t) =>
            t._id === updateTask?._id ? { ...t, unread: false } : t
          )
        );
      }
    }, [updateTask]);

    // ------- forward methods to it's parent components --------
    useImperativeHandle(ref, () => ({
      setCurrentTaskPagination,
      getTasks,
      handleQuickAdd(open) {
        taskListRef.current.handleQuickAdd(open);
      },
    }));

    // ** Function to handle Left sidebar & Task sidebar
    const handleTaskSidebar = () => setOpenTaskSidebar(!openTaskSidebar);

    const addNotificationBadge = () => {
      if (unreadTaskIds.length) checkUnreadTaskExist();
    };

    const getSubTasks = async (parentTaskId, filterOption = currentFilter) => {
      const tempSubtaskLoadingRefPrev = [
        ...subtaskLoadingRef.current,
        parentTaskId,
      ];
      subtaskLoadingRef.current = [...tempSubtaskLoadingRefPrev];
      setSubtaskLoading([...tempSubtaskLoadingRefPrev]);

      const { data, error } = await getTasksAPI({
        parent_task: parentTaskId,
        trash: false,
        completed: false,
        ...(currentFilter.includeSubTasks && {
          search: filterOption.search,
          status: filterOption.status,
          category: filterOption.category,
          priority: filterOption.priority,
          contact: filterOption.contact,
          frequency: filterOption.frequency,
          assigned: filterOption.assigned,
        }),
        company: user?.company?._id,
        select:
          'name,details,startDate,endDate,priority,status,category,parent_task,trash,completed,createdBy,createdAt,assigned,contact,taskNumber,snoozeUntil,hideSnoozeTask',
        sort: filterOption.subTaskSort?.[parentTaskId] || filterOption.sort,
      });
      if (!error && _.isArray(data?.tasks)) {
        const newSubTasks = await checkUnreadSubTaskExist(data?.tasks);

        setSubTasks((pre) => ({
          ...pre,
          [parentTaskId]: [...newSubTasks],
        }));
      }
      const tempSubtaskLoadingRefAfter = givenElementRemoveFromArray(
        subtaskLoadingRef.current,
        parentTaskId
      );
      subtaskLoadingRef.current = [...tempSubtaskLoadingRefAfter];
      setSubtaskLoading([...tempSubtaskLoadingRefAfter]);
    };

    const checkUnreadTaskExist = async () => {
      const readTaskIds = [];
      const updatedUnreadTaskIds = [...unreadTaskIds];

      const newTasks = [...currentTasks].map((t) => {
        const tId = unreadTaskIds.findIndex((uT) => uT === t._id);
        if (tId !== -1) {
          readTaskIds.push(updatedUnreadTaskIds.splice(tId, 1)[0]);
          return { ...t, unread: true };
        }
        return t;
      });

      setCurrentTasks(newTasks);
      if (readTaskIds.length) {
        const userId = user?._id;
        await removeReadTasks(userId, { taskIds: readTaskIds });
        if (unreadTaskIds.length !== updatedUnreadTaskIds) {
          setUnreadTaskIds(updatedUnreadTaskIds);
        }
      }
    };

    const checkUnreadSubTaskExist = async (subTasks) => {
      const readTaskIds = [];
      const updatedUnreadTaskIds = [...unreadTaskIds];

      const updatedSubTasks = [...subTasks].map((t) => {
        const tId = unreadTaskIds.findIndex((uT) => uT === t._id);
        if (tId !== -1) {
          readTaskIds.push(unreadTaskIds[tId]);
          updatedUnreadTaskIds.splice(tId, 1);
          return { ...t, unread: true };
        }
        return t;
      });

      if (readTaskIds.length) {
        const userId = user?._id;
        await removeReadTasks(userId, { taskIds: readTaskIds });
        if (unreadTaskIds.length !== updatedUnreadTaskIds) {
          setUnreadTaskIds(updatedUnreadTaskIds);
        }
      }
      return updatedSubTasks;
    };

    const handleUpdateStatusOrPriority = async (task, currentOption, type) => {
      if (type === 'status') {
        setChangeStatusModal({
          task,
          toggle: true,
          currentOption,
        });
      } else {
        const taskClone = JSON.parse(JSON.stringify(task));
        if (currentOption?._id === 'unassigned') {
          taskClone[type] = null;
        } else {
          taskClone[type] = currentOption?._id;
        }

        let res = null;
        if (currentOption?.markAsCompleted) {
          const result = await showWarnAlert({
            text: `Are you sure you want to change this ${
              type === 'status' ? 'status' : 'priority'
            } to ${
              currentOption?.label
            } because task will be marked as archived on moving task to this ${
              type === 'status' ? 'status' : 'priority'
            }?`,
            confirmButtonText: 'Yes',
          });
          if (result.value) {
            taskClone.completed = true;
            taskClone.contact = taskClone?.contact?._id || null;
            res = await updateTaskDetail(
              taskClone._id,
              taskClone,
              `${type === 'status' ? 'Status updating' : 'Priority updating'}`
            );
          } else {
            return false;
          }
        } else {
          taskClone.contact = taskClone?.contact?._id || null;
          res = await updateTaskDetail(
            taskClone._id,
            taskClone,
            `${type === 'status' ? 'Status updating' : 'Priority updating'}`
          );
        }
        const { error } = res;
        if (!error) {
          let tempCurrentStatusOrPriorityChangingIds = [
            ...currentStatusOrPriorityChangingIdsRef.current,
          ];
          tempCurrentStatusOrPriorityChangingIds =
            tempCurrentStatusOrPriorityChangingIds.filter(
              (id) => `${task._id}-${task[type]}` !== id
            );

          setCurrentStatusOrPriorityChangingIds([
            ...tempCurrentStatusOrPriorityChangingIds,
          ]);
          currentStatusOrPriorityChangingIdsRef.current = [
            ...tempCurrentStatusOrPriorityChangingIds,
          ];

          let tempCurrentTasks = [...currentTasks];
          tempCurrentTasks = [
            ...tempCurrentTasks.map((task) => {
              if (task._id === taskClone._id) {
                return {
                  ...task,
                  [type]: currentOption?._id,
                };
              } else if (
                task._id === taskClone.parent_task &&
                currentOption?.markAsCompleted
              ) {
                return {
                  ...task,
                  sub_tasks: task.sub_tasks ? task.sub_tasks - 1 : 0,
                };
              } else {
                return { ...task };
              }
            }),
          ];

          if (currentOption?.markAsCompleted) {
            tempCurrentTasks = tempCurrentTasks.filter(
              (task) => task._id !== taskClone._id
            );
          }
          setCurrentTasks(tempCurrentTasks);
          let tempSubTasks = [...(subTasks[taskClone.parent_task] || [])];
          tempSubTasks = [
            ...tempSubTasks.map((task) => {
              if (task._id === taskClone._id) {
                return {
                  ...task,
                  [type]: currentOption?._id,
                };
              } else {
                return { ...task };
              }
            }),
          ];

          if (currentOption?.markAsCompleted) {
            tempSubTasks = tempSubTasks.filter(
              (task) => task._id !== taskClone._id
            );
          }

          setSubTasks((pre) => ({
            ...pre,
            [taskClone.parent_task]: tempSubTasks,
          }));
        }
      }
    };

    const handleUpdateStartDate = async (task, newStartDate) => {
      const taskClone = JSON.parse(JSON.stringify(task));
      'contact' in taskClone && delete taskClone.contact;
      'assigned' in taskClone && delete taskClone.assigned;
      'createdBy' in taskClone && delete taskClone.createdBy;
      taskClone.toast = false;

      const { startDate, endDate } = task || {};

      const diff = moment(newStartDate).diff(moment(startDate));
      const newEndDate = moment(endDate).add(diff).toDate();

      const { error } = await updateTaskDetail(
        taskClone._id,
        { ...taskClone, startDate: newStartDate, endDate: newEndDate },
        `Updating start date`
      );
      if (!error) {
        let tempCurrentTasks = [...currentTasks];
        tempCurrentTasks = [
          ...tempCurrentTasks.map((task) => {
            if (task._id === taskClone._id) {
              return {
                ...task,
                startDate: newStartDate,
                endDate: newEndDate,
              };
            } else {
              return { ...task };
            }
          }),
        ];
        setCurrentTasks(tempCurrentTasks);
        let tempSubTasks = [...(subTasks[taskClone.parent_task] || [])];
        tempSubTasks = [
          ...tempSubTasks.map((task) => {
            if (task._id === taskClone._id) {
              return {
                ...task,
                startDate: newStartDate,
                endDate: newEndDate,
              };
            } else {
              return { ...task };
            }
          }),
        ];
        setSubTasks((pre) => ({
          ...pre,
          [taskClone.parent_task]: tempSubTasks,
        }));
      }
    };

    const handleUpdateDueDate = async (task, newDueDate) => {
      const taskClone = JSON.parse(JSON.stringify(task));
      'contact' in taskClone && delete taskClone.contact;
      'assigned' in taskClone && delete taskClone.assigned;
      'createdBy' in taskClone && delete taskClone.createdBy;
      taskClone.toast = false;

      const { error } = await updateTaskDetail(
        taskClone._id,
        { ...taskClone, endDate: newDueDate },
        `Updating due date`
      );
      if (!error) {
        let tempCurrentTasks = [...currentTasks];
        tempCurrentTasks = [
          ...tempCurrentTasks.map((task) => {
            if (task._id === taskClone._id) {
              return {
                ...task,
                endDate: newDueDate,
              };
            } else {
              return { ...task };
            }
          }),
        ];
        setCurrentTasks(tempCurrentTasks);
        let tempSubTasks = [...(subTasks[taskClone.parent_task] || [])];
        tempSubTasks = [
          ...tempSubTasks.map((task) => {
            if (task._id === taskClone._id) {
              return {
                ...task,
                endDate: newDueDate,
              };
            } else {
              return { ...task };
            }
          }),
        ];
        setSubTasks((pre) => ({
          ...pre,
          [taskClone.parent_task]: tempSubTasks,
        }));
      }
    };

    const clearChangeParentModal = () => {
      setUpdateTask(false);
      setIsSubTask(false);
      setChangeParentModalVisible(false);
    };

    const handleChangeParentModal = (task, isSubTask = false) => {
      setChangeParentModalVisible(true);
      setUpdateTask(task);
      setIsSubTask(isSubTask);
    };

    return (
      <Fragment>
        <Tasks
          setCurrentCategoryTaskModal={setCurrentCategoryTaskModal}
          ref={taskListRef}
          currentTaskRef={currentTaskRef}
          subTaskRef={subTaskRef}
          setOpen={setOpen}
          open={open}
          currentTasks={currentTasks}
          setUpdateTask={setUpdateTask}
          setShow={setShowTaskModal}
          getTasks={getTasks}
          taskLoading={parentTaskLoading || taskOptionLoading}
          handleTaskSidebar={handleTaskSidebar}
          setIsSubTask={setIsSubTask}
          taskOptions={taskOptions}
          setTaskOptions={setTaskOptions}
          handleUpdateStatusOrPriority={handleUpdateStatusOrPriority}
          handleUpdateStartDate={handleUpdateStartDate}
          handleUpdateDueDate={handleUpdateDueDate}
          currentFilter={currentFilter}
          usersOptions={usersOptions}
          currentStatusOrPriorityChangingIds={
            currentStatusOrPriorityChangingIds
          }
          setCurrentStatusOrPriorityChangingIds={
            setCurrentStatusOrPriorityChangingIds
          }
          changePriorityOrStatusLoading={changePriorityOrStatusLoading}
          setCurrentFilter={setCurrentFilter}
          getSubTasks={getSubTasks}
          subTasks={subTasks}
          subTaskLoading={subtaskLoading}
          setCurrentTasks={setCurrentTasks}
          setSubTasks={setSubTasks}
          initialContactData={initialContactData}
          initialUserData={initialUserData}
          notifyUserForNewTask={notifyUserForNewTask}
          setIsLoadingVisible={setIsLoadingVisible}
          isLoadingVisible={isLoadingVisible}
          handleChangeParentModal={handleChangeParentModal}
          currentTaskPagination={currentTaskPagination}
          setCurrentTaskPagination={setCurrentTaskPagination}
          currentCategory={currentCategory}
          currentCategoryId={currentCategoryId}
          setCurrentTaskPaginationMain={setCurrentTaskPaginationMain}
          updateCategoryCounts={updateCategoryCounts}
          setTotalSnoozedTasks={setTotalSnoozedTasks}
        />
        {showTaskModal && currentCategoryTaskModal === currentCategory && (
          <TaskModal
            currentCategory={currentCategory}
            currentCategoryTaskModal={currentCategoryTaskModal}
            refreshCategories={refreshCategories}
            initialContactData={initialContactData}
            initialUserData={initialUserData}
            open={open}
            setOpen={setOpen}
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
            setCurrentTasks={setCurrentTasks}
            subTasks={subTasks}
            setSubTasks={setSubTasks}
            setShowTaskModal={setShowTaskModal}
            showTaskModal={showTaskModal}
            editTask={updateTask}
            setUpdateTask={setUpdateTask}
            taskOptions={taskOptions}
            setTaskOptions={setTaskOptions}
            currentTasks={currentTasks}
            isSubTask={isSubTask}
            setIsSubTask={setIsSubTask}
            handleClearAddUpdateTask={handleClearAddUpdateTask}
            changePriorityOrStatusLoading={changePriorityOrStatusLoading}
            handleUpdateStatusOrPriority={handleUpdateStatusOrPriority}
            currentStatusOrPriorityChangingIds={
              currentStatusOrPriorityChangingIds
            }
            setCurrentStatusOrPriorityChangingIds={
              setCurrentStatusOrPriorityChangingIds
            }
            notifyUserForNewTask={notifyUserForNewTask}
            currentTaskPagination={currentTaskPagination}
            setCurrentTaskPagination={setCurrentTaskPagination}
          />
        )}

        {changeParentModalVisible && (
          <TaskParentChangeModal
            setOpen={setOpen}
            selectTask={updateTask}
            setCurrentTasks={setCurrentTasks}
            isOpen={changeParentModalVisible}
            closeModal={clearChangeParentModal}
            setSubTasks={setSubTasks}
            selectCurrentTask={isSubTask}
          />
        )}
        {changeStatusModal.toggle && (
          <StatusUpdateModal
            usersOptions={usersOptions}
            taskOptions={taskOptions}
            changeStatusModal={changeStatusModal}
            currentStatusOrPriorityChangingIdsRef={
              currentStatusOrPriorityChangingIdsRef
            }
            currentTasks={currentTasks}
            setCurrentStatusOrPriorityChangingIds={
              setCurrentStatusOrPriorityChangingIds
            }
            setCurrentTasks={setCurrentTasks}
            setSubTasks={setSubTasks}
            subTasks={subTasks}
            isOpen={changeStatusModal.toggle}
            close={() =>
              setChangeStatusModal({
                task: null,
                toggle: false,
                currentOption: null,
              })
            }
          />
        )}
      </Fragment>
    );
  }
);

TaskDetails.displayName = 'TaskDetails';

export default TaskDetails;
