// ** React Imports
import React, { Fragment, useState, useEffect, useRef } from 'react';

// ** Dropdowns Imports
import UserDropdown from './UserDropdown';

// ** Third Party Components
// import { Sun, Moon } from 'react-feather';

// ** Reactstrap Imports
import { UncontrolledTooltip } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import NavbarSearch from './NavbarSearch';
import { AlertTriangle, Clock, RefreshCw, Users } from 'react-feather';
import { storeUpdateCurrentTasksTimer, userData } from '../../../../redux/user';
import { TaskTimerHeader } from './taskTimer';
import {
  TASK_TIMER_STATUS,
  useGetLatestTaskTimerDataAPI,
} from '../../../../views/Admin/TaskManager/service/taskTimer.services';
import AddReportProblem from '../../../../views/settings/AddReportProblem';
import { Icon } from '@iconify/react';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useIdleTimer } from 'react-idle-timer/dist/index.legacy.esm.js';
import { useUpdateTaskTimerWarning } from '../../../../views/Admin/TaskManager/service/task.services';
import { TaskTimerWaringModal } from './taskTImerWarningModal';
import NotificationDropdown from './NotificationDropdown';
import Avatar from '../../../components/avatar';

const ReportBug = ({ showReportProblemModal, changeModalVisibility }) => {
  return (
    <>
      <UncontrolledTooltip
        placement='top'
        autohide={true}
        target={`report-bug`}
      >
        If you are facing any issue with current page, please report a bug from
        here
      </UncontrolledTooltip>
      <div className='header-action-btn' id='report-bug'>
        <AlertTriangle onClick={changeModalVisibility} />
      </div>
      {showReportProblemModal && (
        <AddReportProblem
          open={showReportProblemModal}
          onClose={changeModalVisibility}
        />
      )}
    </>
  );
};

const ShortCut = ({ tooltip = '', icon, shortcutKey, onClick }) => {
  return (
    <>
      {tooltip ? (
        <UncontrolledTooltip
          placement='top'
          autohide={true}
          target={shortcutKey}
        >
          {tooltip}
        </UncontrolledTooltip>
      ) : null}
      <div className='header-action-btn' onClick={onClick} id={shortcutKey}>
        {icon}
      </div>
    </>
  );
};

const NavbarUser = (props) => {
  // ** Props
  const { skin, mobileTaskTimerOpen, dropdownRef } = props;
  const store = useSelector((state) => state.user.userData);
  const user = useSelector(userData);
  const [showReportProblemModal, setShowReportProblemModal] = useState(false);
  const [, setRemaining] = useState(0);
  const [actionTimerDetails, setActionTimerDetails] = useState(null);
  const changeModalVisibility = () => {
    setShowReportProblemModal(!showReportProblemModal);
  };

  const [imageCompanyLogoError, setImageCompanyLogoError] = useState(false);

  const { getLatestTaskTimerDataAPI } = useGetLatestTaskTimerDataAPI();

  const [currentTimerTaskDetails, setCurrentTimerTaskDetails] = useState([]);
  const [currentStartedTask, setCurrentStartedTask] = useState(null);
  const currentTimerInterval = useRef(null);
  const [showTimerwarningModal, setShowTimerwarningModal] = useState(false);
  const [disabledTaskTimerWarning, setDisableTaskTimerWarning] =
    useState(false);
  const warningTimeOutInterval = useRef(null);

  const dispatch = useDispatch();
  const alertUserForCurrentTimer = (e) => {
    e.preventDefault();
    e.returnValue = '';
    return 'Are you sure you want to refresh the page?';
  };
  const handleSetExistingTaskList = () => {
    if (user.taskTimer?.length) {
      //
      const tempCurrentTask =
        user?.taskTimer?.find(
          (task) => task?.currentStatus === TASK_TIMER_STATUS.start
        ) || null;
      if (tempCurrentTask && tempCurrentTask?._id === currentStartedTask?._id) {
        //
      } else {
        if (tempCurrentTask && user?._id === tempCurrentTask?.startedBy?._id) {
          window.addEventListener('beforeunload', alertUserForCurrentTimer);
        } else {
          window.removeEventListener('beforeunload', alertUserForCurrentTimer);
        }
        setCurrentStartedTask(tempCurrentTask);
      }
      setCurrentTimerTaskDetails(user.taskTimer);
    } else {
      setCurrentTimerTaskDetails([]);
      setCurrentStartedTask(null);
    }
  };
  useEffect(() => {
    handleSetExistingTaskList();
  }, [user.taskTimer]);
  // ** Function to toggle Theme (Light/Dark)
  // const ThemeToggler = () => {
  //   if (skin === 'dark') {
  //     return <Sun className='ficon' onClick={() => setSkin('light')} />;
  //   } else {
  //     return <Moon className='ficon' onClick={() => setSkin('dark')} />;
  //   }
  // };

  const handleRefreshTaskTimer = async () => {
    const { data, error } = await getLatestTaskTimerDataAPI();
    if (!error) {
      dispatch(storeUpdateCurrentTasksTimer(data));
    }
  };
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();
  const { updateTaskTimerWarning } = useUpdateTaskTimerWarning();

  const handleWarningTimeout = () => {
    if (warningTimeOutInterval.current) {
      setActionTimerDetails(TASK_TIMER_STATUS.pause);
      setShowTimerwarningModal(false);
      clearInterval(warningTimeOutInterval.current);
    }
  };

  const onIdle = () => {
    pause();
    setShowTimerwarningModal(true);
    warningTimeOutInterval.current = setInterval(() => {
      handleWarningTimeout();
    }, 300000);
    // }, 30000);
    clearInterval(currentTimerInterval.current);
  };

  const { getRemainingTime, pause, start } = useIdleTimer({
    onIdle,
    timeout: 900000,
    // timeout: 10000,
    throttle: 500,
  });
  useEffect(() => {
    if (
      currentStartedTask?.task?.warningDisabledUsers?.length &&
      currentStartedTask?.task?.warningDisabledUsers.find(
        (disableUser) => String(disableUser) === String(user._id)
      )
    ) {
      pause();
    } else if (
      currentStartedTask &&
      String(currentStartedTask.startedBy?._id) === String(user._id)
    ) {
      start();
      currentTimerInterval.current = setInterval(() => {
        setRemaining(Math.ceil(getRemainingTime() / 1000));
      }, 500);
    } else {
      pause();
    }

    return () => {
      clearInterval(currentTimerInterval.current);
    };
  }, [currentStartedTask]);

  const handleDisableTaskTimerWarning = async () => {
    const { data, error } = await updateTaskTimerWarning(
      currentStartedTask.task._id,
      {
        user: user._id,
      }
    );
    if (!error) {
      setDisableTaskTimerWarning(false);
      setCurrentStartedTask({
        ...currentStartedTask,
        task: {
          ...currentStartedTask.task,
          warningDisabledUsers: data?.warningDisabledUsers || [],
        },
      });
    }
  };
  const handleWarningModalSubmit = async (type) => {
    if (disabledTaskTimerWarning && [TASK_TIMER_STATUS.start].includes(type)) {
      handleDisableTaskTimerWarning();
    }
    if (type === TASK_TIMER_STATUS.start) {
      start();
      // handleRegisterEvents();
    } else if (type === TASK_TIMER_STATUS.pause) {
      pause();
      setActionTimerDetails(TASK_TIMER_STATUS.pause);
      // pauseTimer();
    } else if (type === TASK_TIMER_STATUS.end) {
      setActionTimerDetails(TASK_TIMER_STATUS.end);
      // stopTimer();
    }
    setShowTimerwarningModal(false);
    if (
      warningTimeOutInterval.current &&
      [TASK_TIMER_STATUS.start, TASK_TIMER_STATUS.pause].includes(type)
    ) {
      clearInterval(warningTimeOutInterval.current);
    }
  };

  return (
    <Fragment>
      <div className='company-details'>
        {imageCompanyLogoError ? (
          <Avatar
            color={'light-primary'}
            content={store?.company?.name}
            initials
          />
        ) : (
          <img
            src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${store?.company?.companyLogo}`}
            alt='logo'
            onError={() => {
              setImageCompanyLogoError(true);
            }}
          />
        )}
        <div className='right'>
          <h3 className='title'>Company</h3>
          <h4 className='company-name'>{store?.company?.name}</h4>
        </div>
        <UncontrolledTooltip placement='top' autohide={true} target={`theme`}>
          {skin === 'dark' ? 'Change theme to light' : 'Change theme to dark'}
        </UncontrolledTooltip>
      </div>
      {/* <NavLink className='nav-link-style' id='theme'>
      </NavLink> */}
      <ul className='nav navbar-nav align-items-center ms-auto'>
        {currentStartedTask && (
          <TaskTimerHeader
            taskTimerDetail={currentStartedTask}
            isItCurrentTask={true}
            setCurrentStartedTask={setCurrentStartedTask}
            key={'currentTask'}
            actionTimerDetails={actionTimerDetails}
            showTimerwarningModal={showTimerwarningModal}
            setActionTimerDetails={setActionTimerDetails}
          />
        )}
        <div className='top-header-ctm-btns-wrapper'>
          <ShortCut
            key={'add-contact'}
            shortcutKey={'add-contact'}
            tooltip='Add Contact'
            icon={<Icon icon='humbleicons:user-add' hFlip={true} />}
            onClick={() => {
              history.push(`${basicRoute}/contact/add`);
            }}
          />
          <ShortCut
            key={'contacts'}
            shortcutKey={'contacts'}
            tooltip='Contacts'
            icon={<Users />}
            onClick={() => {
              history.push(`${basicRoute}/contacts/all`);
            }}
          />
          <ShortCut
            key={'tasks'}
            shortcutKey={'tasks'}
            tooltip='Tasks'
            onClick={() => {
              history.push(`${basicRoute}/task-manager`);
            }}
            icon={<Icon icon='pajamas:task-done' />}
          />
          <ShortCut
            key={'email'}
            shortcutKey={'email'}
            tooltip='Email'
            icon={<Icon icon='mdi:email-outline' />}
            onClick={() => {
              history.push(`${basicRoute}/communication/email/Inbox`);
            }}
          />
        </div>
        <div
          className={`task-timer-btn-wrapper ${
            mobileTaskTimerOpen ? 'active' : ''
          }`}
          id='task-timer'
        >
          <div className='header-action-btn'>
            <Clock />
          </div>
          <div ref={dropdownRef} className='task-timer-dropdown'>
            <div className='inner-wrapper'>
              <div className='task-timer-header'>
                <h4 className='title'>Task Timer</h4>
                <div className='reset-btn-wrapper'>
                  <RefreshCw
                    size={15}
                    className='cursor-pointer'
                    id={`task-timer-refresh`}
                    onClick={() => {
                      handleRefreshTaskTimer();
                    }}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`task-timer-refresh`}
                  >
                    Refresh task timer
                  </UncontrolledTooltip>
                </div>
              </div>
              <div className='task-timer-body'>
                {/* {latestTaskTimerLoading ? (
                  <div className='d-flex align-items-center justify-content-center pt-1 pb-1'>
                    <Spinner />
                  </div>
                ) : ( */}
                <>
                  {currentTimerTaskDetails &&
                  currentTimerTaskDetails?.length > 0 ? (
                    <>
                      {currentTimerTaskDetails.map((timer, index) => {
                        return (
                          <div
                            className='task-timer-row'
                            key={`${timer.currentStatus}_${index}`}
                          >
                            <TaskTimerHeader taskTimerDetail={timer} />
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <div className='no-data-text'>No Task Found</div>
                    </>
                  )}
                </>
                {/* )} */}
              </div>
            </div>
          </div>
        </div>
        <ReportBug
          changeModalVisibility={changeModalVisibility}
          showReportProblemModal={showReportProblemModal}
        />
        <NotificationDropdown />
        <div id='theme'>{/* <ThemeToggler /> */}</div>
        <NavbarSearch />
        <UserDropdown />
      </ul>
      {showTimerwarningModal && (
        <TaskTimerWaringModal
          showTimerwarningModal={showTimerwarningModal}
          setShowTimerwarningModal={setShowTimerwarningModal}
          currentStartedTask={currentStartedTask}
          setDisableTaskTimerWarning={setDisableTaskTimerWarning}
          disabledTaskTimerWarning={disabledTaskTimerWarning}
          handleWarningModalSubmit={handleWarningModalSubmit}
        />
      )}
    </Fragment>
  );
};
export default NavbarUser;
