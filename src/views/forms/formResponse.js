import React, { Fragment, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import UILoader from '@components/ui-loader';
import {
  Button,
  Form,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import {
  deleteFormResponse,
  getFormResponseDetail,
  updateFormResponse,
} from '../../api/forms';
import { useForm } from 'react-hook-form';
import { SaveButton } from '@components/save-button';
import { FormField } from '@components/form-fields';
import { showWarnAlert } from '../../helper/sweetalert.helper';
import FilePreviewModal from '../../@core/components/form-fields/FilePreviewModal';
import FileDropZone from '../../@core/components/form-fields/FileDropZone';
import { useUploadFormFile } from './hooks/useApis';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../constant';
import useColumn from './hooks/useColumns';
import { removeSpecialCharactersFromString } from '../../helper/common.helper';
import ServerSideTable from '../../@core/components/data-table/ServerSideTable';
import _ from 'lodash';
const FormResponseList = () => {
  const tableRef = useRef(null);

  const [fetching, setFetching] = useState(false);
  const [formResponse, setFormResponse] = useState({ results: [], total: 0 });

  const formResponseRef = useRef();
  formResponseRef.current = formResponse;
  const [formTitle, setFormTitle] = useState(false);
  const history = useHistory();
  const params = useParams();
  const [currentFormField, setCurrentFormField] = useState({});
  const [formFields, setFormFields] = useState([]);
  const [currentRecord, setCurrentRecord] = useState({
    index: false,
    record: false,
  });
  const [removeAttachments, setRemoveAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    setError,
    setFocus,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
  });
  const [openFormPreview, setOpenFormPreview] = useState(false);
  const [openPreviewImage, setOpenPreviewImage] = useState(null);
  const [currentFilters, setCurretFilters] = useState({
    limit: 10,
    page: 1,
    search: '',
  });

  /** Files */
  const { uploadFormFile } = useUploadFormFile();
  const [fileUploadURL, setFileUploadURL] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const deleteResponse = async (record) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this response?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      const toastId = showToast(
        TOASTTYPES.loading,
        '',
        'Response Deleting ...'
      );
      deleteFormResponse(record._id).then((res) => {
        if (res.error) {
          if (res.errorData) {
            res.errorData.forEach((error) => {
              showToast(TOASTTYPES.error, toastId, error);
            });
          } else {
            showToast(TOASTTYPES.error, toastId, res.error);
          }
        } else {
          removeRecordRefreshTable();
          showToast(
            TOASTTYPES.success,
            toastId,
            'Response Deleted successfully.'
          );
        }
      });
    }
  };

  const editResponse = (record, index) => {
    setOpenFormPreview(true);
    setCurrentRecord({ index, record });
    reset(record.response);

    const tempFiles = {};
    currentFormField?.fields
      ?.filter((field) => field.type === 'file')
      .map((field) => {
        tempFiles[field.label] = {
          files: record.response[field.label],
          error: null,
        };
      });
    setFileUploadURL(tempFiles);
  };

  const { submissionColumns } = useColumn({
    setOpenPreviewImage,
    formFields,
    editResponse,
    deleteResponse,
  });

  const getRecords = (filter) => {
    setCurretFilters({
      limit: filter.limit,
      page: filter.page,
      search: filter.search,
      // sort: filter.sort,
    });
    setFetching(true);
    getFormResponseDetail(params.id, {
      limit: filter.limit,
      page: filter.page,
      search: filter.search,
    }).then((res) => {
      if (res.error) {
        if (res.errorData) {
          history.push('/grandadmin/marketing/web-forms');
        } else {
          history.push('/grandadmin/marketing/web-forms');
        }
      } else {
        const tempForms = res.data.data;
        if (tempForms && tempForms.form) {
          setFormTitle(tempForms?.form?.title);
        }
        if (tempForms.responses && _.isArray(tempForms.responses)) {
          setFormResponse({
            results: tempForms.responses,
            total: tempForms.totalFormResponse || 0,
          });
        }
        if (
          tempForms &&
          tempForms?.form?.fields &&
          tempForms?.form?.fields.length > 0
        ) {
          setFormFields(tempForms?.form?.fields);
          setCurrentFormField(tempForms?.form);
        }
        setFetching(false);
      }
    });
  };

  const handleResetForm = () => {
    setRemoveAttachments([]);
    setOpenFormPreview(!openFormPreview);
    setCurrentRecord({
      index: false,
      record: false,
    });
    reset(null);
  };

  const checkForValidation = (data) => {
    let flag = 1;
    if (currentFormField.fields && currentFormField.fields.length > 0 && data) {
      const emptyFields = currentFormField.fields.filter((field) => {
        if (field.required) {
          if (field.type === 'file')
            return !fileUploadURL?.[
              removeSpecialCharactersFromString(field.label)
            ]?.files?.length;
          else if (field.typ !== 'file')
            return (
              data[removeSpecialCharactersFromString(field.label)] === null ||
              data[removeSpecialCharactersFromString(field.label)] ===
                undefined ||
              data[removeSpecialCharactersFromString(field.label)] === ''
            );
          return false;
        }
        return false;
      });

      let tempFileUplaodURL = { ...fileUploadURL };
      emptyFields.forEach((field, index) => {
        if (field.type === 'file') {
          if (field.required) {
            if (!tempFileUplaodURL[field.label]) {
              tempFileUplaodURL = {
                ...tempFileUplaodURL,
                [field.label]: {
                  files: [],
                  error: `${field.label} is required`,
                },
              };
            } else {
              tempFileUplaodURL[
                field.label
              ].error = `${field.label} is required`;
            }
          }
        } else {
          setError(`${removeSpecialCharactersFromString(field.label)}`, {
            type: 'required',
            message: `${removeSpecialCharactersFromString(
              field.label
            )} is Required.`,
          });
          if (index === emptyFields.length - 1)
            setFocus(`${removeSpecialCharactersFromString(field.label)}`);
        }
        flag = 0;
      });
      setFileUploadURL(tempFileUplaodURL);
    }
    return flag;
  };

  const onSubmit = (data) => {
    if (checkForValidation(data)) {
      if (
        currentRecord &&
        currentRecord.record &&
        formResponse &&
        formResponse.length > 0
      ) {
        const resObj = {};
        formResponse.forEach((form, index) => {
          if (index === currentRecord.index) {
            currentFormField.fields.forEach((field) => {
              if (field.type === 'file') {
                resObj[field.label] = fileUploadURL[field.label]?.files;
              } else {
                resObj[removeSpecialCharactersFromString(field.label)] =
                  data[removeSpecialCharactersFromString(field.label)];
                form.response[removeSpecialCharactersFromString(field.label)] =
                  data[removeSpecialCharactersFromString(field.label)];
              }
            });
          }
        });
        if (params.id !== 'add') {
          setSubmitting(true);
          const toastId = showToast(
            TOASTTYPES.loading,
            '',
            'Response Updating ...'
          );
          const obj = {};
          obj.response = resObj;
          obj.removeAttachments = removeAttachments;
          updateFormResponse(currentRecord.record._id, obj)
            .then((res) => {
              setRemoveAttachments([]);
              if (res.error) {
                if (res.errorData) {
                  res.errorData.forEach((error) => {
                    showToast(TOASTTYPES.error, toastId, error);
                  });
                } else {
                  showToast(TOASTTYPES.error, toastId, res.error);
                }
              } else {
                showToast(
                  TOASTTYPES.success,
                  toastId,
                  'Response Updated successfully.'
                );
                handleResetForm();
                getRecords();
              }
              setSubmitting(false);
            })
            .catch(() => {
              setSubmitting(false);
            });
        }
      }
    }
  };

  const onFileUpload = (field, files) => {
    if (currentFormField?.company) {
      const toastId = showToast(TOASTTYPES.loading);
      const file = files[0];
      const formData = new FormData();
      formData.append('filePath', `${currentFormField.company}/forms`);
      formData.append('image', file);
      setUploadingFile(field.label);
      uploadFormFile(formData)
        .then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            if (res?.data) {
              setFileUploadURL({
                ...fileUploadURL,
                [field.label]: {
                  files: [res?.data],
                  error: null,
                },
              });
            }
            showToast(TOASTTYPES.success, toastId, 'File Uploaded');
          }
        })
        .finally(() => {
          setUploadingFile(false);
        });
    } else {
      console.log('error');
    }
  };

  const removeUploadFile = (field) => {
    const tempFileUplaodURL = { ...fileUploadURL };

    setRemoveAttachments([
      ...removeAttachments,
      ...(tempFileUplaodURL[field.label]?.files || []),
    ]);

    if (field.required) {
      tempFileUplaodURL[field.label].error = `${field.label}     is required`;
    }
    tempFileUplaodURL[field.label].files = [];
    setFileUploadURL(tempFileUplaodURL);
  };

  const header = () => {
    return (
      <div className='card-header-with-buttons card-header'>
        <h4 className='title card-title'>
          {formTitle ? `${formTitle} Submissions` : 'Form Submissions'}
        </h4>
      </div>
    );
  };

  const removeRecordRefreshTable = () => {
    if ((formResponse.total - 1) % currentFilters.limit === 0) {
      tableRef.current.refreshTable({
        filterArgs: { ...currentFilters, page: currentFilters.page - 1 || 1 },
      });
      setCurretFilters({
        ...currentFilters,
        page: currentFilters.page - 1,
      });
    } else {
      setCurretFilters({
        ...currentFilters,
      });
      tableRef.current.refreshTable({
        filterArgs: { ...currentFilters },
      });
    }
  };

  return (
    <div className='form-submissions-page'>
      <UILoader blocking={fetching}>
        <ServerSideTable
          ref={tableRef}
          blocking={false}
          selectableRows={false}
          columns={submissionColumns}
          getRecord={getRecords}
          data={formResponse}
          itemsPerPage={currentFilters.limit}
          header={header()}
          cardClass={'user-list-page'}
        />
        <Modal
          isOpen={openFormPreview}
          toggle={() => handleResetForm()}
          className='modal-dialog-centered'
          backdrop='static'
        >
          <ModalHeader toggle={() => handleResetForm()}>
            Update Response
          </ModalHeader>
          <ModalBody>
            <Form
              className='auth-login-form mt-2'
              onSubmit={handleSubmit(onSubmit)}
              autoComplete='off'
            >
              {currentFormField &&
                currentFormField.fields &&
                currentFormField.fields.length > 0 &&
                currentFormField.fields.map((field, index) => {
                  return (
                    <Fragment key={index}>
                      <div className='mb-1'>
                        <Label className='form-label' for={`${field?.label}`}>
                          {field?.label}
                          {field?.required ? (
                            <>
                              <span className='text-danger'>*</span>
                            </>
                          ) : null}
                        </Label>
                        {field.type === 'file' ? (
                          <>
                            <FileDropZone
                              loading={uploadingFile === field.label}
                              setError={(fieldName, { message }) => {
                                setFileUploadURL({
                                  ...fileUploadURL,
                                  [fieldName]: {
                                    ...fileUploadURL[field.label],
                                    error: message,
                                  },
                                });
                              }}
                              filesUpload={(files) =>
                                onFileUpload(field, files)
                              }
                              removeFile={() => removeUploadFile(field)}
                              fileURLArray={
                                fileUploadURL?.[field?.label]?.files
                              }
                              accept={AVAILABLE_FILE_FORMAT}
                              fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                              fieldName={field?.label}
                            />
                            {fileUploadURL?.[field.label]?.error && (
                              <span
                                className='text-danger block'
                                style={{ fontSize: '0.857rem' }}
                              >
                                {fileUploadURL[field.label].error}
                              </span>
                            )}
                          </>
                        ) : ['select', 'multiSelect'].includes(field.type) ? (
                          <FormField
                            placeholder={field.placeholder}
                            type={'select'}
                            isMulti={field.type === 'multiSelect'}
                            errors={errors}
                            options={field?.options}
                            control={control}
                            onChange={(e) => {
                              setValue(
                                `${removeSpecialCharactersFromString(
                                  field.label
                                )}`,
                                e
                              );
                            }}
                            name={`${removeSpecialCharactersFromString(
                              field.label
                            )}`}
                          />
                        ) : (
                          <FormField
                            placeholder={field.placeholder}
                            type={field?.type}
                            errors={errors}
                            options={field?.options}
                            control={control}
                            name={`${removeSpecialCharactersFromString(
                              field.label
                            )}`}
                            {...register(
                              `${removeSpecialCharactersFromString(
                                field.label
                              )}`
                            )}
                          />
                        )}
                      </div>
                    </Fragment>
                  );
                })}
            </Form>
          </ModalBody>
          <ModalFooter>
            <Form
              className='auth-login-form'
              onSubmit={handleSubmit(onSubmit)}
              autoComplete='off'
            >
              <SaveButton
                width='100%'
                type='submit'
                name={'Update'}
                loading={submitting}
              ></SaveButton>
            </Form>
            <Button
              color='danger'
              onClick={() => {
                handleResetForm();
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </UILoader>
      {openPreviewImage && (
        <FilePreviewModal
          visibility={!!openPreviewImage}
          url={openPreviewImage}
          toggleModal={() => setOpenPreviewImage(null)}
          title='Attachment Preview'
        />
      )}
    </div>
  );
};

export default FormResponseList;
