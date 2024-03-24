import { useEffect } from 'react';
import { useTaskTimer } from '../../../../views/Admin/TaskManager/hooks/useTaskTimer';
import moment from 'moment';
import { TASK_TIMER_STATUS } from '../../../../views/Admin/TaskManager/service/taskTimer.services';
import { UncontrolledTooltip } from 'reactstrap';
import { PauseCircle, PlayCircle, XOctagon } from 'react-feather';
import TimerNoteModal from '../../../../views/Admin/TaskManager/components/TimerNoteModal';
import ShowTaskStartedModal from '../../../../views/Admin/TaskManager/components/ShowTaskStartedModal';
import { useHistory } from 'react-router-dom';
import { encrypt } from '../../../../helper/common.helper';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
// eslint-disable-next-line no-unused-vars
import { useIdleTimer } from 'react-idle-timer/dist/index.legacy.esm.js';

const TimerActionButton = ({
  currentTime,
  timerDetails,
  taskTimerDetail,
  startTimer,
  stopTimer,
  pauseTimer,
  startPausedTimer,
  isItCurrentTask,
  setCurrentStartedTask,
}) => {
  const getTimer = () => {
    return (
      <>
        {timerDetails.currentStatus === TASK_TIMER_STATUS.pause ? (
          <>
            {moment
              .utc(
                moment
                  .duration(
                    Number(timerDetails.pausedAt) -
                      Number(timerDetails.start) -
                      Number(timerDetails.totalPausedTime)
                  )
                  .asMilliseconds()
              )
              .format('HH:mm:ss')}
          </>
        ) : (
          <>
            {moment
              .utc(
                moment
                  .duration(
                    Number(currentTime) -
                      Number(timerDetails.start) -
                      Number(timerDetails.totalPausedTime)
                  )
                  .asMilliseconds()
              )
              .format('HH:mm:ss')}
          </>
        )}
      </>
    );
  };

  return (
    <>
      <div className='taskName'>{`${taskTimerDetail?.startedBy?.firstName} ${taskTimerDetail?.startedBy?.lastName}`}</div>
      <div className='timer'>{getTimer()}</div>
      <div className='action-btn-wrapper d-flex'>
        {currentTime ||
        timerDetails.currentStatus === TASK_TIMER_STATUS.pause ? (
          <>
            {timerDetails.currentStatus === TASK_TIMER_STATUS.pause ? (
              <div className='action-btn play-btn'>
                <PlayCircle
                  id={`play-pause-task-timer-${taskTimerDetail?._id}`}
                  onClick={() => {
                    if (isItCurrentTask) {
                      setCurrentStartedTask(null);
                    }
                    startPausedTimer();
                  }}
                />
              </div>
            ) : (
              <div className='action-btn paush-btn'>
                <PauseCircle
                  id={`play-pause-task-timer-${taskTimerDetail?._id}`}
                  onClick={() => {
                    if (isItCurrentTask) {
                      setCurrentStartedTask(null);
                    }
                    pauseTimer();
                  }}
                />
              </div>
            )}
            {/* </Button> */}
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`play-pause-task-timer-${taskTimerDetail?._id}`}
            >
              {timerDetails.currentStatus === TASK_TIMER_STATUS.pause
                ? 'Resume'
                : 'Pause'}
            </UncontrolledTooltip>
            <div className='action-btn stop-btn'>
              <XOctagon
                id={`stop-task-timer-${taskTimerDetail?._id}`}
                onClick={() => {
                  stopTimer();
                  // if (isItCurrentTask) {
                  //   setCurrentStartedTask(null);
                  // }
                }}
              />
            </div>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`stop-task-timer-${taskTimerDetail?._id}`}
            >
              Stop Timer
            </UncontrolledTooltip>
          </>
        ) : (
          <>
            <PlayCircle
              color='primary'
              id={`start-task-timer-${taskTimerDetail?._id}`}
              onClick={() => {
                if (isItCurrentTask) {
                  setCurrentStartedTask(null);
                }
                startTimer();
              }}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`start-task-timer-${taskTimerDetail?._id}`}
            >
              Start Timer
            </UncontrolledTooltip>
          </>
        )}
      </div>
    </>
  );
};

export const TaskTimerHeader = ({
  taskTimerDetail,
  isItCurrentTask = false,
  setCurrentStartedTask = false,
  actionTimerDetails = null,
  showTimerwarningModal = false,
  setActionTimerDetails = null,
}) => {
  const history = useHistory();
  const user = useSelector(userData);

  const {
    startTimer,
    stopTimer,
    pauseTimer,
    startPausedTimer,
    currentTime,
    timerDetails,
    // getLatestTaskTimer,
    showTimerNoteModal,
    handleCloseNoteModal,
    setHeaderTaskTimer,
    showTaskStartWarningModal,
    currentStartedTask,
    handleCloseTaskStartWarningModal,
    timerExistsDetails,
    updateTimerLoading,
  } = useTaskTimer({
    editTask: taskTimerDetail?.task,
  });
  useEffect(() => {
    setHeaderTaskTimer(taskTimerDetail);
  }, []);

  useEffect(() => {
    if (isItCurrentTask) {
      if (currentTime && user?._id === taskTimerDetail?.startedBy?._id) {
        document.title = `${
          showTimerwarningModal ? '🔴' : ''
        } Connectify CRM | #${taskTimerDetail?.task?.taskNumber} ${moment
          .utc(
            moment
              .duration(
                Number(currentTime) -
                  Number(timerDetails.start) -
                  Number(timerDetails.totalPausedTime)
              )
              .asMilliseconds()
          )
          .format('HH:mm:ss')}`;
      } else {
        document.title = 'Connectify CRM';
      }
    }
  }, [currentTime]);

  useEffect(() => {
    if (actionTimerDetails) {
      if (actionTimerDetails === TASK_TIMER_STATUS.pause) {
        pauseTimer();
      } else if (actionTimerDetails === TASK_TIMER_STATUS.end) {
        stopTimer();
      }
      setActionTimerDetails(null);
    }
  }, [actionTimerDetails]);

  return (
    <>
      {isItCurrentTask ? (
        <>
          <div className='current-task-of-header'>
            <div
              className='taskId cursor-pointer'
              onClick={() => {
                history.push(
                  `/task-manager?task=${encrypt(taskTimerDetail?.task?._id)}`
                );
              }}
              id={`task-name-${taskTimerDetail?._id}`}
            >
              #{taskTimerDetail?.task?.taskNumber}
            </div>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`task-name-${taskTimerDetail?._id}`}
            >
              {taskTimerDetail?.task?.name}
            </UncontrolledTooltip>
            <TimerActionButton
              currentTime={currentTime}
              timerDetails={timerDetails}
              taskTimerDetail={taskTimerDetail}
              startTimer={startTimer}
              stopTimer={stopTimer}
              pauseTimer={pauseTimer}
              startPausedTimer={startPausedTimer}
              isItCurrentTask={isItCurrentTask}
              setCurrentStartedTask={setCurrentStartedTask}
            />
          </div>
        </>
      ) : (
        <>
          <span
            className='taskId cursor-pointer'
            onClick={() => {
              history.push(
                `/task-manager?task=${encrypt(taskTimerDetail?.task?._id)}`
              );
            }}
            id={`task-name-${taskTimerDetail?._id}_timer`}
          >
            #{taskTimerDetail?.task?.taskNumber}
          </span>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`task-name-${taskTimerDetail?._id}_timer`}
          >
            {taskTimerDetail?.task?.name}
          </UncontrolledTooltip>
          <TimerActionButton
            currentTime={currentTime}
            timerDetails={timerDetails}
            taskTimerDetail={taskTimerDetail}
            startTimer={startTimer}
            stopTimer={stopTimer}
            pauseTimer={pauseTimer}
            startPausedTimer={startPausedTimer}
            isItCurrentTask={isItCurrentTask}
            setCurrentStartedTask={setCurrentStartedTask}
          />
        </>
      )}
      {showTimerNoteModal && (
        <TimerNoteModal
          handleCloseNoteModal={handleCloseNoteModal}
          showTimerNoteModal={showTimerNoteModal}
          currentStartedTask={currentStartedTask}
          timerExistsDetails={timerExistsDetails}
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
    </>
  );
};
