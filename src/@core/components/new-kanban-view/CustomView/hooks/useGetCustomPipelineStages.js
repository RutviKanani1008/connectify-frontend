import { useState } from 'react';
import { useSelector } from 'react-redux';

import _ from 'lodash';

import { userData } from '../../../../../redux/user';
import { logger } from '../../../../../utility/Utils';
import { getPipelineStages as getPipelineStagesAPI } from '../../../../../api/pipeline';

const useGetCustomPipelineStages = () => {
  // ** Hooks **
  const user = useSelector(userData);

  // ** States **
  const [stages, setStages] = useState([]);
  const [pipelineStages, setPipelineStages] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPipelineStages = async ({ groupId, pipelineId }) => {
    try {
      setLoading(true);

      const { data: stagesResponse } = await getPipelineStagesAPI({
        groupId,
        _id: pipelineId,
        company: user.company._id,
      });

      if (_.isArray(stagesResponse?.data)) {
        const stagesData = (stagesResponse?.data || []).sort(
          (a, b) => a.order - b.order
        );

        setPipelineStages(stagesData);
        setStages([
          ...stagesData.map((obj) => ({
            id: obj._id,
            total: 0,
            title: obj.title,
            cards: [],
          })),
        ]);
      }
      setLoading(false);
    } catch (error) {
      logger(error);
      setLoading(false);
    }
  };

  return {
    stages,
    setStages,
    pipelineStages,
    setPipelineStages,
    getPipelineStages,
    loading,
  };
};

export default useGetCustomPipelineStages;
