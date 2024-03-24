// ** React Imports
import React, { Fragment } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Nav, NavItem, NavLink, UncontrolledTooltip } from 'reactstrap';
import { AVAILABLE_USER_PERSONAL_TABS } from './constants';
import classNames from 'classnames';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import PersonalInformation from './pages/PersonalInformation';
import Activities from './pages/Activities';
import Notes from './pages/Notes';
import Checklists from './pages/Checklists';
import Files from './pages/Files';
import Tasks from './pages/Tasks';
import TaskTimerReports from './pages/TaskTimerReport';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import UserNotificationSettings from '../../Admin/users/components/UserSettingsTab';

const UserProfile = () => {
  // ** Vars
  const params = useParams();
  const history = useHistory();
  const currentTab = params.tab;
  const user = useSelector(userData);

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();

  const renderTab = (tab) => {
    switch (tab) {
      case 'activities':
        return <Activities />;
      case 'notes':
        return <Notes />;
      case 'checklists':
        return <Checklists />;
      case 'files':
        return <Files />;
      case 'tasks':
        return <Tasks />;
      case 'tasks-timer-report':
        return <TaskTimerReports />;
      case 'user-settings':
        return <UserNotificationSettings currentUser={user._id} />;
      case 'personal-information':
      default:
        return <PersonalInformation />;
    }
  };

  return (
    <div className='new-tab-details-design setting-profile-page'>
      <div className='horizontal-new-tab-wrapper'>
        <Nav
          className='horizontal-tabbing hide-scrollbar'
          tabs
          id='update-profile-navbar'
        >
          {AVAILABLE_USER_PERSONAL_TABS.map((tab, index) => {
            return (
              <Fragment key={index}>
                {((user?.role !== 'admin' && !tab?.isAdminLoginOnly) ||
                  user?.role === 'admin') && (
                  <NavItem>
                    <NavLink
                      className={classNames({
                        active: currentTab === tab.tabCode,
                      })}
                      onClick={() =>
                        history.push(`${basicRoute}/profile/${tab.tabCode}`)
                      }
                      id={tab.tabCode}
                    >
                      {tab.tabName}
                    </NavLink>
                    <UncontrolledTooltip
                      placement='top'
                      autohide={true}
                      target={tab.tabCode}
                    >
                      {tab.tabName}
                    </UncontrolledTooltip>
                  </NavItem>
                )}
              </Fragment>
            );
          })}
        </Nav>
      </div>
      {renderTab(currentTab)}
    </div>
  );
};

export default UserProfile;
