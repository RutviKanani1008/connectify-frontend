// ==================== Packages =======================
import React, { useEffect, useState } from 'react';
import { Copy, Edit2, Eye, Grid, Plus, Send, Trash, List } from 'react-feather';
import classnames from 'classnames';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Nav,
  NavItem,
  Row,
  TabContent,
  TabPane,
  NavLink,
  UncontrolledTooltip,
} from 'reactstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// ====================================================
import UILoader from '@components/ui-loader';
import { TemplateForm } from './TemplateForm';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import ItemTable from '../../@core/components/data-table';
import EmailTemplateCard from './components/EmailTemplateCard';
import SmsTemplateCard from './components/SmsTemplateCard';
import {
  cloneSmsTemplate,
  deleteSmsTemplate,
  getSmsTemplates,
} from '../../api/smsTemplates';
import {
  cloneEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplates,
  sendTestEmailTemplate,
} from '../../api/emailTemplates';
// import { isSuperAdmin } from '../../helper/user.helper';
import EmailTemplatePreviewModal from './components/EmailTemplatePreviewModal';
import SendTestEmailModal from './components/SendTestEmailModal';
import SendTestSMSModal from './components/SendTestSMSModal';
import { validateEmail } from '../../utility/Utils';
import ExportData from '../../components/ExportData';
import ChecklistTemplateList from './components/ChecklistTemplateList';

const MySwal = withReactContent(Swal);

const Templates = () => {
  // ============================== states ============================
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [smsTemplates, setSmsTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState('grid');
  const [templateType, setTemplateType] = useState('');
  const [mailTemplateLoading, setMailTemplateLoading] = useState(false);
  const [smsTemplateLoading, setSmsTemplateLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSmsModal, setOpenSmsModal] = useState(false);
  const [currentEmails, setCurrentEmails] = useState([]);
  const [showError, setShowError] = useState(false);
  const [currentTemplates, setCurrentTemplates] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [currentTab, setCurrentTab] = useState('emailTemplate');

  // const autoResponderTemplate = emailTemplates.filter(
  //   (t) => t?.isAutoResponderTemplate
  // );

  useEffect(() => {
    getEmailDetails();
    getSmsDetails();
  }, []);

  const getEmailDetails = async () => {
    try {
      setMailTemplateLoading(true);
      const res = await getEmailTemplates({
        select:
          'name,company,subject,name,body,htmlBody,jsonBody,isAutoResponderTemplate,tags',
      });
      setEmailTemplates(res?.data.data);
      setMailTemplateLoading(false);
    } catch (error) {
      setMailTemplateLoading(false);
    }
  };

  const getSmsDetails = async () => {
    try {
      setSmsTemplateLoading(true);
      const res = await getSmsTemplates({
        select: 'name,company,subject,name,body',
      });
      setSmsTemplates(res?.data?.data);
      setSmsTemplateLoading(false);
    } catch (error) {
      setSmsTemplateLoading(false);
    }
  };

  const onSave = () => {
    if (templateType === 'sms') {
      getSmsDetails();
    } else if (templateType === 'email') {
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
                getSmsDetails();
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
    const toastId = showToast(TOASTTYPES.loading, '', 'Sending mail...');
    sendTestEmailTemplate(body).then((res) => {
      if (res.error) {
        showToast(TOASTTYPES.error, toastId, res.error);
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

  const sendTestSMS = (item, type) => {
    if (type === 'sms') {
      setCurrentTemplates(item);
      setOpenSmsModal(true);
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
                getSmsDetails();
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
  const [smsColumns, setSmsColumns] = useState([]);

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
    if (smsTemplates && smsTemplates.length > 0) {
      setSmsColumns([
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
                    onClick={() => cloneTemplateDetails(_id, 'sms')}
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
                      setTemplateType('sms');
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
                    onClick={() => sendTestSMS(row)}
                    id={`send_sms_${_id}`}
                  />

                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`send_sms_${_id}`}
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
                    onClick={() => handleConfirmDelete(row, 'sms')}
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
  }, [emailTemplates, smsTemplates]);

  const openPreview = (item) => {
    setTemplatesPreview(item);
    setPreviewModal(true);
  };

  return (
    <>
      <div className='d-flex flex-wrap align-items-center justify-content-between tabbing-header-wrapper'>
        <Nav className='horizontal-tabbing hide-scrollbar' tabs>
          <NavItem>
            <NavLink
              className={classnames({
                active: currentTab === 'emailTemplate',
              })}
              onClick={() => {
                setCurrentTab('emailTemplate');
              }}
              id='emailTemplate'
            >
              Email Template
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: currentTab === 'smsTemplate',
              })}
              onClick={() => {
                setCurrentTab('smsTemplate');
              }}
              id={`smsTemplate`}
            >
              SMS Template
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: currentTab === 'checklistTemplate',
              })}
              onClick={() => {
                setCurrentTab('checklistTemplate');
              }}
              id={`checklistTemplate`}
            >
              Checklist Folders
            </NavLink>
          </NavItem>
          {/* {isSuperAdmin() && (
            <NavItem>
              <NavLink
                className={classnames({
                  active: currentTab === 'interCommunicationTemplate',
                })}
                onClick={() => {
                  setCurrentTab('interCommunicationTemplate');
                }}
                id={`interCommunicationTemplate`}
              >
                Internal Communication Templates
              </NavLink>
            </NavItem>
          )} */}
        </Nav>
        <ButtonGroup className={''}>
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

      {/* Email Templates */}
      <UILoader blocking={mailTemplateLoading}>
        <UILoader blocking={deleteLoading} loader={<></>}>
          <Card className='company-template-tab-card'>
            <TabContent activeTab={currentTab}>
              <TabPane tabId='emailTemplate'>
                {activeView === 'grid' ? (
                  <div>
                    <CardHeader>
                      <CardTitle tag='h4' className=''>
                        Email Templates
                      </CardTitle>
                      <Button
                        className='ms-2'
                        color='primary'
                        onClick={() => {
                          setTemplateType('email');
                          setShowForm(true);
                        }}
                      >
                        <Plus size={15} />
                        <span className='align-middle ms-50'>Add New</span>
                      </Button>
                    </CardHeader>
                    <CardBody className='py-1'>
                      <div className='company-email-inner-scroll hide-scrollbar'>
                        <Row className='company-email-temp-card-row'>
                          {emailTemplates && emailTemplates.length > 0 ? (
                            emailTemplates
                              .filter((t) => !t?.isAutoResponderTemplate)
                              .map((item, key) => (
                                <Col
                                  className='company-email-temp-card-col'
                                  md='4'
                                  key={key}
                                >
                                  <EmailTemplateCard
                                    item={item}
                                    openPreview={openPreview}
                                    cloneTemplateDetails={cloneTemplateDetails}
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
                    ExportData={<ExportData model='emailTemplate' />}
                    showCard={false}
                    buttonTitle={'Create New'}
                    hideButton={false}
                    onClickAdd={() => {
                      setTemplateType('email');
                      setShowForm(true);
                    }}
                    columns={columns}
                    data={emailTemplates.filter(
                      (t) => !t?.isAutoResponderTemplate
                    )}
                    title={'Email Templates'}
                    itemsPerPage={10}
                    selectableRows={false}
                  />
                )}
              </TabPane>
              <TabPane tabId='smsTemplate'>
                {activeView === 'grid' ? (
                  <>
                    <CardHeader>
                      <CardTitle tag='h4' className=''>
                        SMS Templates
                      </CardTitle>
                      <Button
                        className='ms-2'
                        color='primary'
                        onClick={() => {
                          setTemplateType('sms');
                          setShowForm(true);
                        }}
                      >
                        <Plus size={15} />
                        <span className='align-middle ms-50'>Add New</span>
                      </Button>
                    </CardHeader>
                    <CardBody className='py-1'>
                      <div className='company-sms-inner-scroll hide-scrollbar'>
                        <Row className='company-sms-temp-card-row'>
                          {smsTemplates && smsTemplates.length > 0 ? (
                            smsTemplates.map((item, key) => (
                              <Col
                                className='company-sms-temp-card-col'
                                md='4'
                                key={key}
                              >
                                <SmsTemplateCard
                                  item={item}
                                  openPreview={openPreview}
                                  cloneTemplateDetails={cloneTemplateDetails}
                                  setEditItem={setEditItem}
                                  setTemplateType={setTemplateType}
                                  setShowForm={setShowForm}
                                  handleConfirmDelete={handleConfirmDelete}
                                  sendTestSMS={sendTestSMS}
                                />
                              </Col>
                            ))
                          ) : (
                            <div className='d-flex justify-content-center m-4'>
                              <span className='no-data-found'>
                                {!smsTemplateLoading &&
                                  'No SMS template found!'}
                              </span>
                            </div>
                          )}
                        </Row>
                      </div>
                    </CardBody>
                  </>
                ) : (
                  <ItemTable
                    ExportData={<ExportData model='smsTemplate' />}
                    showCard={false}
                    hideButton={false}
                    buttonTitle='Create New'
                    onClickAdd={() => {
                      setTemplateType('sms');
                      setShowForm(true);
                    }}
                    columns={smsColumns}
                    data={smsTemplates}
                    title={'SMS Templates'}
                    itemsPerPage={10}
                    selectableRows={false}
                  />
                )}
              </TabPane>
              {/* {isSuperAdmin() && (
                <>
                  <TabPane tabId='interCommunicationTemplate'>
                    {activeView === 'grid' ? (
                      <div>
                        <CardHeader>
                          <CardTitle
                            tag='h4'
                            className='text-primary'
                          ></CardTitle>
                        </CardHeader>
                        <CardBody className='pb-0'>
                          <Row>
                            {autoResponderTemplate.length ? (
                              autoResponderTemplate.map((item, key) => (
                                <Col md='4' key={key}>
                                  <EmailTemplateCard
                                    item={item}
                                    openPreview={openPreview}
                                    cloneTemplateDetails={cloneTemplateDetails}
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
                                  {!mailTemplateLoading && 'No template found!'}
                                </span>
                              </div>
                            )}
                          </Row>
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
              )} */}
              <TabPane tabId='checklistTemplate'>
                <ChecklistTemplateList activeView={activeView} />
              </TabPane>
            </TabContent>
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

      {/* Send Test SMS Modal */}
      <SendTestSMSModal
        openSmsModal={openSmsModal}
        setCurrentTemplates={setCurrentTemplates}
        setOpenSmsModal={setOpenSmsModal}
        currentTemplates={currentTemplates}
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
