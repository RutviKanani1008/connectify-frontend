import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  // Col,
  Row,
  Spinner,
} from 'reactstrap';
import isArray from 'lodash';
import useColumn from '../hooks/useColumn';

import ItemTable from '../../../../@core/components/data-table';
import { useParams } from 'react-router-dom';
import { getEvent } from '../../../../api/event';
import { ChevronDown } from 'react-feather';

const Events = ({ isModal }) => {
  const [open, setOpen] = useState([]);
  const [invitedEvents, setInvitedEvents] = useState({
    data: [],
    loading: false,
  });
  const [attendEvents, setAttendEvents] = useState({
    data: [],
    loading: false,
  });
  const params = useParams();

  if (isModal) params.id = 'add';

  const toggle = (id) => {
    const tempOpen = [...open];
    if (tempOpen.includes(id)) {
      const index = tempOpen.indexOf(id);
      if (index > -1) {
        tempOpen.splice(index, 1);
      }
    } else {
      tempOpen.push(id);
    }
    setOpen(tempOpen);
  };
  const { columns } = useColumn();

  useEffect(() => {
    if (params.id && params.id !== 'add' && !isModal) {
      getInvitedEvents(params.id);
      getAttendEvents(params.id);
      window.scrollTo(0, 0);
    }
  }, [params.id]);

  const getInvitedEvents = async (contactID) => {
    try {
      setInvitedEvents({ ...invitedEvents, loading: true });
      const response = await getEvent({
        contacts: contactID,
        select: '_id,name,start,end',
      });
      let data = [];
      if (
        response.data?.response_type === 'success' &&
        isArray(response?.data?.data)
      ) {
        data = response?.data?.data;
      }
      setInvitedEvents({
        ...invitedEvents,
        data,
        loading: false,
      });
    } catch (error) {
      setInvitedEvents({
        ...invitedEvents,
        loading: false,
      });
      console.log('error', error.message ? error.message : error);
    }
  };
  const getAttendEvents = async (contactID) => {
    try {
      setAttendEvents({ ...attendEvents, loading: true });
      const response = await getEvent({
        attendance: contactID,
        select: '_id,name,start,end',
      });
      let data = [];
      if (
        response.data?.response_type === 'success' &&
        isArray(response?.data?.data)
      ) {
        data = response?.data?.data;
      }

      setAttendEvents({
        ...attendEvents,
        data,
        loading: false,
      });
    } catch (error) {
      setAttendEvents({
        ...attendEvents,
        loading: false,
      });
    }
  };

  return (
    <>
      {/* <Col md={6}> */}
      <div className='accordian-loyal-box events active'>
        <div className='accordian-loyal-header'>
          <div className='inner-wrapper'>
            <h3 className='title'>Events</h3>
            <button className='down-arrow' type='button'></button>
          </div>
        </div>
        <div className='accordian-loyal-body mb-2'>
          <Accordion
            className='accordion-margin mb-1'
            open={open}
            toggle={toggle}
          >
            <AccordionItem>
              <AccordionHeader targetId='1'>
                Invited :{' '}
                <span className='count'>{invitedEvents.data.length}</span>
                <div className='action-btn down-arrow-btn'>
                  <ChevronDown className='' size={34} />
                </div>
              </AccordionHeader>
              <AccordionBody accordionId='1'>
                {invitedEvents.loading ? (
                  <div className='text-primary text-center  my-3'>
                    <Spinner color='primary' />
                  </div>
                ) : (
                  <Row className='event-contact-list-wrapper'>
                    <div className='event-contact-table-w'>
                      <ItemTable
                        hideButton={true}
                        columns={columns}
                        data={invitedEvents.data}
                        itemsPerPage={10}
                        title={''}
                        selectableRows={false}
                        showCard={false}
                        showHeader={false}
                        hideExport={true}
                      />
                    </div>
                  </Row>
                )}
              </AccordionBody>
            </AccordionItem>
          </Accordion>
          <Accordion
            className='accordion-margin mb-1'
            open={open}
            toggle={toggle}
          >
            <AccordionItem>
              <AccordionHeader targetId='2'>
                Attends :{' '}
                <span className='count'>{attendEvents.data.length}</span>
                <div className='action-btn down-arrow-btn'>
                  <ChevronDown className='' size={34} />
                </div>
              </AccordionHeader>
              <AccordionBody accordionId='2'>
                {attendEvents.loading ? (
                  <div className='text-primary text-center  my-3'>
                    <Spinner color='primary' />
                  </div>
                ) : (
                  <Row className='event-contact-list-wrapper'>
                    <div className='event-contact-table-w'>
                      <ItemTable
                        hideButton={true}
                        columns={columns}
                        data={attendEvents.data}
                        itemsPerPage={10}
                        title={''}
                        selectableRows={false}
                        showCard={false}
                        showHeader={false}
                        hideExport={true}
                      />
                    </div>
                  </Row>
                )}
              </AccordionBody>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      {/* </Col> */}
    </>
  );
};

export default Events;
