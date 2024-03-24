import FullCalendar from '@fullcalendar/react';
import { useEffect, useRef, useState } from 'react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useGetCalendarTasks from '../hooks/useCalendarViewTask';
import UILoader from '@components/ui-loader';
import TaskModal from './TaskModal/TaskModal';
import { useGetTaskOptions } from '../hooks/useGetTaskOptions';
import { useGetCompanyUsers } from '../service/userApis';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { useCreateTaskNotifyUsers } from '../service/taskNotifyUsers.services';
import _ from 'lodash';
import { Input, Label } from 'reactstrap';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { encrypt } from '../../../../helper/common.helper';

export const TaskCalenderView = ({
  currentFilter,
  showTaskModal,
  setShowTaskModal,
  updateTask,
  setUpdateTask,
  handleClearAddUpdateTask,
  setCurrentFilter,
}) => {
  // ** Redux **
  const user = useSelector(userData);

  // ** Hooks **
  const history = useHistory();

  const [calendarDateFilter, setCalenderDateFilter] = useState({
    startDate: true,
    endDate: true,
  });
  const isInitialLoad = useRef(true);
  const calendarRef = useRef(null);
  const { getTaskOptions, taskOptions, setTaskOptions } = useGetTaskOptions();
  const { getCompanyUsers } = useGetCompanyUsers();
  const { notifyUsers } = useCreateTaskNotifyUsers();

  const {
    getCalenderTaskData,
    calenderTasksData,
    calenderTasksLoading,
    handleAbortTaskRequest,
  } = useGetCalendarTasks({
    calendarRef,
    currentFilter,
    setCurrentFilter,
  });

  useEffect(() => {
    if (currentFilter) {
      getCalenderTaskData();
      isInitialLoad.current = false;
    }
    return () => {
      handleAbortTaskRequest();
    };
  }, [
    currentFilter.search,
    currentFilter.open,
    currentFilter.priority?.length,
    currentFilter.status?.length,
    currentFilter.category.length,
    currentFilter.trash,
    currentFilter.snoozedTask,
    currentFilter.contact,
    currentFilter.frequency,
    currentFilter.assigned,
    currentFilter.group,
    currentFilter.groupStatus,
    currentFilter.groupCategory,
    currentFilter.tags,
    currentFilter.pipeline,
    currentFilter.pipelineStage,
  ]);
  useEffect(() => {
    getTaskOptions();
  }, []);

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

  const calendarOptions = {
    datesSet(info) {
      if (!isInitialLoad.current) {
        getCalenderTaskData(info.start, info.end);
      }
    },
    events:
      calenderTasksData?.length > 0
        ? calenderTasksData?.map((task) => {
            if (calendarDateFilter.startDate && calendarDateFilter.endDate) {
              task.start = new Date(
                moment(task.startDate).format('YYYY-MM-DD')
              );
              task.end = new Date(moment(task.endDate).format('YYYY-MM-DD'));
              return task;
            } else {
              if (calendarDateFilter.startDate) {
                task.end = null;
              } else {
                task.end = new Date(moment(task.endDate).format('YYYY-MM-DD'));
              }

              if (calendarDateFilter.endDate) {
                task.start = new Date(
                  moment(task.endDate).format('YYYY-MM-DD')
                );
              } else {
                task.start = new Date(
                  moment(task.startDate).format('YYYY-MM-DD')
                );
              }
            }
            return task;
          })
        : [],
    defaultView: 'dayGridMonth',
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      start: 'prev,next,title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
    },
    scrollTime: '00:00:00',
    editable: false,
    eventResizableFromStart: false,
    dragScroll: false,
    dayMaxEvents: 2,
    eventMaxStack: 2,
    navLinks: true,
    eventContent: (taskDetail) => {
      const { extendedProps } = taskDetail.event?._def;
      const contactFullName = `${
        extendedProps?.contact
          ? `${
              extendedProps?.contact?.firstName ||
              extendedProps?.contact?.lastName
                ? `${extendedProps?.contact?.firstName} ${extendedProps?.contact?.lastName}`.trim()
                : `${extendedProps?.contact?.email}`
            } `
          : ''
      }`;
      const priorityDetail =
        taskDetail?.event?._def?.extendedProps?.priorityObj?.[0];

      return (
        <div
          className='fc-event-task'
          onClick={() => {
            setUpdateTask(extendedProps);
            setShowTaskModal(true);
            // Here set the URL
            const url = new URL(window.location);
            url.searchParams.set('task', encrypt(extendedProps._id));
            history.push({
              pathname: history?.location?.pathname,
              search: url.searchParams.toString(),
            });
          }}
        >
          <span
            className='bg-wrapper'
            style={{ backgroundColor: priorityDetail?.color }}
          ></span>
          <span
            className='line-wrapper'
            style={{ backgroundColor: priorityDetail?.color }}
          ></span>
          <span
            className='border-wrapper'
            style={{ border: `1px solid ${priorityDetail?.color}` }}
          ></span>
          <span className='text' style={{ color: priorityDetail?.color }}>
            #{extendedProps?.taskNumber} {extendedProps?.contact && '|'}{' '}
            {contactFullName} | {extendedProps?.name}
          </span>
        </div>
      );
    },
    ref: calendarRef,
  };
  return (
    <>
      <UILoader blocking={calenderTasksLoading}>
        <div className='startDate-endDate-wrapper'>
          <div className='startDate-endDate-item'>
            <Input
              disabled={false}
              type='checkbox'
              onChange={(e) => e.stopPropagation()}
              checked={calendarDateFilter.startDate}
              onClick={(value) => {
                if (!value.target.checked && !calendarDateFilter.endDate) {
                  setCalenderDateFilter({
                    ...calendarDateFilter,
                    endDate: true,
                    startDate: !calendarDateFilter.startDate,
                  });
                } else {
                  //
                  setCalenderDateFilter({
                    ...calendarDateFilter,
                    startDate: !calendarDateFilter.startDate,
                  });
                }
              }}
            />
            <Label onClick={(e) => e.stopPropagation()} for={`Start Date`}>
              Start Date
            </Label>
          </div>
          <div className='startDate-endDate-item'>
            <Input
              disabled={false}
              type='checkbox'
              onChange={(e) => e.stopPropagation()}
              checked={calendarDateFilter.endDate}
              onClick={(value) => {
                if (!value.target.checked && !calendarDateFilter.startDate) {
                  setCalenderDateFilter({
                    ...calendarDateFilter,
                    startDate: true,
                    endDate: !calendarDateFilter.endDate,
                  });
                } else {
                  //
                  setCalenderDateFilter({
                    ...calendarDateFilter,
                    endDate: !calendarDateFilter.endDate,
                  });
                }
              }}
            />
            <Label onClick={(e) => e.stopPropagation()} for={`End Date`}>
              End Date
            </Label>
          </div>
        </div>
        <FullCalendar {...calendarOptions} />
      </UILoader>
      <TaskModal
        setOpen={() => {}}
        currentFilter={currentFilter}
        setCurrentTasks={() => {}}
        setShowTaskModal={setShowTaskModal}
        showTaskModal={showTaskModal}
        taskOptions={taskOptions}
        setTaskOptions={setTaskOptions}
        currentTasks={calenderTasksData}
        handleClearAddUpdateTask={() => {
          handleClearAddUpdateTask();
          setShowTaskModal(false);
          setUpdateTask(false);
          getCalenderTaskData();
        }}
        notifyUserForNewTask={notifyUserForNewTask}
        setCurrentTaskPagination={() => {}}
        setIsSubTask={() => {}}
        editTask={updateTask}
        setUpdateTask={setUpdateTask}
        isSubTask={false}
      />
    </>
  );
};
