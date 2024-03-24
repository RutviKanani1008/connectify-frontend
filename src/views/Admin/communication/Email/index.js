// ** React Imports
import { useState, Fragment, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Input,
  Spinner,
} from 'reactstrap';

// ** Third Party Components
import classnames from 'classnames';
import _ from 'lodash';

// ** Store & Actions
import { useDispatch, useSelector } from 'react-redux';

// ** Styles
import '@styles/react/apps/app-email.scss';
import Sidebar from './components/Sidebar';
import Mails from './components/Mails';

import { ReactComponent as RefreshIcon } from '../../../../assets/images/icons/refresh.svg';

// Hooks
import {
  useFoldersMailCount,
  useGetConnectedSmtpAccounts,
  useGetEmails,
  useGetIsMailSyncing,
  useGetMappedImapFolder,
} from './hooks/useEmailService';
import MailNotConnectedInfoPage from './components/MailNotConnectedInfoPage';
import { ChevronLeft, ChevronRight, Plus } from 'react-feather';

import { ReactComponent as SearchIcon } from '../../../../assets/images/icons/searchIcon.svg';
import { selectSocket } from '../../../../redux/common';
import { userData } from '../../../../redux/user';
import {
  setEmailParams,
  setMailFoldersCount,
  setMails,
  setTotalMailCount,
} from '../../../../redux/email';
import {
  useLazyGetMailThreadByIdQuery,
  useLazyGetMailsQuery,
  useRefreshMailMutation,
} from '../../../../redux/api/mailApi';
import MailDetails from './components/MailDetails';
import { EMAIL_VIEW_TYPE } from './constant';
import {
  useLazyGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingMutation,
} from '../../../../redux/api/communicationSettingsApi';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';
import { useToggleDropdown } from '../../../../hooks/useToggleDropdown';

// 'contact' is expected to be an object with 'id' and 'email' properties - representing information about a specific contact.
// Example: { contact: { id: 1, email: 'example@email.com' } }
const Email = ({ contact = false }) => {
  // ** States
  const [detailPageState, setDetailPageState] = useState({
    folder: '',
    threadId: '',
    sendDate: '',
    nextEmailThreadId: '',
    nextEmailSendDate: '',
  });
  const [queryArg, setQueryArg] = useState({
    ...(contact ? { contact: contact.email } : {}),
  });
  const [viewType, setViewType] = useState(EMAIL_VIEW_TYPE.STANDARD);
  const [tabletSidebarOpen, setTabletSidebarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [isPartialSyncRunning, setIsPartialSyncRunning] = useState(false);
  const [skip, setSkip] = useState(true);
  const [mailCount, setMailCount] = useState({
    totalNumberOfMail: 0,
    fetchedMailCount: 0,
  });
  const [socketUpdatedData, setSocketUpdatedData] = useState({});

  const mailCountRef = useRef(mailCount);
  mailCountRef.current = mailCount;
  const mailListRef = useRef();

  // ** Toggle Compose Function
  const toggleCompose = () => {
    document.body.classList.add('compose-mail-modal-open');
    setComposeOpen(!composeOpen);
  };

  // ** Store Variables
  const dispatch = useDispatch();
  const store = useSelector((state) => state.email);
  const mails = store.mails;
  const socket = useSelector(selectSocket);
  const user = useSelector(userData);
  const currentSelectedAccount = store.connectedMailAccounts?.[0];
  const totalMailCount = store.totalMailCount;
  const currentSelectedAccountRef = useRef(currentSelectedAccount);
  currentSelectedAccountRef.current = currentSelectedAccount;
  const searchParams = store.params;
  const filters = searchParams.filters;
  const isMailsLoading = store.isMailsLoading;
  const mailFolders = store.folders;

  // ** Ref **
  const folderRef = useRef();

  // ** Vars
  const params = useParams();
  const folder = params.folder || Object.values(mailFolders || {})?.[0];

  // ** API Services **
  const [
    getCommunicationSettings,
    { isLoading: settingsLoading, currentData: settingData },
  ] = useLazyGetCommunicationSettingsQuery();
  const { getFoldersMailCount } = useFoldersMailCount();
  const { getConnectedSmtpAccounts, isLoading } = useGetConnectedSmtpAccounts();
  const {
    getIsMailSyncing,
    isLoading: isInitialMailSyncingCheckLoading,
    initialMailSyncing,
    setInitialMailSyncing,
  } = useGetIsMailSyncing({ setMailCount });
  const [getMailThreadByIdQuery] = useLazyGetMailThreadByIdQuery();
  const [getMails] = useLazyGetMailsQuery();
  const { isLoading: mailLoading, refetch: refetchMails } = useGetEmails({
    queryArg,
    skip,
  });
  const [refreshMail, { isLoading: refreshingMail }] = useRefreshMailMutation();
  const [updateCommunicationSetting] = useUpdateCommunicationSettingMutation();

  // ** Custom Hooks **
  const { isDropdownOpen, dropdownRef, toggleDropdown } = useToggleDropdown();

  const { getMappedImapFolder, isLoading: mailFolderLoading } =
    useGetMappedImapFolder();

  useEffect(() => {
    if (socketUpdatedData.type === 'UPDATE') {
      updateSocketMailData();
    } else if (socketUpdatedData.type === 'NEW') {
      addSocketMailData();
    }
  }, [socketUpdatedData]);

  useEffect(() => {
    folderRef.current = folder;
  }, [folder]);

  useEffect(() => {
    getConnectedSmtpAccounts();
    getIsMailSyncing();
    getMappedImapFolder();
    getCommunicationSettings({}, true);
  }, []);

  useEffect(() => {
    if (settingData?.data?.view) {
      setViewType(settingData.data.view);
      setSidebarOpen(!!settingData.data?.sidebarOpen);
    }
  }, [settingData?.data]);

  useEffect(() => {
    if (isDropdownOpen) {
      document.body.classList.add('email-menu-open');
    } else {
      document.body.classList.remove('email-menu-open');
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (socket && currentSelectedAccountRef.current?.username) {
      socket.on(`mail-sync-${user.company?._id}-${user._id}`, (data) => {
        if (data?.done) {
          setIsPartialSyncRunning(false);
          setInitialMailSyncing(false);
          if (data?.partial) {
            setQueryArg({
              ...(contact ? { contact: contact.email } : {}),
              email: currentSelectedAccount.username,
              folder: folderRef.current,
              page: searchParams.page,
              search: searchParams.search,
              filters: searchParams.filters,
            });
            setSkip(false);
          }
        }
        getIsMailSyncing();
      });

      socket.on(`mail-sync-count-${user.company?._id}-${user._id}`, (data) => {
        if (data) {
          const { fetchedMailCount, totalNumberOfMail } = data;
          setMailCount({
            fetchedMailCount,
            totalNumberOfMail,
          });
        }
      });

      socket.on(
        `mail-watcher-${user.company?._id}-${user._id}`,
        async (data) => {
          setSocketUpdatedData(data);
        }
      );

      return () => {
        socket?.off(`mail-watcher-${user.company?._id}-${user._id}`);
        socket?.off(`mail-sync-count-${user.company?._id}-${user._id}`);
        socket?.off(`mail-sync-${user.company?._id}-${user._id}`);
      };
    }
  }, [socket, currentSelectedAccount]);

  const updateSocketMailData = async () => {
    const mail = await getMailThreadByIdQuery({
      threadId: socketUpdatedData?.mail_provider_thread_id,
      params: {
        folders: folder,
      },
    });
    if (mail?.data?.data) {
      let tempMails = [...mails];
      tempMails = mails.map((obj) =>
        obj.mail_provider_thread_id ===
        socketUpdatedData?.mail_provider_thread_id
          ? mail?.data?.data
          : obj
      );
      if (mail?.data?.data) dispatch(setMails([...tempMails]));
    }
  };

  const addSocketMailData = async () => {
    if (folder === socketUpdatedData?.folder) {
      const mails = await getMails({
        params: {
          email: currentSelectedAccount.username,
          folder: folderRef.current,
          page: searchParams.page,
          search: searchParams.search,
          filters: searchParams.filters,
          select: '_id,mail_provider_thread_id,from,subject,send_date,flags',
        },
      });
      if (
        mails?.data?.data &&
        _.isArray(mails?.data?.data.rows) &&
        folder === socketUpdatedData?.folder
      ) {
        const { rows, count } = mails?.data?.data;
        dispatch(setMailFoldersCount({ [socketUpdatedData?.folder]: count }));
        dispatch(setMails([...rows]));
        dispatch(setTotalMailCount(count));
      }
    }
  };

  const debounceFn = useCallback(
    _.debounce(async (search) => {
      dispatch(setEmailParams({ search: search ? search.trim() : '' }));
    }, 300),
    []
  );

  const handleSetDetailPageState = ({ threadId, sendDate }) => {
    const currentIndex = mails.findIndex(
      (obj) => obj.mail_provider_thread_id === threadId
    );

    setDetailPageState({
      folder,
      threadId,
      sendDate,
      nextEmailThreadId: mails[currentIndex + 1]?.mail_provider_thread_id || '',
      nextEmailSendDate: mails[currentIndex + 1]?.send_date || '',
    });
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    await debounceFn(value);
  };

  const handleView = (view) => {
    updateCommunicationSetting({
      data: {
        view,
      },
    });
    setViewType(view);
  };

  const handleSidebar = () => {
    updateCommunicationSetting({
      data: {
        sidebarOpen: !sidebarOpen,
      },
    });
    setSidebarOpen((prev) => !prev);
  };

  const resetDetailPage = () => {
    setDetailPageState({
      folder: '',
      threadId: '',
      sendDate: '',
      nextEmailThreadId: '',
      nextEmailSendDate: '',
    });
    mailListRef.current?.resetActiveIndex();
  };

  const loading =
    isLoading ||
    isInitialMailSyncingCheckLoading ||
    mailFolderLoading ||
    settingsLoading;

  return (
    <Fragment>
      {loading ? (
        <div className='email-main-round-loader-wrapper'>
          <Spinner />
        </div>
      ) : initialMailSyncing ? (
        <div className='email-main-round-loader-wrapper'>
          <div className='mail-syncing-loader-wrapper'>
            <h3 className='title'>Syncing emails from last 30 days</h3>

            <span className='dot-flashing'></span>
            {/* NEED TO DESIGN */}
            <h2 className='title mt-1'>{`${mailCount.fetchedMailCount} emails have been received out of total ${mailCount.totalNumberOfMail} emails`}</h2>
            <span>
              (Don't worry you can leave this page, syncing will be progressing
              in background)
            </span>
          </div>
        </div>
      ) : store.connectedMailAccounts.length > 0 ? (
        <div
          className={`email-modual ${
            viewType === EMAIL_VIEW_TYPE.SIDE_BY_SIDE ? 'right-of-index' : ''
          }  ${tabletSidebarOpen ? 'open-sidebar' : ''} ${
            !sidebarOpen ? 'sidebar-collapse' : ''
          }`}
        >
          <Sidebar
            filters={filters}
            isDropdownOpen={isDropdownOpen}
            dropdownRef={dropdownRef}
            sidebarOpen={sidebarOpen}
            handleSidebar={handleSidebar}
            tabletSidebarOpen={tabletSidebarOpen}
            toggleCompose={toggleCompose}
            setTabletSidebarOpen={setTabletSidebarOpen}
            setDetailPageState={setDetailPageState}
            contact={contact}
          />
          <div className='content-right'>
            <div className='content-body'>
              <div className='top-header-wrapper'>
                <div className='top-search-header'>
                  <div
                    className='task-manager-sidebar-toggle-btn'
                    onClick={() => {
                      setTabletSidebarOpen(!tabletSidebarOpen);
                      toggleDropdown(true);
                    }}
                  >
                    <span className='line'></span>
                    <span className='line'></span>
                    <span className='line'></span>
                  </div>
                  <div className='email-top-search-box'>
                    <div className='form-element-icon-wrapper'>
                      <SearchIcon />
                      <Input
                        className='text-primary search__mail__input'
                        id='email-search'
                        placeholder='Search email'
                        onChange={handleSearch}
                      />
                    </div>
                  </div>
                </div>
                <div className='right-wrapper'>
                  <span className='pagination-count'>
                    {totalMailCount ? (searchParams.page - 1) * 50 + 1 : 0}-
                    {totalMailCount / searchParams.page > 50
                      ? searchParams.page * 50
                      : totalMailCount}{' '}
                    of {totalMailCount}
                  </span>
                  <div className='next-prev-btn-wrapper'>
                    <span className='prev'>
                      <ChevronLeft
                        size={18}
                        className={classnames({
                          'text-muted': searchParams.page === 1,
                        })}
                        onClick={() => {
                          if (searchParams.page !== 1 && !isMailsLoading) {
                            dispatch(
                              setEmailParams({ page: searchParams.page - 1 })
                            );
                          }
                        }}
                      />
                    </span>
                    <span className='next'>
                      <ChevronRight
                        size={18}
                        className={classnames({
                          'text-muted': mails.length < 50,
                        })}
                        onClick={() => {
                          if (mails.length === 50 && !isMailsLoading) {
                            dispatch(
                              setEmailParams({ page: searchParams.page + 1 })
                            );
                          }
                        }}
                      />
                    </span>
                  </div>
                  <div className='reset-btn-wrapper'>
                    <Button
                      className='refresh-btn'
                      onClick={() => {
                        if (!refreshingMail) {
                          refreshMail({
                            data: {
                              email: currentSelectedAccount.username,
                            },
                          });
                          setIsPartialSyncRunning(true);
                        }
                      }}
                    >
                      <RefreshIcon />
                      Refresh
                      {isPartialSyncRunning && (
                        <span className='dot-flashing'></span>
                      )}
                    </Button>
                  </div>
                  <Button
                    className='compose-btn'
                    color='primary'
                    block
                    onClick={toggleCompose}
                  >
                    <Plus size={16} />
                    Compose
                  </Button>
                </div>
              </div>
              <Mails
                settingData={settingData}
                detailPageState={detailPageState}
                handleView={handleView}
                viewType={viewType}
                store={store}
                dispatch={dispatch}
                composeOpen={composeOpen}
                toggleCompose={toggleCompose}
                setDetailPageState={setDetailPageState}
                setQueryArg={setQueryArg}
                setSkip={setSkip}
                mailLoading={mailLoading}
                handleSetDetailPageState={handleSetDetailPageState}
                queryArg={queryArg}
                contact={contact}
                ref={mailListRef}
              />
              {viewType === EMAIL_VIEW_TYPE.SIDE_BY_SIDE &&
                !mailLoading &&
                !loading &&
                (detailPageState.threadId ? (
                  <>
                    <MailDetails
                      getFoldersMailCount={getFoldersMailCount}
                      handleSetDetailPageState={handleSetDetailPageState}
                      viewType={viewType}
                      refetchMails={refetchMails}
                      detailPageState={detailPageState}
                      resetDetailPage={resetDetailPage}
                      contact={contact}
                    />
                  </>
                ) : (
                  <div className='email-details-page no-data show'>
                    <div className='email-details-page-scroll-area'>
                      <NoRecordFound />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <Card className='w-100'>
          <CardHeader>
            <CardTitle tag='h4' className='text-primary'>
              Emails
            </CardTitle>
          </CardHeader>
          <MailNotConnectedInfoPage />
        </Card>
      )}
    </Fragment>
  );
};

export default Email;
