import {
  Button,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import NewTaskManagerFileDropZone from '../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { SaveButton } from '../../../../@core/components/save-button';
import { uploadDocumentFileAPI } from '../../../../api/documents';
import { useCreateBulkNote } from '../hooks/noteApi';
import {
  AVAILABLE_FILE_FORMAT,
  AVAILABLE_FILE_UPLOAD_SIZE,
} from '../../../../constant';
import SyncfusionRichTextEditor from '../../../../components/SyncfusionRichTextEditor';

export const BulkNotes = (props) => {
  const { showBulkNoteModal, handleCloseBulkNotes, selectedRowsFilters } =
    props;
  const currentUser = useSelector(userData);
  const [currentNote, setCurrentNote] = useState('');
  const [currentNoteTitle, setCurrentNoteTitle] = useState('');
  const [attachmentFileUrl, setAttachmentFileUrl] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);

  const attachmentUpload = (files) => {
    const formData = new FormData();
    formData.append(
      'filePath',
      `${currentUser?.company?._id}/contacts/bulkNote/notes`
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
  const { createBulkNote, isLoading: bulkNoteLoading } = useCreateBulkNote();

  const addNote = async () => {
    const noteText = currentNote;

    const { error } = await createBulkNote(
      {
        title: currentNoteTitle,
        note: noteText,
        attachments: attachmentFileUrl,
        modelName: 'Contacts',
        company: currentUser.company?._id,
        updatedBy: currentUser?._id,
        contactFilters: selectedRowsFilters,
      },
      'Note creating...'
    );
    if (!error) {
      handleCloseBulkNotes();
    }
  };

  return (
    <Modal
      isOpen={showBulkNoteModal}
      toggle={() => {
        handleCloseBulkNotes();
      }}
      size='xl'
      className={`modal-dialog-centered email-editor-modal checklist__template__modal`}
    >
      <ModalHeader
        toggle={() => {
          handleCloseBulkNotes();
        }}
      >
        Bulk Notes
      </ModalHeader>
      <ModalBody>
        <Row className='m-1'>
          <Col className='px-0' md='6'>
            <Row>
              <Col className='px-xl-1 mx-auto'>
                <Row>
                  <Label className='text-primary' sm='25'>
                    Title
                  </Label>

                  <Col md='12'>
                    <div className='mb-1'>
                      <Input
                        type='string'
                        value={currentNoteTitle || ''}
                        placeholder={'Enter Note Title'}
                        onChange={(e) => {
                          setCurrentNoteTitle(e.target.value);
                        }}
                      />
                    </div>
                  </Col>
                </Row>
                <div className='mb-1'>
                  {/* REVIEW - STYLE */}
                  <SyncfusionRichTextEditor
                    key={`bulk_contact_note`}
                    onChange={(e) => {
                      setCurrentNote(e.value);
                    }}
                    value={currentNote}
                  />
                  {/* editorStyle=
                  {{
                    border: '1px solid',
                    minHeight: '175px',
                  }}
                  wrapperClassName='template-editor-wrapper'
                  editorClassName='editor-class' */}
                </div>
              </Col>
            </Row>
          </Col>
          {/* <Col md="1"></Col> */}
          <Col className='w-50' md='5'>
            <Label sm='12'>Attachments</Label>
            <NewTaskManagerFileDropZone
              multiple={true}
              filesUpload={attachmentUpload}
              removeFile={removeAttachmentFile}
              fileURLArray={attachmentFileUrl}
              accept={AVAILABLE_FILE_FORMAT}
              // accept='.jpg,.jpeg,image/png,application/pdf,.doc,.docx,.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,.HEIC'
              fileSize={AVAILABLE_FILE_UPLOAD_SIZE}
              fieldName='attachments'
              loading={fileUploading}
              fileRowSize={2}
              changeUploadFileName={changeUploadFileName}
            />
          </Col>
        </Row>
        <Row>
          <div className='d-flex align-items-center justify-content-center'></div>
        </Row>
      </ModalBody>
      <ModalFooter>
        <SaveButton
          color='primary'
          type='button'
          onClick={addNote}
          loading={bulkNoteLoading}
          name={'Add Note'}
          width='150px'
          className='mb-1 mt-1 align-items-center justify-content-center'
          disabled={!currentNote}
        />
        <Button
          color='danger'
          onClick={() => {
            handleCloseBulkNotes();
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
