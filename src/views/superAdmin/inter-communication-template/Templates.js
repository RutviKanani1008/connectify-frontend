// ==================== Packages =======================
import React, { useEffect, useState } from 'react';
import { Copy, Edit2, Eye, Grid, Send, Trash, List } from 'react-feather';
import classnames from 'classnames';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  TabPane,
  UncontrolledTooltip,
} from 'reactstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// ====================================================
import UILoader from '@components/ui-loader';
import { TemplateForm } from './TemplateForm';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import ItemTable from '../../../@core/components/data-table';
import EmailTemplateCard from './components/EmailTemplateCard';
import { cloneSmsTemplate, deleteSmsTemplate } from '../../../api/smsTemplates';
import {
  cloneEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplates,
  sendTestEmailTemplate,
} from '../../../api/emailTemplates';
import { isSuperAdmin } from '../../../helper/user.helper';
import EmailTemplatePreviewModal from './components/EmailTemplatePreviewModal';
import SendTestEmailModal from './components/SendTestEmailModal';
import { validateEmail } from '../../../utility/Utils';
import { useDispatch } from 'react-redux';
import { storeCompanyDetails } from '../../../redux/user';

const MySwal = withReactContent(Swal);

const Templates = () => {
  // ============================== states ============================
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState('grid');
  const [templateType, setTemplateType] = useState('');
  const [mailTemplateLoading, setMailTemplateLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentEmails, setCurrentEmails] = useState([]);
  const [showError, setShowError] = useState(false);
  const [currentTemplates, setCurrentTemplates] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  const autoResponderTemplate = emailTemplates.filter(
    (t) => t?.isAutoResponderTemplate
  );

  const dispatch = useDispatch();

  useEffect(() => {
    getEmailDetails();
  }, []);

  const getEmailDetails = async () => {
    try {
      setMailTemplateLoading(true);
      const res = await getEmailTemplates({
        select:
          'name,company,subject,name,body,status,htmlBody,jsonBody,isAutoResponderTemplate,tags',
        isAutoResponderTemplate: true,
      });
      setEmailTemplates(res?.data.data);
      setMailTemplateLoading(false);
    } catch (error) {
      setMailTemplateLoading(false);
    }
  };

  const onSave = () => {
    if (templateType === 'email') {
      getEmailDetails();
    }
  };

  const handleConfirmDelete = (item, type) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: `Are you sure you would like to delete this ${type} template ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        setDeleteLoading(true);
        const toastId = showToast(TOASTTYPES.loading, '', 'Deleting...');
        if (type === 'email') {
          deleteEmailTemplate(item._id)
            .then((res) => {
              if (res.error) {
                showToast(TOASTTYPES.error, toastId, res.error);
              } else {
                getEmailDetails();
                showToast(
                  TOASTTYPES.success,
                  toastId,
                  'Template Deleted Successfully'
                );
              }
              setDeleteLoading(false);
            })
            .catch(() => {
              setDeleteLoading(false);
            });
        } else if (type === 'sms') {
          deleteSmsTemplate(item._id)
            .then((res) => {
              if (res.error) {
                showToast(TOASTTYPES.error, toastId, res.error);
              } else {
                showToast(
                  TOASTTYPES.success,
                  toastId,
                  'Template Deleted Successfully'
                );
              }
              setDeleteLoading(false);
            })
            .catch(() => {
              setDeleteLoading(false);
            });
        }
      }
    });
  };

  const handleEmails = (values) => {
    if (showError) setShowError(false);

    if (values && values.length > 0) {
      const validEmails = [];
      values.forEach((value) => {
        if (validateEmail(value.value)) {
          validEmails.push(value);
        }
      });
      setCurrentEmails(validEmails);
    }
  };

  const sendMailTemplate = (values) => {
    const body = {};
    const item = currentTemplates;
    const bodyContent = item.body;
    body.receiverEmails = values?.emails?.map((email) => email?.value) || [];
    body.templateType = item.templateType;
    body.templateId = item._id;
    body.company = item.company;
    body.bodyContent = bodyContent;
    body.senderName = values?.fromName;
    body.senderEmail = values?.fromEmail;
    body.isAutoResponderTemplate = true;
    const toastId = showToast(TOASTTYPES.loading, '', 'Sending mail...');
    sendTestEmailTemplate(body).then((res) => {
      if (res.error) {
        showToast(TOASTTYPES.error, toastId, res.error);
        dispatch(
          storeCompanyDetails({
            defaultTestMailConfig: {
              receiver: values?.emails?.map((email) => email?.value),
              senderName: values?.fromName,
              senderEmail: values?.fromEmail,
            },
          })
        );
      } else {
        showToast(TOASTTYPES.success, toastId, 'Mail send Successfully');
      }
      setOpenModal(!openModal);
      setCurrentTemplates(false);
      setCurrentEmails([]);
      setShowError(false);
    });
  };

  const sendTestMail = (item, type) => {
    if (type === 'email') {
      setCurrentTemplates(item);
      setOpenModal(true);
    }
  };

  const cloneTemplateDetails = (id, type) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: `Are you sure you would like to clone ${type} this template ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        const toastId = showToast(TOASTTYPES.loading, '', 'Clone Templates...');

        if (type === 'email') {
          cloneEmailTemplate(id).then((res) => {
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              if (res.data.data) {
                getEmailDetails();
                showToast(
                  TOASTTYPES.success,
                  toastId,
                  'Template Cloned Successfully'
                );
              }
            }
          });
        } else if (type === 'sms') {
          cloneSmsTemplate(id).then((res) => {
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              if (res.data.data) {
                showToast(
                  TOASTTYPES.success,
                  toastId,
                  'Template Cloned Successfully'
                );
              }
            }
          });
        }
      }
    });
  };

  const [columns, setColumns] = useState([]);
  useEffect(() => {
    if (emailTemplates && emailTemplates.length > 0) {
      setColumns([
        {
          name: 'Title',
          minWidth: '400px',
          sortable: (row) => row?.name,
          selector: (row) => row?.name,
          cell: (row) => <span className='text-capitalize'>{row.name}</span>,
        },
        {
          name: 'Subject',
          minWidth: '400px',
          cell: (row) => {
            const { subject } = row;
            return (
              <div className=''>
                <span className='align-middle ms-50'>{subject} </span>
              </div>
            );
          },
        },
        {
          name: 'Actions',
          minWidth: '250px',
          maxWidth: '300px',
          allowOverflow: true,
          cell: (row) => {
            const { _id } = row;

            return (
              <div className='action-btn-wrapper'>
                <div className='action-btn view-btn'>
                  <Eye
                    size={15}
                    className='cursor-pointer'
                    onClick={() => {
                      openPreview(row);
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
                </div>
                <div className='action-btn copy-btn'>
                  <Copy
                    // color='orange'
                    size={15}
                    className='cursor-pointer'
                    onClick={() => cloneTemplateDetails(_id, 'email')}
                    id={`clone_${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`clone_${_id}`}
                  >
                    Clone
                  </UncontrolledTooltip>
                </div>
                <div className='action-btn edit-btn'>
                  <Edit2
                    size={15}
                    className='cursor-pointer'
                    onClick={() => {
                      setEditItem(row);
                      setTemplateType('email');
                      setShowForm(true);
                    }}
                    // color={'#64c664'}
                    id={`edit_${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`edit_${_id}`}
                  >
                    Edit
                  </UncontrolledTooltip>
                </div>

                <div className='action-btn edit-btn'>
                  <Send
                    size={15}
                    className='cursor-pointer'
                    onClick={() => sendTestMail(row)}
                    id={`send_mail_${_id}`}
                  />

                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`send_mail_${_id}`}
                  >
                    {row.templateType === 'email'
                      ? 'Send Test Email'
                      : 'Send Test SMS'}
                  </UncontrolledTooltip>
                </div>
                <div className='action-btn edit-btn'>
                  <Trash
                    color='red'
                    size={15}
                    className='cursor-pointer'
                    onClick={() => handleConfirmDelete(row, 'email')}
                    id={`trash_${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`trash_${_id}`}
                  >
                    Delete
                  </UncontrolledTooltip>
                </div>
              </div>
            );
          },
        },
      ]);
    }
  }, [emailTemplates]);

  const openPreview = (item) => {
    setTemplatesPreview(item);
    setPreviewModal(true);
  };

  return (
    <>
      {/* Email Templates */}
      <UILoader blocking={mailTemplateLoading}>
        <UILoader blocking={deleteLoading} loader={<></>}>
          <Card className='company-template-tab-card'>
            {isSuperAdmin() && (
              <>
                <TabPane tabId='interCommunicationTemplate'>
                  {activeView === 'grid' ? (
                    <div>
                      <CardHeader>
                        <CardTitle tag='h4' className='text-primary'>
                          Internal Communication Templates
                        </CardTitle>
                        <ButtonGroup className={''}>
                          <Button
                            tag='label'
                            className={classnames(
                              'btn-icon view-btn grid-view-btn',
                              {
                                active: activeView === 'grid',
                              }
                            )}
                            color='primary'
                            outline
                            onClick={() => setActiveView('grid')}
                          >
                            <Grid size={18} />
                          </Button>
                          <Button
                            tag='label'
                            className={classnames(
                              'btn-icon view-btn list-view-btn',
                              {
                                active: activeView === 'list',
                              }
                            )}
                            color='primary'
                            outline
                            onClick={() => setActiveView('list')}
                          >
                            <List size={18} />
                          </Button>
                        </ButtonGroup>
                      </CardHeader>
                      <CardBody className='py-1'>
                        <div className='company-email-inner-scroll hide-scrollbar'>
                          <Row className='company-email-temp-card-row'>
                            {autoResponderTemplate &&
                            autoResponderTemplate.length > 0 ? (
                              autoResponderTemplate
                                .filter((t) => t?.isAutoResponderTemplate)
                                .map((item, key) => (
                                  <Col
                                    className='company-email-temp-card-col'
                                    md='4'
                                    key={key}
                                  >
                                    <EmailTemplateCard
                                      item={item}
                                      openPreview={openPreview}
                                      cloneTemplateDetails={
                                        cloneTemplateDetails
                                      }
                                      setEditItem={setEditItem}
                                      setTemplateType={setTemplateType}
                                      setShowForm={setShowForm}
                                      handleConfirmDelete={handleConfirmDelete}
                                      sendTestMail={sendTestMail}
                                    />
                                  </Col>
                                ))
                            ) : (
                              <div className='d-flex justify-content-center m-4'>
                                <span className='no-data-found'>
                                  {!mailTemplateLoading &&
                                    'No email template found!'}
                                </span>
                              </div>
                            )}
                          </Row>
                        </div>
                      </CardBody>
                    </div>
                  ) : (
                    <ItemTable
                      showCard={false}
                      hideButton={true}
                      columns={columns}
                      data={emailTemplates?.filter(
                        (t) => t?.isAutoResponderTemplate
                      )}
                      title={'Internal Communication Templates'}
                      itemsPerPage={10}
                      selectableRows={false}
                    />
                  )}
                </TabPane>
              </>
            )}
          </Card>
        </UILoader>
      </UILoader>

      <TemplateForm
        isOpen={showForm}
        setIsOpen={setShowForm}
        templateType={templateType}
        values={editItem}
        setEditItem={setEditItem}
        onSave={onSave}
      />

      {/* Send Test Email Modal */}
      <SendTestEmailModal
        openModal={openModal}
        setCurrentTemplates={setCurrentTemplates}
        setOpenModal={setOpenModal}
        handleEmails={handleEmails}
        showError={showError}
        currentEmails={currentEmails}
        sendMailTemplate={sendMailTemplate}
        setShowError={setShowError}
      />
      <EmailTemplatePreviewModal
        templatePreview={templatePreview}
        previewModal={previewModal}
        setPreviewModal={setPreviewModal}
        setTemplatesPreview={setTemplatesPreview}
      />
    </>
  );
};

export default Templates;
