// ** React Imports
import React, { useEffect, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';

// ** external packages
import _ from 'lodash';
import classNames from 'classnames';
import { ReactSortable } from 'react-sortablejs';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MoreVertical,
  Plus,
  // PlusCircle,
} from 'react-feather';
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Button,
  Input,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
// ** Styles

//  ** redux
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';

// ** Apis
import {
  useDeleteTask,
  useGetTasksAPI,
  useReOrderTask,
  useUpdateTask,
} from '../service/task.services';

// ** Components
import RenderTaskAvatar from './RenderTaskAvatar';
import AddQuickTask from './AddQuickTask';
import PriorityInnerListDropdown from './PriorityInnerListDropdown';
import StatusInnerListDropdown from './StatusInnerListDropdown';

// ** others
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import TaskActionMenu from './TaskActionMenu';
import AssigneeInnerListDropdown from './AssigneeInnerListDropdown';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import moment from 'moment';
import TaskModal from './TaskModal/TaskModal';
import SubTaskListHeader from './SubTaskListHeader';
import { convertHtmlToPlain, getFullName } from '../../../../utility/Utils';
import { NotificationType } from '../../../../constant';
import { useDeleteReadTasks } from '../service/taskNotifyUsers.services';

const ModalSubtasks = ({
  editTask,
  setUpdateTask,
  open,
  setOpen,
  currentTasks,
  setCurrentTasks,
  setSubTaskLength,
  setSubTasks: setOuterSubTasks,
  taskOptions,
  changePriorityOrStatusLoading,
  handleUpdateStatusOrPriority,
  currentStatusOrPriorityChangingIds,
  setCurrentStatusOrPriorityChangingIds,
  initialContactData,
  notifyUserForNewTask,
  currentFilter,
  setCurrentFilter,
  usersOptions,
  setCurrentTaskPagination,
  currentTaskPagination,
  currentCategory,
  onMarkNotificationAsRead,
}) => {
  const user = useSelector(userData);
  const [openId, setOpenId] = useState();
  const [subTasks, setSubTasks] = useState({ [editTask?._id]: [] });
  const [quickAddSubTaskVisible, setQuickAddSubTaskVisible] = useState(false);
  const [detailedAddSubTaskVisible, setDetailedAddSubTaskVisible] =
    useState(false);
  const [currentUpdateTask, setCurrentUpdateTask] = useState(null);

  const { removeReadTasks: removeReadUpdates } = useDeleteReadTasks();
  const { reOrderTask } = useReOrderTask();
  const { getTasks, isLoading: taskLoading } = useGetTasksAPI();
  const { updateTask: updateTaskDetail } = useUpdateTask();
  const { deleteTask } = useDeleteTask();
  const [currentSubTaskListFilter, setCurrentSubTaskListFilter] = useState({
    trash: false,
    completed: false,
    populate: JSON.stringify([{ path: 'assigned' }, { path: 'contact' }]),
    company: user?.company?._id,
    select:
      'name,details,startDate,endDate,priority,status,parent_task,trash,completed,contact,assigned,taskNumber,snoozeUntil,hideSnoozeTask',
    sort: { order: 1, createdAt: -1 },
  });

  const hasOpenInOuterList =
    currentTasks.findIndex((c) => c._id === editTask?._id).toString() === open;

  const getSubTasks = async (parentTaskId) => {
    setSubTasks({ [editTask?._id]: [] });
    const { data, error } = await getTasks({
      ...currentSubTaskListFilter,
      parent_task: parentTaskId,
    });

    if (!error && _.isArray(data?.tasks)) {
      setSubTasks({ [editTask?._id]: [...data.tasks] });
      if (setSubTaskLength) {
        setSubTaskLength(
          data.tasks?.filter((task) => !task.completed)?.length || 0
        );
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
      { ...taskClone, startDate: newStartDate },
      `Updating start date`
    );
    if (!error) {
      let tempSubTasks = [...(subTasks[taskClone.parent_task] || [])];
      tempSubTasks = [
        ...tempSubTasks.map((task) => {
          console.log('task', task);
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
        [editTask?._id]: tempSubTasks,
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
        [editTask?._id]: tempSubTasks,
      }));
    }
  };

  const markNotificationAsRead = async (item) => {
    const { error } = await removeReadUpdates(user._id, {
      taskIds: [item._id],
      notificationFor: NotificationType.NEW_UPDATE,
    });
    if (!error) {
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
          onMarkNotificationAsRead(item);
          setSubTasks(tempCurrentTasks);
        }
      }
    }
  };

  useEffect(() => {
    const searchValue = new URLSearchParams(location.search);
    const searchTaskId = searchValue.get('task');

    if (
      editTask?.sub_tasks ||
      (editTask?.sub_tasks === undefined && searchTaskId)
    ) {
      getSubTasks(editTask?._id);
    }
  }, [editTask?._id, currentSubTaskListFilter]);

  const toggle = (id) => (openId === id ? setOpenId() : setOpenId(id));

  const getFormattedDate = (date) => {
    return (
      // eslint-disable-next-line prefer-template
      new Date(date).toLocaleString('default', {
        month: 'short',
      }) +
      ' ' +
      new Date(date).getDate().toString().padStart(2, '0')
    );
  };

  const handleTaskDelete = async (subTaskItem) => {
    const currentEditTask = JSON.parse(JSON.stringify(subTaskItem));

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
        // here initial check and uncheck before api call for batter user experience --> start
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

        const updatedSubTasks = subTasks[editTask?._id].filter(
          (obj) => obj._id !== subTaskItem?._id
        );
        setSubTasks({ [editTask?._id]: updatedSubTasks });

        /* Update if same edit item's subtasks are open in main list page */
        hasOpenInOuterList &&
          setOuterSubTasks((pre) => ({
            ...pre,
            [editTask?._id]: updatedSubTasks,
          }));

        // Decrement count
        setCurrentTasks((prev) => {
          return prev.map((obj) =>
            obj._id === editTask?._id
              ? {
                  ...obj,
                  sub_tasks: obj?.sub_tasks - 1,
                }
              : { ...obj }
          );
        });
      }
    }
  };

  const handleTaskComplete = async (item, checked) => {
    const result = await showWarnAlert({
      text: checked
        ? 'Are you sure you want to archive this task?'
        : 'Are you sure you want to remove this task from archived list?',
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      const updatedSubTasks = subTasks[editTask?._id].map((task) =>
        task._id === item._id ? { ...task, completed: checked } : { ...task }
      );

      setSubTasks({ [editTask?._id]: updatedSubTasks });

      /* Update if same edit item's subtasks are open in main list page */
      hasOpenInOuterList &&
        setOuterSubTasks((pre) => ({
          ...pre,
          [editTask?._id]: updatedSubTasks,
        }));

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

      await updateTaskDetail(item._id, item, 'Loading...');
    }
  };

  const updateInnerSubTaskPriority = async (...args) => {
    const result = await handleUpdateStatusOrPriority(...args);

    if (result !== false) {
      const [task, currentOption, type] = args || [];

      if (task && currentOption && type) {
        setSubTasks((prev) => ({
          [editTask?._id]: prev[editTask?._id].map((t) =>
            t._id === task._id ? { ...t, [type]: currentOption?._id } : { ...t }
          ),
        }));
      }
    }
  };

  const handleClearAddUpdateSubTask = () => {
    setDetailedAddSubTaskVisible(false);
    setCurrentUpdateTask(false);
  };

  if (taskLoading) {
    return (
      <li className='todo-item d-flex align-items-center justify-content-center'>
        <Spinner />
      </li>
    );
  }

  return (
    <div className='loyal-task-manager'>
      <div className='content-right'>
        <div className='task-manager-body'>
          <div className='subtask-add-btns-wrapper'>
            <Button
              onClick={() => setQuickAddSubTaskVisible(true)}
              className='new-subtask-btn'
              color='primary'
            >
              <Plus size={15} />
              <span className='text'>Quick Add</span>
            </Button>
            <Button
              onClick={() => {
                setDetailedAddSubTaskVisible(true);
              }}
              className='new-subtask-details-btn'
              color='primary'
            >
              <Plus size={15} />
              <span className='text'>Add With Details</span>
            </Button>
          </div>
          <PerfectScrollbar className='fancy__scrollbar'>
            <Accordion className='task-manager-main-accordion' open={openId}>
              <SubTaskListHeader
                taskLoading={taskLoading}
                setCurrentFilter={setCurrentSubTaskListFilter}
                currentFilter={currentSubTaskListFilter}
                childHeader={false}
              />
              {quickAddSubTaskVisible && (
                <AddQuickTask
                  usersOptions={usersOptions}
                  currentFilter={currentFilter}
                  setCurrentFilter={setCurrentFilter}
                  subTasks={subTasks}
                  setSubTasks={(data) => {
                    setSubTasks(data);
                    hasOpenInOuterList && setOuterSubTasks(data);
                  }}
                  currentTasks={currentTasks}
                  setCurrentTasks={setCurrentTasks}
                  setOpen={setOpen}
                  setVisible={setQuickAddSubTaskVisible}
                  isSubTask={editTask}
                  taskOptions={taskOptions}
                  notifyUserForNewTask={notifyUserForNewTask}
                  setCurrentTaskPagination={setCurrentTaskPagination}
                />
              )}
              <div className='todo-task-list media-list'>
                <ReactSortable
                  className='task-manager-row-wrapper'
                  list={[
                    ...(subTasks?.[editTask?._id] || [])?.sort(
                      (a, b) => a.completed - b?.completed
                    ),
                  ]}
                  handle='.drag-icon'
                  setList={(newState) => {
                    setSubTasks((pre) => ({
                      ...pre,
                      [editTask?._id]: newState,
                    }));
                    hasOpenInOuterList &&
                      setOuterSubTasks((pre) => ({
                        ...pre,
                        [editTask?._id]: newState,
                      }));
                  }}
                  onEnd={() => {
                    reOrderTask(
                      (subTasks[editTask?._id] || []).map((obj) => ({
                        _id: obj._id,
                      }))
                    );
                  }}
                >
                  {(subTasks[editTask?._id] || [])
                    ?.sort((a, b) => a.completed - b?.completed)
                    ?.map((subTaskItem, index) => {
                      return (
                        <AccordionItem className='task-manager-row' key={index}>
                          <div className='inner-wrapper'>
                            <div
                              className={`task-manager-title ${classNames({
                                completed: subTaskItem.completed,
                              })}`}
                              onClick={() => {
                                setCurrentUpdateTask(subTaskItem);
                                setDetailedAddSubTaskVisible(true);
                              }}
                            >
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
                                    <div className='move-icon-wrapper'>
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
                                  <span className='task-number'>
                                    {subTaskItem?.taskNumber
                                      ? `#${subTaskItem.taskNumber}`
                                      : ''}
                                  </span>
                                </div>
                                <div className='task-name-cell'>
                                  <div className='task-name-wrapper'>
                                    <span
                                      className='task-name'
                                      id={`sub_task_modal_name_${index}_${subTaskItem._id}`}
                                    >
                                      <span className='inner-wrapper'>
                                        {subTaskItem.name}
                                      </span>
                                    </span>
                                    <UncontrolledTooltip
                                      className='task-heading-tooltip'
                                      placement='top'
                                      target={`sub_task_modal_name_${index}_${subTaskItem._id}`}
                                    >
                                      {subTaskItem.name}
                                    </UncontrolledTooltip>
                                    {subTaskItem.isUnreadUpdates && (
                                      <div className='me-1'>
                                        <span
                                          id={`update_badge_modal_${subTaskItem._id}`}
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
                                          target={`update_badge_modal_${subTaskItem._id}`}
                                        >
                                          <>
                                            {new Date(
                                              subTaskItem?.latestUpdates?.createdAt
                                            ).toLocaleString('default', {
                                              month: 'short',
                                            })}{' '}
                                            {new Date(
                                              subTaskItem?.latestUpdates?.createdAt
                                            )
                                              .getDate()
                                              .toString()
                                              .padStart(2, '0')}
                                            {' - '}
                                            {
                                              subTaskItem?.latestUpdates
                                                ?.createdBy.firstName
                                            }{' '}
                                            {
                                              subTaskItem?.latestUpdates
                                                ?.createdBy.lastName
                                            }
                                            <br />
                                            {subTaskItem?.latestUpdates
                                              ?.content &&
                                              convertHtmlToPlain(
                                                subTaskItem?.latestUpdates
                                                  ?.content
                                              )}
                                          </>
                                        </UncontrolledTooltip>
                                      </div>
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
                                    />
                                  </div>
                                </div>
                                <div className='task-priority-cell'>
                                  <PriorityInnerListDropdown
                                    item={subTaskItem}
                                    taskOptions={taskOptions}
                                    changePriorityOrStatusLoading={
                                      changePriorityOrStatusLoading
                                    }
                                    handleUpdateStatusOrPriority={
                                      updateInnerSubTaskPriority
                                    }
                                    currentStatusOrPriorityChangingIds={
                                      currentStatusOrPriorityChangingIds
                                    }
                                    setCurrentStatusOrPriorityChangingIds={
                                      setCurrentStatusOrPriorityChangingIds
                                    }
                                  />
                                </div>
                                <div className='task-status-cell'>
                                  <StatusInnerListDropdown
                                    item={subTaskItem}
                                    taskOptions={taskOptions}
                                    changePriorityOrStatusLoading={
                                      changePriorityOrStatusLoading
                                    }
                                    handleUpdateStatusOrPriority={
                                      updateInnerSubTaskPriority
                                    }
                                    currentStatusOrPriorityChangingIds={
                                      currentStatusOrPriorityChangingIds
                                    }
                                    setCurrentStatusOrPriorityChangingIds={
                                      setCurrentStatusOrPriorityChangingIds
                                    }
                                  />
                                </div>
                                <div className='task-date-cell'>
                                  {subTaskItem.startDate ? (
                                    <div className='task-date'>
                                      {subTaskItem?.completed ||
                                      subTaskItem?.trash ? (
                                        <>
                                          {new Date(
                                            subTaskItem.startDate
                                          ).toLocaleString('default', {
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
                                              defaultDate: moment(
                                                subTaskItem.startDate
                                              ).format('MM-DD-YYYY'),
                                              dateFormat: 'm-d-Y',
                                              enable: [
                                                function (date) {
                                                  const today = new Date(
                                                    new Date().setHours(
                                                      0,
                                                      0,
                                                      0,
                                                      0
                                                    )
                                                  );
                                                  return date >= today;
                                                },
                                                moment(
                                                  subTaskItem.startDate
                                                ).format('MM-DD-YYYY'),
                                              ],
                                              altInput: true,
                                              altFormat: 'M d',
                                            }}
                                            value={moment(
                                              subTaskItem.startDate
                                            ).format('MM-DD-YYYY')}
                                            className='form-control invoice-edit-input due-date-picker'
                                            name='startDate'
                                            enableTime={false}
                                            onChange={(startDate) => {
                                              handleUpdateStartDate(
                                                subTaskItem,
                                                startDate[0]
                                              );
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                                <div className='task-date-cell'>
                                  {subTaskItem.endDate ? (
                                    <div className='task-date'>
                                      {subTaskItem?.completed ||
                                      subTaskItem?.trash ? (
                                        <>
                                          {new Date(
                                            subTaskItem.endDate
                                          ).toLocaleString('default', {
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
                                              defaultDate: moment(
                                                subTaskItem.endDate
                                              ).format('MM-DD-YYYY'),
                                              dateFormat: 'm-d-Y',
                                              enable: [
                                                function (date) {
                                                  const today = new Date(
                                                    new Date().setHours(
                                                      0,
                                                      0,
                                                      0,
                                                      0
                                                    )
                                                  );
                                                  return date >= today;
                                                },
                                                moment(
                                                  subTaskItem.endDate
                                                ).format('MM-DD-YYYY'),
                                              ],
                                              altInput: true,
                                              altFormat: 'M d',
                                            }}
                                            value={moment(
                                              subTaskItem.endDate
                                            ).format('MM-DD-YYYY')}
                                            className='form-control invoice-edit-input due-date-picker'
                                            name='dueDate'
                                            enableTime={false}
                                            onChange={(dueDate) => {
                                              handleUpdateDueDate(
                                                subTaskItem,
                                                dueDate[0]
                                              );
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                                <div className='task-assignee-cell'>
                                  <AssigneeInnerListDropdown
                                    item={subTaskItem}
                                    options={usersOptions.data}
                                    setSubTasks={setSubTasks}
                                    subTasks={subTasks}
                                  />
                                </div>
                                <div className='task-checkbox-cell'>
                                  <Input
                                    className='task-checkbox form-check-input'
                                    id={`complete_${index}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    checked={!!subTaskItem?.completed}
                                    type='checkbox'
                                    onChange={(e) => {
                                      handleTaskComplete(
                                        subTaskItem,
                                        e.target.checked
                                      );
                                    }}
                                  />
                                  <UncontrolledTooltip
                                    data-trigger='hover'
                                    autohide
                                    placement='top'
                                    target={`complete_${index}`}
                                  >
                                    {subTaskItem?.completed
                                      ? 'Reopen The Task'
                                      : 'Mark As Archived Task'}
                                  </UncontrolledTooltip>
                                </div>
                                <div className='task-action-cell'>
                                  <TaskActionMenu
                                    item={subTaskItem}
                                    handleTaskDelete={handleTaskDelete}
                                  />
                                </div>
                                <div className='down-up-btn-cell'>
                                  {openId === `${index}` ? (
                                    <div className='down-up-btn down-btn'>
                                      <ChevronUp
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggle();
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className='down-up-btn up-btn'>
                                      <ChevronDown
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggle(`${index}`);
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <AccordionBody
                            className='subtask-info-body'
                            accordionId={`${index}`}
                          >
                            <div className='subtask-info-wrapper'>
                              <div className='subtask-info'>
                                <label className='label'>TaskName:</label>{' '}
                                <span className='value'>
                                  {subTaskItem?.name}
                                </span>
                              </div>
                              <div className='subtask-info'>
                                <label className='label'>Start Date:</label>
                                <span className='value'>
                                  {getFormattedDate(subTaskItem.startDate)}
                                </span>
                              </div>
                              <div className='subtask-info'>
                                <label className='label'>End date:</label>
                                <span className='value'>
                                  {getFormattedDate(subTaskItem.endDate)}
                                </span>
                              </div>
                              <div className='subtask-info'>
                                <label className='label'>
                                  Est Time To Complete:
                                </label>
                                <span className='value'>
                                  {subTaskItem?.est_time_complete}
                                </span>
                              </div>
                              <div className='subtask-info'>
                                <label className='label'>Contact:</label>
                                <span className='value'>
                                  {subTaskItem?.contact
                                    ? `${
                                        subTaskItem?.contact?.firstName || ''
                                      } ${subTaskItem?.contact?.lastName || ''}`
                                    : ''}
                                </span>
                              </div>
                              <div className='subtask-info'>
                                <label className='label'>Assigned:</label>
                                <span className='value'>
                                  {(subTaskItem?.assigned || [])
                                    .map((t) => `${t.firstName} ${t.lastName}`)
                                    .join(', ')}
                                </span>
                              </div>
                              <div className='edit__btn'>
                                <Edit
                                  className='subtask_edit__icon cursor-pointer'
                                  onClick={() => {
                                    setCurrentUpdateTask(subTaskItem);
                                    setDetailedAddSubTaskVisible(true);
                                  }}
                                />
                              </div>
                            </div>
                          </AccordionBody>
                        </AccordionItem>
                      );
                    })}
                </ReactSortable>
              </div>

              <div className='mobile-row-wrapper'>
                <ReactSortable
                  className='task-manager-row-wrapper'
                  list={[
                    ...(subTasks?.[editTask?._id] || [])?.sort(
                      (a, b) => a.completed - b?.completed
                    ),
                  ]}
                  handle='.drag-icon'
                  setList={(newState) => {
                    setSubTasks((pre) => ({
                      ...pre,
                      [editTask?._id]: newState,
                    }));
                    hasOpenInOuterList &&
                      setOuterSubTasks((pre) => ({
                        ...pre,
                        [editTask?._id]: newState,
                      }));
                  }}
                  onEnd={() => {
                    reOrderTask(
                      (subTasks[editTask?._id] || []).map((obj) => ({
                        _id: obj._id,
                      }))
                    );
                  }}
                >
                  {(subTasks[editTask?._id] || [])
                    ?.sort((a, b) => a.completed - b?.completed)
                    ?.map((subTaskItem, index) => {
                      return (
                        <AccordionItem className='task-manager-row' key={index}>
                          <div className='inner-wrapper'>
                            <div
                              className={`task-manager-title ${classNames({
                                completed: subTaskItem.completed,
                              })}`}
                              onClick={() => {
                                setCurrentUpdateTask(subTaskItem);
                                setDetailedAddSubTaskVisible(true);
                              }}
                            >
                              <div className='top-header'>
                                <div className='left-wrapper'>
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
                                      <div className='move-icon-wrapper'>
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
                                  <span className='task-number'>
                                    {subTaskItem?.taskNumber
                                      ? `#${subTaskItem.taskNumber}`
                                      : ''}
                                  </span>
                                </div>
                                <div className='right-action'>
                                  <div className='task-checkbox-wrapper'>
                                    <div className='switch-checkbox'>
                                      <Input
                                        className='task-checkbox form-check-input'
                                        id={`complete_${index}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                        checked={!!subTaskItem?.completed}
                                        type='checkbox'
                                        onChange={(e) => {
                                          handleTaskComplete(
                                            subTaskItem,
                                            e.target.checked
                                          );
                                        }}
                                      />
                                      <span className='switch-design'></span>
                                      <UncontrolledTooltip
                                        data-trigger='hover'
                                        autohide
                                        placement='top'
                                        target={`complete_${index}`}
                                      >
                                        {subTaskItem?.completed
                                          ? 'Reopen The Task'
                                          : 'Mark As Archived Task'}
                                      </UncontrolledTooltip>
                                    </div>
                                  </div>
                                  <div className='action-btn-wrapper'>
                                    <div className='action-btn task-toggle-btn'>
                                      <TaskActionMenu
                                        item={subTaskItem}
                                        handleTaskDelete={handleTaskDelete}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className='taskName-wrapper'>
                                <span
                                  className='task-name'
                                  id={`sub_task_modal_name_${index}_${subTaskItem._id}`}
                                >
                                  <span className='inner-wrapper'>
                                    {subTaskItem.name}
                                  </span>
                                </span>
                                <UncontrolledTooltip
                                  className='task-heading-tooltip'
                                  placement='top'
                                  target={`sub_task_modal_name_${index}_${subTaskItem._id}`}
                                >
                                  {subTaskItem.name}
                                </UncontrolledTooltip>
                              </div>
                              <div className='task-priority-status'>
                                <PriorityInnerListDropdown
                                  item={subTaskItem}
                                  taskOptions={taskOptions}
                                  changePriorityOrStatusLoading={
                                    changePriorityOrStatusLoading
                                  }
                                  handleUpdateStatusOrPriority={
                                    updateInnerSubTaskPriority
                                  }
                                  currentStatusOrPriorityChangingIds={
                                    currentStatusOrPriorityChangingIds
                                  }
                                  setCurrentStatusOrPriorityChangingIds={
                                    setCurrentStatusOrPriorityChangingIds
                                  }
                                />
                                <StatusInnerListDropdown
                                  item={subTaskItem}
                                  taskOptions={taskOptions}
                                  changePriorityOrStatusLoading={
                                    changePriorityOrStatusLoading
                                  }
                                  handleUpdateStatusOrPriority={
                                    updateInnerSubTaskPriority
                                  }
                                  currentStatusOrPriorityChangingIds={
                                    currentStatusOrPriorityChangingIds
                                  }
                                  setCurrentStatusOrPriorityChangingIds={
                                    setCurrentStatusOrPriorityChangingIds
                                  }
                                />
                              </div>
                              <div className='contact-date-wrapper'>
                                <div className='contact-wrapper'>
                                  <div className='label'>Contact :</div>
                                  <div className='contact-details'>
                                    <div className='contactImg'>
                                      <RenderTaskAvatar
                                        obj={subTaskItem}
                                        userKey={'contact'}
                                      />
                                    </div>
                                    <span className='contactName'>
                                      {getFullName(
                                        subTaskItem?.contact?.firstName,
                                        subTaskItem?.contact?.lastName
                                      ) || subTaskItem?.contact?.email}
                                    </span>
                                  </div>
                                </div>
                                <div className='date-wrapper'>
                                  <div className='label'>Start End Date :</div>
                                  <div className='value'>
                                    <div className='start-date'>
                                      {subTaskItem.startDate ? (
                                        <>
                                          {subTaskItem?.completed ||
                                          subTaskItem?.trash ? (
                                            <>
                                              {new Date(
                                                subTaskItem.startDate
                                              ).toLocaleString('default', {
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
                                                  defaultDate: moment(
                                                    subTaskItem.startDate
                                                  ).format('MM-DD-YYYY'),
                                                  dateFormat: 'm-d-Y',
                                                  enable: [
                                                    function (date) {
                                                      const today = new Date(
                                                        new Date().setHours(
                                                          0,
                                                          0,
                                                          0,
                                                          0
                                                        )
                                                      );
                                                      return date >= today;
                                                    },
                                                    moment(
                                                      subTaskItem.startDate
                                                    ).format('MM-DD-YYYY'),
                                                  ],
                                                  altInput: true,
                                                  altFormat: 'M d',
                                                }}
                                                value={moment(
                                                  subTaskItem.startDate
                                                ).format('MM-DD-YYYY')}
                                                className='form-control invoice-edit-input due-date-picker'
                                                name='startDate'
                                                enableTime={false}
                                                onChange={(startDate) => {
                                                  handleUpdateStartDate(
                                                    subTaskItem,
                                                    startDate[0]
                                                  );
                                                }}
                                              />
                                            </div>
                                          )}
                                        </>
                                      ) : null}
                                    </div>
                                    <div className='end-date'>
                                      {subTaskItem.endDate ? (
                                        <>
                                          {subTaskItem?.completed ||
                                          subTaskItem?.trash ? (
                                            <>
                                              {new Date(
                                                subTaskItem.endDate
                                              ).toLocaleString('default', {
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
                                                  defaultDate: moment(
                                                    subTaskItem.endDate
                                                  ).format('MM-DD-YYYY'),
                                                  dateFormat: 'm-d-Y',
                                                  enable: [
                                                    function (date) {
                                                      const today = new Date(
                                                        new Date().setHours(
                                                          0,
                                                          0,
                                                          0,
                                                          0
                                                        )
                                                      );
                                                      return date >= today;
                                                    },
                                                    moment(
                                                      subTaskItem.endDate
                                                    ).format('MM-DD-YYYY'),
                                                  ],
                                                  altInput: true,
                                                  altFormat: 'M d',
                                                }}
                                                value={moment(
                                                  subTaskItem.endDate
                                                ).format('MM-DD-YYYY')}
                                                className='form-control invoice-edit-input due-date-picker'
                                                name='dueDate'
                                                enableTime={false}
                                                onChange={(dueDate) => {
                                                  handleUpdateDueDate(
                                                    subTaskItem,
                                                    dueDate[0]
                                                  );
                                                }}
                                              />
                                            </div>
                                          )}
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className='assignee-subtask-wrapper'>
                                <AssigneeInnerListDropdown
                                  item={subTaskItem}
                                  options={usersOptions.data}
                                  setSubTasks={setSubTasks}
                                  subTasks={subTasks}
                                />
                                <div className='down-up-btn-cell'>
                                  {openId === `${index}` ? (
                                    <div className='down-up-btn down-btn'>
                                      <ChevronUp
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggle();
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className='down-up-btn up-btn'>
                                      <ChevronDown
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggle(`${index}`);
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <AccordionBody
                                className='subtask-info-body'
                                accordionId={`${index}`}
                              >
                                <div className='subtask-info-wrapper'>
                                  <div className='subtask-info'>
                                    <label className='label'>TaskName:</label>{' '}
                                    <span className='value'>
                                      {subTaskItem?.name}
                                    </span>
                                  </div>
                                  <div className='subtask-info'>
                                    <label className='label'>Start Date:</label>
                                    <span className='value'>
                                      {getFormattedDate(subTaskItem.startDate)}
                                    </span>
                                  </div>
                                  <div className='subtask-info'>
                                    <label className='label'>End date:</label>
                                    <span className='value'>
                                      {getFormattedDate(subTaskItem.endDate)}
                                    </span>
                                  </div>
                                  <div className='subtask-info'>
                                    <label className='label'>
                                      Est Time To Complete:
                                    </label>
                                    <span className='value'>
                                      {subTaskItem?.est_time_complete}
                                    </span>
                                  </div>
                                  <div className='subtask-info'>
                                    <label className='label'>Contact:</label>
                                    <span className='value'>
                                      {subTaskItem?.contact
                                        ? `${
                                            subTaskItem?.contact?.firstName ||
                                            ''
                                          } ${
                                            subTaskItem?.contact?.lastName || ''
                                          }`
                                        : ''}
                                    </span>
                                  </div>
                                  <div className='subtask-info'>
                                    <label className='label'>Assigned:</label>
                                    <span className='value'>
                                      {(subTaskItem?.assigned || [])
                                        .map(
                                          (t) => `${t.firstName} ${t.lastName}`
                                        )
                                        .join(', ')}
                                    </span>
                                  </div>
                                  <div className='edit__btn'>
                                    <Edit
                                      className='subtask_edit__icon cursor-pointer'
                                      onClick={() => {
                                        setCurrentUpdateTask(subTaskItem);
                                        setDetailedAddSubTaskVisible(true);
                                      }}
                                    />
                                  </div>
                                </div>
                              </AccordionBody>
                            </div>
                          </div>
                        </AccordionItem>
                      );
                    })}
                </ReactSortable>
              </div>

              {detailedAddSubTaskVisible && (
                <TaskModal
                  isModalOpenFromSubtask
                  currentCategory={currentCategory}
                  initialContactData={initialContactData}
                  open={open}
                  setOpen={setOpen}
                  currentFilter={currentFilter}
                  setCurrentFilter={setCurrentFilter}
                  setCurrentTasks={setCurrentTasks}
                  setSubTasks={setSubTasks}
                  subTasks={subTasks}
                  setShowTaskModal={setDetailedAddSubTaskVisible}
                  showTaskModal={detailedAddSubTaskVisible}
                  editTask={currentUpdateTask}
                  setUpdateTask={setCurrentUpdateTask}
                  taskOptions={taskOptions}
                  currentTasks={currentTasks}
                  isSubTask={editTask}
                  setIsSubTask={setUpdateTask}
                  handleClearAddUpdateTask={handleClearAddUpdateSubTask}
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
            </Accordion>
          </PerfectScrollbar>
        </div>
      </div>
    </div>
  );
};

export default ModalSubtasks;
