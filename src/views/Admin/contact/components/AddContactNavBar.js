// ** Package Imports **
import classNames from 'classnames';
import { memo } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { Nav, NavItem, NavLink, UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

const AddContactNavBar = ({ params, currentTab, setCurrentTab, user }) => {
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();

  const switchToTab = (tab) => {
    setCurrentTab(tab);
    history.replace({
      pathname: `${basicRoute}/contact/${params.id}/${tab}`,
      status: history.location.state,
    });
  };

  return (
    <div className='add-update-contact-tab-wrapper'>
      <Nav
        className='horizontal-tabbing hide-scrollbar add-update-contact-tab'
        tabs
      >
        <NavItem>
          <NavLink
            className={classNames({
              active: currentTab === 'contact',
            })}
            onClick={() => {
              switchToTab('contact');
            }}
          >
            Personal Info
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classNames({
              active: currentTab === 'activities',
            })}
            onClick={() => {
              if (params.id !== 'add') {
                switchToTab('activities');
              }
            }}
            id={`activities`}
          >
            Activities
          </NavLink>
          <UncontrolledTooltip
            placement='top'
            autohide={true}
            target={`activities`}
          >
            {params.id !== 'add'
              ? 'Activities'
              : 'Please create a contact first'}
          </UncontrolledTooltip>
        </NavItem>
        <NavItem>
          <NavLink
            className={classNames({
              active: currentTab === 'notes',
            })}
            onClick={() => {
              if (params.id !== 'add') {
                switchToTab('notes');
              }
            }}
            id={`notes`}
          >
            Notes
          </NavLink>
          <UncontrolledTooltip placement='top' autohide={true} target={`notes`}>
            {params.id !== 'add' ? 'Note' : 'Please create a contact first'}
          </UncontrolledTooltip>
        </NavItem>
        {(user.role === 'superadmin' ||
          user?.permissions?.includes('task-manager')) && (
          <NavItem>
            <NavLink
              className={classNames({
                active: currentTab === 'task',
              })}
              onClick={() => {
                if (params.id !== 'add') {
                  switchToTab('task');
                }
              }}
              id={`tasks`}
            >
              Tasks
            </NavLink>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`tasks`}
            >
              {params.id !== 'add' ? 'Tasks' : 'Please create a contact first'}
            </UncontrolledTooltip>
          </NavItem>
        )}
        {(user.role === 'superadmin' ||
          user?.permissions?.includes('templates')) && (
          <NavItem>
            <NavLink
              className={classNames({
                active: currentTab === 'checklist',
              })}
              onClick={() => {
                if (params.id !== 'add') {
                  switchToTab('checklist');
                }
              }}
              id={`checklist`}
            >
              Checklist
            </NavLink>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`checklist`}
            >
              {params.id !== 'add'
                ? 'Checklist'
                : 'Please create a contact first'}
            </UncontrolledTooltip>
          </NavItem>
        )}
        {(user.role === 'superadmin' ||
          user?.permissions?.includes('documents')) && (
          <NavItem>
            <NavLink
              className={classNames({
                active: currentTab === 'files',
              })}
              onClick={() => {
                if (params.id !== 'add') {
                  switchToTab('files');
                }
              }}
              id={`files`}
            >
              Files
            </NavLink>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`files`}
            >
              {params.id !== 'add' ? 'Files' : 'Please create a contact first'}
            </UncontrolledTooltip>
          </NavItem>
        )}
        {(user.role === 'superadmin' ||
          user?.permissions?.includes('mass-email-tool')) && (
          <NavItem>
            <NavLink
              className={classNames({
                active: currentTab === 'email',
              })}
              onClick={() => {
                if (params.id !== 'add') {
                  switchToTab('email');
                }
              }}
              id={`email`}
            >
              Email
            </NavLink>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`email`}
            >
              {params.id !== 'add' ? 'Email' : 'Please create a contact first'}
            </UncontrolledTooltip>
          </NavItem>
        )}
        {(user.role === 'superadmin' ||
          user?.permissions?.includes('mass-sms-tool')) && (
          <NavItem>
            <NavLink
              className={classNames({
                active: currentTab === 'sms',
              })}
              onClick={() => {
                if (params.id !== 'add') {
                  switchToTab('sms');
                }
              }}
              id={`sms`}
            >
              SMS
            </NavLink>
            <UncontrolledTooltip placement='top' autohide={true} target={`sms`}>
              {params.id !== 'add' ? 'SMS' : 'Please create a contact first'}
            </UncontrolledTooltip>
          </NavItem>
        )}
        <NavItem>
          <NavLink
            className={classNames({
              active: currentTab === 'mail',
            })}
            onClick={() => {
              if (params.id !== 'add') {
                switchToTab('mail');
              }
            }}
            id={`mail`}
          >
            Mail
          </NavLink>
          <UncontrolledTooltip placement='top' autohide={true} target={`mail`}>
            {params.id !== 'add' ? 'Mail' : 'Please create a contact first'}
          </UncontrolledTooltip>
        </NavItem>
        {(user.role === 'superadmin' ||
          user?.permissions?.includes('task-manager')) && (
          <NavItem>
            <NavLink
              className={classNames({
                active: currentTab === 'tasks-timer-report',
              })}
              onClick={() => {
                if (params.id !== 'add') {
                  setCurrentTab('tasks-timer-report');
                }
              }}
              id={`tasks-timer-report`}
            >
              Tasks Timer Report
            </NavLink>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`tasks-timer-report`}
            >
              {params.id !== 'add' ? 'Tasks' : 'Please create a contact first'}
            </UncontrolledTooltip>
          </NavItem>
        )}
      </Nav>
    </div>
  );
};

export default memo(AddContactNavBar);
