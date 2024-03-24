import { useState } from 'react';

import _ from 'lodash';
import { logger } from '../../../../../utility/Utils';
import { getStatus as getStatusAPI } from '../../../../../api/status';

const useGetStatus = ({ user }) => {
  // ** States **
  const [stages, setStages] = useState([]);
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatus = async ({ groupId }) => {
    try {
      setLoading(true);
      const { data: statusResponse } = await getStatusAPI({
        company: user.company._id,
        groupId,
      });
      if (_.isArray(statusResponse?.data)) {
        const statusData = [
          {
            statusName: 'Unassigned',
            statusCode: 'unassignedItem',
            _id: 'unassignedItem',
            position: 0,
            isNotDraggable: true,
          },
          ...(statusResponse?.data || []),
        ].sort((a, b) => a.position - b.position);
        setStages([
          ...statusData.map((obj) => ({
            id: obj._id,
            total: 0,
            title: obj.statusName,
            cards: [],
          })),
        ]);
        setStatus([...statusData]);
      }

      setLoading(false);
    } catch (error) {
      logger(error);
      setLoading(false);
    }
  };

  return { getStatus, setStatus, status, loading, stages, setStages };
};

export default useGetStatus;
