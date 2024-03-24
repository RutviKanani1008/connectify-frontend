import { useForm, useWatch } from 'react-hook-form';
import {
  Button,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { FormField } from '@components/form-fields';
import { validateEmail } from '../../../../utility/Utils';
import { useRef, useState } from 'react';
import EmailEditors from './EmailEditor';
import { SaveButton } from '../../../../@core/components/save-button';
import { useSendContactEmail } from '../hooks/contactEmailApi';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { required } from '../../../../configs/validationConstant';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
  FORM_SCHEDULE_TIMER,
} from '../../../../constant';
import moment from 'moment';
import NewTaskManagerFileDropZone from '../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { uploadDocumentFileAPI } from '../../../../api/documents';

const sendContactEmailSchema = yup.object().shape({
  subject: yup.string().required(required('Subject')).nullable(),
});

export const SendContactEmail = (props) => {
  const childRef = useRef();
  const user = useSelector(userData);
  const [isCreated, setIsCreated] = useState(false);
  const minDate = new Date();
  const defaultValues = {
    emailTemplate: null,
    bcc: [],
    cc: [],
  };
  const [attachmentFileUrl, setAttachmentFileUrl] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);
  const currentUser = useSelector(userData);

  const {
    openSendMailModal,
    handleCloseSendMailModal,
    availableEmailTemplate,
    currentContactDetail,
    availableSendContactEmail,
    setAvailableSendContactEmail,
    params,
  } = props;
  const [tempKey, setTempKey] = useState();
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(sendContactEmailSchema),
    defaultValues,
  });
  const delayStatus = useWatch({ control, name: 'delay' });

  const { sendContactEmail, isLoading: sendEmailLoading } =
    useSendContactEmail();

  const onSendEmailSubmit = async (values) => {
    if (values.delay.value === 'custom' && values.delayTime) {
      values.sendAfter =
        moment(values.delayTime).valueOf() - moment().valueOf();
    } else {
      values.sendAfter =
        moment().add(values.delay.value, 'minutes').valueOf() -
        moment().valueOf();
      values.delayTime = moment().add(values.delay.value, 'minutes').toDate();
    }
    if (values.sendAfter < 0) {
      values.sendAfter = 0;
    }
    let tempObj = JSON.parse(JSON.stringify(availableSendContactEmail));
    const { design, html } = await childRef?.current?.getEditorData();
    if (design && html) {
      values.htmlBody = html;
      values.jsonBody = JSON.stringify(design);
    }
    values.contact = currentContactDetail?._id;
    if (values?.bcc?.length) {
      values.bcc = values?.bcc?.map((bcc) => bcc.value);
    } else {
      values.bcc = [];
    }
    if (values?.cc?.length) {
      values.cc = values?.cc?.map((cc) => cc.value);
    } else {
      values.cc = [];
    }
    if (values?.emailTemplate) {
      values.emailTemplate = values?.emailTemplate?.value;
    }
    values.company = user.company?._id;

    const { data, error } = await sendContactEmail(values);
    if (!error) {
      if (!tempObj?.length) {
        tempObj = [];
      }
      tempObj?.push(data);
      setAvailableSendContactEmail(tempObj);
      handleCloseSendMailModal();
      reset({});
    }
  };

  const onChangeEmailTemplate = (selectedEmailTemplate) => {
    const selectedTemplete = availableEmailTemplate.find(
      (template) => template?._id === selectedEmailTemplate.value
    );
    setValue('subject', selectedTemplete?.subject || '');
    setValue('htmlBody', selectedTemplete?.htmlBody || '');
    setValue('jsonBody', selectedTemplete?.jsonBody || '');
    // childRef.current.onReady();
    setTempKey(Math.random());
  };

  const handleChangeEmail = (emails, type) => {
    if (emails.length) {
      const tempEmails = JSON.parse(JSON.stringify(emails));
      setValue(
        type,
        tempEmails.filter((email) => validateEmail(email.value))
      );
    }
  };

  const attachmentUpload = (files) => {
    const formData = new FormData();
    formData.append(
      'filePath',
      `${currentUser?.company?._id}/contacts/${params.id}/contact-emails`
    );
    files?.forEach((file) => {
      if (!file?.url) {
        formData.append('attachments', file);
      }
    });
    if (files.length && files.filter((file) => !file?.url)?.length) {
      setFileUploading(true);
      uploadDocumentFileAPI(formData)
        .then((res) => {
          if (res.error) {
            setFileUploading(false);
          } else {
            if (res?.data?.data) {
              const fileObj = [];
              const latestUpdate = files.filter((f) => f.lastModified);
              res?.data?.data.map((data, index) => {
                const obj = {};
                obj.fileUrl = data;
                obj.fileName = latestUpdate[index].name;
                fileObj.push(obj);
              });
              setValue('attachments', [...attachmentFileUrl, ...fileObj]);
              setAttachmentFileUrl([...attachmentFileUrl, ...fileObj]);
            }
          }
          setFileUploading(false);
        })
        .catch(() => {
          setFileUploading(false);
        });
    }
  };

  const changeUploadFileName = (fileObj) => {
    setAttachmentFileUrl(
      attachmentFileUrl.map((file, index) => {
        if (index === fileObj.index) {
          file.fileName = fileObj.name;
        }
        return file;
      })
    );
  };

  const removeAttachmentFile = (removeIndex) => {
    setAttachmentFileUrl(
      removeIndex > -1
        ? attachmentFileUrl.filter((url, index) => index !== removeIndex)
        : []
    );
  };

  return (
    <>
      <Modal
        isOpen={openSendMailModal}
        toggle={() => {
          handleCloseSendMailModal();
        }}
        size={isCreated ? 'xl' : 'sm'}
        backdrop='static'
        className={`modal-dialog-centered send-email-modal ${
          isCreated && 'send-email-full-modal-with-templateEditor'
        }`}
        // className={`modal-dialog-centered email-editor-modal`}
      >
        <ModalHeader
          toggle={() => {
            handleCloseSendMailModal();
          }}
        >
          Send Email
        </ModalHeader>
        <ModalBody>
          <Form
            className='send__mail__form'
            onSubmit={handleSubmit(onSendEmailSubmit)}
            autoComplete='off'
          >
            <Row>
              <Col md={isCreated ? 4 : 12}>
                <FormField
                  name={`emailTemplate`}
                  placeholder='Email Template'
                  type='select'
                  label='Email Template'
                  errors={errors}
                  control={control}
                  options={
                    availableEmailTemplate?.map((template) => {
                      return {
                        label: template?.name,
                        value: template?._id,
                      };
                    }) || []
                  }
                  onChange={(e) => {
                    onChangeEmailTemplate(e);
                    setIsCreated(true);
                  }}
                />
                <div className='mt-1'>
                  <button
                    color='primary'
                    className='addCreate-new-btn'
                    onClick={() => {
                      setIsCreated(true);
                      setTempKey(Math.random());
                      reset(defaultValues);
                    }}
                  >
                    <span>Or Add Create New one</span>
                  </button>
                </div>
                {isCreated && (
                  <>
                    <div className='mt-1'>
                      <FormField
                        name='subject'
                        label='Subject'
                        placeholder='Subject'
                        type='text'
                        errors={errors}
                        control={control}
                      />
                    </div>
                    <div className='mt-1'>
                      <FormField
                        name='cc'
                        placeholder='Add CC'
                        label='CC Email Address'
                        type='creatableselect'
                        errors={errors}
                        control={control}
                        options={[]}
                        isMulti={true}
                        onChange={(value) => {
                          handleChangeEmail(value, 'cc');
                        }}
                      />
                    </div>
                    <div className='mt-1'>
                      <FormField
                        name='bcc'
                        placeholder='Add BCC'
                        label='BCC Email Address'
                        type='creatableselect'
                        errors={errors}
                        control={control}
                        options={[]}
                        isMulti={true}
                        onChange={(value) => {
                          handleChangeEmail(value, 'bcc');
                        }}
                      />
                    </div>

                    <div className='mt-1'>
                      <FormField
                        name='delay'
                        label='Delay'
                        placeholder='Select Timer'
                        type='select'
                        errors={errors}
                        control={control}
                        defaultValue={{ value: 0, label: 'Instantly' }}
                        options={[
                          ...FORM_SCHEDULE_TIMER,
                          { label: 'custom', value: 'custom' },
                        ]}
                      />
                    </div>
                    {delayStatus && delayStatus?.value === 'custom' && (
                      <div className='mt-1'>
                        <CustomDatePicker
                          value={getValues('delayTime') || minDate}
                          errors={errors}
                          name='delayTime'
                          label='Start Date'
                          options={{ minDate }}
                          onChange={(date) => {
                            clearErrors('delayTime');
                            setValue('delayTime', date[0]);
                          }}
                        />
                      </div>
                    )}

                    <div className='mt-2'>
                      <NewTaskManagerFileDropZone
                        multiple={true}
                        filesUpload={attachmentUpload}
                        removeFile={removeAttachmentFile}
                        fileURLArray={attachmentFileUrl}
                        accept={AVAILABLE_FILE_FORMAT}
                        // accept='.jpg,.jpeg,image/png,application/pdf,.doc,.docx,.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,.HEIC'
                        fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                        fieldName='attachments'
                        setError={setError}
                        loading={fileUploading}
                        changeUploadFileName={changeUploadFileName}
                        fileRowSize={2}
                      />
                    </div>
                  </>
                )}
              </Col>
              <Col md={8}>
                {isCreated && (
                  <Row md={12} className='editor__wp'>
                    <EmailEditors
                      ref={childRef}
                      // onDone={onTemplateDone}
                      tags={[]}
                      values={getValues()}
                      showSaveBtn={false}
                      key={tempKey}
                    />
                  </Row>
                )}
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <div className='right-footer'>
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
            <Button
              color='danger'
              onClick={() => {
                handleCloseSendMailModal();
              }}
            >
              Cancel
            </Button>
            <Form onSubmit={handleSubmit(onSendEmailSubmit)} autoComplete='off'>
              <SaveButton
                loading={sendEmailLoading}
                disabled={sendEmailLoading}
                width='150px'
                color='primary'
                name={'Send Mail'}
                type='submit'
                className='align-items-center justify-content-center'
              ></SaveButton>
            </Form>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};
