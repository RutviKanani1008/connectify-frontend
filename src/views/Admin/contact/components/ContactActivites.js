import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Label,
  Spinner,
  TabPane,
} from 'reactstrap';
import { useGetContactActivities } from '../hooks/contactsApi';
import moment, { isDate } from 'moment';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';
import { Book, CheckSquare, Clock, User } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { encrypt } from '../../../../helper/common.helper';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { USER_PROFILE_TAB } from '../../../settings/UserProfile/constants';
import FilePreviewModal from '../../../../@core/components/form-fields/FilePreviewModal';
import { ActivityFormDetails } from './ActivityFormDetails';
import { ActivityFormResponse } from './ActivityFormResponse';
export const AVAILABLE_ACTIVITY_FOR = {
  task: 'task',
  note: 'note',
  taskUpdate: 'taskUpdate',
  contact: 'contact',
};
export const AVAILABLE_EVENT_TYPE = {
  NOTE_ADDED: 'note-added',
  TASK_ASSIGNED: 'task-assigned',
  TASK_UPDATE_ADDED: 'task-update-added',
  NEW_CONTACT_CREATE_FROM_CONTACT_FORM: 'contact-created-from-contact-form',
  NEW_CONTACT_CREATE_FROM_MASS_IMPORT: 'contact-created-from-mass-import',
  NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM:
    'contact-created-from-filling-marketing-form',
};

const ContactActivitiesDetail = (props) => {
  const { contactActivity, handleActivityClick, setOpenPreviewImage } = props;
  const [open, setOpen] = useState(null);
  const toggleAccordion = (contactActivityId) => {
    if (open) {
      setOpen(null);
    } else {
      setOpen(contactActivityId);
    }
  };

  return (
    <>
      <div className='icon-wrapper'>
        {contactActivity?.eventFor === AVAILABLE_ACTIVITY_FOR.note ? (
          <Book
            onClick={() => {
              handleActivityClick(contactActivity, AVAILABLE_ACTIVITY_FOR.note);
            }}
          />
        ) : contactActivity?.eventFor === AVAILABLE_ACTIVITY_FOR.contact &&
          [
            AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_CONTACT_FORM,
            AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_MASS_IMPORT,
            AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM,
          ].includes(contactActivity.eventType) ? (
          <>
            <User />
          </>
        ) : (
          <CheckSquare
            onClick={() => {
              handleActivityClick(contactActivity, AVAILABLE_ACTIVITY_FOR.task);
            }}
          />
        )}
      </div>
      <div className='details-wrapper'>
        {contactActivity?.eventFor === AVAILABLE_ACTIVITY_FOR.contact &&
        [
          AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM,
        ].includes(contactActivity.eventType) ? (
          <>
            <Accordion
              className={`accordion-margin contact-notes`}
              open={open}
              toggle={() => {
                toggleAccordion(contactActivity?._id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleAccordion(contactActivity?._id);
              }}
            >
              <AccordionItem>
                <AccordionHeader targetId={`${contactActivity?._id}`}>
                  <div className='header'>
                    <span className='title'>
                      {contactActivity?.eventFor ===
                        AVAILABLE_ACTIVITY_FOR.contact &&
                      [
                        AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM,
                      ].includes(contactActivity.eventType) ? (
                        <span>
                          {AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM ===
                          contactActivity.eventType ? (
                            <>
                              Contact created using{' '}
                              <span className='label'>
                                {contactActivity?.otherFormFieldDetails
                                  ?.formDetail?.title ||
                                  contactActivity?.otherReferenceField?.title ||
                                  ''}
                              </span>{' '}
                              form
                            </>
                          ) : (
                            ''
                          )}
                        </span>
                      ) : null}{' '}
                      {AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM !==
                      contactActivity.eventType ? (
                        <span className='label'>
                          {contactActivity?.createdBy?.firstName}{' '}
                          {contactActivity?.createdBy?.lastName}
                        </span>
                      ) : null}
                    </span>
                    <span className='time'>
                      {moment(
                        isDate(new Date(contactActivity.createdAt))
                          ? new Date(contactActivity.createdAt)
                          : new Date()
                      ).format('MMM DD, YYYY, HH:mm A')}{' '}
                    </span>
                  </div>
                </AccordionHeader>
                <AccordionBody
                  accordionId={`${contactActivity?._id}`}
                  // key={key}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  {open === contactActivity?._id && (
                    <div className='accordion-wrapper'>
                      {contactActivity?.otherFormFieldDetails ? (
                        <>
                          {contactActivity?.otherFormFieldDetails?.formDetail
                            .fields.length > 0 && (
                            <ActivityFormDetails
                              fields={
                                contactActivity?.otherFormFieldDetails
                                  ?.formDetail.fields
                              }
                              formResponseDetails={
                                contactActivity?.otherFormFieldDetails
                                  ?.responseDetails
                              }
                              setOpenPreviewImage={setOpenPreviewImage}
                            />
                          )}
                          {contactActivity?.otherFormFieldDetails
                            ?.formAutoResponderDetail?.htmlBody && (
                            <ActivityFormResponse
                              fields={
                                contactActivity?.otherFormFieldDetails
                                  ?.formDetail.fields
                              }
                              autoresponder={
                                contactActivity?.otherFormFieldDetails
                                  ?.formAutoResponderDetail
                              }
                              formResponse={
                                contactActivity?.otherFormFieldDetails
                                  ?.responseDetails
                              }
                            />
                          )}
                        </>
                      ) : (
                        <div className='d-flex justify-content-center m-4'>
                          <Label className='no-data-found'>
                            No Form Details Found
                          </Label>
                        </div>
                      )}
                    </div>
                  )}
                </AccordionBody>
              </AccordionItem>
            </Accordion>
          </>
        ) : (
          <>
            <div className='inner-wrapper'>
              <div className='header'>
                <span className='title'>
                  {contactActivity?.eventFor === AVAILABLE_ACTIVITY_FOR.note ? (
                    <span
                      className='label label-modual'
                      onClick={() => {
                        handleActivityClick(
                          contactActivity,
                          AVAILABLE_ACTIVITY_FOR.note
                        );
                      }}
                    >
                      Note added by
                    </span>
                  ) : contactActivity?.eventFor ===
                    AVAILABLE_ACTIVITY_FOR.task ? (
                    <span
                      className='label label-modual'
                      onClick={() => {
                        handleActivityClick(
                          contactActivity,
                          AVAILABLE_ACTIVITY_FOR.task
                        );
                      }}
                    >
                      Task #{contactActivity?.taskDetail?.taskNumber} added by
                    </span>
                  ) : contactActivity?.eventFor ===
                    AVAILABLE_ACTIVITY_FOR.taskUpdate ? (
                    <span
                      className='label label-modual'
                      onClick={() => {
                        handleActivityClick(
                          contactActivity,
                          AVAILABLE_ACTIVITY_FOR.taskUpdate
                        );
                      }}
                    >
                      Task Update #
                      {contactActivity?.taskUpdates?.task?.taskNumber} added by
                    </span>
                  ) : contactActivity?.eventFor ===
                      AVAILABLE_ACTIVITY_FOR.contact &&
                    [
                      AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_CONTACT_FORM,
                      AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_MASS_IMPORT,
                      AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM,
                    ].includes(contactActivity.eventType) ? (
                    <span>
                      {AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_CONTACT_FORM ===
                      contactActivity.eventType ? (
                        'Contact added by'
                      ) : AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_MASS_IMPORT ===
                        contactActivity.eventType ? (
                        'Contact created using the mass import. Import by '
                      ) : AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM ===
                        contactActivity.eventType ? (
                        <>
                          Contact created using{' '}
                          <span className='label'>
                            {contactActivity?.otherReferenceField?.title || ''}
                          </span>{' '}
                          form
                        </>
                      ) : (
                        ''
                      )}
                    </span>
                  ) : null}{' '}
                  {AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_FILLING_MARKETING_FORM !==
                  contactActivity.eventType ? (
                    <span className='label'>
                      {contactActivity?.createdBy?.firstName}{' '}
                      {contactActivity?.createdBy?.lastName}
                    </span>
                  ) : null}
                </span>
                <span className='time'>
                  {moment(
                    isDate(new Date(contactActivity.createdAt))
                      ? new Date(contactActivity.createdAt)
                      : new Date()
                  ).format('MMM DD, YYYY, HH:mm A')}{' '}
                </span>
              </div>
              <div className='contant'>
                {contactActivity?.eventFor === AVAILABLE_ACTIVITY_FOR.note ? (
                  <>{contactActivity?.noteDetail?.title}</>
                ) : contactActivity?.eventFor ===
                  AVAILABLE_ACTIVITY_FOR.task ? (
                  <>{contactActivity?.taskDetail?.name}</>
                ) : contactActivity?.eventFor ===
                  AVAILABLE_ACTIVITY_FOR.taskUpdate ? (
                  <>
                    {contactActivity?.taskUpdates?.content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: contactActivity?.taskUpdates?.content,
                        }}
                      ></div>
                    ) : (
                      ''
                    )}
                  </>
                ) : null}
              </div>
              <div className='time-mobile'>
                <span className='time-icon-wrapper'>
                  <Clock />
                </span>
                <span className='value'>
                  {moment(
                    isDate(new Date(contactActivity.createdAt))
                      ? new Date(contactActivity.createdAt)
                      : new Date()
                  ).format('MMM DD, YYYY, HH:mm A')}
                </span>
              </div>
            </div>
            <span className='card-reflection'></span>
          </>
        )}
      </div>
    </>
  );
};

const ContactActivities = ({
  params,
  setCurrentTab,
  modelType = 'Contacts',
  isUserProfile = false,
  currentTab = false,
}) => {
  const user = useSelector(userData);
  const history = useHistory();
  const [currentFilters, setCurretFilters] = useState({
    limit: 15,
    page: 1,
  });

  const [openPreviewImage, setOpenPreviewImage] = useState(null);

  const { basicRoute } = useGetBasicRoute();
  const [currentContactActivities, setCurrentContactActivities] = useState({
    activities: [],
    total: 0,
  });
  const { getContactActivities, isLoading: contactActivitiesLoading } =
    useGetContactActivities();
  const getContactActivitiesDetails = async (filter) => {
    setCurretFilters({
      limit: filter.limit,
      page: filter.page,
    });
    const { data, error } = await getContactActivities({
      ...(currentTab === 'user-deatil'
        ? { contact: params.id, createdBy: user._id, isUserTab: true }
        : modelType === 'Users' && isUserProfile
        ? { createdBy: params.id }
        : { contact: params.id }),
      ...filter,
    });
    if (!error) {
      setCurrentContactActivities({
        activities: [
          ...currentContactActivities.activities,
          ...data?.activities,
        ],
        total: data?.total || 0,
      });
    }
  };
  useEffect(() => {
    if (params.id !== 'add') {
      getContactActivitiesDetails(currentFilters);
    }
  }, []);

  const handleActivityClick = (activity, type) => {
    if (type === AVAILABLE_ACTIVITY_FOR.note) {
      if (activity.noteDetail?.modelName === modelType) {
        const url = new URL(window.location);
        url.searchParams.set('note', activity?.noteDetail?._id);
        if (setCurrentTab) {
          history.push({
            pathname: history.location.pathname,
            search: url.searchParams.toString(),
          });
          setCurrentTab('notes');
        } else {
          history.push({
            pathname: `${basicRoute}/profile/${USER_PROFILE_TAB.NOTES}`,
            search: url.searchParams.toString(),
          });
        }
      } else {
        if (activity.noteDetail?.modelName === 'User') {
          history.push(`${basicRoute}/update-profile?note=${activity._id}}`);
        } else {
          history.push(
            `${basicRoute}/contact/${activity?.contact}?note=${activity?.noteDetail?._id}&selectTab=notes`
          );
        }
      }
    }
    if (type === AVAILABLE_ACTIVITY_FOR.task) {
      history.push(`/task-manager?task=${encrypt(activity?.taskDetail?._id)}`);
    }
    if (type === AVAILABLE_ACTIVITY_FOR.taskUpdate) {
      history.push(
        `/task-manager?task=${encrypt(
          activity?.taskUpdates?.task?._id
        )}&update=true`
      );
    }
  };

  return (
    <TabPane tabId='notes' className='contact-activity-tabPane hide-scrollbar'>
      <div className='inner-activity-wrapper'>
        {currentContactActivities?.activities?.length > 0 ? (
          <>
            {currentContactActivities?.activities
              .sort(function (a, b) {
                return new Date(b.createdAt) - new Date(a.createdAt);
              })
              .map((contactActivity, key) => {
                if (
                  modelType === 'Users' &&
                  [
                    AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_CONTACT_FORM,
                    AVAILABLE_EVENT_TYPE.NEW_CONTACT_CREATE_FROM_MASS_IMPORT,
                  ].includes(contactActivity.eventType)
                ) {
                  return;
                }
                return (
                  <div className='activity-item' key={key}>
                    <ContactActivitiesDetail
                      contactActivity={contactActivity}
                      handleActivityClick={handleActivityClick}
                      setOpenPreviewImage={setOpenPreviewImage}
                    />
                  </div>
                );
              })}

            {currentContactActivities?.activities.length <
              currentContactActivities.total && (
              <div className='text-center loadMore-btn-wrapper'>
                <Button
                  outline={true}
                  color='primary'
                  onClick={() => {
                    setCurretFilters({
                      ...currentFilters,
                      page: currentFilters.page + 1,
                    });
                    getContactActivitiesDetails({
                      ...currentFilters,
                      page: currentFilters.page + 1,
                    });
                  }}
                >
                  {contactActivitiesLoading && <Spinner size='sm mr-1' />} Load
                  More
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {contactActivitiesLoading ? (
              <div className='d-flex justify-content-center align-content-center pt-2 pb-2'>
                <Spinner />
              </div>
            ) : (
              <>
                <NoRecordFound />
              </>
            )}
          </>
        )}
      </div>
      {openPreviewImage && (
        <FilePreviewModal
          visibility={!!openPreviewImage}
          url={openPreviewImage}
          toggleModal={() => setOpenPreviewImage(null)}
          title='Attachment Preview'
        />
      )}
    </TabPane>
  );
};

export default ContactActivities;
