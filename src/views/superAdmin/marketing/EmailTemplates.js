import classNames from 'classnames';
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Edit2,
  Grid,
  List,
  Plus,
  PlusCircle,
  Trash,
} from 'react-feather';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';

import { TemplateForm } from '../../templates/TemplateForm';
import EmailTemplatePreviewModal from '../inter-communication-template/components/EmailTemplatePreviewModal';
import { useEmailTemplateColumns } from './hooks/useTemplateColumns';
import { TOASTTYPES, showToast } from '../../../utility/toast-helper';
import {
  cloneEmailTemplate,
  deleteEmailTemplate,
  sendTestEmailTemplate,
} from '../../../api/emailTemplates';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import SendTestEmailModal from '../../templates/components/SendTestEmailModal';
import { validateEmail } from '../../../utility/Utils';
import EmailTemplateListView from './EmailTemplateListView';
import EmailTemplateGridView from './EmailTemplateGridView';
import { storeCompanyDetails, userData } from '../../../redux/user';
import { useDispatch, useSelector } from 'react-redux';
import EditFolderModal from '../../Admin/folders/components/EditFolderModal';
import UILoader from '../../../@core/components/ui-loader';
import {
  useDeleteFolder,
  useGetFolders,
} from '../../Admin/groups/hooks/groupApis';
import {
  useGetEmailTemplates,
  useUpdateEmailTempleteFolder,
} from './hooks/useApis';
import _ from 'lodash';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import DeleteFolderDetails from '../../Admin/contact/components/DeleteFolderDetails';
const MySwal = withReactContent(Swal);

const EmailTemplates = () => {
  const [activeView, setActiveView] = useState('grid');
  const [showForm, setShowForm] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentEmails, setCurrentEmails] = useState([]);
  const [currentTemplates, setCurrentTemplates] = useState(false);
  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [dataKey, setDataKey] = useState(Math.random());
  const listView = useRef(null);
  const [updateFolder, setUpdateFolder] = useState(false);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [currentFolders, setCurrentFolders] = useState([]);
  const [folderController, setFolderController] = useState(null);
  const [currentDeleteFolder, setCurrentDeleteFolder] = useState({
    results: [],
    isModal: false,
    editFolder: false,
    newSelected: null,
    error: null,
  });
  const [defaultFolder, setDefaultFolder] = useState(null);

  const user = useSelector(userData);
  const [availableFolderDetails, setAvailableFolderDetails] = useState([]);
  const [open, setOpen] = useState();
  const dispatch = useDispatch();
  const {
    getEmailTemplates: getEmailTemplatesApi,
    isLoading: emailTemplatesLoading,
  } = useGetEmailTemplates();
  const { deleteFolder } = useDeleteFolder();
  const { updateEmailTemplateFolder } = useUpdateEmailTempleteFolder();

  const columns = useEmailTemplateColumns({
    onPreview: openPreview,
    onClone: cloneTemplateDetails,
    onSend: sendTestMail,
    onEdit: (row) => {
      setEditItem({
        ...row,
        folder: row.folder?._id
          ? {
              id: row.folder?._id,
              value: row.folder?._id,
              label: row.folder?.folderName,
            }
          : null,
      });
      // setEditItem(row);
      setShowForm(true);
    },
    onDelete: handleConfirmDelete,
  });

  function sendTestMail(item) {
    setCurrentTemplates(item);
    setOpenModal(true);
  }

  // ** APIS **
  const { getFolders, isLoading: folderLoading } = useGetFolders();

  const getFoldersDetails = async () => {
    let tempController = folderController;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setFolderController(tempController);
    const { data, error } = await getFolders(
      {
        company: user.company._id,
        folderFor: 'mass-email-template',
        // ...(searchVal && searchVal !== '' && { search: searchVal }),
      },
      tempController.signal
    );

    if (!error && data) {
      if (!availableFolderDetails.length) {
        setAvailableFolderDetails(data);
      }
      setCurrentFolders([...data]);
    }
  };

  useEffect(() => {
    getFoldersDetails();
  }, []);

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
        dispatch(
          storeCompanyDetails({
            defaultTestMailConfig: {
              receiver: values?.emails?.map((email) => email?.value),
              senderName: values?.fromName,
              senderEmail: values?.fromEmail,
            },
          })
        );
      }
      setOpenModal(!openModal);
      setCurrentTemplates(false);
      setCurrentEmails([]);
      setShowError(false);
    });
  };

  function cloneTemplateDetails(id, type) {
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

        cloneEmailTemplate(id).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            if (res.data.data) {
              setDataKey(Math.random());
              listView.current && listView.current.refreshTable();
              const { folder = null } = res.data.data;
              if (type === 'email') {
                if (folder) {
                  setCurrentFolders([
                    ...currentFolders.map((individualFolder) => {
                      if (individualFolder._id === folder) {
                        individualFolder.totalCounts =
                          individualFolder.totalCounts + 1;
                      }
                      return individualFolder;
                    }),
                  ]);
                } else {
                  setCurrentFolders([
                    ...currentFolders.map((individualFolder) => {
                      if (individualFolder._id === 'unassigned') {
                        individualFolder.totalCounts =
                          individualFolder.totalCounts + 1;
                      }
                      return individualFolder;
                    }),
                  ]);
                }
              }
              showToast(
                TOASTTYPES.success,
                toastId,
                'Template Cloned Successfully'
              );
            }
          }
        });
      }
    });
  }

  function handleConfirmDelete(item, type) {
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
        const toastId = showToast(TOASTTYPES.loading, '', 'Deleting...');
        deleteEmailTemplate(item._id)
          .then((res) => {
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              setDataKey(Math.random());
              listView.current && listView.current.removeRecordRefreshTable();
              if (type === 'email') {
                if (item.folder) {
                  setCurrentFolders([
                    ...currentFolders.map((individualFolder) => {
                      if (individualFolder._id === item.folder) {
                        individualFolder.totalCounts =
                          individualFolder.totalCounts - 1;
                      }
                      return individualFolder;
                    }),
                  ]);
                } else {
                  setCurrentFolders([
                    ...currentFolders.map((individualFolder) => {
                      if (individualFolder._id === 'unassigned') {
                        individualFolder.totalCounts =
                          individualFolder.totalCounts - 1;
                      }
                      return individualFolder;
                    }),
                  ]);
                }
              }
              showToast(
                TOASTTYPES.success,
                toastId,
                'Template Deleted Successfully'
              );
            }
          })
          .catch(() => {});
      }
    });
  }

  const onSave = (data) => {
    if (!editItem) {
      if (data.folder) {
        setCurrentFolders([
          ...currentFolders.map((individualFolder) => {
            if (individualFolder._id === data.folder) {
              individualFolder.totalCounts = individualFolder.totalCounts + 1;
            }
            return individualFolder;
          }),
        ]);
      } else {
        setCurrentFolders([
          ...currentFolders.map((individualFolder) => {
            if (individualFolder._id === 'unassigned') {
              individualFolder.totalCounts = individualFolder.totalCounts + 1;
            }
            return individualFolder;
          }),
        ]);
      }
    } else {
      if (editItem && editItem?.folder?.id !== data.folder) {
        setCurrentFolders([
          ...currentFolders.map((individualFolder) => {
            if (individualFolder._id === editItem?.folder?.id) {
              individualFolder.totalCounts = individualFolder.totalCounts - 1;
            }
            return individualFolder;
          }),
        ]);
      }
    }
    setDataKey(Math.random());
    listView.current && listView.current.refreshTable();
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

  function openPreview(item) {
    setTemplatesPreview(item);
    setPreviewModal(true);
  }

  const closeFolderModal = () => {
    setOpenFolderModal(false);
    setUpdateFolder(false);
  };

  const accordionToggle = (folder) => {
    if (open === folder._id) {
      setOpen();
    } else {
      setOpen(folder._id);
    }
  };

  const handleEditFolderName = (folder) => {
    setUpdateFolder(folder);
    setOpenFolderModal(!openFolderModal);
  };

  const handleDeleteFolder = async (currentFolder) => {
    setCurrentDeleteFolder({
      results: [],
      isModal: false,
      editFolder: currentFolder,
      newSelected: null,
    });
    const { data, error } = await getEmailTemplatesApi({
      folder: currentFolder?._id,
      select:
        'name,company,subject,name,body,status,htmlBody,jsonBody,isAutoResponderTemplate,tags, folder',
      limit: 10000,
      page: 1,
    });

    if (!error && _.isArray(data?.results) && data?.results.length) {
      //
      setCurrentDeleteFolder({
        results: data?.results,
        isModal: true,
        editFolder: currentFolder,
        newSelected: null,
      });
    } else {
      clearDeleteFolderModal();
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: 'Are you sure you would like to delete this folder?',
      });

      if (result.value) {
        const { error } = await deleteFolder(
          currentFolder?._id,
          'Delete Folder..'
        );

        if (!error) {
          setCurrentFolders(
            currentFolders.filter(
              (folder) => folder?._id !== currentFolder?._id
            )
          );
        }
      }
    }
  };

  const clearDeleteFolderModal = () => {
    setCurrentDeleteFolder({
      results: [],
      isModal: false,
      editFolder: false,
      newSelected: null,
      error: null,
    });
  };

  const handleMoveAndDeleteFolder = async () => {
    const obj = {};
    obj.templateid = currentDeleteFolder.results?.map((folder) => folder?._id);
    obj.folder = currentDeleteFolder.newSelected?.value;
    const { error } = await updateEmailTemplateFolder(obj);
    if (!error) {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: 'Are you sure you would like to delete this folder?',
      });

      if (result.value) {
        const { error } = await deleteFolder(
          currentDeleteFolder?.editFolder?._id,
          'Delete Folder..'
        );

        if (!error) {
          setCurrentFolders(
            currentFolders.filter(
              (folder) => folder?._id !== currentDeleteFolder?.editFolder?._id
            )
          );
          clearDeleteFolderModal();
        }
      }
      getFoldersDetails();
    }
  };

  return (
    <>
      <UILoader blocking={folderLoading}>
        <Card className='email-template-card mass-email-template-card'>
          <CardHeader>
            <CardTitle tag='h4' className=''>
              Email Templates
            </CardTitle>
            <div className='right'>
              <div className='btns-wrapper d-flex align-items-center mt-md-0 mt-1'>
                <span
                  className={`create-folder-link`}
                  onClick={() => {
                    setUpdateFolder({
                      _id: 'newFolder',
                    });
                    setOpenFolderModal(!openFolderModal);
                  }}
                >
                  <span>Create A Folder</span>
                </span>
              </div>
              <Button
                className='ms-2'
                color='primary'
                onClick={() => {
                  setShowForm(true);
                }}
              >
                <Plus size={15} />
                <span className='align-middle ms-50'>Add New</span>
              </Button>
              <ButtonGroup className='grid-card-view-toggle-btns'>
                <Button
                  tag='label'
                  className={classNames('btn-icon view-btn grid-view-btn', {
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
                  className={classNames('btn-icon view-btn list-view-btn', {
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
          </CardHeader>
          <CardBody>
            {currentFolders?.length > 0 ? (
              currentFolders?.map((folder, index) => {
                return (
                  <Accordion
                    key={`${index}_direct_mail`}
                    className='mass-email-template-accordian'
                    open={open}
                    toggle={() => {
                      accordionToggle(folder);
                    }}
                  >
                    <AccordionItem className='mass-email-template-accordian-item'>
                      <AccordionHeader
                        className='accordian-header'
                        targetId={`${folder?._id}`}
                      >
                        <div className='name-count-wrapper'>
                          <div className='template-name'>
                            {folder.folderName}
                          </div>
                          <Badge color='primary' className='mx-1' pill>
                            {folder?.totalCounts || 0}
                          </Badge>
                        </div>
                        <div className='d-flex action-btn-wrapper'>
                          {currentDeleteFolder?.editFolder?._id ===
                            folder?._id && (
                            <div className='me-1 action-btn plus-btn'>
                              <Spinner size={'sm'} />
                            </div>
                          )}
                          <div
                            className='action-btn plus-btn me-1'
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowForm(true);
                              setDefaultFolder({
                                id: folder?._id,
                                label: folder.folderName,
                                value: folder?._id,
                              });
                            }}
                          >
                            <PlusCircle
                              size={20}
                              className='cursor-pointer'
                              id={`add_new${folder?._id}`}
                            />

                            <UncontrolledTooltip
                              placement='top'
                              target={`add_new${folder?._id}`}
                            >
                              Add Email Template
                            </UncontrolledTooltip>
                          </div>
                          {folder?._id !== 'unassigned' && (
                            <>
                              <div className='action-btn printer-btn'>
                                <Edit2
                                  size={15}
                                  // color={'#64c664'}
                                  className={'me-1 cursor-pointer'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFolderName(folder);
                                  }}
                                  id={`edit_folder_${folder?._id}`}
                                />
                                <UncontrolledTooltip
                                  placement='top'
                                  target={`edit_folder_${folder?._id}`}
                                >
                                  Edit
                                </UncontrolledTooltip>
                              </div>
                              <div className='action-btn printer-btn'>
                                <Trash
                                  color={'red'}
                                  size={15}
                                  className='me-1 cursor-pointer'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(folder);
                                  }}
                                  id={`delete_folder_${folder?._id}`}
                                />
                                <UncontrolledTooltip
                                  placement='top'
                                  target={`delete_folder_${folder?._id}`}
                                >
                                  Delete
                                </UncontrolledTooltip>
                              </div>
                            </>
                          )}
                        </div>
                        <div className='down-arrow'>
                          <ChevronDown />
                        </div>
                      </AccordionHeader>
                      <AccordionBody accordionId={folder?._id}>
                        {open === folder._id && (
                          <>
                            {activeView === 'grid' ? (
                              <>
                                <EmailTemplateGridView
                                  openPreview={openPreview}
                                  cloneTemplateDetails={cloneTemplateDetails}
                                  setEditItem={setEditItem}
                                  setShowForm={setShowForm}
                                  handleConfirmDelete={handleConfirmDelete}
                                  sendTestMail={sendTestMail}
                                  key={`${dataKey}_grid`}
                                  currentFolder={open}
                                />
                              </>
                            ) : (
                              <div className='email-template-list-view'>
                                <EmailTemplateListView
                                  columns={columns}
                                  onClickAdd={() => {
                                    setShowForm(true);
                                  }}
                                  currentFolder={open}
                                  ref={listView}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </AccordionBody>
                    </AccordionItem>
                  </Accordion>
                );
              })
            ) : (
              <>
                <>
                  <div className='d-flex justify-content-center m-4'>
                    <span className='no-data-found'>No Checklist Found</span>
                  </div>
                </>
              </>
            )}
          </CardBody>
        </Card>
      </UILoader>

      <TemplateForm
        isOpen={showForm}
        setIsOpen={setShowForm}
        templateType={'email'}
        values={editItem}
        setEditItem={setEditItem}
        onSave={onSave}
        availableFolderDetails={currentFolders}
        setAvailableFolderDetails={setCurrentFolders}
        defaultFolder={defaultFolder}
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

      {openFolderModal && (
        <EditFolderModal
          contactId={null}
          updateFolderDetail={updateFolder}
          openFolderModal={openFolderModal}
          setOpenFolderModal={setOpenFolderModal}
          closeFolderModal={closeFolderModal}
          currentFolders={currentFolders}
          setCurrentFolders={setCurrentFolders}
          type={'mass-email-template'}
        />
      )}

      {currentDeleteFolder.isModal && (
        <DeleteFolderDetails
          currentDeleteFolder={currentDeleteFolder}
          clearDeleteFolderModal={clearDeleteFolderModal}
          isLoading={emailTemplatesLoading}
          availableFolderDetails={currentFolders}
          setCurrentDeleteFolder={setCurrentDeleteFolder}
          handleMoveAndDeleteFolder={handleMoveAndDeleteFolder}
          deleteFolderType={'checklist template'}
          columnsDetails={[
            {
              name: 'Name',
              width: '80%',
              sortable: (row) => row?.name,
              selector: (row) => row?.name,
              cell: (row) => (
                <span className='text-capitalize cursor-pointer'>
                  {row.name}
                </span>
              ),
            },
            {
              name: 'Subject',
              width: '80%',
              sortable: (row) => row?.subject,
              selector: (row) => row?.subject,
              cell: (row) => (
                <span className='text-capitalize cursor-pointer'>
                  {row.subject}
                </span>
              ),
            },
          ]}
        />
      )}
    </>
  );
};

export default EmailTemplates;
