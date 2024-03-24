// ==================== Packages =======================
import { useEffect, useState } from 'react';
// ====================================================
import { getGroupDetails } from '../../../../../api/groups';
import { useSetGroupRelatedValue } from '../../mass-email-tool/hooks/useMassEmailHelper';

const useMassSMSHelper = ({
  availableContacts,
  setFilterContacts,
  filterValue,
  setFilterValue,
  unAssignFilter,
}) => {
  // ============================== states ============================
  const [currentFilter, setCurrentFilter] = useState({
    group: false,
    status: false,
    category: false,
    tags: false,
    pipeline: false,
  });

  // ========================== Custom Hooks =========================
  const { setGroupRelatedValue } = useSetGroupRelatedValue({
    setFilterValue,
    filterValue,
  });

  useEffect(() => {
    if (currentFilter) {
      filterContactValue();
    }
  }, [currentFilter]);

  const filterContactValue = () => {
    let tempContact = JSON.parse(JSON.stringify(availableContacts));
    if (currentFilter?.group?.id) {
      if (currentFilter?.group?.id === 'UnassignedItem') {
        tempContact = tempContact.filter((temp) => temp?.group === null);
      } else {
        tempContact = tempContact.filter(
          (temp) => temp?.group?.id?._id === currentFilter?.group?.id
        );
      }
    }
    if (currentFilter?.status?.id) {
      if (currentFilter?.status?.id === 'UnassignedItem') {
        tempContact = tempContact.filter((temp) => temp?.status === null);
      } else {
        tempContact = tempContact.filter(
          (temp) => temp?.status?.id === currentFilter?.status?.id
        );
      }
    }
    if (currentFilter?.category?.id) {
      if (currentFilter?.category?.id === 'UnassignedItem') {
        tempContact = tempContact.filter((temp) => temp?.category === null);
      } else {
        tempContact = tempContact.filter(
          (temp) => temp?.category?.id === currentFilter?.category?.id
        );
      }
    }
    if (currentFilter?.tags?.id) {
      if (currentFilter?.tags?.id === 'UnassignedItem') {
        tempContact = tempContact.filter(
          (temp) => temp?.tags === null || temp?.tags?.length === 0
        );
      } else {
        tempContact = tempContact.filter((temp) =>
          temp?.tags?.includes(currentFilter?.tags?.id)
        );
      }
    }
    if (currentFilter?.pipeline?.id) {
      if (currentFilter?.pipeline?.id === 'UnassignedItem') {
        tempContact = tempContact.filter(
          (temp) => temp?.pipeline === null || temp?.pipeline?.length === 0
        );
      } else {
        const pipelineContact = [];
        tempContact.forEach((temp) => {
          if (temp?.pipelineDetails?.length > 0) {
            const pipeline = temp?.pipelineDetails.find(
              (pipeline) =>
                pipeline?.pipeline?.id === currentFilter?.pipeline?.id
            );
            if (pipeline) {
              pipelineContact.push(temp);
            }
          }
        });
        tempContact = pipelineContact;
      }
    }
    setFilterContacts(tempContact);
  };

  const handleChangeFilter = (e, type) => {
    if (type === 'group') {
      setFilterValue({
        ...filterValue,
        status: [unAssignFilter],
        category: [unAssignFilter],
        tags: [unAssignFilter],
        pipeline: [unAssignFilter],
      });
      setCurrentFilter({
        ...currentFilter,
        group: e,
        status: false,
        category: false,
        tags: false,
        pipeline: false,
      });
      if (e !== null && e.id !== 'UnassignedItem') {
        getGroupRelatedDetails(e?.id);
      }
    }
    if (type === 'status') {
      setCurrentFilter({ ...currentFilter, status: e });
    }
    if (type === 'category') {
      setCurrentFilter({ ...currentFilter, category: e });
    }
    if (type === 'tags') {
      setCurrentFilter({ ...currentFilter, tags: e });
    }
    if (type === 'pipeline') {
      setCurrentFilter({ ...currentFilter, pipeline: e });
    }
  };

  const getGroupRelatedDetails = (id) => {
    getGroupDetails(id).then((res) => {
      if (res.data.data) {
        setGroupRelatedValue(res.data.data);
      }
    });
  };

  return { filterContactValue, handleChangeFilter, currentFilter };
};
export default useMassSMSHelper;
