/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
  UncontrolledDropdown,
} from 'reactstrap';
import { Bell, MoreVertical, XCircle } from 'react-feather';
import InfiniteScroll from 'react-infinite-scroll-component';
import Avatar from '@components/avatar';
import _ from 'lodash';

import {
  useDeleteUserNotificationsAPI,
  useGetUserNotificationsAPI,
  useGetUserNotificationsCountAPI,
  useUpdateUserNotificationsReadStatusAPI,
} from './services';
import { selectSocket } from '../../../../../redux/common';
import { Icon } from '@iconify/react';
import { useToggleDropdown } from '../../../../../hooks/useToggleDropdown';
import useGetNotificationUrl from './hooks/useGetNotificationUrl';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  // ** Var **
  const LIMIT = 10;

  // ** Redux **
  const socket = useSelector(selectSocket);

  // ** State **
  const [hasMore, setHasMore] = useState(true);
  const [notificationData, setNotificationData] = useState([]);
  const [newNotificationCount, setNewNotificationCount] = useState(0);

  // ** API **
  const { getUserNotificationsAPI } = useGetUserNotificationsAPI();
  const { deleteUserNotificationsAPI } = useDeleteUserNotificationsAPI();
  const { getUserNotificationsCountAPI } = useGetUserNotificationsCountAPI();
  const { updateUserNotificationsReadStatusAPI } =
    useUpdateUserNotificationsReadStatusAPI();

  // ** Custom Hooks **
  const { dropdownRef, isDropdownOpen, toggleDropdown } = useToggleDropdown();
  const { getNotificationUrl } = useGetNotificationUrl();
  const isDropdownOpenRef = useRef();
  isDropdownOpenRef.current = isDropdownOpen;

  const appendSocketNotificationData = useCallback((data) => {
    setNotificationData((prev) => {
      return [data, ...prev];
    });
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('handle-notification', (data) => {
        if (data) {
          const notificationObj = {
            status: 'UNREAD',
            createdBy: data.createdBy,
            title: data.title,
            modelName: data.modelName,
            notificationId: data.notificationId,
            modelId: data.modelId,
          };
          if (!isDropdownOpenRef.current) {
            setNewNotificationCount((prev) => prev + 1);
          }
          appendSocketNotificationData(notificationObj);
        }
      });
      return () => {
        socket.off('handle-notification');
      };
    }
  }, [socket, appendSocketNotificationData]);

  useEffect(() => {
    getUserNotifications();
    getNotificationCount();
  }, []);

  useEffect(() => {
    if (isDropdownOpen && notificationData.length) {
      //
      const unreadNotification = notificationData.filter(
        (obj) => obj.status === 'UNREAD'
      );
      if (unreadNotification.length) {
        // HELLO
        // unreadNotification = unreadNotification.map((obj) => ({
        //   notificationId: obj.notificationId,
        // }))
        updateUserNotificationsReadStatusAPI();
        // updateUserNotificationsReadStatusAPI(unreadNotification)
        setNotificationData((prev) =>
          prev.map((obj) => ({ ...obj, status: 'READ' }))
        );
      }
    }
  }, [notificationData, isDropdownOpen]);

  const getUserNotifications = async () => {
    const { data } = await getUserNotificationsAPI({
      skip: notificationData.length,
      limit: LIMIT,
    });
    if (_.isArray(data)) {
      const modifyData = data.map((obj) => ({
        status: obj.status,
        createdBy: obj.notificationId.createdBy,
        title: obj.notificationId.title,
        modelName: obj.notificationId.modelName,
        modelId: obj.notificationId.modelId,
        notificationId: obj.notificationId._id,
      }));
      setNotificationData([...notificationData, ...modifyData]);
      if (data.length < LIMIT) {
        setHasMore(false);
      }
    }
  };

  const getNotificationCount = async () => {
    const { data } = await getUserNotificationsCountAPI();
    setNewNotificationCount(data);
  };

  const loadMoreData = () => {
    getUserNotifications();
  };

  const handleDelete = async (notificationId) => {
    if (notificationId === 'all') {
      setNotificationData([]);
    } else {
      setNotificationData([
        ...notificationData.filter(
          (obj) => obj.notificationId !== notificationId
        ),
      ]);
    }
    await deleteUserNotificationsAPI(notificationId);
  };

  return (
    <>
      <div
        className={`notification-dropdown-wrapper ${
          isDropdownOpen ? 'active' : ''
        }`}
        ref={dropdownRef}
      >
        <div
          className='notification-btn'
          onClick={() => {
            toggleDropdown();
            setNewNotificationCount(0);
          }}
        >
          <Bell />
          {!!newNotificationCount && (
            <span className='notificationCount-badge'>
              {newNotificationCount}
            </span>
          )}
        </div>
        <div
          className='notification-dropdown'
          style={{ display: isDropdownOpen ? 'inline' : 'none' }}
        >
          <div className='notification-content'>
            <div className='notificationCn-header'>
              <h3 className='title'>Notifications</h3>
              {notificationData.length > 0 && (
                <span
                  className='clear-all-btn'
                  onClick={() => handleDelete('all')}
                >
                  Clear All
                </span>
              )}
            </div>
            <InfiniteScroll
              dataLength={notificationData.length}
              next={() => loadMoreData()}
              hasMore={hasMore}
              height={300}
              loader={
                <div className='d-flex justify-content-center align-items-center py-2 w-100'>
                  <Spinner />
                </div>
              }
            >
              {notificationData.map((obj, index) => (
                <div key={index} className='notification-item'>
                  <Avatar
                    img={
                      obj?.createdBy?.userProfile &&
                      obj?.createdBy?.userProfile !== 'false'
                        ? `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${obj.createdBy.userProfile}`
                        : ''
                    }
                    color={'light-primary'}
                    content={[obj.createdBy?.firstName, obj.createdBy?.lastName]
                      .join(' ')
                      .trim()}
                    initials
                  />
                  <div className='notification-title'>
                    <Link
                      to={
                        getNotificationUrl({
                          modelId: obj.modelId,
                          modelName: obj.modelName,
                        }) || '#'
                      }
                    >
                      {obj.title}
                    </Link>
                  </div>
                  <div className='remove-btn'>
                    <XCircle
                      className='remove-icon'
                      onClick={() => handleDelete(obj.notificationId)}
                    />
                  </div>
                </div>
              ))}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
