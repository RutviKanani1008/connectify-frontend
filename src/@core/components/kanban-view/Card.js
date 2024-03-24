import React, { useEffect, useState, useRef, Fragment } from 'react';
import {
  Card,
  Modal,
  Input,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import Board from 'react-trello';
import { defaultStages } from '../../constant/company';
import { updateCompanyContactStage } from '../../../api/company';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import { getContactDetails, updateContactStatus } from '../../api/contacts';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import moment from 'moment';
import { MoreVertical, Plus } from 'react-feather';
import { SaveButton } from '@components/save-button';
import { useHistory } from 'react-router-dom';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import toast from 'react-hot-toast';
import { getCurrentUser, isSuperAdmin } from '../../../helper/user.helper';
const MySwal = withReactContent(Swal);

const KanbanView = ({ companyName, contactStages }) => {
  const [companyStages, setCompanyStages] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openViewFetailModal, setOpenViewDetailModal] = useState(false);
  const [openAddStage, setOpenAddStage] = useState(false);
  const [currentNote, setCurrentNote] = useState({ text: '' });
  const [currentStageText, setCurrentStageText] = useState({ text: '' });

  const [contactDetail, setContactDetail] = useState([]);
  const [currentViewContact, setCurrentViewContact] = useState(false);
  const [showError, setShowError] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(false);
  const history = useHistory();
  const [currentCompanyStages, setCurrentCompanyStages] = useState([]);
  const [isEditName, setIsEditName] = useState(false);

  const [currentChange, setCurrentChange] = useState({
    cardId: '',
    sourceLaneId: '',
    targetLaneId: '',
    position: '',
    cardDetails: '',
  });
  const update = useRef(0);
  const viewCardDetails = (detail) => {
    setCurrentViewContact(detail.id);
    setOpenViewDetailModal(!openViewFetailModal);
  };

  const addNewContact = (lane) => {
    if (selectedCompany) {
      history.push({
        pathname: `/contacts/add`,
        search: `status=${lane}&company=${selectedCompany.value}`,
        state: {
          from: history.location.pathname,
        },
      });
    } else {
      history.push(`/contacts/add?status=${lane}`);
    }
  };

  const deleteCompanyStage = (id, cards) => {
    if (
      currentCompanyStages &&
      currentCompanyStages.length > 0 &&
      cards.length === 0
    ) {
      const stages = currentCompanyStages.filter((stage) => stage.code !== id);
      const toastId = showToast(TOASTTYPES.loading, '', 'Stage Deleting...');
      updateCompanyContactStage(selectedCompany?.value, { stage: stages }).then(
        (res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            setCurrentCompanyStages([]);
            const sortStage = stages.sort(
              ({ order: a }, { order: b }) => a - b
            );
            setCurrentCompanyStages(sortStage);
            update.current = Math.random();

            showToast(
              TOASTTYPES.success,
              toastId,
              'Stage Deleted Successfully'
            );
          }
        }
      );
    } else if (cards.length > 0) {
      // Stage not allowed to change

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

  const renameCompanyStageName = (id, title, cards) => {
    if (
      currentCompanyStages &&
      currentCompanyStages.length > 0 &&
      cards?.length === 0
    ) {
      setIsEditName(id);
      setCurrentStageText({ text: title });
      setOpenAddStage(!openAddStage);
    } else if (
      currentCompanyStages &&
      currentCompanyStages.length > 0 &&
      cards &&
      cards.length > 0
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

  const LaneHeader = ({ title, id, cards }) => {
    return (
      <div className='d-flex justify-content-between cursor-pointer'>
        <div className='d-flex justify-content-center align-items-center'>
          <span className='font-weight-bold weighted-text text-primary'>
            {title}
          </span>
        </div>
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
                renameCompanyStageName(id, title, cards);
              }}
            >
              Rename
            </DropdownItem>
            <DropdownItem
              href='/'
              onClick={(e) => {
                e.preventDefault();
                deleteCompanyStage(id, cards);
              }}
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  };

  const TopSection = ({ children }) => {
    return (
      <Card className={`react-trello-lane me-1 fsffdfdsfdsf`}>
        <div className='p-1 main-card-shadow'>{children}</div>
      </Card>
    );
  };

  const ContactCard = (props) => {
    return (
      <div
        className='border p-1 mb-1 bg-white cursor-pointer rounded'
        onClick={() => viewCardDetails(props)}
      >
        <Badge color='primary' className='mb-1' pill>
          {props.company}
        </Badge>
        <div>
          <span className='weighted-text'>{props.title}</span>
        </div>
      </div>
    );
  };

  const AddCardLink = (props) => {
    return (
      <div className='text-center'>
        <hr></hr>
        <div className='d-flex align-items-center justify-content-center cursor-pointer weighted-text'>
          <Plus size={15} />{' '}
          <span
            className='cursor-pointer'
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
        </div>
      </div>
    );
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
      currentCompanyStages.forEach((company) => {
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
    }
    setCompanyStages({ lanes: companyStageDetails });
  };

  useEffect(() => {
    if (defaultStages) {
      getStageDetails();
      update.current = Math.random();
    }
  }, [contactDetail]);

  // useEffect(() => {
  //   if (defaultStages) {
  //     getStageDetails();
  //   }
  // }, [contactDetail]);

  const handleCompanyChange = async (e) => {
    let companyStage;
    contactStages.forEach((stage) => {
      Object.keys(stage).forEach((key) => {
        if (String(key) === e.value) {
          companyStage = stage[key];
        }
      });
    });
    const sortStage = companyStage.sort(({ order: a }, { order: b }) => a - b);
    setCurrentCompanyStages(sortStage);

    setSelectedCompany(e);
  };

  useEffect(() => {
    if (!isSuperAdmin()) {
      const user = getCurrentUser();
      handleCompanyChange({ value: user.company._id });
    }
  }, []);

  const getCompanyContactDetails = () => {
    const toastId = showToast(TOASTTYPES.loading, '', 'contact loading...');
    getContactDetails({ 'companyDetail.id': selectedCompany.value }).then(
      (res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          setContactDetail(res.data.data);
          // if (res?.data?.data.length > 0) {
          // }
          showToast(TOASTTYPES.success, toastId, 'Contact loaded.');
        }
      }
    );
  };

  useEffect(() => {
    if (selectedCompany) {
      getCompanyContactDetails();
    }
  }, [selectedCompany]);

  const handleDragEnd = (
    cardId,
    sourceLaneId,
    targetLaneId,
    position,
    cardDetails
  ) => {
    if (sourceLaneId !== targetLaneId) {
      setCurrentChange({
        cardId,
        sourceLaneId,
        targetLaneId,
        position,
        cardDetails,
      });
      setOpenModal(true);
    }
  };

  const changeCardPosition = async () => {
    if (currentNote?.text !== '') {
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
      if (
        contact &&
        contact[0] &&
        contact[0].notes &&
        currentNote?.text !== ''
      ) {
        const note = [...contact[0].notes];
        note.push({
          text: currentNote?.text,
          createdAt: moment().toLocaleString(),
        });
        const toastId = showToast(TOASTTYPES.loading, '', "Note's Saving...");
        updateContactStatus(contact[0]._id, { notes: note }).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(TOASTTYPES.success, toastId, "Note's Saved Successfully");
          }
        });
      }
      const stages = defaultStages.filter(
        (stage) => stage.code === currentChange.targetLaneId
      );

      const status = {};
      status['code'] = stages[0].code;
      status['title'] = stages[0].title;

      const toastId = showToast(TOASTTYPES.loading, '', 'Status Updating...');
      updateContactStatus(currentChange.cardDetails.id, { status }).then(
        (res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Status Updated Successfully'
            );
          }
        }
      );
      setCurrentNote({ text: '' });
    } else {
      update.current = Math.random();
    }
    setOpenModal(false);
  };

  const viewContact = () => {
    history.push(`/contacts/${currentViewContact}`);
  };

  const handleLaneDragEnd = (removedIndex, addedIndex, payload) => {
    if (
      currentCompanyStages &&
      currentCompanyStages.length > 0 &&
      payload.cards.length === 0
    ) {
      const stages = currentCompanyStages;

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
      const toastId = showToast(TOASTTYPES.loading, '', 'Stage Updating...');
      updateCompanyContactStage(selectedCompany?.value, { stage: stages }).then(
        (res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Stage Updated Successfully'
            );
          }
        }
      );
      setCurrentCompanyStages(sortStage);
    } else if (payload.cards.length > 0) {
      // Stage not allowed to change

      return MySwal.fire({
        title: '',
        text: 'You are not allowed to change order.',
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

  const createCompnayStage = () => {
    if (
      currentStageText.text !== '' &&
      currentCompanyStages.length &&
      !isEditName
    ) {
      const obj = {};
      obj.code = currentStageText.text.split(' ').join('-').toLowerCase();
      obj.title = currentStageText.text;
      obj.order = currentCompanyStages.length;

      const companyStage = currentCompanyStages;
      companyStage.push(obj);
      const toastId = showToast(TOASTTYPES.loading, '', 'Stage Updating...');
      updateCompanyContactStage(selectedCompany?.value, {
        stage: companyStage,
      }).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          setCurrentCompanyStages([]);
          const sortStage = companyStage.sort(
            ({ order: a }, { order: b }) => a - b
          );
          update.current = Math.random();

          setCurrentCompanyStages(sortStage);
          showToast(TOASTTYPES.success, toastId, 'Stage Updated Successfully');
        }
      });
      setOpenAddStage(false);
    } else if (
      currentStageText.text !== '' &&
      currentCompanyStages.length &&
      isEditName
    ) {
      const companyStage = currentCompanyStages;

      companyStage.forEach((stage) => {
        if (stage.code === isEditName) {
          stage.title = currentStageText.text;
          stage.code = currentStageText.text.split(' ').join('-').toLowerCase();
        }
      });
      const toastId = showToast(TOASTTYPES.loading, '', 'Stage Updating...');
      updateCompanyContactStage(selectedCompany?.value, {
        stage: companyStage,
      }).then((res) => {
        if (res.error) {
          showToast(TOASTTYPES.error, toastId, res.error);
        } else {
          setCurrentCompanyStages([]);
          const sortStage = companyStage.sort(
            ({ order: a }, { order: b }) => a - b
          );
          update.current = Math.random();

          setCurrentCompanyStages(sortStage);
          showToast(TOASTTYPES.success, toastId, 'Stage Updated Successfully');
        }
      });
      setIsEditName(false);
      setCurrentStageText({ text: '' });
      setOpenAddStage(false);
    }
  };

  useEffect(() => {
    if (currentCompanyStages && currentCompanyStages.length > 0) {
      getStageDetails();
      update.current = Math.random();
    }
  }, [currentCompanyStages]);

  return (
    <div>
      <div className='d-flex justify-content-between mb-1'>
        {isSuperAdmin() ? (
          <div className='col-sm-4 col-md-3'>
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
        ) : null}
        {isSuperAdmin() ? (
          <div className='col-0 col-md-2'>
            <Button
              className='ms-2'
              color='primary'
              // onClick={handelAddNewItem}
            >
              <Plus size={15} />
              <span
                className='align-middle ms-50'
                onClick={() => {
                  if (selectedCompany) {
                    setOpenAddStage(!openAddStage);
                  } else {
                    toast.error(
                      'Please select company first to add new stage...'
                    );
                  }
                }}
              >
                Add Stage
              </span>
            </Button>
          </div>
        ) : null}
      </div>
      <div>
        {companyStages ? (
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
            // handleLaneDragEnd={handleDragStart}
            handleLaneDragEnd={handleLaneDragEnd}
            // handleLaneDragStart={handleLaneDragStart}
            // onCardMoveAcrossLanes={onCardMoveAcrossLanes}
          />
        ) : null}
      </div>
      <div>
        <Modal
          isOpen={openModal}
          toggle={() => setOpenModal(!openModal)}
          className='modal-dialog-centered'
          backdrop='static'
        >
          <ModalHeader toggle={() => setOpenModal(!openModal)}>
            You are moving the contact
          </ModalHeader>
          <ModalBody>
            <div className='mb-2 d-flex justify-content-center'>
              {currentChange &&
              currentChange.sourceLaneId &&
              currentChange.targetLaneId ? (
                <>
                  From{' '}
                  <span className='text-primary ms-4px me-4px fw-bolder'>
                    {currentChange.sourceLaneId}
                  </span>{' '}
                  To{' '}
                  <span className='text-primary ms-4px me-4px fw-bolder'>
                    {currentChange.targetLaneId}
                  </span>
                </>
              ) : null}
            </div>
            <div className='mb-2'>
              <Input
                label='Notes'
                name='note'
                placeholder='Note'
                type='textarea'
                value={currentNote.text}
                onChange={(e) => {
                  if (showError) {
                    setShowError(false);
                  }
                  setCurrentNote({ ...currentNote, text: e.target.value });
                }}
              />
              {showError ? (
                <>
                  <div className='mt-1 text-danger'>Please enter note.</div>
                </>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={() => {
                if (currentNote.text === '') {
                  setShowError(true);
                } else {
                  changeCardPosition();
                }
              }}
            >
              Add Note
            </Button>
            <Button color='danger' onClick={() => changeCardPosition()}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <div>
        <Modal
          isOpen={openAddStage}
          toggle={() => setOpenAddStage(!openAddStage)}
          className='modal-dialog-centered'
          backdrop='static'
        >
          <ModalHeader toggle={() => setOpenAddStage(!openAddStage)}>
            Add Stage
          </ModalHeader>
          <ModalBody>
            <div className='mb-2'>
              <Input
                label='Stage Name'
                name='stage'
                placeholder='Stage name'
                type='text'
                value={currentStageText.text}
                onChange={(e) => {
                  if (showError) {
                    setShowError(false);
                  }
                  setCurrentStageText({
                    ...currentStageText,
                    text: e.target.value,
                  });
                }}
              />
              {showError ? (
                <>
                  <div className='mt-1 text-danger'>
                    Please Enter stage Name.
                  </div>
                </>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='primary'
              onClick={() => {
                if (currentStageText.text === '') {
                  setShowError(true);
                } else {
                  createCompnayStage();
                }
              }}
            >
              Add Stage
            </Button>
            <Button
              color='danger'
              onClick={() => setOpenAddStage(!openAddStage)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <div>
        <Modal
          isOpen={openViewFetailModal}
          toggle={() => setOpenViewDetailModal(!openViewFetailModal)}
          className='modal-dialog-centered'
          backdrop='static'
        >
          <ModalHeader
            toggle={() => setOpenViewDetailModal(!openViewFetailModal)}
          >
            Contact Info
          </ModalHeader>
          <ModalBody>
            <div className='mb-2 d-flex justify-content-center'></div>
            <div className='mb-2'>
              {contactDetail &&
                currentViewContact &&
                contactDetail.length > 0 &&
                contactDetail.map((contact, index) => {
                  if (contact._id === currentViewContact) {
                    return (
                      <Fragment key={index}>
                        <div className='container overflow-hidden'>
                          <div className='row'>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>First Name:</div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>
                                {contact.firstName}
                              </div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>Last Name: </div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>{contact.lastName}</div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>Email: </div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>{contact.email}</div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>Phone: </div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>{contact.phone}</div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>Email: </div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>{contact.email}</div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>Address Line 1: </div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>{contact.address1}</div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>Current Status: </div>
                            </div>
                            <div className='col-6'>
                              <div className='p-0 mt-1'>
                                {contact?.status?.title}
                              </div>
                            </div>
                            <div className='col-12 mt-1 text-center'>
                              <SaveButton
                                name='View Contact'
                                width='200'
                                onClick={viewContact}
                              />
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    );
                  }
                })}
            </div>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default KanbanView;
