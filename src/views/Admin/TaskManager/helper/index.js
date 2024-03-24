import {
  handleDailyEvents,
  handleMonthlyEvents,
  handleWeeklyEvents,
  handleYearlyEvents,
} from '../../event/helper/eventHelper';
import { AVAILABLE_TASK_MANAGER_VIEW } from '../TaskManager';

export const createTaskBasedOnScheduler = ({ scheduleData, taskData }) => {
  switch (scheduleData.schedule.value) {
    case 'never': {
      taskData = { ...taskData, frequency: 'never' };
      return arrangeTheTaskDateWise({
        dates: {
          startDates: [taskData.startDate],
          endDates: [taskData.endDate],
        },
        taskData,
      });
    }
    case 'daily': {
      taskData = { ...taskData, frequency: 'daily' };
      const dates = handleDailyEvents(
        taskData.startDate,
        taskData.endDate,
        scheduleData
      );

      return arrangeTheTaskDateWise({ dates, taskData });
    }
    case 'weekly': {
      taskData = { ...taskData, frequency: 'weekly' };
      const dates = handleWeeklyEvents(
        taskData.startDate,
        taskData.endDate,
        scheduleData
      );
      return arrangeTheTaskDateWise({ dates, taskData });
    }
    case 'monthly': {
      taskData = { ...taskData, frequency: 'monthly' };
      const dates = handleMonthlyEvents(
        taskData.startDate,
        taskData.endDate,
        scheduleData
      );
      return arrangeTheTaskDateWise({ dates, taskData });
    }
    case 'yearly': {
      taskData = { ...taskData, frequency: 'yearly' };
      const dates = handleYearlyEvents(
        taskData.startDate,
        taskData.endDate,
        scheduleData
      );
      return arrangeTheTaskDateWise({ dates, taskData });
    }
  }
};

const arrangeTheTaskDateWise = ({ dates, taskData }) => {
  const tasks = dates.startDates.map((startDate, index) => ({
    assigned: taskData.assigned,
    attachments: taskData?.attachments,
    frequency: taskData?.frequency,
    contact: taskData.contact,
    details: taskData.details,
    priority: taskData.priority,
    category: taskData?.category || null,
    startDate,
    endDate: dates.endDates[index],
    est_time_complete: taskData.est_time_complete,
    name: taskData.name,
    status: taskData.status,
    completed: taskData?.completed || false,
    checklistDetails: taskData?.checklistDetails || null,
    order: 0,
    ...(taskData.parent_task && { parent_task: taskData.parent_task }),
  }));
  return tasks;
};

export const getInitialFilters = ({ initialUserData, initialContactData }) => {
  const initialFilters = {
    status: [],
    category: [],
    tempCategory: [],
    priority: [],
    group: null,
    groupStatus: null,
    groupCategory: null,
    tags: [],
    pipeline: null,
    pipelineStage: null,
    frequency: null,
    trash: false,
    completed: false,
    open: true,
    assigned: initialUserData._id ? initialUserData?._id : null,
    contact: initialContactData?._id ? initialContactData?._id : null,
    search: '',
    includeSubTasks: true,
    sort: { column: '', order: null },
    subTaskSort: {},
    snoozedTask: false,
    currentView: AVAILABLE_TASK_MANAGER_VIEW.normalView.value,
    startDate: null,
    endDate: null,
  };

  return initialFilters;
};
