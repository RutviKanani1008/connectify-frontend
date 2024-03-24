import {
  Button,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';
import { FormField } from '../../../../@core/components/form-fields';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { userData } from '../../../../redux/user';
import { useState, useEffect } from 'react';
import { Bookmark, Clock, Flag, Plus, Users } from 'react-feather';
import NewTaskManagerFileDropZone from '../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { useGetFolders } from '../../groups/hooks/groupApis';
import moment from 'moment';
import { useGetCompanyUsers } from '../service/userApis';
import { uploadDocumentFileAPI } from '../../../../api/documents';
import { useGetTaskOptions } from '../service/taskOption.services';
import { useCreateBulkTaskWithContact } from '../service/task.services';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import useTaskScheduler from '../hooks/useTaskScheduler';
import { selectThemeColors } from '../../../../utility/Utils';
import {
  OptionComponent,
  SingleValue,
} from '../../../forms/component/OptionComponent';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
  EVENT_END_TYPE,
  TASK_SCHEDULER_TYPE,
} from '../../../../constant';
import EventDays from '../../event/components/EventDays';
import { selectScheduleType } from '../../event/helper/eventHelper';
import ChecklistDetailTaskManager from './ChecklistDetailTaskManager';
import { useGetChecklistTemplates } from '../../../templates/hooks/checklistApis';
import * as yup from 'yup';
import { required } from '../../../../configs/validationConstant';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';

export const taskScheme = yup.object().shape({
  name: yup.string().required(required('Task Name')),
  checklist: yup.array().of(
    yup.object().shape({
      title: yup.string().required('Title Required').nullable(),
    })
  ),
});
const AddBulkTaskModal = ({
  setOpen,
  open,
  handleCloseCreateBulkTask,
  selectedRowsFilters,
}) => {
  const user = useSelector(userData);
  const {
    control,
    register,
    watch,
    getValues,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(taskScheme),
    defaultValues: { assigned: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    shouldUnregister: true,
    name: 'checklistDetails.checklist',
  });

  const [startDateEndDateState, setStartDateEndDateState] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 10 * 60000),
  });
  const [taskOptions, setTaskOptions] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [attachmentFileUrl, setAttachmentFileUrl] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [checklistDetails, setChecklistDetails] = useState([]);
  const [currentChecklistFolders, setCurrentChecklistFolders] = useState([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    schedule: { value: 'never', label: 'One Time' },
    repeatEveryCount: 1,
    selectedDays: [Number(moment(new Date()).format('d'))],
    endType: { value: 'until', label: 'Until' },
    untilDate: moment(new Date()).endOf('day').toDate(),
    occurrences: 1,
  });

  const {
    handleScheduler,
    handleEndType,
    handleRepeatEvery,
    handleOccurrences,
    handleUntilDate,
    handleStartDate,
    handleEndDate,
  } = useTaskScheduler({
    setScheduleData,
    scheduleData,
    setStartDateEndDateState,
    startDateEndDateState,
  });

  const priorityWatch = watch('priority');
  const statusWatch = watch('status');

  // ** Custom Hooks
  const { getFolders } = useGetFolders();
  const { getTaskOptions } = useGetTaskOptions();
  const { getCompanyUsers, isLoading: userLoading } = useGetCompanyUsers();
  const { createBulkTaskWithContact, isLoading } =
    useCreateBulkTaskWithContact();
  const { getChecklistTemplates } = useGetChecklistTemplates();

  useEffect(() => {
    getContactAndUser();
    getChecklistFolders();
    getTaskOptionsFunc();
  }, []);

  // set initial value of priority and status
  useEffect(() => {
    const priority = taskOptions.filter((o) => o.type === 'priority')?.[0];
    const status = taskOptions.filter((o) => o.type === 'status')?.[0];
    setValue('priority', priority);
    setValue('status', status);
    priority && clearErrors('priority');
    status && clearErrors('status');
  }, [taskOptions]);

  const getTaskOptionsFunc = async () => {
    const { data, error } = await getTaskOptions({
      company: user?.company?._id,
    });
    if (!error && _.isArray(data)) {
      setTaskOptions(data.map((option) => ({ ...option, value: option._id })));
    }
  };

  const getChecklistFolders = async () => {
    const { data, error } = await getFolders({
      company: user.company._id,
      folderFor: 'checklist',
    });
    if (data && !error && _.isArray(data)) {
      setCurrentChecklistFolders([
        { folderName: 'Unassigned', _id: 'unassigned' },
        ...data,
      ]);
    }
  };

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

  const onSubmit = async (values) => {
    const noteText = currentNote;
    let isItMoveToComplete = false;
    const formValue = JSON.parse(JSON.stringify(values));

    formValue.details = noteText;
    formValue.startDate = startDateEndDateState.startDate;
    formValue.endDate = startDateEndDateState.endDate;

    if (_.isArray(formValue?.assigned)) {
      formValue.assigned = (formValue?.assigned || []).map(
        (assign) => assign?.value
      );
    }
    formValue.frequency = formValue?.schedule?.value || null;
    formValue.contact = formValue?.contact?.value;
    if (formValue.status?._id) {
      if (formValue.status?.markAsCompleted) {
        isItMoveToComplete = formValue.status?.markAsCompleted || false;
        formValue.completed = true;
      }
      formValue.status = formValue.status._id;
    }
    if (formValue?.priority?._id) {
      formValue.priority = formValue.priority._id;
    }

    if (formValue?.checklistDetails?.checklistTemplate) {
      formValue.checklistDetails.checklistTemplate =
        formValue.checklistDetails.checklistTemplate?.value;
    }
    formValue.schedule = scheduleData;
    if (formValue.schedule?.endType?.value) {
      formValue.schedule.endType = formValue.schedule?.endType?.value;
    }
    if (formValue.schedule?.schedule?.value) {
      formValue.schedule.schedule = formValue.schedule?.schedule?.value;
    }

    formValue.order = 0;

    let res = null;
    if (isItMoveToComplete) {
      const result = await showWarnAlert({
        text: 'Are you sure you want to create this task because task will be move to archived on while creating this status  ?',
        confirmButtonText: 'Yes',
      });
      if (result.value) {
        res = await createBulkTaskWithContact(
          {
            taskData: [formValue],
            contactFilters: selectedRowsFilters,
          },
          undefined,
          {
            populate: JSON.stringify([
              { path: 'assigned' },
              { path: 'contact' },
              { path: 'status' },
              { path: 'priority' },
            ]),
          }
        );
      } else {
        return;
      }
    } else {
      res = await createBulkTaskWithContact(
        {
          taskData: [formValue],
          contactFilters: selectedRowsFilters,
        },
        undefined,
        {
          populate: JSON.stringify([
            { path: 'assigned' },
            { path: 'contact' },
            { path: 'status' },
            { path: 'priority' },
          ]),
        }
      );
    }
    const { error } = res;

    if (!error) {
      handleCloseCreateBulkTask();
      removeAttachmentFile();
    }
  };

  const getChecklistDetails = async (folder) => {
    const { data, error } = await getChecklistTemplates({
      folder: folder?.value !== 'unassigned' ? folder?.value : null,
    });
    if (data && !error && _.isArray(data?.results)) {
      const tempChecklists = [...data.results];
      tempChecklists.push({
        name: 'Add New',
        _id: 'add_naw',
      });
      setChecklistDetails(tempChecklists);
    }
  };

  return (
    <Modal
      isOpen={open}
      toggle={() => setOpen(!open)}
      className='modal-dialog add-task-modal-new modal-dialog-centered update-tab-active only-add-task-modal'
      size='xl'
      backdrop='static'
    >
      <div className='modal-header-wrapper'>
        <ModalHeader
          toggle={() => {
            setOpen(!open);
          }}
        >
          <div className='inner-wrapper'>
            <div>Add Bulk Task</div>
          </div>
        </ModalHeader>
      </div>
      <ModalBody className='hide-scrollbar'>
        <div className='task-modal-tabs-contant'>
          <div className='tab-content'>
            <div className='tab-pane tasks-tab active'>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <div className='taskName-date-wrapper'>
                  <div className='taskName-field'>
                    <FormField
                      className='task__name fancy__scrollbar form-control'
                      name='name'
                      label='Task Name'
                      placeholder='Todo'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </div>
                  <div className='datepickerRange-field'>
                    <div className='start-date'>
                      <CustomDatePicker
                        enableTime={false}
                        errors={errors}
                        name='startDate'
                        label='Start Date'
                        dateFormat={'m-d-Y'}
                        value={startDateEndDateState.startDate?.getTime()}
                        onChange={handleStartDate}
                      />
                    </div>
                    <div className='end-date'>
                      <CustomDatePicker
                        enableTime={false}
                        options={{
                          minDate:
                            new Date(
                              startDateEndDateState.startDate
                            ).getTime() + 1000,
                        }}
                        errors={errors}
                        name='endDate'
                        label='End Date'
                        dateFormat={'m-d-Y'}
                        value={startDateEndDateState.endDate?.getTime()}
                        onChange={handleEndDate}
                      />
                    </div>
                  </div>
                </div>
                <div className='task__top__details__row'>
                  <div className='task__top__details__col'>
                    <div className='inner-wrapper'>
                      <div className='label'>
                        <div className='icon-wrapper'>
                          <Users />
                        </div>
                        <span className='label__text'>Assign To</span>
                      </div>
                      <div className='value'>
                        <span className='add-span'>+ Add Assignee</span>
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
                        <span className='add-span'>+ Add Priority</span>
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
                        <span className='add-span'>+ Add Status</span>
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
                        <span className='add-span'>+ Add Est Time</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='description-textarea'>
                  <Label>Description</Label>
                  <div className='inner-wrapper'>
                    <SyncfusionRichTextEditor
                      key={`bulk-task-description`}
                      onChange={(e) => {
                        setCurrentNote(e.value);
                      }}
                      value={currentNote}
                    />
                  </div>
                </div>
                <div className='checklist-scheduleTasks-wrapper'>
                  <div className='checklist-wrapper'>
                    <div className='header-title'>Checklist</div>
                    {showChecklist ? (
                      <>
                        <div className='field-row'>
                          <div className='field-col folder-col'>
                            <Select
                              styles={{
                                singleValue: (base) => ({
                                  ...base,
                                  display: 'flex',
                                  alignItems: 'center',
                                }),
                              }}
                              menuPosition='fixed'
                              id='folder'
                              name=''
                              placeholder='Select Folder'
                              defaultValue={getValues(
                                'checklistDetails.folder'
                              )}
                              options={currentChecklistFolders?.map(
                                (option) => {
                                  return {
                                    label: option?.folderName,
                                    value: option?._id,
                                  };
                                }
                              )}
                              theme={selectThemeColors}
                              classNamePrefix='select'
                              onChange={(data) => {
                                setValue('checklistDetails.folder', data);
                                setValue('checklist', []);
                                getChecklistDetails(data);
                              }}
                              components={{
                                Option: OptionComponent,
                                SingleValue,
                              }}
                            />
                          </div>
                          <div className='field-col checklist-col'>
                            <Select
                              value={getValues(
                                'checklistDetails.checklistTemplate'
                              )}
                              styles={{
                                singleValue: (base) => ({
                                  ...base,
                                  display: 'flex',
                                  alignItems: 'center',
                                }),
                              }}
                              menuPosition='fixed'
                              id='status'
                              placeholder='Select Checklist'
                              name=''
                              defaultValue={getValues(
                                'checklistDetails.checklistTemplate'
                              )}
                              options={checklistDetails?.map((option) => {
                                return {
                                  label: option?.name,
                                  value: option?._id,
                                };
                              })}
                              theme={selectThemeColors}
                              classNamePrefix='select'
                              onChange={(data) => {
                                setValue(
                                  'checklistDetails.checklistTemplate',
                                  data
                                );

                                if (data.value === 'add_naw') {
                                  setValue('checklistDetails.checklist', []);
                                  setValue('checklistDetails.checklist', [
                                    {
                                      checked: false,
                                      details: '',
                                      sort: 0,
                                      title: '',
                                    },
                                  ]);
                                } else {
                                  setValue('checklistDetails.checklist', []);
                                  setValue(
                                    'checklistDetails.checklist',
                                    checklistDetails?.find(
                                      (checklist) =>
                                        checklist._id === data?.value
                                    )?.checklist || []
                                  );
                                }
                              }}
                              components={{
                                Option: OptionComponent,
                                SingleValue,
                              }}
                            />
                          </div>
                          <div className='field-col field-col-btn'>
                            <Button
                              color='primary'
                              onClick={() => {
                                setValue(
                                  'checklistDetails.checklistTemplate',
                                  null
                                );
                                setValue('checklistDetails.checklist', []);
                                setValue('checklistDetails.checklist', [
                                  {
                                    checked: false,
                                    details: '',
                                    sort: 0,
                                    title: '',
                                  },
                                ]);
                              }}
                            >
                              <span>Or Add New Checklist</span>
                            </Button>
                          </div>
                        </div>
                        <div className='checklist-boxItem-wrapper'>
                          {fields && fields.length > 0 && (
                            <>
                              <ChecklistDetailTaskManager
                                fields={fields}
                                setValue={setValue}
                                handleSortFields={() => {}}
                                errors={errors}
                                control={control}
                                register={register}
                                getValues={getValues}
                                append={append}
                                remove={remove}
                              />
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className='add-checklist-btn-wrapper'>
                        <Button
                          className='add-checklist-btn'
                          onClick={() => setShowChecklist(true)}
                          color='primary'
                        >
                          <Plus size={15} />
                          <span className='add__task__text'>Add Checklist</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className='schedule-tasks-wrapper'>
                    <div className='header-title'>Schedule Tasks </div>
                    <div className='field-row'>
                      <div className='field-col'>
                        <FormField
                          label='Frequency'
                          name='schedule'
                          placeholder='Select Schedule'
                          type='select'
                          errors={errors}
                          control={control}
                          options={TASK_SCHEDULER_TYPE}
                          defaultValue={
                            scheduleData.schedule || {
                              value: 'never',
                              label: 'One Time',
                            }
                          }
                          onChange={handleScheduler}
                        />
                      </div>
                      {scheduleData.schedule.value !== 'never' && (
                        <>
                          <div className='field-col'>
                            <Label className='form-label'>Repeat Every</Label>
                            <div className='d-flex align-items-center'>
                              <div className='schedule-repeat-field-wrapper'>
                                <Input
                                  onBlur={(e) =>
                                    setScheduleData({
                                      ...scheduleData,
                                      repeatEveryCount: Number(e.target.value)
                                        ? Number(e.target.value)
                                        : 1,
                                    })
                                  }
                                  value={scheduleData.repeatEveryCount}
                                  min={1}
                                  name='repeatEvery'
                                  type='number'
                                  onChange={handleRepeatEvery}
                                />
                              </div>
                              <span className='schedule-repeat-label'>
                                {selectScheduleType(
                                  scheduleData.schedule.value
                                )}
                                (s)
                              </span>
                            </div>
                          </div>
                          {scheduleData.schedule.value === 'weekly' && (
                            <div className='field-col repeat-field-col'>
                              <Label className='form-label' for='startDate'>
                                Repeat On
                              </Label>
                              <EventDays
                                scheduleData={scheduleData}
                                setScheduleData={setScheduleData}
                              />
                            </div>
                          )}
                          <div className='field-col'>
                            <FormField
                              label='End'
                              name='endType'
                              type='select'
                              errors={errors}
                              control={control}
                              options={EVENT_END_TYPE}
                              defaultValue={
                                scheduleData.endType || {
                                  value: 'until',
                                  label: 'Until',
                                }
                              }
                              onChange={handleEndType}
                            />
                          </div>
                          <div className='field-col'>
                            {scheduleData.endType.value === 'until' ? (
                              <CustomDatePicker
                                dateFormat='Y-m-d'
                                enableTime={false}
                                options={{
                                  minDate: startDateEndDateState.endDate,
                                }}
                                errors={errors}
                                name='untilDate'
                                label='Until Date'
                                value={scheduleData.untilDate}
                                onChange={handleUntilDate}
                              />
                            ) : (
                              <>
                                <Label className='form-label'>
                                  Occurrences
                                </Label>
                                <Input
                                  onBlur={(e) =>
                                    setScheduleData({
                                      ...scheduleData,
                                      occurrences: Number(e.target.value)
                                        ? Number(e.target.value)
                                        : 1,
                                    })
                                  }
                                  value={scheduleData.occurrences}
                                  min={1}
                                  name='occurrences'
                                  type='number'
                                  onChange={handleOccurrences}
                                />
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Row className='gy-1 pt-75' style={{ display: 'none' }}>
                  <Col md={3} xs={12}>
                    <FormField
                      loading={userLoading}
                      name='assigned'
                      label='Assign To'
                      placeholder='Select assign to'
                      type='select'
                      errors={errors}
                      control={control}
                      options={availableUsers}
                      isMulti={true}
                    />
                  </Col>
                  <Col md={3} xs={12}>
                    <Label className='form-label' for='status'>
                      Priority:
                    </Label>
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
                      classNamePrefix='select'
                      isClearable
                      onChange={(data) => {
                        setValue('priority', data);
                      }}
                      components={{
                        Option: OptionComponent,
                        SingleValue,
                      }}
                    />
                    {errors?.['priority']?.message && (
                      <FormFeedback>
                        {errors?.['priority']?.message}
                      </FormFeedback>
                    )}
                  </Col>
                  <Col md={3} xs={12}>
                    <Label className='form-label' for='status'>
                      Status:
                    </Label>
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
                      classNamePrefix='select'
                      isClearable
                      onChange={(data) => setValue('status', data)}
                      components={{
                        Option: OptionComponent,
                        SingleValue,
                      }}
                    />
                    {errors?.['status']?.message && (
                      <FormFeedback>{errors?.['status']?.message}</FormFeedback>
                    )}
                  </Col>
                  <Col md={3} xs={12}>
                    <FormField
                      name='est_time_complete'
                      label='Est Time To Complete'
                      placeholder='Ex. 1 Hour'
                      type='text'
                      errors={errors}
                      control={control}
                    />
                  </Col>
                </Row>
                <div className='attachment-save-btn-wrapper'>
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
                  {errors?.attachments &&
                    errors?.attachments?.type === 'fileSize' && (
                      <span
                        className='text-danger block'
                        style={{ fontSize: '0.857rem' }}
                      >
                        {`File upload max upto ${5} mb`}
                      </span>
                    )}
                </div>
              </Form>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Form>
          <>
            <Button
              className='me-1'
              type='reset'
              color='secondary'
              outline
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </Button>
            <SaveButton
              loading={isLoading}
              disabled={isLoading}
              width='100px'
              color='primary'
              name={'Submit'}
              onClick={handleSubmit(onSubmit)}
            />
          </>
        </Form>
      </ModalFooter>
    </Modal>
  );
};

export default AddBulkTaskModal;
