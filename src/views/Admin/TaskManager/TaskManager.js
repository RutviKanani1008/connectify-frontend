// ** React Imports
import { Fragment, useEffect, useRef, useState } from 'react';

// ** external packages
import _ from 'lodash';

// ** Todo App Components
import Sidebar from './components/Sidebar';

// ** Styles
import '@styles/react/apps/app-todo.scss';

// ** Apis
import { useGetCompanyUsers } from './service/userApis';
import {
  // useGetTaskByIdAPI,
  useGetTasksAPI,
  useGetTasksOptionCount,
} from './service/task.services';
import {
  useDeleteTaskOption,
  useGetTaskOptions,
} from './service/taskOption.services';

//  ** redux
import { useDispatch, useSelector } from 'react-redux';
import { userData } from '../../../redux/user';

// ** others
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { logger } from '../../../utility/Utils';
import {
  useCreateTaskNotifyUsers,
  useDeleteReadTasks,
} from './service/taskNotifyUsers.services';
import { getGroupDetails, getGroups } from '../../../api/groups';
import { useSetGroupRelatedValue } from './hooks/useGroupDetailsHelper';
import { TaskHeader } from './components/TaskHeader';
import TaskDetails from './components/TaskDetails';
import CategorizeTasks from './components/CategorizeTask';
import { TaskOptionDeleteModal } from './components/TaskOptionDeleteModal';
import TaskOptionModal from './components/TaskOptionModal';
import useHandleSideBar from './hooks/useHelper';
import { useUpdateUserPreference } from '../services/preference.services';
import { Input, Nav, NavItem, NavLink, UncontrolledTooltip } from 'reactstrap';
import classNames from 'classnames';
import { TaskCalenderView } from './components/TaskCalendarView';
import { decrypt } from '../../../helper/common.helper';
import { useHistory } from 'react-router-dom';
import { TaskKanbanView } from './components/Kanbanview/TaskKanbanView';
import {
  getTaskManagerMenuCollapsed,
  handleTaskManagerMenuCollapsed,
} from '../../../redux/common';
import useIsMobile from '../../../hooks/useIsMobile';
import { getInitialFilters } from './helper';

export const AVAILABLE_TASK_MANAGER_VIEW = {
  normalView: { label: 'Task View', value: 'normal_view' },
  calenderView: { label: 'Calendar View', value: 'calender_view' },
  kanbanView: { label: 'Kanban View', value: 'kanban_view' },
};

export const AVAILABLE_KANBAN_VIEW = {
  category: 'category',
  status: 'status',
  priority: 'priority',
};

const TaskManager = ({
  initialContactData = false,
  initialUserData = false,
}) => {
  // ** Vars **
  const initialFilters = getInitialFilters({
    initialContactData,
    initialUserData,
  });
  const searchValue = new URLSearchParams(location.search);
  const searchTaskId = decrypt(searchValue.get('task') || '');

  // ** Redux **
  const dispatch = useDispatch();
  const user = useSelector(userData);
  const collapse = useSelector(getTaskManagerMenuCollapsed);

  // ** Hooks **
  const history = useHistory();

  // ** States
  const taskDetailRef = useRef(null);
  const [mainSidebar, setMainSidebar] = useState(false);
  const [show, setShow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentSelectCategory, setCurrentSelectCategory] = useState([]);
  const [currentFilter, setCurrentFilter] = useState(initialFilters);
  const [updateTask, setUpdateTask] = useState(false);
  const [isPersistFilterAlreadySet, setIsPersistFilterAlreadySet] =
    useState(false);
  const currentFilterRef = useRef(currentFilter);
  currentFilterRef.current = currentFilter;

  const [currentTaskPaginationMain, setCurrentTaskPaginationMain] = useState({
    page: 1,
    loadMore: true,
    pagination: null,
    refreshPage: 0,
  });

  const [expandAll, setExpandAll] = useState(false);
  const [isExpandingAll, setIsExpandingAll] = useState(false);
  const [currentTasks, setCurrentTasks] = useState([]);

  const [isSubTask, setIsSubTask] = useState(false);

  // ** Options **
  const [taskOptions, setTaskOptions] = useState([]);
  const [usersOptions, setUserOptions] = useState({ data: [], loading: true });
  const [groupsOptions, setGroupsOptions] = useState({
    data: [],
    loading: true,
  });
  const [categoryQuickAdd, setCategoryQuickAdd] = useState(null);
  const [showFirstCategory, setShowFirstCategory] = useState(null);

  const unAssignFilter = {
    id: 'UnassignedItem',
    value: 'Unassigned',
    label: 'Unassigned',
  };
  const [relatedGroupOptions, setRelatedGroupsOptions] = useState({
    status: [unAssignFilter],
    category: [unAssignFilter],
    tags: [unAssignFilter],
    pipeline: [unAssignFilter],
  });
  const [showTaskOptionModal, setShowTaskOptionModal] = useState(false);
  const [taskExistModal, setTaskExistModal] = useState(false);
  const [existingTasks, setExistingTasks] = useState([]);
  const [selectedOption, setSelectedOption] = useState({
    optionType: null,
    updated: null,
  });
  const [currentSelection, setCurrentSelection] = useState(false);
  const [totalSnoozedTasks, setTotalSnoozedTasks] = useState(0);
  const { getTaskOptionCount } = useGetTasksOptionCount();
  const [availableTaskOptionCounts, setAvailableTaskOptionCounts] = useState(
    {}
  );

  const [open, setOpen] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState([]);
  const [clearTasksData, setClearTasksData] = useState(false);
  const [unreadTaskIds, setUnreadTaskIds] = useState([]);
  const taskOptionCountController = useRef(null);

  // ** Custom Hooks **
  const { updateUserPreference } = useUpdateUserPreference();
  const isMobile = useIsMobile();
  const { getCompanyUsers } = useGetCompanyUsers();
  const { deleteTaskOption } = useDeleteTaskOption();
  const { getTasks: getTasksAPI, isLoading: taskLoading } = useGetTasksAPI();
  // const { getTaskByIdAPI } = useGetTaskByIdAPI();
  const { getTaskOptions, isLoading: taskOptionLoading } = useGetTaskOptions();
  const { removeReadTasks } = useDeleteReadTasks();
  const { notifyUsers } = useCreateTaskNotifyUsers();
  const { handleSidebar } = useHandleSideBar({
    setCurrentFilter,
    initialContactData,
    initialUserData,
  });
  const { setGroupRelatedValue } = useSetGroupRelatedValue({
    setFilterValue: setRelatedGroupsOptions,
    filterValue: relatedGroupOptions,
    showUnassigned: false,
  });

  useEffect(() => {
    if (open.length === 0) {
      setExpandAll(false);
    }
  }, [open.length]);

  useEffect(() => {
    if (!isMounted) return;
    if (!initialContactData && !initialUserData) {
      localStorage.setItem(
        'currentTaskFilters',
        JSON.stringify({ ...currentFilter, currentSelectCategory })
      );
    }
  }, [currentFilter, currentSelectCategory]);

  useEffect(() => {
    getTaskOptionsFunc();
    getUsersFunc();
    getGroupFunc();
    setIsMounted(true);
    if (!initialContactData && !initialUserData) {
      setPersistFilterFunc();
    } else {
      setIsPersistFilterAlreadySet(true);
    }
  }, []);

  useEffect(() => {
    if (currentFilter.group && currentFilter.group !== 'Unassigned') {
      handleGroupChange(currentFilter.group);
    }
  }, [currentFilter.group]);

  useEffect(() => {
    addNotificationBadge();
  }, [unreadTaskIds, currentTasks.length]);

  useEffect(() => {
    if (currentSelectCategory.length) {
      getTasksOptionCounts();
    } else {
      setAvailableTaskOptionCounts({});
    }
  }, [
    currentSelectCategory,
    currentFilter.search,
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
    currentFilter.tags,
    currentFilter.pipeline,
    currentFilter.pipelineStage,
  ]);

  useEffect(() => {
    if (!updateTask && searchTaskId) {
      getCurrentEditTask();
    }
  }, [searchTaskId]);

  useEffect(() => {
    if (isMobile) {
      setCurrentFilter({
        ...currentFilter,
        currentView: AVAILABLE_TASK_MANAGER_VIEW['normalView'].value,
        startDate: null,
        endDate: null,
      });
    }
  }, [isMobile]);

  const handleGroupChange = (value) => {
    getGroupDetails(value).then((res) => {
      if (res.data.data) {
        setGroupRelatedValue(res.data.data);
      }
    });
  };

  const handleMainSidebar = () => {
    if (isMobile && !mainSidebar) {
      document.body.classList.add('taskManager-menu-open');
    } else if (isMobile && mainSidebar) {
      document.body.classList.remove('taskManager-menu-open');
    }
    setMainSidebar(!mainSidebar);
  };

  const getTasksOptionCounts = async () => {
    if (taskOptionCountController.current) {
      taskOptionCountController.current?.abort();
    }

    taskOptionCountController.current = new AbortController();

    const tempFilter = JSON.parse(JSON.stringify(currentFilter));

    const category = currentSelectCategory.map((c) => c._id);
    tempFilter.category = category;

    const { data, error } = await getTaskOptionCount(
      tempFilter,
      taskOptionCountController.current.signal
    );
    if (!error) {
      const obj = {};
      data.forEach((individualRecord) => {
        obj[
          individualRecord?._id === null ? 'unassigned' : individualRecord?._id
        ] = individualRecord.totalTask;
      });
      setAvailableTaskOptionCounts(obj);
    }
  };

  const addNotificationBadge = () => {
    if (unreadTaskIds.length) checkUnreadTaskExist();
  };

  const setCollapse = async (state) => {
    dispatch(handleTaskManagerMenuCollapsed(state));
    await updateUserPreference(user._id, {
      taskManagerSidebarCollapsed: state,
    });
  };

  const getTaskOptionsFunc = async () => {
    const { data, error } = await getTaskOptions({
      company: user?.company?._id,
    });
    if (!error && _.isArray(data)) {
      const taskOption = [
        {
          _id: 'unassigned',
          label: 'Unassigned',
          value: null,
          type: 'category',
          color: '#a3db59',
          showFirst: true,
        },
        {
          _id: 'unassigned',
          label: 'Unassigned',
          value: null,
          type: 'status',
          color: '#a3db59',
          showFirst: true,
        },
        {
          _id: 'unassigned',
          label: 'Unassigned',
          value: null,
          type: 'priority',
          color: '#a3db59',
          showFirst: true,
        },
        ...data,
      ];
      setTaskOptions(
        taskOption.map((option) => ({ ...option, value: option._id }))
      );
    }
  };

  const getUsersFunc = async () => {
    try {
      const companyId = user?.company._id;
      const { data, error } = await getCompanyUsers(companyId, {
        select: 'firstName,lastName,userProfile',
      });

      if (!error && data && _.isArray(data)) {
        const tempUserOptions = data.map(
          ({ _id: value, firstName, lastName, userProfile }) => {
            return {
              label: `${firstName ?? ''} ${lastName ?? ''} ${
                value === user?._id ? '(Me)' : ''
              }`,
              value,
              firstName,
              lastName,
              profile:
                userProfile && userProfile !== 'false' ? userProfile : null,
            };
          }
        );
        setUserOptions({ data: tempUserOptions, loading: false });
      }
    } catch (error) {
      setUserOptions({ data: [], loading: false });
      logger(error);
    }
  };

  const getGroupFunc = async () => {
    try {
      const companyId = user?.company._id;
      const { data, error } = await getGroups({ company: companyId });

      if (!error && data?.data && _.isArray(data?.data)) {
        const tempUserOptions = data?.data?.map(
          ({ _id: value, groupName, groupCode }) => {
            return {
              label: groupName,
              value,
              groupName,
              groupCode,
            };
          }
        );
        setGroupsOptions({
          data: [unAssignFilter, ...tempUserOptions],
          loading: false,
        });
      }
    } catch (error) {
      setGroupsOptions({ data: [], loading: false });
      logger(error);
    }
  };

  const setPersistFilterFunc = () => {
    const filters = JSON.parse(localStorage.getItem('currentTaskFilters'));

    if (filters) {
      if (filters?.currentSelectCategory?.length) {
        setCurrentSelectCategory(filters.currentSelectCategory);
      }
      delete filters?.currentSelectCategory;
      if (!filters?.currentView) {
        filters.currentView = AVAILABLE_TASK_MANAGER_VIEW.normalView.value;
      }

      if (filters) setCurrentFilter(filters);
    }
    setIsPersistFilterAlreadySet(true);
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

  const handleTaskOptions = (option, optionType) => {
    setSelectedOption({ optionType, updated: option });
    setShowTaskOptionModal(true);
  };

  const handleOptionDelete = async (selectedOption) => {
    const isTaskExist = currentTasks.filter(
      (task) => task[selectedOption?.type] === selectedOption._id
    );

    setCurrentSelection(selectedOption);
    const { data, error } = await getTasksAPI({
      [selectedOption?.type]: selectedOption._id,
      select:
        'name,details,startDate,endDate,priority,status,category,parent_task,trash,completed,createdBy,createdAt,taskNumber,snoozeUntil,hideSnoozeTask',
      populate: JSON.stringify([{ path: 'status' }, { path: 'priority' }]),
    });

    if (
      (isTaskExist.length ||
        (_.isArray(data?.tasks) && data?.tasks?.length > 0)) &&
      !error
    ) {
      setTaskExistModal(true);
      setExistingTasks(data.tasks);
    } else {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: `Are you sure you would like to delete this ${
          selectedOption?.type === 'status'
            ? 'status'
            : selectedOption?.type === 'priority'
            ? 'priority'
            : 'category'
        }?`,
      });

      if (result.value) {
        const obj = { type: selectedOption?.type };
        const { error } = await deleteTaskOption(
          selectedOption?._id,
          obj,
          selectedOption?.type === 'status'
            ? 'Deleting status...'
            : selectedOption?.type === 'priority'
            ? 'Deleting priority...'
            : 'Deleting category...'
        );
        if (!error) {
          let tempTaskOptions = [...taskOptions];
          tempTaskOptions = tempTaskOptions.filter(
            (option) => option._id !== selectedOption._id
          );
          if (
            selectedOption.type === 'category' &&
            currentSelectCategory.length
          ) {
            let tempCategory = JSON.parse(
              JSON.stringify(currentSelectCategory)
            );
            tempCategory = tempCategory.filter(
              (option) => option._id !== selectedOption._id
            );
            if (tempCategory.length === 1) {
              handleSidebar({ open: true });
            }
            setCurrentSelectCategory(tempCategory);
          }
          setTaskOptions([...tempTaskOptions]);
        }
      }
      setCurrentSelection(false);
    }
  };

  const clearTaskData = () => {
    setClearTasksData(Math.random());
  };

  const handleClearOptions = () => {
    setSelectedOption({ optionType: null, updated: null });
    setShowTaskOptionModal(false);
  };

  const clearTaskExistModal = (isAnyUpdate = false) => {
    if (isAnyUpdate) {
      let tempTaskOptions = [...taskOptions];
      tempTaskOptions = tempTaskOptions.filter(
        (option) => option._id !== currentSelection?._id
      );
      setTaskOptions([...tempTaskOptions]);
      setCurrentTaskPaginationMain({
        page: 1,
        loadMore: true,
        pagination: null,
        refreshPage: Math.random(),
      });
    }
    setTaskExistModal(false);
    setCurrentSelection(false);
    setExistingTasks([]);
  };

  const notifyUserForNewTask = async ({ id: taskId, assigned }) => {
    const { data, error } = await getCompanyUsers(user?.company._id, {
      select: 'firstName,lastName,role',
      role: 'admin',
    });
    if (!error && data) {
      const notifyUsersList = data
        .map((d) => d._id)
        .filter((id) => id !== user?._id);

      if (assigned && _.isArray(assigned)) {
        assigned.forEach((a) => {
          if (!notifyUsersList.includes(a._id)) {
            notifyUsersList.push(a._id);
          }
        });
      }
      const notifyUsersIds = notifyUsersList.filter((n) => n._id !== user?._id);
      if (notifyUsersIds?.length) {
        await notifyUsers({ taskId, userIds: notifyUsersIds });
      }
    }
  };

  const handleQuickAdd = (open) => {
    if (currentSelectCategory.length) {
      if (open) {
        setCategoryQuickAdd(Math.random());
      }
    } else {
      taskDetailRef?.current?.handleQuickAdd(open);
    }
  };

  const handleSetShowTaskModal = () => {
    if (currentSelectCategory.length) {
      setShowFirstCategory(Math.random());
    }
    setShow(true);
  };

  const getCurrentEditTask = async () => {
    // if (!searchTaskId || !decrypt(searchTaskId)) {
    //   const url = new URL(window.location);
    //   url.searchParams.delete('task');
    //   url.searchParams.delete('update');
    //   return window.history.pushState({}, '', url);
    // }

    // const taskId = decrypt(searchTaskId);

    // HELLO-CHECK
    if (!updateTask) {
      // const { data, error } = await getTaskByIdAPI(taskId, {
      //   params: {
      //     company: user?.company?._id,
      //     select:
      //       'name,details,startDate,endDate,priority,status,category,parent_task,trash,completed,contact,assigned,createdBy,createdAt,taskNumber,snoozeUntil,hideSnoozeTask',
      //   },
      // });
      // if (!error && data && _.isObject(data)) {
      const filters = JSON.parse(localStorage.getItem('currentTaskFilters'));
      if (filters?.currentSelectCategory?.length) {
        setShowFirstCategory(Math.random);
      }
      setShow(true);
      setUpdateTask({ _id: searchTaskId });
      // if (data.parent_task) setIsSubTask(data.parent_task);
      // }
    }
  };

  const handleClearAddUpdateTask = () => {
    const url = new URL(window.location);
    url.searchParams.delete('task');
    url.searchParams.delete('update');
    history.push({
      pathname: history?.location?.pathname,
      search: url.searchParams.toString(),
    });
    setShow(false);
    setUpdateTask(false);
    setIsSubTask(false);
  };

  const isAllCategoriesSelected = () => {
    return (
      currentSelectCategory?.length &&
      taskOptions?.filter((option) => option.type === 'category')?.length ===
        currentSelectCategory?.length
    );
  };

  const renderView = (view) => {
    switch (view) {
      case AVAILABLE_TASK_MANAGER_VIEW.normalView.value: {
        return (
          <>
            {currentSelectCategory.length ? (
              <CategorizeTasks
                availableTaskOptionCounts={availableTaskOptionCounts}
                setAvailableTaskOptionCounts={setAvailableTaskOptionCounts}
                currentTaskPaginationMain={currentTaskPaginationMain}
                initialContactData={initialContactData}
                initialUserData={initialUserData}
                categoryOpen={categoryOpen}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
                expandAll={expandAll}
                setExpandAll={setExpandAll}
                setIsExpandingAll={setIsExpandingAll}
                setOpen={setOpen}
                open={open}
                isMounted={isMounted}
                usersOptions={usersOptions}
                taskOptionLoading={taskOptionLoading}
                taskOptions={taskOptions}
                setTaskOptions={setTaskOptions}
                setIsSubTask={setIsSubTask}
                isSubTask={isSubTask}
                show={show}
                setShow={setShow}
                notifyUserForNewTask={notifyUserForNewTask}
                setCategoryOpen={setCategoryOpen}
                currentSelectCategory={currentSelectCategory}
                clearTasksData={clearTasksData}
                categoryQuickAdd={categoryQuickAdd}
                showFirstCategory={showFirstCategory}
                updateTask={updateTask}
                setUpdateTask={setUpdateTask}
                handleClearAddUpdateTask={handleClearAddUpdateTask}
                setCurrentTaskPaginationMain={setCurrentTaskPaginationMain}
                isPersistFilterAlreadySet={isPersistFilterAlreadySet}
                setTotalSnoozedTasks={setTotalSnoozedTasks}
              />
            ) : (
              <TaskDetails
                ref={taskDetailRef}
                currentTaskPaginationMain={currentTaskPaginationMain}
                setCurrentTaskPaginationMain={setCurrentTaskPaginationMain}
                initialContactData={initialContactData}
                initialUserData={initialUserData}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
                expandAll={expandAll}
                setExpandAll={setExpandAll}
                setIsExpandingAll={setIsExpandingAll}
                setOpen={setOpen}
                open={open}
                isMounted={isMounted}
                usersOptions={usersOptions}
                taskOptionLoading={taskOptionLoading}
                taskOptions={taskOptions}
                setTaskOptions={setTaskOptions}
                setIsSubTask={setIsSubTask}
                isSubTask={isSubTask}
                show={show}
                setShow={setShow}
                notifyUserForNewTask={notifyUserForNewTask}
                clearTasksData={clearTasksData}
                setTotalSnoozedTasks={setTotalSnoozedTasks}
                updateTask={updateTask}
                setUpdateTask={setUpdateTask}
                handleClearAddUpdateTask={handleClearAddUpdateTask}
                isPersistFilterAlreadySet={isPersistFilterAlreadySet}
              />
            )}
          </>
        );
      }
      case AVAILABLE_TASK_MANAGER_VIEW.calenderView.value: {
        return (
          <>
            <div className='task-calenderView-wrapper'>
              <div className='full-calender-wrapper'>
                <TaskCalenderView
                  isMounted={isMounted}
                  showTaskModal={show}
                  setShowTaskModal={setShow}
                  currentFilter={{
                    ...currentFilter,
                    category: currentSelectCategory.length
                      ? currentSelectCategory?.map((category) => category?._id)
                      : [],
                  }}
                  updateTask={updateTask}
                  setUpdateTask={setUpdateTask}
                  handleClearAddUpdateTask={handleClearAddUpdateTask}
                  setCurrentFilter={setCurrentFilter}
                />
              </div>
            </div>
          </>
        );
      }
      case AVAILABLE_TASK_MANAGER_VIEW.kanbanView.value: {
        return (
          <TaskKanbanView
            taskOptionLoading={taskOptionLoading}
            showTaskModal={show}
            taskOptions={taskOptions}
            setTaskOptions={setTaskOptions}
            currentFilter={currentFilter}
            handleTaskOptions={handleTaskOptions}
            handleOptionDelete={handleOptionDelete}
            setUpdateTask={setUpdateTask}
            setShowTaskModal={setShow}
            handleClearAddUpdateTask={handleClearAddUpdateTask}
            updateTask={updateTask}
            setIsSubTask={setIsSubTask}
            isSubTask={isSubTask}
            setTotalSnoozedTasks={setTotalSnoozedTasks}
          />
        );
      }
      default: {
        return <></>;
      }
    }
  };

  return (
    <Fragment>
      <div className='loyal-task-manager'>
        <Sidebar
          setCurrentTaskPagination={setCurrentTaskPaginationMain}
          clearTaskData={clearTaskData}
          currentSelection={currentSelection}
          taskLoading={taskLoading}
          mainSidebar={mainSidebar}
          handleMainSidebar={handleMainSidebar}
          handleSetShowTaskModal={handleSetShowTaskModal}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
          taskOptions={taskOptions}
          handleTaskOptions={handleTaskOptions}
          handleOptionDelete={handleOptionDelete}
          setTaskOptions={setTaskOptions}
          initialContactData={initialContactData}
          initialUserData={initialUserData}
          setCollapse={setCollapse}
          collapse={collapse}
          currentSelectCategory={currentSelectCategory}
          setCurrentSelectCategory={setCurrentSelectCategory}
          categoryOpen={categoryOpen}
          setCategoryOpen={setCategoryOpen}
          setExpandAll={setExpandAll}
          handleQuickAdd={handleQuickAdd}
          totalSnoozedTasks={totalSnoozedTasks}
        />
        <div
          className={`content-right ${collapse ? 'taskSideBarCollapse' : ''}`}
        >
          <div className='new-tab-details-design'>
            <div className='horizontal-new-tab-wrapper'>
              <Nav
                className='horizontal-tabbing hide-scrollbar nav nav-tabs'
                tabs
              >
                {Object.keys(AVAILABLE_TASK_MANAGER_VIEW).map(
                  (taskView, index) => {
                    return (
                      <NavItem key={index}>
                        <NavLink
                          className={classNames({
                            active:
                              currentFilter.currentView ===
                              AVAILABLE_TASK_MANAGER_VIEW[taskView].value,
                          })}
                          onClick={() => {
                            setCurrentFilter({
                              ...currentFilter,
                              ...(AVAILABLE_TASK_MANAGER_VIEW[taskView]
                                .value !==
                                AVAILABLE_TASK_MANAGER_VIEW.calenderView
                                  .value && {
                                startDate: null,
                                endDate: null,
                              }),
                              currentView:
                                AVAILABLE_TASK_MANAGER_VIEW[taskView].value,
                              status: [],
                              category: [],
                              tempCategory: [],
                              priority: [],
                              currentKanbanView: AVAILABLE_KANBAN_VIEW.category,
                            });
                          }}
                        >
                          {AVAILABLE_TASK_MANAGER_VIEW[taskView].label}
                        </NavLink>
                      </NavItem>
                    );
                  }
                )}
              </Nav>
            </div>
            <div className='right__wrapper__OP'>
              <div
                className='searchInSubtask-input-wrapper show__categories'
                id='show_categories_rows'
              >
                <div className='category-inner-wrapper'>
                  <Input
                    checked={isAllCategoriesSelected()}
                    type='checkbox'
                    key={isAllCategoriesSelected()}
                    onChange={() => {
                      if (isAllCategoriesSelected()) {
                        setCurrentSelectCategory([]);
                        handleSidebar({
                          ...currentFilter,
                          category: [],
                        });
                      } else {
                        setCurrentSelectCategory(
                          taskOptions?.filter(
                            (option) => option.type === 'category'
                          )
                        );
                        handleSidebar({
                          ...currentFilter,
                          category: taskOptions
                            ?.filter((option) => option.type === 'category')
                            .map((option) => option._id),
                        });
                        const firstCategory = taskOptions
                          ?.filter((option) => option.type === 'category')
                          ?.map((option) => option._id)?.[0];
                        setCategoryOpen([firstCategory]);
                      }
                    }}
                  />
                  <span className='text'>Show Categories Rows</span>
                </div>
              </div>
              <UncontrolledTooltip
                placement='top'
                target='show_categories_rows'
              >
                Show Categories Rows
              </UncontrolledTooltip>
            </div>
          </div>
          <TaskHeader
            setCurrentTaskPaginationMain={setCurrentTaskPaginationMain}
            setOpen={setOpen}
            open={open}
            initialFilters={initialFilters}
            currentFilter={currentFilter}
            usersOptions={usersOptions}
            setCurrentFilter={setCurrentFilter}
            initialContactData={initialContactData}
            initialUserData={initialUserData}
            setExpandAll={setExpandAll}
            isExpandingAll={isExpandingAll}
            setIsExpandingAll={setIsExpandingAll}
            handleMainSidebar={handleMainSidebar}
            relatedGroupOptions={relatedGroupOptions}
            groupsOptions={groupsOptions}
            handleQuickAdd={handleQuickAdd}
            taskOptions={taskOptions}
            currentSelectCategory={currentSelectCategory}
            setCurrentSelectCategory={setCurrentSelectCategory}
            setCategoryOpen={setCategoryOpen}
          />
          {renderView(currentFilter.currentView)}
        </div>
      </div>

      {showTaskOptionModal && (
        <TaskOptionModal
          setShowTaskOptionModal={setShowTaskOptionModal}
          openTaskSidebar={showTaskOptionModal}
          selectedOption={selectedOption}
          handleClearOptions={handleClearOptions}
          setTaskOptions={setTaskOptions}
          taskOptions={taskOptions}
          currentSelectCategory={currentSelectCategory}
          setCurrentSelectCategory={setCurrentSelectCategory}
        />
      )}
      {taskExistModal && (
        <TaskOptionDeleteModal
          taskExistModal={taskExistModal}
          existingTasks={existingTasks}
          clearTaskExistModal={clearTaskExistModal}
          currentSelection={currentSelection}
          taskOptions={
            currentSelection && currentSelection.type
              ? taskOptions.filter(
                  (t) =>
                    t.type === currentSelection.type &&
                    String(t._id) !== String(currentSelection._id)
                )
              : taskOptions
          }
        />
      )}
    </Fragment>
  );
};

export default TaskManager;
