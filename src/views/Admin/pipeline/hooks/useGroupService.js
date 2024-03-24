import _ from 'lodash';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { getGroups as getGroupsAPI } from '../../../../api/groups';
import useGroupPersist from '../../groups/hooks/useGroupPersist';

const useGroupService = () => {
  const user = useSelector(userData);
  const [selectedGroup] = useGroupPersist();

  const [isLoading, setIsLoading] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);

  useEffect(() => {
    getGroupDetails();
  }, []);

  const getGroupDetails = async () => {
    try {
      setIsLoading(true);

      const { data: groupsData } = await getGroupsAPI({
        company: user.company._id,
      });

      if (_.isArray(groupsData?.data) && groupsData.data?.length > 0) {
        setAvailableGroups(groupsData.data);
        if (selectedGroup) {
          const group = groupsData.data.find(
            (item) => item._id === selectedGroup.value
          );
          if (group) {
            setIsLoading(false);
            return setCurrentGroup(group);
          }
        }
        setIsLoading(false);
        setCurrentGroup(groupsData.data[0]);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  return {
    currentGroup,
    setCurrentGroup,
    availableGroups,
    isLoading,
  };
};

export default useGroupService;
