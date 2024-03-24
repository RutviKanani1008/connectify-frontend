// ** Reactstrap Imports
import { useEffect, useRef, useState } from 'react';
import UILoader from '@components/ui-loader';
import {
  Badge,
  Button,
  Form,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  TabContent,
  TabPane,
  UncontrolledTooltip,
} from 'reactstrap';
// ** external packages **
import _ from 'lodash';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import {
  useAutoSaveTaskDetails,
  useCreateBulkTaskWithContact,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
} from '../../service/task.services';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../../configs/validationConstant';
import { NotificationType } from '../../../../../constant';
import moment from 'moment';
import useTaskScheduler from '../../hooks/useTaskScheduler';
import ModalSubtasks from './../ModalSubtasks';
import { Clock, Eye, Trash, User } from 'react-feather';
import '@styles/react/apps/app-todo.scss';
import ModalUpdates from './../ModalUpdates';
import { useCheckUnreadStatus } from '../../service/taskNotifyUsers.services';
import { useTaskTimer } from '../../hooks/useTaskTimer';
import TimerNoteModal from './../TimerNoteModal';
import ShowTimerHistory from './../ShowTimerHistory';
import { userData } from '../../../../../redux/user';
import { useSelector } from 'react-redux';
import ShowTaskStartedModal from './../ShowTaskStartedModal';
import { SaveButton } from '../../../../../@core/components/save-button';
import CloneTaskModal from '../Modals/CloneTask';
import TaskTab from './TaskTab';
import { useGetTaskDetailById } from '../../hooks/useTaskService';
import useHandleSideBar from '../../hooks/useHelper';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { useGetCompanyUsers } from '../../service/userApis';
import classNames from 'classnames';
import TaskModalHeader from './ModalHeader';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { useRemoveAttachment } from '../../../../../api/auth';
import Avatar from '../../../../../@core/components/avatar';

export const taskScheme = yup.object().shape({
  name: yup.string().required(required('Task Name')),
  checklist: yup.array().of(
    yup.object().shape({
      title: yup.string().required('Title Required').nullable(),
    })
  ),
});

const TaskModal = ({
  isModalOpenFromSubtask = false, // This prop is check modal open from subtask
  // modal state
  setShowTaskModal,
  showTaskModal,
  // list of index of task with open sub task according --- check
  open,
  setOpen,
  // dropdown options
  taskOptions,
  setTaskOptions,
  // all task lists
  currentTasks,
  setCurrentTasks = false,
  // sub task lists
  subTasks,
  setSubTasks = false,
  // original editing task
  editTask = {},
  setUpdateTask,
  // parent task details of current edit task
  isSubTask,
  setIsSubTask,
  // current filters
  currentFilter,
  setCurrentFilter,
  currentCategory = false,
  currentCategoryTaskModal = null,
  refreshCategories,
  initialContactData,
  initialUserData,
  // current task list pagination
  currentTaskPagination,
  setCurrentTaskPagination,
  // status and priority related
  changePriorityOrStatusLoading,
  handleUpdateStatusOrPriority,
  currentStatusOrPriorityChangingIds,
  setCurrentStatusOrPriorityChangingIds,
  // reset task related state
  handleClearAddUpdateTask,
  // others
  notifyUserForNewTask,
  // Populate fields from Email
  currentMailDetail = {},
  isMultipleTasks = false,
  selectedRowsFilters = [],
  kanabanViewAddTaskDetails = null,
  totalTaskDuration = 0,
}) => {
  const user = useSelector(userData);
  const [currentTab, setCurrentTab] = useState('tasks');

  /** Refs */
  const taskTabRef = useRef(null);

  /** Clone Task */
  const [showCloneModal, setShowCloneModal] = useState(false);

  /** Remove Attachment */
  const [removeAttachments, setRemoveAttachments] = useState([]);

  /** Form */
  const form = useForm({
    resolver: yupResolver(taskScheme),
    defaultValues: { assigned: [] },
  });
  const {
    control,
    watch,
    getValues,
    setValue,
    clearErrors,
    handleSubmit,
    formState,
    setError,
    reset,
  } = form;
  const { errors } = formState;
  /** Editor */
  const [currentNote, setCurrentNote] = useState('');

  /** Attachment */
  const [attachmentFileUrl, setAttachmentFileUrl] = useState([]);
  const { removeAttachment } = useRemoveAttachment();

  /** Task Schedule */
  const [startDateEndDateState, setStartDateEndDateState] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 10 * 60000),
  });
  const [scheduleData, setScheduleData] = useState({
    schedule: { value: 'never', label: 'One Time' },
    repeatEveryCount: 1,
    selectedDays: [Number(moment(new Date()).format('d'))],
    endType: { value: 'until', label: 'Until' },
    untilDate: moment(new Date()).endOf('day').toDate(),
    occurrences: 1,
  });
  const taskSchedulerState = useTaskScheduler({
    setScheduleData,
    scheduleData,
    setStartDateEndDateState,
    startDateEndDateState,
  });
  const { autoSaveTaskDetails, isLoading: autoSavingTask } =
    useAutoSaveTaskDetails();
  /** Checklist */
  const [showChecklist, setShowChecklist] = useState(false);

  /** Timer */
  const timerState = useTaskTimer({ editTask });
  const {
    currentTime,
    timerDetails,
    getLatestTaskTimer,
    showTimerNoteModal,
    handleCloseNoteModal,
    showTaskStartWarningModal,
    currentStartedTask,
    handleCloseTaskStartWarningModal,
    timerExistsDetails,
    updateTimerLoading,
    startTimer,
    stopTimer,
    pauseTimer,
    startPausedTimer,
    createTaskTimerLoading,
    handleResetTimerDetails,
  } = timerState;
  const [showTimerHistoryModal, setShowTimerHistoryModal] = useState(false);
  const [subtaskLength, setSubTaskLength] = useState(0);
  const [completedTaskInstruction, setCompletedTaskInstruction] = useState('');
  const [controller, setController] = useState(null);

  /** API Hooks */
  const { deleteTask } = useDeleteTask();
  const { getTaskDetailById, isLoading, formRenderKey, taskData } =
    useGetTaskDetailById({
      setAttachmentFileUrl,
      setStartDateEndDateState,
      reset,
      setCurrentNote,
      setShowChecklist,
      setUpdateTask,
      setIsSubTask,
      setScheduleData,
      setCompletedTaskInstruction,
      // HELLO
      // showTaskModal,
      setController,
      controller,
    });
  const { updateTask: updateTaskDetail, isLoading: updateTaskLoading } =
    useUpdateTask();
  const { getCompanyUsers, isLoading: userLoading } = useGetCompanyUsers();
  const { createTask, isLoading: createTaskLoading } = useCreateTask();
  const { checkUnreadStatus } = useCheckUnreadStatus();
  const { createBulkTaskWithContact, isLoading: createMultipleTaskLoading } =
    useCreateBulkTaskWithContact();
  /** Loading States */
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

  /** Other States */
  const [availableUsers, setAvailableUsers] = useState([]);
  const [mentionUsers, setMentionUsers] = useState([]);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);

  /** Sidebar Filters */
  const { handleSidebar } = useHandleSideBar({
    setCurrentFilter,
    initialContactData,
    initialUserData,
  });

  useEffect(() => {
    if (!editTask?._id) setCurrentNote('');
  }, [showTaskModal]);

  /** Get Task Details */
  useEffect(() => {
    if (editTask?._id) {
      reset({});
      getTaskDetailById(editTask?._id);
      getLatestTaskTimer(editTask?._id);
    }
  }, [editTask?._id]);

  /** Initial Rendering */
  useEffect(() => {
    getUsers();
    getCheckNewUpdates();
  }, []);

  useEffect(() => {
    // Here populate the email fields
    currentMailDetail?.subject && setValue('name', currentMailDetail.subject);
    currentMailDetail?.body && setCurrentNote(currentMailDetail.body);
    currentMailDetail?.contact &&
      setValue('contact', currentMailDetail.contact);
    currentMailDetail?.attachments &&
      setAttachmentFileUrl(currentMailDetail.attachments);
  }, [currentMailDetail]);

  useEffect(() => {
    const searchValue = new URLSearchParams(location.search);
    const isUpdate = searchValue.get('update');
    if (isUpdate === 'true') {
      setCurrentTab('updates');
    }
  }, []);

  /** set initial value of form dropdown - priority and status */
  useEffect(() => {
    const priority = taskOptions?.filter((o) => o.type === 'priority')?.[0];
    const status = taskOptions?.filter((o) => o.type === 'status')?.[0];
    setValue('priority', priority);
    setValue('status', status);
    priority && clearErrors('priority');
    status && clearErrors('status');
  }, [taskOptions]);

  /** set initial contact value */
  useEffect(() => {
    if (initialContactData?._id) {
      setValue('contact', {
        label: `${initialContactData?.firstName ?? ''} ${
          initialContactData?.lastName ?? ''
        } ${initialContactData?._id === user?._id ? '(Me)' : ''}`,
        value: initialContactData?._id,
      });
    }
  }, [initialContactData]);

  useEffect(() => {
    if (initialUserData?._id) {
      setValue('assigned', [
        {
          firstName: `${initialUserData?.firstName ?? ''}`,
          label: `${initialUserData?.firstName ?? ''} ${
            initialUserData?.lastName ?? ''
          } ${initialUserData?._id === user?._id ? '(Me)' : ''}`,
          lastName: `${initialUserData?.lastName ?? ''}`,
          value: initialUserData?._id,
        },
      ]);
    }
  }, [initialUserData]);

  /** set initial contact / assigned value */
  useEffect(() => {
    if (isSubTask) {
      setValue('parent_task', {
        label: isSubTask.name,
        value: isSubTask._id,
        taskNumber: isSubTask.taskNumber,
      });
      const contact = isSubTask?.contact;
      if (contact && contact?._id) {
        setValue('contact', {
          label: `${contact?.firstName ?? ''} ${contact?.lastName ?? ''} ${
            contact?._id === user?._id ? '(Me)' : ''
          }`,
          value: contact?._id,
        });
      }
      const assigned = isSubTask?.assigned;
      if (assigned && assigned._id) {
        setValue('assigned', [
          {
            label: `${assigned?.firstName ?? ''} ${assigned?.lastName ?? ''} ${
              assigned?._id === user?._id ? '(Me)' : ''
            }`,
            value: assigned?._id,
          },
        ]);
      }
    }
  }, [isSubTask]);

  useEffect(() => {
    kanabanViewAddTaskDetails?.status &&
      setValue('status', kanabanViewAddTaskDetails?.status);

    kanabanViewAddTaskDetails?.category &&
      setValue('category', kanabanViewAddTaskDetails?.category);

    kanabanViewAddTaskDetails?.priority &&
      setValue('priority', kanabanViewAddTaskDetails?.priority);
  }, [kanabanViewAddTaskDetails]);

  /** Get Available User */
  const getUsers = async () => {
    const companyId = user?.company._id;
    const { data: userData, error: userError } = await getCompanyUsers(
      companyId,
      { select: 'firstName,lastName,role,userProfile' }
    );
    if (_.isArray(userData) && !userError) {
      setAvailableUsers(getOptions(userData));
      setMentionUsers(userData);
    }
  };

  /** Helper */
  const getOptions = (data) => {
    const tempObj = JSON.parse(JSON.stringify(data));

    const options = [];
    tempObj.map((contact) => {
      options.push({
        label: `${contact?.firstName ?? ''} ${contact?.lastName ?? ''} ${
          contact?._id === user?._id ? '(Me)' : ''
        }`,
        value: contact._id,
        ...(contact?.firstName && { firstName: contact?.firstName }),
        ...(contact?.lastName && { lastName: contact?.lastName }),
        ...(contact?.userProfile && contact?.userProfile !== 'false'
          ? { profile: contact?.userProfile }
          : null),
        ...(contact?.company_name && { companyName: contact?.company_name }),
      });
    });
    return options;
  };

  /** Task Action */
  const handleTaskComplete = async () => {
    const tempCurrentTasks = [...currentTasks];

    const currentEditTask = JSON.parse(JSON.stringify(editTask));

    const result = await showWarnAlert({
      text: !currentEditTask?.completed
        ? 'Are you sure you want to archive this task?'
        : 'Are you sure you want to remove this task from archived list?',
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      currentEditTask.completed = !currentEditTask.completed;
      // initial check and uncheck before api call for better user experience
      setCurrentTasks(
        tempCurrentTasks.map((task) =>
          task._id === currentEditTask._id
            ? { ...task, completed: currentEditTask.completed }
            : { ...task }
        )
      );
      // initial check and uncheck subtask before api call for better user experience
      if (isSubTask && subTasks[isSubTask?._id]?.length) {
        setSubTasks((prev) => ({
          ...prev,
          [isSubTask?._id]: (prev[isSubTask?._id] || []).map((obj) =>
            obj._id === currentEditTask?._id
              ? {
                  ...obj,
                  completed: !obj?.completed,
                }
              : obj
          ),
        }));
      }

      if (currentEditTask.contact) {
        delete currentEditTask.contact;
      }
      if (currentEditTask.assigned) {
        delete currentEditTask.assigned;
      }
      currentEditTask.message = currentEditTask.completed
        ? 'Task archived successfully.'
        : 'Task reopen successfully.';
      const { error } = await updateTaskDetail(
        currentEditTask._id,
        currentEditTask,
        'Loading...'
      );
      if (!error) {
        setUpdateTask({ ...editTask, completed: currentEditTask.completed });
        setValue('completed', currentEditTask.completed);
        setUpdateStatusLoading(false);
      }
      if (isSubTask && currentEditTask.completed) {
        setSubTasks((prev) => ({
          ...prev,
          [isSubTask?._id]: (prev[isSubTask?._id] || [])
            .map((obj) =>
              obj._id === editTask?._id
                ? {
                    ...obj,
                    completed: currentEditTask.completed,
                  }
                : obj
            )
            .filter(
              (obj) =>
                (currentFilter?.open && !obj.completed) ||
                (currentFilter?.completed && obj.completed)
            ),
        }));
        // set task increment count
        setCurrentTasks((prev) => {
          return prev
            .map((obj) =>
              obj._id === isSubTask?._id
                ? {
                    ...obj,
                    sub_tasks: obj?.sub_tasks ? obj.sub_tasks - 1 : 0,
                  }
                : { ...obj }
            )
            .filter(
              (obj) =>
                (currentFilter?.open && !obj.completed) ||
                (currentFilter?.completed && obj.completed)
            );
        });
      } else if (isSubTask && !currentEditTask.completed) {
        setSubTasks((prev) => ({
          ...prev,
          [isSubTask?._id]: [currentEditTask, ...(prev[isSubTask?._id] || [])],
        }));
        // set task increment count
        setCurrentTasks((prev) => {
          return prev
            .map((obj) =>
              obj._id === isSubTask?._id
                ? {
                    ...obj,
                    sub_tasks: obj?.sub_tasks ? obj.sub_tasks + 1 : 1,
                  }
                : { ...obj }
            )
            .filter(
              (obj) =>
                (currentFilter?.open && !obj.completed) ||
                (currentFilter?.completed && obj.completed)
            );
        });
      } else if (currentEditTask.completed) {
        setCurrentTasks((prev) =>
          prev
            .map((obj) =>
              obj._id === editTask?._id
                ? {
                    ...obj,
                    completed: currentEditTask.completed,
                  }
                : obj
            )
            .filter(
              (obj) =>
                (currentFilter?.open && !obj.completed) ||
                (currentFilter?.completed && obj.completed)
            )
        );
      } else {
        setCurrentTasks((prev) => [
          { ...currentEditTask, sub_tasks: subtaskLength },
          ...prev,
        ]);
      }
    }
  };

  const handleTaskDelete = async () => {
    const currentEditTask = JSON.parse(JSON.stringify(editTask));

    const result = await showWarnAlert({
      text: `${
        currentEditTask.trash
          ? 'Are you sure you want to delete this task ?'
          : 'Are you sure you want to move this task to trash ?'
      }`,
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      const { error } = await deleteTask(currentEditTask._id, 'Task deleting');
      if (!error) {
        currentEditTask.trash = !currentEditTask.trash;
        if (currentEditTask.contact) {
          delete currentEditTask.contact;
        }
        if (currentEditTask.assigned) {
          delete currentEditTask.assigned;
        }
        currentEditTask.message = currentEditTask.trash
          ? 'Task Deleted successfully.'
          : 'Task restore successfully.';

        if (isSubTask) {
          setSubTasks((prev) => ({
            ...prev,
            [isSubTask?._id]: (prev[isSubTask?._id] || []).filter(
              (obj) => obj._id !== editTask?._id
            ),
          }));
          // set task increment count when add sub task
          setCurrentTasks((prev) => {
            return prev.map((obj) =>
              obj._id === isSubTask?._id
                ? {
                    ...obj,
                    sub_tasks: obj?.sub_tasks ? obj.sub_tasks - 1 : 0,
                  }
                : { ...obj }
            );
          });
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
          setCurrentTasks((prev) =>
            prev.filter((obj) => obj._id !== editTask?._id)
          );
        }
      }
      reset({});
      innerHandleClearAddUpdateTask();
    }
  };

  const autoSaveTask = async (body) => {
    if (!editTask?._id) return;
    await autoSaveTaskDetails(editTask?._id, body);
  };

  const onSubmit = async (values) => {
    const noteText = currentNote;
    let isItMoveToComplete = false;
    const formValue = JSON.parse(JSON.stringify(values));

    formValue.details = noteText;
    formValue.startDate = startDateEndDateState.startDate;
    formValue.endDate = startDateEndDateState.endDate;

    if (_.isArray(formValue?.assigned)) {
      formValue.assigned = (formValue?.assigned || []).map(
        (assign) => assign?.value
      );
    } else {
      formValue.assigned = [];
    }
    if (formValue?.checklistDetails?.checklist?.length) {
      let isAnyError = false;
      formValue?.checklistDetails?.checklist.forEach((checklist, index) => {
        if (checklist.title === '' || checklist.title === null) {
          setError(
            `checklistDetails.checklist[${index}].title`,
            { type: 'focus', message: `Title is Required.` },
            { shouldFocus: true }
          );
          isAnyError = true;
        }
      });
      if (isAnyError) {
        return;
      }
    }
    formValue.frequency = formValue?.schedule?.value || null;
    formValue.contact = formValue?.contact?.value;

    if (formValue.status?._id) {
      if (formValue.status?.markAsCompleted) {
        if (editTask?.status?.markAsCompleted || editTask?.completed) {
          isItMoveToComplete = false;
        } else {
          isItMoveToComplete = formValue.status?.markAsCompleted || false;
        }
        formValue.completed = true;
      }
      if (formValue.status?._id !== 'unassigned') {
        formValue.status = formValue.status._id;
      } else {
        formValue.status = null;
      }
    }
    if (formValue?.priority?._id) {
      if (formValue.priority?._id !== 'unassigned') {
        formValue.priority = formValue.priority._id;
      } else {
        formValue.priority = null;
      }
    }
    if (formValue?.category?._id) {
      formValue.category =
        formValue.category._id === 'unassigned'
          ? null
          : formValue.category?._id;
    }
    if (formValue?.labels?.length) {
      formValue.labels = formValue.labels.map((tag) => tag?._id);
    } else {
      formValue.labels = [];
    }
    if (formValue?.checklistDetails?.checklistTemplate) {
      formValue.checklistDetails.checklistTemplate =
        formValue.checklistDetails.checklistTemplate?.value === 'add_naw'
          ? null
          : formValue.checklistDetails.checklistTemplate?.value;
    }

    formValue.schedule = { ...scheduleData };
    if (formValue.schedule?.endType?.value) {
      formValue.schedule.endType = formValue.schedule?.endType?.value;
    }
    if (formValue.schedule?.schedule?.value) {
      formValue.schedule.schedule = formValue.schedule?.schedule?.value;
    }

    formValue.order = 0;

    if (formValue?.parent_task?.value) {
      formValue.parent_task = formValue.parent_task.value;
    }

    // ***** AttachId into email if task created from email ****
    if (currentMailDetail?.threadId) {
      formValue.threadId = currentMailDetail?.threadId;
    }

    formValue.removeAttachments = removeAttachments;
    if (!editTask?._id) {
      let res = null;
      if (isItMoveToComplete) {
        const result = await showWarnAlert({
          text: 'Are you sure you want to create this task because task will be move to archived on while creating this status  ?',
          confirmButtonText: 'Yes',
        });
        if (result.value) {
          if (isMultipleTasks) {
            const { error } = await createBulkTaskWithContact(
              {
                taskData: [formValue],
                contactFilters: selectedRowsFilters,
              },
              undefined,
              {
                populate: JSON.stringify([
                  { path: 'assigned' },
                  { path: 'contact' },
                  { path: 'status' },
                  { path: 'priority' },
                ]),
              }
            );
            if (!error) {
              setShowTaskModal(false);
              handleCloseTaskManager();
              innerHandleClearAddUpdateTask();
            }
            return;
          } else {
            res = await createTask([formValue], undefined, {
              populate: JSON.stringify([
                { path: 'assigned' },
                { path: 'contact' },
                { path: 'status' },
                { path: 'priority' },
                { path: 'category' },
              ]),
            });
          }
        } else {
          return;
        }
      } else {
        if (isMultipleTasks) {
          const { error } = await createBulkTaskWithContact(
            {
              taskData: [formValue],
              contactFilters: selectedRowsFilters,
            },
            undefined,
            {
              populate: JSON.stringify([
                { path: 'assigned' },
                { path: 'contact' },
                { path: 'status' },
                { path: 'priority' },
              ]),
            }
          );

          if (!error) {
            setShowTaskModal(false);
            handleCloseTaskManager();
            innerHandleClearAddUpdateTask();
          }
          return;
        } else {
          res = await createTask([formValue], undefined, {
            populate: JSON.stringify([
              { path: 'assigned' },
              { path: 'contact' },
              { path: 'status' },
              { path: 'priority' },
              { path: 'category' },
            ]),
          });
        }
      }
      setRemoveAttachments([]);
      const { error } = res;
      let { data } = res;
      if (data?.length) {
        data.map((task) => {
          if (task?.status?._id) task.status = task.status?._id;
          if (task?.priority?._id) task.priority = task.priority?._id;
          if (task?.category?._id) task.category = task.category?._id;

          if (task?._id) {
            notifyUserForNewTask({
              id: task?._id,
              assigned: task?.assigned,
            });
          }
        });
        if (currentCategory !== false && data.length) {
          data = data.filter((task) => task.category === currentCategory);
        }
      }
      if (!error && _.isArray(data)) {
        innerHandleClearAddUpdateTask(data);
        setShowTaskModal(false);
        handleCloseTaskManager();

        if (currentCategory !== false) {
          refetchCategoryTasks(data?.category);
        }
        taskTabRef.current?.removeAttachmentFile();
        const parentTaskId = formValue.parent_task;

        if (parentTaskId && !isItMoveToComplete && !currentFilter.snoozedTask) {
          setSubTasks((prev) => ({
            ...prev,
            [parentTaskId]: [...data, ...(prev[parentTaskId] || [])],
          }));
          // here set task increment count when add sub task
          setCurrentTasks((prev) => {
            return prev.map((obj) =>
              obj._id === parentTaskId
                ? {
                    ...obj,
                    sub_tasks: obj?.sub_tasks + data.length,
                  }
                : { ...obj }
            );
          });
        } else {
          setOpen([]);
          setCurrentTaskPagination({
            ...currentTaskPagination,
            loadMore:
              currentTaskPagination?.pagination?.total + 1 ===
              currentTasks.length + 1
                ? false
                : true,
            pagination: {
              ...currentTaskPagination?.pagination,
              total: currentTaskPagination?.pagination?.total + 1 || 0,
            },
          });
          if (currentFilter.completed || currentFilter.trash) {
            handleSidebar({ open: true });
          } else {
            if (!isItMoveToComplete && !currentFilter.snoozedTask) {
              if (currentFilter.contact && currentFilter.assigned) {
                if (
                  _.isArray(formValue?.assigned) &&
                  formValue?.assigned?.includes(currentFilter.assigned) &&
                  currentFilter.contact === formValue?.contact
                ) {
                  setCurrentTasks((prev) => [...data, ...prev]);
                }
              } else if (currentFilter.contact && !currentFilter.assigned) {
                if (currentFilter.contact === formValue?.contact) {
                  setCurrentTasks((prev) => [...data, ...prev]);
                }
              } else if (!currentFilter.contact && currentFilter.assigned) {
                if (
                  _.isArray(formValue?.assigned) &&
                  formValue?.assigned?.includes(currentFilter?.assigned)
                ) {
                  setCurrentTasks((prev) => [...data, ...prev]);
                }
              } else {
                setCurrentTasks((prev) => [...data, ...prev]);
              }
            }
          }
        }
        reset({});
      }
    } else if (editTask?._id) {
      let res = null;
      if (isItMoveToComplete) {
        const result = await showWarnAlert({
          text: 'Are you sure you want to update this task because task will be move to archived on moving this status  ?',
          confirmButtonText: 'Yes',
        });
        if (result.value) {
          formValue.completed = true;
          res = await updateTaskDetail(editTask?._id, formValue);
        } else {
          return;
        }
      } else {
        res = await updateTaskDetail(editTask?._id, formValue);
      }
      const { error, data } = res;

      if (!error && data) {
        taskTabRef.current?.removeAttachmentFile();
        setShowTaskModal(false);
        handleCloseTaskManager();

        if (currentCategory !== false) {
          refetchCategoryTasks(data?.category);
        }

        if (isSubTask) {
          if (!formValue.parent_task) {
            setSubTasks((prev) => ({
              ...prev,
              [isSubTask?._id]: (prev[isSubTask?._id] || [])
                .filter((obj) => obj._id !== editTask?._id)
                .filter(
                  (obj) =>
                    (currentFilter?.open && !obj.completed) ||
                    (currentFilter?.completed && obj.completed)
                ),
            }));
            setCurrentTasks((prev) => {
              return [...prev, data].map((obj) =>
                obj._id === isSubTask?._id
                  ? {
                      ...obj,
                      sub_tasks: obj?.sub_tasks - 1,
                    }
                  : { ...obj }
              );
            });
          } else {
            if (formValue.parent_task === isSubTask?._id) {
              setSubTasks((prev) => ({
                ...prev,
                [isSubTask?._id]: (prev[isSubTask?._id] || [])
                  .map((obj) =>
                    obj._id === editTask?._id
                      ? { ...data, pinned: obj?.pinned || false }
                      : obj
                  )
                  .filter(
                    (obj) =>
                      (currentFilter?.open && !obj.completed) ||
                      (currentFilter?.completed && obj.completed)
                  ),
              }));
              setCurrentTasks((prev) => {
                return prev.filter(
                  (obj) =>
                    (currentFilter?.open && !obj.completed) ||
                    (currentFilter?.completed && obj.completed)
                );
              });
            } else if (formValue.parent_task !== isSubTask?._id) {
              setSubTasks((prev) => ({
                ...prev,
                [isSubTask?._id]: (prev[isSubTask?._id] || [])
                  .filter((obj) => obj._id !== editTask?._id)
                  .filter(
                    (obj) =>
                      (currentFilter?.open && !obj.completed) ||
                      (currentFilter?.completed && obj.completed)
                  ),
                [formValue.parent_task]: [
                  ...(prev[formValue.parent_task] || []),
                  { ...data, pinned: false },
                ].filter(
                  (obj) =>
                    (currentFilter?.open && !obj.completed) ||
                    (currentFilter?.completed && obj.completed)
                ),
              }));
              setCurrentTasks((prev) => {
                return prev
                  .map((obj) =>
                    obj._id === isSubTask?._id
                      ? {
                          ...obj,
                          sub_tasks: obj?.sub_tasks - 1,
                        }
                      : obj._id === formValue.parent_task
                      ? {
                          ...obj,
                          sub_tasks: obj?.sub_tasks + 1,
                        }
                      : { ...obj }
                  )
                  .filter(
                    (obj) =>
                      (currentFilter?.open && !obj.completed) ||
                      (currentFilter?.completed && obj.completed)
                  );
              });
            }
          }
        } else {
          if (formValue.parent_task && !isSubTask) {
            const parentTask = currentTasks.find(
              (obj) => obj._id === editTask?._id
            );

            if (!parentTask.sub_tasks) {
              setSubTasks((prev) => ({
                ...prev,
                [formValue.parent_task]: [
                  data,
                  ...(prev[formValue.parent_task] || []),
                  ...(prev[editTask?._id] || []),
                ],
              }));
            }

            setCurrentTasks((prev) => {
              if (isItMoveToComplete) {
                return prev
                  .map((obj) =>
                    obj._id === editTask?._id
                      ? { ...data, pinned: obj?.pinned || false }
                      : obj
                  )
                  .filter((obj) => obj._id !== editTask?._id);
              }

              return prev
                .map((obj) =>
                  obj._id === editTask?._id
                    ? {
                        ...data,
                        pinned: !!obj?.pinned,
                      }
                    : obj._id === formValue.parent_task
                    ? {
                        ...obj,
                        sub_tasks:
                          formValue.parent_task && !isSubTask
                            ? obj?.sub_tasks + (parentTask?.sub_tasks || 0) + 1
                            : obj?.sub_tasks,
                      }
                    : obj
                )
                .filter((obj) => obj._id !== editTask?._id);
            });
          } else {
            setCurrentTasks((prev) => {
              if (isItMoveToComplete) {
                return prev
                  .map((obj) =>
                    obj._id === editTask?._id
                      ? { ...data, pinned: !!obj?.pinned }
                      : obj
                  )
                  .filter((obj) => obj._id !== editTask?._id);
              }
              return prev.map((obj) =>
                obj._id === editTask?._id
                  ? {
                      ...data,
                      pinned: !!obj?.pinned,
                    }
                  : obj
              );
            });
          }
        }
        reset({});
        innerHandleClearAddUpdateTask(data);
      }
    }
  };

  const onMarkNotificationAsRead = async (item) => {
    const tempCurrentTasks = JSON.parse(JSON.stringify(subTasks));
    if (tempCurrentTasks?.[editTask?._id]) {
      const itemIndex = tempCurrentTasks?.[editTask?._id].findIndex(
        (task) => task._id === item._id
      );
      if (itemIndex > -1) {
        tempCurrentTasks[editTask?._id][itemIndex] = {
          ...tempCurrentTasks[editTask?._id][itemIndex],
          isUnreadUpdates: false,
        };
        setSubTasks(tempCurrentTasks);
      }
    }
  };

  /** Other Details */
  const getCheckNewUpdates = async () => {
    const userId = user?._id;
    if (userId && editTask?._id) {
      const { data, error } = await checkUnreadStatus({
        taskId: editTask._id,
        userId,
        notificationFor: NotificationType.NEW_UPDATE,
      });

      if (!error && data) setHasNewUpdates(true);
    }
  };

  /** Modal Header Actions */
  const handleCopyLinkClick = () => {
    const toastId = showToast(TOASTTYPES.loading, '', 'Copy Link...');
    showToast(TOASTTYPES.success, toastId, 'Task Link Copied');
  };

  const handleCloneTask = async () => {
    setShowCloneModal(true);
  };

  /** Timer Action */
  const handleCloseTimerHistoryModal = () => {
    setShowTimerHistoryModal(false);
  };

  const innerHandleClearAddUpdateTask = (data) => {
    handleClearAddUpdateTask(data);
    handleCloseTaskManager();
  };

  /** Refetch all opened category tasks if update in task category */
  const refetchCategoryTasks = (updatedCategoryId) => {
    if (updatedCategoryId !== currentCategoryTaskModal) {
      refreshCategories();
    }
  };

  const handleRemoveAttachment = async () => {
    if (removeAttachments.length || attachmentFileUrl.length) {
      const tempCurrentAttachments = [
        ...attachmentFileUrl.map((attachment) => attachment?.fileUrl),
      ];
      const { attachments = [] } = editTask;
      const tempAttachment = editTask?._id
        ? [
            [...removeAttachments, ...tempCurrentAttachments?.map].map(
              (deleteAttachment) => {
                if (
                  !attachments
                    ?.flat()
                    .some((obj) => obj.fileUrl === deleteAttachment)
                ) {
                  return deleteAttachment;
                }
              }
            ),
          ]
        : [...removeAttachments, ...tempCurrentAttachments];
      await removeAttachment({ attachmentUrl: tempAttachment });
    }
    setRemoveAttachments([]);
  };

  /** Child Components */
  const TaskModalFooter = () => {
    return (
      <>
        {editTask && currentTab === 'tasks' && (
          <>
            {Object.keys(editTask)?.includes('completed') &&
              editTask?.trash !== true && (
                <Button
                  className={`me-1 marked-btn ${
                    editTask?.completed ? 'checked' : 'unchecked'
                  }`}
                  type='button'
                  color='secondary'
                  outline
                  onClick={(e) => {
                    e.stopPropagation();
                    setUpdateStatusLoading(true);
                    handleTaskComplete();
                  }}
                >
                  {editTask?.completed ? 'Reopen the Task' : 'Mark as Archived'}
                </Button>
              )}
            {Object.keys(editTask)?.includes('_id') && (
              <Button
                className='me-1 delete-btn'
                type='button'
                color='danger'
                outline
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskDelete();
                }}
              >
                <Trash />
                Delete
              </Button>
            )}
          </>
        )}

        <SaveButton
          loading={autoSavingTask}
          className='me-1 cancel-btn'
          type='reset'
          color='secondary'
          outline
          onClick={async () => {
            if (autoSavingTask) return;
            await taskTabRef.current?.autoSaveDetails();
            reset({});
            innerHandleClearAddUpdateTask();
            handleRemoveAttachment();
            handleCloseTaskManager();
          }}
          name='Close'
        />

        {currentTab === 'tasks' && (
          <>
            <SaveButton
              className='submit-btn'
              loading={
                (createTaskLoading ||
                  updateTaskLoading ||
                  createMultipleTaskLoading) &&
                !updateStatusLoading
              }
              disabled={
                createTaskLoading ||
                updateTaskLoading ||
                createMultipleTaskLoading
              }
              color='primary'
              name={'Submit'}
              onClick={handleSubmit(onSubmit)}
            />
          </>
        )}
      </>
    );
  };

  const handleCloseTaskManager = () => {
    setSubTaskLength(0);
    setShowChecklist(false);
    setCurrentTab('tasks');
    handleResetTimerDetails();
    controller?.abort();
  };

  return (
    <>
      <Modal
        isOpen={showTaskModal}
        fade={false}
        toggle={async () => {
          if (autoSavingTask) return;
          await taskTabRef.current?.autoSaveDetails();
          reset({});
          handleRemoveAttachment();
          innerHandleClearAddUpdateTask();
          handleCloseTaskManager();
        }}
        className={`add-task-modal-new modal-dialog-centered only-add-task-modal ${
          editTask?._id
            ? 'update-task-modal'
            : isSubTask && !editTask
            ? 'only-add-subtask'
            : ''
        } ${
          editTask?._id && currentTab === 'sub_task' && 'subtaskTab-active'
        } ${currentTab === 'sub_task' && ''} ${
          currentTab === 'updates' && 'update-tab-active'
        }`}
        size='xl'
        backdrop='static'
      >
        <div className='modal-header-wrapper'>
          <img
            className='bg-img'
            src='/images/task-manager-header-bg-small.png'
            alt=''
          />
          <div className='modal-header'>
            <h5 className='modal-title'>
              <div className='modal-title'>
                <TaskModalHeader
                  editTask={editTask}
                  taskData={taskData}
                  isSubTask={isSubTask}
                  currentTab={currentTab}
                  handleCloneTask={handleCloneTask}
                  handleCopyLinkClick={handleCopyLinkClick}
                  totalTaskDuration={timerDetails?.totalTaskDuration}
                  timerDetails={timerDetails}
                  currentTime={currentTime}
                  startPausedTimer={startPausedTimer}
                  pauseTimer={pauseTimer}
                  stopTimer={stopTimer}
                  startTimer={startTimer}
                  createTaskTimerLoading={createTaskTimerLoading}
                />
              </div>
            </h5>
            <button
              disabled={autoSavingTask}
              onClick={async () => {
                if (autoSavingTask) return;
                await taskTabRef.current?.autoSaveDetails();
                reset({});
                innerHandleClearAddUpdateTask();
                handleRemoveAttachment();
                handleCloseTaskManager();
              }}
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
            >
              {autoSavingTask && <Spinner />}
            </button>
          </div>
        </div>
        <ModalBody className='hide-scrollbar'>
          {editTask &&
            Object.keys(editTask).length &&
            Object.keys(editTask)?.includes('completed') &&
            editTask?.trash !== true && (
              <Button
                className={`marked-btn-mobile ${
                  editTask?.completed ? 'checked' : 'unchecked'
                }`}
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setUpdateStatusLoading(true);
                  handleTaskComplete();
                }}
              >
                {editTask?.completed ? 'Reopen the Task' : 'Mark as Archived'}
              </Button>
            )}
          <div className='mobile-header-wrapper'>
            <span className='createdBy-text'>
              <div className='task__top__details__row'>
                {editTask?.createdBy?._id ? (
                  <>
                    <div className='task__top__details__col'>
                      <div className='inner-wrapper'>
                        <div className='label'>
                          <div className='icon-wrapper'>
                            <User />
                          </div>
                          <span className='label__text'>Created By</span>
                        </div>
                        <div className='value'>
                          <span className='created-user-wrapper'>
                            <div className='avatar bg-light-primary'>
                              <div className='avatar-content'>
                                {' '}
                                {editTask?.createdBy?.userProfile &&
                                editTask?.createdBy?.userProfile !== 'false' ? (
                                  <Avatar
                                    imgClassName='profile-img'
                                    img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${editTask?.createdBy.userProfile}`}
                                    status='online'
                                    content={`${editTask?.createdBy?.firstName} ${editTask?.createdBy?.lastName}`}
                                    initials
                                  />
                                ) : (
                                  <Avatar
                                    imgClassName='profile-img'
                                    status='online'
                                    className='user-profile'
                                    color={'light-primary'}
                                    content={`${editTask?.createdBy?.firstName} ${editTask?.createdBy?.lastName}`}
                                    initials
                                  />
                                )}
                              </div>
                            </div>
                            <span className='name'>
                              {editTask?.createdBy?.firstName}{' '}
                              {editTask?.createdBy?.lastName}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  ''
                )}
                {editTask?.contact && (
                  <div className='task__top__details__col contact__company__profile'>
                    <div className='inner-wrapper'>
                      <div
                        className='created-user-wrapper'
                        onClick={(e) => {
                          e.stopPropagation();
                          if (editTask?.contact?._id) {
                            if (user.role === 'admin') {
                              history.push(
                                `/admin/contact/${editTask?.contact?._id}`
                              );
                            } else if (user.role === 'grandadmin') {
                              history.push(
                                `/grandadmin/contact/${editTask?.contact?._id}`
                              );
                            } else if (user.role === 'superadmin') {
                              history.push(
                                `/contact/${editTask?.contact?._id}`
                              );
                            }
                          }
                        }}
                      >
                        <div className='avatar bg-light-primary'>
                          <div className='avatar-content'>
                            {editTask?.contact?.userProfile &&
                            editTask?.contact?.userProfile !== 'false' ? (
                              <Avatar
                                imgClassName='profile-img'
                                img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${editTask?.contact.userProfile}`}
                                status='online'
                                content={`${editTask?.contact?.firstName} ${editTask?.contact?.lastName}`}
                                initials
                              />
                            ) : (
                              <Avatar
                                imgClassName='profile-img'
                                status='online'
                                className='user-profile'
                                color={'light-primary'}
                                content={`${editTask?.contact?.firstName} ${editTask?.contact?.lastName}`}
                                initials
                              />
                            )}
                          </div>
                        </div>
                        <div className='name'>
                          <div className='userName'>
                            {editTask?.contact?.firstName && (
                              <div className='user-name'>
                                {`${editTask.contact.firstName} ${
                                  editTask?.contact?.lastName || ''
                                }`}
                              </div>
                            )}
                          </div>
                          <div className='compnayName'>
                            {editTask?.contact?.company_name && (
                              <div className='company-name'>
                                {editTask?.contact?.company_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className='task__top__details__col'>
                  <div className='inner-wrapper'>
                    <div className='label'>
                      <div className='icon-wrapper'>
                        <Clock />
                      </div>
                      <span className='label__text'>Created Time</span>
                    </div>
                    <div className='value'>
                      <span className='created-time'>
                        {moment(new Date(editTask?.createdAt)).format(
                          ` ${
                            user?.company?.dateFormat
                              ? user?.company?.dateFormat
                              : 'MM/DD/YYYY'
                          } | HH:mm A`
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='task__top__details__col'>
                  <div className='inner-wrapper'>
                    <div className='label'>
                      <div className='icon-wrapper'>
                        <Clock />
                      </div>
                      <span className='label__text'>Total Time</span>
                    </div>
                    <div className='value'>
                      <span className='total-time-spent'>
                        {moment
                          .utc(
                            moment.duration(totalTaskDuration).asMilliseconds()
                          )
                          .format('HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </span>
          </div>
          <div
            className={`horizontal-tab-parentTask-select-wrapper ${
              editTask?._id ? 'timerWrapper-active' : ''
            } ${currentTime ? 'timer-active' : ''}`}
          >
            <div className='horizontal-tab-wrapper'>
              <Nav className='horizontal-tabbing hide-scrollbar' tabs>
                <NavItem>
                  <NavLink
                    className={classNames({
                      active: currentTab === 'tasks',
                    })}
                    onClick={() => {
                      setCurrentTab('tasks');
                    }}
                  >
                    Task
                  </NavLink>
                </NavItem>

                {!isSubTask && (
                  <>
                    <NavItem>
                      <NavLink
                        className={classNames({
                          active: currentTab === 'sub_task',
                        })}
                        onClick={() => {
                          if (editTask?._id) {
                            setCurrentTab('sub_task');
                          }
                        }}
                        id={`sub_task_tab`}
                      >
                        Sub Task
                        {subtaskLength > 0 && (
                          <>
                            <Badge
                              id={`subtasks`}
                              className='subtask-count'
                              pill
                            >
                              <span className='text'>{subtaskLength}</span>
                            </Badge>
                            <UncontrolledTooltip
                              placement='top'
                              target={`subtasks`}
                            >
                              {subtaskLength}
                              {` `}subtasks
                            </UncontrolledTooltip>
                          </>
                        )}
                      </NavLink>
                    </NavItem>

                    {!editTask?._id && (
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`sub_task_tab`}
                      >
                        {!editTask?._id && 'Please create a task first'}
                      </UncontrolledTooltip>
                    )}
                  </>
                )}

                {editTask?._id && (
                  <NavItem>
                    <NavLink
                      className={classNames({
                        active: currentTab === 'updates',
                      })}
                      onClick={() => {
                        setCurrentTab('updates');
                      }}
                    >
                      <div className='position-relative '>
                        {hasNewUpdates && (
                          <span className='badge-dot-warning me-1'></span>
                        )}
                        Updates
                      </div>
                    </NavLink>
                  </NavItem>
                )}
              </Nav>
            </div>
            {editTask?._id && (
              <>
                <div className='timerWrapper'>
                  <div className='viewBtn'>
                    <Eye
                      className='cursor-pointer'
                      size={15}
                      id={'view-task-timer'}
                      onClick={() => setShowTimerHistoryModal(true)}
                    />
                  </div>
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`view-task-timer`}
                  >
                    View Timer History
                  </UncontrolledTooltip>
                  <div className='totalTime-spent-wrapper'>
                    <Label className='label'>Total time spent</Label>
                    <div className='time'>
                      {moment
                        .utc(
                          moment
                            .duration(timerDetails.totalTaskDuration)
                            .asMilliseconds()
                        )
                        .format('HH:mm:ss')}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className='task-modal-tabs-contant'>
            {isLoading ? (
              <div className='pt-2 pb-2 d-flex align-items-center justify-content-center task-modal-loader-wrapper'>
                <Spinner />
              </div>
            ) : (
              <>
                <div className={`${isLoading ? 'task-overlay' : ''}`}>
                  <UILoader blocking={isLoading}>
                    <TabContent activeTab={currentTab}>
                      <TabPane className='tasks-tab' tabId='tasks'>
                        <TaskTab
                          mentionUsers={mentionUsers}
                          isLoading={isLoading}
                          isModalOpenFromSubtask={isModalOpenFromSubtask}
                          showTaskModal={showTaskModal}
                          setCompletedTaskInstruction={
                            setCompletedTaskInstruction
                          }
                          completedTaskInstruction={completedTaskInstruction}
                          form={form}
                          formRenderKey={formRenderKey}
                          onSubmit={onSubmit}
                          timerState={timerState}
                          taskSchedulerState={taskSchedulerState}
                          startDateEndDateState={startDateEndDateState}
                          scheduleData={scheduleData}
                          setScheduleData={setScheduleData}
                          currentNote={currentNote}
                          setCurrentNote={setCurrentNote}
                          userLoading={userLoading}
                          availableUsers={availableUsers}
                          taskOptions={taskOptions}
                          setTaskOptions={setTaskOptions}
                          showChecklist={showChecklist}
                          setShowChecklist={setShowChecklist}
                          setAttachmentFileUrl={setAttachmentFileUrl}
                          attachmentFileUrl={attachmentFileUrl}
                          ref={taskTabRef}
                          editTask={editTask}
                          setStartDateEndDateState={setStartDateEndDateState}
                          isMultipleTasks={isMultipleTasks}
                          clearErrors={clearErrors}
                          autoSavingTask={autoSavingTask}
                          autoSaveTask={autoSaveTask}
                          setRemoveAttachments={setRemoveAttachments}
                          removeAttachments={removeAttachments}
                        />
                      </TabPane>

                      {editTask?._id && (
                        <TabPane className='subTask-tab' tabId='sub_task'>
                          <ModalSubtasks
                            usersOptions={{ data: availableUsers }}
                            currentFilter={currentFilter}
                            setCurrentFilter={setCurrentFilter}
                            editTask={editTask}
                            setUpdateTask={setUpdateTask}
                            open={open}
                            setOpen={setOpen}
                            setSubTaskLength={setSubTaskLength}
                            setSubTasks={setSubTasks}
                            currentTasks={currentTasks}
                            setCurrentTasks={setCurrentTasks}
                            taskOptions={taskOptions}
                            changePriorityOrStatusLoading={
                              changePriorityOrStatusLoading
                            }
                            handleUpdateStatusOrPriority={
                              handleUpdateStatusOrPriority
                            }
                            currentStatusOrPriorityChangingIds={
                              currentStatusOrPriorityChangingIds
                            }
                            setCurrentStatusOrPriorityChangingIds={
                              setCurrentStatusOrPriorityChangingIds
                            }
                            initialContactData={initialContactData}
                            notifyUserForNewTask={notifyUserForNewTask}
                            currentTaskPagination={currentTaskPagination}
                            setCurrentTaskPagination={setCurrentTaskPagination}
                            currentCategory={currentCategory}
                            onMarkNotificationAsRead={onMarkNotificationAsRead}
                          />
                        </TabPane>
                      )}

                      <TabPane className='updates-tab' tabId='updates'>
                        {currentTab === 'updates' && (
                          <ModalUpdates
                            currentTasks={currentTasks}
                            taskData={taskData}
                            setValue={setValue}
                            getValues={getValues}
                            taskOptions={taskOptions}
                            editTask={editTask}
                            assignedUsers={watch(`assigned`)}
                            hasNewUpdates={hasNewUpdates}
                            setHasNewUpdates={setHasNewUpdates}
                            setCurrentTasks={setCurrentTasks}
                            isSubTask={isSubTask}
                            setSubTasks={setSubTasks}
                            userLoading={userLoading}
                            errors={errors}
                            control={control}
                            formState={formState}
                            availableUsers={availableUsers}
                            handleClearAddUpdateTask={
                              innerHandleClearAddUpdateTask
                            }
                            setRemoveAttachments={setRemoveAttachments}
                            removeAttachments={removeAttachments}
                          />
                        )}
                      </TabPane>
                    </TabContent>
                  </UILoader>
                </div>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Form>{<TaskModalFooter />}</Form>
        </ModalFooter>
      </Modal>
      {/* Other Modals */}
      {showTimerNoteModal && (
        <TimerNoteModal
          handleCloseNoteModal={handleCloseNoteModal}
          showTimerNoteModal={showTimerNoteModal}
          timerExistsDetails={timerExistsDetails}
          currentStartedTask={currentStartedTask}
        />
      )}
      {showTimerHistoryModal && (
        <ShowTimerHistory
          showTimerHistoryModal={showTimerHistoryModal}
          task={editTask._id}
          handleCloseTimerHistoryModal={handleCloseTimerHistoryModal}
        />
      )}
      {showTaskStartWarningModal && (
        <ShowTaskStartedModal
          showTaskStartWarningModal={showTaskStartWarningModal}
          currentStartedTask={currentStartedTask}
          handleCloseTaskStartWarningModal={handleCloseTaskStartWarningModal}
          updateTimerLoading={updateTimerLoading}
        />
      )}
      {showCloneModal && (
        <CloneTaskModal
          isModalOpen={showCloneModal}
          setIsModalOpen={setShowCloneModal}
          editTask={editTask}
          setUpdateTask={setUpdateTask}
          currentTasks={currentTasks}
          setCurrentTasks={setCurrentTasks}
          subTasks={subTasks}
          setSubTasks={setSubTasks}
          setIsSubTask={setIsSubTask}
        />
      )}
    </>
  );
};

export default TaskModal;
