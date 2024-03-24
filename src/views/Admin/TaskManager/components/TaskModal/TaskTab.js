import moment from 'moment';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Bookmark,
  Check,
  Clock,
  Flag,
  Grid,
  Plus,
  User,
  Users,
} from 'react-feather';
import {
  Button,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Spinner,
} from 'reactstrap';
import _ from 'lodash';
import CustomDatePicker from '../../../../../@core/components/form-fields/CustomDatePicker';
import AsyncContactSelect from '../../../billing/Quote/components/AsyncContactSelect';
import Select from 'react-select';
import {
  OptionComponent,
  contactOptionComponent,
  SingleValue,
  contactSingleValue,
  MultiValue,
  LabelOptionComponent,
  PriorityStatusCategorySingleValue,
  AssignedToSingleValue,
  CustomMenuList,
  parentTaskOptionComponent,
  parentTaskOptionSingleValue,
} from '../../../../forms/component/OptionComponent';
import ChecklistDetailTaskManager from '../ChecklistDetailTaskManager';
import NewTaskManagerFileDropZone from '../../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { FormField } from '@components/form-fields';
import { useFilteredMentionUsers } from '../../hooks/useHelper';
import { selectThemeColors } from '../../../../../utility/Utils';
import { userData } from '../../../../../redux/user';
import { useSelector } from 'react-redux';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
  EVENT_END_TYPE,
  TASK_SCHEDULER_TYPE,
} from '../../../../../constant';
import { selectScheduleType } from '../../../event/helper/eventHelper';
import EventDays from '../../../event/components/EventDays';
import { useGetFolders } from '../../../groups/hooks/groupApis';
import { useFieldArray } from 'react-hook-form';
import { uploadDocumentFileAPI } from '../../../../../api/documents';
import { useGetChecklistTemplates } from '../../../../templates/hooks/checklistApis';
import TaskOptionModal, { TASK_AVAILABLE_OPTION } from '../TaskOptionModal';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import { useDeleteTaskOption } from '../../service/taskOption.services';
import { MentionsInput, Mention } from 'react-mentions';
import { useGetAfterTaskInstructionTemplateList } from '../../hooks/userAfterTaskInstructionTemplateApi';
import AsyncParentTaskSelect from '../AsyncParentTaskSelect';
import classNames from 'classnames';
import SyncfusionRichTextEditor from '../../../../../components/SyncfusionRichTextEditor';
import { Icon } from '@iconify/react';

const TaskTab = forwardRef(
  (
    {
      isModalOpenFromSubtask, // This prop is check modal open from subtask,
      // form related - props
      form,
      onSubmit,
      // schedule task related - props
      taskSchedulerState,
      startDateEndDateState,
      scheduleData,
      setScheduleData,
      // editor related - props
      currentNote,
      setCurrentNote,
      // user related - props
      availableUsers,
      // form options related - props
      taskOptions,
      setTaskOptions,
      // checklist related - props
      showChecklist,
      setShowChecklist,
      // attachment related - props
      attachmentFileUrl,
      setAttachmentFileUrl,
      setStartDateEndDateState,
      // handleTaskOptions
      setCompletedTaskInstruction,
      completedTaskInstruction,
      isMultipleTasks = false,

      editTask = null,
      clearErrors = () => {},
      autoSavingTask = false,
      autoSaveTask,
      removeAttachments,
      setRemoveAttachments,
      userLoading,
      showTaskModal,
      mentionUsers,
    },
    ref
  ) => {
    const isInitialMount = useRef(true);
    const user = useSelector(userData);
    /** Form */
    const {
      control,
      register,
      watch,
      getValues,
      setValue,
      handleSubmit,
      formState,
      setError,
    } = form;
    const [showDropdown, setShowDropdown] = useState({
      showParentTask: false,
      showContact: false,
      showAssignedTo: false,
      showPriority: false,
      showStatus: false,
      showCategory: false,
      showEstTime: false,
    });
    const { errors } = formState;
    const priorityWatch = watch('priority');
    const statusWatch = watch('status');
    const categoryWatch = watch('category');
    const labelsWatch = watch('labels');
    const contactWatch = watch('contact');
    const parentTaskWatch = watch('parent_task');
    const assignedWatch = watch('assigned');
    const estTimeWatch = watch('est_time_complete');
    const [showTaskOptionModal, setShowTaskOptionModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState({
      optionType: null,
      updated: null,
      defaultText: null,
    });

    /** Schedule Tasks */
    const {
      handleScheduler,
      handleEndType,
      handleRepeatEvery,
      handleOccurrences,
      handleUntilDate,
    } = taskSchedulerState;

    /** Checklist */
    const [currentChecklistFolders, setCurrentChecklistFolders] = useState([]);
    const [checklistDetails, setChecklistDetails] = useState([]);

    const [isInitialAutosaved, setIsInitialAutosaved] = useState(false);
    const [isContentUnsaved, setIsContentUnsaved] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);

    // ** Custom Hooks **
    const { getChecklistTemplates } = useGetChecklistTemplates();
    const { getFolders } = useGetFolders();
    const { deleteTaskOption } = useDeleteTaskOption();
    const { filteredMentionUsers } = useFilteredMentionUsers({
      getValues,
      mentionUsers,
    });

    /** Mention Users */
    // HELLO
    // const { mentionUsers, loadMentionUsers } = useLoadMentionUsers({
    //   assignedUsers: getValues(`assigned`),
    // });

    /** Checklist Fields */
    const { fields, append, remove } = useFieldArray({
      control,
      shouldUnregister: true,
      name: 'checklistDetails.checklist',
    });

    // ** Custom Hooks *
    const { afterTaskInstructionTemplateList } =
      useGetAfterTaskInstructionTemplateList({ showTaskModal });

    const getChecklistFolders = async () => {
      const { data, error } = await getFolders({
        company: user.company._id,
        folderFor: 'checklist',
        select: 'folderId,folderName,folderFor',
      });
      if (data && !error && _.isArray(data)) {
        setCurrentChecklistFolders([...data]);
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

    useEffect(() => {
      if (showChecklist) {
        getChecklistFolders();
      }
    }, [showChecklist]);

    useEffect(() => {
      // loadMentionUsers();
      return () => {
        autoSaveNote.cancel();
      };
    }, []);

    /** AUTO SAVE */
    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      setIsContentUnsaved(true);
      if (editTask?._id) {
        autoSaveNote({
          description: currentNote,
        });
      }
    }, [currentNote]);

    const autoSaveNote = useCallback(
      _.debounce(async (args) => {
        setIsInitialAutosaved(true);
        await autoSaveTask({
          ...args,
        });
        setIsContentUnsaved(false);
      }, 500),
      [editTask?._id]
    );

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

    const removeAttachmentFile = (removeIndex) => {
      setRemoveAttachments([
        ...removeAttachments,
        ...(removeIndex > -1
          ? [attachmentFileUrl[removeIndex]?.fileUrl]
          : [...attachmentFileUrl.map((attachment) => attachment?.fileUrl)]),
      ]);

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

    useImperativeHandle(ref, () => ({
      removeAttachmentFile,
      autoSaveDetails: handleAutoSaveOnClose,
    }));

    const handleAutoSaveOnClose = async () => {
      if (autoSavingTask) {
        return;
      }
      if (isContentUnsaved) {
        setIsInitialAutosaved(true);
        await autoSaveTask({
          description: currentNote,
        });
        setIsContentUnsaved(false);
      }
    };

    const handleChangeLabel = async (selectedLabels) => {
      const isNewLabel = selectedLabels.find((label) => label.__isNew__);
      if (isNewLabel?.__isNew__) {
        setSelectedOption({
          defaultText: isNewLabel.label,
          optionType: TASK_AVAILABLE_OPTION.label,
          updated: null,
        });
        setShowTaskOptionModal(true);
      }
    };

    const handleClearOptions = (value = null) => {
      let tempLabels = JSON.parse(JSON.stringify(getValues('labels')));
      if (value) {
        if (tempLabels?.length) {
          tempLabels = tempLabels.map((label) => {
            if (label?.__isNew__ && !selectedOption.updated) {
              label = value;
            }
            if (label?._id === value?._id) {
              label = value;
            }
            return label;
          });
        }
        setValue('labels', tempLabels);
      } else {
        tempLabels = tempLabels.filter((label) => !label?.__isNew__);
        setValue('labels', tempLabels);
      }
      setShowTaskOptionModal(false);
      setSelectedOption({
        defaultText: null,
        optionType: null,
        updated: null,
      });
    };

    const handleDeleteLabel = async (data) => {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: 'Are you sure you would like to delete this Label?',
        footer: (
          <>
            <div style={{ color: 'red' }}>
              This label will be delete automatically from all the tasks.
            </div>
          </>
        ),
      });

      if (result.value) {
        const obj = {};
        obj.type = TASK_AVAILABLE_OPTION.label;
        const { error } = await deleteTaskOption(
          data._id,
          obj,
          'Delete Label..'
        );

        if (!error) {
          let tempLabels = JSON.parse(JSON.stringify(getValues('labels')));
          tempLabels = tempLabels.filter((label) => label._id !== data?._id);
          setValue('labels', tempLabels);
        }
      }
    };

    return (
      <>
        <Form onSubmit={handleSubmit(onSubmit)}>
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
            {false && (
              <Col className='category__select__box mb-1' md={3} xs={12}>
                <Label className='form-label' for='status'>
                  Label:
                </Label>
                <FormField
                  key={labelsWatch?.value}
                  name='labels'
                  placeholder='Add Label'
                  type='creatableselect'
                  errors={errors}
                  control={control}
                  theme={selectThemeColors}
                  isMulti={'true'}
                  options={taskOptions?.filter(
                    (option) => option.type === 'label'
                  )}
                  className={`react-select ${
                    errors?.['labels']?.message ? 'is-invalid' : ''
                  }`}
                  styles={{
                    singleValue: (base) => ({
                      ...base,
                      display: 'flex',
                      alignItems: 'center',
                    }),
                  }}
                  onChange={handleChangeLabel}
                  handleTaskOptionEdit={(data) => {
                    setSelectedOption({
                      defaultText: null,
                      optionType: TASK_AVAILABLE_OPTION.label,
                      updated: data,
                    });
                    setShowTaskOptionModal(true);
                  }}
                  handleDeleteTaskOption={(data) => {
                    handleDeleteLabel(data);
                  }}
                  components={{
                    Option: LabelOptionComponent,
                    // SingleValue: MultiValue,
                    MultiValue,
                  }}
                />
                {errors?.['lables']?.message && (
                  <FormFeedback>{errors?.['lables']?.message}</FormFeedback>
                )}
              </Col>
            )}
            <div className='datepickerRange-field'>
              <div className='start-date'>
                <CustomDatePicker
                  renderInBody
                  errors={errors}
                  enableTime={false}
                  name='start'
                  label='Start Date'
                  value={
                    startDateEndDateState.startDate &&
                    new Date(startDateEndDateState.startDate)
                  }
                  dateFormat={'m-d-Y'}
                  onChange={(selectedDate) => {
                    const { startDate, endDate } = startDateEndDateState || {};
                    const newStartDate = selectedDate?.[0];

                    const diff = moment(newStartDate).diff(moment(startDate));
                    const newEndDate = moment(endDate).add(diff).toDate();

                    setStartDateEndDateState({
                      ...startDateEndDateState,
                      startDate: newStartDate,
                      endDate: newEndDate,
                    });
                  }}
                />
              </div>
              <div className='end-date'>
                <CustomDatePicker
                  renderInBody
                  errors={errors}
                  enableTime={false}
                  name='end'
                  label='End Date'
                  value={
                    startDateEndDateState.endDate &&
                    new Date(startDateEndDateState.endDate)
                  }
                  dateFormat={'m-d-Y'}
                  onChange={(selectedDate) => {
                    setStartDateEndDateState({
                      ...startDateEndDateState,
                      endDate: selectedDate?.[0],
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className='task__top__details__row'>
            <div className='task__top__details__col'>
              <div className='inner-wrapper'>
                <div className='label'>
                  <div className='icon-wrapper'>
                    <User />
                  </div>
                  <span className='label__text'>Parent Task</span>
                </div>
                <div className='value'>
                  {parentTaskWatch || showDropdown.showParentTask ? (
                    <div className='contact-wrapper'>
                      <AsyncParentTaskSelect
                        classNamePrefix='custom-select'
                        name='customer'
                        placeholder='Select Parent Task'
                        value={getValues('parent_task')}
                        onChange={(e) => {
                          setValue('parent_task', e);
                          clearErrors('parent_task');
                        }}
                        selectCurrentTask={editTask}
                        styles={{
                          parentTaskOptionSingleValue: (base) => ({
                            ...base,
                            display: 'flex',
                            alignItems: 'center',
                          }),
                        }}
                        isClearable
                        className={classNames(
                          'react-select select-parent-task',
                          {
                            'is-invalid':
                              !!errors?.['parent_task']?.value?.message,
                          }
                        )}
                        components={{
                          Option: parentTaskOptionComponent,
                          SingleValue: parentTaskOptionSingleValue,
                        }}
                      />
                    </div>
                  ) : (
                    <span
                      className='add-span'
                      onClick={() => {
                        setShowDropdown({
                          ...showDropdown,
                          showParentTask: true,
                        });
                      }}
                    >
                      + Add Parent Task
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='task__top__details__row'>
            {!isMultipleTasks && (
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
            )}
            <div className='task__top__details__col'>
              <div className='inner-wrapper'>
                <div className='label'>
                  <div className='icon-wrapper'>
                    <Users />
                  </div>
                  <span className='label__text'>Assign To</span>
                </div>
                <div className='value'>
                  {assignedWatch?.length > 0 || showDropdown?.showAssignedTo ? (
                    <div className='assignTo-wrapper'>
                      <Select
                        isLoading={userLoading}
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
                          MenuList: CustomMenuList,
                          Option: contactOptionComponent,
                          MultiValue: AssignedToSingleValue,
                        }}
                        filterOption={(option, inputValue) => {
                          if (!inputValue) {
                            return option; // Display all options when no search term
                          }
                          return option?.label
                            ?.toLowerCase()
                            ?.includes(inputValue?.toLowerCase());
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
                  {priorityWatch || showDropdown?.showPriority ? (
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
                        filterOption={(option, inputValue) => {
                          if (!inputValue) {
                            return option; // Display all options when no search term
                          }
                          return option?.label
                            ?.toLowerCase()
                            ?.includes(inputValue?.toLowerCase());
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
                        filterOption={(option, inputValue) => {
                          if (!inputValue) {
                            return option; // Display all options when no search term
                          }
                          return option?.label
                            ?.toLowerCase()
                            ?.includes(inputValue?.toLowerCase());
                        }}
                      />
                      {errors?.['status']?.message && (
                        <FormFeedback>
                          {errors?.['status']?.message}
                        </FormFeedback>
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
                        filterOption={(option, inputValue) => {
                          if (!inputValue) {
                            return option; // Display all options when no search term
                          }
                          return option?.label
                            ?.toLowerCase()
                            ?.includes(inputValue?.toLowerCase());
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
                  {/* <span className='value-text'>2d 13h 30m 20s</span> */}
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
                  <MentionsInput
                    value={completedTaskInstruction || ''}
                    onChange={(i, value, newMentions) => {
                      setValue('completedTaskInstruction', newMentions);
                      setCompletedTaskInstruction(newMentions);
                    }}
                    markup='@{{__type__||__id__||__display__}}'
                    placeholder='Use the > symbol to use template'
                    className='mentions'
                    suggestionsportalopen='true'
                  >
                    <Mention
                      type='user'
                      trigger='>'
                      data={afterTaskInstructionTemplateList.map(
                        (template) => ({
                          id: template._id,
                          display: template.templateBody,
                        })
                      )}
                      className='mentions__mention'
                    />
                  </MentionsInput>
                </div>
              </div>
            </div>
          </div>
          <div className='description-textarea'>
            <div className='d-flex justify-content-between'>
              <Label>Description</Label>
              {isInitialAutosaved && (
                <div
                  style={{
                    fontWeight: 400,
                    fontSize: '15px',
                    marginLeft: '5px',
                  }}
                >
                  {autoSavingTask ? (
                    <div className='d-flex'>
                      <Spinner
                        size='sm'
                        color='#a3db59'
                        style={{ margin: '4px 2px' }}
                      />
                      <span>Saving</span>
                    </div>
                  ) : (
                    <div className='d-flex'>
                      <Icon
                        className='success'
                        color='#a3db59'
                        icon='ep:success-filled'
                        width='20'
                      />
                      <span>Saved</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className='inner-wrapper'>
              <SyncfusionRichTextEditor
                key={`task-description`}
                onChange={(e) => {
                  setCurrentNote(e.value);
                }}
                value={currentNote}
                mentionOption={filteredMentionUsers}
                mentionEnable
                name={isModalOpenFromSubtask ? 'rte1' : 'rte2'}
                list={
                  isModalOpenFromSubtask
                    ? '#rte1_rte-edit-view'
                    : '#rte2_rte-edit-view'
                }
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
                        defaultValue={getValues('checklistDetails.folder')}
                        options={currentChecklistFolders?.map((option) => {
                          return {
                            label: option?.folderName,
                            value: option?._id,
                          };
                        })}
                        theme={selectThemeColors}
                        classNamePrefix='custom-select'
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
                        value={getValues('checklistDetails.checklistTemplate')}
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
                        classNamePrefix='custom-select'
                        onChange={(data) => {
                          setValue('checklistDetails.checklistTemplate', data);

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
                                (checklist) => checklist._id === data?.value
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
                          setValue('checklistDetails.checklistTemplate', null);
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
                        assignedUsers={watch(`assigned`)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className='add-checklist-btn-wrapper'>
                  <Button
                    className='add-checklist-btn'
                    color='primary'
                    onClick={() => setShowChecklist(true)}
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
                    // defaultValue={{
                    //   value: 'never',
                    //   label: 'One Time',
                    // }}
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
                          {selectScheduleType(scheduleData.schedule.value)}
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
                          <Label className='form-label'>Occurrences</Label>
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
                {`File upload max upto ${25} mb`}
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
        </Form>
        {showTaskOptionModal && (
          <TaskOptionModal
            setShowTaskOptionModal={setShowTaskOptionModal}
            openTaskSidebar={showTaskOptionModal}
            selectedOption={selectedOption}
            handleClearOptions={handleClearOptions}
            setTaskOptions={setTaskOptions}
            taskOptions={taskOptions}
            isFromTaskModal={true}
          />
        )}
      </>
    );
  }
);

TaskTab.displayName = 'TaskTab';
export default TaskTab;
