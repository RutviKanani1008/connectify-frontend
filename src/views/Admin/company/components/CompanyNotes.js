import { useSelector } from 'react-redux';
import { useState, useRef, useCallback, useEffect } from 'react';

import _ from 'lodash';
import moment from 'moment';
import { Spinner } from 'reactstrap';
import { Icon } from '@iconify/react';
import parse from 'html-react-parser';

import { userData } from '../../../../redux/user';
import { updateCompanyNoteById } from '../../../../api/company';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';

import NoteActionDropdown from './NoteAction';
import PinnedNotesModal from './PinnedNotesModal';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';

const CompanyNotes = ({ notes, setNotes, companyId }) => {
  const allNotesRef = useRef(notes);
  const user = useSelector(userData);

  const [currentNote, setCurrentNote] = useState('');
  const [isNoteEdit, setIsNoteEdit] = useState(null);
  const [hasChanged, setHasChanged] = useState(false);
  const [openPinnedModal, setOpenPinnedModal] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    allNotesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    return () => {
      autoSaveNote.cancel();
    };
  }, []);

  const addNotes = async ({ currentNote }) => {
    setNoteLoading(true);
    const tempNotes = _.cloneDeep(notes);
    let flag = 0;
    const noteText = currentNote;
    if (isNoteEdit !== null) {
      tempNotes[isNoteEdit].text = noteText;
      flag = 1;
    } else if (currentNote) {
      tempNotes.push({
        text: noteText,
        isPinned: false,
        createdAt: moment().toLocaleString(),
        userId: { firstName: user?.firstName, lastName: user?.lastName },
      });
      flag = 1;
    }

    if (flag && companyId !== 'add') {
      const currentNotes = tempNotes;
      const res = await updateCompanyNoteById(companyId, {
        notes: currentNotes,
      });

      if (res.error) {
        showToast(TOASTTYPES.error, '', res.error);
      }
    }
    setNotes(tempNotes);
    if (isNoteEdit === null) {
      setIsNoteEdit(tempNotes.length - 1);
    }

    setNoteLoading(false);
  };

  const removeNote = (pos) => {
    // if (isNoteEdit === pos) {
    setIsNoteEdit(null);
    setHasChanged(false);
    setCurrentNote('');
    // }
    const newNotes = notes.filter((note, index) => index !== pos);
    if (companyId !== 'add') {
      const toastId = showToast(TOASTTYPES.loading, '', "Note's Updating...");
      updateCompanyNoteById(companyId, { notes: newNotes }).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(TOASTTYPES.success, toastId, "Note's Updated Successfully");
        }
      });
    }
    setNotes(newNotes);
  };

  const editNote = (pos) => {
    setNotes((prev) => {
      return prev.map((note, idx) =>
        isNoteEdit === idx ? { ...note, text: currentNote } : note
      );
    });
    setCurrentNote(notes[pos].text);
    setIsNoteEdit(pos);
    setHasChanged(false);
  };

  const pinNote = (pos) => {
    const newNotes = notes.map((note, idx) => {
      return idx === pos ? { ...note, isPinned: true } : note;
    });
    if (companyId !== 'add') {
      const toastId = showToast(TOASTTYPES.loading, '', "Note's Pin...");
      updateCompanyNoteById(companyId, { notes: newNotes }).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(TOASTTYPES.success, toastId, "Note's Pinned Successfully");
        }
      });
    }
    setNotes(newNotes);
  };

  const unpinNote = (pos) => {
    const newNotes = notes.map((note, idx) => {
      return idx === pos ? { ...note, isPinned: false } : note;
    });
    if (companyId !== 'add') {
      const toastId = showToast(TOASTTYPES.loading, '', "Note's Unpin...");
      updateCompanyNoteById(companyId, { notes: newNotes }).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          showToast(
            TOASTTYPES.success,
            toastId,
            "Note's UnPinned Successfully"
          );
        }
      });
    }
    setNotes(newNotes);
  };

  const autoSaveNote = useCallback(
    _.debounce(async (args) => {
      setHasChanged(true);
      await addNotes({ ...args, notes });
    }, 500),
    [companyId, isNoteEdit, notes]
  );

  return (
    <div className='add-notes-sec'>
      <div className='inner-scroll-wrapper fancy-scrollbar'>
        <div className='header-action'>
          <h4 className='section-title-second-heading'>Add Notes</h4>
          {companyId !== 'add' && hasChanged && (
            <>
              {noteLoading ? (
                <div className='d-flex'>
                  <Spinner
                    size='sm'
                    color='#a3db59'
                    style={{ margin: '4px 2px' }}
                  />
                  <span>Saving</span>
                </div>
              ) : (
                <div className='d-flex'>
                  <Icon
                    className='success'
                    color='#a3db59'
                    icon='ep:success-filled'
                    width='20'
                  />
                  <span>Saved</span>
                </div>
              )}
            </>
          )}

          {currentNote && (
            <a
              role='button'
              className='view-pinned-note-btn'
              onClick={() => {
                setIsNoteEdit(null);
                setHasChanged(false);
                setCurrentNote('');
                setNotes((prev) => {
                  return prev.map((note, idx) =>
                    isNoteEdit === idx ? { ...note, text: currentNote } : note
                  );
                });
              }}
            >
              Add New Note
            </a>
          )}
        </div>
        <div className='fixed-add-note'>
          {/* <Editor
            editorStyle={{
              border: '1px solid',
              minHeight: '175px',
            }}
            onEditorStateChange={(state) => {
              setCurrentNote(state);

              const areStatesEqual = currentNote
                .getCurrentContent()
                .equals(state.getCurrentContent());

              const hasText = state.getCurrentContent()?.hasText();

              if (!areStatesEqual && hasText) {
                autoSaveNote({ currentNote: state });
              }
            }}
            wrapperClassName='template-editor-wrapper'
            editorClassName='editor-class'
            editorState={currentNote}
          /> */}

          <SyncfusionRichTextEditor
            key={`company_note`}
            onChange={(e) => {
              setCurrentNote(e.value);
              if (e.value) {
                autoSaveNote({ currentNote: e.value });
              } else if (isNoteEdit) {
                removeNote(isNoteEdit);
              }
            }}
            value={currentNote}
          />
          {/* <div className='button-wrapper'>
            <SaveButton
              color='primary'
              type='button'
              onClick={() => addNotes(currentNote)}
              // loading={noteLoading}
              name={isNoteEdit !== null ? 'Update Note' : 'Add Note'}
              width='200px'
              className='align-items-center justify-content-center'
            />
          </div> */}
        </div>
        <div
          className='d-flex'
          style={{
            justifyContent: 'end',
            padding: '8px 14px',
            color: 'var(--primaryColorDark)',
          }}
        >
          {notes.filter((note) => note.isPinned).length ? (
            <a
              role='button'
              className='view-pinned-note-btn'
              onClick={() => setOpenPinnedModal(true)}
            >
              View Pinned Notes
            </a>
          ) : null}
        </div>
        <div className='note-listing-wrapper fancy-scrollbar'>
          {notes.filter((n) => !n.isPinned).length > 0 ? (
            notes.map((note, key) => {
              return (
                !note.isPinned && (
                  <div className='notes-card-box' key={key}>
                    <div className='text'>
                      {note.text ? parse(note.text) : ''}
                    </div>
                    <div className='author-date-name'>
                      <span className='author-name'>
                        {note?.userId?.firstName} {note?.userId?.lastName}
                      </span>
                      <span className='date'>
                        {moment(new Date(note.createdAt)).format(
                          `${
                            user?.company?.dateFormat
                              ? user?.company?.dateFormat
                              : 'MM/DD/YYYY'
                          }, HH:mm A`
                        )}
                      </span>
                    </div>
                    <div className='action-btn-wrapper'>
                      <NoteActionDropdown
                        noteIdx={key}
                        pinNote={pinNote}
                        removeNote={removeNote}
                        editNote={editNote}
                      />
                    </div>
                  </div>
                )
              );
            })
          ) : (
            <div className='no-data-wrapper'>
              <div className='icon-wrapper'>
                <svg
                  version='1.1'
                  id='Layer_1'
                  x='0px'
                  y='0px'
                  viewBox='0 0 204 204'
                >
                  <path
                    style={{ fill: 'var(--primaryColor)' }}
                    d='M169.2,80.2c0,4.2-1.9,7-5.2,8.1c-3.1,1.1-6.4,0.1-8.5-2.5c-1.5-1.8-1.7-3.9-1.7-6.1
              c0-14.9,0-29.7,0-44.6c0-5.4-1.7-10-6-13.5c-2.8-2.2-6.1-3.2-9.6-3.2c-31.3,0-62.6-0.1-94,0c-8.6,0-14.9,6.1-15.5,14.6
              c0,0.6-0.1,1.3-0.1,1.9c0,44.3,0,88.5,0,132.8c0,5.5,1.7,10,6.1,13.4c2.9,2.3,6.4,3.2,10,3.2c8.3,0,16.5,0,24.8,0
              c3.6,0,6.4,2,7.4,5.3c1,3,0.1,6.5-2.5,8.2c-1.5,1-3.4,1.7-5.1,1.7c-8.5,0.2-16.9,0.1-25.4,0.1C27,199.8,13,186,13.1,168
              c0.2-25.4,0.1-50.8,0.1-76.3c0-19,0-37.9,0-56.9c0-12.1,5-21.4,15.4-27.5c3.2-1.9,7-2.6,10.6-3.8c0.5-0.2,1-0.3,1.5-0.4h101.1
              c0.9,0.2,1.7,0.4,2.6,0.6c14.8,3,24.7,15.3,24.8,30.8C169.3,49.7,169.2,64.9,169.2,80.2z M189.5,130c0,7-2.3,12.5-6.8,17
              c-13.8,13.8-27.6,27.6-41.5,41.4c-1.3,1.3-3.1,2.3-4.9,2.8c-9.6,2.8-19.3,5.4-29,8.1c-4.9,1.3-9-0.5-10.2-4.8
              c-0.4-1.6-0.4-3.5,0-5.1c2.8-9.8,5.8-19.5,8.9-29.2c0.5-1.6,1.5-3.2,2.7-4.3c13.7-13.8,27.5-27.6,41.3-41.3
              c6.6-6.5,14.6-8.7,23.5-5.9c8.7,2.8,13.9,8.9,15.8,17.9C189.4,127.9,189.4,129.3,189.5,130z M159.3,148.6
              c-3.6-3.6-7.2-7.2-11.1-11.1c-0.3,0.5-0.6,1.1-1.1,1.6c-7,7-13.9,14.2-21.1,21c-4.1,3.9-7.1,8.1-8.1,13.6c-0.4,2.3-1.3,4.6-2.1,7.2
              c4.9-1.4,9.5-2.6,14-3.9c1-0.3,2-0.9,2.7-1.6c8.6-8.6,17.2-17.2,25.9-25.8C158.6,149.3,159,148.9,159.3,148.6z M173.9,128.7
              c-0.8-3.1-3-5-6.1-5.7c-3-0.6-6.1,0.8-7.9,3.6c3.5,3.5,7,7.1,10.6,10.6C173.3,135.2,174.7,132.4,173.9,128.7z M130.2,49.2
              c-13,0-26,0-39,0H81c-9.7,0-19.3,0-29,0c-4.9,0-8.4,3.6-8,8.3c0.3,4.3,3.6,7.1,8.5,7.1c25.8,0,51.6,0,77.4,0c0.5,0,1,0,1.5,0
              c3.7-0.3,6.6-3.2,6.9-6.8C138.8,52.8,135.3,49.2,130.2,49.2z M130,79.9c-25.9,0-51.7,0-77.6,0c-0.5,0-1,0-1.5,0.1
              c-3.6,0.4-6.4,3-6.8,6.5c-0.6,4.9,2.8,8.8,8,8.8c13,0,26,0,39,0h15.2c8.1,0,16.1,0,24.2,0c4.7,0,8-3.4,8-7.8
              C138.3,83,134.9,79.9,130,79.9z M99.4,110.7c-7.9-0.1-15.9,0-23.8,0c-7.9,0-15.7,0-23.6,0c-4.2,0-7.4,2.6-7.9,6.3
              c-0.8,4.9,2.7,9,7.8,9c7.9,0.1,15.9,0,23.8,0c7.9,0,15.7,0,23.6,0c4.2,0,7.4-2.6,7.9-6.3C107.9,114.7,104.5,110.7,99.4,110.7z'
                  />
                </svg>
              </div>
              <p className='text'>No any notes added</p>
            </div>
          )}
        </div>
      </div>
      <PinnedNotesModal
        isOpen={openPinnedModal}
        onClose={() => {
          setOpenPinnedModal(false);
        }}
        notes={notes}
        unpinNote={unpinNote}
      />
    </div>
  );
};

export default CompanyNotes;
