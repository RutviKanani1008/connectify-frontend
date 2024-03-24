import _ from 'lodash';
import { useUpdatePositionAPI } from '../../../../hooks/useGeneralAPI';
import { useState } from 'react';

const useOnDragEnd = ({
  setStages,
  stages,
  setModal,
  moduleKey,
  customPipeline,
}) => {
  // ** States **
  const [currentChange, setCurrentChange] = useState({
    cardId: '',
    sourceLaneId: '',
    sourceLaneTitle: '',
    targetLaneId: '',
    targetLaneTitle: '',
    position: '',
    cardDetails: '',
  });

  //   ** APIS **
  const { updatePositionAPI } = useUpdatePositionAPI();

  const onDragEnd = async (result) => {
    if (result.type === 'COLUMN') {
      const list = Array.from(stages);
      const [removed] = list.splice(result.source.index, 1);
      list.splice(result.destination.index, 0, removed);
      setStages(list);
      await updatePositionAPI({
        items: list
          .filter(
            (obj) => obj.id !== 'unAssigned' && obj.id !== 'unassignedItem'
          )
          .map((obj, index) => ({ _id: obj.id, position: index })),
        model: moduleKey,
        customPipelineId: customPipeline?._id,
      });
    } else {
      if (result.source.droppableId === result.destination.droppableId) {
        const tempLane = _.clone(stages);
        const currentColumnIndex = tempLane.findIndex(
          (obj) => obj.id === result.source.droppableId
        );
        const currentColumnCards = tempLane[currentColumnIndex].cards;
        const [removed] = currentColumnCards.splice(result.source.index, 1);
        currentColumnCards.splice(result.destination.index, 0, removed);
        tempLane[currentColumnIndex] = {
          ...tempLane[currentColumnIndex],
          cards: currentColumnCards,
        };
        setStages(tempLane);
      } else {
        const sourceStage = stages.find(
          (obj) => obj.id === result.source.droppableId
        );
        const destinationStage = stages.find(
          (obj) => obj.id === result.destination.droppableId
        );
        const cardDetails = sourceStage.cards.find(
          (obj) => obj.id === result.draggableId
        );
        setCurrentChange({
          cardId: result.draggableI,
          sourceLaneId: result.source.droppableId,
          targetLaneId: result.destination.droppableId,
          cardDetails,
          sourceLaneTitle: sourceStage.title,
          targetLaneTitle: destinationStage.title,
        });
        setModal((prev) => ({ ...prev, changeStageModal: true }));
      }
    }
  };

  return { onDragEnd, currentChange };
};

export default useOnDragEnd;
