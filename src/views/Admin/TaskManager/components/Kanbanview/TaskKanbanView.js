import { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useKanbanView } from '../../hooks/useKanbanViewTask';
import TaskKanbanViewColumn from './TaskKanbanViewColumn';
import TaskModal from '../TaskModal/TaskModal';
import { useGetCompanyUsers } from '../../service/userApis';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';
import { useCreateTaskNotifyUsers } from '../../service/taskNotifyUsers.services';
import _ from 'lodash';
import {
  useDeleteSnoozeTask,
  useDeleteTask,
  useKanbanTaskReOrderTask,
  useUpdateTask,
} from '../../service/task.services';
import { Spinner } from 'reactstrap';
import TaskParentChangeModal from '../TaskParentChangeModal';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import TaskUpdateModal from '../TaskUpdateModal';
import { SnoozeTaskModal } from '../SnoozeTaskModal';
import { useReOrderTaskOption } from '../../service/taskOption.services';
import { useHistory } from 'react-router-dom';
import { Plus } from 'react-feather';
import { encrypt } from '../../../../../helper/common.helper';

export const AVAILABLE_KANBAN_ORDER = {
  category: 'kanbanCategoryOrder',
  priority: 'kanbanPriorityOrder',
  status: 'kanbanStatusOrder',
};

export const TaskKanbanView = ({
  taskOptions,
  currentFilter,
  handleTaskOptions,
  handleOptionDelete,
  setUpdateTask,
  setShowTaskModal,
  showTaskModal,
  setTaskOptions,
  handleClearAddUpdateTask,
  updateTask,
  setIsSubTask,
  isSubTask,
  setTotalSnoozedTasks,
  taskOptionLoading,
}) => {
  const history = useHistory();

  const [currentUpdatedTaskStage, setCurrentUpdatedTaskStage] = useState({
    stageDetail: null,
    taskDetails: null,
  });
  const [changeParentModalVisible, setChangeParentModalVisible] =
    useState(false);

  const [showTaskUpdates, setShowTaskUpdates] = useState({
    isOpen: false,
    taskDetail: null,
  });

  const [showSnoozeTaskModal, setShowSnoozeTaskModal] = useState({
    isOpen: false,
    taskDetail: null,
    stageDetail: null,
  });

  const [kanabanViewAddTaskDetails, setKanbanViewAddTaskDetails] =
    useState(null);
  const { deleteTask } = useDeleteTask();

  const {
    getKanbanTaskData,
    availableKanbanStagesAndTask,
    handleTaskOptionsUpdate,
    handleTaskUpdate,
    setAvailableKanbanStagesAndTask,
    kanbanTaskListLoading,
    handleAbortTaskRequest,
  } = useKanbanView({
    taskOptions,
    currentFilter,
    setCurrentUpdatedTaskStage,
    currentUpdatedTaskStage,
    updateTask,
    isSubTask,
    setIsSubTask,
    setTotalSnoozedTasks,
  });
  const { getCompanyUsers } = useGetCompanyUsers();
  const user = useSelector(userData);
  const { notifyUsers } = useCreateTaskNotifyUsers();
  const { updateTask: updateTaskDetail } = useUpdateTask();
  const { kanbanTaskReOrderTask } = useKanbanTaskReOrderTask();
  const { deleteSnoozeTask } = useDeleteSnoozeTask();
  const { reOrderTaskOption } = useReOrderTaskOption();

  useEffect(() => {
    if (taskOptions.length) {
      handleTaskOptionsUpdate();
    }
  }, [taskOptions]);

  useEffect(() => {
    getKanbanTaskData();

    return () => {
      handleAbortTaskRequest();
    };
  }, [
    currentFilter.currentKanbanView,
    currentFilter.search,
    currentFilter.open,
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

  const loadMoreData = (stageId) => {
    const cardsLength = availableKanbanStagesAndTask.find(
      (obj) => obj.id === stageId
    ).cards.length;
    getKanbanTaskData(
      {
        [currentFilter.currentKanbanView]: [stageId],
        page: Math.round(cardsLength / 10) + 1,
      },
      stageId
    );
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

  const handleStageTasksChange = ({
    source,
    destination,
    destinationStageDetails,
    sourceStageDetails,
  }) => {
    const tempStages = [...availableKanbanStagesAndTask];
    tempStages.forEach((stages) => {
      if (stages.id === destination.droppableId) {
        stages.cards = destinationStageDetails?.cards;
      }
      if (stages.id === source?.droppableId) {
        stages.cards = sourceStageDetails?.cards;
      }
    });
    setAvailableKanbanStagesAndTask(tempStages);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination?.index === source?.index &&
        destination?.droppableId === source?.droppableId) ||
      draggableId === 'unassigned'
    ) {
      return null;
    }
    if (result?.type === 'DEFAULT') {
      if (destination?.droppableId === source?.droppableId) {
        // Move card in same stage
        const kanbanStages = Array.from(availableKanbanStagesAndTask || []);
        const sourceStageDetails = kanbanStages.find(
          (s) => s.id === source.droppableId
        );

        if (sourceStageDetails?.cards?.length) {
          const [removed] = sourceStageDetails?.cards.splice(source?.index, 1);
          sourceStageDetails?.cards?.splice(destination.index, 0, removed);

          const updatedTaskOrder = [];
          sourceStageDetails?.cards.forEach((taskCard, index) => {
            if (
              (index >= destination.index && index <= source.index) ||
              (index >= source.index && index <= destination.index)
            ) {
              updatedTaskOrder.push({
                _id: taskCard?._id,
                [AVAILABLE_KANBAN_ORDER[[currentFilter.currentKanbanView]]]:
                  index,
              });
            }
          });

          if (updatedTaskOrder.length) {
            await kanbanTaskReOrderTask(updatedTaskOrder);
          }
        }
      } else {
        const kanbanStages = Array.from(availableKanbanStagesAndTask || []);
        if (destination?.droppableId !== source?.droppableId) {
          // Change stage
          const sourceStageDetails = kanbanStages.find(
            (s) => s.id === source.droppableId
          );

          const destinationStageDetails = kanbanStages.find(
            (s) => s.id === destination.droppableId
          );

          if (sourceStageDetails?.cards?.length) {
            const taskDetail = sourceStageDetails?.cards?.find(
              (task, index) => index === source?.index
            );

            if (taskDetail) {
              // Change order status.
              const updatedTaskOrder = [];

              sourceStageDetails?.cards.forEach((task, index) => {
                if (index > source?.index) {
                  updatedTaskOrder.push({
                    _id: task?._id,
                    [AVAILABLE_KANBAN_ORDER[[currentFilter.currentKanbanView]]]:
                      index,
                  });
                }
              });
              // Move tasked to destination stage internally
              const [removed] = sourceStageDetails?.cards.splice(
                source?.index,
                1
              );
              removed[currentFilter.currentKanbanView] =
                destinationStageDetails?.stageDetails;
              destinationStageDetails?.cards?.splice(
                destination.index,
                0,
                removed
              );

              // Update task status
              const taskUpdateObj = {};
              taskUpdateObj[currentFilter.currentKanbanView] =
                destination?.droppableId === 'unassigned'
                  ? null
                  : destination.droppableId;

              destinationStageDetails?.cards.forEach((task, index) => {
                if (index >= destination?.index) {
                  updatedTaskOrder.push({
                    _id: task?._id,
                    [AVAILABLE_KANBAN_ORDER[[currentFilter.currentKanbanView]]]:
                      index,
                  });
                }
              });
              const { error } = await updateTaskDetail(
                taskDetail?._id,
                taskUpdateObj
              );
              if (error) {
                // Undo last task stage move
                const [removed] = destinationStageDetails?.cards?.splice(
                  destination.index,
                  1
                );
                sourceStageDetails?.cards.splice(source?.index, 0, removed);

                handleStageTasksChange({
                  source,
                  destination,
                  destinationStageDetails,
                  sourceStageDetails,
                });
              } else {
                if (updatedTaskOrder.length) {
                  await kanbanTaskReOrderTask(updatedTaskOrder);
                }
              }
            }
          }
        }
      }
    }
    if (result?.type === 'COLUMN') {
      // Update Taskoption orders.
      const tempTaskOptions = taskOptions.filter(
        (option) => option.type === currentFilter?.currentKanbanView
      );

      const [removed] = tempTaskOptions.splice(source?.index, 1);

      tempTaskOptions?.splice(destination.index, 0, removed);
      await reOrderTaskOption(
        tempTaskOptions?.filter((option) => option?._id !== 'unassigned')
      );
      setTaskOptions(tempTaskOptions);

      // Update stage options
      const kanbanStages = Array.from(availableKanbanStagesAndTask || []);
      const [removedStage] = kanbanStages.splice(source?.index, 1);
      kanbanStages?.splice(destination.index, 0, removedStage);
    }
  };

  const handleChangeParentModal = (task, isSubTask = false) => {
    setChangeParentModalVisible(true);
    setUpdateTask(task);
    setIsSubTask(isSubTask);
  };

  const clearChangeParentModal = () => {
    setUpdateTask(false);
    setIsSubTask(false);
    setChangeParentModalVisible(false);
    const url = new URL(window.location);

    url.searchParams.delete('task');
    url.searchParams.delete('update');
    history.push({
      pathname: history?.location?.pathname,
      search: url.searchParams.toString(),
    });
  };

  const handleTaskDelete = async (item, stageId) => {
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
        const tempStages = [...availableKanbanStagesAndTask];
        tempStages.forEach((stages) => {
          if (stages.id === stageId) {
            stages.cards = stages.cards.filter(
              (card) => card._id !== item?._id
            );
          }
        });
        setAvailableKanbanStagesAndTask(tempStages);
      }
    }
  };

  const handleUpdateTask = (item = null) => {
    setShowTaskUpdates({
      isOpen: true,
      taskDetail: item,
    });
  };

  const handleSnoozeTask = (item = null, stage = null) => {
    setShowSnoozeTaskModal({
      isOpen: true,
      taskDetail: item,
      stageDetail: stage,
    });
  };

  const handleCloseSnoozeModal = (isSnoozed = null) => {
    if (isSnoozed) {
      const tempStages = [...availableKanbanStagesAndTask];
      tempStages.forEach((stages) => {
        if (stages.id === showSnoozeTaskModal.stageDetail) {
          stages.cards = stages.cards.filter(
            (task) => task._id !== showSnoozeTaskModal.taskDetail?._id
          );
        }
      });
      setAvailableKanbanStagesAndTask(tempStages);
    }
    setShowSnoozeTaskModal({
      isOpen: false,
      taskDetail: null,
      stageDetail: null,
    });
  };

  const handleCompleteTask = async (
    task = null,
    checked = null,
    stageDetail = null
  ) => {
    const result = await showWarnAlert({
      text: checked
        ? 'Are you sure you want to archive this task?'
        : 'Are you sure you want to remove this task from archived list?',
      confirmButtonText: 'Yes',
    });

    if (result.value) {
      task.completed = checked;
      if (task.contact) {
        delete task.contact;
      }
      if (task.assigned) {
        delete task.assigned;
      }
      if (task.createdBy) {
        delete task.createdBy;
      }
      task.message = checked
        ? 'Task archived successfully.'
        : 'Task reopen successfully.';
      const { error } = await updateTaskDetail(task._id, task, 'Loading...');
      if (!error) {
        const tempStages = [...availableKanbanStagesAndTask];
        tempStages.forEach((stages) => {
          if (stages.id === stageDetail) {
            stages.cards = stages.cards.filter(
              (taskDetail) => taskDetail._id !== task?._id
            );
          }
        });
        setAvailableKanbanStagesAndTask(tempStages);
      }
    }
  };

  const handleSnoozeOffTasks = async (snoozeTaskDetail, stageDetail = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to unsnooze this task?',
    });
    if (result.value) {
      const { error } = await deleteSnoozeTask(
        snoozeTaskDetail?.snoozeDetail?._id
      );
      if (!error) {
        const tempStages = [...availableKanbanStagesAndTask];
        tempStages.forEach((stages) => {
          if (stages.id === stageDetail) {
            stages.cards = stages.cards.filter(
              (task) => task._id !== snoozeTaskDetail?._id
            );
          }
        });
        setAvailableKanbanStagesAndTask(tempStages);
        setTotalSnoozedTasks((prev) => Number(prev) - 1);
      }
    }
  };

  return (
    <>
      <div className='taskKanbanView'>
        <div className='taskKanbanView-scroll'>
          {kanbanTaskListLoading || taskOptionLoading ? (
            <Spinner />
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId='board'
                type='COLUMN'
                direction='horizontal'
                ignoreContainerClipping={false}
              >
                {(provided) => (
                  <div
                    className='taskKanbanView-board'
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {availableKanbanStagesAndTask.map((stage, index) => (
                      <TaskKanbanViewColumn
                        onEditStage={handleTaskOptions}
                        onDeleteStage={handleOptionDelete}
                        loadMoreData={loadMoreData}
                        cardsLoading={false}
                        index={index}
                        stage={stage}
                        key={stage.id}
                        currentKanbanView={currentFilter.currentKanbanView}
                        viewCardDetails={(currentTask, isSubTask = false) => {
                          setCurrentUpdatedTaskStage({
                            stageDetail: stage?.stageDetails,
                            taskDetails: currentTask,
                          });
                          setUpdateTask(currentTask);
                          setIsSubTask(isSubTask);
                          setShowTaskModal(true);
                          const url = new URL(window.location);
                          url.searchParams.set(
                            'task',
                            encrypt(currentTask._id)
                          );
                          history.push({
                            pathname: history?.location?.pathname,
                            search: url.searchParams.toString(),
                          });
                        }}
                        setUpdateTask={setUpdateTask}
                        setShowTaskModal={setShowTaskModal}
                        handleChangeParentModal={handleChangeParentModal}
                        handleTaskDelete={handleTaskDelete}
                        handleUpdateTask={handleUpdateTask}
                        handleSnoozeTask={handleSnoozeTask}
                        handleCompleteTask={handleCompleteTask}
                        handleSnoozeOffTasks={handleSnoozeOffTasks}
                        setKanbanViewAddTaskDetails={
                          setKanbanViewAddTaskDetails
                        }
                      />
                    ))}
                    <div
                      style={{ cursor: 'pointer' }}
                      className='taskKanbanView-board-col'
                      onClick={() => {
                        handleTaskOptions(
                          null,
                          currentFilter.currentKanbanView
                        );
                      }}
                    >
                      <div
                        className='taskKanbanView-col-header'
                        style={{
                          borderTop: `3px solid #a3db59`,
                        }}
                      >
                        <Plus
                          id='add_category_btn'
                          className='me-1'
                          size={15}
                        />{' '}
                        <h3>Add New {currentFilter.currentKanbanView}</h3>
                      </div>
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
      <TaskModal
        kanabanViewAddTaskDetails={kanabanViewAddTaskDetails}
        setOpen={() => {}}
        currentFilter={currentFilter}
        setCurrentTasks={() => {}}
        setShowTaskModal={setShowTaskModal}
        showTaskModal={showTaskModal}
        taskOptions={taskOptions}
        setTaskOptions={setTaskOptions}
        currentTasks={[]}
        handleClearAddUpdateTask={(updatedTaskDetail = null) => {
          if (updatedTaskDetail) {
            if (updateTask) {
              handleTaskUpdate(updatedTaskDetail);
            } else {
              if (!updateTask) {
                const stageId =
                  updatedTaskDetail?.[0]?.[currentFilter.currentKanbanView];
                if (stageId) {
                  getKanbanTaskData(
                    {
                      [currentFilter.currentKanbanView]: [stageId],
                      page: 1,
                    },
                    stageId,
                    true
                  );
                }
              }
            }
          }
          handleClearAddUpdateTask();
          setShowTaskModal(false);
          setUpdateTask(false);
        }}
        notifyUserForNewTask={notifyUserForNewTask}
        setCurrentTaskPagination={() => {}}
        setIsSubTask={() => {}}
        editTask={updateTask}
        setUpdateTask={setUpdateTask}
        isSubTask={isSubTask}
        setSubTasks={() => {}}
      />

      {changeParentModalVisible && (
        <TaskParentChangeModal
          setOpen={() => {}}
          selectTask={updateTask}
          setCurrentTasks={() => {}}
          isOpen={changeParentModalVisible}
          closeModal={clearChangeParentModal}
          setSubTasks={() => {}}
          selectCurrentTask={isSubTask}
        />
      )}

      {showSnoozeTaskModal.isOpen && showSnoozeTaskModal.taskDetail && (
        <SnoozeTaskModal
          showSnoozeTaskModal={{ taskDetail: showSnoozeTaskModal.taskDetail }}
          handleCloseSnoozeModal={handleCloseSnoozeModal}
        />
      )}

      {showTaskUpdates.isOpen && (
        <TaskUpdateModal
          isTaskUpdateModal={showTaskUpdates}
          handleCloseUpdateTask={() => {
            setShowTaskUpdates({
              isOpen: false,
              taskDetail: null,
            });
          }}
        />
      )}
    </>
  );
};
