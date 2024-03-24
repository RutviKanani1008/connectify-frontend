// ==================== Packages =======================
import moment from 'moment';
// ====================================================
import { getGroupDetails } from '../../../../api/groups';

const useEventHelper = ({
  setOpen,
  reset,
  filterValue,
  setFilterValue,
  setCurrentFilter,
  setShowPreview,
  setContacts,
  contacts,
  currentFilter,
  setFilterContacts,
  setOtherItemPerPage,
  setInvitedItemPerPage,
  setScheduleData,
  setItemPerPage,
  unAssignFilter,
  type,
}) => {
  // --------- handle filters ----------
  const filterContactValue = () => {
    let tempContact = JSON.parse(JSON.stringify(contacts));
    if (currentFilter?.group?.id) {
      if (currentFilter?.group?.id === 'UnassignedItem') {
        tempContact = tempContact.filter((temp) => temp?.group === null);
      } else {
        tempContact = tempContact.filter(
          (temp) => temp?.group?.id === currentFilter?.group?.id
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
    if (currentFilter?.rsvp?.value) {
      tempContact = tempContact.filter(
        (temp) => temp?.rsvpResponse === currentFilter?.rsvp?.value
      );
    }
    setFilterContacts(tempContact);
  };

  const closeModal = () => {
    if (type === 'add') {
      setScheduleData({
        schedule: { value: 'never', label: 'Never' },
        repeatEveryCount: 1,
        selectedDays: [Number(moment(new Date()).format('d'))],
        endType: { value: 'until', label: 'Until' },
        untilDate: moment(new Date()).endOf('day').toDate(),
        occurrences: 1,
      });
    }

    setOpen(false);
    reset({});
    setContacts([]);
    setShowPreview(false);
    setCurrentFilter({
      group: false,
      status: false,
      category: false,
      tags: false,
      pipeline: false,
      rsvp: false,
    });
    setFilterValue({
      ...filterValue,
      group: [unAssignFilter],
      status: [unAssignFilter],
      category: [unAssignFilter],
      tags: [unAssignFilter],
      pipeline: [unAssignFilter],
    });
    setFilterContacts([]);
    if (type === 'edit') {
      setOtherItemPerPage(9);
      setInvitedItemPerPage(9);
    }
    if (type === 'add') {
      setItemPerPage(9);
    }
  };

  const handleChangeFilter = (e, type) => {
    if (type === 'group') {
      setFilterValue({
        ...filterValue,
        status: [],
        category: [],
        tags: [],
        pipeline: [],
      });
      setCurrentFilter({
        ...currentFilter,
        group: e,
        status: false,
        category: false,
        tags: false,
        pipeline: false,
      });
      if (e !== null) {
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
    if (type === 'rsvp') {
      setCurrentFilter({ ...currentFilter, rsvp: e });
    }
  };

  const getGroupRelatedDetails = (id) => {
    getGroupDetails(id).then((res) => {
      if (res.data.data) {
        setGroupRelatedValue(res.data.data);
      }
    });
  };

  const setGroupRelatedValue = (groupValues) => {
    const statusObj = [
      {
        id: 'UnassignedItem',
        value: 'Unassigned',
        label: 'Unassigned',
      },
    ];
    if (groupValues?.status) {
      groupValues?.status?.forEach((status) => {
        const obj = {};
        obj.id = status._id;
        obj.value = status.statusCode;
        obj.label = status.statusName;
        statusObj.push(obj);
      });
    }
    const categoryObj = [
      {
        id: 'UnassignedItem',
        value: 'Unassigned',
        label: 'Unassigned',
      },
    ];
    if (groupValues?.category) {
      groupValues?.category?.forEach((category) => {
        const obj = {};
        obj.id = category._id;
        obj.value = category.categoryId;
        obj.label = category.categoryName;
        categoryObj.push(obj);
      });
    }
    const tagObj = [
      {
        id: 'UnassignedItem',
        value: 'Unassigned',
        label: 'Unassigned',
      },
    ];
    if (groupValues?.tags) {
      groupValues?.tags?.forEach((tag) => {
        const obj = {};
        obj.id = tag._id;
        obj.value = tag.tagId;
        obj.label = tag.tagName;
        tagObj.push(obj);
      });
    }
    const pipelineObj = [
      {
        id: 'UnassignedItem',
        value: 'Unassigned',
        label: 'Unassigned',
      },
    ];
    if (groupValues?.pipeline) {
      groupValues?.pipeline?.forEach((pipeline) => {
        const obj = {};
        obj.id = pipeline._id;
        obj.value = pipeline.pipelineCode;
        obj.label = pipeline.pipelineName;
        pipelineObj.push(obj);
      });
    }
    setFilterValue({
      ...filterValue,
      status: statusObj,
      category: categoryObj,
      tags: tagObj,
      pipeline: pipelineObj,
    });
  };

  return {
    closeModal,
    filterContactValue,
    handleChangeFilter,
  };
};

export default useEventHelper;
