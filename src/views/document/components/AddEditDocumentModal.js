import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { SaveButton } from '@components/save-button';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import * as yup from 'yup';
import { isEmpty, isArray } from 'lodash';
import {
  // Row,
  // Col,
  Form,
  // Label,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  ModalFooter,
} from 'reactstrap';
import { required } from '../../../configs/validationConstant';
import { FormField } from '@components/form-fields';
import { useEffect, useState } from 'react';
import {
  addDocumentAPI,
  updateDocumentAPI,
  uploadDocumentFileAPI,
} from '../../../api/documents';
import FileDropZone from '../../../@core/components/form-fields/FileDropZone';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import { useCreateFolder } from '../../Admin/groups/hooks/groupApis';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../../constant';
import { useRemoveAttachment } from '../../../api/auth';
const documentScheme = yup.object().shape(
  {
    name: yup.string().required(required('Name')),
    document: yup
      .string()
      .when('documentURL', {
        is: (documentURL) => {
          if (
            documentURL === '' ||
            documentURL === undefined ||
            documentURL === null
          ) {
            return true;
          } else {
            return false;
          }
        },
        then: yup.string().required(required('Document')),
      })
      .nullable(),
    documentURL: yup
      .string()
      .url()
      .when('document', {
        is: (document) => {
          if (document === '' || document === undefined || document === null) {
            return true;
          } else {
            return false;
          }
        },
        then: yup.string().url().required(required('Document URL')),
      })
      .nullable(),
  },
  [['document', 'documentURL']]
);

const AddEdiDocumentModal = ({
  setOpenAddEditDocumentModal,
  openAddEditDocumentModal,
  documentData = false,
  company = false,
  // documentsLength,
  setCurrentDocumentField,
  setDocuments,
  documents,
  reloadTable,
  contact = false,
  currentFolders,
  setCurrentFolders,
}) => {
  console.log('HELLOP CONTACT', contact);

  const user = useSelector(userData);
  // ----------local state-----------
  const [documentFileUrl, setDocumentFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [removeAttachments, setRemoveAttachments] = useState([]);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(documentScheme),
    defaultValues: documentData,
  });
  const { removeAttachment } = useRemoveAttachment();

  const docType = watch('documentType');

  /** Folders */
  const { createFolder } = useCreateFolder();

  useEffect(() => {
    reset(documentData);

    if (!documentData?.documentURL && !documentData?.document) {
      setValue('documentType', 'documentURL');
    } else if (documentData?.documentURL) {
      setValue('documentType', 'documentURL');
    } else {
      setValue('documentType', 'documentFile');
    }

    if (documentData.folder) {
      const folder = currentFolders.find(
        (folder) => folder?._id === documentData.folder
      );

      setValue('folder', {
        id: folder?._id,
        value: folder?._id,
        label: folder?.folderName,
      });
    }

    if (documentData.document) {
      setDocumentFileUrl([documentData.document]);
    } else {
      setDocumentFileUrl([]);
    }
  }, [documentData]);

  const onSubmit = async (values) => {
    const { name, document, documentURL, folder } = values;
    const data = {};
    try {
      data.name = name;
      data.document = document;
      data.folder = folder?.value || null;
      if (company) {
        data.company = company;
      }
      if (contact) {
        data.contact = contact;
      }
      data.documentURL = documentURL;
      data.removeAttachments = removeAttachments;
      const toastId = showToast(TOASTTYPES.loading);
      setSubmitting(true);
      if (documentData && !isEmpty(documentData) && documentData?._id) {
        updateDocumentAPI(documentData._id, data).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            reset();
            setOpenAddEditDocumentModal(false);
            showToast(
              TOASTTYPES.success,
              toastId,
              'Document updated Successfully'
            );
            setCurrentDocumentField({});
            let tempDocuments = isArray(documents) ? [...documents] : [];
            tempDocuments = tempDocuments?.map((obj) => {
              if (obj._id === documentData._id) {
                return {
                  ...obj,
                  name,
                  document,
                  documentURL,
                };
              } else {
                return obj;
              }
            });
            setDocuments(tempDocuments);
          }
          setSubmitting(false);
          reloadTable && reloadTable();
          setRemoveAttachments([]);
        });
      } else {
        // data.order = documentsLength + 1;
        addDocumentAPI(data).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            reset();
            setOpenAddEditDocumentModal(false);
            showToast(
              TOASTTYPES.success,
              toastId,
              'Document Added Successfully'
            );
            setCurrentDocumentField({});
            setDocuments((pre) =>
              isArray(pre) ? [...pre, res.data.data] : [res.data.data]
            );
          }
          setSubmitting(false);
          reloadTable && reloadTable();
          setRemoveAttachments([]);
        });
      }
    } catch (error) {
      setSubmitting(false);
      console.log('error', error.message);
    }
  };

  const documentUpload = async (files) => {
    const file = files[0];
    const formData = new FormData();
    formData.append('filePath', `${company}/documents`);
    formData.append('document', file);
    setFileUploading(true);
    if (documentFileUrl.length) {
      setRemoveAttachments([...removeAttachments, ...documentFileUrl]);
    }
    uploadDocumentFileAPI(formData)
      .then((res) => {
        if (res.error) {
          setFileUploading(false);
        } else {
          if (res?.data?.data) {
            setValue('document', ...res?.data?.data);
            setDocumentFileUrl([...res?.data?.data]);
            clearErrors('document');
            clearErrors('documentURL');
          }
        }
        setFileUploading(false);
      })
      .catch(() => {
        setFileUploading(false);
      });
  };

  const removeDocumentFile = async () => {
    if (documentFileUrl.length) {
      setRemoveAttachments([...removeAttachments, ...documentFileUrl]);
    }
    setValue('document', '');
    setDocumentFileUrl([]);
  };

  /** Folders */
  const handleFolderValue = async (value) => {
    const tempFolders = JSON.parse(JSON.stringify(currentFolders));
    const isFolderExist = tempFolders.find(
      (folder) => folder?._id === value?.value
    );
    if (!isFolderExist) {
      const obj = {};
      obj.folderName = value.value;
      obj.company = user?.company?._id;
      obj.folderFor = 'files';
      obj.model = 'Contacts';
      obj.modelRecordId = contact;
      const { data, error } = await createFolder(obj);
      if (!error) {
        tempFolders?.push(data);
        setCurrentFolders(tempFolders);
        setValue('folder', {
          id: data?._id,
          value: data?._id,
          label: data?.folderName,
        });
      }
    }
  };

  const handleCloseModal = async () => {
    // check for remove attchments
    setOpenAddEditDocumentModal(!openAddEditDocumentModal);
    setCurrentDocumentField({});
    setDocumentFileUrl([]);
    if (removeAttachments.length) {
      // If it's contain same document file
      const tempAttchments = removeAttachments.filter(
        (attachment) => attachment !== documentData?.document
      );
      if (tempAttchments.length) {
        await removeAttachment({ attachmentUrl: tempAttchments });
      }
    }
    setRemoveAttachments([]);
  };
  return (
    <Modal
      isOpen={openAddEditDocumentModal}
      toggle={() => {
        setOpenAddEditDocumentModal(!openAddEditDocumentModal);
        setCurrentDocumentField({});
        setDocumentFileUrl([]);
      }}
      className='modal-dialog-centered edit-document-modal modal-dialog-mobile'
      backdrop='static'
      fade={false}
    >
      <Form
        className='auth-login-form'
        onSubmit={handleSubmit(onSubmit)}
        autoComplete='off'
      >
        <ModalHeader
          toggle={() => {
            handleCloseModal();
          }}
        >
          {`${documentData?._id ? 'Edit' : 'Add'} Form`}
        </ModalHeader>
        <ModalBody>
          <div className='mb-2'>
            <label className='form-label form-label'>Folder</label>
            <FormField
              name='folder'
              placeholder='Select Folder'
              type='creatableselect'
              errors={errors}
              control={control}
              options={currentFolders
                ?.filter((folder) => folder._id !== 'unassigned')
                ?.map((folder) => ({
                  id: folder?._id,
                  value: folder?._id,
                  label: folder?.folderName,
                }))}
              onChange={(value) => {
                handleFolderValue(value);
              }}
            />
          </div>
          <div className='mb-2'>
            <label className='form-label form-label'>Name</label>
            <FormField
              name='name'
              placeholder='File Name'
              type='text'
              errors={errors}
              control={control}
            />
          </div>

          <div className='mb-2'>
            <label className='form-label form-label mb-1'>Document Type:</label>
            <div className='radio-switch-toggle-btn-wrapper'>
              <FormField
                name={`documentType`}
                key={`documentType`}
                options={[
                  { label: 'Document URL', value: 'documentURL' },
                  { label: 'Document File', value: 'documentFile' },
                ]}
                type='radio'
                errors={errors}
                checke
                control={control}
                isMulti={'true'}
                onChange={(selectedOption) => {
                  if (selectedOption.target.value === 'documentURL') {
                    removeDocumentFile();
                  } else {
                    setValue('documentURL', '');
                  }
                }}
                defaultValue={getValues('documentType')}
              />
            </div>
          </div>

          {docType === 'documentURL' && (
            <>
              <label className='form-label form-label'>Document URL</label>
              <FormField
                name='documentURL'
                placeholder='Document URL'
                type='text'
                errors={errors}
                control={control}
                onChange={(e) => {
                  setValue('documentURL', e.target.value);
                  if (e.target.value !== '') clearErrors('document');
                }}
              />
            </>
          )}

          {docType === 'documentFile' && (
            <>
              <label className='form-label form-label'>Document</label>
              <FileDropZone
                setError={setError}
                filesUpload={documentUpload}
                removeFile={removeDocumentFile}
                fileURLArray={documentFileUrl}
                accept={AVAILABLE_FILE_FORMAT}
                fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                fieldName='document'
                loading={fileUploading}
              />
              {errors?.document && errors?.document?.type === 'required' && (
                <span
                  className='text-danger block'
                  style={{ fontSize: '0.857rem' }}
                >
                  Document is required
                </span>
              )}
              {errors?.document && errors?.document?.type === 'fileSize' && (
                <span
                  className='text-danger block'
                  style={{ fontSize: '0.857rem' }}
                >
                  {`File upload max upto ${5} mb`}
                </span>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              handleCloseModal();
            }}
          >
            Cancel
          </Button>
          <SaveButton
            name='Submit'
            width='150px'
            type='submit'
            loading={submitting}
          />
        </ModalFooter>
      </Form>
    </Modal>
  );
};
export default AddEdiDocumentModal;
