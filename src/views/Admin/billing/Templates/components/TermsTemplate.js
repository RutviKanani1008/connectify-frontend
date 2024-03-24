// ==================== Packages =======================
import React, { useState, useEffect } from 'react';
import { Copy, Edit2, Eye, Plus, Trash } from 'react-feather';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
// ====================================================
import UILoader from '@components/ui-loader';
import { FormField } from '../../../../../@core/components/form-fields';
import { SaveButton } from '../../../../../@core/components/save-button';
import { required } from '../../../../../configs/validationConstant';
import {
  useAddTermsTemplates,
  useCloneTermsTemplates,
  useDeleteTermsTemplates,
  useGetTermsTemplates,
  useUpdateTermsTemplates,
} from '../hooks/billingTemplateApis';
import ItemTable from '../../../../../@core/components/data-table';
import { showWarnAlert } from '../../../../../helper/sweetalert.helper';
import ExportData from '../../../../../components/ExportData';
import SyncfusionRichTextEditor from '../../../../../components/SyncfusionRichTextEditor';

const termsValidationSchema = yup.object().shape({
  name: yup.string().required(required('Name')),
  content: yup.string().required(required('Content')),
});

const TermsTemplate = ({ activeView }) => {
  const initialValue = { name: '', content: '' };

  // ============================== states ============================
  const [termsTemplates, setTermsTemplates] = useState([]);

  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);

  // ============================== Custom hooks ============================
  const { getTermsTemplates, isLoading: termsLoading } = useGetTermsTemplates();
  const { addTermsTemplate, isLoading: termsAddLoading } =
    useAddTermsTemplates();
  const { updateTermsTemplate, isLoading: termsUpdateLoading } =
    useUpdateTermsTemplates();
  const { deleteTermsTemplate } = useDeleteTermsTemplates();
  const { cloneTermsTemplate } = useCloneTermsTemplates();

  const {
    control,
    register,
    getValues,
    setValue,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: initialValue,
    resolver: yupResolver(termsValidationSchema),
  });

  useEffect(() => {
    loadTermsTemplates();
  }, []);

  const loadTermsTemplates = async () => {
    const { data, error } = await getTermsTemplates();
    if (!error) setTermsTemplates(data);
  };

  const onSubmit = async (templateData) => {
    if (currentEdit) {
      await updateTermsTemplate(
        currentEdit,
        templateData,
        'Update Terms Template'
      );
    } else {
      await addTermsTemplate(templateData, 'Add Terms Template');
    }

    setOpenModal(false);
    reset(initialValue);
    loadTermsTemplates();
  };

  const removeTermsTemplate = async (id) => {
    const { error } = await deleteTermsTemplate(id, 'Delete Terms Tempate');
    if (!error) loadTermsTemplates();
  };

  const cloneTermsTemplateById = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to clone this template?',
    });

    if (result.value) {
      const { error } = await cloneTermsTemplate(id, 'Clone Terms Template');
      if (!error) loadTermsTemplates();
    }
  };

  const columns = [
    {
      name: 'Title',
      minWidth: '400px',
      sortable: (row) => row?.name,
      selector: (row) => row?.name,
      cell: (row) => <span className='text-capitalize'>{row.name}</span>,
    },
    {
      name: 'Actions',
      minWidth: '250px',
      maxWidth: '300px',

      allowOverflow: true,
      cell: (row) => {
        const { _id } = row;

        return (
          <div className='text-primary d-flex mt-md-0 mt-1'>
            <>
              <Eye
                size={15}
                className='me-1 cursor-pointer'
                onClick={() => {
                  setCurrentPreview(row);
                  setOpenPreviewModal(true);
                }}
                id={`preview_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`preview_${_id}`}
              >
                Preview
              </UncontrolledTooltip>
            </>

            <>
              <Copy
                size={15}
                className='me-1 cursor-pointer'
                onClick={() => cloneTermsTemplateById(row._id)}
                id={`clone_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`clone_${_id}`}
              >
                Clone Template
              </UncontrolledTooltip>
            </>

            <>
              <Edit2
                size={15}
                className='me-1 cursor-pointer'
                onClick={() => {
                  const { _id, name, content } = row;
                  reset({ name, content });
                  setCurrentEdit(_id);
                  setOpenModal(true);
                }}
                id={`edit_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`edit_${_id}`}
              >
                Edit Template
              </UncontrolledTooltip>
            </>

            <Trash
              size={15}
              color='red'
              className='cursor-pointer'
              onClick={() => removeTermsTemplate(row._id)}
              id={`delete_${_id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`delete_${_id}`}
            >
              Delete Template
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <UILoader blocking={termsLoading}>
        <Card>
          {activeView === 'grid' ? (
            <div>
              <CardHeader>
                <CardTitle tag='h4' className='text-primary'>
                  Terms And Condition Templates
                </CardTitle>
                <Button
                  className='ms-2'
                  color='primary'
                  onClick={() => setOpenModal(true)}
                >
                  <Plus size={15} />
                  <span className='align-middle ms-50'>Add New</span>
                </Button>
              </CardHeader>
              <CardBody className='pb-0'>
                <Row>
                  {termsTemplates && termsTemplates.length > 0 ? (
                    termsTemplates.map((item, key) => (
                      <Col md='4' key={key}>
                        <Card className='mb-2'>
                          <CardHeader>
                            <h5
                              className='text-primary form-card-title'
                              id={`title_${key}`}
                            >
                              {item.name}
                            </h5>
                            <UncontrolledTooltip
                              placement='top'
                              autohide={true}
                              target={`title_${key}`}
                            >
                              {item.name}
                            </UncontrolledTooltip>
                            <div className='text-primary d-flex mt-md-0 mt-1'>
                              <>
                                <Copy
                                  size={15}
                                  className='me-1 cursor-pointer'
                                  onClick={() =>
                                    cloneTermsTemplateById(item._id)
                                  }
                                  id={`clone_${key}`}
                                />
                                <UncontrolledTooltip
                                  placement='top'
                                  autohide={true}
                                  target={`clone_${key}`}
                                >
                                  Clone Template
                                </UncontrolledTooltip>
                              </>

                              <>
                                <Edit2
                                  size={15}
                                  className='me-1 cursor-pointer'
                                  onClick={() => {
                                    const { _id, name, content } = item;
                                    reset({ name, content });
                                    setCurrentEdit(_id);
                                    setOpenModal(true);
                                  }}
                                  id={`edit_${key}`}
                                />
                                <UncontrolledTooltip
                                  placement='top'
                                  autohide={true}
                                  target={`edit_${key}`}
                                >
                                  Edit Template
                                </UncontrolledTooltip>
                              </>

                              <Trash
                                size={15}
                                color='red'
                                className='cursor-pointer'
                                onClick={() => removeTermsTemplate(item._id)}
                                id={`delete_${key}`}
                              />
                              <UncontrolledTooltip
                                placement='top'
                                autohide={true}
                                target={`delete_${key}`}
                              >
                                Delete Template
                              </UncontrolledTooltip>
                            </div>
                          </CardHeader>

                          <CardBody>
                            <div className='d-flex justify-content-between'>
                              <div>
                                <Button
                                  className='mt-1'
                                  color='primary'
                                  onClick={() => {
                                    setCurrentPreview(item);
                                    setOpenPreviewModal(true);
                                  }}
                                >
                                  <span className='align-middle ms-50'>
                                    Preview
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <div className='d-flex justify-content-center m-4'>
                      <span className='no-data-found'>
                        {!termsLoading && 'No template found!'}
                      </span>
                    </div>
                  )}
                </Row>
              </CardBody>
            </div>
          ) : (
            <ItemTable
              ExportData={<ExportData model='billingTemplate' />}
              showCard={false}
              hideButton={true}
              columns={columns}
              data={termsTemplates}
              title={'Terms And Condition Templates'}
              itemsPerPage={10}
              selectableRows={false}
            />
          )}
        </Card>
      </UILoader>

      <Modal
        isOpen={openModal}
        // toggle={() => setOpenModal(!openModal)}
        className='modal-dialog-centered'
      >
        <ModalHeader toggle={() => setOpenModal(!openModal)}>
          {currentEdit ? 'Edit Template' : 'Add Template'}
        </ModalHeader>
        <Form
          className='auth-login-form'
          onSubmit={handleSubmit(onSubmit)}
          autoComplete='off'
        >
          <div className='modal-body'>
            <div className='mb-1'>
              <FormField
                name='name'
                label='Template Name'
                placeholder='Template Name'
                type='text'
                errors={errors}
                control={control}
                {...register(`name`)}
              />
            </div>

            <div className='mb-1'>
              <div className='terms-content'>
                {/* REVIEW - STYLE */}
                <SyncfusionRichTextEditor
                  key={`tnc_content`}
                  value={getValues('content') || ''}
                  onChange={(e) => {
                    setValue('content', e.value, {
                      shouldValidate: true,
                    });
                  }}
                />

                {/* wrapperClassName='template-editor-wrapper'
                  editorClassName='editor-class'
                  editorStyle={{ border: '1px solid', minHeight: '175px' }} */}
              </div>
              {errors.content && (
                <div className='mt-1 text-danger'>{errors.content.message}</div>
              )}
            </div>
          </div>
          <div className='modal-footer'>
            <SaveButton
              width='100px'
              className='ms-1'
              type='submit'
              loading={termsAddLoading || termsUpdateLoading}
              name={currentEdit ? 'Update' : 'Save'}
            />
          </div>
        </Form>
      </Modal>

      <Modal
        isOpen={openPreviewModal}
        toggle={() => {
          setOpenPreviewModal(false);
          setCurrentPreview(null);
        }}
        className='modal-dialog-centered'
        backdrop='static'
      >
        <ModalHeader
          toggle={() => {
            setOpenPreviewModal(false);
            setCurrentPreview(null);
          }}
        >
          {currentPreview?.name} Preview
        </ModalHeader>
        <ModalBody>
          <div className='mb-2'>
            {currentPreview && currentPreview.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: currentPreview.content }}
              ></div>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='danger'
            onClick={() => {
              setOpenPreviewModal(false);
              setCurrentPreview(null);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TermsTemplate;
