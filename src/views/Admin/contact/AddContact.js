// ** React Imports **
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

// ** External Package **
import { useHistory, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Button,
  UncontrolledTooltip,
  TabContent,
  TabPane,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ** Redux **
import { store } from '../../../redux/store';

// ** Hooks **
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';

// ** APIS **
import {
  archiveContact,
  deleteContact,
  saveCotanct,
  updateContact,
} from '../../../api/contacts';

// ** Helper *
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { scrollToTop } from '../../../helper/common.helper';

// ** Components **
import ResetPasswordModal from './components/ResetPasswordModal';
import ContactTaskTab from './components/ContactTaskTab';
import ComingSoon from '../../../components/ComingSoon';
import ContactChecklistTab from './components/ContactChecklistTab';
import ContactFilesTab from './components/ContactFilesTab';
import ContactActivities from './components/ContactActivites';
import AddContactNavBar from './components/AddContactNavBar';
import ContactForm from './components/ContactForm';

// ** Others **
import {
  addCompanyScheme,
  companyScheme,
} from './validation-schema/contact.schema';
import EmailApp from '../communication/Email';
import MailDetails from '../communication/Email/components/MailDetails';
import TaskTimerReport from '../TaskManager/TaskTimerReport';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import { Trash } from 'react-feather';
import NoteDetails from './components/NotesDetails';

const formInitialValue = {
  questions: [
    { question: 'Are you male?', answer: '' },
    { question: 'What is your age?', answer: '' },
    { question: 'Do you believe in a Supreme Being?', answer: '' },
    { question: 'Do you have a felony arrest record?', answer: '' },
    { question: 'How did you learn about us?', answer: '' },
    {
      question: 'Tell us about yourself and your interest.',
      answer: '',
    },
  ],
  companyDetails: [],
};

const AddContact = forwardRef(
  (
    {
      isModal = false,
      setModalOpen,
      setModalContactLoading = false,
      parentGetContacts = false,
    },
    ref
  ) => {
    // ** Redux **
    const storeState = store.getState();
    const user = storeState.user.userData;

    // ** Hooks Var **
    const params = useParams();
    const history = useHistory();

    // ** Form Vars **
    const {
      control,
      handleSubmit,
      register,
      reset,
      getValues,
      setValue,
      clearErrors,
      setError,
      formState: { errors },
    } = useForm({
      mode: 'onBlur',
      resolver:
        params.id === 'add'
          ? yupResolver(addCompanyScheme)
          : yupResolver(companyScheme),
      defaultValues: formInitialValue,
    });

    // ** States **
    const [initialValue, setInitialValue] = useState(formInitialValue);
    const [contactUserId, setContactUserId] = useState(false);
    const [currentTab, setCurrentTab] = useState(params.tab || 'contact');
    const [enableBilling, setEnableBilling] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [openResetPassword, setOpenResetPassword] = useState(false);
    const [fileUploadURL, setFileUploadURL] = useState(false);
    const [notes, setNotes] = useState({ results: [], total: 0 });
    const [buttonLoading, setButtonLoading] = useState({
      companyLoading: false,
      statusLoading: false,
      noteLoading: false,
      submitLoading: false,
    });

    // ** Custom Hooks
    const { basicRoute } = useGetBasicRoute();

    if (isModal) {
      params.id = 'add';
    }

    useEffect(() => {
      setFileUploadURL(false);
    }, [params.id]);

    const onSubmit = async (data) => {
      const rawData = JSON.parse(JSON.stringify(data));
      let flag = 1;

      rawData.company = user.company._id;
      rawData.notes =
        notes?.results?.map((n) => ({
          text: n.text,
          title: n?.title,
          isPinned: n?.isPinned || false,
          updatedAt: n.updatedAt,
          updatedBy: n.updatedBy._id,
        })) || [];

      if (rawData.pipelineDetails && rawData.pipelineDetails.length > 0) {
        rawData.pipelineDetails.map((company) => {
          if (
            company.status === '' ||
            Object.keys(company.status).length === 0
          ) {
            flag = 0;
            company.showStatusError = true;
          }
        });
        if (!flag) {
          setValue(`pipelineDetails`, rawData.pipelineDetails);
        }
      }
      if (flag) {
        if (rawData.pipelineDetails && rawData.pipelineDetails.length > 0) {
          rawData.pipelineDetails.forEach((pipeline) => {
            delete pipeline.contactStages;
            delete pipeline.currentNote;
            delete pipeline.isExistingNote;
            delete pipeline.memberStatus;
            delete pipeline.currentNote;
            delete pipeline.newAdded;
            if (pipeline?.status) {
              const status = {};
              status['id'] = pipeline.status.id;
              status['code'] = pipeline.status.value;
              status['title'] = pipeline.status.label;
              pipeline.status = status;
            }
            if (pipeline?.pipeline) {
              const companyDetail = {};
              companyDetail['id'] = pipeline?.pipeline.id;
              companyDetail['label'] = pipeline?.pipeline.label;
              companyDetail['value'] = pipeline?.pipeline.value;
              pipeline.pipeline = companyDetail;
            }
          });
        }
        rawData.enableBilling = enableBilling;
        rawData.userProfile = fileUploadURL;

        setButtonLoading({ ...buttonLoading, submitLoading: true });
        setModalContactLoading && setModalContactLoading(true);

        if (params.id !== 'add') {
          const toastId = showToast(
            TOASTTYPES.loading,
            '',
            'Update Contact...'
          );
          await updateContact(params.id, rawData).then((res) => {
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              if (res?.data?.response_type === 'success') {
                if (res.data.data) {
                  setValue('groupHistory', res.data.data?.groupHistory || []);
                  setValue('statusHistory', res.data.data?.statusHistory || []);
                  setValue(
                    'categoryHistory',
                    res.data.data?.categoryHistory || []
                  );
                  setValue('tagsHistory', res.data.data?.tagsHistory || []);
                  setValue(
                    'pipelineHistory',
                    res.data.data?.pipelineHistory || []
                  );
                  const historyData = {
                    groupHistory: res.data.data?.groupHistory || [],
                    statusHistory: res.data.data?.statusHistory || [],
                    categoryHistory: res.data.data?.categoryHistory || [],
                    tagsHistory: res.data.data?.tagsHistory || [],
                    pipelineHistory: res.data.data?.pipelineHistory || [],
                  };
                  const { pipelineDetails = [] } = res.data.data;
                  pipelineDetails.forEach((pipelineObj) => {
                    if (
                      pipelineObj &&
                      pipelineObj.pipeline &&
                      pipelineObj.pipeline.id
                    ) {
                      const stages = [];
                      const sortStage = pipelineObj?.pipeline?.id?.stages.sort(
                        ({ order: a }, { order: b }) => a - b
                      );
                      sortStage.forEach((stage) => {
                        const obj = {};
                        obj['value'] = stage?.code;
                        obj['label'] = stage?.title;
                        obj['id'] = stage?._id;
                        stages.push(obj);
                      });
                      pipelineObj.pipeline.label =
                        pipelineObj?.pipeline?.id?.pipelineName;
                      pipelineObj.pipeline.value =
                        pipelineObj?.pipeline?.id?.pipelineCode;
                      pipelineObj.pipeline.id = pipelineObj?.pipeline?.id?._id;
                      pipelineObj.contactStages = stages;
                    }
                    if (
                      pipelineObj &&
                      pipelineObj.status &&
                      pipelineObj.status.id &&
                      pipelineObj?.contactStages
                    ) {
                      const sortStage = pipelineObj?.contactStages.sort(
                        ({ order: a }, { order: b }) => a - b
                      );
                      pipelineObj.status = sortStage.find(
                        (stage) => stage.id === pipelineObj.status.id
                      );
                      pipelineObj.currentPipelineStatus = sortStage.find(
                        (stage) => stage.id === pipelineObj.status?.id
                      );
                    }
                    if (
                      pipelineObj &&
                      pipelineObj.statusHistory &&
                      pipelineObj.statusHistory.length > 0
                    ) {
                      pipelineObj.statusHistory =
                        pipelineObj.statusHistory.reverse();
                    }
                    pipelineObj.currentNote = '';
                    pipelineObj.isExistingNote = false;
                    pipelineObj.newAdded = false;
                  });
                  setInitialValue({ ...data, ...historyData, pipelineDetails });
                }
                showToast(TOASTTYPES.success, toastId, res?.data?.message);
                if (history?.location?.status?.from) {
                  history.push(history?.location?.status?.from);
                } else {
                  scrollToTop();
                }
              } else {
                showToast(TOASTTYPES.error, toastId, res?.data?.message);
              }
            }
            setButtonLoading({ ...buttonLoading, submitLoading: false });
            setModalContactLoading && setModalContactLoading(false);
          });
        } else {
          const toastId = showToast(TOASTTYPES.loading, '', 'Save Contact...');
          await saveCotanct(rawData).then((res) => {
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              if (res?.data?.response_type === 'success') {
                showToast(TOASTTYPES.success, toastId, res?.data?.message);

                if (!isModal) {
                  if (history?.location?.status?.from) {
                    history.push(history?.location?.status?.from);
                  } else {
                    history.push(
                      `${basicRoute}/contact/${res?.data?.data?._id}`
                    );
                  }
                } else {
                  setModalOpen(false);
                  parentGetContacts(true);
                }
              } else {
                showToast(TOASTTYPES.error, toastId, res?.data?.message);
              }
            }
            setButtonLoading({ ...buttonLoading, submitLoading: false });
            setModalContactLoading && setModalContactLoading(false);
          });
        }
      }
    };

    // ------- forward methods to it's parent components --------
    useImperativeHandle(ref, () => ({
      handleForWardSubmit() {
        handleSubmit((data) => onSubmit(data))();
      },
    }));

    const archiveUnarchiveContact = async () => {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: `Are you sure you would like to ${
          isArchived ? 'active' : 'archive'
        } this contact?`,
      });

      if (result.value) {
        const toastId = showToast(TOASTTYPES.loading);
        try {
          const response = await archiveContact(params.id, {
            archived: !isArchived,
          });

          if (response?.data?.response_type === 'success') {
            setIsArchived(!isArchived);
            showToast(TOASTTYPES.success, toastId, response?.data?.message);
          } else if (response?.data?.toast) {
            showToast(TOASTTYPES.error, toastId, response?.data?.message);
          }
        } catch (error) {
          showToast(TOASTTYPES.error, toastId, 'Something went wrong!');
        }
      }
    };

    const removeContact = async () => {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: `Are you sure you would like to delete this contact?`,
      });

      if (result.value) {
        const toastId = showToast(TOASTTYPES.loading);
        try {
          const response = await deleteContact(params.id);

          if (response?.data?.response_type === 'success') {
            showToast(TOASTTYPES.success, toastId, response?.data?.message);
            history.push(`${basicRoute}/contacts/${'all'}`);
          } else if (response?.data?.toast) {
            showToast(TOASTTYPES.error, toastId, response?.data?.message);
          }
        } catch (error) {
          showToast(TOASTTYPES.error, toastId, 'Something went wrong!');
        }
      }
    };

    return (
      <div>
        <Card className='contact__card__wrapper new-design'>
          <CardHeader>
            <div
              className='back-arrow'
              onClick={() => history.push(`${basicRoute}/contacts/all`)}
              id={'goback'}
            >
              <UncontrolledTooltip placement='top' target={`goback`}>
                Go Back
              </UncontrolledTooltip>
            </div>
            <CardTitle className='d-flex align-items-center'>
              <h4 className={`title card-title ${isModal ? 'hide-title' : ''}`}>
                {params.id !== 'add'
                  ? `${
                      initialValue?.firstName || initialValue?.lastName
                        ? `${initialValue?.firstName} ${
                            initialValue?.lastName
                          } ${
                            initialValue?.company_name !== '' &&
                            initialValue?.company_name !== undefined &&
                            initialValue?.company_name !== null
                              ? `- ${initialValue?.company_name}`
                              : ''
                          }`
                        : 'Update Contact'
                    }`
                  : 'Add New Contact'}
              </h4>
              <>
                {params.id !== 'add' && contactUserId ? (
                  <>
                    <div className='d-flex align-item-center'>
                      <div className='me-1 mt-0'>
                        <Button
                          color='primary'
                          onClick={() => {
                            setOpenResetPassword(!openResetPassword);
                          }}
                        >
                          Reset Password
                        </Button>
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            </CardTitle>
            <div className='mobile-contactInfo-sidebar-toggle-btn'>
              <span className='line'></span>
              <span className='line'></span>
              <span className='line'></span>
            </div>

            {params.id !== 'add' && (
              <div
                className={`bottom-sticky-btn ${isArchived ? 'unArchive' : ''}`}
              >
                <div
                  className={`vertical-tab-item archive-btn`}
                  onClick={archiveUnarchiveContact}
                >
                  {`${isArchived ? 'UnArchive' : 'Archive Contact'}`}
                </div>
                {isArchived && (
                  <>
                    <div
                      id='delete-contact'
                      className={`vertical-tab-item delete-contact`}
                      onClick={removeContact}
                    >
                      <Trash />
                    </div>
                    <UncontrolledTooltip
                      placement='top'
                      target={`delete-contact`}
                    >
                      Delete Contact
                    </UncontrolledTooltip>
                  </>
                )}
              </div>
            )}
          </CardHeader>

          {/* NavBar */}
          <AddContactNavBar
            currentTab={currentTab}
            params={params}
            setCurrentTab={setCurrentTab}
            user={user}
          />

          <CardBody>
            <TabContent activeTab={currentTab}>
              <TabPane tabId='contact'>
                <ContactForm
                  buttonLoading={buttonLoading}
                  clearErrors={clearErrors}
                  control={control}
                  isArchived={isArchived}
                  enableBilling={enableBilling}
                  errors={errors}
                  fileUploadURL={fileUploadURL}
                  getValues={getValues}
                  handleSubmit={handleSubmit}
                  initialValue={initialValue}
                  isModal={isModal}
                  onSubmit={onSubmit}
                  params={params}
                  register={register}
                  reset={reset}
                  setButtonLoading={setButtonLoading}
                  setContactUserId={setContactUserId}
                  setCurrentTab={setCurrentTab}
                  setIsArchived={setIsArchived}
                  setEnableBilling={setEnableBilling}
                  setFileUploadURL={setFileUploadURL}
                  setInitialValue={setInitialValue}
                  setValue={setValue}
                  user={user}
                  setError={setError}
                />
              </TabPane>
              {currentTab === 'notes' && (
                <>
                  <NoteDetails
                    currentContactDetail={getValues()}
                    key={params.id}
                    notes={notes}
                    setNotes={setNotes}
                    params={params}
                  />
                </>
              )}
              <TabPane tabId='activities'>
                {currentTab === 'activities' && (
                  <ContactActivities
                    key={params.id}
                    params={params}
                    setCurrentTab={setCurrentTab}
                  />
                )}
              </TabPane>
              <TabPane tabId='task'>
                {currentTab === 'task' && initialValue._id && (
                  <ContactTaskTab initialContactData={initialValue} />
                )}
              </TabPane>
              <TabPane tabId='checklist'>
                {currentTab === 'checklist' && initialValue._id && (
                  <ContactChecklistTab contactId={params.id} />
                )}
              </TabPane>
              <TabPane tabId='files'>
                {currentTab === 'files' && initialValue._id && (
                  <ContactFilesTab contactId={params.id} />
                )}
              </TabPane>
              <TabPane tabId='email'>
                {currentTab === 'email' &&
                  initialValue._id &&
                  (params.folder === 'detail' ? (
                    <MailDetails
                      contact={{
                        id: params.id,
                        email: initialValue.email,
                      }}
                    />
                  ) : (
                    <EmailApp
                      contact={{
                        id: params.id,
                        email: initialValue.email,
                      }}
                    />
                  ))}
              </TabPane>
              <TabPane tabId='sms'>
                {currentTab === 'sms' && initialValue._id && <ComingSoon />}
              </TabPane>
              <TabPane tabId='mail'>
                {currentTab === 'mail' && initialValue._id && <ComingSoon />}
              </TabPane>
              <TabPane tabId='tasks-timer-report'>
                {currentTab === 'tasks-timer-report' && (
                  <TaskTimerReport
                    extraFilers={{ contact: params.id }}
                    key={params.id}
                    currentPage={'contact'}
                  />
                )}
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>

        {/* Modals ------------ Start >> */}
        <ResetPasswordModal
          email={initialValue?.email}
          openResetPassword={openResetPassword}
          setOpenResetPassword={setOpenResetPassword}
        />
        {/* Modals ------------ End >> */}
      </div>
    );
  }
);

AddContact.displayName = 'AddContact';

export default AddContact;
