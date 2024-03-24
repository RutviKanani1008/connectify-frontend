/* eslint-disable no-unused-vars */
// ** React Imports
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Icon } from '@iconify/react';

// ** Third Party Components
import classnames from 'classnames';

import {
  Mail,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  CornerUpRight,
  ArrowLeft,
} from 'react-feather';
// import PerfectScrollbar from 'react-perfect-scrollbar';

// ** Reactstrap Imports
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import {
  useGetConnectedSmtpAccounts,
  useGetEmailThread,
  useGetNextPrevMail,
  useMailMoveIntoSpecificFolder,
  useMarkReadUnread,
} from '../hooks/useEmailService';
import MailDetailsItem from './MailDetailsItem';
import useGetMailRoute from '../hooks/useRoute';
import { useDispatch, useSelector } from 'react-redux';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
import { EMAIL_VIEW_TYPE, EXCLUDE_FROM_MOVABLE_FOLDER_LIST } from '../constant';
import { setCurrentMail } from '../../../../../redux/email';

const MailDetails = ({
  detailPageState,
  refetchMails,
  viewType,
  resetDetailPage,
  handleSetDetailPageState,
  getFoldersMailCount,
  contact = false,
} = {}) => {
  // ** Store Variables
  const store = useSelector((state) => state.email);
  const currentSelectedAccount = store.connectedMailAccounts?.[0];
  const folders = store.folders;
  const dispatch = useDispatch();

  // ** State **
  const [nextPrevMails, setNextPrevMails] = useState();
  const [movingFolder, setMovingFolder] = useState('');
  const [threadResponse, setThreadResponse] = useState(null);

  const [query, setQuery] = useState({});
  const [skip, setSkip] = useState(true);

  // ** API Services **
  const { isLoading: mailLoading, refetch } = useGetEmailThread({
    query,
    skip,
  });
  const { markReadUnread, isLoading: markReadUnreadLoading } =
    useMarkReadUnread();
  const { getConnectedSmtpAccounts, isLoading: getConnectedAccLoading } =
    useGetConnectedSmtpAccounts();

  const { getNextPrevMail } = useGetNextPrevMail({ setNextPrevMails });
  const {
    mailMoveIntoSpecificFolder,
    isLoading: mailsMovingIntoAnotherFolder,
  } = useMailMoveIntoSpecificFolder();

  // ** Hooks
  const { getEmailModuleRoute } = useGetMailRoute({ contactId: contact.id });

  // ** Vars
  const history = useHistory();

  const searchValue = new URLSearchParams(window.location.search);
  const folder = detailPageState?.folder || searchValue.get('folder');
  const threadId = detailPageState?.threadId || searchValue.get('threadId');
  const sendDate = detailPageState?.sendDate || searchValue.get('send_date');

  const showThreadReplyAll = useMemo(() => {
    const currentMails = store.currentMails || [];
    const lastMail = currentMails[currentMails.length - 1];

    if (!lastMail) return false;

    const isSelf = lastMail.from.address === currentSelectedAccount?.username;

    if (isSelf) {
      return lastMail.to?.length > 1 || lastMail.cc?.length > 0;
    } else {
      const isInToMails = lastMail.to?.some(
        (m) => m.address === currentSelectedAccount?.username
      );
      const isInCC = lastMail.cc?.some(
        (m) => m.address === currentSelectedAccount?.username
      );
      const isInBCC = lastMail.bcc?.some(
        (m) => m.address === currentSelectedAccount?.username
      );

      return isInToMails
        ? lastMail.to?.length > 1 || lastMail.cc?.length > 0
        : isInCC || isInBCC;
    }
  }, [store?.currentMails]);

  useEffect(() => {
    if (sendDate && threadId && currentSelectedAccount?.username) {
      getNextPrevMail({
        send_date: sendDate,
        threadId,
        email: currentSelectedAccount?.username,
        folder,
        ...(contact ? { contact: contact.email } : {}),
      });
    }
  }, [sendDate, threadId, currentSelectedAccount?.username]);

  useEffect(() => {
    if (!currentSelectedAccount?.username) {
      getConnectedSmtpAccounts();
    }
    return () => {
      dispatch(setCurrentMail([]));
    };
  }, [currentSelectedAccount?.username]);

  useEffect(() => {
    if (threadId && currentSelectedAccount?.username) {
      setQuery({
        mail_provider_thread_id: threadId,
        mailbox: folder,
        email: currentSelectedAccount?.username,
      });
      setSkip(false);
    }
  }, [threadId, currentSelectedAccount?.username]);

  /* Fetch Email Thread */
  const fetchEmailThread = () => refetch();

  // ** Handle show replies, go back, folder & read click functions
  const handleGoBack = () => {
    if (viewType === EMAIL_VIEW_TYPE.SIDE_BY_SIDE) {
      resetDetailPage();
      return;
    }
    history.goBack();
  };

  const handleReadClick = async () => {
    await markReadUnread({
      mailbox: folder,
      email: currentSelectedAccount?.username,
      threadIds: [threadId],
      read: false,
    });
    if (viewType === EMAIL_VIEW_TYPE.SIDE_BY_SIDE) {
      refetchMails();
      handleSetDetailPageState({
        threadId: '',
        sendDate: '',
      });
    } else {
      handleGoBack();
    }
  };

  const handleFolderUpdate = async (e, targetFolder, ids) => {
    e.preventDefault();
    setMovingFolder(targetFolder);
    await mailMoveIntoSpecificFolder({
      mailbox: folder,
      email: currentSelectedAccount?.username,
      threadIds: ids,
      targetFolder,
    });

    setMovingFolder('');
    if (viewType === EMAIL_VIEW_TYPE.SIDE_BY_SIDE) {
      refetchMails();
      handleSetDetailPageState({
        threadId: detailPageState?.nextEmailThreadId,
        sendDate: detailPageState?.nextEmailSendDate,
      });
      getFoldersMailCount();
    } else {
      handleGoBack();
    }
  };

  const bulkOperationLoading =
    markReadUnreadLoading || mailsMovingIntoAnotherFolder;

  const addClassForReplyInMobile = () => {
    document
      .getElementsByClassName('app-content')[0]
      .classList.add('open-replyBox');
    document.getElementsByTagName('body')[0].classList.add('open-replyBox');
  };

  return (
    <>
      <div
        className={classnames('email-details-page', {
          show: true,
        })}
      >
        <Fragment>
          <div className='email-detail-header'>
            <div className='email-header-left'>
              <span className='back-arrow' onClick={handleGoBack}>
                <ArrowLeft size={20} />
              </span>
              <div className='social-icons'>
                <ul className='social-icons-list'>
                  <li className='list-inline-item'>
                    {markReadUnreadLoading ? (
                      <Spinner size='sm' />
                    ) : (
                      <>
                        <span
                          id='mail_read_unread_icon'
                          className='action-icon'
                          onClick={() =>
                            !bulkOperationLoading && handleReadClick()
                          }
                        >
                          <Mail size={18} />
                        </span>
                        <UncontrolledTooltip
                          placement='top'
                          autohide={true}
                          target='mail_read_unread_icon'
                        >
                          Mark as unread
                        </UncontrolledTooltip>
                      </>
                    )}
                  </li>
                  {Object.keys(folders).filter(
                    (key) =>
                      !!folders[key] &&
                      !EXCLUDE_FROM_MOVABLE_FOLDER_LIST.includes(
                        folders[key]
                      ) &&
                      folder !== key
                  )?.length > 0 &&
                    (movingFolder ? (
                      <li className='list-inline-item'>
                        <Spinner size='sm' />
                      </li>
                    ) : (
                      <li className='list-inline-item'>
                        <UncontrolledDropdown className=''>
                          <DropdownToggle
                            className='action-icon move-to'
                            tag='span'
                          >
                            {/* <span id='move_to_icon' className='cursor-pointer'> */}
                            <Icon icon='mdi:folder-move' width='24' />
                            {/* </span> */}
                          </DropdownToggle>
                          <DropdownMenu>
                            {Object.keys(folders)
                              .filter(
                                (key) =>
                                  !!folders[key] &&
                                  !EXCLUDE_FROM_MOVABLE_FOLDER_LIST.includes(
                                    folders[key]
                                  ) &&
                                  folder !== key
                              )
                              .map((folder, index) => (
                                <DropdownItem
                                  key={index}
                                  onClick={(e) =>
                                    !bulkOperationLoading &&
                                    handleFolderUpdate(e, folder, [threadId])
                                  }
                                >
                                  {folder}
                                </DropdownItem>
                              ))}
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </li>
                    ))}
                  {/* {folder !== 'Spam' && folder !== 'Trash' && (
                    <li className='list-inline-item'>
                      {movingFolder === 'Spam' ? (
                        <Spinner size='sm' />
                      ) : (
                        <>
                          <span
                            id='spam_mail_icon'
                            className='action-icon'
                            onClick={(e) =>
                              !bulkOperationLoading &&
                              handleFolderUpdate(e, 'Spam', [threadId])
                            }
                          >
                            <Info size={18} />
                          </span>
                          <UncontrolledTooltip
                            placement='top'
                            autohide={true}
                            target='spam_mail_icon'
                          >
                            Report spam
                          </UncontrolledTooltip>
                        </>
                      )}
                    </li>
                  )}

                  {folder !== 'Trash' && (
                    <li className='list-inline-item'>
                      {movingFolder === 'Trash' ? (
                        <Spinner size='sm' />
                      ) : (
                        <>
                          <span
                            id='mail_delete_icon'
                            className='action-icon'
                            onClick={(e) => {
                              !bulkOperationLoading &&
                                handleFolderUpdate(e, 'Trash', [threadId]);
                            }}
                          >
                            <Trash size={18} />
                          </span>
                          <UncontrolledTooltip
                            placement='top'
                            autohide={true}
                            target='mail_delete_icon'
                          >
                            Delete
                          </UncontrolledTooltip>
                        </>
                      )}
                    </li>
                  )} */}
                </ul>
              </div>
            </div>
            <div className='email-header-right'>
              <span
                className='prev'
                onClick={() => {
                  nextPrevMails?.previousMail?.mail_provider_thread_id &&
                    history.push(
                      getEmailModuleRoute(
                        `detail?folder=${folder}&threadId=${encodeURIComponent(
                          nextPrevMails?.previousMail?.mail_provider_thread_id
                        )}&send_date=${nextPrevMails?.previousMail?.send_date}`
                      )
                    );
                }}
              >
                <ChevronLeft
                  size={18}
                  className={classnames({
                    'text-muted': nextPrevMails?.previousMail
                      ?.mail_provider_thread_id
                      ? false
                      : true,
                  })}
                />
              </span>
              <span
                className='next'
                onClick={() => {
                  nextPrevMails?.nextMail?.mail_provider_thread_id &&
                    history.push(
                      getEmailModuleRoute(
                        `detail?folder=${folder}&threadId=${encodeURIComponent(
                          nextPrevMails?.nextMail?.mail_provider_thread_id
                        )}&send_date=${nextPrevMails?.nextMail?.send_date}`
                      )
                    );
                }}
              >
                <ChevronRight
                  size={18}
                  className={classnames({
                    'text-muted': nextPrevMails?.nextMail
                      ?.mail_provider_thread_id
                      ? false
                      : true,
                  })}
                />
              </span>
            </div>
          </div>
          <div className='mobile-scroll-wrapper'>
            {mailLoading || getConnectedAccLoading ? (
              <div className='loader-wrapper'>
                <Spinner />
              </div>
            ) : (
              <>
                <h2 className='email-subject'>
                  {store?.currentMails?.[0]?.subject || '(no subject)'}
                </h2>
                <div className='email-details-page-scroll-area'>
                  <div className='email-detail-box-wrapper'>
                    {store?.currentMails.map((obj, idx) => (
                      <Fragment key={obj._id}>
                        <MailDetailsItem
                          addClassForReplyInMobile={addClassForReplyInMobile}
                          obj={obj}
                          threadResponse={
                            idx === store.currentMails.length - 1 &&
                            threadResponse
                          }
                          folder={folder}
                          setThreadResponse={setThreadResponse}
                          fetchEmailThread={fetchEmailThread}
                        />
                      </Fragment>
                    ))}
                  </div>

                  {!threadResponse && (
                    <div className='reply-forward-btn-wrapper'>
                      <a
                        className='reply-btn'
                        href='/'
                        onClick={(e) => {
                          e.preventDefault();
                          setThreadResponse('reply');
                          addClassForReplyInMobile();
                        }}
                      >
                        <CornerUpLeft size={14} />
                        Reply
                      </a>
                      {showThreadReplyAll && (
                        <a
                          className='reply-btn'
                          href='/'
                          onClick={(e) => {
                            e.preventDefault();
                            setThreadResponse('reply-all');
                            addClassForReplyInMobile();
                          }}
                        >
                          <CornerUpLeft size={14} />
                          Reply all
                        </a>
                      )}
                      <a
                        className='forward-btn'
                        href='/'
                        onClick={(e) => {
                          e.preventDefault();
                          setThreadResponse('forward');
                          addClassForReplyInMobile();
                        }}
                      >
                        <CornerUpRight size={14} />
                        Forward
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Fragment>
      </div>
    </>
  );
};

export default MailDetails;
