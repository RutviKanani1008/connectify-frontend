import _ from 'lodash';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import UILoader from '@components/ui-loader';
import Column from './components/Column';
import AddContactToStageModal from './components/AddContactToStageModal';
import { userData } from '../../../redux/user';
import useChangeCardPosition from './hooks/useChangeCardPosition';
import useOnDragEnd from './hooks/useOnDragEnd';
import ConfirmChangeStage from '../kanban-view/component/ConfirmChangeStage';
import ViewContact from '../kanban-view/component/ViewContactModal';
import useGetCardDataStageWise from './hooks/useGetCardDataStageWise';

const NewKanBanView = ({
  moduleKey,
  group,
  onEditStage,
  onDeleteStage,
  moduleData = [],
  loading,
  stages,
  setStages,
  getStages,
  customPipeline = null,
}) => {
  // ** Redux **
  const user = useSelector(userData);
  const prevStages = useRef([]);

  // ** States **
  const [modal, setModal] = useState({
    viewContact: false,
    addContact: false,
    changeStageModal: false,
  });
  const [currentStage, setCurrentStage] = useState({});
  const [currentContact, setCurrentContact] = useState({});
  const [refreshContacts, setRefreshContacts] = useState(true);

  //   ** Custom Hooks **
  const {
    getCardDataStageWise,
    loading: cardsLoading,
    stageContacts,
    setStageContacts,
  } = useGetCardDataStageWise({
    user,
    stages,
    setStages,
  });
  const { onDragEnd, currentChange } = useOnDragEnd({
    moduleKey,
    setModal,
    setStages,
    stages,
    customPipeline,
  });
  const { changeCardPosition, changeCardPositionLoading } =
    useChangeCardPosition({
      customPipelineId: customPipeline?._id,
      currentChange,
      handleModal,
      moduleKey,
      setStageContacts,
      setStages,
      stageContacts,
      stages,
    });

  // const isStagesChanged = useMemo(() => {
  //   const stageIds = stages.map((s) => ({ id: s.id, title: s.title }));
  //   const prevStageIds = prevStages.current.map((s) => ({
  //     id: s.id,
  //     title: s.title,
  //   }));
  //   console.log('HELLO STAGES', { stageIds, prevStageIds });

  //   return !_.isEqual(
  //     _.sortBy(stageIds, ['id']),
  //     _.sortBy(prevStageIds, ['id'])
  //   );
  // }, [stages]);

  useEffect(() => {
    if (moduleData.length) {
      setRefreshContacts(true);
    }
  }, [moduleData]);

  useEffect(() => {
    const stageIds = stages.map((s) => ({ id: s.id, title: s.title }));
    const prevStageIds = prevStages.current.map((s) => ({
      id: s.id,
      title: s.title,
    }));

    const isChanged = !_.isEqual(
      _.sortBy(stageIds, ['id']),
      _.sortBy(prevStageIds, ['id'])
    );

    if (isChanged) {
      setRefreshContacts(true);
    }
  }, [stages]);

  useEffect(() => {
    if (moduleData.length && stages.length && refreshContacts) {
      getCardDataStageWise({
        customPipelineId: customPipeline?._id,
        groupId: group?._id,
        moduleKey,
        stages: (stages || []).map((obj) => obj.id),
        allStages: stages || [],
      });
      prevStages.current = stages;
      setRefreshContacts(false);
    }
  }, [moduleData, customPipeline, refreshContacts]);

  const loadMoreData = (stageId) => {
    const cardsLength = stages.find((obj) => obj.id === stageId).cards.length;

    getCardDataStageWise({
      customPipelineId: customPipeline?._id,
      groupId: group?._id,
      moduleKey,
      stages: [stageId],
      allStages: stages,
      page: Math.round(cardsLength / 20) + 1,
    });
  };

  function handleModal(key, toggle) {
    setModal((prev) => ({ ...prev, [key]: toggle }));
  }

  const onAddNewContact = (stageId) => {
    const stage = stages.find((obj) => obj.id === stageId);
    setCurrentStage(stage);
    setModal((prev) => ({ ...prev, addContact: true }));
  };

  const viewCardDetails = ({ contactId, stageId }) => {
    const contact = stageContacts[stageId].contacts.find(
      (c) => c._id === contactId
    );
    if (contact) {
      setCurrentContact(contact);
      setModal((prev) => ({ ...prev, viewContact: true }));
    }
  };

  return (
    <UILoader blocking={loading}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId='board'
          type='COLUMN'
          direction='horizontal'
          ignoreContainerClipping={false}
        >
          {(provided) => (
            <div
              className='board  temp-board'
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {stages.map((stage, index) => (
                <Column
                  onEditStage={onEditStage}
                  onDeleteStage={onDeleteStage}
                  loadMoreData={loadMoreData}
                  onAddNewContact={onAddNewContact}
                  cardsLoading={cardsLoading}
                  index={index}
                  stage={stage}
                  key={stage.id}
                  viewCardDetails={viewCardDetails}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {modal.changeStageModal && (
        <ConfirmChangeStage
          openModal={modal.changeStageModal}
          setOpenModal={(toggle) => {
            setModal((prev) => ({ ...prev, changeStageModal: toggle }));
          }}
          changeCardPosition={changeCardPosition}
          cancelStageChange={() => {
            handleModal('changeStageModal', false);
          }}
          currentChange={currentChange}
          isLoading={changeCardPositionLoading}
        />
      )}
      {modal.addContact && (
        <AddContactToStageModal
          moduleKey={moduleKey}
          groupId={group?._id}
          customPipelineId={customPipeline?._id}
          isModalOpen={modal.addContact}
          onCloseModal={() => {
            handleModal('addContact', false);
          }}
          stageId={currentStage?.id}
          getStages={getStages}
        />
      )}
      {modal.viewContact && (
        <ViewContact
          openViewDetailModal={modal.viewContact}
          setOpenViewDetailModal={(toggle) =>
            handleModal('viewContact', toggle)
          }
          currentViewContact={currentContact}
        />
      )}
    </UILoader>
  );
};

export default NewKanBanView;
