/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
// ** React Imports
import { useEffect, useRef, useState } from 'react';
import * as yup from 'yup';

// ** Third Party Components
import { Minus, X, Maximize2, Paperclip, Trash } from 'react-feather';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';

// ** Reactstrap Imports
import {
  Form,
  Label,
  Modal,
  ModalBody,
  UncontrolledButtonDropdown,
  ModalHeader,
} from 'reactstrap';

// ** Styles
import '@styles/react/libs/editor/editor.scss';
import '@styles/react/libs/react-select/_react-select.scss';
import { FormField } from '../../../../../@core/components/form-fields';
import { SaveButton } from '@components/save-button';
import { formatBytes, validateEmail } from '../../../../../utility/Utils';
import { getConnectedMailAccounts } from '../../../../../redux/email';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';
import {
  useSendMailMutation,
  useUploadAttachmentMutation,
} from '../../../../../redux/api/mailApi';
import { htmlToDraftConverter } from '../../../../../helper/user.helper';
import SyncfusionRichTextEditor from '../../../../../components/SyncfusionRichTextEditor';

const formSchema = yup.object().shape({
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
  // html: yup.string().required(required('Message')),
});

const ComposePopup = (props) => {
  // ** Props & Custom Hooks
  const { composeOpen, toggleCompose, settingData, emailRecipients } = props;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(formSchema),
  });

  const html = useWatch({ control, name: 'html' });

  // ** Store Variables
  const connectedMailAccounts = useSelector(getConnectedMailAccounts);
  const currentSelectedAccount = connectedMailAccounts?.[0];
  const user = useSelector(userData);

  // ** States
  const [ccOpen, setCCOpen] = useState(false);
  const [bccOpen, setBCCOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isOpenErrorModal, setIsOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attachmentsLoadingCount, setAttachmentsLoadingCount] = useState(0);
  const attachmentsLoadingCountRef = useRef(0);

  // ** API Service
  const [sendMailMail, { isLoading: sendingMail }] = useSendMailMutation();
  const [getUploadAttachmentService] = useUploadAttachmentMutation();

  useEffect(() => {
    const validEmails = emailRecipients.reduce((result, email) => {
      if (validateEmail(email)) {
        result.push({ label: email, value: email });
      }
      return result;
    }, []);
    setValue('to', validEmails, {
      shouldValidate: true,
    });
  }, []);

  useEffect(() => {
    if (!_.isEmpty(errors) && errors?.to) {
      setIsOpenErrorModal(true);
    }
  }, [errors]);

  useEffect(() => {
    if (settingData?.data?.signature) {
      const mailBody = `
      <br /><br /><br /><br /><br />
      <span>--</span>
      ${settingData.data.signature}`;
      setValue('html', mailBody);
    }
  }, [settingData?.data?.signature]);

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

  // ** Toggles Compose POPUP
  const togglePopUp = (e) => {
    e.preventDefault();
    toggleCompose();
  };

  const onSubmit = async (values) => {
    const { to, cc, bcc, subject, html, createTask } = values;

    if (
      (!html &&
        confirm('Send this message without a subject or text in the body?') ===
          true) ||
      html
    ) {
      const body = {
        from: currentSelectedAccount.username,
        to: to.map((obj) => obj.value),
        ...(cc && { cc: cc.map((obj) => obj.value) }),
        ...(bcc && { bcc: bcc.map((obj) => obj.value) }),
        subject,
        html,
        attachments,
        createTask: !!createTask,
      };
      const { error } = await sendMailMail({ data: body });

      if (!error) {
        toggleCompose();
      }
    }
  };

  const handleChangeEmail = (fieldName, emails) => {
    if (emails.length) {
      const tempEmails = JSON.parse(JSON.stringify(emails));
      setValue(
        fieldName,
        tempEmails.filter((email) => validateEmail(email.value)),
        {
          shouldValidate: true,
        }
      );
    }
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

  const removeAttachment = (index) => {
    attachments.splice(index, 1);
    setAttachments([...attachments]);
  };

  const renderErrorMessage = () => {
    return errorMessage || errors?.[Object.keys(errors)?.[0]]?.message;
  };

  return (
    <>
      <span className='compose-mail-modal-overlay'></span>
      <Modal
        scrollable
        fade={false}
        keyboard={false}
        backdrop={false}
        id='compose-mail'
        container='.content-body'
        className='modal-lg'
        isOpen={composeOpen}
        contentClassName='p-0'
        toggle={toggleCompose}
        modalClassName='modal-sticky compose-mail-modal'
      >
        <div className='modal-header'>
          <h5 className='modal-title'>Compose Mail</h5>
          <div className='action-btn-wrapper'>
            <a
              href='/'
              className='action-btn minimize-btn'
              onClick={togglePopUp}
            >
              <Minus size={14} />
            </a>
            <a
              href='/'
              className='action-btn maximize-btn'
              onClick={(e) => e.preventDefault()}
            >
              <Maximize2 size={14} />
            </a>
            <a href='/' className='action-btn close-btn' onClick={togglePopUp}>
              <X size={14} />
            </a>
          </div>
        </div>
        <ModalBody className='p-0'>
          <Form className='compose-form'>
            <div
              className={`compose-mail-fields compose-mail-fields-to ${
                errors ? 'error' : ''
              }`}
            >
              <Label for='email-to' className=''>
                To:
              </Label>
              <FormField
                name='to'
                placeholder='Select assign to'
                type='creatableselect'
                errors={errors}
                control={control}
                options={[]}
                isMulti={true}
                onChange={(value) => {
                  handleChangeEmail('to', value);
                }}
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
                  errors={errors}
                  control={control}
                  options={[]}
                  isMulti={true}
                  onChange={(value) => {
                    handleChangeEmail('cc', value);
                  }}
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
                  errors={errors}
                  control={control}
                  options={[]}
                  isMulti={true}
                  onChange={(value) => {
                    handleChangeEmail('bcc', value);
                  }}
                />
                <div className='cc-bcc-close-btn-wrapper'>
                  <a href='/' className='close-btn' onClick={toggleBCC}>
                    <X size={14} />
                  </a>
                </div>
              </div>
            ) : null}
            <div
              className={`compose-mail-fields compose-mail-fields-subject ${
                errors ? 'error' : ''
              }`}
            >
              <Label for='email-subject' className=''>
                Subject:
              </Label>
              <FormField
                name='subject'
                placeholder='Subject'
                type='text'
                errors={errors}
                control={control}
              />
            </div>
            <div
              id='message-editor'
              className={`message-body-wrapper ${
                errors?.html?.message && 'error'
              }`}
            >
              {/* HELLO-DONE */}
              <SyncfusionRichTextEditor
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
                    onClick={toggleCompose}
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
                  />
                </div>
                <SaveButton
                  id='save-as-mass-email-btn'
                  onClick={handleSubmit(onSubmit)}
                  loading={sendingMail}
                  width={'100px'}
                  type='button'
                  name={'Send'}
                  className={`save-as-btn ${sendingMail ? 'opacity-50' : ''}`}
                ></SaveButton>
              </UncontrolledButtonDropdown>
            </div>
          </Form>
        </ModalBody>
      </Modal>
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
          <p className='error-text'>{renderErrorMessage()}</p>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ComposePopup;
