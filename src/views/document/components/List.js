import React, {
  Fragment,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import ServerSideTable from '../../../@core/components/data-table/ServerSideTable';
import { useGetCompanyDocuments } from '../hooks/useApis';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  UncontrolledTooltip,
} from 'reactstrap';
import ExportData from '../../../components/ExportData';
import { ChevronDown, Edit2, PlusCircle, Trash } from 'react-feather';

function DocumentList(
  {
    archived = false,
    columns,
    type,
    contactId,
    currentFolders,
    handleEditFolderName,
    handleDeleteFolder,
    setCurrentDocumentField,
    setOpenAddEditDocumentModal,
    displayType,
  },
  ref
) {
  const tableRef = useRef(null);
  const [documents, setDocuments] = useState({
    results: [],
    total: 0,
  });
  const [currentFilters, setCurretFilters] = useState({
    limit: 10,
    page: 1,
    search: '',
    sort: null,
  });

  /** Folder view */
  const [open, setOpen] = useState();

  const { getCompanyDocuments, isLoading: fetching } = useGetCompanyDocuments();

  const getDocuments = async (filter, archived) => {
    try {
      setCurretFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getCompanyDocuments({
        limit: filter.limit,
        page: filter.page,
        sort: filter.sort,
        search: filter.search,
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
        results: data?.results || [],
        total: data?.pagination?.total || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const header = () => {
    return (
      <CardHeader className='card-header-with-buttons'>
        <h4 className='title card-title'>
          {!archived ? 'Documents' : 'Deleted Document'}
        </h4>
        <div className='d-inline-flex align-items-center justify-content-end'>
          <div className='d-inline-flex'>
            {
              <ExportData
                model='document'
                query={{ ...currentFilters, archived }}
              />
            }
          </div>
        </div>
      </CardHeader>
    );
  };

  useImperativeHandle(ref, () => ({
    async removeRecordRefreshTable() {
      // check if the last record in the table is being deleted
      if ((documents.total - 1) % currentFilters.limit === 0) {
        tableRef.current.refreshTable({
          filterArgs: { ...currentFilters, page: currentFilters.page - 1 || 1 },
        });
        setCurretFilters({
          ...currentFilters,
          page: currentFilters.page - 1,
        });
      } else {
        setCurretFilters({
          ...currentFilters,
        });
        tableRef.current.refreshTable({
          filterArgs: { ...currentFilters },
        });
      }
    },
    async refreshTable() {
      setCurretFilters({
        ...currentFilters,
      });
      tableRef.current.refreshTable({
        filterArgs: { ...currentFilters },
      });
    },
  }));

  /** Folder view */
  const toggleFolder = (folder) => {
    if (open === folder._id) {
      setOpen();
    } else {
      setDocuments({ results: [], total: 0 });
      setOpen(folder._id);
    }
  };

  const folderView = () => {
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
          <button className='toggle-btn'>
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
                                  </>
                                )}
                                <div className='action-btn down-arrow-btn'>
                                  <ChevronDown className='' size={34} />
                                </div>
                              </div>
                            }
                          </AccordionHeader>
                          <AccordionBody accordionId={folder?._id}>
                            <>
                              {open === folder._id && (
                                <>
                                  <ServerSideTable
                                    ref={tableRef}
                                    blocking={fetching}
                                    selectableRows={false}
                                    columns={columns}
                                    getRecord={(filters) => {
                                      getDocuments(
                                        { ...filters, folder: folder?._id },
                                        archived
                                      );
                                    }}
                                    data={documents}
                                    itemsPerPage={currentFilters}
                                    header={header()}
                                  />
                                </>
                              )}
                            </>
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
                      <span className='no-data-found'>No Checklist Found</span>
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

  return displayType === 'folderView' ? (
    <>{folderView()}</>
  ) : (
    <ServerSideTable
      ref={tableRef}
      blocking={fetching}
      selectableRows={false}
      columns={columns}
      getRecord={(filters) => getDocuments(filters, archived)}
      data={documents}
      itemsPerPage={currentFilters.limit}
      header={header()}
    />
  );
}

export default forwardRef(DocumentList);
