import React, { Fragment, useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import Draggable from '../../../@core/components/draggable/Draggable';
import UILoader from '@components/ui-loader';
import { useGetCompanyDocuments } from '../hooks/useApis';
import { DraggableCard } from '../../../@core/components/draggable/DraggableCard';
import update from 'immutability-helper';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { updateDocumentOrderAPI } from '../../../api/documents';
import {
  ChevronDown,
  Download,
  Edit2,
  Link,
  MoreVertical,
  PlusCircle,
  RefreshCw,
  Trash,
} from 'react-feather';
import CopyToClipboard from 'react-copy-to-clipboard';
import { downloadFile } from '../../../helper/common.helper';
import { store } from '../../../redux/store';
import NoRecordFound from '../../../@core/components/data-table/NoRecordFound';

function DocumentGrid({
  archived = false,
  setCurrentDocumentField,
  setPreviewModalOpen,
  setOpenAddEditDocumentModal,
  handleConfirmDelete,
  handleTrashDocument,
  type,
  contactId,
  displayType,
  currentFolders,
  handleEditFolderName,
  handleDeleteFolder,
  modelType = 'Contacts',
  setCollapseTabFormMobile,
  reloadDocumentGrid,
}) {
  const storeState = store.getState();
  const user = storeState.user.userData;

  const [documents, setDocuments] = useState({
    results: [],
    total: 0,
  });

  /** Folder view */
  const [open, setOpen] = useState();

  const [currentFilters, setCurrentFilters] = useState({
    limit: 9,
    page: 1,
  });
  const [documentProcessing, setDocumentProcessing] = useState(false);

  const { getCompanyDocuments, isLoading: fetching } = useGetCompanyDocuments();

  const getDocuments = async (filter, archived, isLoadMore) => {
    try {
      setCurrentFilters({
        limit: filter.limit,
        page: filter.page,
      });
      const { data } = await getCompanyDocuments({
        limit: filter.limit,
        page: filter.page,
        select: 'name,documentURL,document,archived,order,folder',
        archived,
        ...(type === 'contact' && contactId
          ? { contactId }
          : { contactId: null }),
        ...(displayType === 'folderView' && filter.folder
          ? { folderId: filter.folder }
          : {}),
      });
      setDocuments({
        results:
          [...(isLoadMore ? documents.results : []), ...data?.results] || [],
        total: data?.pagination?.total || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (archived) getDocuments(currentFilters, archived);
  }, [archived]);

  useEffect(() => {
    if (reloadDocumentGrid && open) {
      getDocuments({ page: 1, limit: 8, folder: open }, archived);
    }
  }, [reloadDocumentGrid]);

  const moveDocumentCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragCard = documents.results[dragIndex];
      if (dragCard) {
        setDocuments(
          update(documents, {
            results: {
              $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, dragCard],
              ],
            },
          })
        );
      }
    },
    [documents]
  );

  const arrangeTheOrderOfDocument = async () => {
    // let tempDocumentObjArray = [];
    // let flag = false;

    // if (!isEqual(previousDocuments, documents.results)) {
    //   tempDocumentObjArray = [...documents.results];
    //   setPreviousDocuments(tempDocumentObjArray);
    //   flag = true;
    // }

    // if (flag) {
    setDocumentProcessing(true);
    const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
    try {
      const orderObjArray = documents.results.map((obj, index) => ({
        _id: obj._id,
        order: index,
      }));
      const response = await updateDocumentOrderAPI({
        orderObjArray,
      });
      setDocumentProcessing(false);
      if (response?.data?.response_type === 'success') {
        showToast(
          TOASTTYPES.success,
          toastId,
          'Document order change successfully!'
        );
      }
    } catch (error) {
      setDocumentProcessing(false);
      showToast(TOASTTYPES.error, toastId, error.message);
      // showToast(TOASTTYPES.error, toastId, res.error);
      // }
    }
  };

  const renderCard = (card, index) => {
    return (
      <DraggableCard
        key={card._id}
        index={index}
        id={card._id}
        moveCard={moveDocumentCard}
        arrangeTheOrderOfDocument={arrangeTheOrderOfDocument}
        archived={card.archived}
      >
        <TemplateCard item={card} />
      </DraggableCard>
    );
  };

  const handleIconCardClick = () => {
    const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
    showToast(TOASTTYPES.success, toastId, 'Document Link Copied');
  };

  const handleDocumentPreview = (_id) => {
    const documentDetails = documents.results.find(
      (document) => document._id === _id
    );
    setCurrentDocumentField(documentDetails);
    setPreviewModalOpen(true);
  };

  const TemplateCard = ({ item }) => {
    const { name, _id, archived, document, documentURL } = item;

    return (
      <>
        <div className='company-form-card'>
          <div className='header-wrapper'>
            <div className='form-card-title' id={`title_${_id}`}>
              {name}
            </div>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`title_${_id}`}
            >
              {name}
            </UncontrolledTooltip>
            <div className='action-btn-wrapper'>
              <div className='action-btn copy-btn'>
                <CopyToClipboard
                  text={
                    document
                      ? `${
                          process.env.REACT_APP_S3_BUCKET_BASE_URL
                        }${document?.replaceAll('\\', '/')}`
                      : documentURL
                  }
                  id={`copy-icon${_id}`}
                >
                  <Link
                    opacity={!document && !documentURL ? 0.5 : 1}
                    size={15}
                    className={`${
                      document || documentURL
                        ? 'cursor-pointer'
                        : 'cursor-default'
                    }`}
                    onClick={() =>
                      (document || documentURL) && handleIconCardClick()
                    }
                  />
                </CopyToClipboard>
                <UncontrolledTooltip placement='top' target={`copy-icon${_id}`}>
                  {document || documentURL
                    ? 'Copy Document Link'
                    : "Doesn't contain document"}
                </UncontrolledTooltip>
              </div>
              <div className='action-btn download-btn'>
                <Download
                  opacity={!document ? 0.5 : 1}
                  size={15}
                  className={`${
                    document ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  onClick={() =>
                    document &&
                    downloadFile(
                      `${process.env.REACT_APP_S3_BUCKET_BASE_URL}${document}`
                    )
                  }
                  id={`download-icon${_id}`}
                ></Download>
                <UncontrolledTooltip
                  placement='top'
                  target={`download-icon${_id}`}
                >
                  {document ? 'Download Document' : "Doesn't contain document"}
                </UncontrolledTooltip>
              </div>
              {(user.role !== 'user' ||
                (user.role === 'user' && modelType === 'Users')) &&
              !archived ? (
                <>
                  <div className='action-btn edit-btn'>
                    <Edit2
                      size={15}
                      className='cursor-pointer'
                      onClick={() => {
                        setCurrentDocumentField(item);
                        setOpenAddEditDocumentModal(true);
                      }}
                      id={`edit-icon${_id}`}
                    />
                    <UncontrolledTooltip
                      placement='top'
                      target={`edit-icon${_id}`}
                    >
                      Edit Document
                    </UncontrolledTooltip>
                  </div>
                </>
              ) : null}
              {(user.role !== 'user' ||
                (user.role === 'user' && modelType === 'Users')) &&
              archived ? (
                <>
                  <div className='action-btn refresh-btn'>
                    <RefreshCw
                      size={15}
                      className='cursor-pointer'
                      id={`plush-icon${_id}`}
                      onClick={() => {
                        handleTrashDocument(item);
                      }}
                    />
                    <UncontrolledTooltip
                      placement='top'
                      target={`plush-icon${_id}`}
                    >
                      Recover Document
                    </UncontrolledTooltip>
                  </div>
                </>
              ) : null}
              {(user.role !== 'user' ||
                (user.role === 'user' && modelType === 'Users')) && (
                <>
                  <div className='action-btn delete-btn'>
                    <Trash
                      color='red'
                      size={15}
                      className='cursor-pointer'
                      onClick={() => {
                        if (archived) {
                          handleConfirmDelete(_id);
                        } else {
                          handleTrashDocument(item);
                        }
                      }}
                      id={`trash-icon${_id}`}
                    />
                    <UncontrolledTooltip
                      placement='top'
                      target={`trash-icon${_id}`}
                    >
                      {archived ? 'Delete Document' : 'Delete Document'}
                    </UncontrolledTooltip>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className='body-wrapper'>
            <Button
              className=''
              color='primary'
              onClick={() => {
                if (!documentURL) {
                  handleDocumentPreview(_id);
                } else {
                  window.open(documentURL, '_blank');
                }
              }}
              id={`preview-btn${_id}`}
            >
              <span className='align-middle'>Preview </span>
            </Button>
            <UncontrolledTooltip placement='top' target={`preview-btn${_id}`}>
              Preview Document
            </UncontrolledTooltip>
          </div>
        </div>
      </>
    );
  };

  /** Folder view */
  const toggleFolder = (folder) => {
    if (open === folder._id) {
      setOpen();
    } else {
      setDocuments({ results: [], total: 0 });
      getDocuments({ page: 1, limit: 8, folder: folder._id }, archived);
      setOpen(folder._id);
    }
  };

  const FolderView = () => {
    return (
      <Card
        className={`company-document-inner-card ${
          documents.results.length < documents.total && 'load-more-apply'
        }`}
      >
        <CardHeader>
          <CardTitle tag='h4' className='text-primary'>
            {!archived ? 'Files' : 'Deleted Files'}
          </CardTitle>
          <button
            className='toggle-btn'
            onClick={() =>
              setCollapseTabFormMobile((prev) =>
                prev === 'Files' ? '' : !archived ? 'Files' : 'Deleted Files'
              )
            }
          >
            <ChevronDown />
          </button>
        </CardHeader>{' '}
        <div className='compnay-checklist-folder-wrapper'>
          <CardBody className='py-1'>
            <div className='company-checklist-inner-scroll hide-scrollbar'>
              {currentFolders?.length > 0 ? (
                currentFolders?.map((folder, index) => {
                  return (
                    <Fragment key={index}>
                      <Accordion
                        className='accordion-margin'
                        open={open}
                        toggle={() => toggleFolder(folder)}
                      >
                        <AccordionItem className='checklist-box checklist-folder-list-box'>
                          <AccordionHeader
                            className='checklist-header'
                            targetId={`${folder?._id}`}
                          >
                            <div className='title'>{folder.folderName}</div>
                            {
                              <div className='action-btn-wrapper'>
                                {folder?._id !== 'unassigned' && !archived && (
                                  <>
                                    <div className='action-btn plus-btn'>
                                      <PlusCircle
                                        size={20}
                                        className='cursor-pointer'
                                        id={`add_new${folder?._id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenAddEditDocumentModal(true);
                                          setCurrentDocumentField({
                                            folder: folder?._id,
                                          });
                                        }}
                                      />

                                      <UncontrolledTooltip
                                        placement='top'
                                        target={`add_new${folder?._id}`}
                                      >
                                        Add File
                                      </UncontrolledTooltip>
                                    </div>
                                    <div className='action-btn printer-btn'>
                                      <Edit2
                                        size={15}
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
                                    <div className='action-btn printer-btn'>
                                      <Trash
                                        color={'red'}
                                        size={15}
                                        className='cursor-pointer'
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
                                    <div
                                      className='action-btn toggle-btn'
                                      style={{ display: 'none' }}
                                    >
                                      <MoreVertical
                                        size={15}
                                        className='cursor-pointer'
                                      />
                                    </div>
                                  </>
                                )}
                                <div className='action-btn down-arrow-btn'>
                                  <ChevronDown className='' size={34} />
                                </div>
                              </div>
                            }
                          </AccordionHeader>
                          <AccordionBody accordionId={folder?._id}>
                            <Draggable>
                              <UILoader
                                blocking={fetching || documentProcessing}
                              >
                                {documents && documents.results?.length > 0 ? (
                                  <Row className='mt-0'>
                                    {documents.results.map((document, i) =>
                                      renderCard(document, i)
                                    )}
                                  </Row>
                                ) : (
                                  <>{!fetching && <NoRecordFound />}</>
                                )}
                                {documents.results.length < documents.total && (
                                  <LoadMoreButton />
                                )}
                              </UILoader>
                            </Draggable>
                          </AccordionBody>
                        </AccordionItem>
                      </Accordion>
                    </Fragment>
                  );
                })
              ) : (
                <>
                  <>
                    <div className='d-flex justify-content-center m-4'>
                      <span className='no-data-found'>No Files Found</span>
                    </div>
                  </>
                </>
              )}
            </div>
          </CardBody>
        </div>
      </Card>
    );
  };

  const LoadMoreButton = () => {
    return (
      <div className='text-center mt-2 mb-2 loade-more-btn-wrapper'>
        <Button
          outline={true}
          color='primary'
          onClick={() => {
            setCurrentFilters({
              ...currentFilters,
              page: currentFilters.page + 1,
            });
            getDocuments(
              {
                ...currentFilters,
                page: currentFilters.page + 1,
              },
              archived,
              true
            );
          }}
        >
          Load More
        </Button>
      </div>
    );
  };

  return displayType === 'folderView' ? (
    <FolderView />
  ) : (
    <UILoader blocking={fetching || documentProcessing}>
      <Card
        className={`company-document-inner-card ${
          documents.results.length < documents.total && 'load-more-apply'
        }`}
      >
        <CardHeader>
          <CardTitle tag='h4' className='text-primary'>
            {!archived ? 'Documents' : 'Deleted Documents'}
          </CardTitle>
          <button
            className='toggle-btn'
            onClick={() =>
              setCollapseTabFormMobile((prev) =>
                prev === 'Deleted Documents'
                  ? ''
                  : !archived
                  ? 'Documents'
                  : 'Deleted Documents'
              )
            }
          >
            <ChevronDown />
          </button>
        </CardHeader>
        <CardBody className='pb-0 hide-scrollbar'>
          <Draggable>
            {documents && documents.results?.length > 0 ? (
              <Row>
                {documents.results.map((document, i) =>
                  renderCard(document, i)
                )}
              </Row>
            ) : (
              <>{!fetching && <NoRecordFound />}</>
            )}
          </Draggable>
        </CardBody>
        {documents.results.length < documents.total && <LoadMoreButton />}
      </Card>
    </UILoader>
  );
}

export default DocumentGrid;
