import { useRef, useState } from 'react';
import { useGetCalenderTasksList } from '../service/task.services';
import moment from 'moment';

const useGetCalendarTasks = ({
  calendarRef,
  currentFilter,
  setCurrentFilter,
}) => {
  const { getCalenderTaskList, isLoading: calenderTasksLoading } =
    useGetCalenderTasksList();
  const controller = useRef(null);
  const [calenderTasksData, setCalenderTasksData] = useState([]);

  const getCalenderTaskData = async (
    start = calendarRef.current.getApi().currentDataManager.data.viewApi
      .activeStart,
    end = calendarRef.current.getApi().currentDataManager.data.viewApi.activeEnd
  ) => {
    let tempController = controller.current;
    if (tempController) {
      tempController.abort();
    }

    tempController = new AbortController();
    controller.current = tempController;

    const tempFilter = {
      ...currentFilter,
    };

    delete tempFilter?.subTaskSort;
    delete tempFilter?.includeSubTasks;

    const { data, error } = await getCalenderTaskList(
      {
        ...tempFilter,
        startDate: start,
        endDate: end,
        select: 'startDate,endDate,name',
      },
      tempController.signal
    );
    if (!error && data.tasks) {
      const tempTasks = [...data.tasks];
      tempTasks.forEach((task) => {
        task.start = new Date(moment(task.startDate).format('YYYY-MM-DD'));
        task.end = new Date(moment(task.endDate).format('YYYY-MM-DD'));
      });
      setCurrentFilter({
        ...currentFilter,
        startDate: start,
        endDate: end,
      });
      setCalenderTasksData(tempTasks);
    }
  };

  const handleAbortTaskRequest = () => {
    if (controller.current) {
      controller.current?.abort();
    }
  };
  return {
    getCalenderTaskData,
    calenderTasksLoading,
    calenderTasksData,
    handleAbortTaskRequest,
  };
};

export default useGetCalendarTasks;
