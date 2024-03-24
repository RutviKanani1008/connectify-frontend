/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Grid, List, Plus } from 'react-feather';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import UILoader from '../../../@core/components/ui-loader';
import DirectMailTemplatePreviewModal from './components/DirectMailTemplatePreviewModal';
import EditFolderModal from '../../Admin/folders/components/EditFolderModal';
import { useGetFolders } from '../../Admin/groups/hooks/groupApis';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import DirectMailTemplateGridView from './components/DirectMailTemplateGridView';
import classNames from 'classnames';
import DirectMailTemplateListView from './components/DirectMailTemplateListView';
import { useDirectMailTemplateColumns } from './hooks/useDirectTemplateColumns';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { TOASTTYPES, showToast } from '../../../utility/toast-helper';
import {
  useCloneDirectMailTemplateMutation,
  useDeleteDirectMailTemplateMutation,
  useLazyGetDirectMailTemplateQuery,
} from '../../../redux/api/directMailTemplateApi';
import { useReactToPrint } from 'react-to-print';
import DirectMailPrint from './components/DirectMailPrint';
import { singleElementRemoveFromArray } from '../../../utility/Utils';
import { ReactSortable } from 'react-sortablejs';

const CustomCardCard = ({ item }) => {
  const backgroundColor = '#dad9f3';

  return (
    <Col
      sm={6}
      className='grid-view lrg-view'
      id={item.id}
      style={Object.assign({}, { backgroundColor })}
    >
      <h5 style={{ textAlign: 'center' }}>{item.name}</h5>
      <hr />
    </Col>
  );
};

const DirectMailTemplate = () => {
  // ** Hooks Vars **
  const history = useHistory();

  // ** State
  const [isOpen, setIsOpen] = useState({
    add: false,
    preview: false,
    edit: false,
  });
  const [currentTemplate, setCurrentTemplate] = useState({});
  const [printLoading, setPrintLoading] = useState(null);
  const [updateFolder, setUpdateFolder] = useState(false);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [currentFolders, setCurrentFolders] = useState([]);
  const [folderController, setFolderController] = useState(null);
  const user = useSelector(userData);
  const [availableFolderDetails, setAvailableFolderDetails] = useState([]);
  const [open, setOpen] = useState([]);
  const [activeView, setActiveView] = useState('grid');
  const [cloneDirectMailTemplate] = useCloneDirectMailTemplateMutation();
  const listView = useRef(null);

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();
  const templatePrintRef = useRef(null);

  // ** APIS **
  const { getFolders, isLoading: folderLoading } = useGetFolders();
  const [getDirectMailTemplate, { currentData }] =
    useLazyGetDirectMailTemplateQuery();
  const [deleteDirectMailTemplate] = useDeleteDirectMailTemplateMutation();

  const body = currentData?.data?.body;
  const header = currentData?.data?.header;
  const footer = currentData?.data?.footer;
  const type = currentData?.data?.type;
  const postcardBack = currentData?.data?.postcardBack;
  const postcardFront = currentData?.data?.postcardFront;
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
        folderFor: 'direct-mail-template',
      },
      tempController.signal
    );

    if (!error && data) {
      if (!availableFolderDetails.length) {
        setAvailableFolderDetails(data);
      }
      setCurrentFolders([...data]);
    }
  };

  useEffect(() => {
    getFoldersDetails();
  }, []);

  const closeFolderModal = () => {
    setOpenFolderModal(false);
    setUpdateFolder(false);
  };

  const accordionToggle = (folder) => {
    if (open.includes(folder._id)) {
      setOpen([...singleElementRemoveFromArray(open, folder._id)]);
    } else {
      setOpen([...open, folder._id]);
    }
  };

  const handlePreviewDirectMailTemplate = (template) => {
    setIsOpen((prev) => ({ ...prev, preview: true }));
    setCurrentTemplate(template);
  };

  const handleCloneDirectMailTemplate = async (id) => {
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to clone this template?',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const toastId = showToast(TOASTTYPES.loading);
        const result = await cloneDirectMailTemplate({ id });
        if (result?.data?.data) {
          showToast(TOASTTYPES.success, toastId, 'Template Clone Successfully');
          // refreshData();
          listView.current && listView.current.refreshTable();
          // HELLO
          setCurrentFolders([
            ...currentFolders.map((individualFolder) => {
              if (individualFolder._id === open) {
                individualFolder.totalCounts = individualFolder.totalCounts + 1;
              }
              return individualFolder;
            }),
          ]);
          return true;
        }
      },
    });
  };

  const handleConfirmDelete = async (id) => {
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this template?',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const toastId = showToast(TOASTTYPES.loading);
        const result = await deleteDirectMailTemplate({ id });
        if (result?.data?.data) {
          showToast(
            TOASTTYPES.success,
            toastId,
            'Template Deleted Successfully'
          );
          listView.current && listView.current.refreshTable();
          // HELLO
          setCurrentFolders([
            ...currentFolders.map((individualFolder) => {
              if (individualFolder._id === open) {
                individualFolder.totalCounts = individualFolder.totalCounts - 1;
              }
              return individualFolder;
            }),
          ]);
          return true;
        }
      },
    });
  };

  const printNote = useReactToPrint({
    content: () => templatePrintRef.current,
  });

  const columns = useDirectMailTemplateColumns({
    onPreview: handlePreviewDirectMailTemplate,
    onClone: handleCloneDirectMailTemplate,
    onEdit: (row) => {
      history.push(`${basicRoute}/templates/direct-mail/${row._id}`);
      setCurrentTemplate(row);
    },
    onPrint: async (row) => {
      setPrintLoading(row?._id);
      await getDirectMailTemplate({ id: row?._id });
      printNote();
      setPrintLoading(false);
    },
    printLoading,
    onDelete: handleConfirmDelete,
  });

  const [thirdGroup, setThirdGroup] = useState([
    { name: 'Box 1', id: '1' },
    { name: 'Box 2', id: '2' },
    { name: 'Box 3', id: '3' },
    { name: 'Box 4', id: '4' },
  ]);

  return (
    <>
      {/* <Container>
        <ReactSortable
          group='apdu'
          className='aaaaaaaaaaaaaaaa'
          list={thirdGroup}
          setList={setThirdGroup}
          animation={250}
          onAdd={(data) => {
            const elementId = data?.item?.id;
            const newIndex = data.newDraggableIndex;

            console.log({ elementId, newIndex }, '11111111111111');
          }}
          onRemove={(ssssssssss) => {
            console.log({ ssssssssss }, '1111111111111');
          }}
        >
          {thirdGroup.map((item) => (
            <CustomCardCard key={item.id} item={item} />
          ))}
        </ReactSortable>
        <ReactSortable
          group='apdu'
          className='aaaaaaaaaaaaaaaa'
          list={thirdGroup}
          setList={setThirdGroup}
          animation={250}
          onAdd={(add) => {
            console.log({ add }, '2222222222222222');
          }}
          onRemove={(ssssssssss) => {
            console.log({ ssssssssss }, '22222222222222222');
          }}
        >
          {thirdGroup.map((item) => (
            <CustomCardCard key={item.id} item={item} />
          ))}
        </ReactSortable>
      </Container> */}

      <Card className='direct__mail__card direct-mail-template-card'>
        <CardHeader>
          <CardTitle tag='h4' className=''>
            Direct Mail Templates
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
                onClick={() => {
                  history.push(`${basicRoute}/templates/direct-mail/add`);
                }}
              >
                <Plus size={15} />
                <span className='align-middle ms-50'>Add New</span>
              </Button>
            </div>
            <ButtonGroup className='grid-card-view-toggle-btns'>
              <Button
                tag='label'
                className={classNames('btn-icon view-btn grid-view-btn', {
                  active: activeView === 'grid',
                })}
                color='primary'
                outline
                onClick={() => setActiveView('grid')}
              >
                <Grid size={18} />
              </Button>
              <Button
                tag='label'
                className={classNames('btn-icon view-btn list-view-btn', {
                  active: activeView === 'list',
                })}
                color='primary'
                outline
                onClick={() => setActiveView('list')}
              >
                <List size={18} />
              </Button>
            </ButtonGroup>
          </div>
        </CardHeader>
        <CardBody className={`hide-scrollbar`}>
          <UILoader blocking={folderLoading}>
            <>
              {activeView === 'grid' || activeView === 'list' ? (
                currentFolders?.length > 0 ? (
                  currentFolders?.map((folder, index) => {
                    return (
                      <Accordion
                        key={`${index}_direct_mail`}
                        className='direct-mail-accordian'
                        open={open}
                        toggle={() => {
                          accordionToggle(folder);
                        }}
                      >
                        <AccordionItem className='direct-mail-accordian-item'>
                          <AccordionHeader
                            className='accordian-header'
                            targetId={`${folder?._id}`}
                          >
                            <div className='name-count-wrapper'>
                              <div className='template-name'>
                                {folder.folderName}
                              </div>
                              <Badge color='primary' className='mx-1' pill>
                                {folder?.totalCounts || 0}
                              </Badge>
                            </div>
                            <div className='down-arrow'>
                              <ChevronDown />
                            </div>
                          </AccordionHeader>
                          <AccordionBody accordionId={folder?._id}>
                            {open.includes(folder._id) && (
                              <>
                                {activeView === 'grid' ? (
                                  <div className='email-template-list-view'>
                                    <DirectMailTemplateGridView
                                      folder={folder?._id}
                                      setCurrentTemplate={setCurrentTemplate}
                                      setIsOpen={setIsOpen}
                                      setCurrentFolders={setCurrentFolders}
                                      currentFolders={currentFolders}
                                    />
                                  </div>
                                ) : (
                                  <div className='email-template-list-view'>
                                    <DirectMailTemplateListView
                                      columns={columns}
                                      folder={folder?._id}
                                      ref={listView}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </AccordionBody>
                        </AccordionItem>
                      </Accordion>
                    );
                  })
                ) : (
                  <div className='d-flex justify-content-center m-4'>
                    <span className='no-data-found'>No Checklist Found</span>
                  </div>
                )
              ) : currentFolders?.length > 0 ? (
                currentFolders?.map((folder, index) => {
                  return (
                    <Accordion
                      key={`${index}_direct_mail`}
                      className='direct-mail-accordian'
                      open={open}
                      toggle={() => {
                        accordionToggle(folder);
                      }}
                      style={{
                        display: 'flex', // Arrange cards horizontally using flexbox
                      }}
                    >
                      <AccordionItem className='direct-mail-accordian-item'>
                        <AccordionHeader
                          className='accordian-header'
                          targetId={`${folder?._id}`}
                        >
                          <div className='name-count-wrapper'>
                            <div className='template-name'>
                              {folder.folderName}
                            </div>
                            <Badge color='primary' className='mx-1' pill>
                              {folder?.totalCounts || 0}
                            </Badge>
                          </div>
                          <div className='down-arrow'>
                            <ChevronDown />
                          </div>
                        </AccordionHeader>
                        <AccordionBody accordionId={folder?._id}>
                          {open === folder._id && (
                            <div className='email-template-list-view'>
                              <DirectMailTemplateListView
                                columns={columns}
                                folder={folder?._id}
                                ref={listView}
                              />
                            </div>
                          )}
                        </AccordionBody>
                      </AccordionItem>
                    </Accordion>
                  );
                })
              ) : (
                <div className='d-flex justify-content-center m-4'>
                  <span className='no-data-found'>No Checklist Found</span>
                </div>
              )}
            </>
          </UILoader>
        </CardBody>
      </Card>
      {isOpen.preview && (
        <DirectMailTemplatePreviewModal
          setIsOpen={(value) => {
            if (!isOpen.edit) {
              setCurrentTemplate({});
            }
            setIsOpen((prev) => ({
              ...prev,
              preview: value,
            }));
          }}
          isOpen={isOpen.preview}
          currentTemplate={currentTemplate}
        />
      )}
      {openFolderModal && (
        <EditFolderModal
          contactId={null}
          updateFolderDetail={updateFolder}
          openFolderModal={openFolderModal}
          setOpenFolderModal={setOpenFolderModal}
          closeFolderModal={closeFolderModal}
          currentFolders={currentFolders}
          setCurrentFolders={setCurrentFolders}
          type={'direct-mail-template'}
        />
      )}
      <DirectMailPrint
        header={header}
        footer={footer}
        body={body}
        type={type}
        postcardBack={postcardBack}
        postcardFront={postcardFront}
        ref={templatePrintRef}
        contacts={[{}]}
      />
    </>
  );
};

export default DirectMailTemplate;
