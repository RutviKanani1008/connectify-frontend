import React, { Fragment, useEffect, useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionBody,
  Card,
  CardHeader,
  CardBody,
  UncontrolledTooltip,
  AccordionHeader,
} from 'reactstrap';
import UILoader from '@components/ui-loader';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import ItemTable from '../../../@core/components/data-table';
import { userData } from '../../../redux/user';
import { useSelector } from 'react-redux';
import { deleteTag } from '../../../api/company';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Eye, Trash, ChevronDown } from 'react-feather';
import {
  getContactDetails,
  updateContactAndFormDetails,
} from '../../../api/contacts';
import CustomSelect from '../../../@core/components/form-fields/CustomSelect';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import useGroupPersist from './hooks/useGroupPersist';
import {
  useDeleteFolder,
  useGetFolders,
  useGetGroups,
  useGetTags,
  useUpdateTagFolder,
} from './hooks/groupApis';
import AddTagsModal from './components/AddTagsModal';
import EditFolderModal from '../folders/components/EditFolderModal';
import ExportData from '../../../components/ExportData';
import moment from 'moment';
import NoRecordFound from '../../../@core/components/data-table/NoRecordFound';
import { useDraggable } from '../../../@core/components/data-table/hooks/useDragging';
import SortableTable from '../../../@core/components/data-table/SortableTable';

const Tags = () => {
  const params = useParams();
  const [initialGroup, setInitialGroup] = useGroupPersist();

  const [groupName, setGroupName] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const [tags, setTags] = useState([]);
  const user = useSelector(userData);
  const [openTagModal, setOpenTagModal] = useState(false);
  const [currentFolders, setCurrentFolders] = useState([]);
  const [isUpdateTag, setIsUpdateTag] = useState(false);
  const [fetchContactLoading, setFetchContactLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [openShowContactModel, setOpenShowContactModel] = useState(false);
  const [deleteTagModal, setDeleteTagModal] = useState(false);
  const [deleteTagObj, setDeleteTagObj] = useState(false);
  const [remainingTags, setRemainingTags] = useState([]);
  const [selectedNewTag, setSelectedNewTag] = useState(null);
  const [newTagsShowError, setNewTagsShowError] = useState(false);
  const [deleteTagLoadingId, setDeleteTagLoadingId] = useState('');
  const { getTags, isLoading: tagsLoading } = useGetTags();
  const [currentFolderTags, setCurrentFolderTags] = useState([]);

  const { onDragEnd, sortableHandle } = useDraggable({
    originalDataList: currentFolderTags,
    setOriginalDataList: (newList) => {
      setCurrentFolderTags(newList);
    },
    model: 'category',
  });

  const { getFolders, isLoading: folderLoading } = useGetFolders();
  const { getGroups, isLoading: groupLoading } = useGetGroups();
  const { deleteFolder } = useDeleteFolder();
  const [open, setOpen] = useState();

  const getGroupNames = async () => {
    setFetchContactLoading(false);
    setDeleteTagLoadingId(false);
    const { data, error } = await getGroups({
      company: user.company._id,
      active: true,
    });

    if (!error) {
      const groups = [];
      data?.forEach((group) => {
        const obj = {};
        obj['value'] = group._id;
        obj['label'] = group.groupName;
        groups.push(obj);
      });
      if (groups && groups.length > 0) {
        if (!selectedGroup || selectedGroup?.value === 'unAssigned') {
          setInitialGroup(groups[0]);
          setSelectedGroup(groups[0]);
        }
      }
      setGroupName(groups);
    }
  };

  const getFoldersDetails = async () => {
    if (selectedGroup?.value !== 'unAssigned') {
      const { data, error } = await getFolders({
        company: user.company._id,
        folderFor: 'tags',
        model: 'group',
        modelRecordId:
          !selectedGroup?.value || selectedGroup.value === ''
            ? null
            : selectedGroup.value,
      });
      if (!error) {
        setCurrentFolders([
          { folderName: 'Unassigned', _id: 'unassigned' },
          ...data,
        ]);
      }
    }
  };

  useEffect(() => {
    getGroupNames();
  }, [params]);

  useEffect(() => {
    getFoldersDetails();
  }, [selectedGroup]);

  const handleConfirmDelete = async (id = null) => {
    if (selectedNewTag) {
      setNewTagsShowError(false);
    } else {
      setNewTagsShowError(true);
    }
    const contactId = [];
    contacts.forEach((c) => contactId.push(c._id));
    const obj = {};
    obj.contacts = contactId;
    obj.tag = selectedNewTag;
    obj.oldTagId = deleteTagObj._id;

    if (!id && obj && contactId.length > 0 && selectedNewTag) {
      await updateContactAndFormDetails(obj);
    }

    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Tag?',
      confirmButtonText: 'Yes',
      inputAttributes: {
        autocapitalize: 'off',
      },
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      showLoaderOnConfirm: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
        loader: 'custom-loader',
      },
      preConfirm: () => {
        return deleteTag(deleteTagObj._id ? deleteTagObj._id : id).then(
          (res) => {
            if (res?.data?.data) {
              setDeleteTagModal(false);
              setRemainingTags([]);
              setDeleteTagObj(false);
              setSelectedNewTag(false);
              setNewTagsShowError(false);
            }
          }
        );
      },
    });
    if (result.isConfirmed) {
      getAllTags({ _id: open });
    }
  };

  const handleEditTag = (id) => {
    const selectTag = currentFolderTags.find((Tag) => Tag._id === id);
    if (selectTag && selectTag.tagName) {
      setIsUpdateTag(selectTag);
      setOpenTagModal(!openTagModal);
    }
  };

  const [updateFolder, setUpdateFolder] = useState(false);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const handleEditFolderName = (folder) => {
    setUpdateFolder(folder);
    setOpenFolderModal(!openFolderModal);
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e);
    setInitialGroup(e);
  };

  useEffect(() => {
    if (open) {
      getAllTags({ _id: open });
    }
  }, [selectedGroup]);

  const childDropdown = (
    <CustomSelect
      classNamePrefix='custom-select'
      value={selectedGroup}
      options={[
        // {
        //   value: '',
        //   label: 'Unassigned',
        // },
        ...groupName,
      ]}
      onChange={(e) => {
        handleGroupChange(e);
      }}
      label='Select Group'
    />
  );

  const getContacts = async (row, isDelete = false) => {
    try {
      setFetchContactLoading(true);

      if (isDelete) {
        setDeleteTagLoadingId(row?._id);
        setDeleteTagObj(row);
        const tempTags = tags.filter(
          (s) => s._id !== row?._id && s._id !== 'unassignedItem'
        );
        const temp = [];
        tempTags.forEach((tag) => {
          const obj = {};
          obj.id = tag._id;
          obj.value = tag.tagId;
          obj.label = tag.tagName;
          temp.push(obj);
        });
        setRemainingTags(temp);
      } else {
        setOpenShowContactModel(true);
      }

      if (row._id !== 'unassignedItem') {
        const contact = await getContactDetails({
          'group.id': selectedGroup?.value || '',
          company: user.company._id,
          tags: row._id,
          select: 'firstName,lastName,email,phone',
          archived: false,
        });

        if (contact.data.data.length === 0 && isDelete) {
          handleConfirmDelete(row._id);
        } else {
          setDeleteTagModal(isDelete);
          setContacts(contact.data.data);
        }
        setFetchContactLoading(false);
        setDeleteTagLoadingId('');
      } else {
        const contact = await getContactDetails({
          'group.id': selectedGroup?.value || '',
          company: user.company._id,
          tags: 'null',
          select: 'firstName,lastName,email,phone',
          archived: false,
        });
        setContacts(contact.data.data);
        setFetchContactLoading(false);
        setDeleteTagLoadingId('');
      }
    } catch (error) {
      console.log({ error });
      setDeleteTagLoadingId('');
    }
  };

  const clearShowContactModal = () => {
    setOpenShowContactModel(false);
    setContacts([]);
  };

  const clearDeleteTagModal = () => {
    const temp = tags;
    temp.forEach((c) => {
      if (c._id === deleteTagObj._id) {
        c.loading = false;
      }
    });
    setTags(temp);
    setDeleteTagModal(false);
    setContacts([]);
  };

  const contactColumn = [
    {
      name: 'First Name',
      minWidth: '250px',
      sortable: (row) => row?.firstName,
      selector: (row) => row?.firstName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.firstName ? row?.firstName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Last Name',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.lastName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.lastName ? row?.lastName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Email',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.email,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.email}</span>
          </div>
        );
      },
    },
    {
      name: 'Phone',
      sortable: true,
      minWidth: '150px',
      selector: (row) => row?.phone,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.phone ? row?.phone : '-'}
            </span>
          </div>
        );
      },
    },
  ];

  const tagColumns = [
    {
      name: 'Tag Name',
      minWidth: '250px',
      isSearchable: true,
      sortable: (row) => row?.tagName,
      selector: (row) => row?.tagName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.tagName ? row?.tagName : '-'}
            </span>
          </div>
        );
      },
    },
  ];

  const tagsDetailColumns = [
    {
      name: 'Tag Name',
      minWidth: '250px',
      searchKey: 'tagName',
      isSearchable: true,
      // sortable: (row) => row?.tagName,
      selector: (row) => row?.tagName,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.tagName ? row?.tagName : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Action',
      minWidth: '250px',
      maxWidth: '300px',
      cell: (row) => {
        return (
          <div className='action-btn-wrapper'>
            <div className='action-btn edit-btn'>
              <Edit2
                size={15}
                // color={'#64c664'}
                color={'#000000'}
                className={'cursor-pointer'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTag(row?._id);
                }}
                id={`edit_${row?._id}`}
              />
            </div>
            <UncontrolledTooltip placement='top' target={`edit_${row?._id}`}>
              Edit
            </UncontrolledTooltip>
            <div className='action-btn view-btn'>
              <Eye
                color={'#000000'}
                size={15}
                className={'cursor-pointer'}
                onClick={(e) => {
                  e.stopPropagation();
                  getContacts(row);
                }}
                id={`view_${row?._id}`}
              ></Eye>
              <UncontrolledTooltip placement='top' target={`view_${row?._id}`}>
                View Contacts
              </UncontrolledTooltip>
            </div>
            {deleteTagLoadingId && deleteTagLoadingId === row?._id ? (
              <>
                <div className='action-btn spinner-btn'>
                  <Spinner className='' size='sm' />
                </div>
              </>
            ) : (
              <div className='action-btn spinner-btn'>
                <Trash
                  color={'red'}
                  size={15}
                  className='cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    getContacts(row, true);
                  }}
                  id={`delete_${row?._id}`}
                />
              </div>
            )}
            <UncontrolledTooltip placement='top' target={`delete_${row?._id}`}>
              Delete
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  const closeTagsModal = () => {
    setOpenTagModal(false);
    setIsUpdateTag(false);
  };
  const closeFolderModal = () => {
    setOpenFolderModal(false);
    setUpdateFolder(false);
  };
  const accordionToggle = (folder) => {
    if (open === folder._id) {
      setOpen();
    } else {
      getAllTags(folder);
      setOpen(folder._id);
    }
  };

  const getAllTags = async (folder) => {
    const { data, error } = await getTags({
      groupId: selectedGroup?.value || null,
      company: user.company._id,
      folder: folder._id === 'unassigned' ? null : folder?._id,
    });
    if (!error) {
      setCurrentFolderTags(data);
    }
  };

  const [currentDeleteFolder, setCurrentDeleteFolder] = useState({
    tags: [],
    isModal: false,
    editFolder: false,
    newSelected: null,
    error: null,
  });
  const handleDeleteFolder = async (currentFolder) => {
    const { data, error } = await getTags({ folder: currentFolder?._id });
    if (!error) {
      if (data.length) {
        setCurrentDeleteFolder({
          tags: data,
          isModal: true,
          editFolder: currentFolder,
          newSelected: null,
        });
      } else {
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
    }
  };

  const clearDeleteFolderModal = () => {
    setCurrentDeleteFolder({
      tags: [],
      isModal: false,
      editFolder: false,
    });
  };
  const { updateTagFolder } = useUpdateTagFolder();

  const handleMoveAndDeleteFolder = async () => {
    const obj = {};
    obj.tags = currentDeleteFolder.tags?.map((folder) => folder?._id);
    obj.folder = currentDeleteFolder.newSelected?.value;
    const { error } = await updateTagFolder(obj);
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
    }
  };
  return (
    <>
      <div className='contact-tags-page'>
        <UILoader blocking={groupLoading || folderLoading}>
          <Card className='rdt_Table_Card'>
            <CardHeader className='card-header-with-buttons'>
              <h4 className='title card-title'>Tags</h4>
              <div className='d-inline-flex justify-content-end'>
                <span
                  className={`create-folder-link`}
                  onClick={() => {
                    setUpdateFolder({
                      _id: 'newFolder',
                    });
                    setOpenFolderModal(!openFolderModal);
                  }}
                >
                  <span>Create new Folder</span>
                </span>
                {childDropdown}
                <div className='button-wrapper ms-1'>
                  {selectedGroup?.value && (
                    <ExportData
                      model='tag'
                      query={{
                        groupId: selectedGroup?.value,
                        company: user.company._id,
                      }}
                    />
                  )}
                  <Button
                    className='add-btn btn btn-primary'
                    color='primary'
                    onClick={() => setOpenTagModal(true)}
                  >
                    <Plus size={15} />
                    <span className='align-middle ms-50'>Add New Tag</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className='contact-tags-scroll-area hide-scrollbar'>
                {currentFolders?.length > 0 ? (
                  currentFolders
                    ?.sort(
                      ({ createdAt: a }, { createdAt: b }) =>
                        moment(b) - moment(a)
                    )
                    ?.map((folder, index) => {
                      return (
                        <Fragment key={index}>
                          <Accordion
                            className='accordion-margin contact-tags-accordion'
                            open={open}
                            toggle={() => {
                              accordionToggle(folder);
                            }}
                          >
                            <AccordionItem>
                              <AccordionHeader targetId={`${folder?._id}`}>
                                <h3 className='title'>{folder.folderName}</h3>
                                <div className='action-btn-wrapper'>
                                  {folder?._id !== 'unassigned' && (
                                    <>
                                      <div className='action-btn edit-btn'>
                                        <Edit2
                                          size={15}
                                          color='#000000'
                                          // color={'#64c664'}
                                          className={'cursor-pointer'}
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
                                      <div className='action-btn edit-btn'>
                                        <Trash
                                          color={'red'}
                                          size={15}
                                          className='cursor-pointer'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFolder(folder);
                                            // handleEditFolderName(folder);
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
                                  <div className='action-btn down-arrow-btn'>
                                    <ChevronDown
                                      color='#000000'
                                      className=''
                                      size={34}
                                    />
                                  </div>
                                </div>
                              </AccordionHeader>
                              <AccordionBody accordionId={folder?._id}>
                                {tagsLoading ? (
                                  <>
                                    <li className='todo-item d-flex align-items-center justify-content-center mt-1'>
                                      <Spinner />
                                    </li>
                                  </>
                                ) : currentFolderTags?.length > 0 ? (
                                  <SortableTable
                                    showCard={false}
                                    columns={tagsDetailColumns}
                                    data={currentFolderTags}
                                    onDragEnd={onDragEnd}
                                    title={''}
                                    itemsPerPage={10}
                                    hideButton={true}
                                    ref={
                                      open === folder._id
                                        ? sortableHandle
                                        : undefined
                                    }
                                    hideExport={true}
                                  />
                                ) : (
                                  <NoRecordFound />
                                )}
                              </AccordionBody>
                            </AccordionItem>
                          </Accordion>
                        </Fragment>
                      );
                    })
                ) : (
                  <>
                    <>
                      <NoRecordFound />
                    </>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </UILoader>
      </div>
      {openTagModal && (
        <AddTagsModal
          openTagModal={openTagModal}
          currentFolders={currentFolders}
          closeTagsModal={closeTagsModal}
          selectedGroup={selectedGroup}
          setCurrentFolders={setCurrentFolders}
          isUpdateTag={isUpdateTag}
          currentFolderTags={currentFolderTags}
          setCurrentFolderTags={(newList) => {
            setCurrentFolderTags(newList);
          }}
          currentOpenFolder={open}
        />
      )}
      {openFolderModal && (
        <EditFolderModal
          updateFolderDetail={updateFolder}
          openFolderModal={openFolderModal}
          setOpenFolderModal={setOpenFolderModal}
          closeFolderModal={closeFolderModal}
          selectedGroup={selectedGroup}
          currentFolders={currentFolders}
          setCurrentFolders={setCurrentFolders}
          modelType={'group'}
          contactId={
            !selectedGroup?.value || selectedGroup.value === ''
              ? null
              : selectedGroup.value
          }
        />
      )}
      <Modal
        isOpen={openShowContactModel}
        toggle={() => {
          clearShowContactModal();
        }}
        className={`modal-dialog-centered contact-tags-view-modal modal-dialog-mobile`}
        size='xl'
        backdrop='static'
      >
        <ModalHeader toggle={() => clearShowContactModal()}>
          Related Contacts
        </ModalHeader>
        <ModalBody>
          <Fragment>
            {fetchContactLoading ? (
              <>
                <div className='mb-2 text-primary text-center'>
                  <Spinner color='primary' />
                </div>
              </>
            ) : contacts && contacts.length > 0 ? (
              <>
                <ItemTable
                  showHeader={false}
                  showCard={false}
                  columns={contactColumn}
                  data={contacts}
                  title={''}
                  addItemLink={false}
                  hideButton={true}
                  itemsPerPage={10}
                  hideExport={false}
                />
              </>
            ) : contacts.length === 0 ? (
              <>
                <NoRecordFound />
              </>
            ) : null}
          </Fragment>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' onClick={() => clearShowContactModal()}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={deleteTagModal}
        toggle={() => {
          clearDeleteTagModal();
        }}
        className='modal-dialog-centered  preview-dialog'
        size='xl'
        backdrop='static'
      >
        <ModalHeader toggle={() => clearDeleteTagModal()}>
          Delete Tag
        </ModalHeader>
        <ModalBody>
          {fetchContactLoading ? (
            <>
              <div className='mb-2 text-primary text-center'>
                <Spinner color='primary' />
              </div>
            </>
          ) : contacts && contacts.length > 0 ? (
            <>
              <div>
                <ItemTable
                  columns={contactColumn}
                  data={contacts}
                  title={`Below contacts are related with ${deleteTagObj?.tagName}, please select new tag in which you want to move these contacts to.`}
                  addItemLink={false}
                  hideButton={true}
                  itemsPerPage={10}
                  hideExport={false}
                  showCard={false}
                />
              </div>
              <div className='d-flex mx-2 align-items-center justify-content-center'>
                <h5 className='mx-1 text-primary '>Select New Tag</h5>
                <div>
                  <Select
                    id={'group_details'}
                    theme={selectThemeColors}
                    style={{ width: '20%' }}
                    placeholder={'Select Tags'}
                    classNamePrefix='select tag-select-border'
                    options={remainingTags}
                    value={selectedNewTag}
                    isClearable={false}
                    onChange={(e) => {
                      setSelectedNewTag(e);
                    }}
                    isMulti={false}
                    isOptionSelected={(option, selectValue) =>
                      selectValue.some((i) => i === option)
                    }
                    isDisabled={false}
                  />
                  {newTagsShowError ? (
                    <>
                      <div className='text-danger'>Please Enter Tag...</div>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : contacts.length === 0 ? (
            <>
              <div className='mb-3 text-primary text-center'>
                <h3>Are you sure You want to delete this tag?</h3>
              </div>
            </>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            disabled={selectedNewTag ? false : true}
            onClick={() => {
              selectedNewTag
                ? handleConfirmDelete()
                : setNewTagsShowError(true);
            }}
          >
            Delete Tag
          </Button>
          <Button color='danger' onClick={() => clearDeleteTagModal()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={currentDeleteFolder.isModal}
        toggle={() => {
          clearDeleteFolderModal();
        }}
        className='modal-dialog-centered delete-folder-modal modal-dialog-mobile'
        size='lg'
        backdrop='static'
        fade={false}
      >
        <ModalHeader toggle={() => clearDeleteFolderModal()}>
          Delete Folder
        </ModalHeader>
        <ModalBody>
          {fetchContactLoading ? (
            <>
              <div className='mb-2 text-primary text-center'>
                <Spinner color='primary' />
              </div>
            </>
          ) : currentDeleteFolder.tags &&
            currentDeleteFolder.tags.length > 0 ? (
            <>
              <div className='delete-folder-card'>
                <div className='select-new-folder-wrapper'>
                  <label className='form-label form-label'>
                    Select New Folder
                  </label>
                  <div className='table__page__limit'>
                    <Select
                      className={`${currentDeleteFolder?.error ? 'error' : ''}`}
                      id={'group_details'}
                      theme={selectThemeColors}
                      style={{ width: '20%' }}
                      placeholder={'Select Folder'}
                      classNamePrefix='table__page__limit'
                      options={currentFolders
                        ?.filter(
                          (folder) =>
                            folder._id !== currentDeleteFolder.editFolder?._id
                        )
                        ?.map((folder) => {
                          return {
                            label: folder?.folderName,
                            value: folder?._id,
                          };
                        })}
                      value={currentDeleteFolder.newSelected}
                      isClearable={false}
                      onChange={(e) => {
                        // setSelectedNewTag(e);
                        setCurrentDeleteFolder({
                          ...currentDeleteFolder,
                          newSelected: e,
                        });
                      }}
                      isMulti={false}
                      isOptionSelected={(option, selectValue) =>
                        selectValue.some((i) => i === option)
                      }
                      isDisabled={false}
                    />
                  </div>
                  {currentDeleteFolder?.error ? (
                    <>
                      <div className='text-danger'>Please Enter folder...</div>
                    </>
                  ) : null}
                </div>
                <ItemTable
                  columns={tagColumns}
                  data={currentDeleteFolder.tags}
                  title={`Below tags are in ${currentDeleteFolder.editFolder?.folderName}, please select new folder in which you want to move these tags to.`}
                  addItemLink={false}
                  hideButton={true}
                  itemsPerPage={10}
                  hideExport={true}
                  showCard={false}
                />
              </div>
            </>
          ) : contacts.length === 0 ? (
            <>
              <div className='mb-3 text-primary text-center'>
                <h3>Are you sure You want to delete this tag?</h3>
              </div>
            </>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            disabled={currentDeleteFolder?.newSelected ? false : true}
            onClick={() => {
              if (!currentDeleteFolder?.newSelected) {
                setCurrentDeleteFolder({
                  ...currentDeleteFolder,
                  error: true,
                });
              } else {
                handleMoveAndDeleteFolder();
              }
            }}
          >
            Delete Folder
          </Button>
          <Button color='danger' onClick={() => clearDeleteFolderModal()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Tags;
