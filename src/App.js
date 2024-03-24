// ** Router Import
import Router from './router/Router';
import { Toaster } from 'react-hot-toast';
import { storeUser } from './redux/user';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { getLoggedInUser } from './api/auth';
import Spinner from './@core/components/spinner/Fallback-spinner';
import { isEmpty } from 'lodash';
import { deleteCookie, getCookie, logger } from './utility/Utils';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import 'tippy.js/dist/tippy.css';
import { io } from 'socket.io-client';
import { handleTaskManagerMenuCollapsed, setSocket } from './redux/common';
import { handleMenuCollapsed } from './redux/layout';

import './app.css';
import { storeCmsContentList } from './redux/cmsContent';
import useWebPushHelper from './hooks/useWebPushHelper';

const socket = io.connect(`${process.env.REACT_APP_SOCKET_BASE_URI}`, {
  forceNew: true,
  transports: ['websocket'],
  withCredentials: true,
  path: process.env.REACT_APP_SOCKET_PATH,
});

const App = () => {
  const dispatch = useDispatch();
  const [fetching, setFetching] = useState(true);
  const [useData, setUserData] = useState({});

  // ** Custom Hooks **
  const { regSw, subscribe } = useWebPushHelper();

  useEffect(() => {
    let userId;

    if (
      window.location.pathname.includes('/member') &&
      localStorage.getItem('isCompanyAdmin') &&
      localStorage.getItem('memberUserId') &&
      localStorage.getItem('memberToken')
    ) {
      userId = localStorage.getItem('memberUserId');
    } else if (
      window.location.pathname.includes('/admin') &&
      localStorage.getItem('isSuperAdmin') &&
      localStorage.getItem('adminUserId') &&
      localStorage.getItem('adminToken')
    ) {
      userId = localStorage.getItem('adminUserId');
    } else {
      userId = localStorage.getItem('userId');
    }
    userId = atob(userId);
    if (getCookie('token')) {
      getLoggedInUser({
        userId,
        select:
          'email,phone,name,companyLogo,companyUrl,website,dateFormat,address1,address2',
      })
        .then(async (res) => {
          if (res?.data?.data?.active === true) {
            if (!res.error) {
              if (res?.userData?.role === 'admin') {
                localStorage.setItem('isCompanyAdmin', true);
              }
              if (res?.userData?.role === 'superadmin') {
                localStorage.setItem('isSuperAdmin', true);
              }
              setUserData(res.data.data);
              dispatch(handleMenuCollapsed(res.data.data.mainSidebarCollapsed));
              dispatch(storeCmsContentList(res.data.data.cmsContents));
              dispatch(
                handleTaskManagerMenuCollapsed(
                  res.data.data.taskManagerSidebarCollapsed
                )
              );
              dispatch(storeUser(res.data.data));
              localStorage.setItem('group', null);
            }
          } else {
            if (
              window.location.pathname.includes('/member') &&
              localStorage.getItem('isCompanyAdmin') &&
              localStorage.getItem('memberUserId') &&
              localStorage.getItem('memberToken')
            ) {
              localStorage.removeItem('isCompanyAdmin');
              localStorage.removeItem('memberUserId');
              localStorage.removeItem('memberToken');
              localStorage.removeItem('group');
              window.location.href = '/';
            } else if (
              window.location.pathname.includes('/admin') &&
              localStorage.getItem('isSuperAdmin') &&
              localStorage.getItem('adminUserId') &&
              localStorage.getItem('adminToken')
            ) {
              localStorage.removeItem('isSuperAdmin');
              localStorage.removeItem('adminUserId');
              localStorage.removeItem('adminToken');
              localStorage.removeItem('group');
              window.location.href = '/';
            } else {
              deleteCookie('token');
              localStorage.removeItem('userId');
              localStorage.removeItem('token');
              localStorage.removeItem('isCompanyAdmin');
              localStorage.removeItem('memberUserId');
              localStorage.removeItem('memberToken');
              localStorage.removeItem('isSuperAdmin');
              localStorage.removeItem('adminUserId');
              localStorage.removeItem('adminToken');
              localStorage.removeItem('group');
              window.location.href = '/login';
            }
          }
          setFetching(false);
          socket.emit('join-socket', {
            userId: res?.data?.data._id,
          });
          dispatch(setSocket(socket));
        })
        .catch(() => {
          setFetching(false);
        });
      registerAndSubscribe();
    } else {
      setFetching(false);
    }
  }, []);

  async function registerAndSubscribe() {
    try {
      const serviceWorkerReg = await regSw();
      await subscribe(serviceWorkerReg);
    } catch (error) {
      logger(error);
    }
  }

  return (
    <>
      {fetching && isEmpty(useData) ? (
        <Spinner />
      ) : (
        <Router useData={useData} />
      )}
      <Toaster position='bottom-right' />
    </>
  );
};

export default App;
