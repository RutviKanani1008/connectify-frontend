import { useRef, useState } from 'react';
import { useGetKanbanTasksList } from '../service/task.services';
import _ from 'lodash';
export const useKanbanView = ({
  taskOptions,
  currentFilter,
  setCurrentUpdatedTaskStage,
  currentUpdatedTaskStage,
  updateTask,
  isSubTask,
  setIsSubTask,
  setTotalSnoozedTasks,
}) => {
  const [availableKanbanStagesAndTask, setAvailableKanbanStagesAndTask] =
    useState([]);
  const controller = useRef(null);
  const [kanbanTaskListLoading, setKanbanTaskListLoading] = useState(false);
  const { getKanbanTaskList } = useGetKanbanTasksList();

  const getKanbanTaskData = async (
    stageFilter = {},
    stageId = null,
    refreshToNewData = false
  ) => {
    let tempController = controller.current;
    if (tempController) {
      tempController.abort();
    }

    tempController = new AbortController();
    controller.current = tempController;

    const tempFilter = {
      ...currentFilter,
      limit: 10,
      ...stageFilter,
    };
    if (!Object.keys(stageFilter).length) {
      setKanbanTaskListLoading(true);
    }

    delete tempFilter?.subTaskSort;
    delete tempFilter?.includeSubTasks;

    const { data, error } = await getKanbanTaskList(
      {
        ...tempFilter,
      },
      tempController.signal
    );
    if (!error) {
      setKanbanTaskListLoading(false);
      const { tasks: taskDetails } = data;

      if (setTotalSnoozedTasks) {
        setTotalSnoozedTasks(data?.totalSnoozeTasks || 0);
      }

      if (stageId) {
        const tempTaskDetails = availableKanbanStagesAndTask.map(
          (stageDetail) => {
            if (stageDetail.id === stageId) {
              const tempId =
                stageDetail.id === 'unassigned'
                  ? null
                  : String(stageDetail?.stageDetails._id);
              const taskViewDetail = taskDetails.find(
                (task) => task[currentFilter.currentKanbanView] === tempId
              );

              // if(stage)

              return {
                ...stageDetail,
                cards:
                  [
                    ...(stageDetail?.cards?.length && !refreshToNewData
                      ? stageDetail?.cards
                      : []),
                    ...(taskViewDetail?.tasks.length
                      ? taskViewDetail?.tasks
                      : []),
                  ] || [],
                totalCount: taskViewDetail?.totalCount || 0,
                hasMoreContacts: taskViewDetail?.hasMoreContacts || false,
              };
            }
            return { ...stageDetail };
          }
        );
        setAvailableKanbanStagesAndTask(tempTaskDetails);
      } else {
        const availableTaskOptions = taskOptions.filter(
          (taskOption) => taskOption.type === currentFilter.currentKanbanView
        );
        const tempTaskDetails = availableTaskOptions
          ?.sort(({ order: a, order: b }) => a - b)
          ?.map((stageDetail) => {
            const tempId =
              stageDetail._id === 'unassigned' ? null : String(stageDetail._id);
            const taskViewDetail = taskDetails.find(
              (task) => task[currentFilter.currentKanbanView] === tempId
            );

            // const optionDetails = taskOptions.

            return {
              id: stageDetail?._id,
              title: stageDetail.label,
              cards: taskViewDetail?.tasks || [],
              totalCount: taskViewDetail?.totalCount || 0,
              hasMoreContacts: taskViewDetail?.hasMoreContacts || false,
              stageDetails: {
                ...stageDetail,
              },
            };
          });
        setAvailableKanbanStagesAndTask(tempTaskDetails);
      }
    }
  };

  const handleTaskOptionsUpdate = () => {
    if (!!taskOptions.length && !!availableKanbanStagesAndTask.length) {
      const availableTaskOptions = taskOptions.filter(
        (taskOption) => taskOption.type === currentFilter.currentKanbanView
      );
      const tempTaskDetails = availableTaskOptions.map((stageDetail) => {
        const taskViewDetail = availableKanbanStagesAndTask.find(
          (task) => task.id === String(stageDetail._id)
        );

        if (taskViewDetail) {
          return {
            id: stageDetail?._id,
            title: stageDetail.label,
            cards: taskViewDetail?.cards || [],
            totalCount: taskViewDetail?.totalCount || 0,
            hasMoreContacts: taskViewDetail?.hasMoreContacts || false,
            stageDetails: {
              ...stageDetail,
            },
          };
        } else {
          return {
            id: stageDetail?._id,
            title: stageDetail.label,
            cards: [],
            totalCount: 0,
            hasMoreContacts: false,
            stageDetails: {
              ...stageDetail,
            },
          };
        }
      });
      setAvailableKanbanStagesAndTask(tempTaskDetails);
    }
  };

  const handleTaskUpdate = (updatedTaskDetail) => {
    if (
      updateTask?._id &&
      updatedTaskDetail &&
      currentUpdatedTaskStage?.stageDetail &&
      currentUpdatedTaskStage?.taskDetails
    ) {
      const { taskDetails } = currentUpdatedTaskStage;
      // Update task after task modal is closed.
      const tempStagesAndTasks = JSON.parse(
        JSON.stringify([...availableKanbanStagesAndTask])
      );
      if (
        (currentUpdatedTaskStage?.stageDetail?.label === 'Unassigned' &&
          updatedTaskDetail[currentFilter.currentKanbanView] === null) ||
        taskDetails[currentFilter.currentKanbanView]?._id ===
          updatedTaskDetail[currentFilter.currentKanbanView] ||
        isSubTask
      ) {
        tempStagesAndTasks.forEach((individualStage) => {
          // Stage where the current task is there.
          if (
            individualStage.stageDetails?._id ===
              currentUpdatedTaskStage?.stageDetail?._id &&
            individualStage.cards?.length
          ) {
            individualStage.cards = individualStage?.cards?.map(
              (taskDetail) => {
                if (
                  taskDetail?._id ===
                    currentUpdatedTaskStage?.taskDetails?._id ||
                  isSubTask === taskDetail?._id
                ) {
                  return {
                    ...(isSubTask
                      ? {
                          ...taskDetail,
                          totalSubTasks: taskDetail?.totalSubTasks || 0,
                          sub_tasks: taskDetail?.sub_tasks?.map((subTask) => {
                            if (subTask?._id === updatedTaskDetail?._id) {
                              subTask.name = updatedTaskDetail?.name;
                            }
                            return subTask;
                          }),
                        }
                      : {
                          ...updatedTaskDetail,
                          sub_tasks: taskDetail?.sub_tasks || [],
                          totalSubTasks: taskDetail?.totalSubTasks || 0,
                          status:
                            taskOptions?.find(
                              (option) =>
                                option.type === 'status' &&
                                option._id === updatedTaskDetail?.status
                            ) || null,
                          priority:
                            taskOptions?.find(
                              (option) =>
                                option.type === 'priority' &&
                                option._id === updatedTaskDetail?.priority
                            ) || null,
                          category:
                            taskOptions?.find(
                              (option) =>
                                option.type === 'category' &&
                                option._id === updatedTaskDetail?.category
                            ) || null,
                        }),
                  };
                }
                return taskDetail;
              }
            );
          }
        });
      } else {
        // It change the stage details.
        tempStagesAndTasks.forEach((individualStage) => {
          // Remove task from the old stage
          if (
            individualStage.stageDetails?._id ===
              currentUpdatedTaskStage?.stageDetail?._id &&
            individualStage.cards?.length
          ) {
            individualStage.cards = individualStage.cards.filter(
              (taskDetail) =>
                taskDetail?._id !== currentUpdatedTaskStage?.taskDetails?._id
            );
          }
          // Add the task to new stage
          if (
            (updatedTaskDetail[currentFilter.currentKanbanView] &&
              updatedTaskDetail[currentFilter.currentKanbanView] ===
                individualStage.stageDetails?._id) ||
            (currentFilter.currentKanbanView === 'category' &&
              !updatedTaskDetail[currentFilter.currentKanbanView])
          ) {
            const tempTask = {
              ...updatedTaskDetail,
              status:
                taskOptions?.find(
                  (option) =>
                    option.type === 'status' &&
                    option._id === updatedTaskDetail?.status
                ) || null,
              priority:
                taskOptions?.find(
                  (option) =>
                    option.type === 'priority' &&
                    option._id === updatedTaskDetail?.priority
                ) || null,
              category:
                taskOptions?.find(
                  (option) =>
                    option.type === 'category' &&
                    option._id === updatedTaskDetail?.category
                ) || null,
              // contact: updatedTaskDetail?.contact?.[0] || null,
            };
            if (individualStage.cards.length) {
              individualStage.cards.push(tempTask);
            } else {
              individualStage.cards = [tempTask];
            }
          }
        });
      }
      setIsSubTask(false);

      setAvailableKanbanStagesAndTask(tempStagesAndTasks);
    } else {
      const tempStagesAndTasks = JSON.parse(
        JSON.stringify([...availableKanbanStagesAndTask])
      );
      if (_.isArray(updatedTaskDetail) && updatedTaskDetail) {
        updatedTaskDetail.forEach((taskDetail) => {
          let isUpdated = false;
          tempStagesAndTasks.forEach((currentStageTaskDetail) => {
            if (
              (taskDetail[currentFilter.currentKanbanView] &&
                taskDetail[currentFilter.currentKanbanView] ===
                  currentStageTaskDetail.stageDetails?._id) ||
              (currentFilter.currentKanbanView === 'category' &&
                !taskDetail[currentFilter.currentKanbanView] &&
                !isUpdated)
            ) {
              const tempTask = {
                ...taskDetail,
                status:
                  taskOptions?.find(
                    (option) =>
                      option.type === 'status' &&
                      option._id === taskDetail?.status
                  ) || null,
                priority:
                  taskOptions?.find(
                    (option) =>
                      option.type === 'priority' &&
                      option._id === taskDetail?.priority
                  ) || null,
                category:
                  taskOptions?.find(
                    (option) =>
                      option.type === 'category' &&
                      option._id === taskDetail?.category
                  ) || null,
                // contact: updatedTaskDetail?.contact?.[0] || null,
              };
              if (currentStageTaskDetail.cards.length) {
                currentStageTaskDetail.cards.push(tempTask);
              } else {
                currentStageTaskDetail.cards = [tempTask];
              }
              isUpdated = true;
            }
          });
        });
        setAvailableKanbanStagesAndTask(tempStagesAndTasks);
      }
    }
    setCurrentUpdatedTaskStage({
      stageDetail: null,
      taskDetails: null,
    });
  };

  const handleAbortTaskRequest = () => {
    if (controller.current) {
      controller.current?.abort();
    }
  };

  return {
    getKanbanTaskData,
    availableKanbanStagesAndTask,
    handleTaskOptionsUpdate,
    handleTaskUpdate,
    setAvailableKanbanStagesAndTask,
    kanbanTaskListLoading,
    handleAbortTaskRequest,
  };
};
