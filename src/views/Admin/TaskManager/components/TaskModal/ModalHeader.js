import moment from 'moment';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  Book,
  Clock,
  Copy,
  Link as LinkIcon,
  PauseCircle,
  PlayCircle,
  Printer,
  User,
  XOctagon,
} from 'react-feather';
import { Button, Col, Label, Spinner, UncontrolledTooltip } from 'reactstrap';
import { encrypt } from '../../../../../helper/common.helper';
import { userData } from '../../../../../redux/user';
import { useSelector } from 'react-redux';
import defaultImg from '@src/assets/images/avatars/avatar-blank.png';
import { useHistory } from 'react-router-dom';
import { TASK_TIMER_STATUS } from '../../service/taskTimer.services';
import ShowTimerHistory from '../ShowTimerHistory';
import Avatar from '../../../../../@core/components/avatar';

function TaskModalHeader({
  editTask,
  taskData,
  isSubTask,
  currentTab,
  // handle actions
  handleCloneTask,
  handleCopyLinkClick,
  totalTaskDuration = 0,
  timerDetails,
  currentTime,
  startPausedTimer,
  pauseTimer,
  stopTimer,
  startTimer,
  createTaskTimerLoading,
}) {
  const user = useSelector(userData);
  const history = useHistory();
  const [showTimerHistoryModal, setShowTimerHistoryModal] = useState(false);
  const [createdByImageLoadError, setCreatedByImageLoadError] = useState(false);
  const [companyImageLoadError, setCompanyImageLoadError] = useState(false);

  const handleCloseTimerHistoryModal = () => {
    setShowTimerHistoryModal(false);
  };

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
    <div className='inner-wrapper'>
      <div className='left'>
        <div className='top-details'>
          <div className='taskDeatils-header'>
            {editTask?.trash === true ? (
              'Task Detail'
            ) : isSubTask ? (
              editTask?._id ? (
                <div className='update-task-wrapper'>
                  <span className='modal-title-text d-inline-block'>
                    Update Sub Task
                  </span>
                  {taskData.taskNumber && (
                    <span className='task-number d-inline-block'>
                      #{taskData.taskNumber}
                    </span>
                  )}
                </div>
              ) : editTask?.trash ? (
                'Sub Task Details'
              ) : (
                <div className='subtask-title-wrapper'>
                  <span className='black-text'>Add Sub Task</span>
                </div>
              )
            ) : editTask?._id ? (
              <div className='update-task-wrapper'>
                <span className='modal-title-text d-inline-block'>
                  Update Task
                </span>
                {taskData.taskNumber && (
                  <>
                    <span className='task-number d-inline-block'>
                      #{taskData.taskNumber}
                    </span>
                  </>
                )}
              </div>
            ) : editTask?.trash ? (
              'Task Details'
            ) : (
              <span className='black-text'>Add Task</span>
            )}
            <div className='action-btn-wrapper'>
              {editTask && (
                <>
                  <div className='action-btn copy-btn'>
                    <Copy
                      size={15}
                      className='cursor-pointer'
                      onClick={() => {
                        handleCloneTask();
                      }}
                      id='clone_task'
                    />
                    <UncontrolledTooltip
                      placement='top'
                      autohide={true}
                      target='clone_task'
                    >
                      Clone Task
                    </UncontrolledTooltip>
                  </div>
                </>
              )}
              {editTask && (
                <>
                  <div className='action-btn link-btn'>
                    <CopyToClipboard
                      text={`${
                        window.location.origin
                      }/task-manager?task=${encrypt(editTask._id)}`}
                    >
                      <LinkIcon
                        size={15}
                        className='cursor-pointer'
                        onClick={() => {
                          handleCopyLinkClick();
                        }}
                        id='copyC'
                      />
                    </CopyToClipboard>
                    <UncontrolledTooltip
                      placement='top'
                      autohide={true}
                      target='copyC'
                    >
                      Copy Task Link
                    </UncontrolledTooltip>
                  </div>
                </>
              )}
            </div>

            {isSubTask && !editTask && (
              <>
                <div className='infoNote'>
                  <span className='icon-wrapper'>
                    <Book />
                  </span>
                  <span className='value'>
                    This task will be created as sub task under{' '}
                    <span className='subTask-name'>{isSubTask?.name}</span>{' '}
                    task.
                  </span>
                </div>
              </>
            )}
            {editTask?._id && currentTab !== 'tasks' ? (
              <div className='subtask-header'>
                <div className='subtask-name'>{editTask?.name}</div>
              </div>
            ) : null}
            {editTask?.createdBy && (
              <span className='createdBy-text'>
                <div className='task__top__details__row'>
                  {editTask?.createdBy?._id ? (
                    <>
                      <div className='task__top__details__col'>
                        <div className='inner-wrapper'>
                          <div className='label'>
                            <div className='icon-wrapper'>
                              <User />
                            </div>
                            <span className='label__text'>Created By</span>
                          </div>
                          <div className='value'>
                            <span className='created-user-wrapper'>
                              <div className='avatar bg-light-primary'>
                                <div className='avatar-content'>
                                  {' '}
                                  {!createdByImageLoadError ? (
                                    <img
                                      src={
                                        editTask?.createdBy?.userProfile &&
                                        editTask?.createdBy?.firstName &&
                                        editTask?.createdBy?.firstName !==
                                          'false' &&
                                        `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${editTask.createdBy.userProfile}`
                                          ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${editTask.createdBy.userProfile}`
                                          : defaultImg
                                      }
                                      alt='Image'
                                      onError={() => {
                                        console.log('ERROR IS HEREEE');
                                        setCreatedByImageLoadError(true);
                                      }}
                                    />
                                  ) : (
                                    <Avatar
                                      color={'light-primary'}
                                      content={`${editTask?.createdBy?.firstName} ${editTask?.createdBy?.lastName}`}
                                      initials
                                    />
                                  )}
                                </div>
                              </div>
                              <span className='name'>
                                {editTask?.createdBy?.firstName}{' '}
                                {editTask?.createdBy?.lastName}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    ''
                  )}

                  {editTask?.contact && (
                    <div className='task__top__details__col contact__company__profile'>
                      <div className='inner-wrapper'>
                        <div
                          className='created-user-wrapper'
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editTask?.contact?._id) {
                              if (user.role === 'admin') {
                                history.push(
                                  `/admin/contact/${editTask?.contact?._id}`
                                );
                              } else if (user.role === 'grandadmin') {
                                history.push(
                                  `/grandadmin/contact/${editTask?.contact?._id}`
                                );
                              } else if (user.role === 'superadmin') {
                                history.push(
                                  `/contact/${editTask?.contact?._id}`
                                );
                              }
                            }
                          }}
                        >
                          <div className='avatar bg-light-primary'>
                            <div className='avatar-content'>
                              {!companyImageLoadError ? (
                                <img
                                  src={
                                    editTask?.contact?.userProfile &&
                                    editTask?.contact?.firstName &&
                                    editTask?.contact?.firstName !== 'false' &&
                                    `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${editTask.contact.userProfile}`
                                      ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${editTask.contact.userProfile}`
                                      : defaultImg
                                  }
                                  alt='Image'
                                  onError={() => {
                                    setCompanyImageLoadError(true);
                                  }}
                                />
                              ) : (
                                <Avatar
                                  color={'light-primary'}
                                  content={`${editTask.contact.firstName} ${
                                    editTask?.contact?.lastName || ''
                                  }`}
                                  initials
                                />
                              )}
                            </div>
                          </div>
                          <div className='name'>
                            <div className='userName'>
                              {editTask?.contact?.firstName && (
                                <div className='user-name'>
                                  {`${editTask.contact.firstName} ${
                                    editTask?.contact?.lastName || ''
                                  }`}
                                </div>
                              )}
                            </div>
                            <div className='compnayName'>
                              {editTask?.contact?.company_name && (
                                <div className='company-name'>
                                  {editTask?.contact?.company_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className='task__top__details__col'>
                    <div className='inner-wrapper'>
                      <div className='label'>
                        <div className='icon-wrapper'>
                          <Clock />
                        </div>
                        <span className='label__text'>Created Time</span>
                      </div>
                      <div className='value'>
                        <span className='created-time'>
                          {moment(new Date(editTask?.createdAt)).format(
                            ` ${
                              user?.company?.dateFormat
                                ? user?.company?.dateFormat
                                : 'MM/DD/YYYY'
                            } | HH:mm A`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='task__top__details__col'>
                    <div className='inner-wrapper'>
                      <div className='label'>
                        <div className='icon-wrapper'>
                          <Clock />
                        </div>
                        <span className='label__text'>Total Time</span>
                      </div>
                      <div className='value'>
                        <span className='total-time-spent'>
                          {moment
                            .utc(
                              moment
                                .duration(totalTaskDuration)
                                .asMilliseconds()
                            )
                            .format('HH:mm:ss')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </span>
            )}
          </div>
        </div>
      </div>
      {editTask?.contact && (
        <>
          <div
            className='nav-search-item contact-details'
            onClick={(e) => {
              e.stopPropagation();
              if (editTask?.contact?._id) {
                if (user.role === 'admin') {
                  history.push(`/admin/contact/${editTask?.contact?._id}`);
                } else if (user.role === 'grandadmin') {
                  history.push(`/grandadmin/contact/${editTask?.contact?._id}`);
                } else if (user.role === 'superadmin') {
                  history.push(`/contact/${editTask?.contact?._id}`);
                }
              }
            }}
          >
            <div className='inner-wrapper'>
              {editTask?.contact?.userProfile &&
              editTask?.contact?.userProfile !== 'false' ? (
                <Avatar
                  imgClassName='profile-img'
                  img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${editTask?.contact.userProfile}`}
                  status='online'
                  content={`${editTask?.contact?.firstName} ${editTask?.contact?.lastName}`}
                  initials
                />
              ) : (
                <Avatar
                  imgClassName='profile-img'
                  status='online'
                  className='user-profile'
                  color={'light-primary'}
                  content={`${editTask?.contact?.firstName} ${editTask?.contact?.lastName}`}
                  initials
                />
              )}

              <div className='nav-search-item-cn'>
                {editTask?.contact?.firstName && (
                  <div className='user-name'>
                    {`${editTask.contact.firstName} ${
                      editTask?.contact?.lastName || ''
                    }`}
                  </div>
                )}
                {editTask?.contact?.company_name && (
                  <div className='company-name'>
                    {editTask?.contact?.company_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <Col className='timeCol mb-1' md={6}>
        {editTask?._id && (
          <div
            className={`start-stop-time-wrapper ${
              currentTime ||
              timerDetails.currentStatus === TASK_TIMER_STATUS.pause
                ? null
                : 'start-task'
            }`}
          >
            {currentTime ||
            timerDetails.currentStatus === TASK_TIMER_STATUS.pause ? (
              <>
                <div className='timer-wrapper'>
                  <Label className='label'>Timer:</Label>
                  <span className='time'>{getTimer()}</span>
                </div>
                <Button
                  className={`${
                    timerDetails.currentStatus === TASK_TIMER_STATUS.pause
                      ? 'start-time-btn'
                      : 'paush-time-btn'
                  }`}
                  color={`${
                    timerDetails.currentStatus === TASK_TIMER_STATUS.pause
                      ? 'primary'
                      : ''
                  }`}
                  id='play-pause-task-timer'
                  onClick={() => {
                    if (
                      timerDetails.currentStatus === TASK_TIMER_STATUS.pause
                    ) {
                      //
                      startPausedTimer();
                    } else {
                      pauseTimer();
                    }
                  }}
                >
                  {timerDetails.currentStatus === TASK_TIMER_STATUS.pause ? (
                    <PlayCircle />
                  ) : (
                    <PauseCircle />
                  )}
                </Button>
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`play-pause-task-timer`}
                >
                  {timerDetails.currentStatus === TASK_TIMER_STATUS.pause
                    ? 'Resume'
                    : 'Pause'}
                </UncontrolledTooltip>
                <Button
                  className='stop-time-btn'
                  color='danger'
                  id='stop-task-timer'
                  onClick={() => {
                    stopTimer();
                  }}
                >
                  <XOctagon />
                </Button>
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`stop-task-timer`}
                >
                  Stop Timer
                </UncontrolledTooltip>
              </>
            ) : (
              <>
                <Button
                  className='start-time-btn'
                  color='primary'
                  id='start-task-timer'
                  onClick={() => {
                    startTimer();
                  }}
                >
                  {createTaskTimerLoading ? <Spinner /> : <PlayCircle />}
                </Button>
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`start-task-timer`}
                >
                  Start Timer
                </UncontrolledTooltip>
              </>
            )}
            <Button color='primary' className='print-btn' id='print-task'>
              <Printer onClick={() => setShowTimerHistoryModal(true)} />
            </Button>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`print-task`}
            >
              Print Task
            </UncontrolledTooltip>
          </div>
        )}
      </Col>
      {showTimerHistoryModal && (
        <ShowTimerHistory
          showTimerHistoryModal={showTimerHistoryModal}
          task={editTask._id}
          handleCloseTimerHistoryModal={handleCloseTimerHistoryModal}
        />
      )}
    </div>
  );
}

export default TaskModalHeader;
