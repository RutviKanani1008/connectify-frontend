/* eslint-disable no-tabs */
/* eslint-disable no-unused-vars */
// ** React Imports
import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';

// ** Mail Components Imports
import ComposePopup from './ComposePopup';

// ** Utils
import { formatDateToMonthShort } from '@utils';

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Mail, Trash, Info, Star, Filter } from 'react-feather';

// ** Reactstrap Imports
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Spinner,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import MailCard from './MailCard';
import useGetBasicRoute from '../../../../../hooks/useGetBasicRoute';
import {
  useFoldersMailCount,
  useGetEmails,
  useMailMoveIntoSpecificFolder,
  useMarkReadUnread,
  useMarkStarredUnStarred,
} from '../hooks/useEmailService';
import {
  selectAllMail,
  setEmailFilter,
  setMails,
} from '../../../../../redux/email';
import { isUnReadMail, isMailStarred } from '../helper';
import { EMAIL_VIEW_TYPE, EXCLUDE_FROM_MOVABLE_FOLDER_LIST } from '../constant';
import EmailSplitViewIcon from '../../../../../@core/assets/svg-icons/EmailSplitViewIcon';
import EmailFullViewIcon from '../../../../../@core/assets/svg-icons/EmailFullViewIcon';
import useGetMailRoute from '../hooks/useRoute';

const Mails = forwardRef((props, ref) => {
  // ** Props
  const {
    store,
    composeOpen,
    toggleCompose,
    dispatch,
    setDetailPageState,
    viewType,
    contact = false,
    setQueryArg,
    setSkip,
    mailLoading,
    handleSetDetailPageState,
    handleView,
    detailPageState,
    settingData,
  } = props;

  // ** Store Variables
  const { mails = [], selectedMails, params: storeParams } = store;
  const filters = storeParams.filters;
  const mailFolders = store.folders;
  const currentSelectedAccount = store.connectedMailAccounts?.[0];

  // ** Vars
  const history = useHistory();
  const params = useParams();
  const folder = params.folder || Object.keys(mailFolders || {})?.[0];
  const searchParams = store.params;

  // ** Variables
  const labelColors = {
    personal: 'success',
    company: 'primary',
    important: 'warning',
    private: 'danger',
  };

  // ** State **
  const [movingFolder, setMovingFolder] = useState('');
  const [activeIndex, setActiveIndex] = useState();

  useImperativeHandle(ref, () => ({
    resetActiveIndex: () => setActiveIndex(),
  }));

  // ** Ref **
  const selectedMailRef = useRef();
  const mailsRef = useRef();
  const viewTypeRef = useRef();

  const currentActiveRef = useRef();
  const inputRef = useRef(null);

  // ** Hooks
  const { getEmailModuleRoute } = useGetMailRoute({ contactId: contact.id });

  // ** API service
  const { markReadUnread, isLoading: markReadUnreadLoading } =
    useMarkReadUnread();
  const { markStarredUnStarred, isLoading: markStarredAndUnStarredLoading } =
    useMarkStarredUnStarred();
  const {
    mailMoveIntoSpecificFolder,
    isLoading: mailsMovingIntoAnotherFolder,
  } = useMailMoveIntoSpecificFolder();
  const { getFoldersMailCount } = useFoldersMailCount();

  const bulkOperationLoading =
    markReadUnreadLoading ||
    markStarredAndUnStarredLoading ||
    mailsMovingIntoAnotherFolder;

  useEffect(() => {
    mailsRef.current = mails;
  }, [mails]);

  useEffect(() => {
    viewTypeRef.current = viewType;
  }, [viewType]);

  useEffect(() => {
    setQueryArg({
      ...(contact ? { contact: contact.email } : {}),
      email: currentSelectedAccount.username,
      folder,
      page: searchParams.page,
      search: searchParams.search,
      filters: searchParams.filters,
    });
    setSkip(false);
  }, [folder, searchParams]);

  useEffect(() => {
    getFoldersMailCount({ ...(contact ? { contact: contact.email } : {}) });
  }, []);

  useEffect(() => {
    inputRef.current.focus();
    const element = document.getElementsByClassName('email-list-wrapper')?.[0];
    element?.focus();
    if (element) {
      document.addEventListener('keydown', (event) => eventListener(event));
    }
  }, []);

  useEffect(() => {
    currentActiveRef.current = undefined;
    setActiveIndex();
  }, [folder]);

  const eventListener = (event) => {
    const element = document.getElementsByClassName('email-list-wrapper')?.[0];
    if (element && selectedMailRef.current) {
      element.scrollTop = selectedMailRef.current.offsetTop - element.offsetTop;
    }
    try {
      let currentActive = currentActiveRef.current;
      if (currentActive !== undefined) {
        if (event.key === 'ArrowUp') {
          currentActive = Math.max(currentActive - 1, 0);
        } else if (event.key === 'ArrowDown') {
          currentActive = Math.min(
            currentActive + 1,
            mailsRef.current.length - 1
          );
        }
      } else {
        currentActive = 0;
      }
      currentActiveRef.current = currentActive;
      setActiveIndex(currentActive);
      if (
        viewTypeRef.current === EMAIL_VIEW_TYPE.SIDE_BY_SIDE &&
        mailsRef.current?.[currentActive]?.mail_provider_thread_id &&
        mailsRef.current?.[currentActive]?.send_date
      ) {
        handleSetDetailPageState({
          threadId: mailsRef.current[currentActive].mail_provider_thread_id,
          sendDate: mailsRef.current[currentActive].send_date,
        });
        dispatch(
          setMails(
            mailsRef.current.map((mail) =>
              mail.mail_provider_thread_id ===
              mailsRef.current[currentActive].mail_provider_thread_id
                ? {
                    ...mail,
                    flags: (mail.flags || []).map((flag) => [
                      ...flag,
                      '\\Seen',
                    ]),
                  }
                : mail
            )
          )
        );
      }
    } catch (error) {
      console.log({ error });
    }
  };

  // ** Handles Update Functions
  const handleMailClick = (threadId, sendDate, index) => {
    if (viewType === EMAIL_VIEW_TYPE.STANDARD) {
      history.push(
        getEmailModuleRoute(
          `detail?folder=${folder}&threadId=${encodeURIComponent(
            threadId
          )}&send_date=${sendDate}`
        )
      );
    } else {
      dispatch(
        setMails(
          mailsRef.current.map((mail) =>
            mail.mail_provider_thread_id ===
            mailsRef.current[index].mail_provider_thread_id
              ? {
                  ...mail,
                  flags: (mail.flags || []).map((flag) => [...flag, '\\Seen']),
                }
              : mail
          )
        )
      );
      currentActiveRef.current = index;
      setActiveIndex(index);
      handleSetDetailPageState({ threadId, sendDate });
    }
  };

  // ** Handles SelectAll
  const handleSelectAll = (e) => {
    dispatch(selectAllMail(e.target.checked));
  };

  // ** Handles Folder Update
  const handleFolderUpdate = async (e, targetFolder, ids = selectedMails) => {
    setMovingFolder(targetFolder);
    e.preventDefault();
    await mailMoveIntoSpecificFolder({
      mailbox: folder,
      email: currentSelectedAccount?.username,
      threadIds: ids.map((mail) => mail.mail_provider_thread_id),
      targetFolder,
    });
    handleSetDetailPageState({
      threadId: detailPageState?.nextEmailThreadId,
      sendDate: detailPageState?.nextEmailSendDate,
    });
    getFoldersMailCount();
    setMovingFolder('');
  };

  // ** Handles Mail Read Update
  const handleMailReadUpdate = async () => {
    const unreadMails = selectedMails.filter((mail) =>
      isUnReadMail(mail.flags)
    );
    const readMails = selectedMails.filter((mail) => !isUnReadMail(mail.flags));

    await markReadUnread({
      mailbox: folder,
      email: currentSelectedAccount?.username,
      threadIds: JSON.stringify(
        unreadMails.length
          ? unreadMails.map((mail) => mail.mail_provider_thread_id)
          : readMails.map((mail) => mail.mail_provider_thread_id)
      ),
      read: unreadMails.length ? true : false,
    });
  };

  const handleMailStarredUnStarred = async (selectedMails, single) => {
    const unStarred = selectedMails.filter(
      (mail) => !isMailStarred(mail.flags)
    );
    const starredMails = selectedMails.filter((mail) =>
      isMailStarred(mail.flags)
    );

    await markStarredUnStarred(
      {
        mailbox: folder,
        email: currentSelectedAccount?.username,
        threadIds: unStarred.length
          ? unStarred.map((mail) => mail.mail_provider_thread_id)
          : starredMails.map((mail) => mail.mail_provider_thread_id),
        starred: unStarred.length ? true : false,
      },
      selectedMails,
      single,
      'list'
    );
  };

  // ** Renders Mail
  const renderMails = () => {
    if (mails.length) {
      return mails.map((mail, index) => {
        return (
          <div
            ref={
              (detailPageState?.threadId ||
                mails?.[0]?.mail_provider_thread_id) ===
              mail?.mail_provider_thread_id
                ? selectedMailRef
                : null
            }
            key={index}
          >
            <MailCard
              activeIndex={activeIndex}
              index={index}
              mail={mail}
              dispatch={dispatch}
              labelColors={labelColors}
              selectedMails={selectedMails}
              handleMailClick={handleMailClick}
              formatDateToMonthShort={formatDateToMonthShort}
              handleMailStarredUnStarred={handleMailStarredUnStarred}
              bulkOperationLoading={bulkOperationLoading}
            />
          </div>
        );
      });
    }
  };

  return (
    <Fragment>
      <input ref={inputRef} tabIndex={-1} style={{ opacity: 0 }} />
      {mails.length ? (
        <div className='select-all-wrapper'>
          <div className='select-all'>
            <Input
              type='checkbox'
              id='select-all'
              onChange={handleSelectAll}
              checked={
                selectedMails.length && selectedMails.length === mails.length
              }
            />
            <Label className='' for='select-all'>
              Select All
            </Label>
          </div>

          <div className='action-right'>
            <ul className='list-inline m-0'>
              {selectedMails.length ? (
                <>
                  <li className='list-inline-item'>
                    <span
                      className='action-icon favorite-icon'
                      onClick={() =>
                        !bulkOperationLoading &&
                        handleMailStarredUnStarred(selectedMails)
                      }
                      id='star_un_star_icon'
                    >
                      {markStarredAndUnStarredLoading ? (
                        <Spinner size='sm' />
                      ) : (
                        <Star size={18} />
                      )}
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target='star_un_star_icon'
                      >
                        {selectedMails.filter(
                          (mail) => !isMailStarred(mail.flags)
                        ).length
                          ? 'Add star'
                          : 'Remove star'}
                      </UncontrolledTooltip>
                    </span>
                  </li>
                  <li className='list-inline-item'>
                    <span
                      id='mail_read_unread_icon'
                      className='action-icon make-read-icon'
                      onClick={() =>
                        !bulkOperationLoading &&
                        handleMailReadUpdate(selectedMails, false)
                      }
                    >
                      {markReadUnreadLoading ? (
                        <Spinner size='sm' />
                      ) : selectedMails.filter((mail) =>
                          isUnReadMail(mail.flags)
                        ).length ? (
                        <Icon
                          className='cursor-pointer'
                          icon='fluent:mail-read-16-regular'
                          width='12'
                        />
                      ) : (
                        <Mail size={18} />
                      )}
                    </span>
                    <UncontrolledTooltip
                      placement='top'
                      autohide={true}
                      target='mail_read_unread_icon'
                    >
                      {selectedMails.filter((mail) => isUnReadMail(mail.flags))
                        .length
                        ? 'Mark as read'
                        : 'Mark as unread'}
                    </UncontrolledTooltip>
                  </li>

                  {Object.keys(mailFolders).filter(
                    (key) =>
                      !!mailFolders[key] &&
                      !EXCLUDE_FROM_MOVABLE_FOLDER_LIST.includes(
                        mailFolders[key]
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
                            className='action-icon folder-move-icon'
                            tag='span'
                          >
                            <Icon icon='mdi:folder-move' width='24' />
                          </DropdownToggle>
                          <DropdownMenu>
                            {Object.keys(mailFolders)
                              .filter(
                                (key) =>
                                  !!mailFolders[key] &&
                                  !EXCLUDE_FROM_MOVABLE_FOLDER_LIST.includes(
                                    mailFolders[key]
                                  ) &&
                                  folder !== key
                              )
                              .map((folder, index) => (
                                <DropdownItem
                                  key={index}
                                  onClick={(e) =>
                                    !bulkOperationLoading &&
                                    handleFolderUpdate(e, folder)
                                  }
                                >
                                  {folder}
                                </DropdownItem>
                              ))}
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </li>
                    ))}
                </>
              ) : null}
              {folder !== 'Unread' && (
                <li className='list-inline-item'>
                  <UncontrolledDropdown className='filter-dropdown'>
                    <DropdownToggle
                      className='action-icon filter-icon'
                      tag='span'
                    >
                      <Filter />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem
                        className={`d-flex align-items-center w-100 ${
                          filters.includes('SEEN') ? 'active' : ''
                        }`}
                        onClick={() => {
                          dispatch(setEmailFilter('SEEN'));
                        }}
                      >
                        Read
                      </DropdownItem>
                      <DropdownItem
                        className={`d-flex align-items-center w-100 ${
                          filters.includes('UNSEEN') ? 'active' : ''
                        }`}
                        onClick={() => {
                          dispatch(setEmailFilter('UNSEEN'));
                        }}
                      >
                        Unread
                      </DropdownItem>
                      <DropdownItem
                        className={`d-flex align-items-center w-100 ${
                          filters.includes('ALL') ? 'active' : ''
                        }`}
                        onClick={() => {
                          dispatch(setEmailFilter('ALL'));
                        }}
                      >
                        All
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </li>
              )}
            </ul>
            <span
              className='action-icon split-view-icon'
              onClick={() => {
                handleView(
                  viewType === EMAIL_VIEW_TYPE.STANDARD
                    ? EMAIL_VIEW_TYPE.SIDE_BY_SIDE
                    : EMAIL_VIEW_TYPE.STANDARD
                );
              }}
            >
              {viewType === EMAIL_VIEW_TYPE.STANDARD ? (
                <EmailSplitViewIcon />
              ) : (
                <EmailFullViewIcon />
              )}
            </span>
          </div>
        </div>
      ) : (
        <></>
      )}
      <PerfectScrollbar
        className={`email-list-wrapper ${!mails.length ? 'no-data' : ''}`}
        options={{ wheelPropagation: false }}
      >
        {mailLoading ? (
          <div className='spinner-wrapper'>
            <Spinner />
          </div>
        ) : mails.length ? (
          <ul className='email-items'>{renderMails()}</ul>
        ) : (
          <div className='no-record-wrapper'>
            <div className='no-record-found-table'>
              <div className='img-wrapper'>
                <img src='/images/no-result-found.png' />
              </div>
              <div className='title'>No record found</div>
              <p className='text'>
                Whoops... we do not see any records for this table in our
                database
              </p>
            </div>
          </div>
        )}
      </PerfectScrollbar>
      {composeOpen && (
        <ComposePopup
          composeOpen={composeOpen}
          toggleCompose={toggleCompose}
          settingData={settingData}
          emailRecipients={[contact.email]}
        />
      )}
    </Fragment>
  );
});

Mails.displayName = 'Mails';
export default Mails;
