/* eslint-disable no-unused-vars */
// ** external packages **
import _ from 'lodash';

// ** services **
import {
  useGetMultipleParentSubtask,
  useGetTaskByIdAPI,
} from '../service/task.services';

// ** others **
import { logger } from '../../../../utility/Utils';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../../helper/user.helper';
import { EVENT_END_TYPE, TASK_SCHEDULER_TYPE } from '../../../../constant';
import moment from 'moment';

export const useGetTaskDetailById = ({
  setAttachmentFileUrl,
  setStartDateEndDateState,
  reset,
  setCurrentNote,
  setShowChecklist,
  setUpdateTask,
  setIsSubTask,
  setScheduleData,
  setCompletedTaskInstruction,
  // showTaskModal,
  controller,
  setController,
}) => {
  // ** Redux **
  const user = getCurrentUser();

  // ** State **
  const [formRenderKey, setFormRenderKey] = useState(1);
  const [taskData, setTaskData] = useState({});
  // HELLO
  // const [controller, setController] = useState(null);

  // ** Custom hooks **
  const { getTaskByIdAPI, isLoading } = useGetTaskByIdAPI();

  // HELLO CHECK
  // useEffect(() => {
  //   if (!showTaskModal) {
  //     controller?.abort();
  //   }
  // }, [showTaskModal]);

  const getTaskDetailById = async (id, query = {}) => {
    try {
      let tempController = controller;
      if (tempController) {
        tempController.abort();
      }
      tempController = new AbortController();
      setController(tempController);
      const { data, error } = await getTaskByIdAPI(id, {
        params: { ...query },
        signal: tempController.signal,
        onManualAbortLoadingFalse: true,
      });
      if (!error && data && _.isObject(data)) {
        setUpdateTask(data);
        if (data?.parent_task) {
          setIsSubTask(data?.parent_task);
        }
        const tempObj = { ...data };
        const {
          assigned,
          contact,
          startDate,
          endDate,
          attachments,
          details,
          checklistDetails,
          schedule,
          labels,
          completedTaskInstruction,
          ...rest
        } = tempObj;
        const obj = { ...rest };

        setCurrentNote(details || '');
        setFormRenderKey(Math.random());

        if (completedTaskInstruction) {
          setCompletedTaskInstruction(completedTaskInstruction);
        }

        if (labels?.length) {
          labels?.map((label) => {
            label.value = label?._id;
          });
          obj.labels = labels;
        }
        if (obj.parent_task) {
          obj.parent_task = {
            label: obj.parent_task.name,
            value: obj.parent_task._id,
            taskNumber: obj.parent_task.taskNumber,
          };
        }
        if (schedule) {
          obj.schedule = TASK_SCHEDULER_TYPE?.find(
            (taskSchedule) => taskSchedule?.value === schedule?.schedule
          ) || {
            value: 'never',
            label: 'One Time',
          };
          obj.endType = EVENT_END_TYPE?.find(
            (end) => end.value === schedule?.endType
          ) || {
            value: 'until',
            label: 'Until',
          };
          const tempScheduleObj = {
            schedule: TASK_SCHEDULER_TYPE?.find(
              (taskSchedule) => taskSchedule?.value === schedule?.schedule
            ) || {
              value: 'never',
              label: 'One Time',
            },
            repeatEveryCount: schedule?.repeatEveryCount || 1,
            selectedDays: schedule?.selectedDays?.length
              ? schedule?.selectedDays
              : [Number(moment(new Date()).format('d'))],
            endType: EVENT_END_TYPE?.find(
              (end) => end.value === schedule?.endType
            ) || {
              value: 'until',
              label: 'Until',
            },
            untilDate: moment(schedule?.untilDate).endOf('day').toDate(),
            occurrences: schedule?.occurrences || 1,
          };
          setScheduleData(tempScheduleObj);
        }
        if (checklistDetails?.checklist?.length) {
          if (checklistDetails?.checklistTemplate) {
            checklistDetails.checklistTemplate = {
              label: checklistDetails?.checklistTemplate?.name,
              value: checklistDetails?.checklistTemplate?._id,
            };
          }
          obj['checklistDetails'] = checklistDetails;
          setShowChecklist(true);
        }
        if (assigned?.length) {
          obj['assigned'] = assigned.map((assign) => {
            return {
              label: `${assign?.firstName || ''} ${assign?.lastName || ''} ${
                assign?._id === user?._id ? '(Me)' : ''
              }`,
              value: assign._id,
              profile: assign?.userProfile || null,
            };
          });
        } else {
          obj['assigned'] = [];
        }
        if (contact?._id) {
          obj['contact'] = {
            label:
              `${contact?.firstName} ${contact?.lastName}`.trim() ||
              contact.email,
            value: contact?._id,
            profile: contact?.userProfile || null,
          };
        }
        if (!obj?.status) {
          obj.status = {
            color: '#a3db59',
            label: 'Unassigned',
            showFirst: true,
            type: 'status',
            value: 'unassigned',
            _id: 'unassigned',
          };
        }
        if (!obj?.priority) {
          obj.priority = {
            color: '#a3db59',
            label: 'Unassigned',
            showFirst: true,
            type: 'priority',
            value: 'unassigned',
            _id: 'unassigned',
          };
        }
        setAttachmentFileUrl([...attachments]);
        setStartDateEndDateState({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
        reset(obj);
        setTaskData(obj);
      }
    } catch (error) {
      logger(error);
    }
  };

  return { getTaskDetailById, isLoading, formRenderKey, taskData };
};

export const useExpandAllTask = ({
  user,
  setExpandAll,
  setIsExpandingAll,
  setSubTasks,
  setOpen,
  currentFilter,
}) => {
  const { getMultipleParentSubtask, isLoading: expandingAllTask } =
    useGetMultipleParentSubtask();
  const expandAllTask = async (task) => {
    setExpandAll(true);
    setIsExpandingAll(true);

    const { data, error } = await getMultipleParentSubtask(
      {
        parent_task_ids: task
          .filter((task) => task?.sub_tasks)
          .map((task) => task._id),
      },
      '',
      {
        completed: false,
        trash: false,
        ...(currentFilter.search && { search: currentFilter.search }),
        ...(currentFilter.status && { status: currentFilter.status }),
        ...(currentFilter.priority && { priority: currentFilter.priority }),
        ...(currentFilter.contact && { contact: currentFilter.contact }),
        ...(currentFilter.frequency && { frequency: currentFilter.frequency }),
        ...(currentFilter.assigned && { assigned: currentFilter.assigned }),
        populate: JSON.stringify([{ path: 'assigned' }]),
        company: user?.company?._id,
        select:
          'name,details,startDate,endDate,priority,status,category,parent_task,trash,completed,createdBy,createdAt,assigned,contact,taskNumber,snoozeUntil,hideSnoozeTask',
        sort: { order: 1, createdAt: 1 },
      }
    );
    if (!error && _.isArray(data?.tasks)) {
      const tempSubTasks = data.tasks.reduce(
        (prev, currentObj) => ({
          ...prev,
          [currentObj.parent_task]: [
            ...(prev[currentObj.parent_task] || []),
            currentObj,
          ],
        }),
        {}
      );
      setSubTasks((prev) => ({ ...prev, ...tempSubTasks }));
      setOpen((prev) => [
        ...prev,
        ...task.map((_, index) => `${index + prev.length}`),
      ]);
    }

    setIsExpandingAll(false);
  };

  return { expandAllTask, expandingAllTask };
};
