import { useState } from 'react';
import {
  TASK_TIMER_STATUS,
  useCreateTaskTimer,
  useGetTaskTimer,
  useUpdateTaskTimer,
} from '../service/taskTimer.services';
import moment from 'moment';
import {
  storeUpdateCurrentTasksTimer,
  useTasksTimerDetails,
} from '../../../../redux/user';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
export const useTaskTimer = ({ editTask }) => {
  const dispatch = useDispatch();
  const userTaskTimer = useSelector(useTasksTimerDetails);
  const [currentTime, setCurrentTime] = useState(null);
  const [timerExistsDetails, setTimerExistsDetails] = useState(null);
  const { updateTaskTimer, isLoading: updateTimerLoading } =
    useUpdateTaskTimer();
  const [showTimerNoteModal, setShowTimerNoteModal] = useState(false);
  const [showTaskStartWarningModal, setShowTaskStartWarningModal] =
    useState(false);
  const [currentStartedTask, setCurrentStartedTask] = useState(null);

  const { getTaskTimer } = useGetTaskTimer();

  const { createTaskTimer, isLoading: createTaskTimerLoading } =
    useCreateTaskTimer();

  const [timerDetails, setTimerDetails] = useState({
    start: 0,
    end: null,
    interval: null,
    timerId: null,
    totalTimer: 0,
    currentStatus: null,
    pausedAt: null,
    totalPausedTime: null,
    resumedAt: null,
    pausedId: null,
    totalTaskDuration: null,
  });

  const handleUpdateTimerInHeader = async (
    currentTimer,
    updatedTaskTimerList = null
  ) => {
    console.log({ updatedTaskTimerList });
    let tempUserObj = null;
    if (updatedTaskTimerList && _.isArray(updatedTaskTimerList)) {
      tempUserObj = JSON.parse(JSON.stringify(updatedTaskTimerList)) || [];
    } else {
      tempUserObj = JSON.parse(JSON.stringify(userTaskTimer)) || [];
    }
    const isTimerAlreadyExist = tempUserObj?.findIndex(
      (timer) => currentTimer._id === timer._id
    );
    if (isTimerAlreadyExist >= 0) {
      //
      if (currentTimer?.currentStatus === TASK_TIMER_STATUS.end) {
        tempUserObj = tempUserObj.filter(
          (task) => task._id !== currentTimer._id
        );
      } else {
        tempUserObj[isTimerAlreadyExist] = { ...currentTimer };
      }
    } else {
      tempUserObj.push(currentTimer);
    }
    dispatch(storeUpdateCurrentTasksTimer(tempUserObj));
    return tempUserObj;
  };

  const startTimer = async (updatedTaskTimerList = null) => {
    if (timerExistsDetails?.currentStatus === TASK_TIMER_STATUS.pause) {
      startPausedTimer(updatedTaskTimerList);
    } else {
      const startTime = moment().valueOf();
      const interval = setInterval(() => {
        setCurrentTime(moment().valueOf());
      }, 1000);

      setCurrentTime(moment().valueOf());
      setTimerDetails({
        ...timerDetails,
        start: startTime,
        interval,
        totalTimer: 0,
        currentStatus: TASK_TIMER_STATUS.start,
        totalPausedTime: null,
      });

      const { data, error } = await createTaskTimer({
        task: editTask?._id,
        current_status: TASK_TIMER_STATUS.start,
        startTime,
      });
      if (!error) {
        setCurrentTime(moment().valueOf());
        setTimerExistsDetails(data);
        setTimerDetails({
          ...timerDetails,
          pausedAt: null,
          totalPausedTime: null,
          pausedId: null,
          start: startTime,
          interval,
          timerId: data._id,
          totalTimer: data?.totalTime,
          totalTaskDuration: data?.totalTaskDuration,
        });
        setTimeout(() => {
          handleUpdateTimerInHeader(data);
        }, 2000);
      } else {
        clearInterval(interval);
        setTimerDetails({
          ...timerDetails,
          interval: null,
          currentStatus: TASK_TIMER_STATUS.end,
          pausedAt: null,
          totalPausedTime: null,
          resumedAt: null,
          pausedId: null,
        });
        setCurrentTime(null);
        setShowTaskStartWarningModal(!showTaskStartWarningModal);
        setCurrentStartedTask(data?.[0]);
      }
    }
  };

  const stopTimer = async () => {
    document.title = 'Connectify CRM';
    setShowTimerNoteModal(true);
  };

  const pauseTimer = async () => {
    setShowTimerNoteModal(false);
    document.title = 'Connectify CRM';
    const pausedTime = currentTime;
    clearInterval(timerDetails.interval);
    const { data, error } = await updateTaskTimer(timerDetails?.timerId, {
      task: editTask._id,
      current_status: TASK_TIMER_STATUS.pause,
      startTime: timerDetails.start,
      pausedTime,
    });
    if (!error) {
      let totalPausedTime = 0;

      if (data.pauses?.length) {
        data.pauses.forEach((pause) => {
          if (pause.resumedAt) {
            totalPausedTime = totalPausedTime + pause.totalPausedTime;
          }
        });
      }
      handleUpdateTimerInHeader(data);
      const currentPausedId = data.pauses.find((paused) => !paused.resumedAt);
      setTimerDetails({
        ...timerDetails,
        pausedId: currentPausedId?._id,
        pausedAt: pausedTime,
        end: data.endedAt,
        totalTimer: data?.totalTime,
        currentStatus: TASK_TIMER_STATUS.pause,
        totalPausedTime,
        totalTaskDuration: data?.totalTaskDuration,
      });
      setTimerExistsDetails(data);
    }
  };

  const startPausedTimer = async (updatedTaskTimerList = null) => {
    const resumedAt = moment().valueOf();
    clearInterval(timerDetails.interval);
    setCurrentTime(moment().valueOf());
    const interval = setInterval(() => {
      setCurrentTime(moment().valueOf());
    }, 1000);

    let totalPausedTime = 0;
    if (timerExistsDetails?.pauses?.length) {
      const tempTimerDetails = JSON.parse(JSON.stringify(timerExistsDetails));
      tempTimerDetails.pauses.map((pause) => {
        totalPausedTime = totalPausedTime + pause.totalPausedTime;
      });
      const currentPause = tempTimerDetails.pauses.find(
        (pause) => pause._id === timerDetails.pausedId
      );

      totalPausedTime =
        totalPausedTime + (resumedAt - currentPause?.pausedAt || 0);
    }
    setTimerDetails({
      ...timerDetails,
      pausedAt: null,
      interval,
      currentStatus: TASK_TIMER_STATUS.start,
      totalPausedTime,
    });
    const { data, error } = await updateTaskTimer(timerDetails?.timerId, {
      task: editTask._id,
      current_status: TASK_TIMER_STATUS.start,
      startTime: resumedAt,
      pausedId: timerDetails.pausedId,
    });
    if (!error) {
      let totalPausedTime = 0;

      if (data.pauses?.length) {
        data.pauses.forEach((pause) => {
          if (pause.resumedAt) {
            totalPausedTime = totalPausedTime + pause.totalPausedTime;
          }
        });
      }
      setTimerDetails({
        ...timerDetails,
        pausedId: null,
        pausedAt: null,
        interval,
        totalTimer: data?.totalTime,
        currentStatus: TASK_TIMER_STATUS.start,
        totalPausedTime,
        totalTaskDuration: data?.totalTaskDuration,
      });
      setTimerExistsDetails(data);
      handleUpdateTimerInHeader(data, updatedTaskTimerList);
    } else {
      clearInterval(interval);
      setTimerDetails({
        ...timerDetails,
        interval: null,
        currentStatus: TASK_TIMER_STATUS.pause,
        resumedAt: null,
      });
      setShowTaskStartWarningModal(!showTaskStartWarningModal);
      setCurrentStartedTask(data?.[0]);
    }
  };

  const getLatestTaskTimer = async (taskId) => {
    const { data, error } = await getTaskTimer({ task: taskId });
    if (!error && data) {
      setTimerExistsDetails(data);
      let totalPausedTime = 0;

      if (data.pauses) {
        data.pauses.forEach((pause) => {
          if (pause.resumedAt) {
            totalPausedTime = totalPausedTime + pause.totalPausedTime;
          }
        });
      }
      if (data?.currentStatus === TASK_TIMER_STATUS.start) {
        const interval = setInterval(() => {
          setCurrentTime(moment().valueOf());
        }, 1000);
        setTimerDetails({
          ...timerDetails,
          start: data?.startedAt,
          end: null,
          interval,
          timerId: data?._id,
          totalTimer: data?.totalTime || 0,
          currentStatus: TASK_TIMER_STATUS.start,
          totalPausedTime,
          totalTaskDuration: data?.totalTaskDuration,
        });
      } else if (
        data.currentStatus === TASK_TIMER_STATUS.pause &&
        data?.pauses?.length
      ) {
        const currentPaused = data.pauses.find((pause) => !pause.resumedAt);
        if (currentPaused) {
          setTimerDetails({
            ...timerDetails,
            start: data?.startedAt,
            end: null,
            interval: null,
            timerId: data?._id,
            pausedAt: currentPaused.pausedAt,
            resumedAt: currentPaused.resumedAt || null,
            pausedId: currentPaused._id,
            totalTimer: data?.totalTime || 0,
            currentStatus: TASK_TIMER_STATUS.pause,
            totalPausedTime,
            totalTaskDuration: data?.totalTaskDuration,
          });
        }
      } else {
        setTimerDetails({
          start: data?.startedAt,
          end: data?.endedAt,
          interval: null,
          timerId: data?._id,
          totalTimer: data?.totalTime || 0,
          currentStatus: TASK_TIMER_STATUS.end,
          totalTaskDuration: data?.totalTaskDuration,
        });
      }
    }
  };

  const handleCloseNoteModal = async (noteText, isBtnCloseClick) => {
    setShowTimerNoteModal(false);
    if (!isBtnCloseClick) {
      if (currentStartedTask) {
        const { data, error } = await updateTaskTimer(currentStartedTask?._id, {
          task: editTask._id,
          current_status: TASK_TIMER_STATUS.end,
          startTime: currentStartedTask.startedAt,
          endTime: moment().valueOf(),
          timerId: currentStartedTask?._id || null,
          note: noteText,
        });
        if (!error && data) {
          const updatedTaskTimerList = await handleUpdateTimerInHeader(data);
          startTimer(updatedTaskTimerList);
        }
      } else {
        let endTime = null;
        if (timerDetails.currentStatus === TASK_TIMER_STATUS.pause) {
          endTime = moment().valueOf();
        } else {
          endTime = currentTime;
        }
        clearInterval(timerDetails.interval);
        const { data, error } = await updateTaskTimer(timerDetails?.timerId, {
          task: editTask._id,
          current_status: TASK_TIMER_STATUS.end,
          startTime: timerDetails.start,
          endTime,
          timerId: timerDetails.timerId || null,
          note: noteText,
        });
        if (!error) {
          setTimerExistsDetails(data);
        }
        handleUpdateTimerInHeader(data);
        setCurrentTime(null);
        setTimerDetails({
          ...timerDetails,
          end: currentTime,
          totalTimer: data?.totalTime,
          currentStatus: TASK_TIMER_STATUS.end,
          totalTaskDuration: data?.totalTaskDuration,
        });
      }
    } else {
      if (currentStartedTask) {
        setCurrentStartedTask(null);
      } else {
        if (
          timerDetails.currentStatus === TASK_TIMER_STATUS.pause ||
          timerDetails.currentStatus === TASK_TIMER_STATUS.end
        ) {
          return;
        }
        clearInterval(timerDetails.interval);
        setCurrentTime(moment().valueOf());
        const interval = setInterval(() => {
          setCurrentTime(moment().valueOf());
        }, 1000);

        let totalPausedTime = 0;
        if (timerExistsDetails?.pauses?.length) {
          const tempTimerDetails = JSON.parse(
            JSON.stringify(timerExistsDetails)
          );
          tempTimerDetails.pauses.map((pause) => {
            totalPausedTime = totalPausedTime + pause.totalPausedTime;
          });
        }
        setTimerDetails({
          ...timerDetails,
          pausedAt: null,
          interval,
          currentStatus: TASK_TIMER_STATUS.start,
          totalPausedTime,
        });
      }
    }
  };

  const setHeaderTaskTimer = (timerDetail) => {
    const data = JSON.parse(JSON.stringify(timerDetail));
    setTimerExistsDetails(data);
    let totalPausedTime = 0;

    if (data.pauses) {
      data.pauses.forEach((pause) => {
        if (pause.resumedAt) {
          totalPausedTime = totalPausedTime + pause.totalPausedTime;
        }
      });
    }
    if (data?.currentStatus === TASK_TIMER_STATUS.start) {
      setCurrentTime(moment().valueOf());
      const interval = setInterval(() => {
        setCurrentTime(moment().valueOf());
      }, 1000);
      setTimerDetails({
        ...timerDetails,
        start: data?.startedAt,
        end: null,
        interval,
        timerId: data?._id,
        totalTimer: data?.totalTime || 0,
        currentStatus: TASK_TIMER_STATUS.start,
        totalPausedTime,
        totalTaskDuration: data?.totalTaskDuration,
      });
    } else if (
      data.currentStatus === TASK_TIMER_STATUS.pause &&
      data?.pauses?.length
    ) {
      const currentPaused = data.pauses.find((pause) => !pause.resumedAt);
      if (currentPaused) {
        setTimerDetails({
          ...timerDetails,
          start: data?.startedAt,
          end: null,
          interval: null,
          timerId: data?._id,
          pausedAt: currentPaused.pausedAt,
          resumedAt: currentPaused.resumedAt || null,
          pausedId: currentPaused._id,
          totalTimer: data?.totalTime || 0,
          currentStatus: TASK_TIMER_STATUS.pause,
          totalPausedTime,
          totalTaskDuration: data?.totalTaskDuration,
        });
      }
    } else {
      setTimerDetails({
        start: data?.startedAt,
        end: data?.endedAt,
        interval: null,
        timerId: data?._id,
        totalTimer: data?.totalTime || 0,
        currentStatus: TASK_TIMER_STATUS.end,
        totalTaskDuration: data?.totalTaskDuration,
      });
    }
  };

  const handleCloseTaskStartWarningModal = async (closeType) => {
    if (closeType === TASK_TIMER_STATUS.pause) {
      // Incase user click on the pause button from the already started task.
      const { data, error } = await updateTaskTimer(currentStartedTask?._id, {
        task: editTask._id,
        current_status: TASK_TIMER_STATUS.pause,
        startTime: currentStartedTask.startedAt,
        pausedTime: moment().valueOf(),
      });
      if (!error && data) {
        //
        const updatedTaskTimerList = await handleUpdateTimerInHeader(data);
        startTimer(updatedTaskTimerList);
      }
      setCurrentStartedTask(null);
    } else if (closeType === TASK_TIMER_STATUS.end) {
      // Incase user click on the stop button from the already started task.
      setShowTimerNoteModal(true);
    } else {
      // In case of user click cancel.
      clearInterval(timerDetails.interval);
      // setShowTimerNoteModal(true);
      if (timerExistsDetails?.currentStatus === TASK_TIMER_STATUS.pause) {
        let totalPausedTime = 0;

        if (timerExistsDetails.pauses?.length) {
          timerExistsDetails.pauses.forEach((pause) => {
            if (pause.resumedAt) {
              totalPausedTime = totalPausedTime + pause.totalPausedTime;
            }
          });
        }
        const currentPaused = timerExistsDetails?.pauses?.find(
          (pause) => !pause.resumedAt
        );
        setTimerDetails({
          ...timerDetails,
          currentStatus: TASK_TIMER_STATUS.pause,
          totalPausedTime,
          end: null,
          interval: null,
          start: timerExistsDetails.startedAt,
          timerId: timerExistsDetails?._id,
          pausedAt: currentPaused.pausedAt,
          resumedAt: currentPaused.resumedAt || null,
          pausedId: currentPaused._id,
        });
      } else {
        setTimerDetails({
          ...timerDetails,
          interval: null,
          currentStatus: TASK_TIMER_STATUS.end,
          pausedAt: null,
          totalPausedTime: null,
          resumedAt: null,
          pausedId: null,
        });
        setCurrentTime(null);
      }
      setCurrentStartedTask(null);
    }
    setShowTaskStartWarningModal(false);
  };

  const handleResetTimerDetails = () => {
    setTimerDetails({
      start: 0,
      end: null,
      interval: null,
      timerId: null,
      totalTimer: 0,
      currentStatus: null,
      pausedAt: null,
      totalPausedTime: null,
      resumedAt: null,
      pausedId: null,
      totalTaskDuration: null,
    });
    setCurrentStartedTask(null);
    setShowTaskStartWarningModal(false);
    setShowTimerNoteModal(false);
    setTimerExistsDetails(null);
    setCurrentTime(null);
    clearInterval(timerDetails.interval);
  };
  return {
    startTimer,
    stopTimer,
    pauseTimer,
    startPausedTimer,
    currentTime,
    timerDetails,
    getLatestTaskTimer,
    createTaskTimerLoading,
    updateTimerLoading,
    showTimerNoteModal,
    handleCloseNoteModal,
    setHeaderTaskTimer,
    showTaskStartWarningModal,
    currentStartedTask,
    handleCloseTaskStartWarningModal,
    timerExistsDetails,
    handleResetTimerDetails,
  };
};
