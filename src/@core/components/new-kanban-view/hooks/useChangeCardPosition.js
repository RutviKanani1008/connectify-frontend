import { useState } from 'react';
import _ from 'lodash';
import { getContact, updateContact } from '../../../../api/contacts';

const useChangeCardPosition = ({
  customPipelineId,
  moduleKey,
  setStageContacts,
  setStages,
  stages,
  stageContacts,
  currentChange,
  handleModal,
}) => {
  // ** States *
  const [changeCardPositionLoading, setChangeCardPositionLoading] =
    useState(false);

  const changeCardPosition = async () => {
    try {
      setChangeCardPositionLoading(true);

      const rawStageData = _.clone(stages);
      const rawContacts = _.clone(stageContacts);
      let oldCard = null;
      rawStageData.map((stage) => {
        if (
          stage.id === currentChange.sourceLaneId &&
          stage?.cards?.length > 0
        ) {
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
      const contactDetail = rawContacts[
        currentChange.sourceLaneId
      ].contacts.find((c) => c._id === oldCard.id);

      let payload = {};
      const commonProperties = {
        id: targetStage.id,
        value: targetStage.stageCode,
        label: targetStage.title,
      };

      switch (moduleKey) {
        case 'status': {
          payload = {
            statusHistory: contactDetail.statusHistory,
            status: commonProperties,
          };
          break;
        }
        case 'category': {
          payload = {
            categoryHistory: contactDetail.categoryHistory,
            category: commonProperties,
          };
          break;
        }
        case 'group': {
          payload = {
            groupHistory: contactDetail.groupHistory,
            group: commonProperties,
          };
          break;
        }
        case 'pipeline': {
          const contactId = contactDetail._id;
          const contact = await getContact(contactId, {
            select: 'pipelineDetails',
            populateAll: false,
          });
          if (contact.data?.data) {
            const prevPipelineDetails = contact.data.data.pipelineDetails || [];
            const updatedPipelineDetails = prevPipelineDetails.map((p) => {
              if (p.pipeline?.id === customPipelineId) {
                return {
                  ...p,
                  status: { id: targetStage.id },
                  statusHistory: p.statusHistory /* Testing Pending */,
                };
              }
              return p;
            });
            payload = { pipelineDetails: updatedPipelineDetails };
          }
          break;
        }
        default:
          break;
      }

      if (targetStage.id === 'unassignedItem') {
        payload[moduleKey] = null;
      }

      const { error, data } = await updateContact(contactDetail._id, payload);

      if (!error) {
        setStages(rawStageData);
        rawContacts[currentChange.sourceLaneId].contacts = rawContacts[
          currentChange.sourceLaneId
        ].contacts.filter((contact) => contact._id !== contactDetail._id);
        const updatedContact = {
          ...contactDetail,
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
        if (!rawContacts[currentChange.targetLaneId]) {
          rawContacts[currentChange.targetLaneId] = {
            contacts: [updatedContact],
            currentPage: 1,
            total: 1,
            hasMoreContacts: false,
          };
        } else {
          rawContacts[currentChange.targetLaneId].contacts.push(updatedContact);
        }

        setStageContacts(rawContacts);
        handleModal('changeStageModal', false);
        return setChangeCardPositionLoading(false);
      } else {
        setStages((prevStages) => prevStages);
        handleModal('changeStageModal', false);
        setChangeCardPositionLoading(false);
      }
    } catch (error) {
      setChangeCardPositionLoading(false);
    }
  };

  return { changeCardPosition, changeCardPositionLoading };
};

export default useChangeCardPosition;
