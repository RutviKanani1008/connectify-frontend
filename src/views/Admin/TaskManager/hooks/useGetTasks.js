import _ from 'lodash';
import { useGetTasksList } from '../service/task.services';
import { useState } from 'react';

const useGetTasks = ({
  currentFilterRef,
  user,
  // setCurrentFilter,
  expandAllTask,
  currentFilter,
  currentTasks,
  setAllTasks,
  expandAll,
  allTasks,
  setIsLoadingVisible,
  setCurrentTasks,
  // setOpen,
  setCurrentTaskPagination,
  currentTaskPagination,
  setTotalSnoozedTasks = false,
}) => {
  // API SERVICE
  const { getTaskList: getParentTaskList, isLoading } = useGetTasksList();
  const [controller, setController] = useState(null);

  const getTasks = async (args) => {
    try {
      // setOpen([]);
      const tempCurrentFilter = {};
      let filterValues = {};
      if (_.isObject(currentFilterRef.current)) {
        filterValues = { ...currentFilterRef.current };
      }

      // here filter by not null values
      Object.keys(filterValues).map((key) => {
        if (filterValues[key] !== null && key !== 'loadMore') {
          tempCurrentFilter[key] = filterValues[key];
        }
      });
      let tempController = controller;
      if (tempController) {
        tempController.abort();
      }
      tempController = new AbortController();
      setController(tempController);
      let result = {};
      if (
        tempCurrentFilter.trash === true ||
        tempCurrentFilter.snoozedTask === true
      ) {
        result = await getParentTaskList(
          {
            trash: true,
            ...tempCurrentFilter,
            company: user?.company?._id,
            select:
              'name,details,startDate,endDate,priority,status,category,parent_task,trash,completed,completedAt,contact,assigned,taskNumber,snoozeUntil,hideSnoozeTask',
          },
          tempController.signal
        );
      } else if (tempCurrentFilter.completed) {
        result = await getParentTaskList(
          {
            trash: false,
            completed: true,
            ...tempCurrentFilter,
            company: user?.company?._id,
            select:
              'name,details,startDate,endDate,priority,status,parent_task,trash,completed,completedAt,contact,assigned,taskNumber,snoozeUntil,hideSnoozeTask',
          },
          tempController.signal
        );
      } else {
        result = await getParentTaskList(
          {
            company: user?.company?._id,
            select:
              'name,details,startDate,endDate,priority,status,category,parent_task,trash,completed,completedAt,contact,assigned,taskNumber,snoozeUntil,hideSnoozeTask',
            ...tempCurrentFilter,
            parent_task: '',
          },
          tempController.signal
        );
      }
      const { data, error } = result;

      if (!error && _.isArray(data?.tasks)) {
        tempController.abort();
        if (setTotalSnoozedTasks) {
          setTotalSnoozedTasks(data?.totalSnoozeTasks || 0);
        }
        if (data?.tasks?.length < 20) {
          currentFilterRef.current = {
            ...currentFilterRef.current,
            loadMore: false,
          };
          setCurrentTaskPagination({
            ...currentTaskPagination,
            loadMore: false,
            pagination: data?.pagination,
          });
          // setCurrentFilter({
          //   ...currentFilterRef.current,
          //   loadMore: false,
          //   pagination: data?.pagination,
          // });
        } else {
          setCurrentTaskPagination({
            ...currentTaskPagination,
            loadMore: true,
            pagination: data?.pagination,
          });

          // setCurrentFilter({
          //   ...currentFilterRef.current,
          //   loadMore: true,
          //   pagination: data?.pagination,
          // });
          currentFilterRef.current = {
            ...currentFilterRef.current,
            loadMore: true,
          };
        }
        if (expandAll) {
          await expandAllTask(data?.tasks);
        }

        let newTasks =
          currentFilter.page === 1 || args?.page === 1
            ? [...data?.tasks]
            : [...currentTasks, ...data?.tasks];

        newTasks = [
          ...new Map(newTasks.map((item) => [item?._id, item])).values(),
        ];

        // here set value in allTask obj if new value arrival & remove then remove it and add it
        const tempAllTasks = [...allTasks];

        newTasks.forEach((obj) => {
          const index = tempAllTasks.findIndex(
            (innerObj) => obj._id === innerObj._id
          );
          if (index) {
            tempAllTasks[index] = obj;
          } else {
            tempAllTasks.push(obj);
          }
        });

        setAllTasks([...tempAllTasks]);

        setCurrentTasks(newTasks);
      }
      if (error !== 'Error while processing') {
        setIsLoadingVisible(true);
      }
    } catch (error) {
      console.log('Error:getTasks', error);
    }
  };

  return { getTasks, isLoading };
};

export default useGetTasks;
