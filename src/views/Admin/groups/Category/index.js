import { Card } from 'reactstrap';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';

import { userData } from '../../../../redux/user';
import useGroupPersist from '../hooks/useGroupPersist';
import { getGroups as getGroupsAPI } from '../../../../api/groups';

import CustomSelect from '../../../../@core/components/form-fields/CustomSelect';
import CategoryView from '../../../../@core/components/new-kanban-view/CategoryView';

const Category = () => {
  const params = useParams();
  const user = useSelector(userData);
  const [initialGroup, setInitialGroup] = useGroupPersist();

  const [fetching, setFetching] = useState(false);
  const [allGroups, setAllGroups] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(initialGroup);

  const currentGroup = useMemo(() => {
    return allGroups.find(
      (group) =>
        group._id === selectedGroup?.value || group._id === selectedGroup?._id
    );
  }, [allGroups, selectedGroup]);

  const groupOptions = useMemo(
    () =>
      allGroups.map(({ _id, groupName }) => ({ label: groupName, value: _id })),
    [allGroups]
  );

  useEffect(() => {
    getAllGroups();
  }, [params]);

  const getAllGroups = async () => {
    setFetching(true);
    const res = await getGroupsAPI({ company: user.company._id, active: true });
    const groups = res.data?.data || [];
    if (Array.isArray(groups) && groups.length) {
      setAllGroups(groups);
      if (!selectedGroup) {
        const group = groups[0];
        const selected = { label: group?.groupName, value: group?._id };
        setInitialGroup(group);
        setSelectedGroup(selected);
      } else {
        if (!selectedGroup?.value) {
          const selected = {
            label: selectedGroup?.groupName,
            value: selectedGroup?._id,
          };
          setSelectedGroup(selected);
        }
      }
    }
    setFetching(false);
  };

  const groupSelect = () => {
    return (
      <div className='custom-width'>
        <CustomSelect
          classNamePrefix='custom-select'
          value={selectedGroup}
          options={groupOptions}
          onChange={(e) => {
            setSelectedGroup(e);
            setInitialGroup(e);
          }}
          label='Select Group'
        />
      </div>
    );
  };

  return (
    <>
      {!fetching && currentGroup?._id && (
        <div
          className={`pipeline-page-wrapper pipeline-page-wrapper-new ${'kanban-view-active'}`}
        >
          <Card className={`pipeline-card pipeline-kanbanView-wrapper`}>
            <div className='rightCN full-width'>
              <CategoryView
                group={currentGroup}
                groupSelect={groupSelect}
                activeView='list'
              />
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default Category;
