// ** React Imports
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

// ** Custom Components
import Avatar from '@components/avatar';
import FilePreviewModal from '../../../../../@core/components/form-fields/FilePreviewModal';

// ** Utils
import { formatDateToMonthShort } from '@utils';

// ** Third Party Components
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Table,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import CopyToClipboard from 'react-copy-to-clipboard';

import {
  CornerUpLeft,
  CornerUpRight,
  Download,
  Eye,
  MoreVertical,
  Paperclip,
  Plus,
  Link as LinkIcon,
  Star,
} from 'react-feather';

import {
  downloadBlobFile,
  encrypt,
  getFileType,
} from '../../../../../helper/common.helper';
import pdfIcon from '../../../../../assets/images/icons/file-icons/pdf.png';
import csvIcon from '../../../../../assets/images/icons/file-icons/csv.png';
import docIcon from '../../../../../assets/images/icons/file-icons/doc.png';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';

import MailReply from './MailReply';
import TaskPopulateFromEmail from './TaskPopulateFromEmail';
import classNames from 'classnames';
import { useMarkStarredUnStarred } from '../hooks/useEmailService';
import { useGetToAndCCEmails } from '../hooks/useEmailHelper';

const MailDetailsItem = ({
  obj,
  threadResponse,
  setThreadResponse,
  fetchEmailThread,
  folder,
  addClassForReplyInMobile,
}) => {
  // ** Store Variables
  const store = useSelector((state) => state.email);
  const currentSelectedAccount = store.connectedMailAccounts?.[0];

  // ** State
  const [replyType, setReplyType] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentMailDetail, setCurrentMailDetail] = useState({
    body: '',
    subject: '',
    attachments: [],
    threadId: null,
  });
  const [taskReplyForwardDetail, setTaskReplyForwardDetail] = useState({
    subject: '',
    attachments: [],
    body: '',
  });

  // ** Ref **
  const iframeRef = useRef();

  // ** APIS Hooks**
  const { markStarredUnStarred } = useMarkStarredUnStarred({
    isMailDetail: true,
  });

  // ** Custom Hooks **
  const { getToAndCCEmails } = useGetToAndCCEmails();

  const showReplyAll = useMemo(() => {
    const isSelf = obj.from.address === currentSelectedAccount?.username;

    if (isSelf) {
      return obj.to?.length > 1 || obj.cc?.length > 0;
    } else {
      const isInToMails = obj.to?.some(
        (m) => m.address === currentSelectedAccount?.username
      );
      const isInCC = obj.cc?.some(
        (m) => m.address === currentSelectedAccount?.username
      );
      const isInBCC = obj.bcc?.some(
        (m) => m.address === currentSelectedAccount?.username
      );

      return isInToMails
        ? obj.to?.length > 1 || obj.cc?.length > 0
        : isInCC || isInBCC;
    }
  }, [obj]);

  const otherEmails = obj.to?.filter(
    (obj) => obj.address !== currentSelectedAccount?.username
  );

  useEffect(() => {
    if (threadResponse === 'reply') {
      setReplyType('reply');
      setTaskReplyForwardDetailFunc({
        obj,
        appendTitle: 'Email Replied',
        type: 'reply',
      });
    } else if (threadResponse === 'reply-all') {
      setReplyType('reply-all');
      setTaskReplyForwardDetailFunc({
        obj,
        appendTitle: 'Email Replied',
        type: 'reply',
      });
    } else if (threadResponse === 'forward') {
      setReplyType('forward');
      setTaskReplyForwardDetailFunc({
        obj,
        appendTitle: 'Email Forwarded',
        type: 'reply',
      });
    }
  }, [threadResponse]);

  useEffect(() => {
    window.addEventListener('resize', calculateContentHeight);
  }, []);

  const calculateContentHeight = () => {
    // const iframe = document.getElementById('mail-iframe'); // Replace 'mail-iframe' with the actual ID of your iframe
    const iframe = iframeRef.current;
    const contentHeight = iframe?.contentWindow?.document.body.scrollHeight;
    if (contentHeight) {
      iframe.style.height = `${contentHeight + 60}px`;
    }
  };

  const setTaskReplyForwardDetailFunc = async ({ obj, appendTitle, type }) => {
    const { toMails } = await getToAndCCEmails({
      currentSelectedAccount,
      mailObj: obj,
      type,
    });
    setTaskReplyForwardDetail({
      subject: `${appendTitle}: ${obj.subject}`,
      attachments: obj.attachments
        ?.filter((attachment) => !attachment.cid)
        .map((attachment) => ({
          ...attachment,
          fileUrl: attachment.path.replace(
            process.env.REACT_APP_EMAIL_ATTACHMENT_REMOVE_PATH,
            ''
          ),
        })),
      emails: toMails.map((obj) => obj.value),
      body: obj.html,
    });
  };

  const renderFile = (url) => {
    const fileType = getFileType(url);
    switch (fileType) {
      case 'image':
        return <img src={url} />;
      case 'document':
        return <img src={docIcon} />;
      case 'pdf':
        return <img src={pdfIcon} />;
      case 'csv':
        return <img src={csvIcon} />;
    }
  };

  // ** Renders Attachments
  const renderAttachments = (arr) => {
    return arr.map((item, index) => {
      return (
        <div className='mail-attachment-item' key={index}>
          <div className='inner-wrapper'>
            <div className='img-wrapper'>
              {renderFile(item.path)}
              {item.path && (
                <div className='overllay-action-btn'>
                  <button className='action-btn view'>
                    <Eye onClick={() => handleFileClick(item.path)} />
                  </button>
                  <button className='action-btn download'>
                    <Download
                      onClick={() => handleFileDownloadClick(item.path)}
                    />
                  </button>
                </div>
              )}
            </div>
            <span className='attachment-name'>{item.filename}</span>
          </div>
        </div>
      );
    });
  };

  //** View File
  const handleFileClick = (url) => {
    setCurrentPreviewFile(url);
    setPreviewModalOpen(true);
  };

  //** Download File
  const handleFileDownloadClick = (url) => downloadBlobFile(url);

  /** Modal Header Actions */
  const handleCopyLinkClick = () => {
    const toastId = showToast(TOASTTYPES.loading, '', 'Copy Link...');
    showToast(TOASTTYPES.success, toastId, 'Task Link Copied');
  };

  const handleMailStarredUnStarred = async (selectedMails, single) => {
    const unStarred = selectedMails.filter(
      (mail) => !mail.flags.includes('\\Flagged')
    );
    const starredMails = selectedMails.filter((mail) =>
      mail.flags.includes('\\Flagged')
    );

    await markStarredUnStarred(
      {
        mailbox: folder,
        email: currentSelectedAccount?.username,
        messageId: unStarred.length
          ? unStarred[0].message_id
          : starredMails[0].message_id,
        starred: unStarred.length ? true : false,
      },
      selectedMails,
      single
    );
  };

  return (
    <>
      <div className='email-detail-box'>
        <div className='email-detail-head'>
          <div className='left'>
            <Avatar
              content={
                obj?.from?.name?.toUpperCase() ||
                obj?.from?.address?.toUpperCase() ||
                ''
              }
              initials
              className=''
              imgHeight='48'
              imgWidth='48'
            />
            <div className='mail-items'>
              <div className='name-mail'>
                <h4 className='name'>{obj.from.name || obj.from.address}</h4>
                {obj.from.name && (
                  <p className='mail'>
                    &lt; <span className='innerCN'>{obj.from.address}</span>{' '}
                    &gt;
                  </p>
                )}
              </div>
              <div className='to-me-wrapper'>
                <span className='text'>
                  {obj.to?.find(
                    (obj) => obj.address === currentSelectedAccount?.username
                  ) && `to me ${otherEmails?.length ? ',' : ''}`}
                  {otherEmails?.map((obj) => obj.address).join(',')}
                </span>
                <UncontrolledDropdown className='email-info-dropup'>
                  <DropdownToggle
                    className='font-small-3 text-muted cursor-pointer'
                    tag='span'
                    caret
                  >
                    <span className='down-arrow'>{obj.from.email}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    <Table className='font-small-3' size='sm' borderless>
                      <tbody>
                        <tr>
                          <td className='text-end text-muted align-top'>
                            From:
                          </td>
                          <td>{obj.from.address}</td>
                        </tr>
                        <tr>
                          <td className='text-end text-muted align-top'>To:</td>
                          <td>{obj.to?.[0]?.address}</td>
                        </tr>
                        <tr>
                          <td className='text-end text-muted align-top'>
                            Date:
                          </td>
                          <td>
                            {formatDateToMonthShort(obj.send_date)},
                            {formatDateToMonthShort(obj.send_date, false)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </div>
          </div>
          <div className='right'>
            <span
              className='action-icon favorite'
              onClick={() => {
                handleMailStarredUnStarred([obj], true);
              }}
              id='star_un_star_icon'
            >
              <Star
                size={18}
                className={classNames({
                  favorite: obj?.flags?.includes(`\\Flagged`),
                })}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target='star_un_star_icon'
              >
                {store?.currentMails.filter(
                  (mail) => !mail.flags.includes('\\Flagged')
                ).length
                  ? 'Add star'
                  : 'Remove star'}
              </UncontrolledTooltip>
            </span>

            <UncontrolledDropdown className=''>
              <DropdownToggle className='action-toggle-btn' tag='span'>
                <MoreVertical size={14} />
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem
                  className='d-flex align-items-center w-100'
                  onClick={() => {
                    setTaskReplyForwardDetailFunc({
                      appendTitle: 'Email Replied',
                      obj,
                      type: 'reply',
                    });
                    setReplyType('reply');
                    addClassForReplyInMobile();
                  }}
                >
                  <CornerUpLeft className='me-50' size={14} />
                  Reply
                </DropdownItem>
                {showReplyAll && (
                  <DropdownItem
                    className='d-flex align-items-center w-100'
                    onClick={() => {
                      setTaskReplyForwardDetailFunc({
                        appendTitle: 'Email Replied',
                        obj,
                        type: 'reply',
                      });
                      setReplyType('reply-all');
                      addClassForReplyInMobile();
                    }}
                  >
                    <CornerUpLeft className='me-50' size={14} />
                    Reply to all
                  </DropdownItem>
                )}
                <DropdownItem
                  className='d-flex align-items-center w-100'
                  onClick={() => {
                    setTaskReplyForwardDetailFunc({
                      appendTitle: 'Email Forwarded',
                      obj,
                      type: 'reply',
                    });
                    setReplyType('forward');
                    addClassForReplyInMobile();
                  }}
                >
                  <CornerUpRight className='me-50' size={14} />
                  Forward
                </DropdownItem>
                <>
                  <CopyToClipboard
                    text={`${
                      window.location.origin
                    }/task-manager?task=${encrypt(obj.task)}`}
                  >
                    <DropdownItem
                      id={`copy_task_tooltip_${obj._id}`}
                      className='d-flex align-items-center w-100'
                      onClick={() => {
                        if (obj.task) {
                          handleCopyLinkClick();
                        } else {
                          setShowTaskModal(true);
                          setCurrentMailDetail({
                            body: obj.html,
                            subject: `Email Task: ${obj.subject}`,
                            attachments: obj.attachments
                              ?.filter((attachment) => !attachment.cid)
                              .map((attachment) => ({
                                ...attachment,
                                fileUrl: attachment.path.replace(
                                  process.env
                                    .REACT_APP_EMAIL_ATTACHMENT_REMOVE_PATH,
                                  ''
                                ),
                              })),
                            threadId: obj.mail_provider_thread_id,
                          });
                        }
                      }}
                    >
                      {obj.task ? (
                        <>
                          <LinkIcon className='me-50' size={14} />
                          Copy Task Link
                          <UncontrolledTooltip
                            placement='top'
                            autohide={true}
                            target={`copy_task_tooltip_${obj._id}`}
                          >
                            Task already created click here to copy task link
                          </UncontrolledTooltip>
                        </>
                      ) : (
                        <>
                          <Plus className='me-50' size={14} />
                          Create Task
                        </>
                      )}
                    </DropdownItem>
                  </CopyToClipboard>
                </>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </div>
        <div className='mail-message-wrapper'>
          <div className='mail-message'>
            {/* HELLO */}
            <iframe
              ref={iframeRef}
              style={{ width: '100%' }}
              // id='mail-iframe'
              className='mail-iframe'
              srcDoc={obj.html} // obj.html contains the email content
              title='Email Content'
              onLoad={calculateContentHeight}
            ></iframe>
          </div>
          {/* <div
            className='mail-message'
            dangerouslySetInnerHTML={{ __html: obj.html }}
          ></div> */}
          {obj.attachments &&
          obj.attachments?.filter((attachment) => !attachment.cid).length ? (
            <div className='mail-attachments-wrapper'>
              <div className='mail-attachments-header d-flex align-items-center mb-1'>
                <Paperclip size={16} />
                <h5 className='fw-bolder text-body mb-0 ms-50'>Attachment</h5>
              </div>
              {renderAttachments(
                obj.attachments?.filter((attachment) => !attachment.cid)
              )}
            </div>
          ) : null}

          {replyType && (
            <>
              <MailReply
                setReplyType={setReplyType}
                taskReplyForwardDetail={taskReplyForwardDetail}
                type={replyType}
                mailObj={obj}
                closeReply={() => {
                  if (threadResponse) {
                    setThreadResponse(null);
                  }
                  setReplyType(null);
                }}
                onReplySuccess={() => fetchEmailThread()}
              />
            </>
          )}
        </div>
      </div>

      <FilePreviewModal
        visibility={previewModalOpen}
        url={currentPreviewFile}
        toggleModal={() => {
          setPreviewModalOpen(false);
          setCurrentPreviewFile(null);
        }}
        title='File Upload Preview'
        isFullURL
      />
      {showTaskModal && (
        <TaskPopulateFromEmail
          setShowTaskModal={setShowTaskModal}
          showTaskModal={showTaskModal}
          currentMailDetail={currentMailDetail}
        />
      )}
    </>
  );
};

export default MailDetailsItem;
