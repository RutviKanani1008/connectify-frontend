// ** React Imports
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

// ** Third Party Components
import _ from 'lodash';
import * as yup from 'yup';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Reactstrap Imports
import {
  Form,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledButtonDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import { ArrowLeft, Eye, Paperclip, Send, Trash, X } from 'react-feather';

// ** Helpers
import { formatBytes, validateEmail } from '../../../../../utility/Utils';

// ** Components
import { SaveButton } from '@components/save-button';
import { FormField } from '../../../../../@core/components/form-fields';

// ** Styles
import '@styles/react/libs/editor/editor.scss';
import '@styles/react/libs/react-select/_react-select.scss';

import { userData } from '../../../../../redux/user';
import moment from 'moment';
import {
  useForwardMailMutation,
  useReplyMailMutation,
  useUploadAttachmentMutation,
} from '../../../../../redux/api/mailApi';
import TaskPreview from './TaskPreview';
import { taskScheme } from '../../../TaskManager/components/TaskModal/TaskModal';
import { useGetToAndCCEmails } from '../hooks/useEmailHelper';
import CustomSelect from '../../../../../@core/components/form-fields/CustomSelect';
import { MAIL_REPLY_OPTIONS } from '../constant';
import SyncfusionRichTextEditor from '../../../../../components/SyncfusionRichTextEditor';

const replySchema = yup.object().shape({
  to: yup
    .array()
    .min(1, 'Recipient is required')
    .of(
      yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
    )
    .required('Please specify at least one recipient.')
    .nullable(),
  cc: yup
    .array()
    .of(
      yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
    )
    .nullable(),
  bcc: yup
    .array()
    .of(
      yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
    )
    .nullable(),
});

const MailReply = (props) => {
  const {
    mailObj,
    type = 'reply',
    closeReply,
    onReplySuccess,
    setReplyType,
    taskReplyForwardDetail,
  } = props;

  // ** Store Variables
  const user = useSelector(userData);
  const store = useSelector((state) => state.email);
  const currentSelectedAccount = store.connectedMailAccounts?.[0];

  // ** State **
  const [updateEditor, setUpdateEditor] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(replySchema),
  });
  const taskForm = useForm({
    resolver: yupResolver(taskScheme),
    defaultValues: { assigned: [] },
  });
  const { handleSubmit: taskHandleSubmit } = taskForm;
  const html = useWatch({ control, name: 'html' });

  // ** Refs
  const attachmentsLoadingCountRef = useRef(0);

  // ** States
  const [ccOpen, setCCOpen] = useState(false);
  const [bccOpen, setBCCOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isOpenErrorModal, setIsOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attachmentsLoadingCount, setAttachmentsLoadingCount] = useState(0);
  const [isCreateTask, setIsCreateTask] = useState(false);
  const [taskPreviewVisible, setTaskPreviewVisible] = useState(false);

  // ** Task States **
  const [startDateEndDateState, setStartDateEndDateState] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 10 * 60000),
  });

  // ** API Service
  const [replyMail, { isLoading: replyingMail }] = useReplyMailMutation();
  const [forwardMail, { isLoading: forwardingMail }] = useForwardMailMutation();
  const [getUploadAttachmentService] = useUploadAttachmentMutation();

  // ** Custom Hooks **
  const { getToAndCCEmails } = useGetToAndCCEmails();

  useEffect(() => {
    if (type === 'reply') {
      getToAndCCEmails({
        currentSelectedAccount,
        mailObj,
        type,
      }).then(({ toMails, ccMails, bccMails }) => {
        setValue('to', toMails);
        if (ccMails.length) {
          setValue('cc', ccMails);
          setCCOpen(true);
        }
        if (bccMails?.length) {
          setValue('bcc', bccMails);
          setBCCOpen(true);
        }
        if (mailObj.subject) {
          if (mailObj.mail_provider_thread_id === mailObj.message_id) {
            setValue('subject', `Re: ${mailObj.subject}`);
          } else {
            setValue('subject', mailObj.subject);
          }
        }
        setInitialReplyMailBody(mailObj);
      });
    } else if (type === 'reply-all') {
      getToAndCCEmails({
        currentSelectedAccount,
        mailObj,
        type,
      }).then(({ toMails, ccMails, bccMails }) => {
        setValue('to', toMails);

        if (bccMails?.length) {
          setValue('bcc', bccMails);
          setBCCOpen(true);
        }

        if (ccMails.length) {
          setValue('cc', ccMails);
          setCCOpen(true);
        }
        if (mailObj.subject) {
          if (mailObj.mail_provider_thread_id === mailObj.message_id) {
            setValue('subject', `Re: ${mailObj.subject}`);
          } else {
            setValue('subject', mailObj.subject);
          }
        }
        setInitialReplyMailBody(mailObj);
      });
    } else if (type === 'forward') {
      setInitialForwardMailBody(mailObj);
      if (mailObj.subject) {
        if (mailObj.mail_provider_thread_id === mailObj.message_id) {
          setValue('subject', `Fwd: ${mailObj.subject}`);
        } else {
          setValue('subject', mailObj.subject);
        }
      }
    }
  }, [mailObj, type]);

  useEffect(() => {
    if (!_.isEmpty(errors) && errors?.to) {
      setIsOpenErrorModal(true);
    }
  }, [errors]);

  const handleChangeEmail = (fieldName, emails) => {
    if (emails.length) {
      const tempEmails = JSON.parse(JSON.stringify(emails));
      setValue(
        fieldName,
        tempEmails.filter((email) => validateEmail(email.value)),
        { shouldValidate: true }
      );
    }
  };

  // ** CC Toggle Function
  const toggleCC = (e) => {
    e.preventDefault();
    setCCOpen(!ccOpen);
  };

  // ** BCC Toggle Function
  const toggleBCC = (e) => {
    e.preventDefault();
    setBCCOpen(!bccOpen);
  };

  const attachmentUpload = async (e) => {
    try {
      const { files } = e.target;
      let currentAllFileSize = 0;
      const formData = new FormData();
      formData.append('filePath', `${user?.company?._id}/email-attachment`);
      if (files && files.length) {
        Array.from(files).forEach((file) => {
          currentAllFileSize += file.size;
          formData.append('attachments', file);
        });
      }
      const allAttachmentTotalSize =
        attachments.reduce(
          (previousValue, currentValue) => previousValue + currentValue.size,
          0
        ) + currentAllFileSize;

      if (allAttachmentTotalSize > 5 * 1024 * 1024) {
        setErrorMessage('Please upload all attachments less than 5MB');
        setError('attachments', {
          type: 'custom',
          message: 'Please upload all attachments less than 5MB',
        });
        setIsOpenErrorModal(true);
        e.target.value = '';
      } else {
        const prevFileLength =
          attachmentsLoadingCountRef.current + files.length;
        setAttachmentsLoadingCount(prevFileLength);
        attachmentsLoadingCountRef.current = prevFileLength;

        const { data, error } = await getUploadAttachmentService({
          data: formData,
        });

        const afterFileLength =
          attachmentsLoadingCountRef.current - files.length;
        setAttachmentsLoadingCount(afterFileLength);
        attachmentsLoadingCountRef.current = afterFileLength;

        e.target.value = '';
        if (data && _.isArray(data.data) && !error) {
          setAttachments((prev) => [
            ...prev,
            ...data.data.map((obj) => ({
              url: obj.key,
              path: obj.location,
              contentType: obj.contentType,
              filename: obj.originalname,
              size: obj.size,
            })),
          ]);
        }
      }
    } catch (error) {
      console.log('Error:attachmentUpload', error);
    }
  };

  const setInitialReplyMailBody = (mailObj) => {
    const mailBody = `
        <br /><br />
        <div class=''>
          <div class='mail_attr'>
          ${moment(mailObj.send_date).format('ddd, MMM D, YYYY [at] hh:mm A')}
            &lt;
            <a href='mailto:${mailObj.from.address}'>${mailObj.from.address}</a>
            &gt; wrote:
            <br />
          </div>
          <div
              style='margin: 0px 0px 0px 0.8ex;
              border-left: 1px solid rgb(204, 204, 204);
              padding-left: 1ex;'
          >
            <div>${mailObj.html}</div>
          </div>
        </div>`;

    // setMailBody(mailBody);
    setValue('html', mailBody);
    setUpdateEditor((prev) => prev + 1);
  };

  const setInitialForwardMailBody = (mailObj) => {
    const to = (mailObj.to || []).map((item) => item.address).join(', ');

    const mailBody = `<div className='mail_attr'>
        ---------- Forwarded message ---------
        <br />
        From:
        <strong className='mail_sendername'>${mailObj.from.name}</strong>
        <span>
          &lt;
          <a href={mailto:${mailObj.from.address}}>${mailObj.from.address}</a>
          &gt;
        </span>
        <br />
        ${moment(mailObj.send_date).format('ddd, MMM D, YYYY [at] hh:mm A')}
        <br />
        Subject: ${mailObj.subject}
        <br />
        To: &lt;<a href='/'>${to}</a>
        &gt;
      </div>
      <br>${mailObj.html}
      `;
    setValue('html', mailBody);
    setUpdateEditor((prev) => prev + 1);
  };

  const removeAttachment = (index) => {
    attachments.splice(index, 1);
    setAttachments([...attachments]);
  };

  const onSubmit = async (replyValue) => {
    if (isCreateTask) {
      taskHandleSubmit((taskValue) => {
        handleMailReply({ replyValue, taskValue });
      })();
    } else {
      handleMailReply({ replyValue });
    }
  };

  const handleMailReply = async ({ replyValue, taskValue = {} }) => {
    const { to, cc, bcc, subject, html } = replyValue;

    const body = {
      message_id: mailObj.message_id,
      mail_provider_thread_id: mailObj.mail_provider_thread_id,
      from: currentSelectedAccount.username,
      to: to.map((obj) => obj.value),
      ...(cc && { cc: cc.map((obj) => obj.value) }),
      ...(bcc && { bcc: bcc.map((obj) => obj.value) }),
      subject,
      html,
      attachments,
      createTask: isCreateTask,
      taskValue: {
        ...taskValue,
        startDate: startDateEndDateState.startDate,
        endDate: startDateEndDateState.endDate,
      },
    };
    const { error } =
      type === 'reply' || type === 'reply-all'
        ? await replyMail({ data: body })
        : await forwardMail({ data: body });
    if (!error) {
      onReplySuccess();
      closeReply();
    }
  };

  const addClassForReplyTaskPreviewInMobile = () => {
    document
      .getElementsByClassName('app-content')[0]
      .classList.add('open-taskPreview');
  };

  return (
    <>
      <div>
        <Form className='reply-mail-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='mobile-header'>
            <div className='mobile-header-left'>
              <div className='action-btn back-btn'>
                <ArrowLeft
                  className='cursor-pointer'
                  size={18}
                  onClick={closeReply}
                />
              </div>
              <CustomSelect
                label=''
                defaultValue={{
                  value: 'reply',
                  label: 'Reply',
                }}
                classNamePrefix='custom-select'
                onChange={(e) => {
                  setReplyType(e.value);
                }}
                options={MAIL_REPLY_OPTIONS}
              />
            </div>
            <div className='mobile-header-right'>
              <SaveButton
                id='save-as-mass-email-btn'
                onClick={handleSubmit(onSubmit)}
                loading={replyingMail || forwardingMail}
                width={'100px'}
                type='button'
                name={
                  <>
                    <Send />
                    <span className='btn-text'>Send</span>
                  </>
                }
                className={`save-as-btn ${
                  replyingMail || forwardingMail ? 'opacity-50' : ''
                }`}
              />
            </div>
          </div>
          <div className='mobile-body-wrapper hide-scrollbar'>
            <div className='compose-mail-fields compose-mail-fields-to'>
              <Label for='email-to' className=''>
                To:
              </Label>
              <FormField
                name='to'
                placeholder='Select assign to'
                type='creatableselect'
                control={control}
                options={[]}
                isMulti={true}
                onChange={(value) => handleChangeEmail('to', value)}
              />
              <div className='cc-bcc-btns-wrapper'>
                <a href='/' className='cc-btn' onClick={toggleCC}>
                  Cc
                </a>
                <a href='/' className='bcc-btn' onClick={toggleBCC}>
                  Bcc
                </a>
              </div>
            </div>
            {ccOpen === true ? (
              <div
                className={`compose-mail-fields compose-mail-fields-cc ${
                  errors ? 'error' : ''
                }`}
              >
                <Label for='email-cc' className=''>
                  Cc:
                </Label>
                <FormField
                  name='cc'
                  placeholder='Select assign to'
                  type='creatableselect'
                  control={control}
                  options={[]}
                  isMulti={true}
                  onChange={(value) => handleChangeEmail('cc', value)}
                />
                <div className='cc-bcc-close-btn-wrapper'>
                  <a href='/' className='close-btn' onClick={toggleCC}>
                    <X size={14} />
                  </a>
                </div>
              </div>
            ) : null}
            {bccOpen === true ? (
              <div
                className={`compose-mail-fields compose-mail-fields-bcc ${
                  errors ? 'error' : ''
                }`}
              >
                <Label for='email-bcc' className=''>
                  Bcc:
                </Label>
                <FormField
                  name='bcc'
                  placeholder='Select assign to'
                  type='creatableselect'
                  control={control}
                  options={[]}
                  isMulti={true}
                  onChange={(value) => handleChangeEmail('bcc', value)}
                />
                <div className='cc-bcc-close-btn-wrapper'>
                  <a href='/' className='close-btn' onClick={toggleBCC}>
                    <X size={14} />
                  </a>
                </div>
              </div>
            ) : null}
            <div
              id='message-editor'
              className={`message-body-wrapper ${
                errors?.html?.message && 'error'
              }`}
            >
              <SyncfusionRichTextEditor
                key={`details_${updateEditor}`}
                onChange={(e) => {
                  setValue('html', e.value);
                }}
                value={html}
              />
              <div className='attachment-wrapper'>
                {[...Array(attachmentsLoadingCount)].map((_, index) => (
                  <div key={index} className='attachment-row'>
                    <span className='attachment-icon'>
                      <div className='skeletonBox'></div>
                    </span>
                    <span className='attachment-name'>
                      <div className='skeletonBox'></div>
                    </span>
                    <span className='attachment-size'>
                      <div className='skeletonBox'></div>
                    </span>
                  </div>
                ))}
                {attachments.map((attachment, index) => (
                  <div key={index} className='attachment-row'>
                    <span className='attachment-icon'>
                      <img src='/images/image-icon.svg' alt='' />
                    </span>
                    <span className='attachment-name'>
                      {attachment.filename}
                    </span>
                    <span className='attachment-size'>
                      {formatBytes(attachment.size)}
                    </span>
                    <span
                      className='attachment-close'
                      onClick={() => removeAttachment(index)}
                    >
                      <X />
                    </span>
                  </div>
                ))}
              </div>
              {errors?.html?.message && (
                <div className='invalid-feedback'>{errors.html.message}</div>
              )}
            </div>
            <div className='compose-footer-wrapper'>
              <div className='action-btn-wrapper'>
                <div className='action-btn upload-btn'>
                  <Paperclip className='' size={18} />
                  <input
                    type='file'
                    name='attach-email-item'
                    id='attach-email-item'
                    multiple
                    onChange={attachmentUpload}
                  />
                </div>
                <div className='action-btn delete-btn'>
                  <Trash
                    className='cursor-pointer'
                    size={18}
                    onClick={closeReply}
                  />
                </div>
              </div>

              <UncontrolledButtonDropdown
                direction='up'
                className='send__btn__group'
              >
                <div className='create-task'>
                  <span className='label'>Create Task:</span>
                  <FormField
                    className='pe-2'
                    type='checkbox'
                    errors={errors}
                    control={control}
                    name='createTask'
                    onChange={(e) => {
                      setIsCreateTask(e.target.checked);
                      setTaskPreviewVisible(e.target.checked);
                    }}
                  />
                  {isCreateTask && (
                    <div style={{ display: 'none' }}>
                      <Eye
                        id='createTask_preview_tooltip'
                        onClick={() => {
                          setTaskPreviewVisible((prev) => !prev);
                          addClassForReplyTaskPreviewInMobile();
                        }}
                      />
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target='createTask_preview_tooltip'
                      >
                        Preview Task
                      </UncontrolledTooltip>
                    </div>
                  )}
                </div>
                <SaveButton
                  id='save-as-mass-email-btn'
                  onClick={handleSubmit(onSubmit)}
                  loading={replyingMail || forwardingMail}
                  width={'100px'}
                  type='button'
                  name={'Send'}
                  className={`save-as-btn ${
                    replyingMail || forwardingMail ? 'opacity-50' : ''
                  }`}
                />
              </UncontrolledButtonDropdown>
            </div>
          </div>
          <div className='mobile-footer'>
            <div className='action-btn upload-btn'>
              <Paperclip className='' size={18} />
              <span className='text'>Attachment</span>
              <input
                type='file'
                name='attach-email-item'
                id='attach-email-item'
                multiple
                onChange={attachmentUpload}
              />
            </div>
            <div className='create-task'>
              <span className='label'>Create Task:</span>
              <FormField
                className='pe-2'
                type='checkbox'
                errors={errors}
                control={control}
                name='createTaskMobile'
                onChange={(e) => {
                  setIsCreateTask(e.target.checked);
                  setTaskPreviewVisible(e.target.checked);
                }}
              />
              {isCreateTask && (
                <>
                  <div className='view-task-btn'>
                    <Eye
                      id='createTaskMobile_preview_tooltip'
                      onClick={() => {
                        setTaskPreviewVisible((prev) => !prev);
                        addClassForReplyTaskPreviewInMobile();
                      }}
                    />
                  </div>
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target='createTaskMobile_preview_tooltip'
                  >
                    Preview Task
                  </UncontrolledTooltip>
                </>
              )}
            </div>
          </div>
        </Form>
        <Modal
          isOpen={isOpenErrorModal}
          toggle={() => setIsOpenErrorModal(false)}
          className='modal-dialog-centered compose-error-modal'
          size='sm'
          backdrop='static'
        >
          <ModalHeader
            toggle={() => {
              setIsOpenErrorModal(false);
              setErrorMessage('');
            }}
          >
            Error
          </ModalHeader>
          <ModalBody className='p-2'>
            <p className='error-text'>
              {errorMessage || errors?.[Object.keys(errors)?.[0]]?.message}
            </p>
          </ModalBody>
        </Modal>
      </div>

      {taskPreviewVisible && (
        <TaskPreview
          setTaskPreviewVisible={setTaskPreviewVisible}
          taskReplyForwardDetail={taskReplyForwardDetail}
          taskForm={taskForm}
          setStartDateEndDateState={setStartDateEndDateState}
          startDateEndDateState={startDateEndDateState}
        />
      )}
    </>
  );
};

export default MailReply;
