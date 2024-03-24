import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';
import { useEffect, useState } from 'react';
import { useLoadMentionUsers } from '../hooks/useHelper';
import {
  useCreateTaskUpdate,
  useDeleteTaskUpdate,
  useEditTaskUpdate,
  useGetTaskUpdates,
} from '../service/taskUpdate.service';
import moment from 'moment';
import NewTaskManagerFileDropZone, {
  renderFile,
} from '../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { Download, Edit2, Eye, Trash } from 'react-feather';
import { downloadFile } from '../../../../helper/common.helper';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import FilePreviewModal from '../../../../@core/components/form-fields/FilePreviewModal';
import { uploadDocumentFileAPI } from '../../../../api/documents';
import Avatar from '../../../../@core/components/avatar';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../../../constant';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';
import { getMentionsValues } from '../../../../components/SyncfusionRichTextEditor/helper';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { useRemoveAttachment } from '../../../../api/auth';

export const TaskUpdateModal = ({
  isTaskUpdateModal,
  handleCloseUpdateTask,
}) => {
  const [content, setContent] = useState('');
  const { getTaskUpdates } = useGetTaskUpdates();
  const [allUpdates, setAllUpdates] = useState([]);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const currentUser = useSelector(userData);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [updateAttachments, setUpdateAttachments] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [updateAttachmentErrors, setUpdateAttachmentErrors] = useState({});
  const [removeAttachments, setRemoveAttachments] = useState([]);
  const { removeAttachment } = useRemoveAttachment();

  const { mentionUsers, loadMentionUsers } = useLoadMentionUsers({
    assignedUsers: isTaskUpdateModal?.taskDetail?.assigned,
  });

  const { deleteTaskUpdate, isLoading: taskDeleteLoader } =
    useDeleteTaskUpdate();

  const { createTaskUpdate, isLoading: createUpdateTaskLoading } =
    useCreateTaskUpdate();
  const { editTaskUpdate, isLoading: editUpdateTaskLoading } =
    useEditTaskUpdate();
  useEffect(() => {
    if (isTaskUpdateModal?.taskDetail?.assigned) {
      loadMentionUsers({
        assignedUsers: isTaskUpdateModal?.taskDetail?.assigned,
      });
    }
  }, [isTaskUpdateModal?.taskDetail?.assigned]);

  useEffect(() => {
    loadTaskUpdates();
  }, []);

  const loadTaskUpdates = async () => {
    const { data, error } = await getTaskUpdates({
      task: isTaskUpdateModal?.taskDetail?._id,
      populate: JSON.stringify([{ path: 'task' }, { path: 'createdBy' }]),
    });

    if (!error && Array.isArray(data)) {
      setAllUpdates(data);
    }
  };

  const handleFileClick = (file) => {
    setCurrentPreviewFile(file?.fileUrl);
    setPreviewModalOpen(true);
  };

  const handleFileDownloadClick = (file) => {
    downloadFile(`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file.fileUrl}`);
  };

  const editNote = async (item) => {
    setContent(item.content);
    setCurrentEditId(item._id);
    setUpdateAttachments(item.uploadAttachments || []);
  };

  const removeUpdate = async (updateId) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this update?',
    });

    if (result.value) {
      const { error } = await deleteTaskUpdate(updateId, 'Deleting Update');

      if (!error) {
        setAllUpdates((prev) => {
          return prev.filter((u) => u._id !== updateId);
        });
        setContent('');
        setCurrentEditId(null);
      }
    }
  };

  const handleResetDocumentPreview = () => {
    setPreviewModalOpen(false);
    setCurrentPreviewFile(null);
  };

  const attachmentUpload = (files) => {
    setUpdateAttachmentErrors({});
    const formData = new FormData();
    formData.append(
      'filePath',
      `${currentUser?.company?._id}/task-attachments`
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
              setUpdateAttachments([...updateAttachments, ...fileObj]);
              // setSaveDisabled(false);
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

  const createNewTaskUpdate = async () => {
    const newContent = content;

    setContent('');
    if (currentUser) {
      const populateQuery = {
        populate: JSON.stringify([{ path: 'task' }, { path: 'createdBy' }]),
      };
      if (currentEditId !== null) {
        //
        const newUpdate = {
          content: newContent,
          uploadAttachments: updateAttachments || [],
          removeAttachments,
        };
        const { data, error } = await editTaskUpdate(
          currentEditId,
          newUpdate,
          'Updating...',
          populateQuery
        );
        if (!error && data) {
          setRemoveAttachments([]);
          let tempData = JSON.parse(JSON.stringify(allUpdates));
          tempData = tempData.map((updates) => {
            if (updates._id === currentEditId) {
              return data;
            }
            return updates;
          });
          setAllUpdates(tempData);

          setUpdateAttachments([]);
          setCurrentEditId(null);
        }
      } else {
        const createdBy = currentUser._id;
        const assignedUsers = getMentionsValues(newContent);

        const assignedTaskUsers = isTaskUpdateModal?.taskDetail?.assigned || [];

        const newUpdate = {
          content: newContent,
          task: isTaskUpdateModal?.taskDetail?._id,
          createdBy,
          assignedUsers,
          uploadAttachments: updateAttachments || [],
          assigned: assignedTaskUsers?.map((assign) => assign?._id),
          removeAttachments,
        };

        const { data, error } = await createTaskUpdate(
          newUpdate,
          'Adding Update...'
          // HELLO
          // populateQuery
        );
        if (!error && data) {
          setRemoveAttachments([]);
          setAllUpdates([...allUpdates, data]);
          setUpdateAttachments([]);
        }
      }
    }
  };

  const handleCloseModal = async () => {
    handleCloseUpdateTask();
    if (removeAttachments.length) {
      await removeAttachment({ attachmentUrl: removeAttachments });
      setRemoveAttachments([]);
    }
  };
  return (
    <Modal
      isOpen={isTaskUpdateModal?.isOpen}
      toggle={() => handleCloseModal()}
      className='modal-dialog-centered modal-lg task-add-update-modal modal-dialog-mobile'
      backdrop='static'
      size='lg'
      fade={false}
    >
      <ModalHeader
        toggle={() => {
          handleCloseModal();
        }}
      >
        <div className='d-flex'>Update</div>
      </ModalHeader>
      <ModalBody className='pt-2'>
        <div className='mobile-scroll-wrapper hide-scrollbar'>
          <div className='editor-wrapper'>
            <SyncfusionRichTextEditor
              key={`task_updates_${currentEditId}`}
              onChange={(e) => {
                setContent(e.value);
              }}
              value={content}
              mentionOption={mentionUsers}
              mentionEnable
            />
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
                showAttachmentsButton={true}
                errors={updateAttachmentErrors}
                setError={(field, { type, message }) => {
                  setUpdateAttachmentErrors({ [field]: { type, message } });
                }}
              />
              <SaveButton
                color='primary'
                onClick={createNewTaskUpdate}
                disabled={fileUploading}
                loading={createUpdateTaskLoading || editUpdateTaskLoading}
                name={currentEditId ? 'Update' : 'Save'}
                width='100px'
                className='align-items-center justify-content-center'
              />
            </div>
          </div>
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
                          // imgHeight='32'
                          // imgWidth='32'
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
                        {item?.createdBy?._id === currentUser?._id && (
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
                        <div
                          className='note-text-wrapper froala-display-CN-watermark-remove'
                          key={item?._id}
                        >
                          {item?.content ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: item?.content,
                              }}
                            ></div>
                          ) : (
                            ''
                          )}
                        </div>
                        {item?.uploadAttachments?.length > 0 && (
                          <>
                            <div className='attachment-wrapper'>
                              {item?.uploadAttachments?.map((file, index) => {
                                return (
                                  <>
                                    <div key={index} className='file__card'>
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
                                                  onClick={() => {
                                                    handleFileClick(file);
                                                  }}
                                                />
                                              </div>
                                              <div className='action-btn download-btn'>
                                                <Download
                                                  onClick={() => {
                                                    handleFileDownloadClick(
                                                      file
                                                    );
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </Col>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          className='me-1'
          type='reset'
          color='secondary'
          outline
          onClick={handleCloseUpdateTask}
        >
          Close
        </Button>
      </ModalFooter>
      <FilePreviewModal
        visibility={previewModalOpen}
        url={currentPreviewFile}
        toggleModal={handleResetDocumentPreview}
        title='File Upload Preview'
      />
    </Modal>
  );
};

export default TaskUpdateModal;
