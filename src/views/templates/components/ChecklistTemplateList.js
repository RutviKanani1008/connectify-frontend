// ** Reactstrap Imports
import { Fragment, useEffect, useState, useRef, useCallback } from 'react';

// ** external packages **
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Badge,
  Button,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
import _ from 'lodash';
import {
  ArrowDownCircle,
  ChevronDown,
  Copy,
  Edit2,
  Eye,
  MoreVertical,
  Plus,
  PlusCircle,
  Printer,
  Trash,
  Link as LinkIcon,
  Users,
} from 'react-feather';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import { useReactToPrint } from 'react-to-print';
import update from 'immutability-helper';

// ** custom components
import UILoader from '@components/ui-loader';
import AddCheckListModal from './AddCheckListModal';

// ** hooks **
import {
  useCloneChecklistTemplate,
  useCopyChecklistToCompany,
  useCopyChecklistToContacts,
  useDeleteChecklistTemplate,
  useGetChecklistTemplates,
  useGetExportChecklistTemplates,
  useUpdateChecklistFolder,
  useUpdateChecklistOrder,
  useUpdateReOrderFolder,
} from '../hooks/checklistApis';
import ItemTable from '../../../@core/components/data-table';
import useChecklistColumns from '../hooks/useChecklistColumns';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import {
  useDeleteFolder,
  useGetFolders,
} from '../../Admin/groups/hooks/groupApis';
import EditFolderModal from '../../Admin/folders/components/EditFolderModal';
import ChecklistFolderToPrint from './ChecklistFolderToPrint';
import { baseURL } from '../../../api/axios-config';
import { downloadFile, encrypt } from '../../../helper/common.helper';
import { useDebounce } from '../../../hooks/useDebounce';
import CopyToClipboard from 'react-copy-to-clipboard';
import { TOASTTYPES, showToast } from '../../../utility/toast-helper';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ChecklistAccordianView } from './ChecklistAccordianView';
import AddChecklistToContactModal from './AddChecklistToContactModal';
import { useGetContactsByFilter } from '../../Admin/contact/service/contact.services';

const ChecklistTemplateList = ({ activeView, contactId, type }) => {
  console.log({ type });
  const printComponentRef = useRef();
  const printIndividualChecklistComponentRef = useRef();

  // ** states **
  const [checklistId, setChecklistId] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [defaultFolder, setDefaultFolder] = useState(null);
  const [checkListData, setCheckListData] = useState({
    checklistDetails: [],
    totalChecklist: 0,
  });
  const user = useSelector(userData);
  const [currentFolders, setCurrentFolders] = useState([]);
  const [printIndividualChecklist, setPrintIndividualChecklist] = useState([]);
  const [folderController, setFolderController] = useState(null);
  const [availableFolderDetails, setAvailableFolderDetails] = useState([]);

  const [addToContactListModalVisible, setAddToContactListModalVisible] =
    useState(false); // store checklist id
  const [contactList, setContactList] = useState({ results: [], total: 0 });

  const [currentPrinting, setCurrentPrinting] = useState({
    id: null,
    loader: false,
  });

  const [checklistPagination, setChecklistPagination] = useState({
    page: 1,
    limit: 6,
  });

  const [currentExportFile, setCurrentExportFile] = useState(false);

  // ** Custom Hooks **
  const { getChecklistTemplates, isLoading: checkListLoading } =
    useGetChecklistTemplates();

  const { getExportChecklistTemplates } = useGetExportChecklistTemplates();
  const { updateChecklistOrder } = useUpdateChecklistOrder();
  const { getFolders, isLoading: folderLoading } = useGetFolders();
  const { updateReOrderFolder } = useUpdateReOrderFolder();

  const { deleteChecklistTemplate } = useDeleteChecklistTemplate();
  const { cloneChecklistTemplate } = useCloneChecklistTemplate();
  const { deleteFolder } = useDeleteFolder();

  const [searchVal, setSearchVal] = useState(null);
  const debouncedSearchVal = useDebounce(searchVal);

  const { columns } = useChecklistColumns({
    handleConfirmClone,
    setChecklistId,
    handleConfirmDelete,
    setIsViewOnly,
  });

  const { getContacts, isLoading: loadingContacts } = useGetContactsByFilter();
  const { copyChecklistToCompany } = useCopyChecklistToCompany();

  const {
    copyChecklistToContacts,
    isLoading: assignChecklistToContactsLoading,
  } = useCopyChecklistToContacts();

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
  });

  useEffect(() => {
    if (contactId !== 'add') {
      getFoldersDetails();
    }
  }, [contactId, debouncedSearchVal]);

  useEffect(() => {
    if (contactId !== 'add') {
      if (open) {
        getChecklistTemplatesAPI({ _id: open });
      }
    }
  }, [contactId, activeView, debouncedSearchVal]);

  const getChecklistTemplatesAPI = async (
    folder,
    callType = null,
    pagination = {
      limit: 6,
      page: 1,
    }
  ) => {
    const { data, error } = await getChecklistTemplates({
      folder: folder?._id !== 'unassigned' ? folder?._id : null,
      ...(contactId ? { contact: contactId } : { contact: '' }),
      ...(searchVal && searchVal !== '' && { search: searchVal }),
      ...(activeView === 'grid' && pagination),
    });
    if (activeView === 'grid') {
      setChecklistPagination(pagination);
    }
    if (data && !error && _.isArray(data?.results)) {
      if (callType === 'delete' || callType === 'clone') {
        setCurrentFolders((prev) => {
          return prev.map((obj) =>
            String(obj._id) === String(folder?._id)
              ? {
                  ...obj,
                  totalData:
                    callType === 'delete'
                      ? obj?.totalData - 1
                      : obj.totalData + 1,
                }
              : { ...obj }
          );
        });
      }
      if (pagination.page !== 1) {
        setCheckListData({
          checklistDetails: [
            ...checkListData.checklistDetails,
            ...data?.results,
          ]?.sort(({ order: a }, { order: b }) => a - b),
          totalChecklist: data?.totalChecklist || 0,
        });
      } else {
        setCheckListData({
          checklistDetails: data?.results?.sort(
            ({ order: a }, { order: b }) => a - b
          ),
          totalChecklist: data?.totalChecklist || 0,
        });
      }
    }
  };

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
        folderFor: 'checklist',
        select: 'folderId,folderName,folderFor,order,totalData',
        ...(contactId
          ? {
              model: type,
              ...(contactId !== 'add' && { modelRecordId: contactId }),
            }
          : { model: null }),
        ...(searchVal && searchVal !== '' && { search: searchVal }),
      },
      tempController.signal
    );

    if (!error && data) {
      if (!availableFolderDetails.length) {
        setAvailableFolderDetails(data);
      }
      setCurrentFolders([...data].sort(({ order: a }, { order: b }) => a - b));
    }
  };

  function handleConfirmClone(id) {
    showWarnAlert({
      text: 'Are you sure you want to clone this checklist template?',
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      showLoaderOnConfirm: true,
      customClass: {
        cancelButton: 'btn btn-danger ms-1',
        confirmButton: 'btn btn-primary',
        loader: 'custom-loader',
      },
      preConfirm: () => {
        return cloneChecklistTemplate(id, {}, 'Cloning...').then(
          ({ error }) => {
            if (!error && open) {
              getChecklistTemplatesAPI({ _id: open }, 'clone');
            }
          }
        );
      },
    });
  }

  function handleConfirmDelete(item) {
    showWarnAlert({
      text: 'Are you sure you want to delete this checklist template?',
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      showLoaderOnConfirm: true,
      customClass: {
        cancelButton: 'btn btn-danger ms-1',
        confirmButton: 'btn btn-primary',
        loader: 'custom-loader',
      },
      preConfirm: () => {
        return deleteChecklistTemplate(item?._id).then(({ error }) => {
          if (!error) {
            getChecklistTemplatesAPI({ _id: item?.folder }, 'delete');
          }
        });
      },
    });
  }
  const [open, setOpen] = useState();

  const accordionToggle = (folder) => {
    setChecklistPagination({
      limit: 6,
      page: 1,
    });
    if (open === folder._id) {
      setOpen();
    } else {
      setCheckListData([]);
      getChecklistTemplatesAPI(folder, null, {
        limit: 6,
        page: 1,
      });
      setOpen(folder._id);
    }
  };

  const [updateFolder, setUpdateFolder] = useState(false);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const handleEditFolderName = (folder) => {
    setUpdateFolder(folder);
    setOpenFolderModal(!openFolderModal);
  };
  const closeFolderModal = () => {
    setOpenFolderModal(false);
    setUpdateFolder(false);
  };

  const [currentDeleteFolder, setCurrentDeleteFolder] = useState({
    checklist: [],
    isModal: false,
    editFolder: false,
    newSelected: null,
    error: null,
  });

  const { updateChecklistFolder } = useUpdateChecklistFolder();

  const handleDeleteFolder = async (currentFolder) => {
    const { data, error } = await getChecklistTemplates({
      folder: currentFolder?._id,
      contact: contactId,
    });
    if (!error) {
      if (data?.results?.length) {
        setCurrentDeleteFolder({
          checklist: data?.results,
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
      checklist: [],
      isModal: false,
      editFolder: false,
    });
  };

  const handleMoveAndDeleteFolder = async () => {
    const obj = {};
    obj.checklist = currentDeleteFolder.checklist?.map((folder) => folder?._id);
    obj.folder = currentDeleteFolder.newSelected?.value;
    const { error } = await updateChecklistFolder(obj);
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

  const handlePrintChecklistData = async (folderId) => {
    setOpen();
    setCurrentPrinting({ id: folderId, loader: true });

    const { data, error } = await getChecklistTemplates({
      folder: folderId,
      contact: contactId,
    });

    if (data && !error && _.isArray(data?.results)) {
      setCheckListData({
        checklistDetails: data?.results?.sort(
          ({ order: a }, { order: b }) => a - b
        ),
        totalChecklist: data?.totalChecklist || 0,
      });
    }

    setCurrentPrinting((prev) => ({ ...prev, loader: false }));

    handlePrint(); /* Print */
  };
  const handleExportChecklist = async (folderId, index) => {
    setCurrentExportFile(index);
    const { data, error } = await getExportChecklistTemplates({
      folder: folderId,
      contact: contactId,
    });

    if (data && !error) {
      downloadFile(`${baseURL}/${data}`);
      setCurrentExportFile(false);
    }
  };

  const moveActiveDocumentCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragCard = checkListData.checklistDetails[dragIndex];
      if (dragCard) {
        setCheckListData(
          update(checkListData.checklistDetails, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard],
            ],
          })
        );
      }
    },
    [checkListData.checklistDetails]
  );

  const arrangeTheOrderOfDocument = async () => {
    const tempDocumentObjArray = [...checkListData.checklistDetails];
    try {
      const orderObjArray = tempDocumentObjArray.map((obj, index) => ({
        _id: obj._id,
        order: index,
      }));
      await updateChecklistOrder({
        orderObjArray,
      });
    } catch (error) {
      console.log({ error });
    }
  };

  const handleCloseChecklistAddModal = () => {
    setChecklistId(false);
    setDefaultFolder(null);
    setIsViewOnly(false);
  };

  const loadContacts = async ({ page, limit, loadMore, search }) => {
    try {
      const { data, error } = await getContacts({
        page,
        search,
        query: {
          limit,
          archived: false,
          select: 'firstName,lastName,userProfile,email',
        },
      });
      if (!error) {
        if (loadMore) {
          setContactList((prev) => ({
            results: [...prev.results, ...data.allContacts],
            total: data.total,
          }));
        } else {
          setContactList({
            results: data.allContacts || [],
            total: data.total,
          });
        }
      }
    } catch (error) {
      setAddToContactListModalVisible(false);
    }
  };

  const onAddChecklistToContacts = async (selectedContactIds) => {
    await copyChecklistToContacts(addToContactListModalVisible, {
      contactIds: Array.from(selectedContactIds),
    });
    setAddToContactListModalVisible(false);
    setContactList([]);
  };

  const tableColumns = [
    { columnName: 'Name', sort: false },
    { columnName: 'Action', sort: false },
  ];
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const tempChecklists = Array.from(checkListData.checklistDetails || []);
    const startIndex = tempChecklists.findIndex(
      (s) => s.order === result.source.index
    );
    const endIndex = tempChecklists.findIndex(
      (s) => s.order === result.destination.index
    );

    const [removed] = tempChecklists.splice(startIndex, 1);
    tempChecklists.splice(endIndex, 0, removed);

    const newChecklists = tempChecklists.map((checklist, idx) => ({
      ...checklist,
      order: idx,
    }));
    await updateChecklistOrder({
      orderObjArray: newChecklists,
    });
    setCheckListData(newChecklists);
  };

  const handleIndividualChecklistPrint = useReactToPrint({
    content: () => printIndividualChecklistComponentRef.current,
  });

  const handlePrintIndividualChecklist = (item) => {
    setPrintIndividualChecklist([item]);
    setTimeout(() => {
      handleIndividualChecklistPrint();
    }, []);
  };

  const handleCopyLinkClick = () => {
    const toastId = showToast(TOASTTYPES.loading, '', 'Copy Link...');
    showToast(TOASTTYPES.success, toastId, 'Checklist Link Copied');
  };

  const handleCloneChecklistToCompany = async (checklist) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to copy this checklist to company?',
    });

    if (result.value) {
      await copyChecklistToCompany(checklist);
    }
  };

  const tableData = (checkListData.checklistDetails || [])
    .map((checklist) => {
      const actionButtons = (
        <div className='action-btn-wrapper'>
          <div
            className='action-btn printer-btn'
            onClick={(e) => {
              e.stopPropagation();
              handlePrintIndividualChecklist(checklist);
            }}
          >
            <Printer
              size={20}
              className={'cursor-pointer'}
              id={`print_folder_${checklist?._id}`}
            />
            <UncontrolledTooltip
              placement='top'
              target={`print_folder_${checklist?._id}`}
            >
              Print
            </UncontrolledTooltip>
          </div>
          <div
            className='action-btn view-btn'
            onClick={() => {
              setChecklistId(checklist?._id);
              setIsViewOnly(true);
            }}
          >
            <Eye
              // color='#a3db59'
              size={15}
              className='cursor-pointer'
              id={`view_checklist_${checklist?._id}`}
            />
            <UncontrolledTooltip
              key={`view_checklist_${checklist?._id}`}
              placement='top'
              autohide={true}
              target={`view_checklist_${checklist?._id}`}
            >
              View Checklist
            </UncontrolledTooltip>
          </div>
          <div
            className='action-btn copy-btn'
            onClick={() => handleConfirmClone(checklist?._id)}
          >
            <Copy
              // color='orange'
              size={15}
              className='cursor-pointer'
              id={`clone_${checklist?._id}`}
            />
            <UncontrolledTooltip
              key={`clone_${checklist?._id}`}
              placement='top'
              autohide={true}
              target={`clone_${checklist?._id}`}
            >
              Clone
            </UncontrolledTooltip>
          </div>
          {['ChecklistTemplate', 'Users', 'Contacts'].includes(type) && (
            <div
              className='action-btn copy-btn'
              onClick={(event) => {
                event.stopPropagation();
                if (['Users', 'Contacts'].includes(type)) {
                  handleCloneChecklistToCompany(checklist?._id);
                } else {
                  setAddToContactListModalVisible(checklist?._id);
                }
              }}
            >
              <Users
                size={15}
                className='cursor-pointer'
                id={`contact_list_${checklist?._id}`}
              />
              <UncontrolledTooltip
                key={`contact_list_${checklist?._id}`}
                placement='top'
                autohide={true}
                target={`contact_list_${checklist?._id}`}
              >
                Copy Checklist to Contacts
              </UncontrolledTooltip>
            </div>
          )}
          <div className='action-btn link-btn'>
            <CopyToClipboard
              text={`${window.location.origin}/checklist-details/${encrypt(
                checklist?._id
              )}`}
            >
              <LinkIcon
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  handleCopyLinkClick();
                }}
                id={`copyC_${checklist?._id}`}
              />
            </CopyToClipboard>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`copyC_${checklist?._id}`}
            >
              Copy Checklist Link
            </UncontrolledTooltip>
          </div>
          <div
            className='action-btn edit-btn'
            onClick={() => {
              setChecklistId(checklist?._id);
            }}
          >
            <Edit2
              size={15}
              className='cursor-pointer'
              // color={'#64c664'}
              id={`edit_${checklist?._id}`}
            />
            <UncontrolledTooltip
              key={`edit_${checklist?._id}`}
              placement='top'
              autohide={true}
              target={`edit_${checklist?._id}`}
            >
              Edit
            </UncontrolledTooltip>
          </div>
          <div
            className='action-btn delete-btn'
            onClick={() => handleConfirmDelete(checklist?._id)}
          >
            <Trash
              color='red'
              size={15}
              className='cursor-pointer'
              id={`trash_${checklist?._id}`}
            />
            <UncontrolledTooltip
              key={`trash_${checklist?._id}`}
              placement='top'
              autohide={true}
              target={`trash_${checklist?._id}`}
            >
              Delete
            </UncontrolledTooltip>
          </div>
        </div>
      );

      return {
        order: checklist.order,
        data: [checklist.name, actionButtons],
      };
    })
    .sort((a, b) => a.order - b.order);
  const highlightMatch = (text, query) => {
    if (!query) {
      return text;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight-text-color">$1</span>');
  };

  const onFolderDragEnd = async (result) => {
    if (
      !result.destination ||
      result.source?.index === 0 ||
      result?.destination?.index === 0
    )
      return;

    const tempFolders = Array.from(currentFolders || []);
    const startIndex = tempFolders.findIndex(
      (s) => s.order === result.source.index
    );
    const endIndex = tempFolders.findIndex(
      (s) => s.order === result.destination.index
    );

    const [removed] = tempFolders.splice(startIndex, 1);
    tempFolders.splice(endIndex, 0, removed);

    const newFolders = tempFolders.map((checklist, idx) => ({
      ...checklist,
      order: idx,
    }));
    setCurrentFolders(newFolders);

    const objFolder = [];
    newFolders?.map((folder) => {
      if (folder?._id !== 'unassigned') {
        objFolder.push({
          _id: folder?._id,
          order: folder?.order,
        });
      }
    });

    await updateReOrderFolder(objFolder);
  };

  return (
    <>
      {/* Check list template */}
      <UILoader blocking={folderLoading}>
        <div className='compnay-checklist-folder-wrapper'>
          <CardHeader className=''>
            <CardTitle tag='h4' className=''>
              Checklist Folders
            </CardTitle>
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
              <div className='add-btn-wrapper'>
                <Button
                  className='ms-1'
                  color='primary'
                  onClick={() => setChecklistId('add')}
                >
                  <Plus size={15} />
                  <span className='align-middle ms-50'>Add Checklist</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className='py-1'>
            <div className='company-checklist-inner-scroll hide-scrollbar'>
              <div className='checklist-search'>
                <Input
                  id='search-task'
                  className=''
                  value={searchVal}
                  placeholder='Search Checklist'
                  onChange={(e) => setSearchVal(e.target.value)}
                />
              </div>

              {currentFolders.length > 0 ? (
                <DragDropContext onDragEnd={onFolderDragEnd}>
                  <Droppable droppableId='droppable'>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className='checklist__wp'
                      >
                        {currentFolders
                          ?.sort(({ order: a }, { order: b }) => a - b)
                          ?.map((folder, index) => {
                            const highlightedFolderHeader = highlightMatch(
                              folder?.folderName ? folder?.folderName : '',
                              searchVal
                            );
                            return (
                              <Accordion
                                className='accordion-margin'
                                key={index}
                                open={open}
                                toggle={() => {
                                  accordionToggle(folder);
                                }}
                              >
                                <AccordionItem className='checklist-box checklist-folder-list-box'>
                                  <Draggable
                                    key={`sort-${index}`}
                                    draggableId={`sort-${index}`}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        className='d-flex file__card checklist__list__wrapper'
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <div
                                          className='d-flex title checklist-header checklist-new-ui'
                                          onClick={() => {
                                            accordionToggle(folder);
                                          }}
                                        >
                                          <div className='d-flex title'>
                                            <div
                                              className='checklist-name'
                                              dangerouslySetInnerHTML={{
                                                __html: highlightedFolderHeader,
                                              }}
                                            ></div>
                                            <Badge
                                              color='primary'
                                              className='mx-1'
                                              pill
                                            >
                                              {folder?.totalData || 0}
                                            </Badge>
                                          </div>
                                          {folder?._id !== 'unassigned' && (
                                            <div className='action-btn-wrapper'>
                                              <>
                                                {currentPrinting.id ===
                                                  folder?._id &&
                                                  currentPrinting.loader && (
                                                    <div className='action-btn plus-btn'>
                                                      <Spinner size={'sm'} />
                                                    </div>
                                                  )}
                                                <div
                                                  className='action-btn plus-btn'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setChecklistId('add');
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
                                                    Add Checklist
                                                  </UncontrolledTooltip>
                                                </div>
                                                <div
                                                  className='action-btn printer-btn'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (
                                                      !currentExportFile ||
                                                      currentExportFile === 0
                                                    ) {
                                                      handleExportChecklist(
                                                        folder._id,
                                                        index
                                                      );
                                                    }
                                                  }}
                                                >
                                                  {currentExportFile !==
                                                    false &&
                                                  currentExportFile ===
                                                    index ? (
                                                    <>
                                                      <Spinner size={'sm'} />
                                                    </>
                                                  ) : (
                                                    <>
                                                      <ArrowDownCircle
                                                        size={20}
                                                        className={
                                                          'cursor-pointer'
                                                        }
                                                        id={`export_checklist_${folder?._id}`}
                                                      />
                                                      <UncontrolledTooltip
                                                        placement='top'
                                                        target={`export_checklist_${folder?._id}`}
                                                      >
                                                        Export
                                                      </UncontrolledTooltip>
                                                    </>
                                                  )}
                                                </div>
                                                <div
                                                  className='action-btn printer-btn'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePrintChecklistData(
                                                      folder._id
                                                    );
                                                  }}
                                                >
                                                  <Printer
                                                    size={20}
                                                    className={'cursor-pointer'}
                                                    id={`print_folder_${folder?._id}`}
                                                  />
                                                  <UncontrolledTooltip
                                                    placement='top'
                                                    target={`print_folder_${folder?._id}`}
                                                  >
                                                    Print
                                                  </UncontrolledTooltip>
                                                </div>
                                              </>
                                              <div
                                                className='action-btn printer-btn'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditFolderName(folder);
                                                }}
                                              >
                                                <Edit2
                                                  size={15}
                                                  // color={'#64c664'}
                                                  className={'cursor-pointer'}
                                                  id={`edit_folder_${folder?._id}`}
                                                />
                                                <UncontrolledTooltip
                                                  placement='top'
                                                  target={`edit_folder_${folder?._id}`}
                                                >
                                                  Edit
                                                </UncontrolledTooltip>
                                              </div>
                                              <div
                                                className='action-btn printer-btn'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteFolder(folder);
                                                  // handleEditFolderName(folder);
                                                }}
                                              >
                                                <Trash
                                                  color={'red'}
                                                  size={15}
                                                  className='cursor-pointer'
                                                  id={`delete_folder_${folder?._id}`}
                                                />
                                                <UncontrolledTooltip
                                                  placement='top'
                                                  target={`delete_folder_${folder?._id}`}
                                                >
                                                  Delete
                                                </UncontrolledTooltip>
                                              </div>
                                              <div className='action-btn mobile-menu-btn'>
                                                <MoreVertical />
                                              </div>
                                              <div className='action-btn down-arrow-btn'>
                                                <ChevronDown
                                                  className=''
                                                  size={34}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                  <AccordionBody
                                    accordionId={folder?._id}
                                    key={open}
                                  >
                                    {checkListLoading &&
                                    !checkListData.checklistDetails?.length ? (
                                      <>
                                        <div className='loader-wrapper'>
                                          <Spinner />
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <ChecklistAccordianView
                                          activeView={activeView}
                                          checkListData={
                                            checkListData.checklistDetails
                                          }
                                          arrangeTheOrderOfDocument={
                                            arrangeTheOrderOfDocument
                                          }
                                          moveActiveDocumentCard={
                                            moveActiveDocumentCard
                                          }
                                          handleConfirmClone={
                                            handleConfirmClone
                                          }
                                          setChecklistId={setChecklistId}
                                          handleConfirmDelete={
                                            handleConfirmDelete
                                          }
                                          setIsViewOnly={setIsViewOnly}
                                          handlePrintIndividualChecklist={
                                            handlePrintIndividualChecklist
                                          }
                                          searchVal={searchVal}
                                          tableColumns={tableColumns}
                                          tableData={tableData}
                                          onDragEnd={onDragEnd}
                                          type={type}
                                        />

                                        {activeView === 'grid' &&
                                          checklistPagination.page *
                                            checklistPagination.limit <
                                            checkListData.totalChecklist && (
                                            <div className='text-center mb-2'>
                                              <Button
                                                outline={true}
                                                color='primary'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  getChecklistTemplatesAPI(
                                                    { _id: open },
                                                    null,
                                                    {
                                                      ...checklistPagination,
                                                      page:
                                                        checklistPagination.page +
                                                        1,
                                                    }
                                                  );
                                                }}
                                              >
                                                {checkListLoading && (
                                                  <Spinner size='sm mr-2' />
                                                )}{' '}
                                                Load More
                                              </Button>
                                            </div>
                                          )}
                                      </>
                                    )}
                                  </AccordionBody>
                                </AccordionItem>
                              </Accordion>
                            );
                          })}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className='d-flex justify-content-center m-4'>
                  <span className='no-data-found'>No Checklist Found</span>
                </div>
              )}
            </div>
          </CardBody>
        </div>
        {openFolderModal && (
          <EditFolderModal
            contactId={contactId}
            updateFolderDetail={updateFolder}
            openFolderModal={openFolderModal}
            setOpenFolderModal={setOpenFolderModal}
            closeFolderModal={closeFolderModal}
            currentFolders={currentFolders}
            setCurrentFolders={setCurrentFolders}
            type={'checklist'}
            modelType={type}
          />
        )}
      </UILoader>
      <Modal
        isOpen={currentDeleteFolder.isModal}
        toggle={() => {
          clearDeleteFolderModal();
        }}
        className='modal-dialog-centered  delete-folder-modal modal-dialog-mobile'
        size='lg'
        backdrop='static'
        fade={false}
      >
        <ModalHeader toggle={() => clearDeleteFolderModal()}>
          Delete Folder
        </ModalHeader>
        <ModalBody>
          {checkListLoading ? (
            <>
              <div className='mb-2 text-primary text-center'>
                <Spinner color='primary' />
              </div>
            </>
          ) : currentDeleteFolder.checklist &&
            currentDeleteFolder.checklist.length > 0 ? (
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
                      options={availableFolderDetails
                        ?.filter(
                          (folder) =>
                            folder._id !==
                              currentDeleteFolder.editFolder?._id &&
                            folder._id !== 'unassigned'
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
                      <div className='text-danger error-msg'>
                        Please Enter folder...
                      </div>
                    </>
                  ) : null}
                </div>
                <ItemTable
                  columns={columns?.filter(
                    (column) => column.name !== 'Actions'
                  )}
                  data={currentDeleteFolder.checklist}
                  title={`Below tags are in ${currentDeleteFolder.editFolder?.folderName}, please select new folder in which you want to move these tags to.`}
                  addItemLink={false}
                  hideButton={true}
                  itemsPerPage={10}
                  hideExport={true}
                  showCard={false}
                />
              </div>
            </>
          ) : currentDeleteFolder.length === 0 ? (
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
      {!!checklistId && (
        <AddCheckListModal
          contactId={contactId}
          isViewOnly={isViewOnly}
          openFolderId={open}
          currentFolders={currentFolders}
          checklistId={checklistId}
          data={checkListData.checklistDetails}
          isOpen={!!checklistId}
          setIsOpen={setChecklistId}
          getChecklistTemplatesAPI={getChecklistTemplatesAPI}
          setCurrentFolders={setCurrentFolders}
          defaultFolder={defaultFolder}
          handleCloseChecklistAddModal={handleCloseChecklistAddModal}
          modelType={type}
        />
      )}

      {currentPrinting.id && !currentPrinting.loader && (
        <div className='d-none'>
          <ChecklistFolderToPrint
            contactId={contactId}
            ref={printComponentRef}
            data={checkListData.checklistDetails}
            folderId={currentPrinting.id}
            allFolders={currentFolders}
          />
        </div>
      )}
      <div className='d-none'>
        <ChecklistFolderToPrint
          contactId={contactId}
          ref={printIndividualChecklistComponentRef}
          data={printIndividualChecklist}
          folderId={open}
          allFolders={currentFolders}
        />
      </div>
      {addToContactListModalVisible && (
        <AddChecklistToContactModal
          isModalOpen={addToContactListModalVisible}
          onCloseModal={() => {
            setAddToContactListModalVisible(false);
          }}
          contactsLoading={loadingContacts}
          availableContacts={contactList.results}
          sumbitLoader={assignChecklistToContactsLoading}
          onAddContacts={onAddChecklistToContacts}
          totalContacts={contactList.total}
          loadMoreContacts={loadContacts}
        />
      )}
    </>
  );
};

export default ChecklistTemplateList;
