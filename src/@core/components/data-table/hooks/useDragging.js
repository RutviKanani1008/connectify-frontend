import { useRef } from 'react';
import {
  getPositionAffectedItems,
  updateItemPostion,
} from '../../../../helper/common.helper';
import { useUpdatePositionAPI } from '../../../../hooks/useGeneralAPI';

export const useDraggable = ({
  setOriginalDataList,
  originalDataList,
  model,
  customPipeline,
  resetOriginalDataListOnError = false,
}) => {
  const sortableHandle = useRef();

  const { updatePositionAPI } = useUpdatePositionAPI();

  const onDragEnd = async (evt, dataList = []) => {
    const { newIndex, oldIndex } = evt;

    if (model === 'pipeline' && customPipeline) {
      dataList = dataList.map((item) => ({ ...item, position: item.order }));
    }

    const itemsToUpdate = getPositionAffectedItems(
      oldIndex,
      newIndex,
      dataList
    );

    const { error } = await updatePositionAPI({
      customPipelineId: customPipeline?._id,
      items: itemsToUpdate,
      model,
    });

    if (error) {
      sortableHandle.current?.updateFilteredData(
        dataList.sort((a, b) => a.position - b.position)
      );
      if (resetOriginalDataListOnError) {
        setOriginalDataList(
          dataList.sort((a, b) => a.position - b.position),
          true
        );
      }
    } else {
      setOriginalDataList(
        updateItemPostion(originalDataList, itemsToUpdate).sort(
          (a, b) => a.position - b.position
        )
      );
      sortableHandle.current?.updateFilteredData(
        updateItemPostion(dataList, itemsToUpdate).sort(
          (a, b) => a.position - b.position
        )
      );
    }
  };

  return { onDragEnd, sortableHandle };
};
