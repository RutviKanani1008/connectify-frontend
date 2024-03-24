import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';

import { logger } from '../../../../../utility/Utils';
import { storeUser, userData } from '../../../../../redux/user';
import { getGroups as getGroupsAPI } from '../../../../../api/groups';

const useGetGroups = () => {
  // ** Hooks **
  const user = useSelector(userData);
  const dispatch = useDispatch();

  // ** States **
  const [stages, setStages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const getGroups = async () => {
    try {
      setLoading(true);

      const { data: groupsResponse } = await getGroupsAPI({
        company: user.company._id,
      });

      if (_.isArray(groupsResponse?.data)) {
        const groupsData = [
          {
            groupName: 'UnAsssigned Group',
            groupCode: 'unAssigned',
            _id: 'unAssigned',
            position: 0,
            isNotDraggable: true,
          },
          ...(groupsResponse?.data || []),
        ].sort((a, b) => a.position - b.position);
        const userObj = JSON.parse(JSON.stringify(user));
        userObj.group = groupsResponse;
        dispatch(storeUser(userObj));

        setGroups(groupsData);
        setStages([
          ...groupsData.map((obj) => ({
            id: obj._id,
            total: 0,
            title: obj.groupName,
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
    groups,
    setGroups,
    getGroups,
    stages,
    setStages,
    loading,
  };
};

export default useGetGroups;
