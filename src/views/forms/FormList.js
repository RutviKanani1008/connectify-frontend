import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Grid, Plus, List } from 'react-feather';
import {
  Button,
  ButtonGroup,
  // Card,
  // CardBody,
  CardText,
  Col,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { useForm } from 'react-hook-form';
import { FormField } from '@components/form-fields';
import themeConfig from '../../configs/themeConfig';
// import { SaveButton } from '@components/save-button';
import { useSelector } from 'react-redux';
import { userData } from '../../redux/user';
import classnames from 'classnames';
import { Link, useHistory } from 'react-router-dom';
import FileDropZone from '../../@core/components/form-fields/FileDropZone';
import useGetBasicRoute from '../../hooks/useGetBasicRoute';
import { showWarnAlert } from '../../helper/sweetalert.helper';
import FormTable from './component/FormTable';
import useColumn from './hooks/useColumns';
import {
  useCloneForm,
  useDeleteForm,
  useGetForm,
  useUpdateForm,
} from './hooks/useApis';
import FormGrid from './component/FormGrid';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../constant';
import {
  setFieldBorderRadius,
  setQuestionSpacing,
} from '../../helper/design.helper';
import SyncfusionRichTextEditor from '../../components/SyncfusionRichTextEditor';

const FormList = () => {
  const activeFormTableRef = useRef(null);
  const archivedFormTableRef = useRef(null);

  const { basicRoute } = useGetBasicRoute();
  const {
    control,
    // register,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
  });
  const [openFormPreview, setOpenFormPreview] = useState(false);
  const [currentFormField, setCurrentFormField] = useState({});

  const [activeView, setActiveView] = useState('grid');
  const [key, setKey] = useState(Math.random());

  const { getForm } = useGetForm();
  const { cloneForm } = useCloneForm();
  const { deleteForm } = useDeleteForm();
  const { updateForm } = useUpdateForm();

  useEffect(() => {
    if (currentFormField?.designField) {
      setQuestionSpacing(currentFormField?.designField?.questionSpacing);
      setFieldBorderRadius(currentFormField?.designField?.fieldBorderRadius);
    }
  }, [currentFormField]);

  const history = useHistory();
  const user = useSelector(userData);
  const handleConfirmDelete = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you want to permanently Delete this form ?',
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
      const { error } = await deleteForm(id, 'Deleting form...');
      if (!error) {
        setKey(Math.random());
        archivedFormTableRef.current &&
          archivedFormTableRef.current.removeRecordRefreshTable();
      }
    }
  };

  const handleTrashForm = async (item) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `Are you sure you want to move this form to ${
        item.archived ? 'Recover form' : 'Deleted form'
      }?`,
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
      const isItemArchived = item.archived;
      const { error } = await updateForm(
        item._id,
        {
          ...item,
          archived: !isItemArchived,
        },
        `${isItemArchived ? 'Restoring' : 'Archiving'} form...`
      );
      if (!error) {
        setKey(Math.random());
        if (isItemArchived) {
          activeFormTableRef.current &&
            activeFormTableRef.current.refreshTable();
          archivedFormTableRef.current &&
            archivedFormTableRef.current.removeRecordRefreshTable();
        } else {
          activeFormTableRef.current &&
            activeFormTableRef.current.removeRecordRefreshTable();
          archivedFormTableRef.current &&
            archivedFormTableRef.current.refreshTable();
        }
      }
    }
  };

  const handleIconCardClick = () => {
    const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
    showToast(TOASTTYPES.success, toastId, 'Form Link Copied');
  };

  const handleFormPreview = async (_id) => {
    const { data, error } = await getForm(_id);
    if (!error) {
      setCurrentFormField(data);
      setOpenFormPreview(!openFormPreview);
    }
  };

  const handleResetFormPreview = () => {
    setOpenFormPreview(!openFormPreview);
    setCurrentFormField({});
  };

  const cloneFormDetails = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: `Are you sure you want to clone this form ?`,
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
      const { error } = await cloneForm(id, 'Cloning form...');
      if (!error) {
        setKey(Math.random());
        activeFormTableRef.current && activeFormTableRef.current.refreshTable();
      }
    }
  };

  const FormDescription = () => {
    const bodyContent = currentFormField?.description
      ? currentFormField?.description
      : '';
    return (
      <>
        {bodyContent && (
          <SyncfusionRichTextEditor
            key={`form_description_${key}`}
            value={bodyContent}
            toolbarSettings={{ enable: false }}
            enabled={false}
          />
        )}
      </>
    );
  };

  const { columns } = useColumn({
    cloneFormDetails,
    handleConfirmDelete,
    handleFormPreview,
    handleTrashForm,
    handleIconCardClick,
  });

  return (
    <>
      <div className='company-form-page'>
        <div className='top-header w-100 d-inline-flex justify-content-between align-items-center mb-2'>
          <div className='add-new-btn d-inline-flex'>
            <Button
              className=''
              color='primary'
              onClick={() => {
                if (user.role === 'superadmin') {
                  history.push('/marketing/web-forms/add');
                } else {
                  history.push(`${basicRoute}/marketing/web-forms/add`);
                }
              }}
              id={`add-btn`}
            >
              <Plus size={15} />
              <span className='align-middle ms-50'>Add New</span>
            </Button>
            <UncontrolledTooltip placement='top' target={`add-btn`}>
              Add Form
            </UncontrolledTooltip>
          </div>
          <div className='view-toggle-btn d-inline-flex'>
            <ButtonGroup>
              <Button
                tag='label'
                className={classnames('btn-icon view-btn grid-view-btn', {
                  active: activeView === 'grid',
                })}
                color='primary'
                outline
                onClick={() => setActiveView('grid')}
              >
                <Grid size={18} />
              </Button>
              <Button
                tag='label'
                className={classnames('btn-icon view-btn list-view-btn', {
                  active: activeView === 'list',
                })}
                color='primary'
                outline
                onClick={() => setActiveView('list')}
              >
                <List size={18} />
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {activeView === 'grid' ? (
          <>
            <Row className='company-form-listing-row'>
              <FormGrid
                key={`active_grid_${key}`}
                archived={false}
                handleIconCardClick={handleIconCardClick}
                handleFormPreview={handleFormPreview}
                cloneFormDetails={cloneFormDetails}
                handleTrashForm={handleTrashForm}
                handleConfirmDelete={handleConfirmDelete}
              />
              <FormGrid
                key={`archived_grid_${key}`}
                archived={true}
                handleIconCardClick={handleIconCardClick}
                handleFormPreview={handleFormPreview}
                cloneFormDetails={cloneFormDetails}
                handleTrashForm={handleTrashForm}
                handleConfirmDelete={handleConfirmDelete}
              />
            </Row>
          </>
        ) : (
          <>
            <Row className='company-form-listing-row'>
              <Col
                className='custom-col form-list-table-col'
                sm={6}
                md={6}
                xs={6}
                lg={6}
                xl={6}
                xxl={6}
              >
                <FormTable
                  ref={activeFormTableRef}
                  archived={false}
                  columns={columns}
                />
              </Col>
              <Col
                className='custom-col form-list-table-col'
                sm={6}
                md={6}
                xs={6}
                lg={6}
                xl={6}
                xxl={6}
              >
                <FormTable
                  ref={archivedFormTableRef}
                  archived={true}
                  columns={columns}
                />
              </Col>
            </Row>
          </>
        )}

        <Modal
          isOpen={openFormPreview}
          toggle={() => handleResetFormPreview()}
          className='modal-dialog-centered company-form-preview-modal'
          backdrop='static'
        >
          <ModalHeader toggle={() => handleResetFormPreview()}>
            {currentFormField && currentFormField.title}
          </ModalHeader>
          <ModalBody>
            <div
              className='dynamic-form-wrapper'
              style={{
                width: `${currentFormField?.designField?.formWidth}px`,
                maxWidth: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                fontFamily: currentFormField?.designField?.fontFamily,
                fontSize: `${currentFormField?.designField?.fontSize}px`,
              }}
            >
              <span
                className='form-bg'
                style={{
                  backgroundColor:
                    currentFormField?.designField?.pageBackgroundColor,
                  opacity:
                    (currentFormField?.designField?.pageOpacity ?? 100) / 100,
                }}
              ></span>
              <div className='inner-wrapper'>
                {(currentFormField?.showLogo ||
                  currentFormField?.showCompanyName ||
                  currentFormField?.showTitle) && (
                  <>
                    <div className='top-user-profile'>
                      {currentFormField?.showLogo ? (
                        <Link
                          className='profile-img'
                          to='/'
                          onClick={(e) => e.preventDefault()}
                        >
                          <>
                            {user?.company?.companyLogo ? (
                              <img
                                src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${user?.company?.companyLogo}`}
                                width='50'
                                alt='logo'
                              />
                            ) : (
                              <img
                                src={themeConfig.app.appLogoImage}
                                width='50'
                                alt='logo'
                              />
                            )}
                          </>
                        </Link>
                      ) : null}
                      <div className='right-details'>
                        {currentFormField?.showCompanyName && (
                          <h2
                            className='title'
                            style={{
                              color: currentFormField?.designField?.fontColor,
                            }}
                          >
                            {user?.company?.name
                              ? user?.company?.name
                              : process.env.REACT_APP_COMPANY_NAME}
                          </h2>
                        )}
                        <p className='text'>
                          {currentFormField?.showTitle ? (
                            <>
                              <span
                                style={{
                                  color:
                                    currentFormField?.designField?.fontColor,
                                }}
                              >
                                {currentFormField && currentFormField?.title}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {currentFormField?.showDescription &&
                  currentFormField?.showDescription &&
                  currentFormField?.description && (
                    <CardText className='mb-1'>
                      {currentFormField?.description ? <FormDescription /> : ''}
                    </CardText>
                  )}
                {currentFormField &&
                  currentFormField.fields &&
                  currentFormField.fields.length > 0 &&
                  currentFormField.fields.map((field, index) => {
                    return (
                      <Fragment key={index}>
                        <div className='form-field-wrapper'>
                          <Label
                            style={{
                              color: currentFormField?.designField?.fontColor,
                            }}
                            className='form-label'
                            for={`${field?.label}`}
                          >
                            {field?.label}
                            {field?.required ? (
                              <>
                                <span className='text-danger'>*</span>
                              </>
                            ) : null}
                          </Label>
                          {field?.type === 'file' ? (
                            <FileDropZone
                              accept={AVAILABLE_FILE_FORMAT}
                              fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                              fieldName='upload'
                              disabled={true}
                              formDesignField={currentFormField?.designField}
                              propsBorder={`2px dashed ${currentFormField?.designField?.fontColor}`}
                              propsBrowseLinkColor={
                                currentFormField?.designField?.fontColor
                              }
                            />
                          ) : ['multiSelect', 'select'].includes(field.type) ? (
                            <FormField
                              placeholder={field.placeholder}
                              type={'select'}
                              errors={errors}
                              isMulti={field.type === 'multiSelect'}
                              options={field?.options}
                              control={control}
                              disabled={true}
                              onChange={(e) => {
                                setValue(`response.${field.label}`, e);
                              }}
                              name={`response.${field.label}`}
                            />
                          ) : (
                            <div className='field-div'>
                              <FormField
                                placeholder={field.placeholder}
                                type={field?.type}
                                errors={errors}
                                options={field?.options}
                                control={control}
                                disabled={true}
                                name={`response.${field.label}`}
                              />
                            </div>
                          )}
                        </div>
                      </Fragment>
                    );
                  })}
                <div className='submit-wrapper-no-border'>
                  <button
                    type='submit'
                    name={'Submit'}
                    className='btn'
                    style={{
                      backgroundColor:
                        currentFormField?.designField?.submitButtonColor,
                      color:
                        currentFormField?.designField?.submitButtonFontColor,
                      width: `${
                        currentFormField?.designField?.submitButtonWidth ?? 20
                      }%`,
                    }}
                  >
                    <span
                      style={{
                        color:
                          currentFormField?.designField?.submitButtonFontColor,
                      }}
                    >
                      Submit
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={() => {
                handleResetFormPreview();
              }}
            >
              Okay
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

export default FormList;
