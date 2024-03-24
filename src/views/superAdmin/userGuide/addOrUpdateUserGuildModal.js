import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch } from 'react-hook-form';
import {
  Button,
  Col,
  Form,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import * as yup from 'yup';
import { required } from '../../../configs/validationConstant';
import NewTaskManagerFileDropZone from '../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { useEffect, useState } from 'react';
import ProgressBar from '../../../components/ProgressBar';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../../constant';
import { sendReqFileUpload } from '../../../api/profile';
import { SaveButton } from '../../../@core/components/save-button';
import { selectThemeColors } from '../../../utility/Utils';
import Select from 'react-select';
import { usePostUserGuide, useUpdateuserGuide } from './hooks/userApis';
import {
  pageGroupComponent,
  pageGroupOptions,
} from '../../forms/component/OptionComponent';
import SyncfusionRichTextEditor from '../../../components/SyncfusionRichTextEditor';
import _ from 'lodash';
import { useRemoveAttachment } from '../../../api/auth';
const validationSchema = yup.object().shape({
  text: yup.string().required(required('Name')),
});

const AVAILABLE_UPLOAD_TYPE = {
  image: 'imageAttchments',
  video: 'videoAttchments',
};

export const UserGuideModal = (props) => {
  const {
    isModalShow,
    handleCloseGuideModal,
    availablePages,
    currentUserGuide,
    availableUserGuide,
    addOrUpdateUserGuide,
    setAddOrUpdateUserGuide,
  } = props;
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
    getValues,
    clearErrors,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const [fileUploadURL, setFileUploadURL] = useState([]);
  const [videoUploadURL, setVideoUploadURL] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [socketSessionId, setSocketSessionId] = useState(undefined);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(null);
  const [formSetRenderKey, setFormSetRenderKey] = useState(1);
  const [removeAttachments, setRemoveAttachments] = useState([]);

  const { addUserGuide, isLoading: addUserGuideLoading } = usePostUserGuide();
  const { removeAttachment } = useRemoveAttachment();
  const { updateUserGuide, isLoading: updateUserGuideLoading } =
    useUpdateuserGuide();
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (currentUserGuide) {
      if (currentUserGuide?.imageAttchments) {
        setFileUploadURL(currentUserGuide?.imageAttchments || []);
      }
      if (currentUserGuide?.videoAttchments) {
        setVideoUploadURL(currentUserGuide?.videoAttchments || []);
      }
      reset(currentUserGuide);
    } else {
      // reset({});
    }
  }, [currentUserGuide]);

  useEffect(() => {
    handleSetPages();
  }, [availablePages]);

  const handleSetPages = () => {
    const tempOptions = [];
    availablePages.forEach((parentPage) => {
      const options = [];
      const obj = {};
      obj['label'] = parentPage?.pageName;
      if (parentPage?.allow_guide) {
        options.push({
          ...parentPage,
          label: parentPage?.pageName,
          value: parentPage?._id,
        });
      }
      if (parentPage.children.length) {
        parentPage.children
          ?.sort((a, b) => a?.order - b?.order)
          ?.forEach((child) => {
            if (child?.allow_guide) {
              options.push({
                ...child,
                label: child?.pageName,
                value: child?._id,
              });
            }
          });
      }
      obj['options'] = options;
      tempOptions.push(obj);
      // }
    });
    setPages(tempOptions);
  };

  const onSubmit = async (values) => {
    if (values.page?._id) {
      values.page = values.page?._id;
    }
    values.removeAttachments = removeAttachments;
    if (currentUserGuide) {
      // Update code is here.
      const { data, error } = await updateUserGuide(
        currentUserGuide._id,
        values
      );
      if (!error) {
        handleCloseGuideModal(data);
        setRemoveAttachments([]);
      }
    } else {
      const { data, error } = await addUserGuide(values);
      if (!error) {
        handleCloseGuideModal(data);
        setRemoveAttachments([]);
      }
    }
  };

  const onFileUpload = (files) => {
    const formData = new FormData();
    formData.append('filePath', `super-admin/user-guide`);
    files?.forEach((file) => {
      if (!file?.url) {
        formData.append('attachments', file);
      }
    });
    setImageUploading(true);
    if (files.length && files.filter((file) => !file?.url)?.length) {
      sendReqFileUpload(formData, socketSessionId)
        .then((res) => {
          setTimeout(() => {
            setUploadProgress(undefined);
          }, 1200);
          if (res.error) {
            setImageUploading(false);
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
              setValue('imageAttchments', [...fileUploadURL, ...fileObj]);
              setFileUploadURL([...fileUploadURL, ...fileObj]);
              clearErrors('imageAttchments');
            }
            setImageUploading(false);
          }
        })
        .catch(() => {
          setTimeout(() => {
            setUploadProgress(undefined);
          }, 1200);
        });
    }
  };

  const onVideoUpload = (files) => {
    const formData = new FormData();
    formData.append('filePath', `super-admin/user-guide`);
    files?.forEach((file) => {
      if (!file?.url) {
        formData.append('attachments', file);
      }
    });
    setVideoUploading(true);
    if (files.length && files.filter((file) => !file?.url)?.length) {
      sendReqFileUpload(formData, socketSessionId)
        .then((res) => {
          setTimeout(() => {
            setUploadProgress(undefined);
          }, 1200);
          if (res.error) {
            setVideoUploading(false);
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
              setValue('videoAttchments', [...videoUploadURL, ...fileObj]);
              setVideoUploadURL([...videoUploadURL, ...fileObj]);
              clearErrors('videoAttchments');
            }
            setVideoUploading(false);
          }
        })
        .catch(() => {
          setTimeout(() => {
            setUploadProgress(undefined);
          }, 1200);
        });
    }
  };

  const removeUploadFile = (removeIndex) => {
    setRemoveAttachments([
      ...removeAttachments,
      ...(removeIndex > -1
        ? [fileUploadURL[removeIndex]?.fileUrl]
        : [...fileUploadURL.map((attachment) => attachment?.fileUrl)]),
    ]);

    setFileUploadURL(
      removeIndex > -1
        ? fileUploadURL.filter((url, index) => index !== removeIndex)
        : []
    );
    setValue(
      'imageAttchments',
      removeIndex > -1
        ? fileUploadURL.filter((url, index) => index !== removeIndex)
        : []
    );
  };

  const removeVideoUploadFile = (removeIndex) => {
    setRemoveAttachments([
      ...removeAttachments,
      ...(removeIndex > -1
        ? [videoUploadURL[removeIndex]?.fileUrl]
        : [...videoUploadURL.map((attachment) => attachment?.fileUrl)]),
    ]);

    setVideoUploadURL(
      removeIndex > -1
        ? videoUploadURL.filter((url, index) => index !== removeIndex)
        : []
    );
    setValue(
      'videoAttchments',
      removeIndex > -1
        ? videoUploadURL.filter((url, index) => index !== removeIndex)
        : []
    );
  };

  const pageWatch = useWatch({
    control,
    name: `page`,
  });

  const textWatch = useWatch({
    control,
    name: `text`,
  });
  const handleChangePage = (selectedOption) => {
    const isExist = availableUserGuide.find(
      (userGuide) => userGuide?.page?._id === selectedOption?._id
    );
    if (isExist) {
      setAddOrUpdateUserGuide({
        ...addOrUpdateUserGuide,
        userGuide: {
          ...isExist,
          page: {
            ...isExist.page,
            label: isExist.page?.pageName,
            value: isExist?.page?._id,
          },
        },
      });
      setTimeout(() => {
        setFormSetRenderKey(Math.random());
      }, 100);
    } else {
      setAddOrUpdateUserGuide({
        ...addOrUpdateUserGuide,
        userGuide: null,
      });
      reset({});
      setValue('page', selectedOption);

      setFileUploadURL([]);
      setVideoUploadURL([]);
      setTimeout(() => {
        setFormSetRenderKey(Math.random());
      }, 100);
    }
  };

  const changeUploadFileName = (fileObj, type) => {
    setValue(
      type,
      type === AVAILABLE_UPLOAD_TYPE.image
        ? fileUploadURL.map((file, index) => {
            if (index === fileObj.index) {
              file.fileName = fileObj.name;
            }
            return file;
          })
        : videoUploadURL.map((file, index) => {
            if (index === fileObj.index) {
              file.fileName = fileObj.name;
            }
            return file;
          })
    );

    if (type === AVAILABLE_UPLOAD_TYPE.image) {
      setFileUploadURL(
        fileUploadURL.map((file, index) => {
          if (index === fileObj.index) {
            file.fileName = fileObj.name;
          }
          return file;
        })
      );
    } else if (type === AVAILABLE_UPLOAD_TYPE.video) {
      setVideoUploadURL(
        videoUploadURL.map((file, index) => {
          if (index === fileObj.index) {
            file.fileName = fileObj.name;
          }
          return file;
        })
      );
    }
  };

  const handleCloseModal = async () => {
    handleCloseGuideModal();
    if (
      removeAttachments.length ||
      fileUploadURL.length ||
      videoUploadURL.length
    ) {
      //
      const oldImageOrVideo = [
        ...(_.isArray(currentUserGuide?.imageAttchments)
          ? currentUserGuide.imageAttchments
          : []),
        ...(_.isArray(currentUserGuide?.videoAttchments)
          ? currentUserGuide?.videoAttchments
          : []),
      ]?.map((attachment) => attachment?.fileUrl);

      let currentAllImageAndVideo = [...fileUploadURL, ...videoUploadURL]?.map(
        (attachment) => attachment.fileUrl
      );

      if (removeAttachments.length) {
        currentAllImageAndVideo = [
          ...currentAllImageAndVideo,
          ...removeAttachments,
        ];
      }

      if (currentAllImageAndVideo.length) {
        currentAllImageAndVideo = currentAllImageAndVideo.filter(
          (attachment) => !oldImageOrVideo.includes(attachment)
        );
      }

      if (currentAllImageAndVideo.length) {
        await removeAttachment({ attachmentUrl: currentAllImageAndVideo });
      }
      setRemoveAttachments([]);
    }
  };
  return (
    <>
      <Modal
        isOpen={isModalShow}
        toggle={() => handleCloseModal()}
        className='modal-dialog-centered user-guide-modal'
        backdrop='static'
        size='xl'
      >
        <ModalHeader toggle={() => handleCloseModal()}>User Guide</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-2'>
              <Label>Select Page</Label>
              <Select
                key={pageWatch}
                styles={{
                  singleValue: (base) => ({
                    ...base,
                    display: 'flex',
                    alignItems: 'center',
                  }),
                }}
                id='page'
                name='page'
                value={pageWatch}
                defaultValue={getValues('page')}
                options={pages}
                theme={selectThemeColors}
                className={`react-select ${
                  errors?.['page']?.message ? 'is-invalid' : ''
                }`}
                classNamePrefix='custom-select'
                onChange={(data) => {
                  handleChangePage(data);
                }}
                components={{
                  Group: pageGroupOptions,
                  GroupHeading: pageGroupComponent,
                }}
              />
            </div>
            <div className='mb-2'>
              <Label>Text</Label>
              {/* REVIEW - STYLE */}
              <SyncfusionRichTextEditor
                key={`text_${formSetRenderKey}`}
                value={textWatch}
                onChange={(e) => {
                  setValue('text', e.value, {
                    shouldValidate: true,
                  });
                }}
              />
              {/* editorStyle={{
                  border: '1px solid',
                  minHeight: '175px',
                }}
                wrapperClassName='template-editor-wrapper'
                editorClassName='editor-class' */}
              {errors?.text && errors?.text?.type === 'required' && (
                <span className='form-error'>Text is required</span>
              )}
            </div>
            <Row>
              <Col md={6}>
                <div className='mb-2'>
                  <Label>Upload Image</Label>
                  {imageUploading && (
                    <ProgressBar
                      progress={uploadProgress}
                      setProgress={setUploadProgress}
                      setSocketSessionId={setSocketSessionId}
                    />
                  )}
                  <NewTaskManagerFileDropZone
                    setError={setError}
                    filesUpload={onFileUpload}
                    removeFile={removeUploadFile}
                    fileURLArray={fileUploadURL}
                    accept={AVAILABLE_FILE_FORMAT}
                    fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                    fieldName='upload'
                    loading={imageUploading}
                    multiple={true}
                    changeUploadFileName={(fileObj) => {
                      changeUploadFileName(
                        fileObj,
                        AVAILABLE_UPLOAD_TYPE.image
                      );
                    }}
                  />
                  {errors?.attachments &&
                    errors?.attachments?.type === 'focus' && (
                      <span
                        className='text-danger block'
                        style={{
                          fontSize: '0.857rem',
                        }}
                      >
                        Upload is required
                      </span>
                    )}
                  {errors?.attachments &&
                    errors?.attachments?.type === 'required' && (
                      <span
                        className='text-danger block'
                        style={{ fontSize: '0.857rem' }}
                      >
                        File is required!
                      </span>
                    )}
                </div>
              </Col>
              <Col md={6}>
                <div className=''>
                  <Label>Upload Video</Label>
                  {videoUploading && (
                    <ProgressBar
                      progress={videoUploadProgress}
                      setProgress={setVideoUploadProgress}
                      setSocketSessionId={setSocketSessionId}
                    />
                  )}
                  <NewTaskManagerFileDropZone
                    setError={setError}
                    filesUpload={onVideoUpload}
                    removeFile={removeVideoUploadFile}
                    fileURLArray={videoUploadURL}
                    accept={'.mp4'}
                    fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                    fieldName='upload'
                    loading={videoUploading}
                    multiple={true}
                    changeUploadFileName={(fileObj) => {
                      changeUploadFileName(
                        fileObj,
                        AVAILABLE_UPLOAD_TYPE.video
                      );
                    }}
                  />
                  {errors?.attachments &&
                    errors?.attachments?.type === 'focus' && (
                      <span
                        className='text-danger block'
                        style={{
                          fontSize: '0.857rem',
                        }}
                      >
                        Upload is required
                      </span>
                    )}
                  {errors?.attachments &&
                    errors?.attachments?.type === 'required' && (
                      <span
                        className='text-danger block'
                        style={{ fontSize: '0.857rem' }}
                      >
                        File is required!
                      </span>
                    )}
                </div>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <SaveButton
              loading={addUserGuideLoading || updateUserGuideLoading}
              disabled={addUserGuideLoading || updateUserGuideLoading}
              width='100px'
              color='primary'
              name={'Submit'}
              type='submit'
            ></SaveButton>
          </Form>
          <Button color='danger' onClick={() => handleCloseModal()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
