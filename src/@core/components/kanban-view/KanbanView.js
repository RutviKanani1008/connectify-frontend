import React, { useEffect, useState, useRef, Fragment } from 'react';
import {
  Card,
  Button,
  Badge,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledTooltip,
  Spinner,
  ButtonGroup,
} from 'reactstrap';
import Board from 'react-trello';
import { defaultStages } from '../../../constant/company';
import { updateCompanyContactStage } from '../../../api/company';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import { Grid, List, MoreVertical, Plus } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { getCurrentUser, isSuperAdmin } from '../../../helper/user.helper';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import toast from 'react-hot-toast';
import {
  updateContactStatus,
  getContactDetails,
  assignContactPipeline,
} from '../../../api/contacts';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import { updateMemberContactStage } from '../../../api/pipeline';
import { useForm } from 'react-hook-form';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import classnames from 'classnames';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import AddContactModal from './component/AddContactModal';
import ViewContactDetail from './component/ViewContactDetailsModel';
import AddStage from './component/AddStage';
import ChangeStage from './component/ChangeStage';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PipelineStagesTable from '../../../views/Admin/pipeline/components/PipelineStagesTable';
import ContactListModal from './component/ContactList';

const MySwal = withReactContent(Swal);

const KanbanView = ({
  companyName,
  contactStages,
  showCompanyDropdown,
  type = 'default',
  currentPipeline = false,
  updateStages,
  currentGroup,
  pipelineLoading,
  setSidebarCollapsed,
}) => {
  const { basicRoute } = useGetBasicRoute();
  const [activeView, setActiveView] = useState('grid');
  const [companyStages, setCompanyStages] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openViewDetailModal, setOpenViewDetailModal] = useState(false);
  const [openAddStage, setOpenAddStage] = useState(false);
  const [currentNote, setCurrentNote] = useState({ text: '' });
  const [currentStageText, setCurrentStageText] = useState({ text: '' });
  const [contactDetail, setContactDetail] = useState([]);
  const [currentViewContact, setCurrentViewContact] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(false);
  const history = useHistory();
  const [currentCompanyStages, setCurrentCompanyStages] = useState([]);
  const [stageLoading, setStageLoading] = useState(false);
  const [isEditName, setIsEditName] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);
  const user = useSelector(userData);
  const availableTypes = {
    contact: 'contact',
    default: 'default',
  };
  // Add new member into stage
  const [availableCompanyMember, setAvailableCompanyMember] = useState([]);
  const [fetchMemberLoader, setFetchMemberLoader] = useState(true);
  const [addStage, setAddStage] = useState(false);
  const [laneDetails, setLaneDetails] = useState({
    contact: null,
    member: null,
  });

  // ** Form **
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
  });

  const [currentChange, setCurrentChange] = useState({
    cardId: '',
    sourceLaneId: '',
    sourceLaneTitle: '',
    targetLaneId: '',
    targetLaneTitle: '',
    position: '',
    cardDetails: '',
  });

  // ** Ref **
  const update = useRef(0);

  useEffect(() => {
    if (defaultStages) {
      getStageDetails();
    }
  }, [contactDetail]);

  useEffect(() => {
    if (!isSuperAdmin()) {
      const user = getCurrentUser();
      handleCompanyChange({
        value: user.company._id,
        label: user.company.name,
      });
    }
  }, [contactStages]);

  useEffect(() => {
    if (selectedCompany) {
      getCompanyContactDetails();
    }
  }, [selectedCompany]);

  const viewCardDetails = (detail) => {
    setCurrentViewContact(detail.id);
    setOpenViewDetailModal(!openViewDetailModal);
  };

  useEffect(() => {
    if (currentCompanyStages) {
      getStageDetails();
      update.current = Math.random();
    }
  }, [currentCompanyStages]);

  const addNewContact = (lane) => {
    if (type === availableTypes.contact) {
      setAddStage(!addStage);
      setFetchMemberLoader(true);

      getContactDetails({
        'companyDetails.company.id': user.company._id,
        'group.id': currentGroup._id,
        archived: false,
      })
        .then((res) => {
          if (res && res.data && res.data.data && res.data.data.length > 0) {
            const contactsDetails = res.data.data;
            const notInPipeline = [];
            contactsDetails?.forEach((member) => {
              const isExist = member?.pipelineDetails?.find(
                (pipeline) => pipeline?.pipeline?.id === currentPipeline?.id
              );
              if (!isExist) {
                notInPipeline.push(member);
              }
            });
            if (notInPipeline && notInPipeline.length > 0) {
              setLaneDetails({ ...laneDetails, member: lane });
            }
            setAvailableCompanyMember(notInPipeline);
          }
          setFetchMemberLoader(false);
        })
        .catch((error) => {
          setFetchMemberLoader(false);

          toast.error(error?.message);
        });
    }
  };

  const deleteCompanyStage = (stage) => {
    const hasContacts = stageContainContacts(stage._id);
    if (
      currentCompanyStages &&
      currentCompanyStages.length > 0 &&
      !hasContacts
    ) {
      return MySwal.fire({
        title: '',
        text: 'are you want to Delete this stage?',
        icon: 'warning',
        allowOutsideClick: false,
        confirmButtonText: 'Yes',
        inputAttributes: {
          autocapitalize: 'off',
        },
        showCancelButton: true,
        loaderHtml: '<div class="spinner-border text-primary"></div>',
        showLoaderOnConfirm: true,
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ms-1',
          loader: 'custom-loader',
        },
        buttonsStyling: false,
        preConfirm: () => {
          const stages = currentCompanyStages.filter(
            (stg) => stg.code !== stage.code
          );

          if (
            type === availableTypes.contact &&
            currentPipeline &&
            currentPipeline.id
          ) {
            return updateMemberContactStage(currentPipeline.id, {
              stage: stages,
            }).then((res) => {
              if (res.error) {
                toast.error(res.error);
              } else {
                setCurrentCompanyStages([]);
                const sortStage = stages.sort(
                  ({ order: a }, { order: b }) => a - b
                );
                updateStages(currentPipeline, sortStage);

                setCurrentCompanyStages(sortStage);
                update.current = Math.random();
              }
            });
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          //
        }
      });
    } else if (hasContacts) {
      return MySwal.fire({
        title: '',
        text: 'You are not allowed to delete this stage because there are contacts in it. You must remove all contacts to delete it.',
        icon: 'warning',
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
        customClass: {
          confirmButton: 'btn btn-primary',
        },
        buttonsStyling: false,
      }).then(function (result) {
        if (result.value) {
          update.current = Math.random();
          const stages = currentCompanyStages;
          setCurrentCompanyStages([]);
          setCurrentCompanyStages(stages);
        }
      });
    }
  };

  const renameCompanyStageName = (stage) => {
    const hasContacts = stageContainContacts(stage._id);
    if (
      currentCompanyStages &&
      currentCompanyStages.length > 0 &&
      !hasContacts
    ) {
      setIsEditName(stage.code);
      setCurrentStageText({ text: stage.title });
      setOpenAddStage(!openAddStage);
    } else if (
      currentCompanyStages &&
      currentCompanyStages.length > 0 &&
      hasContacts
    ) {
      return MySwal.fire({
        title: '',
        text: 'You are not allowed to rename this stage because there are contacts in it. You must remove all contacts to rename it.',
        icon: 'warning',
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
        customClass: {
          confirmButton: 'btn btn-primary',
        },
        buttonsStyling: false,
      }).then(function (result) {
        if (result.value) {
          update.current = Math.random();
          const stages = currentCompanyStages;
          setCurrentCompanyStages([]);
          setCurrentCompanyStages(stages);
        }
      });
    }
  };

  const getStageDetails = () => {
    const companyStageDetails = [];
    if (!selectedCompany && currentCompanyStages.length === 0) {
      defaultStages.forEach((company) => {
        const obj = {};
        obj.id = company.code;
        obj.title = company.title;
        obj.style = { width: '310px', padding: '10px', display: 'flex' };
        obj.labelStyle = { color: 'red' };
        const contactObj = [];
        if (contactDetail && contactDetail.length > 0) {
          contactDetail
            .filter((contacts) => contacts?.status?.code === company.code)
            .forEach((contact) => {
              const obj = {};
              obj.id = contact._id;
              obj.title = `${contact.firstName} ${contact.lastName}`;
              obj.company = contact.companyDetail.name;
              contactObj.push(obj);
            });
        }
        obj.cards = contactObj;
        companyStageDetails.push(obj);
      });
    } else {
      currentCompanyStages?.forEach((company) => {
        const obj = {};
        obj.id = company.code;
        obj._id = company?._id;
        obj.title = company.title;
        obj.stageObject = company;
        obj.style = { width: '310px', padding: '10px', display: 'flex' };
        obj.labelStyle = { color: 'red' };
        const contactObj = [];
        if (
          contactDetail &&
          contactDetail.length > 0 &&
          type === availableTypes.contact
        ) {
          contactDetail.forEach((contact) => {
            if (contact.pipelineDetails && contact.pipelineDetails.length > 0) {
              contact.pipelineDetails.forEach((companyDetail) => {
                if (
                  companyDetail.status.id === company._id &&
                  companyDetail.pipeline.id === String(currentPipeline.id)
                ) {
                  const obj = {};
                  obj.id = contact._id;
                  obj.title =
                    (contact.firstName === '' && contact.lastName === '') ||
                    (contact.firstName === null && contact.lastName === null)
                      ? `${contact.email}`
                      : `${contact.firstName} ${contact.lastName}`;
                  contactObj.push(obj);
                }
              });
            }
          });
        }
        obj.cards = contactObj;
        companyStageDetails.push(obj);
      });
    }
    setCompanyStages({ lanes: companyStageDetails });
  };

  const handleCompanyChange = async (e) => {
    let companyStage = [];
    contactStages.map((stage) => {
      Object.keys(stage).forEach((key) => {
        if (String(key) === e.value) {
          if (isSuperAdmin()) {
            companyStage = stage[key];
          } else {
            companyStage = [...stage[key]];
          }
        }
      });
    });
    const sortStage = companyStage?.sort(({ order: a }, { order: b }) => a - b);
    setCurrentCompanyStages(sortStage);

    setSelectedCompany(e);
  };

  const getCompanyContactDetails = () => {
    if (type === availableTypes.contact) {
      if (currentPipeline && currentPipeline.id) {
        getContactDetails({
          'pipelineDetails.pipeline.id': currentPipeline.id,
          'group.id': currentGroup._id,
          archived: false,
        }).then((res) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            setContactDetail(res.data.data);
          }
        });
      }
    }
  };

  const getStageContacts = (stageId) => {
    const stageContacts = [];
    contactDetail.forEach((contact) => {
      if (contact.pipelineDetails && contact.pipelineDetails.length > 0) {
        contact.pipelineDetails.forEach((companyDetail) => {
          if (
            companyDetail.status.id === stageId &&
            companyDetail.pipeline.id === String(currentPipeline.id)
          ) {
            stageContacts.push(contact);
          }
        });
      }
    });
    return stageContacts;
  };

  const handleDragEnd = (
    cardId,
    sourceLaneId,
    targetLaneId,
    position,
    cardDetails
  ) => {
    if (sourceLaneId !== targetLaneId) {
      if (targetLaneId === 'addNewStage') {
        return false;
      }
      const sourceTitle = companyStages.lanes.filter(
        (lane) => lane.id === sourceLaneId
      );
      const targetTitle = companyStages.lanes.filter(
        (lane) => lane.id === targetLaneId
      );
      setCurrentChange({
        cardId,
        sourceLaneId,
        targetLaneId,
        position,
        cardDetails,
        sourceLaneTitle: sourceTitle[0].title,
        targetLaneTitle: targetTitle[0].title,
      });
      setOpenModal(true);
    }
  };

  const changeCardPosition = async () => {
    const rawData = companyStages.lanes;
    let oldCard = [];
    rawData.map((data) => {
      if (data.id === currentChange.sourceLaneId && data?.cards?.length > 0) {
        oldCard = data?.cards.find(
          (card) => card.id === currentChange.cardDetails.id
        );
        const filterCard = data?.cards.filter(
          (card) => card.id !== currentChange.cardDetails.id
        );
        data.cards = filterCard;
      }
    });

    rawData.map((data) => {
      if (data.id === currentChange.targetLaneId) {
        data.cards.push(oldCard);
      }
    });

    const contact = contactDetail.filter(
      (contacts) => contacts._id === currentChange.cardId
    );

    let updatedCompany;

    if (
      type === availableTypes.contact &&
      contact &&
      contact[0] &&
      contact[0].pipelineDetails
    ) {
      contact[0].pipelineDetails.forEach((pipeline) => {
        if (pipeline.pipeline.id === currentPipeline.id) {
          pipeline.updateField = 'dashboardStatusUpdate';
          pipeline.note = currentNote?.text || null;
          updatedCompany = pipeline;

          const stages = currentCompanyStages.filter(
            (stage) => stage.code === currentChange.targetLaneId
          );
          const status = {};
          status['code'] = stages[0].code;
          status['title'] = stages[0].title;
          status['id'] = stages[0]._id;
          pipeline.status = status;
        }
      });

      if (type === availableTypes.contact) {
        updateContactStatus(contact[0]._id, updatedCompany).then((res) => {
          if (res.error) {
            toast.error(res.error);
          }
        });
      }
    }
    setCurrentNote({ text: '' });

    setOpenModal(false);
  };

  const viewContact = () => {
    if (type === availableTypes.contact || type === availableTypes.default) {
      if (user.role === 'superadmin' || user.role === 'grandadmin') {
        history.push(`${basicRoute}/${currentViewContact}`);
      } else {
        history.push(`${basicRoute}/contact/${currentViewContact}`);
      }
    }
  };

  const handleLaneDragEnd = (removedIndex, addedIndex, payload) => {
    if (
      currentCompanyStages &&
      currentCompanyStages.length > 0 &&
      payload?.id !== 'addNewStage'
    ) {
      const stages = JSON.parse(JSON.stringify(currentCompanyStages));

      stages.forEach((stage) => {
        if (removedIndex >= addedIndex) {
          // move card to left
          if (stage.code === payload.id) {
            stage.order = addedIndex;
          } else if (stage.order <= removedIndex && stage.order >= addedIndex) {
            stage.order = stage.order + 1;
          }
        } else if (removedIndex <= addedIndex) {
          // move card to right
          if (stage.code === payload.id) {
            stage.order = addedIndex;
          } else if (stage.order >= removedIndex && stage.order <= addedIndex) {
            stage.order = stage.order - 1;
          }
        }
      });
      const sortStage = stages.sort(({ order: a }, { order: b }) => a - b);
      if (type === availableTypes.default) {
        updateCompanyContactStage(selectedCompany?.value, {
          stage: stages,
        }).then((res) => {
          if (res.error) {
            toast.error(res.error);
          }
        });
      }
      if (
        type === availableTypes.contact &&
        currentPipeline &&
        currentPipeline.id
      ) {
        updateMemberContactStage(currentPipeline.id, {
          stage: stages,
        }).then((res) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            updateStages(currentPipeline, sortStage);
          }
        });
      }
      setCurrentCompanyStages(sortStage);
    }
  };

  const resetFieldOnStageModalClose = () => {
    setOpenAddStage(false);
    setCurrentStageText({ text: '' });
    setShowError(false);
    setErrorMessage(false);
    setStageLoading(false);
    setIsEditName(false);
  };

  const createCompanyStage = () => {
    // Add new Stage
    setStageLoading(true);
    if (currentStageText.text !== '' && currentCompanyStages && !isEditName) {
      const isExist = currentCompanyStages.find(
        (stage) =>
          stage.code ===
          currentStageText.text.split(' ').join('-').toLowerCase()
      );
      if (!isExist) {
        const obj = {};
        obj.code = currentStageText.text.split(' ').join('-').toLowerCase();
        obj.title = currentStageText.text;
        obj.order = currentCompanyStages.length;
        const companyStage = currentCompanyStages;
        companyStage.push(obj);
        if (
          type === availableTypes.contact &&
          currentPipeline &&
          currentPipeline.id
        ) {
          updateMemberContactStage(currentPipeline.id, {
            stage: companyStage,
          }).then((res) => {
            setStageLoading(false);
            if (res.error) {
              toast.error(res.error);
            } else {
              toast.success('Stage Added Successfully');

              setCurrentCompanyStages([]);
              if (res?.data?.data && res?.data?.data?.length > 0) {
                const sortStage = res?.data?.data.sort(
                  ({ order: a }, { order: b }) => a - b
                );
                update.current = Math.random();
                updateStages(currentPipeline, sortStage);
                setCurrentCompanyStages(sortStage);
              }
            }
            resetFieldOnStageModalClose();
          });
        }
      } else {
        setStageLoading(false);

        setShowError(true);
        setErrorMessage('Stage name must be unique');
      }
    } else if (
      currentStageText.text !== '' &&
      currentCompanyStages &&
      isEditName
    ) {
      const isExist = currentCompanyStages.find(
        (stage) =>
          stage.code ===
            currentStageText.text.split(' ').join('-').toLowerCase() &&
          stage.code !== isEditName
      );
      if (!isExist) {
        let companyStage;
        if (isSuperAdmin()) {
          companyStage = currentCompanyStages;
        } else {
          companyStage = [...currentCompanyStages];
        }
        companyStage.forEach((stage) => {
          if (stage.code === isEditName) {
            stage.title = currentStageText.text;
            stage.code = currentStageText.text
              .split(' ')
              .join('-')
              .toLowerCase();
          }
        });
        if (
          type === availableTypes.contact &&
          currentPipeline &&
          currentPipeline.id
        ) {
          updateMemberContactStage(currentPipeline.id, {
            stage: companyStage,
          }).then((res) => {
            if (res.error) {
              toast.error(res.error);
            } else {
              toast.success('Stage Updated Successfully');

              setCurrentCompanyStages([]);
              const sortStage = companyStage.sort(
                ({ order: a }, { order: b }) => a - b
              );
              update.current = Math.random();
              updateStages(currentPipeline, sortStage);
              setCurrentCompanyStages(sortStage);
            }
            resetFieldOnStageModalClose();
          });
        }
      } else {
        resetFieldOnStageModalClose();
        setShowError(true);
        setErrorMessage('Stage name must be unique');
      }
    }
  };

  const addMemberIntoStage = (data) => {
    if (data && laneDetails.member) {
      const ids = [];
      Object.keys(data).forEach((key) => {
        if (data[key]) {
          ids.push(key);
        }
      });
      if (ids.length > 0) {
        const obj = {};
        obj.userIds = ids;
        const pipeline = {};
        pipeline.label = currentPipeline?.label;
        pipeline.value = currentPipeline?.value;
        pipeline.id = currentPipeline?.id;
        obj.pipeline = pipeline;

        const stages = currentCompanyStages.find(
          (stageDetail) => stageDetail.code === laneDetails.member
        );
        if (stages) {
          const statusObj = {};
          statusObj.id = stages._id;
          obj.status = statusObj;

          const toastId = showToast(
            TOASTTYPES.loading,
            '',
            'Assign Pipeline or Stages...'
          );
          if (type === availableTypes.contact) {
            assignContactPipeline(obj).then((res) => {
              if (res.error) {
                toast.error(res.error);
                showToast(TOASTTYPES.error, toastId, res.error);
              } else {
                showToast(
                  TOASTTYPES.success,
                  toastId,
                  'Pipeline or stages assign Successfully'
                );
                getCompanyContactDetails();
              }
            });
          }
        }
      }
      reset(null);
    }
    setLaneDetails({ ...laneDetails, member: null });
    setAddStage(!addStage);
  };

  const clearStageModal = () => {
    setOpenAddStage(!openAddStage);
    setShowError(false);
    setIsEditName(false);

    setCurrentStageText({
      text: '',
    });
    setErrorMessage(false);
  };

  const clearAddMemberModal = () => {
    setAddStage(!addStage);
    setAvailableCompanyMember([]);
    setFetchMemberLoader(false);
  };

  const stageContainContacts = (stageId) => {
    return contactDetail.some((contact) =>
      contact.pipelineDetails.some(
        (pipelineDetail) =>
          pipelineDetail.status && pipelineDetail.status.id === stageId
      )
    );
  };

  const handleViewContacts = (stage) => {
    setCurrentStage(stage);
    setIsContactModalVisible(true);
  };

  const LaneHeader = ({ title, id, _id, stageObject }) => {
    return (
      <div className='header'>
        <h3
          className='title'
          id={`title_${_id}`}
          onClick={() => {
            if (id === 'addNewStage') {
              if (selectedCompany) {
                setOpenAddStage(!openAddStage);
              } else {
                toast.error('Please select company first to add new stage...');
              }
            }
          }}
        >
          {id !== 'addNewStage' ? (
            title
          ) : (
            <>
              <Plus size={15} /> {title}
            </>
          )}
        </h3>
        {id !== 'addNewStage' ? (
          <>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`title_${_id}`}
            >
              Reorder this stage by dragging it left or right
            </UncontrolledTooltip>
            <UncontrolledDropdown className='more-options-dropdown'>
              <DropdownToggle
                className='btn-icon p-0'
                color='transparent'
                size='sm'
              >
                <MoreVertical size='18' />
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem
                  href='/'
                  onClick={(e) => {
                    e.preventDefault();
                    renameCompanyStageName(stageObject);
                  }}
                >
                  Rename
                </DropdownItem>
                <DropdownItem
                  href='/'
                  onClick={(e) => {
                    e.preventDefault();
                    deleteCompanyStage(stageObject);
                  }}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </>
        ) : (
          <>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`title_${_id}`}
            >
              Add new stage
            </UncontrolledTooltip>
          </>
        )}
      </div>
    );
  };

  const TopSection = ({ children }) => {
    return (
      <Card className={`react-trello-lane me-1`}>
        <div className='p-1 main-card-shadow'>{children}</div>
      </Card>
    );
  };

  const ContactCard = (props) => {
    return (
      <div className='contact-box' onClick={() => viewCardDetails(props)}>
        <div className='move-icon-wrapper' onClick={(e) => e.stopPropagation()}>
          <MoreVertical className='drag-icon' />
          <MoreVertical className='drag-icon' />
        </div>
        <Badge color='primary' className='mb-1' pill>
          {props.company}
        </Badge>
        <div className='name-company-details'>
          <h4 className='contact-neme'>{props.title}</h4>
        </div>
      </div>
    );
  };

  const AddCardLink = (props) => {
    return props.laneId !== 'addNewStage' ? (
      <>
        <div className='addNew-contact-btn-wrapper'>
          <Button className='' color='primary'>
            <Plus size={15} />
            <span
              className='text'
              onClick={() => {
                if (selectedCompany) {
                  addNewContact(props.laneId);
                } else {
                  toast.error('Please select company first to add new contact');
                }
              }}
            >
              Add New Contact
            </span>
          </Button>
        </div>
      </>
    ) : null;
  };

  return (
    <>
      <div className='pipeline-stage-kanban-view'>
        {showCompanyDropdown ? (
          <div className='d-flex'>
            <div className='col-sm-4 col-md-3' style={{ marginRight: '15px' }}>
              <Select
                id={'company_details'}
                theme={selectThemeColors}
                style={{ width: '10%' }}
                placeholder={'Select Company'}
                classNamePrefix='select'
                options={companyName}
                isClearable={false}
                onChange={(e) => {
                  handleCompanyChange(e);
                }}
                isMulti={false}
                isOptionSelected={(option, selectValue) =>
                  selectValue.some((i) => i === option)
                }
                isDisabled={false}
              />
            </div>
          </div>
        ) : null}
        <div className={`pipline-stage-kanban-view-header main-view`}>
          <div className='title'>
            <div
              className='task-manager-sidebar-toggle-btn'
              onClick={() => {
                setSidebarCollapsed(false);
              }}
            >
              <span className='line'></span>
              <span className='line'></span>
              <span className='line'></span>
            </div>
            Pipeline Stages
          </div>
          <div className='right'>
            <Button
              className=''
              color='primary'
              onClick={() => {
                if (selectedCompany) setOpenAddStage(!openAddStage);
                else {
                  toast.error(
                    'Please select company first to add new stage...'
                  );
                }
              }}
            >
              <Plus size={15} />
              <span className='align-middle ms-50'>Add Stage</span>
            </Button>
            <ButtonGroup>
              <Button
                tag='label'
                className={classnames('btn-icon view-btn grid-view-btn', {
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
                className={classnames('btn-icon view-btn list-view-btn', {
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
        </div>
        <PerfectScrollbar className='pipline-stage-kanban-scroll'>
          {pipelineLoading ? (
            <>
              <div className='d-flex justify-content-center my-1'>
                <Spinner />
              </div>
            </>
          ) : (
            <>
              {companyStages && selectedCompany && activeView === 'grid' ? (
                <Board
                  editable
                  style={{
                    backgroundColor: '#fff',
                    paddingTop: '20px',
                    height: '100%',
                    minHeight: '600px',
                  }}
                  data={companyStages}
                  draggable
                  handleDragEnd={handleDragEnd}
                  components={{
                    LaneHeader,
                    Section: TopSection,
                    Card: ContactCard,
                    AddCardLink,
                  }}
                  key={update.current}
                  onCardClick={viewCardDetails}
                  handleLaneDragEnd={handleLaneDragEnd}
                />
              ) : (
                <div className='stage-grid-view-wrapper'>
                  <PipelineStagesTable
                    currentPipeline={currentPipeline}
                    pipelineStages={currentCompanyStages}
                    setCurrentPipelineStages={(stages) =>
                      setCurrentCompanyStages(stages)
                    }
                    handleViewContacts={handleViewContacts}
                    stageContainContacts={stageContainContacts}
                    handleEditStage={(stage) => renameCompanyStageName(stage)}
                    handleConfirmDelete={(stage) => deleteCompanyStage(stage)}
                  />
                </div>
              )}
            </>
          )}
        </PerfectScrollbar>
        <div>
          <ChangeStage
            openModal={openModal}
            setOpenModal={setOpenModal}
            changeCardPosition={changeCardPosition}
            currentChange={currentChange}
            currentNote={currentNote}
            setShowError={setShowError}
            setCurrentNote={setCurrentNote}
            showError={showError}
            update={update}
          />
        </div>
      </div>
      {openAddStage && (
        <AddStage
          openAddStage={openAddStage}
          clearStageModal={clearStageModal}
          isEditName={isEditName}
          currentStageText={currentStageText}
          showError={showError}
          setShowError={setShowError}
          setCurrentStageText={setCurrentStageText}
          errorMessage={errorMessage}
          stageLoading={stageLoading}
          createCompanyStage={createCompanyStage}
        />
      )}
      {openViewDetailModal && (
        <ViewContactDetail
          openViewDetailModal={openViewDetailModal}
          setOpenViewDetailModal={setOpenViewDetailModal}
          contactDetail={contactDetail}
          currentViewContact={currentViewContact}
          currentPipeline={currentPipeline}
          companyStages={companyStages}
          viewContact={viewContact}
        />
      )}
      {addStage && (
        <AddContactModal
          addStage={addStage}
          clearAddMemberModal={clearAddMemberModal}
          type={type}
          handleSubmit={handleSubmit}
          addMemberIntoStage={addMemberIntoStage}
          fetchMemberLoader={fetchMemberLoader}
          availableCompanyMember={availableCompanyMember}
          setValue={setValue}
          availableTypes={availableTypes}
          errors={errors}
          control={control}
        />
      )}
      {isContactModalVisible && currentStage && (
        <>
          <ContactListModal
            currentStage={currentStage}
            currentPipeline={currentPipeline}
            isModalOpen={isContactModalVisible}
            setIsModalOpen={() => {
              setIsContactModalVisible(false);
            }}
            contacts={getStageContacts(currentStage?._id)}
          />
        </>
      )}
    </>
  );
};

export default KanbanView;
