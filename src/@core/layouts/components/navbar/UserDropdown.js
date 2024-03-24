// ** React Imports
import React from 'react';
import { useHistory } from 'react-router-dom';

// ** Custom Components
import Avatar from '@components/avatar';

// ** Third Party Components
import {
  User,
  HelpCircle,
  Power,
  ArrowUpRight,
  Feather,
  Bell,
  Activity,
} from 'react-feather';

// ** Reactstrap Imports
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Badge,
  Spinner,
} from 'reactstrap';

// ** Default Avatar Image
// import defaultAvatar from '@src/assets/images/avatars/avatar-blank.png';
import { store } from '../../../../redux/store';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import useLogout from '../../../../hooks/useLogout';
import { useToggleDropdown } from '../../../../hooks/useToggleDropdown';

const UserDropdown = () => {
  const storeState = store.getState();
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();
  const { logout, isLoading } = useLogout();

  // ** Custom Hooks **
  const { dropdownRef, isDropdownOpen, toggleDropdown } = useToggleDropdown();

  //** Vars
  // const userAvatar = defaultAvatar;
  const user = storeState.user.userData;

  return (
    <div ref={dropdownRef}>
      <UncontrolledDropdown
        tag='div'
        className='dropdown-user nav-item user-details'
        isOpen={isDropdownOpen}
      >
        <DropdownToggle
          href='/'
          tag='a'
          className='nav-link dropdown-user-link'
          onClick={(e) => {
            e.preventDefault();
            toggleDropdown();
          }}
        >
          <div className='img-wrapper'>
            {user?.userProfile && user?.userProfile !== 'false' ? (
              <Avatar
                imgClassName='profile-img'
                img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${user.userProfile}`}
                status='online'
                content={`${user?.firstName} ${user?.lastName}`}
                initials
              />
            ) : (
              <Avatar
                imgClassName='profile-img'
                status='online'
                className='user-profile'
                color={'light-primary'}
                content={`${user?.firstName} ${user?.lastName}`}
                initials
              />
            )}
            {user.pendingChangeLogCount ? (
              <Badge pill color='danger' className='badge-up chang-log-count'>
                {user.pendingChangeLogCount}
              </Badge>
            ) : null}
          </div>
          <div className='right'>
            <div className='user-name'>
              {user && user.firstName} {user && user.lastName}
            </div>
            <div className='user-status'>{user && user.role}</div>
          </div>
        </DropdownToggle>
        <DropdownMenu end>
          <DropdownItem
            tag='a'
            onClick={() => {
              history.push(`${basicRoute}/profile/personal-information`);
            }}
          >
            <User size={14} className='me-75' />
            <span className='align-middle'>Profile</span>
          </DropdownItem>
          <DropdownItem
            tag='a'
            onClick={() => {
              history.push(`${basicRoute}/notification`);
            }}
          >
            <Bell size={14} className='me-75' />
            <span className='align-middle'>Notifications</span>
          </DropdownItem>
          <DropdownItem
            tag='a'
            onClick={() => {
              history.push(`/feature-request`);
            }}
          >
            <Feather size={14} className='me-75' />
            <span className='align-middle'>Feature Request</span>
          </DropdownItem>
          <DropdownItem
            tag='a'
            onClick={() => {
              history.push(`/report-problem`);
            }}
          >
            <ArrowUpRight size={14} className='me-75' />
            <span className='align-middle'>Report Problem</span>
          </DropdownItem>
          <DropdownItem
            tag='a'
            onClick={() => {
              history.push(`${basicRoute}/faq`);
            }}
          >
            <HelpCircle size={14} className='me-75' />
            <span className='align-middle'>FAQ</span>
          </DropdownItem>
          <DropdownItem
            tag='a'
            onClick={() => {
              history.push(`${basicRoute}/change-logs`);
            }}
          >
            <div className='d-flex align-items-center'>
              <div>
                <Activity size={14} className='me-75' />
                Change log
              </div>
              {user?.pendingChangeLogCount ? (
                <Badge pill color='primary' className='ms-1'>
                  {user.pendingChangeLogCount}
                </Badge>
              ) : null}
            </div>
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              if (!isLoading) {
                logout();
              }
            }}
          >
            {isLoading ? (
              <Spinner size='sm' className='me-75' />
            ) : (
              <Power size={14} className='me-75' />
            )}
            <span className='align-middle'>Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );
};

export default UserDropdown;
