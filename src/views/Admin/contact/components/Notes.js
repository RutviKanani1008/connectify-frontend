import { Icon } from '@iconify/react';
import moment from 'moment';
import {
  ChevronDown,
  Download,
  Edit,
  Edit2,
  Eye,
  Printer,
  Trash,
  Link as LinkIcon,
  MoreVertical,
} from 'react-feather';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from 'reactstrap';
import { Fragment, useRef, useState } from 'react';
import { renderFile } from '../../../../@core/components/form-fields/NewTaskManagerFileSropZone';
import FilePreviewModal from '../../../../@core/components/form-fields/FilePreviewModal';
import {
  downloadFile,
  encrypt,
  getFileType,
} from '../../../../helper/common.helper';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { useReactToPrint } from 'react-to-print';
import ContactNotePrint from './ContactNotePrint';
import CopyToClipboard from 'react-copy-to-clipboard';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';

export const ContactNotes = (props) => {
  const {
    open,
    index: key,
    toggle,
    updateNotePin,
    removeNote,
    handleEditNoteDetails,
    currentEditNoteIdx,
    note,
    user,
    selectedCurrentNotes,
    selectedNote,
    searchNote,
    highlightNotes,
    setShowTaskModal,
    setTaskData,
    selectedTextNote,
    setSelectedTextNote,
    currentContactDetail,
    modelName,
  } = props;

  const notePrintRef = useRef(null);
  const currentUser = useSelector(userData);
  const [showCopyNoteLink, setShowCopyNoteLink] = useState({
    showModal: false,
    noteDetail: null,
  });
  const [currentCopyLinkValue, setCurrentCopyLinkValue] =
    useState('private-link');

  const [showNotePin, setShowNotePin] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);
  const containerRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const handleResetDocumentPreview = () => {
    setPreviewModalOpen(false);
    setCurrentPreviewFile(null);
  };
  const handleFileClick = (file) => {
    setCurrentPreviewFile(file?.baseUrl);
    setPreviewModalOpen(true);
  };

  const handleFileDownloadClick = (file) => {
    downloadFile(`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file.fileUrl}`);
  };

  const handlePrintNote = useReactToPrint({
    content: () => notePrintRef.current,
  });

  const highlightMatch = (text, query) => {
    if (!query) {
      return text;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight-text-color">$1</span>');
  };

  const highlightedParagraph = highlightMatch(
    note?.note ? note?.note : '',
    searchNote
  );
  const highlightedHeader = highlightMatch(
    note.title ? note.title : '',
    searchNote
  );

  const handleTextSelection = () => {
    const selectedText = window.getSelection().toString();
    if (
      selectedText &&
      !['', '\n'].includes(selectedText) &&
      selectedText !== selectedTextNote.text
    ) {
      setSelectedTextNote({
        note: note?._id,
        text: selectedText,
      });
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        const boundingRect = range.getBoundingClientRect();

        // Calculate the position of the tooltip
        const top = boundingRect.top + window.pageYOffset - 30; // Adjust the vertical position
        const left =
          boundingRect.left + window.pageXOffset + boundingRect.width / 2;

        setTooltipPosition({ top, left });
      }
    } else {
      setSelectedTextNote({ note: null, text: null });
    }
  };

  const showSuccessCopyLinkMessage = () => {
    const toastId = showToast(TOASTTYPES.loading, '', 'Copy Link...');
    showToast(TOASTTYPES.success, toastId, 'Note Link Copied');
  };

  const handleCopyLinkClick = (note) => {
    setShowCopyNoteLink({
      noteDetail: note,
      showModal: true,
    });
  };

  const handleCloseCopyNoteLink = () => {
    setShowCopyNoteLink({
      noteDetail: null,
      showModal: false,
    });
  };

  const handleCopyLink = () => {
    if (showCopyNoteLink.noteDetail) {
      navigator.clipboard.writeText(
        `${window.location.origin}/shared-note/${encrypt(
          JSON.stringify({
            [modelName === 'Contacts' ? 'contact' : 'user']: note._id,
            linkType: currentCopyLinkValue,
          })
        )}`
      );
      showSuccessCopyLinkMessage();
    }
    handleCloseCopyNoteLink();
    setCurrentCopyLinkValue('private-link');
  };
  return (
    <>
      <Accordion
        className={`accordion-margin contact-notes ${
          highlightNotes.includes(note._id) && 'highlight-notes'
        }`}
        open={open}
        toggle={() => {
          toggle(`${note?.isPinned ? `${key}-pinned` : `${key}-unpinned`}`);
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggle(`${note?.isPinned ? `${key}-pinned` : `${key}-unpinned`}`);
        }}
        onMouseOver={(event) => {
          event.stopPropagation();
          setShowNotePin(note?._id);
        }}
        onMouseLeave={(event) => {
          event.stopPropagation();
          setShowNotePin(false);
        }}
      >
        <AccordionItem>
          <AccordionHeader
            targetId={`${note?.isPinned ? `${key}-pinned` : `${key}-unpinned`}`}
          >
            <div className='inner-wrapper'>
              {false && (
                <Input
                  onChange={(e) => {
                    e.stopPropagation();
                    selectedCurrentNotes(note, e.target.checked);
                  }}
                  checked={
                    selectedNote?.find(
                      (temp) => String(temp?._id) === String(note?._id)
                    )
                      ? true
                      : false
                  }
                  type='checkbox'
                />
              )}
              <div className='heading-details'>
                <Label className='me-1'>#{note?.noteNumber}</Label>
                <h3 className='title'>
                  {note.title ? (
                    <div
                      className='note-name'
                      dangerouslySetInnerHTML={{ __html: highlightedHeader }}
                    ></div>
                  ) : (
                    ''
                  )}
                </h3>
                <div className='author-time'>
                  <span className='author-name'>
                    {note?.updatedBy?.firstName} {note?.updatedBy?.lastName}
                  </span>
                  <span className='time'>
                    {moment(note?.createdAt || new Date()).format(
                      `${user?.company?.dateFormat || 'MM/DD/YYYY'} | HH:mm A`
                    )}
                  </span>
                  {/* ADD MARGIN */}
                  {!open.includes(
                    `${note?.isPinned ? `${key}-pinned` : `${key}-unpinned`}`
                  ) && note.attachments?.length ? (
                    <span className='attachments-count'>
                      {note.attachments?.length} Attachment(s)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className='action-btn-wrapper'>
              {note?.isPinned ? (
                <div className='action-btn active-pin-btn'>
                  <Icon
                    icon='material-symbols:push-pin'
                    className='cursor-pointer text-primary'
                    width='20'
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNotePin(note);
                    }}
                  />
                </div>
              ) : showNotePin === note?._id ? (
                <div className='action-btn unpin-btn'>
                  <Icon
                    icon='material-symbols:push-pin'
                    className='cursor-pointer text-secondary'
                    width='20'
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNotePin(note);
                    }}
                  />
                </div>
              ) : null}
              <div className='action-btn print-btn'>
                <Printer
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrintNote();
                  }}
                />
              </div>
              <div className='action-btn print-btn'>
                <CopyToClipboard
                  key={note._id}
                  id={`copy-icon${note._id}`}
                  text={`${window.location.origin}/shared-note/${encrypt(
                    JSON.stringify({
                      [modelName === 'Contacts' ? 'contact' : 'user']: note._id,
                    })
                  )}`}
                >
                  <LinkIcon
                    size={15}
                    className='cursor-pointer'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLinkClick(note);
                    }}
                    id='copyC'
                  />
                </CopyToClipboard>
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`copy-icon${note._id}`}
                >
                  Copy Note Link
                </UncontrolledTooltip>
              </div>
              <ContactNotePrint
                key={selectedNote}
                ref={notePrintRef}
                user={currentUser}
                selectedNote={[note]}
              />
              <div className='action-btn edit-btn'>
                <Edit
                  onClick={(e) => {
                    e.stopPropagation();
                    window.scrollTo(0, 0);
                    handleEditNoteDetails(note);
                  }}
                />
              </div>
              <div className='action-btn delete-btn'>
                <Trash
                  onClick={(event) => {
                    event.stopPropagation();
                    removeNote(note?._id);
                  }}
                />
              </div>
              <div
                className='action-btn mobile-toggle-btn'
                style={{ display: 'none' }}
              >
                <MoreVertical color='#000000' className='' size={34} />
              </div>
              <div className='action-btn down-arrow-btn'>
                <ChevronDown color='#000000' className='' size={34} />
              </div>
            </div>
          </AccordionHeader>
          <AccordionBody
            accordionId={`${
              note?.isPinned ? `${key}-pinned` : `${key}-unpinned`
            }`}
            key={key}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div
              className='contant-wrapper'
              ref={containerRef}
              onMouseUp={(event) => {
                event.stopPropagation();
                handleTextSelection();
              }}
              style={{ userSelect: 'text', position: 'relative' }}
            >
              <div className='normal-text'>
                {note?.note ? (
                  <>
                    <p
                      id='tooltipContainer'
                      dangerouslySetInnerHTML={{ __html: highlightedParagraph }}
                    ></p>
                    {selectedTextNote.text &&
                      selectedTextNote.text !== '' &&
                      selectedTextNote?.note === note._id && (
                        <>
                          <div
                            className='selected-text-new-task-btn-wrapper'
                            style={{
                              position: 'fixed',
                              zIndex: 5,
                              // width: '100px',
                              // height: '20px',
                              inset: `${tooltipPosition.top}px 0 0 ${tooltipPosition.left}px`,
                              left: tooltipPosition.left,
                              top: tooltipPosition.top,
                            }}
                          >
                            <Button
                              color='primary'
                              className={'new-task-btn'}
                              onMouseUp={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                setTaskData({
                                  subject: selectedTextNote.text,

                                  ...(modelName === 'Contacts' && {
                                    contact: {
                                      isEnableBilling:
                                        currentContactDetail?.enableBilling,
                                      label:
                                        `${currentContactDetail.firstName} ${currentContactDetail.lastName}`.trim() ||
                                        currentContactDetail.email,
                                      profile:
                                        currentContactDetail?.userProfile ||
                                        null,
                                      value: currentContactDetail?._id,
                                    },
                                  }),
                                });
                                setShowTaskModal(true);
                              }}
                            >
                              Create Task
                            </Button>
                          </div>
                        </>
                      )}
                  </>
                ) : (
                  ''
                )}
              </div>
              {note?.attachments?.length > 0 && (
                <>
                  <div className='attachment-wrapper'>
                    {note?.attachments?.map((file, index) => {
                      return (
                        <Fragment key={index}>
                          <div className='file__card'>
                            <div className='inner-border-wrapper'>
                              <div className='inner-wrapper'>
                                <div className='file__preview'>
                                  {renderFile(
                                    `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`
                                  )}
                                </div>
                                <div
                                  className='overlay cursor-pointer'
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleFileClick({
                                      name: file.fileName,
                                      type: getFileType(file?.fileUrl),
                                      url: `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file?.fileUrl}`,
                                      baseUrl: `${file?.fileUrl}`,
                                    });
                                  }}
                                >
                                  <div className='action-btn-wrapper'>
                                    <div className='action-btn view-btn'>
                                      <Eye color='#ffffff' />
                                    </div>
                                    <div className='action-btn download-btn'>
                                      <Download
                                        color='#ffffff'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleFileDownloadClick(file);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                </>
              )}
              <div className='footer-details'>
                <span className='author-name'>
                  {note?.updatedBy?.firstName} {note?.updatedBy?.lastName}
                </span>
                <span className='time'>
                  {moment(note?.createdAt || new Date()).format(
                    `${user?.company?.dateFormat || 'MM/DD/YYYY'}, HH:mm A`
                  )}
                </span>
                <div className='action-btn-wrapper'>
                  <div className='action-btn delete-btn'>
                    <Trash
                      className={`text-primary ${
                        currentEditNoteIdx !== key
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed'
                      } `}
                      size={20}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNote(note?._id);
                      }}
                    />
                  </div>
                  <div className='action-btn edit-btn'>
                    <Edit2
                      className='cursor-pointer text-primary'
                      // className={`cursor-pointer text-primary ${
                      //   currentEditNoteIdx !== key ? '' : 'text-green'
                      // } `}
                      size={18}
                      // color={currentEditNoteIdx === key ? 'green' : '#a3db59'}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.scrollTo(0, 0);
                        handleEditNoteDetails(note);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionBody>
        </AccordionItem>
      </Accordion>
      {showCopyNoteLink.showModal && (
        <Modal
          isOpen={showCopyNoteLink.showModal}
          toggle={handleCloseCopyNoteLink}
          className='modal-dialog-centered'
          backdrop='static'
        >
          <ModalHeader toggle={handleCloseCopyNoteLink}>
            Copy Note Link
          </ModalHeader>
          <ModalBody
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className='align-center'>
              <div className='radio-btn-wrapper d-flex flex-inline'>
                <div className='form-check radio-btn-repeater me-2'>
                  <Input
                    type='radio'
                    name='barcode'
                    id='private-link'
                    value={currentCopyLinkValue === 'private-link'}
                    onChange={(event) => {
                      event.stopPropagation();
                      setCurrentCopyLinkValue('private-link');
                    }}
                    defaultChecked={currentCopyLinkValue === 'private-link'}
                  />
                  <Label className='form-check-label' for='private-link'>
                    Private Link
                  </Label>
                </div>
                <div className='form-check radio-btn-repeater me-2'>
                  <Input
                    type='radio'
                    name='barcode'
                    id='public-link'
                    value={currentCopyLinkValue === 'public-link'}
                    onChange={(event) => {
                      event.stopPropagation();
                      setCurrentCopyLinkValue('public-link');
                    }}
                  />
                  <Label className='form-check-label' for='public-link'>
                    Public Link
                  </Label>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div>
              <Button
                onClick={() => {
                  handleCopyLink();
                }}
              >
                Copy Link
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
      <FilePreviewModal
        visibility={previewModalOpen}
        url={currentPreviewFile}
        toggleModal={handleResetDocumentPreview}
        title='File Upload Preview'
      />
    </>
  );
};
