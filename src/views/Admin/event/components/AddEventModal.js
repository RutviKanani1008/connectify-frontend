/* eslint-disable no-mixed-operators */
import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  ButtonGroup,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import moment from 'moment';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import classnames from 'classnames';
import { ChevronDown, Grid, List } from 'react-feather';

import ContactCard from './ContactCard';
import { required } from '../../../../configs/validationConstant';
import { FormField } from '@components/form-fields';
import { yupResolver } from '@hookform/resolvers/yup';
import { SaveButton } from '@components/save-button';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { addEvent } from '../../../../api/event';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import { selectThemeColors } from '@utils';
import Filter from './FIlter';
import AddContactModal from '../../../../@core/components/contact/AddContactModal';
import ItemTable from '../../../../@core/components/data-table';
import RsvpForm from './RsvpForm';
import useColumn from '../hooks/useColumns';
import EventDays from './EventDays';
import {
  EVENT_END_TYPE,
  EVENT_LABELS,
  EVENT_SCHEDULER_TYPE,
} from '../../../../constant';
import {
  createEventBasedOnScheduler,
  selectScheduleType,
} from '../helper/eventHelper';
import useEventScheduler from '../hooks/useEventScheduler';
import useEventHelper from '../hooks/useEventHelper';
import useApiCall from '../hooks/useApiCall';
import {
  OptionComponent,
  SingleValue,
} from '../../../forms/component/OptionComponent';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';

const eventScheme = yup.object().shape({
  name: yup.string().required(required('Event Name')),
});

const AddEventModal = ({
  openAddEventModal,
  setOpenAddEventModal,
  getEventDetails,
  dateObj,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(eventScheme),
  });

  // --------------------local states--------------
  const user = useSelector(userData);
  const [contacts, setContacts] = useState([]);
  const [itemPerPage, setItemPerPage] = useState(9);
  const [filterContacts, setFilterContacts] = useState([]);
  const [buttonLoading, setButtonLoading] = useState({ submitLoading: false });
  const [startDateEndDateState, setStartDateEndDateState] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 10 * 360000),
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [calendarLabel, setCalendarLabel] = useState([
    { value: 'Color1', label: 'Color1', color: 'primary' },
  ]);
  const [activeView, setActiveView] = useState('grid');

  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({
    group: false,
    status: false,
    category: false,
    tags: false,
    pipeline: false,
  });
  const unAssignFilter = {
    id: 'UnassignedItem',
    value: 'Unassigned',
    label: 'Unassigned',
  };
  const [filterValue, setFilterValue] = useState({
    group: [],
    status: [unAssignFilter],
    category: [unAssignFilter],
    tags: [unAssignFilter],
    pipeline: [unAssignFilter],
  });

  const [rsvpFormInfo, setRsvpFormInfo] = useState({
    showLogo: true,
    showLogoName: true,
  });

  const onChangeRsvpFormInfo = (data) => setRsvpFormInfo(data);

  const [showPreview, setShowPreview] = useState(false);

  const [scheduleData, setScheduleData] = useState({
    schedule: { value: 'never', label: 'Never' },
    repeatEveryCount: 1,
    selectedDays: [Number(moment(new Date()).format('d'))],
    endType: { value: 'until', label: 'Until' },
    untilDate: moment(new Date()).endOf('day').toDate(),
    occurrences: 1,
  });
  const startDate = moment(new Date());
  const start = startDate.clone();

  start.add(scheduleData.repeatEveryCount, 'weeks');
  const [open, setOpen] = useState('1');
  const toggle = (id) => {
    open === id ? setOpen() : setOpen(id);
  };

  // ------------------hooks---------------
  const { inviteContactColumn } = useColumn({
    errors,
    getValues,
    control,
    setValue,
  });
  const { getContacts, getGroupDetail } = useApiCall({
    user,
    setContacts,
    setFilterContacts,
    setFilterValue,
    filterValue,
    setItemPerPage,
    setContactLoading,
    type: 'add',
  });
  const {
    handleScheduler,
    handleEndType,
    handleRepeatEvery,
    handleOccurrences,
    handleUntilDate,
    handleStartDate,
    handleEndDate,
  } = useEventScheduler({
    setScheduleData,
    scheduleData,
    setStartDateEndDateState,
    startDateEndDateState,
  });
  const { closeModal, filterContactValue, handleChangeFilter } = useEventHelper(
    {
      setOpen: setOpenAddEventModal,
      reset,
      filterValue,
      setFilterValue,
      setCurrentFilter,
      setShowPreview,
      setContacts,
      contacts,
      currentFilter,
      setFilterContacts,
      setScheduleData,
      setItemPerPage,
      unAssignFilter,
      type: 'add',
    }
  );

  // ---------------------useEffect--------------------------
  useEffect(() => {
    if (openAddEventModal) {
      getContacts();
      setStartDateEndDateState(dateObj);
      getGroupDetail();
      setCalendarLabel([
        { value: 'Color1', label: 'Color1', color: 'primary' },
      ]);
    }
  }, [openAddEventModal]);

  useEffect(() => {
    if (currentFilter) {
      filterContactValue();
    }
  }, [currentFilter]);

  const onEventSubmit = (data) => {
    const tempEvent = data;
    const ids = [];
    Object.keys(tempEvent).forEach((key) => {
      if (tempEvent[key] && tempEvent[key] === true) {
        ids.push(key);
        delete tempEvent[key];
      } else {
        contacts.forEach((contact) => {
          if (contact._id === key) {
            delete tempEvent[key];
          }
        });
      }
    });
    tempEvent.start = startDateEndDateState.startDate;
    tempEvent.end = startDateEndDateState.endDate;
    tempEvent.contacts = ids;
    tempEvent.company = user.company._id;
    tempEvent.color = calendarLabel?.[0]?.value;
    tempEvent.rsvpFormInfo = rsvpFormInfo;

    const events = createEventBasedOnScheduler({ scheduleData, tempEvent });
    setButtonLoading({ submitLoading: true });
    addEvent(events).then((res) => {
      if (res.error) {
        if (res.errorData) {
          res.errorData.forEach((error) => {
            showToast(TOASTTYPES.error, '', error);
          });
        } else {
          showToast(TOASTTYPES.error, '', res.error);
        }
      } else {
        showToast(TOASTTYPES.success, '', 'Event added successfully!');
      }
      setShowPreview(false);
      closeModal();
      setOpenAddEventModal(false);
      setButtonLoading({ submitLoading: false });
      getEventDetails();
      reset({});
    });
  };

  return (
    <>
      <Modal
        isOpen={openAddEventModal}
        toggle={() => {
          closeModal();
        }}
        className='modal-dialog-centered add-update-event-modal modal-dialog-mobile'
        backdrop='static'
        fade={false}
      >
        <ModalHeader
          toggle={() => {
            closeModal();
          }}
        >
          Add Event
        </ModalHeader>
        <ModalBody>
          <Form
            className='auth-login-form'
            onSubmit={handleSubmit(onEventSubmit)}
            autoComplete='off'
          >
            <div className='preview-RSVP-wrapper'>
              <div className='inner-wrapper'>
                <div className='title'>Preview RSVP</div>
                <div className='switch-checkbox'>
                  <Input
                    type={'switch'}
                    inline='true'
                    checked={showPreview}
                    onChange={() => {
                      setShowPreview(!showPreview);
                    }}
                  />
                  <div className='switch-design'></div>
                </div>
              </div>
            </div>
            {showPreview ? (
              <RsvpForm
                eventData={{
                  name: getValues('name') || '',
                  description: getValues('description') || '',
                  start: startDateEndDateState.startDate,
                  end: startDateEndDateState.endDate,
                }}
                formInfo={rsvpFormInfo}
                changeRsvpFormInfo={onChangeRsvpFormInfo}
              />
            ) : (
              <>
                <div className='event-details-wrapper'>
                  <h3 className='title'>Event Details</h3>
                  <Row>
                    <Col className='left' md='6'>
                      <Row>
                        <Col className='mb-1' md='6'>
                          <FormField
                            name='name'
                            label='Name'
                            placeholder='Event Name'
                            type='text'
                            errors={errors}
                            control={control}
                          />
                        </Col>
                        <Col className='color__select__box mb-1' md='6'>
                          <Label className='form-label' for='startDate'>
                            Select Color
                          </Label>
                          <Select
                            id='label'
                            value={calendarLabel}
                            options={EVENT_LABELS}
                            theme={selectThemeColors}
                            className='react-select'
                            classNamePrefix='custom-select'
                            isClearable={false}
                            onChange={(data) => setCalendarLabel([data])}
                            components={{
                              Option: OptionComponent,
                              SingleValue,
                            }}
                          />
                        </Col>
                        <Col className='mb-1' md='6'>
                          <CustomDatePicker
                            errors={errors}
                            name='start'
                            label='Start Date'
                            value={startDateEndDateState.startDate.getTime()}
                            dateFormat={'m-d-Y h:i K'}
                            onChange={handleStartDate}
                          />
                        </Col>
                        <Col className='mb-1' md='6'>
                          <CustomDatePicker
                            options={{
                              minDate:
                                new Date(
                                  startDateEndDateState.startDate
                                ).getTime() + 1000,
                            }}
                            errors={errors}
                            name='end'
                            label='End Date'
                            value={startDateEndDateState.endDate.getTime()}
                            dateFormat={'m-d-Y h:i K'}
                            onChange={handleEndDate}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col className='mb-1 right' md='6'>
                      <FormField
                        name='description'
                        label='Description'
                        placeholder='Enter Description'
                        type='textarea'
                        errors={errors}
                        control={control}
                      />
                    </Col>
                  </Row>
                </div>
              </>
            )}
            {/* <div className=''>
              <Row className='auth-inner m-0 justify-content-center'>
                <Col className='px-0 justify-content-center' md='12'>
                  <div className='form-boarder p-2'>
                    <div className='d-flex justify-content-between mb-1 text-primary h4'>
                      <div>Event Details</div>
                    </div>
                    {showPreview ? (
                      <RsvpForm
                        eventData={{
                          name: getValues('name') || '',
                          description: getValues('description') || '',
                          start: startDateEndDateState.startDate,
                          end: startDateEndDateState.endDate,
                        }}
                        formInfo={rsvpFormInfo}
                        changeRsvpFormInfo={onChangeRsvpFormInfo}
                      />
                    ) : (
                      <>
                        <Row>
                          <Col lg={3} md={3} sm={6}>
                            <FormField
                              name='name'
                              label='Name'
                              placeholder='Event Name'
                              type='text'
                              errors={errors}
                              control={control}
                            />
                          </Col>
                          <Col lg='3' md='3' sm='6' className='event-label'>
                            <Label className='form-label' for='startDate'>
                              Select Color
                            </Label>
                            <Select
                              id='label'
                              value={calendarLabel}
                              options={EVENT_LABELS}
                              theme={selectThemeColors}
                              className='react-select'
                              classNamePrefix='select'
                              isClearable={false}
                              onChange={(data) => setCalendarLabel([data])}
                              components={{
                                Option: OptionComponent,
                                SingleValue,
                              }}
                            />
                          </Col>
                        </Row>
                        <Row className='mt-1'>
                          <Col lg='3' md='3' sm='6'>
                            <CustomDatePicker
                              errors={errors}
                              name='start'
                              label='Start Date'
                              value={startDateEndDateState.startDate.getTime()}
                              dateFormat={'m-d-Y h:i K'}
                              onChange={handleStartDate}
                            />
                          </Col>
                          <Col lg='3' md='3' sm='6'>
                            <CustomDatePicker
                              options={{
                                minDate:
                                  new Date(
                                    startDateEndDateState.startDate
                                  ).getTime() + 1000,
                              }}
                              errors={errors}
                              name='end'
                              label='End Date'
                              value={startDateEndDateState.endDate.getTime()}
                              dateFormat={'m-d-Y h:i K'}
                              onChange={handleEndDate}
                            />
                          </Col>
                          <Col lg={6} md={6} sm={12}>
                            <FormField
                              name='description'
                              label='Description'
                              placeholder='Enter Description'
                              type='textarea'
                              errors={errors}
                              control={control}
                            />
                          </Col>
                        </Row>
                      </>
                    )}
                  </div>
                </Col>
              </Row>
            </div> */}
            {!showPreview && (
              <div className='schedule-events-wrapper'>
                <div className='title'>Schedule Events</div>
                <Row className=''>
                  <Col md='3' className='mb-1'>
                    <FormField
                      defaultValue={{ value: 'never', label: 'Never' }}
                      label='Repeat'
                      name='schedule'
                      placeholder='Select Schedule'
                      type='select'
                      errors={errors}
                      control={control}
                      options={EVENT_SCHEDULER_TYPE}
                      onChange={handleScheduler}
                    />
                  </Col>
                  {scheduleData.schedule.value !== 'never' && (
                    <>
                      <Col md='3' className='mb-1'>
                        <div className='d-flex align-items-start'>
                          <div className='schedule-repeat-field-wrapper'>
                            <Label className='form-label'>Repeat Every</Label>
                            <Input
                              onBlur={(e) =>
                                setScheduleData({
                                  ...scheduleData,
                                  repeatEveryCount: Number(e.target.value)
                                    ? Number(e.target.value)
                                    : 1,
                                })
                              }
                              value={scheduleData.repeatEveryCount}
                              min={1}
                              name='repeatEvery'
                              type='number'
                              onChange={handleRepeatEvery}
                            />
                          </div>
                          <span className='schedule-repeat-label'>
                            {selectScheduleType(scheduleData.schedule.value)}
                            (s)
                          </span>
                        </div>
                      </Col>
                      {scheduleData.schedule.value === 'weekly' && (
                        <Col md='3' className='mb-1'>
                          <Label className='form-label' for='startDate'>
                            Repeat On
                          </Label>
                          <EventDays
                            scheduleData={scheduleData}
                            setScheduleData={setScheduleData}
                          />
                        </Col>
                      )}
                      <Col md='3' className='mb-1'>
                        <FormField
                          defaultValue={{
                            value: 'until',
                            label: 'Until',
                          }}
                          label='End'
                          name='endType'
                          type='select'
                          errors={errors}
                          control={control}
                          options={EVENT_END_TYPE}
                          onChange={handleEndType}
                        />
                      </Col>
                      <Col md='3' className='mb-1'>
                        {scheduleData.endType.value === 'until' ? (
                          <CustomDatePicker
                            dateFormat='Y-m-d'
                            enableTime={false}
                            options={{
                              minDate: startDateEndDateState.endDate,
                            }}
                            errors={errors}
                            name='untilDate'
                            label='Until Date'
                            value={scheduleData.untilDate}
                            onChange={handleUntilDate}
                          />
                        ) : (
                          <>
                            <Label className='form-label'>Occurrences</Label>
                            <Input
                              onBlur={(e) =>
                                setScheduleData({
                                  ...scheduleData,
                                  occurrences: Number(e.target.value)
                                    ? Number(e.target.value)
                                    : 1,
                                })
                              }
                              value={scheduleData.occurrences}
                              min={1}
                              name='occurrences'
                              type='number'
                              onChange={handleOccurrences}
                            />
                          </>
                        )}
                      </Col>
                    </>
                  )}
                </Row>
              </div>
            )}
          </Form>
          {!showPreview && (
            <>
              <div className='contact-filters-wrapper'>
                <Filter
                  loading={contactLoading}
                  mode='add'
                  contacts={contacts}
                  setFilterContacts={setFilterContacts}
                  currentFilter={currentFilter}
                  filterValue={filterValue}
                  handleChangeFilter={handleChangeFilter}
                />
              </div>
              <div className='invite-contacts-wrapper'>
                <h3 className='main-title'>Invite Contacts</h3>
                <Accordion
                  className='accordion-margin contact-accordion'
                  open={open}
                  toggle={toggle}
                >
                  <AccordionItem>
                    <ButtonGroup className='toggle-view-btn-wrapper'>
                      <Button
                        tag='label'
                        className={classnames(
                          'btn-icon view-btn grid-view-btn',
                          {
                            active: activeView === 'grid',
                          }
                        )}
                        color='primary'
                        outline
                        onClick={() => setActiveView('grid')}
                      >
                        <Grid size={18} />
                      </Button>
                      <Button
                        tag='label'
                        className={classnames(
                          'btn-icon view-btn list-view-btn',
                          {
                            active: activeView === 'list',
                          }
                        )}
                        color='primary'
                        outline
                        onClick={() => setActiveView('list')}
                      >
                        <List size={18} />
                      </Button>
                    </ButtonGroup>
                    <AccordionHeader targetId='1'>
                      <h3 className='title'>
                        Contacts :{' '}
                        <span className='value'>{filterContacts?.length}</span>
                      </h3>
                      <div className='down-arrow-btn'>
                        <ChevronDown className='' size={34} />
                      </div>
                    </AccordionHeader>
                    <AccordionBody accordionId='1'>
                      {contactLoading ? (
                        <div className='text-primary text-center my-3'>
                          <Spinner color='primary' />
                        </div>
                      ) : (
                        <Row className='event-contact-list-wrapper'>
                          {activeView === 'grid' ? (
                            filterContacts?.length > 0 ? (
                              filterContacts.map((contact, index) => {
                                if (index < itemPerPage) {
                                  return (
                                    <Col
                                      className='event-contact-col'
                                      key={index}
                                    >
                                      <ContactCard
                                        toolTipLabel='Mark as invite'
                                        label='invite'
                                        index={index}
                                        contact={contact}
                                        errors={errors}
                                        control={control}
                                        getValues={getValues}
                                        setValue={setValue}
                                      />
                                    </Col>
                                  );
                                }
                                <>
                                  <div className='pt-2 pb-2'>
                                    <NoRecordFound />
                                  </div>
                                  <div className='text-center mb-2'>
                                    <Button
                                      outline={true}
                                      color='primary'
                                      onClick={() =>
                                        setAddContactModalOpen(true)
                                      }
                                    >
                                      Add New Contact
                                    </Button>
                                  </div>
                                </>;
                              })
                            ) : (
                              <>
                                <div className='pt-2 pb-2'>
                                  <NoRecordFound />
                                </div>
                                <div className='text-center mb-2'>
                                  <Button
                                    outline={true}
                                    color='primary'
                                    onClick={() => setAddContactModalOpen(true)}
                                  >
                                    Add New Contact
                                  </Button>
                                </div>
                              </>
                            )
                          ) : (
                            <div className='event-contact-table-w'>
                              <ItemTable
                                hideButton={true}
                                columns={inviteContactColumn}
                                data={filterContacts}
                                itemsPerPage={10}
                                title={''}
                                selectableRows={false}
                                showCard={false}
                                showHeader={false}
                                hideExport={true}
                              />
                            </div>
                          )}
                        </Row>
                      )}
                      {!contactLoading &&
                        itemPerPage < filterContacts?.length &&
                        activeView === 'grid' && (
                          <div className='text-center mt-1 mb-1'>
                            <Button
                              outline={true}
                              color='primary'
                              onClick={() => {
                                let temp = itemPerPage;
                                temp = temp + 6;
                                setItemPerPage(temp);
                              }}
                            >
                              Load More
                            </Button>
                          </div>
                        )}
                    </AccordionBody>
                  </AccordionItem>
                </Accordion>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            className='calcel-btn'
            color='danger'
            onClick={() => {
              closeModal();
            }}
          >
            Cancel
          </Button>
          <Form
            className='auth-login-form'
            onSubmit={handleSubmit(onEventSubmit)}
            autoComplete='off'
          >
            <SaveButton
              // width='125px'
              type='submit'
              loading={buttonLoading.submitLoading}
              name={'Add Event'}
              className='add-event-btn align-items-center justify-content-center'
            ></SaveButton>
          </Form>
        </ModalFooter>
      </Modal>
      {/* --------- add new contact --------- */}
      <AddContactModal
        modalOpen={addContactModalOpen}
        setModalOpen={setAddContactModalOpen}
        getContacts={getContacts}
      />
    </>
  );
};

export default AddEventModal;
