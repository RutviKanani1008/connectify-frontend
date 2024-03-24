import React, { useEffect, useState } from 'react';
import { Form, FormFeedback, Label } from 'reactstrap';
import _ from 'lodash';
import { FormField } from '@components/form-fields';
import Select from 'react-select';
import { selectThemeColors } from '../../../../../utility/Utils';
import CustomDateAndTimePicker from '../../../../../@core/components/form-fields/CustomDateAndTimePicker';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Clock,
  Flag,
  Grid,
  User,
  Users,
} from 'react-feather';
import AsyncContactSelect from '../../../billing/Quote/components/AsyncContactSelect';
import {
  AssignedToSingleValue,
  OptionComponent,
  PriorityStatusCategorySingleValue,
  contactOptionComponent,
  contactSingleValue,
} from '../../../../forms/component/OptionComponent';
import NewTaskManagerFileDropZone from '../../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../../../../constant';
import { uploadDocumentFileAPI } from '../../../../../api/documents';
import { useSelector } from 'react-redux';
import { userData } from '../../../../../redux/user';
import { useGetCompanyUsers } from '../../../TaskManager/service/userApis';
import { useGetTaskOptions } from '../../../TaskManager/service/taskOption.services';
import { useLazyGetContactFromMailQuery } from '../../../../../redux/api/mailApi';
import draftToHtml from 'draftjs-to-html';
import SyncfusionRichTextEditor from '../../../../../components/SyncfusionRichTextEditor';

const TaskPreview = ({
  taskReplyForwardDetail,
  taskForm,
  startDateEndDateState,
  setStartDateEndDateState,
  setTaskPreviewVisible,
}) => {
  // ** Store **
  const user = useSelector(userData);

  // ** Form Var
  const { control, watch, getValues, setValue, formState, setError } = taskForm;
  const { errors } = formState;

  // ** State **
  const [availableUsers, setAvailableUsers] = useState([]);
  const [attachmentFileUrl, setAttachmentFileUrl] = useState([]);
  const [taskOptions, setTaskOptions] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);

  const [showDropdown, setShowDropdown] = useState({
    showContact: false,
    showAssignedTo: false,
    showPriority: false,
    showStatus: false,
    showCategory: false,
    showEstTime: false,
  });

  // ** APIS **
  const { getCompanyUsers } = useGetCompanyUsers();
  const { getTaskOptions } = useGetTaskOptions();
  const [getContactFromMail] = useLazyGetContactFromMailQuery();

  // ** Var **
  const priorityWatch = watch('priority');
  const statusWatch = watch('status');
  const categoryWatch = watch('category');
  const contactWatch = watch('contact');
  const assignedWatch = watch('assigned');
  const estTimeWatch = watch('est_time_complete');
  const mailBody = watch('details');
  /** Initial Rendering */
  useEffect(() => {
    getContactAndUser();
    getTaskOptionsFunc();
  }, []);

  useEffect(() => {
    const priority = taskOptions.filter((o) => o.type === 'priority')?.[0];
    const status = taskOptions.filter((o) => o.type === 'status')?.[0];
    setValue('priority', priority);
    setValue('status', status);
  }, [taskOptions]);

  // Here populate the basic fields from email data to task
  useEffect(() => {
    setContactUsingEmails();
    // Here populate the email fields
    taskReplyForwardDetail.subject &&
      setValue('name', taskReplyForwardDetail.subject);
    // taskReplyForwardDetail.body &&
    //   setValue('details', taskReplyForwardDetail.body);
    taskReplyForwardDetail.body &&
      setValue('details', draftToHtml(taskReplyForwardDetail.body));
    taskReplyForwardDetail.attachments &&
      setAttachmentFileUrl(taskReplyForwardDetail.attachments);
  }, [taskReplyForwardDetail]);

  const setContactUsingEmails = async () => {
    const { data } = await getContactFromMail({
      data: {
        emails: taskReplyForwardDetail.emails,
      },
    });

    if (data?.data) {
      setValue('contact', {
        label:
          `${data.data.firstName} ${data.data.lastName}`.trim() ||
          // eslint-disable-next-line no-useless-concat
          `${data.data.email}` +
            ` ${data.data?._id === user?._id ? '(Me)' : ''}`,
        value: data.data?._id,
        profile: data.data?.userProfile || null,
      });
    }
  };

  /** Get Available User */
  const getContactAndUser = async () => {
    const companyId = user?.company._id;

    const { data: userData, error: userError } = await getCompanyUsers(
      companyId,
      { select: 'firstName,lastName,role,userProfile' }
    );

    if (_.isArray(userData) && !userError) {
      setAvailableUsers(getOptions(userData));
    }
  };

  /** Helper */
  const getOptions = (data) => {
    const tempObj = JSON.parse(JSON.stringify(data));

    const options = [];
    tempObj.map((contact) => {
      options.push({
        label: `${contact?.firstName ?? ''} ${contact?.lastName ?? ''} ${
          contact?._id === user?._id ? '(Me)' : ''
        }`,
        value: contact._id,
        ...(contact?.firstName && { firstName: contact?.firstName }),
        ...(contact?.lastName && { lastName: contact?.lastName }),
        ...(contact?.userProfile && contact?.userProfile !== 'false'
          ? { profile: contact?.userProfile }
          : null),
        ...(contact?.company_name && { companyName: contact?.company_name }),
      });
    });
    return options;
  };

  const attachmentUpload = (files) => {
    const formData = new FormData();
    formData.append('filePath', `${user?.company?._id}/task-attachments`);
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
    setValue(
      'attachments',
      attachmentFileUrl.map((file, index) => {
        if (index === fileObj.index) {
          file.fileName = fileObj.name;
        }
        return file;
      })
    );
    setAttachmentFileUrl(
      attachmentFileUrl.map((file, index) => {
        if (index === fileObj.index) {
          file.fileName = fileObj.name;
        }
        return file;
      })
    );
  };

  const getTaskOptionsFunc = async () => {
    const { data, error } = await getTaskOptions({
      company: user?.company?._id,
    });
    if (!error && _.isArray(data)) {
      const taskOption = [
        {
          _id: 'unassigned',
          label: 'Unassigned',
          value: null,
          type: 'category',
          color: '#edf7e0',
          showFirst: true,
        },
        ...data,
      ];
      setTaskOptions(
        taskOption.map((option) => ({ ...option, value: option._id }))
      );
    }
  };

  const removeAttachmentFile = (removeIndex) => {
    setValue(
      'attachments',
      removeIndex > -1
        ? attachmentFileUrl.filter((url, index) => index !== removeIndex)
        : []
    );
    setAttachmentFileUrl(
      removeIndex > -1
        ? attachmentFileUrl.filter((url, index) => index !== removeIndex)
        : []
    );
  };

  return (
    <Form className='mail-task-preview'>
      <div className='mobile-top-header'>
        <button
          className='back-btn'
          type='button'
          onClick={() => setTaskPreviewVisible(false)}
        >
          <ArrowLeft />
        </button>
        <h3 className='title'>Create Task</h3>
      </div>
      <div className='inner-wrapper'>
        <div className='taskName-date-wrapper'>
          <div className='taskName-field'>
            <FormField
              name='name'
              label='Task Name'
              placeholder='Todo'
              type='text'
              errors={errors}
              control={control}
            />
          </div>
          <div className='datepickerRange-field'>
            <CustomDateAndTimePicker
              selectsRange={true}
              enableTime={false}
              errors={errors}
              name='startDate'
              label='Task Date'
              dateFormat={'MM-dd-Y'}
              startDate={
                startDateEndDateState.startDate &&
                new Date(startDateEndDateState.startDate)
              }
              endDate={
                startDateEndDateState.endDate &&
                new Date(startDateEndDateState.endDate)
              }
              onChange={(selectedDate) => {
                setStartDateEndDateState({
                  startDate: selectedDate?.[0],
                  endDate: selectedDate?.[1],
                });
              }}
            />
          </div>
        </div>
        <div className='task__top__details__row'>
          <div className='task__top__details__col'>
            <div className='inner-wrapper'>
              <div className='label'>
                <div className='icon-wrapper'>
                  <User />
                </div>
                <span className='label__text'>Contact</span>
              </div>
              <div className='value'>
                {contactWatch || showDropdown.showContact ? (
                  <div className='contact-wrapper'>
                    <AsyncContactSelect
                      key={contactWatch?.value}
                      styles={{
                        singleValue: (base) => ({
                          ...base,
                          display: 'flex',
                          alignItems: 'center',
                        }),
                      }}
                      id='contact'
                      name='contact'
                      placeholder='Select contact'
                      defaultValue={getValues('contact')}
                      theme={selectThemeColors}
                      className={`react-select ${
                        errors?.['contact']?.message ? 'is-invalid' : ''
                      }`}
                      classNamePrefix='custom-select'
                      onChange={(data) => setValue('contact', data)}
                      value={getValues('contact')}
                      components={{
                        Option: contactOptionComponent,
                        SingleValue: contactSingleValue,
                      }}
                    />
                  </div>
                ) : (
                  <span
                    className='add-span'
                    onClick={() => {
                      setShowDropdown({
                        ...showDropdown,
                        showContact: true,
                      });
                    }}
                  >
                    + Add Contact
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className='task__top__details__col'>
            <div className='inner-wrapper'>
              <div className='label'>
                <div className='icon-wrapper'>
                  <Users />
                </div>
                <span className='label__text'>Assign To</span>
              </div>
              <div className='value'>
                {assignedWatch.length > 0 || showDropdown.showAssignedTo ? (
                  <div className='assignTo-wrapper'>
                    <Select
                      isMulti={true}
                      key={assignedWatch?.value}
                      styles={{
                        singleValue: (base) => ({
                          ...base,
                          display: 'flex',
                          alignItems: 'center',
                        }),
                      }}
                      id='assigned'
                      name='assigned'
                      defaultValue={watch(`assigned`)}
                      options={availableUsers}
                      theme={selectThemeColors}
                      className={`react-select ${
                        errors?.['assigned']?.message ? 'is-invalid' : ''
                      }`}
                      classNamePrefix='custom-select'
                      onChange={(data) => {
                        setValue('assigned', data);
                        if (data) {
                          setShowDropdown({
                            ...showDropdown,
                            showAssignedTo: true,
                          });
                        } else {
                          setShowDropdown({
                            ...showDropdown,
                            showAssignedTo: false,
                          });
                        }
                      }}
                      components={{
                        Option: contactOptionComponent,
                        MultiValue: AssignedToSingleValue,
                      }}
                    />
                    {errors?.['assigned']?.message && (
                      <FormFeedback>
                        {errors?.['assigned']?.message}
                      </FormFeedback>
                    )}
                  </div>
                ) : (
                  <span
                    className='add-span'
                    onClick={() => {
                      setShowDropdown({
                        ...showDropdown,
                        showAssignedTo: true,
                      });
                    }}
                  >
                    + Add Assignee
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className='task__top__details__col priority'>
            <div className='inner-wrapper'>
              <div className='label'>
                <div className='icon-wrapper'>
                  <Flag />
                </div>
                <span className='label__text'>Priority</span>
              </div>
              <div className='value'>
                {priorityWatch || showDropdown.showPriority ? (
                  <>
                    <Select
                      key={priorityWatch?.value}
                      styles={{
                        singleValue: (base) => ({
                          ...base,
                          display: 'flex',
                          alignItems: 'center',
                        }),
                      }}
                      id='priority'
                      name='priority'
                      defaultValue={getValues('priority')}
                      options={taskOptions?.filter(
                        (option) => option.type === 'priority'
                      )}
                      theme={selectThemeColors}
                      className={`react-select ${
                        errors?.['priority']?.message ? 'is-invalid' : ''
                      }`}
                      classNamePrefix='custom-select'
                      onChange={(data) => {
                        setValue('priority', data);
                        if (data) {
                          setShowDropdown({
                            ...showDropdown,
                            showPriority: true,
                          });
                        } else {
                          setShowDropdown({
                            ...showDropdown,
                            showPriority: false,
                          });
                        }
                      }}
                      components={{
                        Option: OptionComponent,
                        SingleValue: PriorityStatusCategorySingleValue,
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                      }}
                    />
                    {errors?.['priority']?.message && (
                      <FormFeedback>
                        {errors?.['priority']?.message}
                      </FormFeedback>
                    )}
                  </>
                ) : (
                  <span
                    className='add-span'
                    onClick={() => {
                      setShowDropdown({
                        ...showDropdown,
                        showPriority: true,
                      });
                    }}
                  >
                    + Add Priority
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className='task__top__details__col status'>
            <div className='inner-wrapper'>
              <div className='label'>
                <div className='icon-wrapper'>
                  <Bookmark />
                </div>
                <span className='label__text'>Status</span>
              </div>
              <div className='value'>
                {statusWatch || showDropdown.showStatus ? (
                  <>
                    <Select
                      key={statusWatch?.value}
                      styles={{
                        singleValue: (base) => ({
                          ...base,
                          display: 'flex',
                          alignItems: 'center',
                        }),
                      }}
                      id='status'
                      name='status'
                      defaultValue={getValues('status')}
                      options={taskOptions?.filter(
                        (option) => option.type === 'status'
                      )}
                      theme={selectThemeColors}
                      className={`react-select ${
                        errors?.['status']?.message ? 'is-invalid' : ''
                      }`}
                      classNamePrefix='custom-select'
                      onChange={(data) => {
                        setValue('status', data);
                        if (data) {
                          setShowDropdown({
                            ...showDropdown,
                            showStatus: true,
                          });
                        } else {
                          setShowDropdown({
                            ...showDropdown,
                            showStatus: false,
                          });
                        }
                      }}
                      components={{
                        Option: OptionComponent,
                        SingleValue: PriorityStatusCategorySingleValue,
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                      }}
                    />
                    {errors?.['status']?.message && (
                      <FormFeedback>{errors?.['status']?.message}</FormFeedback>
                    )}
                  </>
                ) : (
                  <span
                    className='add-span'
                    onClick={() => {
                      setShowDropdown({
                        ...showDropdown,
                        showStatus: true,
                      });
                    }}
                  >
                    + Add Status
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className='task__top__details__col category'>
            <div className='inner-wrapper'>
              <div className='label'>
                <div className='icon-wrapper'>
                  <Grid />
                </div>
                <span className='label__text'>Category</span>
              </div>
              <div className='value'>
                {categoryWatch || showDropdown.showCategory ? (
                  <>
                    <Select
                      key={statusWatch?.value}
                      styles={{
                        singleValue: (base) => ({
                          ...base,
                          display: 'flex',
                          alignItems: 'center',
                        }),
                      }}
                      id='category'
                      name='category'
                      defaultValue={getValues('category')}
                      options={taskOptions?.filter(
                        (option) => option.type === 'category'
                      )}
                      theme={selectThemeColors}
                      className={`react-select ${
                        errors?.['category']?.message ? 'is-invalid' : ''
                      }`}
                      classNamePrefix='custom-select'
                      onChange={(data) => {
                        setValue('category', data);
                        if (data) {
                          setShowDropdown({
                            ...showDropdown,
                            showCategory: true,
                          });
                        } else {
                          setShowDropdown({
                            ...showDropdown,
                            showCategory: false,
                          });
                        }
                      }}
                      components={{
                        Option: OptionComponent,
                        SingleValue: PriorityStatusCategorySingleValue,
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                      }}
                    />
                    {errors?.['category']?.message && (
                      <FormFeedback>
                        {errors?.['category']?.message}
                      </FormFeedback>
                    )}
                  </>
                ) : (
                  <span
                    className='add-span'
                    onClick={() => {
                      setShowDropdown({
                        ...showDropdown,
                        showCategory: true,
                      });
                    }}
                  >
                    + Add Category
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className='task__top__details__col'>
            <div className='inner-wrapper'>
              <div className='label'>
                <div className='icon-wrapper'>
                  <Clock />
                </div>
                <span className='label__text'>Est Time</span>
              </div>
              <div className='value'>
                {estTimeWatch || showDropdown.showEstTime ? (
                  <FormField
                    name='est_time_complete'
                    placeholder='Ex. 1 Hour'
                    type='text'
                    errors={errors}
                    control={control}
                  />
                ) : (
                  <span
                    className='add-span'
                    onClick={() => {
                      setShowDropdown({
                        ...showDropdown,
                        showEstTime: true,
                      });
                    }}
                  >
                    + Add Est Time
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='task__top__details__col after-task'>
          <div className='inner-wrapper'>
            <div className='label'>
              <div className='icon-wrapper'>
                <Check />
              </div>
              <span className='label__text'>After Task</span>
            </div>
            <div className='value'>
              <FormField
                name='completedTaskInstruction'
                placeholder='After task is complete do this...'
                type='textarea'
                errors={errors}
                control={control}
              />
            </div>
          </div>
        </div>
        <div className='description-textarea'>
          <Label>Description</Label>
          <div className='inner-wrapper'>
            <SyncfusionRichTextEditor
              key={`mail-task-preview`}
              onChange={(e) => {
                setValue('details', e.value);
              }}
              value={mailBody}
            />
          </div>
        </div>
        <div className='attachment-save-btn-wrapper'>
          <NewTaskManagerFileDropZone
            multiple={true}
            filesUpload={attachmentUpload}
            removeFile={removeAttachmentFile}
            fileURLArray={attachmentFileUrl}
            accept={AVAILABLE_FILE_FORMAT}
            fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
            fieldName='attachments'
            setError={setError}
            loading={fileUploading}
            changeUploadFileName={changeUploadFileName}
            fileRowSize={2}
          />
          {errors?.attachments && errors?.attachments?.type === 'fileSize' ? (
            <span
              className='text-danger block'
              style={{ fontSize: '0.857rem' }}
            >
              {`File upload max upto ${AVAILABLE_FILE_UPLOAD_SIZE} mb`}
            </span>
          ) : (
            errors?.attachments?.type === 'fileType' &&
            errors?.attachments?.message && (
              <span
                className='text-danger block'
                style={{ fontSize: '0.857rem' }}
              >
                {errors?.attachments?.message || `File not allowed to upload`}
              </span>
            )
          )}
        </div>
      </div>
    </Form>
  );
};

export default TaskPreview;
