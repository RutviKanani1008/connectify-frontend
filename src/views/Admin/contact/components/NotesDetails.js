import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useUpdateReOrderFolder } from '../../../templates/hooks/checklistApis';
import { useCallback, useEffect, useState, Fragment, useRef } from 'react';
import EditFolderModal from '../../folders/components/EditFolderModal';
import { useDeleteFolder, useGetFolders } from '../../groups/hooks/groupApis';
import {
  Accordion,
  AccordionBody,
  AccordionItem,
  Badge,
  Button,
  Input,
  Spinner,
  TabPane,
  UncontrolledTooltip,
} from 'reactstrap';
import {
  ChevronDown,
  Edit2,
  FileText,
  MoreVertical,
  Plus,
  PlusCircle,
  Printer,
  Trash,
} from 'react-feather';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import _ from 'lodash';
import { useGetCompanyUsers } from '../../TaskManager/service/userApis';
import { ContactNoteModal } from './ContactNoteModal';
import {
  useCreateNote,
  useDeleteNote,
  useGetNotes,
  useUpdateNote,
  useUpdateNoteFolder,
} from '../hooks/noteApi';
import { uploadDocumentFileAPI } from '../../../../api/documents';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { ContactNotes } from './Notes';
import moment from 'moment';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';
import { useReactToPrint } from 'react-to-print';
import ContactNotePrint from './ContactNotePrint';
import DeleteFolderDetails from './DeleteFolderDetails';
import TaskPopulateFromEmail from '../../communication/Email/components/TaskPopulateFromEmail';
import { useExportDataAPI } from '../../../../hooks/useGeneralAPI';
import { downloadFile } from '../../../../helper/common.helper';
import { baseURL } from '../../../../api/axios-config';
import { useHistory } from 'react-router-dom';

const NoteDetails = ({
  params,
  modelName = 'Contacts',
  currentContactDetail = null,
}) => {
  const history = useHistory();
  const search = window.location.search;
  const searchValue = new URLSearchParams(search);

  const currentUser = useSelector(userData);

  const [openFolder, setOpenFolder] = useState(null);

  const [updateFolder, setUpdateFolder] = useState(false);
  const [folderLoading, setFolderLoading] = useState(false);
  const [currentFolders, setCurrentFolders] = useState([]);

  const { updateReOrderFolder } = useUpdateReOrderFolder();
  const [folderController, setFolderController] = useState(null);
  const [availableFolderDetails, setAvailableFolderDetails] = useState([]);
  const { getFolders } = useGetFolders();
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [currentCompanyUsers, setCurrentCompanyUsers] = useState([]);
  const [addOrEditNote, setAddOrEditNote] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    limit: 15,
    page: 1,
    search: '',
  });
  const [initialNotesLoading, setInitialNotesLoading] = useState(1);
  const [currentNote, setCurrentNote] = useState('');
  const [currentNoteFolder, setCurrentNoteFolder] = useState('');
  const [currentNoteTitle, setCurrentNoteTitle] = useState('');
  const [currentEditNoteIdx, setCurrentEditNoteIdx] = useState(null);
  const [selectedNote, setSelectedNote] = useState([]);
  const [openNote, setOpenNote] = useState([]);
  const [attachmentFileUrl, setAttachmentFileUrl] = useState([]);
  const [notes, setNotes] = useState({ results: [], total: 0 });

  const [fileUploading, setFileUploading] = useState(false);
  const [mentionUsers, setMentionUsers] = useState([]);
  const [highlightNotes, setHighlightNote] = useState([]);
  const [taskData, setTaskData] = useState({ subject: '' });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTextNote, setSelectedTextNote] = useState({
    note: null,
    text: null,
  });
  const [currentPrinting, setCurrentPrinting] = useState({
    id: null,
    loader: false,
  });
  const [currentExportNote, setCurrentExportNote] = useState(null);
  const folderNotePrintRef = useRef(null);
  const [allowAutoSave, setAllowAutoSave] = useState(true);
  const { deleteNote } = useDeleteNote();
  const { deleteFolder } = useDeleteFolder();

  const { updateNoteFolder } = useUpdateNoteFolder();
  const { exportDataAPI } = useExportDataAPI();

  /* Hooks */
  const { createNote, isLoading: createLoader } = useCreateNote();
  const { updateNote, isLoading: updateLoader } = useUpdateNote();
  const { getNotes, isLoading: getNoteLoading } = useGetNotes();

  useEffect(() => {
    if (params?.id !== 'add') {
      getFoldersDetails();
    }
  }, [params?.id]);

  useEffect(() => {
    if (currentCompanyUsers.length) {
      setMentionUsers(
        currentCompanyUsers.map((user) => ({
          label: `${user?.firstName || ''} ${user?.lastName || ''}`,
          value: user?._id,
        }))
      );
    }
  }, [currentCompanyUsers]);

  const getFoldersDetails = async (
    searchDetails = '',
    initialLoader = true
  ) => {
    let tempController = folderController;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setFolderController(tempController);
    if (initialLoader) setFolderLoading(true);
    const { data, error } = await getFolders(
      {
        company: currentUser.company._id,
        folderFor: 'notes',
        ...(params?.id
          ? {
              model: modelName,
              ...(params?.id !== 'add' && { modelRecordId: params?.id }),
            }
          : { model: null }),
        ...(searchDetails && searchDetails !== '' && { search: searchDetails }),
      },
      tempController.signal
    );

    if (!error && data) {
      if (!availableFolderDetails.length) {
        setAvailableFolderDetails(data);
      }

      if (searchValue?.get('folder')) {
        const openFolder = searchValue.get('folder');

        if (openFolder) {
          const isFolderExists = data?.find(
            (folder) => String(folder?._id) === String(openFolder)
          );
          if (isFolderExists) {
            accordionToggle(isFolderExists);
          }
          const url = new URL(window.location);
          url.searchParams.delete('folder');
          history.push({
            pathname: history.location?.pathname,
            search: url.searchParams.toString(),
          });
        }
      }
      setCurrentFolders([...data].sort(({ order: a }, { order: b }) => a - b));
    }
    setFolderLoading(false);
  };

  const highlightMatch = (text, query) => {
    if (!query) {
      return text;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight-text-color">$1</span>');
  };

  const getCurrentContactNotes = async (
    { folderDetail = null, pagination = { limit: 15, page: 1, search: '' } },
    reset = true
  ) => {
    setCurrentFilters({
      ...pagination,
    });
    if (reset) setInitialNotesLoading(true);
    if (params.id !== 'add') {
      const { data, error } = await getNotes({
        company: currentUser.company?._id,
        modelId: params.id,
        modelName,
        ...(folderDetail && { folder: folderDetail }),
        ...pagination,
      });
      if (!error) {
        const isNoteId = searchValue.get('note');
        if (isNoteId) {
          data?.notes?.forEach((tempNote, index) => {
            if (tempNote?._id === isNoteId) {
              setOpenNote([
                `${index}-${tempNote?.isPinned ? 'pinned' : 'unpinned'}`,
              ]);
              setHighlightNote([tempNote?._id]);
            }
          });
          const url = new URL(window.location);
          url.searchParams.delete('note');
          history.push({
            pathname: history.location?.pathname,
            search: url.searchParams.toString(),
          });
        }
        if (pagination.page > 1) {
          setNotes({
            results: [...notes.results, ...data.notes],
            total: data.total,
          });
        } else {
          setNotes({ results: data.notes, total: data.total });
        }
      }
    }
    setInitialNotesLoading(false);
  };

  const accordionToggle = (folder) => {
    if (openFolder === folder._id) {
      setCurrentFilters({
        ...currentFilters,
        limit: 15,
        page: 1,
        // search: '',
      });
      setOpenFolder();
    } else {
      setNotes([]);
      getCurrentContactNotes({
        folderDetail: folder._id !== 'unassigned' ? folder._id : null,
        pagination: {
          ...currentFilters,
          limit: 15,
          page: 1,
        },
      });
      setOpenFolder(folder._id);
    }
  };

  const handleEditFolderName = (folder) => {
    setUpdateFolder(folder);
    setOpenFolderModal(!openFolderModal);
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

  const closeFolderModal = () => {
    setOpenFolderModal(false);
    setUpdateFolder(false);
  };

  // const loadMoreContactNotes = async (filters, reset = false) => {
  //   if (reset) setInitialNotesLoading(true);
  //   if (params.id !== 'add') {
  //     const { data, error } = await getNotes({
  //       company: currentUser.company?._id,
  //       modelId: params.id,
  //       modelName,
  //       ...filters,
  //     });
  //     if (!error) {
  //       setNotes((prev) => ({
  //         results: [...(reset ? [] : prev.results), ...(data.notes ?? [])],
  //         total: data.total,
  //       }));
  //     }
  //   }
  //   setInitialNotesLoading(false);
  // };

  const handleSearchNote = useCallback(
    _.debounce(async (search, currentOpenFolder) => {
      setCurrentFilters({
        ...currentFilters,
        search,
      });
      getFoldersDetails(search, false);
      if (currentOpenFolder) {
        // setCurrentFilters((prev) => ({ ...prev, page: 1 }));
        getCurrentContactNotes({
          folderDetail:
            currentOpenFolder !== 'unassigned' ? currentOpenFolder : null,
          pagination: { ...currentFilters, search, page: 1 },
        });
      }
    }, 300),
    []
  );

  const { getCompanyUsers } = useGetCompanyUsers();
  const getCurrentCompanyUser = async () => {
    if (params.id !== 'add') {
      const { data, error } = await getCompanyUsers(currentUser.company?._id, {
        select: 'id,firstName,lastName',
      });
      if (!error) {
        setCurrentCompanyUsers(data);
      }
    }
  };

  useEffect(() => {
    getCurrentCompanyUser();
  }, []);

  const resetNoteModal = (folderDetail = null) => {
    setCurrentEditNoteIdx(null);
    setCurrentNote('');
    setCurrentNoteTitle('');
    setAttachmentFileUrl([]);
    if (folderDetail && folderDetail?._id !== 'unassigned') {
      setCurrentNoteFolder({
        id: folderDetail?._id,
        value: folderDetail?._id,
        label: folderDetail?.folderName,
      });
    } else {
      setCurrentNoteFolder('');
    }
  };

  const cancelNote = () => {
    setCurrentEditNoteIdx(null);
    setCurrentNote('');
    setCurrentNoteTitle('');
    setAttachmentFileUrl([]);
    setAddOrEditNote(false);
    setAllowAutoSave(true);
    setCurrentNoteFolder('');
  };

  const addNote = async ({
    noteTitle = currentNoteTitle,
    note = currentNote,
    attachments = attachmentFileUrl,
    currentEditNote = currentEditNoteIdx,
    currentNoteFolderDetail = currentNoteFolder,
    notes,
  }) => {
    const currentNoteTitle = noteTitle;
    const noteText = note;
    const attachmentFileUrl = attachments;
    const folderDetail = currentNoteFolderDetail?.value || null;

    if (currentUser) {
      if (currentEditNote !== null) {
        const editNoteObj = {
          title: currentNoteTitle,
          note: noteText,
          attachments: attachmentFileUrl,
          company: currentUser.company?._id,
          folder: folderDetail,
          updatedBy: currentUser?._id,
        };

        const { data, error } = await updateNote(
          currentEditNote?._id,
          editNoteObj
        );
        if (!error) {
          setCurrentEditNoteIdx(data);
          if (folderDetail !== currentEditNoteIdx?.folder) {
            const oldFolder = currentEditNoteIdx?.folder || null;
            setCurrentFolders((prev) => {
              return prev.map((obj) =>
                String(obj._id) === String(folderDetail) ||
                (folderDetail === null && String(obj?._id) === 'unassigned')
                  ? {
                      ...obj,
                      totalData: obj?.totalData + 1,
                    }
                  : String(obj._id) === String(oldFolder) ||
                    (oldFolder === null && String(obj?._id) === 'unassigned')
                  ? {
                      ...obj,
                      totalData: obj?.totalData - 1,
                    }
                  : { ...obj }
              );
            });
          }
          if (
            openFolder === String(folderDetail) ||
            (folderDetail === null && openFolder === 'unassigned')
          ) {
            let tempNotes = JSON.parse(JSON.stringify(notes.results ?? []));

            const isNoteExist = tempNotes?.find(
              (note) => String(note._id) === String(currentEditNote?._id)
            );
            if (isNoteExist) {
              tempNotes = tempNotes.map((note) => {
                if (String(note._id) === String(currentEditNote?._id)) {
                  note = data;
                }
                return note;
              });
              setNotes({ ...notes, results: tempNotes });
            } else {
              setNotes({ ...notes, results: [...notes.results, data] });
            }
          } else {
            let tempNotes = JSON.parse(JSON.stringify(notes.results ?? []));
            tempNotes = tempNotes.filter(
              (note) => String(note._id) !== String(currentEditNote?._id)
            );
            setNotes({ ...notes, results: tempNotes });
          }
        }
      } else {
        setAllowAutoSave(false);
        const { data, error } = await createNote({
          title: currentNoteTitle,
          note: noteText,
          modelId: params.id,
          attachments: attachmentFileUrl,
          modelName,
          company: currentUser.company?._id,
          folder: folderDetail,
          updatedBy: currentUser?._id,
        });
        if (!error) {
          setCurrentEditNoteIdx(data);
          setCurrentFolders((prev) => {
            return prev.map((obj) =>
              String(obj._id) === String(data?.folder) ||
              (data?.folder === null && String(obj?._id) === 'unassigned')
                ? {
                    ...obj,
                    totalData: obj?.totalData + 1,
                  }
                : { ...obj }
            );
          });
          if (
            openFolder === String(data?.folder) ||
            (data?.folder === null && openFolder === 'unassigned')
          ) {
            // let tempNotes = JSON.parse(JSON.stringify(notes.results ?? []));
            // tempNotes = tempNotes.map((note) => {
            //   if (String(note._id) === String(currentEditNote?._id)) {
            //     note = data;
            //   }
            //   return note;
            // });
            // setNotes({ ...notes, results: tempNotes });
            const tempNotes = JSON.parse(JSON.stringify(notes.results ?? []));
            setNotes({ results: [data, ...tempNotes], total: notes.total + 1 });
          }
        }
        setAllowAutoSave(true);
      }
    }
  };

  const attachmentUpload = (files) => {
    const formData = new FormData();
    formData.append(
      'filePath',
      `${currentUser?.company?._id}/contacts/${params.id}/notes`
    );
    files?.forEach((file) => {
      if (!file?.url) {
        formData.append('attachments', file);
      }
    });
    if (files.length && files.filter((file) => !file?.url)?.length) {
      setFileUploading(true);
      uploadDocumentFileAPI(formData)
        .then((res) => {
          if (res.error) {
            setFileUploading(false);
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
              // setValue('attachments', [...attachmentFileUrl, ...fileObj]);
              setAttachmentFileUrl([...attachmentFileUrl, ...fileObj]);
            }
          }
          setFileUploading(false);
        })
        .catch(() => {
          setFileUploading(false);
        });
    }
  };

  const removeAttachmentFile = (removeIndex) => {
    setAttachmentFileUrl(
      removeIndex > -1
        ? attachmentFileUrl.filter((url, index) => index !== removeIndex)
        : []
    );
  };

  const changeUploadFileName = (fileObj) => {
    setAttachmentFileUrl(
      attachmentFileUrl.map((file, index) => {
        if (index === fileObj.index) {
          file.fileName = fileObj.name;
        }
        return file;
      })
    );
  };

  const removeNote = async (id) => {
    const result = await showWarnAlert({
      text: 'Are you want to delete this note?',
    });

    if (result.value) {
      const { error } = await deleteNote(id);
      if (!error) {
        setCurrentFolders((prev) => {
          return prev.map((obj) =>
            String(obj._id) === String(openFolder) ||
            (openFolder === null && String(obj?._id) === 'unassigned')
              ? {
                  ...obj,
                  totalData: obj?.totalData - 1,
                }
              : { ...obj }
          );
        });
        setNotes((n) => ({
          results: n.results.filter((note) => String(note._id) !== String(id)),
          total: notes.total - 1,
        }));
      }
      setCurrentEditNoteIdx(null);
      setCurrentNoteTitle('');
    }
    setCurrentNote(null);
  };

  const toggle = (id) => {
    const tempOpen = [...openNote];
    if (tempOpen.includes(id)) {
      const index = tempOpen.indexOf(id);
      if (index > -1) {
        tempOpen.splice(index, 1);
      }
    } else {
      tempOpen.push(id);
    }
    setOpenNote(tempOpen);

    // Remove from the highlighted notes
    const tempHighlightNotes = [...highlightNotes];
    if (tempHighlightNotes.includes(id)) {
      const index = tempHighlightNotes.indexOf(id);
      if (index > -1) {
        tempHighlightNotes.splice(index, 1);
      }
    }
    setHighlightNote(tempOpen);
  };

  const selectedCurrentNotes = (noteObj, isSelected = true) => {
    let tempNotes = JSON.parse(JSON.stringify(selectedNote));
    // if(tempNotes.find((temp) => ))
    if (
      isSelected &&
      !tempNotes.find((selectedNote) =>
        moment(selectedNote?.updatedAt).isSame(noteObj?.updatedAt)
      )
    ) {
      tempNotes.push(noteObj);
    } else if (!isSelected) {
      tempNotes = tempNotes.filter(
        (temp) => !moment(temp?.updatedAt).isSame(noteObj?.updatedAt)
      );
    }
    setSelectedNote(tempNotes);
  };

  const updateNotePin = async (currentNote) => {
    const currentPinNote = JSON.parse(JSON.stringify(currentNote));
    currentPinNote.isPinned = !currentPinNote.isPinned;
    const { data, error } = await updateNote(
      currentPinNote?._id,
      currentPinNote,
      'Note Updating'
    );

    let tempNote = JSON.parse(JSON.stringify(notes.results ?? []));
    if (!error) {
      tempNote = tempNote.map((note) => {
        if (String(note._id) === String(currentNote?._id)) {
          note = data;
        }
        return note;
      });
      setNotes({ ...notes, results: tempNote });
    }
  };

  const handleEditNoteDetails = (note) => {
    const folderDetail = currentFolders?.find(
      (folder) => folder._id === note?.folder
    );
    if (folderDetail) {
      setCurrentNoteFolder({
        id: folderDetail?._id,
        value: folderDetail?._id,
        label: folderDetail?.folderName,
      });
    } else {
      setCurrentNoteFolder(null);
    }
    setCurrentEditNoteIdx(note);
    setCurrentNote(note?.note || '');
    setCurrentNoteTitle(note?.title || '');
    setAttachmentFileUrl(note?.attachments || []);
    setAddOrEditNote(true);
  };

  const handlePrintNote = useReactToPrint({
    content: () => folderNotePrintRef.current,
  });

  const handlePrintChecklistData = async (folderId) => {
    setOpenFolder();
    setCurrentPrinting({ id: folderId, loader: true });

    const { data, error } = await getNotes({
      company: currentUser.company?._id,
      modelId: params.id,
      modelName,
      ...(folderId && { folder: folderId !== 'unassigned' ? folderId : null }),
    });

    if (data && !error && _.isArray(data?.notes)) {
      setNotes({
        results: data?.notes?.sort(({ order: a }, { order: b }) => a - b),
        total: data?.total || 0,
      });
    }

    setCurrentPrinting((prev) => ({ ...prev, loader: false }));

    handlePrintNote(); /* Print */
  };

  const [currentDeleteFolder, setCurrentDeleteFolder] = useState({
    results: [],
    isModal: false,
    editFolder: false,
    newSelected: null,
    error: null,
  });

  const handleDeleteFolder = async (currentFolder) => {
    const { data, error } = await getNotes({
      company: currentUser.company?._id,
      modelId: params.id,
      modelName,
      folder: currentFolder?._id,
    });

    if (!error && _.isArray(data?.notes) && data?.notes.length) {
      //
      setCurrentDeleteFolder({
        results: data?.notes,
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
    obj.notes = currentDeleteFolder.results?.map((folder) => folder?._id);
    obj.folder = currentDeleteFolder.newSelected?.value;
    const { error } = await updateNoteFolder(obj);
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
      getFoldersDetails(currentFilters.search);
    }
  };

  const exportData = async (folder) => {
    setCurrentExportNote(folder?._id);
    const { data, error } = await exportDataAPI({
      model: 'notes',
      company: currentUser.company?._id,
      modelName,
      modelId: params.id,
      folder: folder?._id !== 'unassigned' ? folder?._id : null,
    });
    if (data && !error) {
      downloadFile(`${baseURL}/${data}`);
    }
    setCurrentExportNote(null);
  };

  return (
    <>
      <TabPane tabId='notes' className='contact-notes-tabPane'>
        <div className='inner-contant-wrapper'>
          <div className='available-notes-wrapper mt-2 no-margin no-border'>
            <div className='available-notes-header'>
              <div className='d-inline-flex align-items-center search-note'>
                <Input
                  className=''
                  type='text'
                  placeholder='Search Note'
                  onChange={(e) => {
                    handleSearchNote(e.target.value, openFolder);
                    // setCurrentSearchNote(e.target.value);
                  }}
                />
              </div>
              <div className='btns-wrapper d-flex align-items-center mt-md-0 mt-1'>
                <span
                  className={`cursor-pointer create-folder-link me-1`}
                  onClick={() => {
                    setUpdateFolder({
                      _id: 'newFolder',
                    });
                    setOpenFolderModal(!openFolderModal);
                  }}
                >
                  <span>Create A Folder</span>
                </span>

                <Button
                  className='add-note-btn '
                  color='primary'
                  onClick={() => {
                    setAddOrEditNote(true);
                    resetNoteModal();
                  }}
                >
                  <Plus size={15} />
                  <span className='align-middle ms-50'>Add Note</span>
                </Button>
              </div>
            </div>

            <div className='notes-list-scroll-area hide-scrollbar'>
              {folderLoading ? (
                <Spinner />
              ) : (
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
                              currentFilters.search
                            );
                            return (
                              <Accordion
                                className='accordion-margin'
                                key={index}
                                open={openFolder}
                                toggle={() => {
                                  accordionToggle(folder);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                        <div className='d-flex title checklist-header checklist-new-ui'>
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
                                          <div className='action-btn-wrapper'>
                                            <>
                                              {(currentPrinting.id ===
                                                folder?._id &&
                                                currentPrinting.loader) ||
                                                (currentExportNote ===
                                                  folder?._id && (
                                                  <div className='action-btn plus-btn'>
                                                    <Spinner size={'sm'} />
                                                  </div>
                                                ))}
                                              <div
                                                className='action-btn plus-btn'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setAddOrEditNote(true);
                                                  resetNoteModal(folder);
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
                                                  Add Note
                                                </UncontrolledTooltip>
                                              </div>
                                              <div
                                                className='action-btn plus-btn'
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  exportData(folder);
                                                }}
                                              >
                                                <FileText
                                                  size={20}
                                                  className='cursor-pointer'
                                                  id={`export_note_${folder?._id}`}
                                                />
                                                <UncontrolledTooltip
                                                  placement='top'
                                                  target={`export_note_${folder?._id}`}
                                                >
                                                  Export to CSV
                                                </UncontrolledTooltip>
                                              </div>
                                              <div className='action-btn printer-btn'>
                                                <Printer
                                                  size={20}
                                                  className={'cursor-pointer'}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePrintChecklistData(
                                                      folder._id
                                                    );
                                                  }}
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
                                            {folder?._id !== 'unassigned' && (
                                              <>
                                                <div className='action-btn printer-btn'>
                                                  <Edit2
                                                    size={15}
                                                    // color={'#64c664'}
                                                    className={'cursor-pointer'}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleEditFolderName(
                                                        folder
                                                      );
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
                                                    className='cursor-pointer'
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteFolder(
                                                        folder
                                                      );
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
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                  <AccordionBody
                                    accordionId={folder?._id}
                                    key={openFolder}
                                  >
                                    {openFolder === folder?._id && (
                                      <>
                                        {initialNotesLoading ? (
                                          <div className='d-flex justify-content-center align-content-center pt-2 pb-2'>
                                            <Spinner />
                                          </div>
                                        ) : (
                                          <>
                                            {notes.results?.length > 0 ? (
                                              <>
                                                {notes.results
                                                  ?.sort(
                                                    (noteA, noteB) =>
                                                      noteB.isPinned -
                                                      noteA.isPinned
                                                  )
                                                  .map((note, key) => {
                                                    return (
                                                      <Fragment key={key}>
                                                        <div>
                                                          <ContactNotes
                                                            searchNote={
                                                              currentFilters.search
                                                            }
                                                            index={key}
                                                            open={openNote}
                                                            toggle={toggle}
                                                            updateNotePin={
                                                              updateNotePin
                                                            }
                                                            removeNote={
                                                              removeNote
                                                            }
                                                            currentEditNoteIdx={
                                                              currentEditNoteIdx
                                                            }
                                                            note={note}
                                                            notes={notes}
                                                            user={currentUser}
                                                            selectedCurrentNotes={
                                                              selectedCurrentNotes
                                                            }
                                                            selectedNote={
                                                              selectedNote
                                                            }
                                                            attachmentFileUrl={
                                                              attachmentFileUrl
                                                            }
                                                            highlightNotes={
                                                              highlightNotes
                                                            }
                                                            setShowTaskModal={
                                                              setShowTaskModal
                                                            }
                                                            setTaskData={
                                                              setTaskData
                                                            }
                                                            selectedTextNote={
                                                              selectedTextNote
                                                            }
                                                            setSelectedTextNote={
                                                              setSelectedTextNote
                                                            }
                                                            currentContactDetail={
                                                              currentContactDetail
                                                            }
                                                            modelName={
                                                              modelName
                                                            }
                                                            handleEditNoteDetails={
                                                              handleEditNoteDetails
                                                            }
                                                          />
                                                        </div>
                                                      </Fragment>
                                                    );
                                                  })}

                                                {notes.results?.length <
                                                  notes.total && (
                                                  <div className='text-center loadMore-btn-wrapper'>
                                                    <Button
                                                      outline={true}
                                                      color='primary'
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentFilters({
                                                          ...currentFilters,
                                                          page:
                                                            currentFilters.page +
                                                            1,
                                                        });
                                                        getCurrentContactNotes(
                                                          {
                                                            folderDetail:
                                                              openFolder !==
                                                              'unassigned'
                                                                ? openFolder
                                                                : null,
                                                            pagination: {
                                                              ...currentFilters,
                                                              page:
                                                                currentFilters.page +
                                                                1,
                                                            },
                                                          },
                                                          false
                                                        );
                                                      }}
                                                    >
                                                      {getNoteLoading && (
                                                        <Spinner size='sm mr-1' />
                                                      )}{' '}
                                                      Load More
                                                    </Button>
                                                  </div>
                                                )}
                                              </>
                                            ) : (
                                              <>
                                                <NoRecordFound />
                                              </>
                                            )}
                                          </>
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
              )}
            </div>
          </div>
        </div>
      </TabPane>

      {addOrEditNote && (
        <ContactNoteModal
          notes={notes}
          allowAutoSave={allowAutoSave}
          addOrEditNote={addOrEditNote}
          currentNoteTitle={currentNoteTitle}
          setAddOrEditNote={setAddOrEditNote}
          setCurrentNoteTitle={setCurrentNoteTitle}
          cancelNote={cancelNote}
          currentNote={currentNote}
          addNote={addNote}
          currentEditNoteIdx={currentEditNoteIdx}
          setCurrentNote={setCurrentNote}
          mentionUsers={mentionUsers}
          attachmentUpload={attachmentUpload}
          removeAttachmentFile={removeAttachmentFile}
          attachmentFileUrl={attachmentFileUrl}
          fileUploading={fileUploading}
          changeUploadFileName={changeUploadFileName}
          saveLoader={createLoader || updateLoader}
          removeNote={removeNote}
          currentFolders={currentFolders}
          currentNoteFolder={currentNoteFolder}
          setCurrentNoteFolder={setCurrentNoteFolder}
          modelType={modelName}
          contactId={params?.id}
          setCurrentFolders={setCurrentFolders}
        />
      )}

      {openFolderModal && (
        <EditFolderModal
          contactId={params?.id}
          updateFolderDetail={updateFolder}
          openFolderModal={openFolderModal}
          setOpenFolderModal={setOpenFolderModal}
          closeFolderModal={closeFolderModal}
          currentFolders={currentFolders}
          setCurrentFolders={setCurrentFolders}
          type={'notes'}
          modelType={modelName}
        />
      )}

      {currentPrinting.id && !currentPrinting.loader && (
        <div className='d-none'>
          <ContactNotePrint
            key={selectedNote}
            ref={folderNotePrintRef}
            user={currentUser}
            selectedNote={notes?.results || []}
          />
        </div>
      )}

      {currentDeleteFolder.isModal && (
        <DeleteFolderDetails
          currentDeleteFolder={currentDeleteFolder}
          clearDeleteFolderModal={clearDeleteFolderModal}
          isLoading={getNoteLoading}
          availableFolderDetails={currentFolders}
          setCurrentDeleteFolder={setCurrentDeleteFolder}
          handleMoveAndDeleteFolder={handleMoveAndDeleteFolder}
          columnsDetails={[
            {
              name: 'Title',
              width: '80%',
              sortable: (row) => row?.title,
              selector: (row) => row?.title,
              cell: (row) => (
                <span
                  className='text-capitalize cursor-pointer'
                  onClick={() => {
                    // setChecklistId(row?._id);
                  }}
                >
                  {row.title}
                </span>
              ),
            },
          ]}
        />
      )}

      {showTaskModal && (
        <TaskPopulateFromEmail
          setShowTaskModal={setShowTaskModal}
          showTaskModal={showTaskModal}
          currentMailDetail={taskData}
        />
      )}
    </>
  );
};

export default NoteDetails;
