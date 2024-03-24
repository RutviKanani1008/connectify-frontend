import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'react-feather';
import Board from 'react-trello';
import { CardTitle, Spinner, UncontrolledTooltip } from 'reactstrap';
import { useDraggable } from '../data-table/hooks/useDragging';
import UILoader from '@components/ui-loader';
import {
  getStageContacts,
  updateContact,
  updateMultipleContactStage,
} from '../../../api/contacts';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import { getFullName } from '../../../utility/Utils';
import ConfirmChangeStage from './component/ConfirmChangeStage';
import AddContactToStageModal from './component/AddContactToStageModal';
import ViewContactModal from './component/ViewContactModal';
import LaneHeader from './component/Board/LaneHeader';
import ContactCard from './component/Board/ContactCard';
import AddCardLink from './component/Board/AddCard';
import TopSection from './component/Board/Section';
import { useGetNotInStageContactList } from './hooks/contactsAPI';

function PipelineView({
  moduleKey,
  selectedGroup,
  stages,
  setStages,
  onAddStage,
  onEditStage,
  onDeleteStage,
  isLoading = false,
  showBackButton = false,
  title = false,
  showHeader = true,
  setList = false,
}) {
  const user = useSelector(userData);

  useEffect(() => {
    if (!isLoading) {
      if (moduleKey === 'group') getAllStageContacts();
      else getAllStageContacts(selectedGroup.value);
    }
  }, [selectedGroup, isLoading]);

  const [openViewDetailModal, setOpenViewDetailModal] = useState(false);
  const [currentViewContact, setCurrentViewContact] = useState(false);
  const [stageContacts, setStageContacts] = useState({}); // contact - json (key = stage i and value [contact])
  const [loadingStageContacts, setLoadingStageContacts] = useState([]);
  const [assigningStageLoading, setAssigningStageLoading] = useState(false);
  const [contactsNotInStage, setContactsNotInStage] = useState([]);
  const [totalContactsNotInStage, setTotalContactsNotInStage] = useState(0);
  const [addContactsToStage, setAddContactsToStage] = useState(null); // lane id for add contacts to stage
  const [updateStageLoading, setUpdateStageLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [openChangeStageModal, setOpenChangeStageModal] = useState(false);
  const [currentChange, setCurrentChange] = useState({
    cardId: '',
    sourceLaneId: '',
    sourceLaneTitle: '',
    targetLaneId: '',
    targetLaneTitle: '',
    position: '',
    cardDetails: '',
  });

  // ** Custom Hooks **
  const { getOtherStageContacts, isLoading: loadingNotInStageContacts } =
    useGetNotInStageContactList();
  const { onDragEnd } = useDraggable({
    model: moduleKey,
    originalDataList: stages,
    setOriginalDataList: (newList, isResetValue) => {
      setStages(newList);
      setList(newList.map((listItem) => listItem.data));
      if (isResetValue) setRenderKey((prev) => prev + 1);
    },
    resetOriginalDataListOnError: true,
  });

  const getAllStageContacts = async (groupId) => {
    setLoadingStageContacts(true);
    const { data, error } = await getStageContacts({
      group: groupId,
      archived: false,
      company: user.company._id,
      aggregateOn: moduleKey,
      page: 1,
      stages: stages.reduce((result, stage) => {
        if (stage.id !== 'addNewStage') {
          if (result.length > 0) {
            result += ',';
          }
          result += stage.id;
        }
        return result;
      }, ''),
    });
    if (!error) {
      const resultObj = {};
      const newStages = stages.map((stage) => {
        const stageObj = data.data.find((obj) => obj._id === stage.id);
        resultObj[stage.id] = {
          contacts: stageObj?.contacts || [],
          total: stageObj?.total || 0,
          currentPage: 1,
          hasMoreContacts: stageObj?.hasMoreContacts ?? false,
        };
        const cards =
          stageObj?.contacts.map((c) => {
            return {
              id: c._id,
              title: getFullName(c.firstName, c.lastName) || c.email,
              companyName: c.company_name,
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
              userProfile: c.userProfile,
            };
          }) || [];

        return {
          ...stage,
          cards,
        };
      });
      setStageContacts(resultObj);
      setStages(newStages);
      setLoadingStageContacts(false);
    } else {
      setStageContacts([]);
      setLoadingStageContacts(false);
    }
  };

  const onAddNewContact = async (laneId) => {
    setAddContactsToStage(laneId);
  };

  const loadOtherContacts = async ({ page, limit, loadMore, search }) => {
    try {
      const { data, error } = await getOtherStageContacts({
        page,
        limit,
        search,
        group: moduleKey !== 'group' ? selectedGroup.value : undefined,
        archived: false,
        notInStage: addContactsToStage,
        stageKey: moduleKey,
        select: 'firstName,lastName,userProfile,email',
      });
      if (!error) {
        if (loadMore) {
          setContactsNotInStage((prevContacts) => [
            ...prevContacts,
            ...data.contacts,
          ]);
        } else {
          setContactsNotInStage(data.contacts || []);
        }
        setTotalContactsNotInStage(data.total);
      }
    } catch (error) {
      setAddContactsToStage(null);
    }
  };

  const viewCardDetails = ({ contactId, stageId }) => {
    const contact = stageContacts[stageId].contacts.find(
      (c) => c._id === contactId
    );
    if (contact) {
      setCurrentViewContact(contact);
      setOpenViewDetailModal(!openViewDetailModal);
    }
  };

  const handleDragEnd = (
    cardId,
    sourceLaneId,
    targetLaneId,
    position,
    cardDetails
  ) => {
    if (sourceLaneId === targetLaneId) {
      return;
    }
    if (targetLaneId === 'addNewStage') {
      return false;
    }
    const sourceTitle = stages.filter((lane) => lane.id === sourceLaneId);
    const targetTitle = stages.filter((lane) => lane.id === targetLaneId);
    setCurrentChange({
      cardId,
      sourceLaneId,
      targetLaneId,
      position,
      cardDetails,
      sourceLaneTitle: sourceTitle[0].title,
      targetLaneTitle: targetTitle[0].title,
    });
    setOpenChangeStageModal(true);
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleLaneDragEnd = (removedIndex, addedIndex, payload) => {
    if (payload.isNotDraggable) {
      setStages((prevStages) =>
        prevStages.sort((a, b) => a.position - b.position)
      );
      setRenderKey((prev) => prev + 1);
      return;
    }
    onDragEnd({ newIndex: addedIndex, oldIndex: removedIndex }, stages);
  };

  const onAddContacts = async (selectedContactIds) => {
    setAssigningStageLoading(true);
    await updateMultipleContactStage({
      contactIds: Array.from(selectedContactIds),
      stageId: addContactsToStage,
      stageKey: moduleKey,
    });
    setAssigningStageLoading(false);
    setAddContactsToStage(null);
    setContactsNotInStage([]);
    getAllStageContacts(selectedGroup?.value);
  };

  const changeCardPosition = async () => {
    setUpdateStageLoading(true);
    const rawStageData = JSON.parse(JSON.stringify(stages));
    const rawContacts = JSON.parse(JSON.stringify(stageContacts));
    let oldCard = null;
    rawStageData.map((stage) => {
      if (stage.id === currentChange.sourceLaneId && stage?.cards?.length > 0) {
        oldCard = stage?.cards.find(
          (card) => card.id === currentChange.cardDetails.id
        );
        const filterCard = stage?.cards.filter(
          (card) => card.id !== currentChange.cardDetails.id
        );
        stage.cards = filterCard;
      }
    });

    rawStageData.map((data) => {
      if (data.id === currentChange.targetLaneId) {
        const itemExists = data.cards.find((item) => item.id === oldCard.id);
        if (!itemExists) data.cards.push(oldCard);
      }
    });
    const targetStage = rawStageData.find(
      (stage) => stage.id === currentChange.targetLaneId
    );
    const contactDeatil = rawContacts[currentChange.sourceLaneId].contacts.find(
      (c) => c._id === oldCard.id
    );

    let payload = {};
    const commonProperties = {
      id: targetStage.id,
      value: targetStage.stageCode,
      label: targetStage.title,
    };
    switch (moduleKey) {
      case 'status': {
        payload = {
          statusHistory: contactDeatil.statusHistory,
          status: commonProperties,
        };
        break;
      }
      case 'category': {
        payload = {
          categoryHistory: contactDeatil.categoryHistory,
          category: commonProperties,
        };
        break;
      }
      case 'group':
        payload = {
          groupHistory: contactDeatil.groupHistory,
          group: commonProperties,
        };
        break;
      default:
        break;
    }
    if (targetStage.id === 'unassignedItem') {
      payload[moduleKey] = null;
    }
    const { error, data } = await updateContact(contactDeatil._id, payload);
    if (!error) {
      setStages(rawStageData);
      rawContacts[currentChange.sourceLaneId].contacts = rawContacts[
        currentChange.sourceLaneId
      ].contacts.filter((contact) => contact._id !== contactDeatil._id);
      const updatedContact = {
        ...contactDeatil,
      };
      switch (moduleKey) {
        case 'status':
          updatedContact.statusHistory = data.data.statusHistory;
          break;
        case 'category':
          updatedContact.categoryHistory = data.data.categoryHistory;
          break;
        case 'group':
          updatedContact.groupHistory = data.data.groupHistory;
          break;
        default:
          break;
      }

      rawContacts[currentChange.targetLaneId].contacts.push(updatedContact);
      setStageContacts(rawContacts);
    } else {
      setStages((prevStages) => prevStages);
      setRenderKey((prev) => prev + 1);
    }
    setUpdateStageLoading(false);
    setOpenChangeStageModal(false);
  };

  return (
    <UILoader blocking={isLoading}>
      {showHeader ? (
        <CardTitle tag='h4' className=''>
          <div className='d-flex'>
            {showBackButton ? (
              <>
                <div
                  className='back-arrow'
                  id={'goback'}
                  onClick={handleGoBack}
                >
                  <ArrowLeft className='cursor-pointer me-1' />
                </div>
                <UncontrolledTooltip placement='top' target={`goback`}>
                  Go Back
                </UncontrolledTooltip>
              </>
            ) : null}
            {title ? title : ''}
          </div>
        </CardTitle>
      ) : null}
      <Board
        editable
        style={{
          backgroundColor: '#fff',
          paddingTop: '20px',
          height: '100%',
          minHeight: '600px',
        }}
        data={{ lanes: stages }}
        draggable
        components={{
          LaneHeader: (props) => (
            <>
              <LaneHeader
                {...props}
                onAddStage={onAddStage}
                onEditStage={onEditStage}
                onDeleteStage={onDeleteStage}
              />
              {loadingStageContacts ? (
                <div className='spinner-wrapper'>
                  <Spinner className='lane-spinner' />
                </div>
              ) : null}
            </>
          ),
          Section: (props) => (
            <TopSection {...props} stageContacts={stageContacts} />
          ),
          Card: (props) => (
            <ContactCard {...props} viewCardDetails={viewCardDetails} />
          ),
          AddCardLink: (props) => (
            <>
              <AddCardLink
                {...props}
                onAddNewContact={onAddNewContact}
                addContactsToStageLane={addContactsToStage}
              />
            </>
          ),
        }}
        key={renderKey}
        handleLaneDragEnd={handleLaneDragEnd}
        handleDragEnd={handleDragEnd}
      />
      <div>
        <ConfirmChangeStage
          openModal={openChangeStageModal}
          setOpenModal={setOpenChangeStageModal}
          changeCardPosition={changeCardPosition}
          cancelStageChange={() => {
            setRenderKey((prev) => prev + 1);
            setOpenChangeStageModal(false);
          }}
          currentChange={currentChange}
          update={renderKey}
          isLoading={updateStageLoading}
        />
      </div>
      {addContactsToStage ? (
        <AddContactToStageModal
          isModalOpen={addContactsToStage ? true : false}
          onCloseModal={() => {
            setAddContactsToStage(null);
          }}
          contactsLoading={loadingNotInStageContacts}
          availableContacts={contactsNotInStage}
          assigningStageLoading={assigningStageLoading}
          onAddContacts={onAddContacts}
          totalContacts={totalContactsNotInStage}
          loadMoreContacts={loadOtherContacts}
        />
      ) : null}
      {openViewDetailModal && (
        <ViewContactModal
          openViewDetailModal={openViewDetailModal}
          setOpenViewDetailModal={setOpenViewDetailModal}
          currentViewContact={currentViewContact}
        />
      )}
    </UILoader>
  );
}

export default PipelineView;
