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
  UncontrolledTooltip,
} from 'reactstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);
import UILoader from '@components/ui-loader';
import Select from 'react-select';
import CopyToClipboard from 'react-copy-to-clipboard';
import { isArray } from 'lodash';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import ContactCard from './ContactCard';
import { required } from '../../../../configs/validationConstant';
import { FormField } from '@components/form-fields';
import { yupResolver } from '@hookform/resolvers/yup';
import { SaveButton } from '@components/save-button';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import {
  deleteEvent,
  deleteRecurringEvents,
  updateEvent,
} from '../../../../api/event';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';
import { selectThemeColors } from '@utils';
import Filter from './FIlter';
import { contactWithRsvp } from '../../../../api/contacts';
import AddContactModal from '../../../../@core/components/contact/AddContactModal';
import classnames from 'classnames';
import { Grid, List, Code, Link as LinkIcon, ChevronDown } from 'react-feather';
import ItemTable from '../../../../@core/components/data-table';
import RsvpForm from './RsvpForm';
import { EVENT_LABELS, RSVP_OPTION } from '../../../../constant';
import RsvpCard from './RsvpCard';
import useApiCall from '../hooks/useApiCall';
import useColumn from '../hooks/useColumns';
import useToast from '../../../../hooks/useToast';
import useEventHelper from '../hooks/useEventHelper';
import {
  OptionComponent,
  SingleValue,
} from '../../../forms/component/OptionComponent';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';

const eventScheme = yup.object().shape({
  name: yup.string().required(required('Event Name')),
});

const UpdateEventModal = forwardRef(
  (
    {
      openUpdateEventModal,
      setOpenUpdateEventModal,
      getEventDetails,
      eventDetails,
    },
    ref
  ) => {
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
    const user = useSelector(userData);
    const [contacts, setContacts] = useState([]);
    const [filterContacts, setFilterContacts] = useState([]);
    const [buttonLoading, setButtonLoading] = useState({
      submitLoading: false,
    });
    const [eventLoading, setEventLoading] = useState(false);
    const [startDateEndDateState, setStartDateEndDateState] = useState({
      startDate: new Date(),
      endDate: new Date(),
    });
    const [eventDeleting, setEventDeleting] = useState(false);
    const [eventId, setEventId] = useState();
    const [eventData, setEventData] = useState({});
    const [recurringCount, setRecurringCount] = useState(1);
    const [addContactModalOpen, setAddContactModalOpen] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);
    const [calendarLabel, setCalendarLabel] = useState([
      { value: 'Color1', label: 'Color1', color: 'primary' },
    ]);
    const [invitedActiveView, setInvitedActiveView] = useState('grid');
    const [otherActiveView, setOtherActiveView] = useState('grid');
    const [otherItemPerPage, setOtherItemPerPage] = useState(9);
    const [invitedItemPerPage, setInvitedItemPerPage] = useState(9);

    const [currentFilter, setCurrentFilter] = useState({
      group: false,
      status: false,
      category: false,
      tags: false,
      pipeline: false,
      rsvp: false,
    });

    const unAssignFilter = {
      id: 'UnassignedItem',
      value: 'Unassigned',
      label: 'Unassigned',
    };

    const [filterValue, setFilterValue] = useState({
      group: [unAssignFilter],
      status: [unAssignFilter],
      category: [unAssignFilter],
      tags: [unAssignFilter],
      pipeline: [unAssignFilter],
      rsvp: RSVP_OPTION,
    });

    const [rsvpFormInfo, setRsvpFormInfo] = useState({
      showLogo: true,
      showLogoName: true,
    });

    const [open, setOpen] = useState(['1', '2']);
    const [openRSVP, setOpenRSVP] = useState('1');
    const toggleRSVP = (id) => {
      openRSVP === id ? setOpenRSVP() : setOpenRSVP(id);
    };

    const [showPreview, setShowPreview] = useState(false);

    // -------------------- hooks ----------------
    const { getContacts, rsvpObj, getRsvp, getGroupDetail } = useApiCall({
      user,
      eventId,
      eventData,
      setInvitedItemPerPage,
      setOtherItemPerPage,
      setContacts,
      setFilterContacts,
      setFilterValue,
      filterValue,
      setContactLoading,
      type: 'edit',
    });
    const { closeModal, filterContactValue, handleChangeFilter } =
      useEventHelper({
        setOpen: setOpenUpdateEventModal,
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
        unAssignFilter,
        type: 'edit',
      });
    const { setToast } = useToast();
    const { invitedContactColumns, otherContactColumns } = useColumn({
      control,
      errors,
      setValue,
      getValues,
    });

    useEffect(() => {
      if (currentFilter) {
        filterContactValue();
      }
    }, [currentFilter]);

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

    // ------- forward methods to it's parent components --------
    useImperativeHandle(ref, () => ({
      async viewEvent(id) {
        setEventLoading(true);
        getGroupDetail();
        // get rsvp when click on specific event
        getRsvp(id);
        setEventId(id);
        const eventDetail = eventDetails.find((event) => event._id === id);
        const recurringEvents = eventDetails.filter(
          (event) => eventDetail.recurrenceId === event.recurrenceId
        );

        if (recurringEvents && recurringEvents.length) {
          setRecurringCount(recurringEvents.length);
        }

        if (eventDetail?.attendance?.length > 0) {
          eventDetail.attendance.forEach((contact) => {
            eventDetail[contact] = true;
          });
        }
        setContactLoading(true);

        const contactDetails = await contactWithRsvp({
          company: user.company._id,
          eventId: id,
        });

        contactDetails.data.data.map((contact) => {
          const isExist = eventDetail?.contacts.find(
            (eventContact) => eventContact._id === contact._id
          );
          if (isExist) {
            contact.isExist = true;
          } else {
            contact.isExist = false;
          }
        });

        if (isArray(contactDetails.data.data)) {
          contactDetails.data.data.map((obj) => {
            obj.invited = eventDetail?.contacts?.find(
              (childObj) => childObj._id === obj._id
            )
              ? true
              : false;
          });
          setContacts(contactDetails.data.data);
          setFilterContacts(contactDetails.data.data);
        }
        setContactLoading(false);
        setStartDateEndDateState({
          startDate: new Date(eventDetail.start),
          endDate: new Date(eventDetail.end),
        });
        setCalendarLabel(
          EVENT_LABELS.find((obj) => obj.value === eventDetail.color)
        );
        setEventData(eventDetail);
        if (eventDetail) setRsvpFormInfo(eventDetail.rsvpFormInfo);
        reset(eventDetail);
        setEventLoading(false);
      },
    }));

    const onUpdateEventSubmit = (data) => {
      setButtonLoading({ submitLoading: true });
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
      tempEvent.attendance = ids;
      tempEvent.company = user.company._id;
      tempEvent.color = calendarLabel?.[0]?.value;
      tempEvent.rsvpFormInfo = rsvpFormInfo;

      updateEvent(data._id, tempEvent).then((res) => {
        if (res.error) {
          if (res.errorData) {
            res.errorData.forEach((error) => {
              showToast(TOASTTYPES.error, '', error);
            });
          } else {
            showToast(TOASTTYPES.error, '', res.error);
          }
        } else {
          showToast(TOASTTYPES.success, '', 'Event updated successfully!');
        }
        setShowPreview(false);
        closeModal();
        setOpenUpdateEventModal(false);
        setButtonLoading({ submitLoading: false });
        getEventDetails();
        reset({});
      });
    };

    const handleDeleteEvent = async (single = true) => {
      return MySwal.fire({
        title: 'Are you sure?',
        text: `${single
          ? 'Are you sure you would like to delete this event?'
          : `Are you sure you would like to delete all ${recurringCount} recurring events?`
          }`,
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Yes',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ms-1',
        },
        buttonsStyling: false,
      }).then(async function (result) {
        if (result.value) {
          try {
            setEventDeleting(true);
            const toastId = showToast(
              TOASTTYPES.loading,
              '',
              'Event Deleting...'
            );
            let response;
            if (single) {
              response = await deleteEvent(eventId);
            } else {
              response = await deleteRecurringEvents(eventData.recurrenceId);
            }
            if (response.error) {
              showToast(TOASTTYPES.error, toastId, response.error);
            } else if (response.data.response_type === 'success') {
              showToast(TOASTTYPES.success, toastId, response.data.message);
              closeModal();
              setOpenUpdateEventModal(false);
              getEventDetails();
              reset({});
            }
            setEventDeleting(false);
          } catch (error) {
            setEventDeleting(false);
            console.log('error', error.message);
          }
        }
      });
    };

    const inVitedContacts = filterContacts.filter((obj) => obj.invited);
    const otherContacts = filterContacts.filter((obj) => !obj.invited);

    return (
      <>
        <Modal
          isOpen={openUpdateEventModal}
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
            <div className='inner-wrapper'>
              <span className='title'>Update</span>
              <div className='action-btn-wrapper'>
                <div className='action-btn embed-btn'>
                  <CopyToClipboard
                    text={`<iframe src='${window.location.origin}/rsvp/${eventData?.slug}' title='rsvp' scrolling='“no”' frameBorder='“0”'></iframe>`}
                  >
                    <Code
                      size={15}
                      className='cursor-pointer'
                      onClick={() =>
                        setToast('Status Updating...', 'Form Link Copied')
                      }
                      id={`embed_${eventData?.slug}`}
                    />
                  </CopyToClipboard>
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`embed_${eventData?.slug}`}
                  >
                    Copy Embed Link
                  </UncontrolledTooltip>
                </div>
                <div className='action-btn link-btn'>
                  <CopyToClipboard
                    text={`${window.location.origin}/rsvp/${eventData?.slug}`}
                  >
                    <LinkIcon
                      size={15}
                      className='cursor-pointer'
                      onClick={() =>
                        setToast('Status Updating...', 'Form Link Copied')
                      }
                      id={`copy_${eventData?.slug}`}
                    />
                  </CopyToClipboard>
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`copy_${eventData?.slug}`}
                  >
                    Copy Public Link
                  </UncontrolledTooltip>
                </div>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <UILoader blocking={eventLoading} loader={<></>}>
              <Form
                className='auth-login-form'
                onSubmit={handleSubmit(onUpdateEventSubmit)}
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
                {showPreview && eventData ? (
                  <RsvpForm
                    eventData={eventData}
                    formInfo={rsvpFormInfo}
                    changeRsvpFormInfo={(data) => setRsvpFormInfo(data)}
                  />
                ) : (
                  <>
                    <div className='event-details-wrapper'>
                      <h3 className='title'>
                        {showPreview ? 'RSVP Form Preview' : 'Event Details'}
                      </h3>
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
                                value={startDateEndDateState.startDate}
                                onChange={(date) =>
                                  setStartDateEndDateState({
                                    ...startDateEndDateState,
                                    startDate: date[0],
                                  })
                                }
                              />
                            </Col>
                            <Col className='mb-1' md='6'>
                              <CustomDatePicker
                                options={{
                                  minDate: startDateEndDateState.startDate,
                                }}
                                errors={errors}
                                name='end'
                                label='End Date'
                                value={startDateEndDateState.endDate}
                                onChange={(date) =>
                                  setStartDateEndDateState({
                                    ...startDateEndDateState,
                                    endDate: date[0],
                                  })
                                }
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
                    <div className='invite-contacts-wrapper attendance-wrapper'>
                      <h3 className='main-title'>Attendance</h3>
                      {/* <div className='form-boarder p-2'>
                      <div className='d-flex justify-content-between mb-1 text-primary h4'>
                        <div>
                          {showPreview
                            ? 'RSVP Form Preview'
                            : 'Event Details'}
                        </div>
                      </div>
                      {showPreview && eventData ? (
                        <RsvpForm
                          eventData={eventData}
                          formInfo={rsvpFormInfo}
                          changeRsvpFormInfo={(data) => setRsvpFormInfo(data)}
                        />
                      ) : (
                        <>
                          <Row>
                            <Col lg='3' md={3}>
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
                                value={startDateEndDateState.startDate}
                                onChange={(date) =>
                                  setStartDateEndDateState({
                                    ...startDateEndDateState,
                                    startDate: date[0],
                                  })
                                }
                              />
                            </Col>
                            <Col lg='3' md='3' sm='6'>
                              <CustomDatePicker
                                options={{
                                  minDate: startDateEndDateState.startDate,
                                }}
                                errors={errors}
                                name='end'
                                label='End Date'
                                value={startDateEndDateState.endDate}
                                onChange={(date) =>
                                  setStartDateEndDateState({
                                    ...startDateEndDateState,
                                    endDate: date[0],
                                  })
                                }
                              />
                            </Col>
                            <Col lg={6} md={6}>
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
                    </div> */}
                      {!showPreview && (
                        <>
                          <Filter
                            loading={eventLoading || contactLoading}
                            mode='edit'
                            contacts={contacts}
                            setFilterContacts={setFilterContacts}
                            currentFilter={currentFilter}
                            filterValue={filterValue}
                            handleChangeFilter={handleChangeFilter}
                          />
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
                                      active: invitedActiveView === 'grid',
                                    }
                                  )}
                                  color='primary'
                                  outline
                                  onClick={() => setInvitedActiveView('grid')}
                                >
                                  <Grid size={18} />
                                </Button>
                                <Button
                                  tag='label'
                                  className={classnames(
                                    'btn-icon view-btn list-view-btn',
                                    {
                                      active: invitedActiveView === 'list',
                                    }
                                  )}
                                  color='primary'
                                  outline
                                  onClick={() => setInvitedActiveView('list')}
                                >
                                  <List size={18} />
                                </Button>
                              </ButtonGroup>
                              <AccordionHeader targetId='1'>
                                <h3 className='title'>
                                  Invited :{' '}
                                  <span className='value'>
                                    {inVitedContacts.length}
                                  </span>
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
                                    {invitedActiveView === 'grid' ? (
                                      inVitedContacts.length > 0 ? (
                                        inVitedContacts
                                          .filter((obj) => obj.invited)
                                          .map((contact, index) => {
                                            if (index < invitedItemPerPage) {
                                              return (
                                                <Col
                                                  className='event-contact-col'
                                                  key={index}
                                                >
                                                  <ContactCard
                                                    toolTipLabel='Mark as attend'
                                                    label='attend'
                                                    index={index}
                                                    mode='edit'
                                                    contact={contact}
                                                    errors={errors}
                                                    control={control}
                                                    getValues={getValues}
                                                    setValue={setValue}
                                                  />
                                                </Col>
                                              );
                                            }
                                          })
                                      ) : (
                                        <>
                                          <div className='pt-2 pb-2'>
                                            <NoRecordFound />
                                          </div>
                                        </>
                                      )
                                    ) : (
                                      <div className='event-contact-table-w'>
                                        <ItemTable
                                          hideButton={true}
                                          columns={invitedContactColumns}
                                          data={inVitedContacts.filter(
                                            (obj) => obj.invited
                                          )}
                                          itemsPerPage={10}
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
                                  invitedItemPerPage < inVitedContacts.length &&
                                  invitedActiveView === 'grid' && (
                                    <div className='text-center'>
                                      <Button
                                        outline={true}
                                        color='primary'
                                        onClick={() => {
                                          let temp = invitedItemPerPage;
                                          temp = temp + 6;
                                          setInvitedItemPerPage(temp);
                                        }}
                                      >
                                        Load More
                                      </Button>
                                    </div>
                                  )}
                              </AccordionBody>
                            </AccordionItem>
                            <AccordionItem>
                              <ButtonGroup className='toggle-view-btn-wrapper'>
                                <Button
                                  tag='label'
                                  className={classnames(
                                    'btn-icon view-btn grid-view-btn',
                                    {
                                      active: otherActiveView === 'grid',
                                    }
                                  )}
                                  color='primary'
                                  outline
                                  onClick={() => setOtherActiveView('grid')}
                                >
                                  <Grid size={18} />
                                </Button>
                                <Button
                                  tag='label'
                                  className={classnames(
                                    'btn-icon view-btn list-view-btn',
                                    {
                                      active: otherActiveView === 'list',
                                    }
                                  )}
                                  color='primary'
                                  outline
                                  onClick={() => setOtherActiveView('list')}
                                >
                                  <List size={18} />
                                </Button>
                              </ButtonGroup>
                              <AccordionHeader targetId='2'>
                                <h3 className='title'>
                                  Other Contact :{' '}
                                  <span className='value'>
                                    {otherContacts.length}
                                  </span>
                                </h3>
                                <div className='down-arrow-btn'>
                                  <ChevronDown className='' size={34} />
                                </div>
                              </AccordionHeader>
                              <AccordionBody accordionId='2'>
                                {contactLoading ? (
                                  <div className='text-primary text-center my-3'>
                                    <Spinner color='primary' />
                                  </div>
                                ) : (
                                  <Row className='event-contact-list-wrapper'>
                                    {otherActiveView === 'grid' ? (
                                      otherContacts.length > 0 ? (
                                        otherContacts
                                          .filter((obj) => !obj.invited)
                                          .map((contact, index) => {
                                            if (index < otherItemPerPage) {
                                              return (
                                                <Col
                                                  className='event-contact-col'
                                                  key={index}
                                                >
                                                  <ContactCard
                                                    toolTipLabel='Mark as unattend'
                                                    label='unattend'
                                                    index={index}
                                                    mode='edit'
                                                    contact={contact}
                                                    errors={errors}
                                                    control={control}
                                                    getValues={getValues}
                                                    setValue={setValue}
                                                  />
                                                </Col>
                                              );
                                            }
                                          })
                                      ) : (
                                        <>
                                          <div className='pt-2 pb-2'>
                                            <NoRecordFound />
                                          </div>
                                        </>
                                      )
                                    ) : (
                                      <div className='event-contact-table-w'>
                                        <ItemTable
                                          hideButton={true}
                                          columns={otherContactColumns}
                                          data={otherContacts.filter(
                                            (obj) => !obj.invited
                                          )}
                                          itemsPerPage={10}
                                          selectableRows={false}
                                          showCard={false}
                                          showHeader={false}
                                          hideExport={true}
                                        />
                                      </div>
                                    )}
                                  </Row>
                                )}
                                {/* Contacts Load More */}
                                {!contactLoading &&
                                  otherItemPerPage < otherContacts.length &&
                                  otherActiveView === 'grid' && (
                                    <div className='text-center mb-2'>
                                      <Button
                                        outline={true}
                                        color='primary'
                                        onClick={() => {
                                          let temp = otherItemPerPage;
                                          temp = temp + 6;
                                          setOtherItemPerPage(temp);
                                        }}
                                      >
                                        Load More
                                      </Button>
                                    </div>
                                  )}
                              </AccordionBody>
                            </AccordionItem>
                          </Accordion>
                        </>
                      )}
                    </div>
                    <div className='invite-contacts-wrapper rsvp-submissions-wrapper'>
                      <h3 className='main-title'>RSVP Submissions</h3>
                      <Accordion
                        className='accordion-margin contact-accordion'
                        open={openRSVP}
                        toggle={toggleRSVP}
                      >
                        <AccordionItem>
                          <AccordionHeader targetId='1'>
                            <h3 className='title'>
                              RSVP :{' '}
                              <span className='value'>
                                {rsvpObj.data.length}
                              </span>
                            </h3>
                            <div className='down-arrow-btn'>
                              <ChevronDown className='' size={34} />
                            </div>
                          </AccordionHeader>
                          <AccordionBody accordionId='1'>
                            {rsvpObj.loading ? (
                              <div className='text-primary text-center my-3'>
                                <Spinner color='primary' />
                              </div>
                            ) : (
                              <Row className='event-contact-list-wrapper match-height'>
                                {rsvpObj.data.length > 0 ? (
                                  rsvpObj.data.map((obj, index) => {
                                    return (
                                      <Col
                                        className='event-contact-col'
                                        key={index}
                                      >
                                        <RsvpCard data={obj} />
                                      </Col>
                                    );
                                  })
                                ) : (
                                  <>
                                    <div className='pt-2 pb-2'>
                                      <NoRecordFound />
                                    </div>
                                  </>
                                )}
                              </Row>
                            )}
                          </AccordionBody>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </>
                )}
              </Form>
            </UILoader>
          </ModalBody>
          <ModalFooter>
            {recurringCount > 1 ? (
              <SaveButton
                disabled={eventDeleting || eventLoading}
                // width='270px'
                outline={true}
                color='danger'
                onClick={() => {
                  handleDeleteEvent(false);
                }}
                loading={eventDeleting}
                name={`Delete all ${recurringCount} recurring events`}
                className='delete-all-btn align-items-center justify-content-center'
              ></SaveButton>
            ) : null}
            <SaveButton
              disabled={eventDeleting || eventLoading}
              // width='90px'
              outline={true}
              color='danger'
              onClick={() => {
                handleDeleteEvent();
              }}
              loading={eventDeleting}
              name={'Delete'}
              className='delete-btn align-items-center justify-content-center'
            ></SaveButton>
            <Button
              className='cancel-btn'
              color='danger'
              onClick={() => {
                closeModal();
              }}
            >
              Cancel
            </Button>
            <Form
              className='auth-login-form'
              onSubmit={handleSubmit(onUpdateEventSubmit)}
              autoComplete='off'
            >
              <SaveButton
                // width='97px'
                type='submit'
                loading={buttonLoading.submitLoading}
                name={'Update'}
                className='update-btn align-items-center justify-content-center'
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
  }
);
UpdateEventModal.displayName = 'UpdateEventModal';

export default UpdateEventModal;
