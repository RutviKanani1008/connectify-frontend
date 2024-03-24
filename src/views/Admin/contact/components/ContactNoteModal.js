import _ from 'lodash';
import { Icon } from '@iconify/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from 'reactstrap';

import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../../../constant';
import NewTaskManagerFileDropZone from '../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';
import CreatableSelect from 'react-select/creatable';
import { selectThemeColors } from '../../../../utility/Utils';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { useCreateFolder } from '../../groups/hooks/groupApis';

export const ContactNoteModal = (props) => {
  const {
    allowAutoSave,
    notes,
    currentNoteTitle,
    setCurrentNoteTitle,
    cancelNote,
    currentNote,
    addNote,
    currentEditNoteIdx,
    setCurrentNote,
    mentionUsers,
    attachmentUpload,
    removeAttachmentFile,
    attachmentFileUrl,
    fileUploading,
    changeUploadFileName,
    addOrEditNote,
    saveLoader,
    removeNote,
    currentFolders = [],
    setCurrentNoteFolder,
    currentNoteFolder,
    modelType,
    contactId,
    setCurrentFolders,
  } = props;
  const currentUser = useSelector(userData);

  const isInitialMount = useRef(true);
  const [hasChanged, setHasChanged] = useState(false);
  const [isContentUnsaved, setIsContentUnsaved] = useState(false);
  const { createFolder } = useCreateFolder();

  useEffect(() => {
    return () => {
      autoSaveNote.cancel();
    };
  }, []);

  useEffect(async () => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsContentUnsaved(true);
    const isNoteValid = currentNote?.trim()?.length > 0;
    const isDataValid = checkIsDataValid();
    if (allowAutoSave && (isNoteValid || (currentEditNoteIdx && isDataValid))) {
      autoSaveNote({
        noteTitle: currentNoteTitle,
        note: currentNote || '',
        attachments: attachmentFileUrl,
        currentNoteFolderDetail: currentNoteFolder,
      });
    } else if (allowAutoSave && !isDataValid && currentEditNoteIdx) {
      await removeNote(currentEditNoteIdx._id, false);
      setHasChanged(false);
      setIsContentUnsaved(false);
    }
  }, [
    allowAutoSave,
    currentNoteTitle,
    currentNoteFolder,
    currentNote,
    attachmentFileUrl,
  ]);

  const checkIsDataValid = () => {
    const isTitleValid = currentNoteTitle?.trim()?.length > 0;
    const isNoteValid = currentNote?.trim()?.length > 0;
    const isAttachmentValid = attachmentFileUrl.length > 0;
    return isNoteValid || isTitleValid || isAttachmentValid;
  };

  const handleSaveAndClose = async () => {
    if (saveLoader) {
      return;
    }

    if (isContentUnsaved && checkIsDataValid()) {
      setHasChanged(true);
      await addNote({
        noteTitle: currentNoteTitle,
        note: currentNote || '',
        attachments: attachmentFileUrl,
        currentEditNote: currentEditNoteIdx,
        currentNoteFolderDetail: currentNoteFolder,
        notes,
      });
      setIsContentUnsaved(false);
    }
    cancelNote();
  };

  const autoSaveNote = useCallback(
    _.debounce(async (args) => {
      setHasChanged(true);
      await addNote({
        ...args,
        currentEditNote: currentEditNoteIdx,
        notes,
      });
      setIsContentUnsaved(false);
    }, 500),
    [currentEditNoteIdx, notes]
  );

  const handleFolderValue = async (value) => {
    if (value) {
      const tempFolders = JSON.parse(JSON.stringify(currentFolders));
      const isFolderExist = tempFolders.find(
        (folder) => folder?._id === value?.value
      );
      if (!isFolderExist) {
        const obj = {};
        obj.folderName = value.value;
        obj.company = currentUser?.company?._id;
        obj.folderFor = 'notes';
        obj.model = modelType;
        obj.modelRecordId = contactId;
        obj.order = 0;
        const { data, error } = await createFolder(obj);
        if (!error) {
          tempFolders?.push({ ...data, totalData: 0 });
          setCurrentFolders(tempFolders);
          setCurrentNoteFolder({
            id: data?._id,
            value: data?._id,
            label: data?.folderName,
          });
        }
      } else {
        setCurrentNoteFolder({
          id: isFolderExist?._id,
          value: isFolderExist?._id,
          label: isFolderExist?.folderName,
        });
      }
    } else {
      setCurrentNoteFolder('');
    }
  };

  return (
    <>
      <Modal
        fade={false}
        isOpen={addOrEditNote}
        className='modal-dialog modal-dialog-centered add-update-note-modal modal-dialog-mobile'
      >
        <ModalHeader
          className='modal-header'
          toggle={() => {
            handleSaveAndClose();
          }}
        >
          <div className='d-flex align-items-center'>
            <div>{currentEditNoteIdx ? 'Update' : 'Add'} Note</div>
            {hasChanged && (
              <div
                style={{ fontWeight: 400, fontSize: '15px', marginLeft: '5px' }}
              >
                {saveLoader ? (
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
              </div>
            )}
          </div>
        </ModalHeader>

        <form className='auth-login-form'>
          <ModalBody>
            <div className='mb-1'>
              <CreatableSelect
                isLoading={false}
                theme={selectThemeColors}
                className={classNames('react-select')}
                placeholder={'Select Folder'}
                classNamePrefix='custom-select'
                options={currentFolders
                  ?.filter((folder) => folder._id !== 'unassigned')
                  ?.map((folder) => ({
                    id: folder?._id,
                    value: folder?._id,
                    label: folder?.folderName,
                  }))}
                isClearable={true}
                defaultValue={currentNoteFolder}
                onChange={(e) => {
                  handleFolderValue(e);
                }}
              />
            </div>
            <div className='header__title d-flex align-items-center mb-1'>
              <Input
                className=''
                type='string'
                value={currentNoteTitle || ''}
                placeholder={'Enter Note Title'}
                onChange={(e) => {
                  setCurrentNoteTitle(e.target.value);
                }}
              />
            </div>

            <SyncfusionRichTextEditor
              key={`contact_note`}
              name='rte1'
              list='#rte1_rte-edit-view'
              onChange={(e) => {
                setCurrentNote(e.value);
              }}
              value={currentNote}
              mentionOption={mentionUsers}
              mentionEnable
            />

            <div className='attachment-SpeechToText-wrapper'>
              <div className='attachment-save-btn-wrapper'>
                <NewTaskManagerFileDropZone
                  multiple={true}
                  filesUpload={attachmentUpload}
                  removeFile={removeAttachmentFile}
                  fileURLArray={attachmentFileUrl}
                  accept={AVAILABLE_FILE_FORMAT}
                  fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
                  fieldName='attachments'
                  loading={fileUploading}
                  fileRowSize={2}
                  changeUploadFileName={changeUploadFileName}
                />
              </div>
              <Button
                className='cancel-btn'
                type='button'
                color='primary'
                disabled={saveLoader}
                onClick={() => {
                  handleSaveAndClose();
                }}
              >
                Save & Close
              </Button>
            </div>
          </ModalBody>
        </form>
      </Modal>
    </>
  );
};
