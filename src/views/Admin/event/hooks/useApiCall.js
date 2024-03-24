import { useState } from 'react';
import { useSelector } from 'react-redux';
import { contactWithRsvp } from '../../../../api/contacts';
import { getEvent, getRsvpByEventId } from '../../../../api/event';
import { userData } from '../../../../redux/user';
import { isArray } from 'lodash';
import { getGroups } from '../../../../api/groups';

const useApiCall = ({
  eventId,
  eventData,
  setContacts,
  setFilterContacts,
  setInvitedItemPerPage,
  setOtherItemPerPage,
  filterValue,
  setFilterValue,
  setItemPerPage,
  setContactLoading,
  calendarRef = false,
  type,
}) => {
  const user = useSelector(userData);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState([]);

  const [rsvpObj, setRsvpObj] = useState({ data: [], loading: false });

  const getEventsData = async (
    start = calendarRef.current.getApi().currentDataManager.data.viewApi
      .activeStart,
    end = calendarRef.current.getApi().currentDataManager.data.viewApi.activeEnd
  ) => {
    try {
      setEventsLoading(true);
      const res = await getEvent({
        company: user.company._id,
        start,
        end,
      });
      if (res.data.data) {
        res.data.data.forEach((contact) => {
          contact.title = `${contact.name} | invited: ${
            contact?.contacts?.length ? contact?.contacts?.length : 0
          }`;
          contact.allDay = false;
          contact.extendedProps = {
            ...contact.extendedProps,
            color: contact?.color,
          };
        });
        setEventDetails(res.data.data);
      }
      setEventsLoading(false);
    } catch (error) {
      setEventsLoading(false);
    }
  };

  const getContacts = async (isReset = false) => {
    setContactLoading(true);
    const contactDetails = await contactWithRsvp({
      company: user.company._id,
      eventId,
    });
    if (isReset) {
      if (type === 'edit') {
        setOtherItemPerPage(9);
        setInvitedItemPerPage(9);
      } else {
        setItemPerPage(9);
      }
    }
    if (isArray(contactDetails.data.data)) {
      contactDetails.data.data.map((obj) => {
        obj.invited = eventData?.contacts?.find(
          (childObj) => childObj._id === obj._id
        )
          ? true
          : false;
      });
      setContacts(contactDetails.data.data);
      setFilterContacts(contactDetails.data.data);
    }
    setContactLoading(false);
  };

  const getRsvp = async (eventId) => {
    try {
      setRsvpObj({ ...rsvpObj, loading: true });
      const response = await getRsvpByEventId({
        event: eventId,
      });
      if (response.data.response_type === 'success') {
        const data = response?.data?.data;
        isArray(data) && setRsvpObj({ ...rsvpObj, data, loading: false });
        return isArray(data) ? data : [];
      }
      return [];
    } catch (error) {
      setRsvpObj({ ...rsvpObj, loading: false });
      console.log('error', error.message);
    }
  };

  const getGroupDetail = async () => {
    const grpdetails = await getGroups({
      company: user.company._id,
      archived: false,
    });
    const group = grpdetails.data.data;
    const groupObj = [];
    group.forEach((groupDetail) => {
      if (groupDetail.active) {
        const obj = {};
        obj['label'] = groupDetail.groupName;
        obj['value'] = groupDetail.groupCode;
        obj['id'] = groupDetail._id;
        groupObj.push(obj);
      }
    });
    setFilterValue({ ...filterValue, group: groupObj });
  };

  return {
    rsvpObj,
    getEventsData,
    eventsLoading,
    eventDetails,
    getContacts,
    getRsvp,
    getGroupDetail,
  };
};

export default useApiCall;
