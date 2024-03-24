/* eslint-disable no-mixed-operators */
import FullCalendar from '@fullcalendar/react';
import { Card, CardHeader, CardBody, CardTitle, Button } from 'reactstrap';
import UILoader from '@components/ui-loader';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Menu, Plus } from 'react-feather';
import { useEffect, useRef, useState } from 'react';
import AddEventModal from './components/AddEventModal';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom';
import UpdateEventModal from './components/UpdateEventModal';
import useApiCall from './hooks/useApiCall';
import { CALENDAR_COLOR } from '../../../constant';

const Events = () => {
  const search = window.location.search;
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();
  const calendarRef = useRef(null);
  const updateEventModalRef = useRef(null);
  const searchValue = new URLSearchParams(search);
  const eventID = searchValue.get('eventID');

  const [openAddEventModal, setOpenAddEventModal] = useState(false);
  const [openUpdateEventModal, setOpenUpdateEventModal] = useState(false);
  const [dateObj, setDateObj] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 10 * 360000),
  });
  // ----------- custom hooks ---------
  const { eventsLoading, getEventsData, eventDetails } = useApiCall({
    calendarRef,
  });

  useEffect(() => {
    if (eventID && eventDetails.length > 0) {
      const eventDetail = eventDetails.find((obj) => obj._id === eventID);
      gotoSpecificDate(eventDetail.start);
      setOpenUpdateEventModal(true);
      updateEventModalRef.current.viewEvent(eventID);
      history.push(`${basicRoute}/event`);
    }
  }, [eventID, eventDetails]);

  // calender options
  const calendarOptions = {
    datesSet(info) {
      getEventsData(info.start, info.end);
    },
    events: eventDetails?.length > 0 ? eventDetails : [],
    defaultView: 'dayGridMonth',
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      start: 'prev,next,title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
    },
    scrollTime: '00:00:00',
    editable: false,
    eventResizableFromStart: false,
    dragScroll: false,
    dayMaxEvents: 2,
    eventMaxStack: 2,
    navLinks: true,
    eventClassNames({ event: calendarEvent }) {
      const colorName = CALENDAR_COLOR[calendarEvent._def.extendedProps.color];
      return [`event-bg-light-${colorName}`];
    },
    eventClick({ event: clickedEvent }) {
      setOpenUpdateEventModal(true);
      updateEventModalRef.current.viewEvent(clickedEvent?.extendedProps?._id);
    },
    customButtons: {
      sidebarToggle: {
        text: <Menu className='d-xl-none d-block' />,
        click() { },
      },
    },
    dateClick(info) {
      setDateObj({
        startDate: info.date,
        endDate: new Date(new Date(info.date).getTime() + 10 * 360000),
      });
      setOpenAddEventModal(true);
    },
    ref: calendarRef,
  };

  const gotoSpecificDate = (date) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(date);
  };

  return (
    <>
      <Card className='events-page'>
        <CardHeader>
          <CardTitle className='w-100 d-flex justify-content-between'>
            <div>Events</div>
            <div>
              <Button
                className='ms-2'
                color='primary'
                onClick={() => {
                  setDateObj({
                    startDate: new Date(),
                    endDate: new Date(new Date().getTime() + 10 * 360000),
                  });
                  setOpenAddEventModal(!openAddEventModal);
                }}
              >
                <Plus size={15} />
                <span className='align-middle ms-50'>Add Event</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardBody className='pb-1'>
          <div className='full-calender-wrapper'>
            <UILoader blocking={eventsLoading}>
              <FullCalendar {...calendarOptions} />
            </UILoader>
          </div>
        </CardBody>
      </Card>

      {/* --------- add new event --------- */}
      <AddEventModal
        openAddEventModal={openAddEventModal}
        setOpenAddEventModal={setOpenAddEventModal}
        getEventDetails={getEventsData}
        dateObj={dateObj}
      />
      {/* --------- update event --------- */}
      <UpdateEventModal
        ref={updateEventModalRef}
        openUpdateEventModal={openUpdateEventModal}
        setOpenUpdateEventModal={setOpenUpdateEventModal}
        getEventDetails={getEventsData}
        eventDetails={eventDetails}
      />
    </>
  );
};

export default Events;
