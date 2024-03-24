import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import _ from 'lodash';

import { Col, Spinner, Label, Input } from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';
import { userData } from '../../../../redux/user';
import {
  useCreateTaskUpdate,
  useDeleteTaskUpdate,
  useEditTaskUpdate,
  useGetTaskUpdates,
} from '../service/taskUpdate.service';
import moment from 'moment';
import { Bookmark, Download, Edit2, Eye, Trash, Users } from 'react-feather';
import { useGetCompanyUsers } from '../service/userApis';
import {
  useCreateTaskNotifyUsers,
  useDeleteReadTasks,
} from '../service/taskNotifyUsers.services';
import NewTaskManagerFileDropZone, {
  renderFile,
} from '../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { uploadDocumentFileAPI } from '../../../../api/documents';
import { downloadFile, isContentEmpty } from '../../../../helper/common.helper';
import FilePreviewModal from '../../../../@core/components/form-fields/FilePreviewModal';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
  NotificationType,
} from '../../../../constant';
import { useLoadMentionUsers } from '../hooks/useHelper';
import {
  AssignedToSingleValue,
  OptionComponent,
  PriorityStatusCategorySingleValue,
  contactOptionComponent,
} from '../../../forms/component/OptionComponent';
import { selectThemeColors } from '../../../../utility/Utils';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import Avatar from '../../../../@core/components/avatar';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';
import {
  useGetUserTaskManagerSetting,
  useUpdateUserTaskManagerSetting,
} from '../service/task.services';
import { getMentionsValues } from '../../../../components/SyncfusionRichTextEditor/helper';

const ModalUpdates = ({
  editTask,
  assignedUsers,
  hasNewUpdates,
  setHasNewUpdates,
  setCurrentTasks,
  isSubTask,
  setSubTasks,
  taskOptions,
  getValues,
  setValue,
  taskData,
  currentTasks,
  errors,
  availableUsers,
  handleClearAddUpdateTask,
  setRemoveAttachments,
  removeAttachments,
}) => {
  const currentUser = useSelector(userData);

  const taskId = editTask?._id;
  const userId = currentUser?._id;

  const [content, setContent] = useState('');
  const [allUpdates, setAllUpdates] = useState([]);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [status, setStatus] = useState(taskData.status);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // ** Ref **
  const editorRef = useRef(null);
  const alertCheckboxRef = useRef(null);

  // API Service hooks
  const { getTaskUpdates } = useGetTaskUpdates();
  const { createTaskUpdate, isLoading: taskSaveLoader } = useCreateTaskUpdate();
  const { editTaskUpdate, isLoading: taskUpdateLoader } = useEditTaskUpdate();
  const { deleteTaskUpdate, isLoading: taskDeleteLoader } =
    useDeleteTaskUpdate();
  const { getUserTaskManagerSetting } = useGetUserTaskManagerSetting();
  const { updateTaskManagerSetting, isLoading: updateSettingLoader } =
    useUpdateUserTaskManagerSetting();

  // Helper function hooks
  const { mentionUsers, loadMentionUsers } = useLoadMentionUsers({
    assignedUsers,
  });

  const { getCompanyUsers } = useGetCompanyUsers();
  const { notifyUsers } = useCreateTaskNotifyUsers();
  const [updateAttachmentErrors, setUpdateAttachmentErrors] = useState({});
  const [fileUploading, setFileUploading] = useState(false);
  const user = useSelector(userData);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);
  const { removeReadTasks: removeReadUpdates } = useDeleteReadTasks();
  const [showContentError, setShowContentError] = useState(false);
  const [showDropdown, setShowDropdown] = useState({
    showAssignedTo: false,
    showStatus: false,
  });
  const [updateAttachments, setUpdateAttachments] = useState([]);
  const [showAlertOnComplete, setShowAlertOnComplete] = useState(true);

  useEffect(() => {
    loadUserTaskManagerSetting();
  }, []);

  useEffect(() => {
    loadMentionUsers({ assignedUsers });
  }, [assignedUsers]);

  useEffect(() => {
    if (userId && hasNewUpdates) {
      setHasNewUpdates(false);

      if (!isSubTask) {
        setCurrentTasks((prev) => {
          return prev.map((itm) => {
            if (itm._id === taskId) {
              return { ...itm, isUnreadUpdates: false };
            }
            return { ...itm };
          });
        });
        removeReadUpdates(userId, {
          taskIds: [taskId],
          notificationFor: NotificationType.NEW_UPDATE,
        }).catch((e) => console.log(e));
      } else {
        setSubTasks((prev) => {
          const updatedSubTasks = [...(prev[isSubTask?._id] || [])].map((t) => {
            return t._id === taskId
              ? { ...t, isUnreadUpdates: false }
              : { ...t };
          });

          return {
            ...prev,
            [isSubTask?._id]: updatedSubTasks,
          };
        });

        removeReadUpdates(userId, {
          taskIds: [taskId],
          notificationFor: NotificationType.NEW_UPDATE,
        }).catch((e) => console.log(e));
      }
    }
  }, [userId, taskId, isSubTask, hasNewUpdates]);

  useEffect(() => {
    if (editTask?._id) return loadTaskUpdates();
    else setAllUpdates([]);
  }, [editTask?._id]);

  const loadUserTaskManagerSetting = async () => {
    const { data, error } = await getUserTaskManagerSetting();
    if (!error && data?.alertOnTaskComplete === false) {
      setShowAlertOnComplete(false);
    }
  };

  const loadTaskUpdates = async () => {
    const { data, error } = await getTaskUpdates({
      task: taskId,
      populate: JSON.stringify([{ path: 'task' }, { path: 'createdBy' }]),
    });
    if (!error && Array.isArray(data)) {
      setAllUpdates(data);
    }
    setLoading(false);
  };

  const addUpdate = async () => {
    let newContent = null;
    if (content && content !== '' && !isContentEmpty(content)) {
      newContent = content;
    }
    if (newContent && isContentEmpty(newContent) && currentEditId !== null) {
      setShowContentError(true);
      return;
    }
    if (currentUser) {
      const populateQuery = {
        populate: JSON.stringify([{ path: 'task' }, { path: 'createdBy' }]),
      };
      if (currentEditId !== null) {
        const newUpdate = {
          content: newContent || null,
          uploadAttachments: updateAttachments || [],
          status: status?._id || null,
          removeAttachments,
        };

        if (showAlertOnComplete && status?.markAsCompleted) {
          const result = await showWarnAlert({
            confirmButtonText: 'Yes',
            html: alertHtml(status?.label),
          });
          if (result.value) {
            if (alertCheckboxRef.current.checked) {
              await updateTaskManagerSetting({ alertOnTaskComplete: false });
            }
            newUpdate.completed = true;
          } else {
            return false;
          }
        }

        const { data, error } = await editTaskUpdate(
          currentEditId,
          newUpdate,
          'Updating...',
          populateQuery
        );

        if (!error) {
          setRemoveAttachments([]);
          setValue('status', status || undefined);
          if (data) {
            setAllUpdates((prev) =>
              prev.map((p) => (p._id === currentEditId ? { ...data } : p))
            );
          }
          setUpdateAttachments([]);
          setCurrentEditId(null);
          handleClearAddUpdateTask();
        }
      } else {
        const createdBy = currentUser._id;
        const assignedUsers = getMentionsValues(newContent);
        const assignedTaskUsers = getValues('assigned');

        const newUpdate = {
          content: newContent || null,
          task: taskId,
          createdBy,
          assignedUsers,
          uploadAttachments: updateAttachments || [],
          status: status?._id || null,
          assigned: assignedTaskUsers?.map((assign) => assign?.value),
          removeAttachments,
        };

        if (showAlertOnComplete && status?.markAsCompleted) {
          const result = await showWarnAlert({
            html: alertHtml(status?.label),
            confirmButtonText: 'Yes',
          });
          if (result.value) {
            if (alertCheckboxRef.current.checked) {
              await updateTaskManagerSetting({ alertOnTaskComplete: false });
            }
            newUpdate.completed = true;
          } else {
            return false;
          }
        }

        const { data, error } = await createTaskUpdate(
          newUpdate,
          'Adding Update...'
          // HELLO
          // populateQuery
        );

        if (!error) {
          setRemoveAttachments([]);
          setValue('status', status || undefined);
          setValue('assigned', assignedTaskUsers);
          setUpdateAttachments([]);
          if (data) {
            notifyUserForNewUpdate();
            setAllUpdates((prev) => [...prev, data]);
          }
          handleClearAddUpdateTask();
        }
      }
    }
    let tempCurrentTasks = [...currentTasks];

    tempCurrentTasks = [
      ...tempCurrentTasks.map((task) => {
        if (task._id === taskId) {
          return {
            ...task,
            status: status?._id,
          };
        } else {
          return { ...task };
        }
      }),
    ];
    if (status?.markAsCompleted) {
      tempCurrentTasks = tempCurrentTasks.filter((task) => task._id !== taskId);
    }

    setSubTasks((prev) => {
      const updatedSubTasks = [...(prev[isSubTask?._id] || [])].map((t) => {
        return t._id === taskId ? { ...t, status: status?._id } : { ...t };
      });

      return {
        ...prev,
        [isSubTask?._id]: updatedSubTasks,
      };
    });

    setCurrentTasks(tempCurrentTasks);
    setContent('');
    setSaveDisabled(true);
  };

  const editNote = async (item) => {
    // setContent(item.content);
    // setContent(htmlToDraftConverter(item?.content || ''));
    setContent(item?.content || '');
    setCurrentEditId(item._id);
    setUpdateAttachments(item.uploadAttachments || []);
  };

  const removeUpdate = async (updateId) => {
    const result = await showWarnAlert({
      text: `Are you sure you want to delete this update ?`,
      confirmButtonText: 'Yes',
    });
    if (result.value) {
      // newUpdate.completed = true;
      const { error } = await deleteTaskUpdate(updateId, 'Deleting Update');

      if (!error) {
        setAllUpdates((prev) => {
          return prev.filter((u) => u._id !== updateId);
        });
        setContent('');
        setCurrentEditId(null);
      }
    } else {
      return false;
    }
  };

  const notifyUserForNewUpdate = async () => {
    const { data, error } = await getCompanyUsers(currentUser?.company._id, {
      select: 'firstName,lastName,role',
      role: 'admin',
    });

    if (!error && data) {
      const notifyUsersList = data
        .map((d) => d._id)
        .filter((id) => id !== currentUser?._id);

      if (assignedUsers && _.isArray(assignedUsers)) {
        assignedUsers.forEach((a) => {
          if (!notifyUsersList.includes(a.value)) {
            notifyUsersList.push(a.value);
          }
        });
      }

      const notifyUsersIds = notifyUsersList.filter(
        (n) => n !== currentUser?._id
      );

      if (notifyUsersIds?.length) {
        await notifyUsers({
          taskId,
          userIds: notifyUsersIds,
          notificationFor: 'new-update',
        });
      }
    }
  };

  const attachmentUpload = (files) => {
    setUpdateAttachmentErrors({});
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
              setUpdateAttachments([...updateAttachments, ...fileObj]);
              setSaveDisabled(false);
            }
          }
          setFileUploading(false);
        })
        .catch(() => {
          setFileUploading(false);
        });
    }
  };

  const removeAttachmentFile = (removeIndex) => {
    setRemoveAttachments([
      ...removeAttachments,
      ...(removeIndex > -1
        ? [updateAttachments[removeIndex].fileUrl]
        : [...updateAttachments.map((attachment) => attachment?.fileUrl)]),
    ]);

    setUpdateAttachments(
      removeIndex > -1
        ? updateAttachments.filter((url, index) => index !== removeIndex)
        : []
    );
  };

  const changeUploadFileName = (fileObj) => {
    setUpdateAttachments(
      updateAttachments?.map((file, index) => {
        if (index === fileObj.index) {
          file.fileName = fileObj.name;
        }
        return file;
      })
    );
  };

  const handleResetDocumentPreview = () => {
    setPreviewModalOpen(false);
    setCurrentPreviewFile(null);
  };

  const handleFileClick = (file) => {
    setCurrentPreviewFile(file?.fileUrl);
    setPreviewModalOpen(true);
  };
  const handleFileDownloadClick = (file) => {
    downloadFile(`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file.fileUrl}`);
  };

  const alertHtml = (completeStatusLabel = '') => (
    <>
      <p>
        Are you sure you want to change this status to
        {completeStatusLabel} because task will be marked as archived on moving
        task to this status ?
      </p>
      <>
        <Input
          innerRef={alertCheckboxRef}
          id='stop-alert'
          type='checkbox'
          style={{ marginTop: '4px' }}
        />
        <Label for='stop-alert' style={{ marginLeft: '4px' }}>
          Don't tell me again
        </Label>
      </>
    </>
  );

  return loading ? (
    <div className='d-flex align-items-center justify-content-center loader'>
      <Spinner />
    </div>
  ) : (
    <>
      <div className='task__top__details__row'>
        <div className='task__top__details__col'>
          <div className='inner-wrapper'>
            <div className='label'>
              <div className='icon-wrapper'>
                <Bookmark />
              </div>
              <span className='label__text'>Status</span>
            </div>
            <div className='value'>
              {getValues('status') || showDropdown.showStatus ? (
                <>
                  <Select
                    key={status}
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
                      setStatus(data);
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
                      if (saveDisabled) setSaveDisabled(false);
                    }}
                    components={{
                      Option: OptionComponent,
                      SingleValue: PriorityStatusCategorySingleValue,
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                  />
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
        <div className='task__top__details__col'>
          <div className='inner-wrapper'>
            <div className='label'>
              <div className='icon-wrapper'>
                <Users />
              </div>
              <span className='label__text'>Assign To</span>
            </div>
            <div className='value'>
              {getValues('assigned') || showDropdown.showAssignedTo ? (
                <div className='assignTo-wrapper'>
                  <Select
                    isMulti={true}
                    key={assignedUsers}
                    styles={{
                      singleValue: (base) => ({
                        ...base,
                        display: 'flex',
                        alignItems: 'center',
                      }),
                    }}
                    id='assigned'
                    name='assigned'
                    defaultValue={getValues('assigned')}
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
                      if (saveDisabled) setSaveDisabled(false);
                    }}
                    components={{
                      Option: contactOptionComponent,
                      MultiValue: AssignedToSingleValue,
                    }}
                  />
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
      </div>
      <div className='editor-wrapper'>
        <SyncfusionRichTextEditor
          name='rte3'
          list='#rte3_rte-edit-view'
          editorRef={editorRef}
          onChange={(e) => {
            setContent(e.value);
            if (saveDisabled) {
              setSaveDisabled(false);
            }
            if (showContentError && currentEditId !== null)
              setShowContentError(false);
          }}
          value={content}
          mentionOption={mentionUsers}
          mentionEnable
        />
        {showContentError && (
          <div style={{ color: 'red' }}>Enter Valid Update</div>
        )}

        <div className='attachment-save-btn-wrapper'>
          <NewTaskManagerFileDropZone
            multiple={true}
            filesUpload={attachmentUpload}
            removeFile={removeAttachmentFile}
            fileURLArray={updateAttachments}
            accept={AVAILABLE_FILE_FORMAT}
            fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
            fileRowSize={2}
            fieldName='attachments'
            loading={fileUploading}
            changeUploadFileName={changeUploadFileName}
            errors={updateAttachmentErrors}
            setError={(field, { type, message }) => {
              setUpdateAttachmentErrors({ [field]: { type, message } });
            }}
          />
          <SaveButton
            color='primary'
            onClick={addUpdate}
            loading={taskSaveLoader || taskUpdateLoader || updateSettingLoader}
            name={'Save'}
            width='100px'
            className='align-items-center justify-content-center save-btn'
            disabled={saveDisabled}
          />
          <Col className='note-listing-col' md={12}>
            {allUpdates
              ?.sort(
                ({ createdAt: a }, { createdAt: b }) => moment(b) - moment(a)
              )
              ?.map((item) => (
                <div className='note-box' key={item._id}>
                  <div className='inner-wrapper'>
                    <div className='profile-img'>
                      {item?.createdBy?.userProfile ? (
                        <Avatar
                          className='user-profile'
                          img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${item?.createdBy?.userProfile}`}
                          content={`${item?.createdBy?.firstName}  ${item?.createdBy?.lastName}`}
                          initials
                        />
                      ) : (
                        <Avatar
                          className='user-profile'
                          color={'light-primary'}
                          content={`${item?.createdBy?.firstName}  ${item?.createdBy?.lastName}`}
                          initials
                        />
                      )}
                    </div>
                    <div className='right-contant'>
                      <div className='note-header'>
                        <div className='name-time'>
                          <span className='name'>
                            {item?.createdBy?.firstName}{' '}
                            {item?.createdBy?.lastName}
                          </span>
                          <span className='time'>
                            {moment(item?.createdAt || new Date()).format(
                              `${
                                currentUser?.company?.dateFormat || 'MM/DD/YYYY'
                              }, HH:mm A`
                            )}
                          </span>
                        </div>
                        {item.createdBy?._id === currentUser?._id && (
                          <>
                            <div className='action-btn-wrapper'>
                              <div className='action-btn edit-btn'>
                                <Edit2
                                  className='cursor-pointer'
                                  size={18}
                                  onClick={() => item && editNote(item)}
                                />
                              </div>
                              {taskDeleteLoader &&
                              item?._id === currentEditId ? (
                                <div className='action-btn spinner-btn'>
                                  <Spinner size='sm' />
                                </div>
                              ) : (
                                <div className='action-btn delete-btn'>
                                  <Trash
                                    // color='#777'
                                    className='cursor-pointer'
                                    size={20}
                                    onClick={async () => removeUpdate(item._id)}
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className='contant-area'>
                        {item.content ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          ></div>
                        ) : (
                          ''
                        )}

                        {item?.uploadAttachments?.length > 0 && (
                          <div className='attachment-wrapper'>
                            {item?.uploadAttachments?.map((file, index) => {
                              return (
                                <>
                                  <div
                                    // HELLO-D
                                    // md='1'
                                    key={index}
                                    className='file__card'
                                  >
                                    <div className='inner-border-wrapper'>
                                      <div className='inner-wrapper'>
                                        <div className='file__preview__details'>
                                          <div className='file__preview'>
                                            {renderFile(
                                              `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`
                                            )}
                                          </div>
                                          <span className='file-name'>
                                            {file.fileName}
                                          </span>
                                        </div>
                                        <div className='overlay cursor-pointer'>
                                          <div className='action-btn-wrapper'>
                                            <div className='action-btn view-btn'>
                                              <Eye
                                                // color='#ffffff'
                                                onClick={() => {
                                                  handleFileClick(file);
                                                }}
                                              />
                                            </div>
                                            <div className='action-btn download-btn'>
                                              <Download
                                                // color='#ffffff'
                                                onClick={() => {
                                                  handleFileDownloadClick(file);
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </Col>
          <FilePreviewModal
            visibility={previewModalOpen}
            url={currentPreviewFile}
            toggleModal={handleResetDocumentPreview}
            title='File Upload Preview'
          />
        </div>
      </div>
    </>
  );
};

export default ModalUpdates;
