import React, {
  useState,
  Fragment,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import _ from 'lodash';
import {
  Input,
  TabPane,
  Spinner,
  Button,
  DropdownItem,
  // Button,
} from 'reactstrap';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import {
  useCreateNote,
  useDeleteNote,
  useGetNotes,
  usePrintNotes,
  useUpdateNote,
} from '../hooks/noteApi';
import { Plus, Printer } from 'react-feather';
import { ContactNotes } from './Notes';
import ExportData from '../../../../components/ExportData';
import { uploadDocumentFileAPI } from '../../../../api/documents';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';
import ContactNotePrint from './ContactNotePrint';
import { useHistory } from 'react-router-dom';
import { ContactNoteModal } from './ContactNoteModal';
import TaskPopulateFromEmail from '../../communication/Email/components/TaskPopulateFromEmail';

const ContactNoteTab = ({
  params,
  modelName = 'Contacts',
  currentContactDetail = null,
  folderDetail = null,
  currentCompanyUsers = [],
}) => {
  // ** Var **
  const history = useHistory();

  // ** Ref **
  const notePrintRef = useRef();
  // const recordToFocusRef = useRef(null);

  // ** Store **
  const currentUser = useSelector(userData);

  // ** State **
  const [notes, setNotes] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({
    limit: 15,
    page: 1,
    search: '',
  });
  const [initialNotesLoading, setInitialNotesLoading] = useState(1);
  const [currentNote, setCurrentNote] = useState('');
  const [addOrEditNote, setAddOrEditNote] = useState(false);
  const [currentNoteTitle, setCurrentNoteTitle] = useState('');
  const [currentEditNoteIdx, setCurrentEditNoteIdx] = useState(null);
  const [selectedNote, setSelectedNote] = useState([]);
  const [printNotesData, setPrintNotesData] = useState([]);
  const [showPrinting, setShowPrinting] = useState(false);
  const [open, setOpen] = useState([]);
  const [attachmentFileUrl, setAttachmentFileUrl] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [mentionUsers, setMentionUsers] = useState([]);
  const [highlightNotes, setHighlightNote] = useState([]);
  const [taskData, setTaskData] = useState({ subject: '' });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTextNote, setSelectedTextNote] = useState({
    note: null,
    text: null,
  });
  const [allowAutoSave, setAllowAutoSave] = useState(true);

  const { getNotes, isLoading: getNoteLoading } = useGetNotes();
  const { getPrintTask, isLoading: printLoading } = usePrintNotes();
  const { createNote, isLoading: createLoader } = useCreateNote();
  const { updateNote, isLoading: updateLoader } = useUpdateNote();
  const { deleteNote } = useDeleteNote();
  const getCurrentContactNotes = async () => {
    setInitialNotesLoading(true);
    if (params.id !== 'add') {
      const { data, error } = await getNotes({
        company: currentUser.company?._id,
        modelId: params.id,
        modelName,
        ...(folderDetail && { folder: folderDetail }),
        ...currentFilters,
      });
      if (!error) {
        const searchValue = new URLSearchParams(location.search);
        const isNoteId = searchValue.get('note');
        if (isNoteId) {
          data.forEach((tempNote, index) => {
            if (tempNote?._id === isNoteId) {
              setOpen([
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
        setNotes({ results: data.notes, total: data.total });
      }
    }
    setInitialNotesLoading(false);
  };

  const loadMoreContactNotes = async (filters, reset = false) => {
    if (reset) setInitialNotesLoading(true);
    if (params.id !== 'add') {
      const { data, error } = await getNotes({
        company: currentUser.company?._id,
        modelId: params.id,
        modelName,
        ...filters,
      });
      if (!error) {
        setNotes((prev) => ({
          results: [...(reset ? [] : prev.results), ...(data.notes ?? [])],
          total: data.total,
        }));
      }
    }
    setInitialNotesLoading(false);
  };

  // useEffect(() => {
  //   // After the component mounts and records are loaded, scroll to the recordToFocusRef
  //   if (recordToFocusRef.current) {
  //     recordToFocusRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [notes]);

  useEffect(() => {
    getCurrentContactNotes();
  }, [folderDetail]);

  useEffect(() => {
    if (currentCompanyUsers.length) {
      // HELLO
      setMentionUsers(
        currentCompanyUsers.map((user) => ({
          label: `${user?.firstName || ''} ${user?.lastName || ''}`,
          value: user?._id,
        }))
      );
    }
  }, [currentCompanyUsers]);

  const addNote = async ({
    noteTitle = currentNoteTitle,
    note = currentNote,
    attachments = attachmentFileUrl,
    currentEditNote = currentEditNoteIdx,
    notes,
  }) => {
    const currentNoteTitle = noteTitle;
    const noteText = note;
    const attachmentFileUrl = attachments;

    if (currentUser) {
      if (currentEditNote !== null) {
        const editNoteObj = {
          title: currentNoteTitle,
          note: noteText,
          attachments: attachmentFileUrl,
          company: currentUser.company?._id,
        };

        const { data, error } = await updateNote(
          currentEditNote?._id,
          editNoteObj
        );
        if (!error) {
          let tempNotes = JSON.parse(JSON.stringify(notes.results ?? []));
          tempNotes = tempNotes.map((note) => {
            if (String(note._id) === String(currentEditNote?._id)) {
              note = data;
            }
            return note;
          });
          setNotes({ ...notes, results: tempNotes });
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
          updatedBy: currentUser?._id,
        });
        if (!error) {
          const tempNotes = JSON.parse(JSON.stringify(notes.results ?? []));
          setCurrentEditNoteIdx(data);
          setNotes({ results: [data, ...tempNotes], total: notes.total + 1 });
        }
        setAllowAutoSave(true);
      }
    }
  };

  const cancelNote = () => {
    setCurrentEditNoteIdx(null);
    setCurrentNote('');
    setCurrentNoteTitle('');
    setAttachmentFileUrl([]);
    setAddOrEditNote(false);
    setAllowAutoSave(true);
  };

  const handlePrintNotes = async () => {
    setPrintNotesData([]);
    const { data, error } = await getPrintTask({
      company: currentUser.company?._id,
      modelId: params.id,
      modelName,
      search: currentFilters.search,
    });
    if (data && !error && _.isArray(data)) {
      setPrintNotesData(data);
      setShowPrinting(true);
    }
    handlePrint();
  };

  const removeNote = async (id) => {
    const result = await showWarnAlert({
      text: 'Are you want to delete this note?',
    });

    if (result.value) {
      const { error } = await deleteNote(id);
      if (!error) {
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

  const toggle = (id) => {
    const tempOpen = [...open];
    if (tempOpen.includes(id)) {
      const index = tempOpen.indexOf(id);
      if (index > -1) {
        tempOpen.splice(index, 1);
      }
    } else {
      tempOpen.push(id);
    }
    setOpen(tempOpen);

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

  const selectAllNote = () => {
    const tempNotes = JSON.parse(JSON.stringify(selectedNote));
    const tempNote = JSON.parse(JSON.stringify(notes.results ?? []));
    tempNote.map((note) => {
      if (
        !tempNotes.find((selectedNote) =>
          moment(selectedNote?.updatedAt).isSame(note?.updatedAt)
        )
      ) {
        tempNotes.push(note);
      }
    });
    setSelectedNote(tempNotes);
  };

  const resetNoteModal = () => {
    setCurrentEditNoteIdx(null);
    setCurrentNote('');
    setCurrentNoteTitle('');
    setAttachmentFileUrl([]);
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

  const handlePrint = useReactToPrint({
    content: () => notePrintRef.current,
  });

  const handleSearchNote = useCallback(
    _.debounce(async (search) => {
      setCurrentFilters((prev) => ({ ...prev, page: 1 }));
      await loadMoreContactNotes({ ...currentFilters, search, page: 1 }, true);
    }, 300),
    []
  );

  return (
    <>
      <TabPane tabId='notes' className='contact-notes-tabPane'>
        <div className='inner-contant-wrapper'>
          <div className='available-notes-wrapper mt-2 no-margin no-border'>
            {false && (
              <div className='available-notes-header'>
                <div className='d-inline-flex align-items-center search-note'>
                  <Input
                    className=''
                    type='text'
                    placeholder='Search Note'
                    onChange={(e) => {
                      handleSearchNote(e.target.value);
                      setCurrentFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className={`print-action-wrapper`}>
                  {false && (
                    <div className='select-all'>
                      <Input
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            selectAllNote();
                          } else {
                            setSelectedNote([]);
                          }
                        }}
                        className=''
                        type='checkbox'
                      />
                      <span className='text'>Select All</span>
                    </div>
                  )}
                  <ExportData
                    model='notes'
                    query={{
                      company: currentUser.company?._id,
                      modelName,
                      modelId: params.id,
                      search: currentFilters.search,
                    }}
                    parentLoading={printLoading}
                    childDropDownOptions={
                      <>
                        <DropdownItem
                          className='w-100'
                          onClick={handlePrintNotes}
                          disabled={printLoading}
                        >
                          <Printer size={15} />
                          <span className='align-middle ms-50'>Print</span>
                        </DropdownItem>
                      </>
                    }
                  />
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
            )}

            <div className='notes-list-scroll-area hide-scrollbar'>
              {initialNotesLoading ? (
                <div className='d-flex justify-content-center align-content-center pt-2 pb-2'>
                  <Spinner />
                </div>
              ) : (
                <>
                  {notes.results?.length > 0 ? (
                    <>
                      {notes.results
                        ?.filter((note) => note.isPinned)
                        .map((note, key) => {
                          return (
                            <Fragment key={key}>
                              <div
                              // ref={
                              //   note._id === highlightNotes?.[0]
                              //     ? recordToFocusRef
                              //     : null
                              // }
                              >
                                <ContactNotes
                                  searchNote={currentFilters.search}
                                  index={key}
                                  open={open}
                                  toggle={toggle}
                                  updateNotePin={updateNotePin}
                                  removeNote={removeNote}
                                  setCurrentNote={setCurrentNote}
                                  setCurrentEditNoteIdx={setCurrentEditNoteIdx}
                                  setCurrentNoteTitle={setCurrentNoteTitle}
                                  currentEditNoteIdx={currentEditNoteIdx}
                                  note={note}
                                  notes={notes}
                                  user={currentUser}
                                  selectedCurrentNotes={selectedCurrentNotes}
                                  selectedNote={selectedNote}
                                  setAttachmentFileUrl={setAttachmentFileUrl}
                                  attachmentFileUrl={attachmentFileUrl}
                                  highlightNotes={highlightNotes}
                                  setAddOrEditNote={setAddOrEditNote}
                                  setShowTaskModal={setShowTaskModal}
                                  setTaskData={setTaskData}
                                  selectedTextNote={selectedTextNote}
                                  setSelectedTextNote={setSelectedTextNote}
                                  currentContactDetail={currentContactDetail}
                                  modelName={modelName}
                                />
                              </div>
                            </Fragment>
                          );
                        })}
                      {notes.results
                        ?.filter((note) => !note.isPinned)
                        .map((note, key) => {
                          return (
                            <Fragment key={key}>
                              <div>
                                <ContactNotes
                                  searchNote={currentFilters.search}
                                  open={open}
                                  index={key}
                                  toggle={toggle}
                                  updateNotePin={updateNotePin}
                                  removeNote={removeNote}
                                  setCurrentNote={setCurrentNote}
                                  setCurrentEditNoteIdx={setCurrentEditNoteIdx}
                                  setCurrentNoteTitle={setCurrentNoteTitle}
                                  currentEditNoteIdx={currentEditNoteIdx}
                                  note={note}
                                  notes={notes}
                                  user={currentUser}
                                  selectedCurrentNotes={selectedCurrentNotes}
                                  selectedNote={selectedNote}
                                  setAttachmentFileUrl={setAttachmentFileUrl}
                                  attachmentFileUrl={attachmentFileUrl}
                                  highlightNotes={highlightNotes}
                                  setAddOrEditNote={setAddOrEditNote}
                                  setShowTaskModal={setShowTaskModal}
                                  setTaskData={setTaskData}
                                  selectedTextNote={selectedTextNote}
                                  setSelectedTextNote={setSelectedTextNote}
                                  currentContactDetail={currentContactDetail}
                                  modelName={modelName}
                                />
                              </div>
                            </Fragment>
                          );
                        })}
                      {notes.results?.length < notes.total && (
                        <div className='text-center loadMore-btn-wrapper'>
                          <Button
                            outline={true}
                            color='primary'
                            onClick={() => {
                              setCurrentFilters({
                                ...currentFilters,
                                page: currentFilters.page + 1,
                              });
                              loadMoreContactNotes({
                                ...currentFilters,
                                page: currentFilters.page + 1,
                              });
                            }}
                          >
                            {getNoteLoading && <Spinner size='sm mr-1' />} Load
                            More
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
            </div>
          </div>
        </div>
      </TabPane>

      {showTaskModal && (
        <TaskPopulateFromEmail
          setShowTaskModal={setShowTaskModal}
          showTaskModal={showTaskModal}
          currentMailDetail={taskData}
        />
      )}

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
        />
      )}
      {showPrinting && (
        <ContactNotePrint
          key={selectedNote}
          ref={notePrintRef}
          user={currentUser}
          selectedNote={printNotesData ?? []}
        />
      )}
    </>
  );
};

export default ContactNoteTab;
