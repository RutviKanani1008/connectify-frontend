// ==================== Packages =======================
import React, { useState } from 'react';
import * as yup from 'yup';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
// import { ArrowLeft } from 'react-feather';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';

// ====================================================
import Filter from '../../event/components/FIlter';
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import { userData } from '../../../../redux/user';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import ContactCard from '../../event/components/ContactCard';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import {
  addMassSMS,
  sendMassSMSWithoutSave,
  updateMassSMS,
} from '../../../../api/massSMS';
import SendMassSMSModal from './components/SendMassSMSModal';
import { FORM_SCHEDULE_TIMER } from '../../../../constant';
import moment from 'moment';
import useMassSMSHelper from './hooks/useMassSMSHelper';
import { useGetMassSMSInitialDetail } from './service/massSMS.services';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';

const massSMSSchema = yup.object().shape({
  template: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required()
    .nullable(),
});

const CreateMassSMS = () => {
  // ==========================Hooks =========================
  const params = useParams();
  const history = useHistory();
  const user = useSelector(userData);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(massSMSSchema),
  });

  const {
    control: sendSMSControl,
    handleSubmit: sendSMSHandleSubmit,
    reset: sendSMSReset,
    getValues: sendSMSGetValues,
    setValue: sendSMSSetValue,
    setError: sendSMSSetError,
    clearErrors: sendSMSClearErrors,
    formState: { errors: sendSMSErrors },
  } = useForm({
    mode: 'onChange',
  });
  const { basicRoute } = useGetBasicRoute();

  // ============================== States ============================
  const [openSendMassSMS, setOpenSendMassSMS] = useState(false);
  const [filterContacts, setFilterContacts] = useState([]);
  const [sendingMassSMS, setSendingMassSMS] = useState(false);
  const [saveAsLoading, setSaveAsLoading] = useState(false);
  const [itemPerPage, setItemPerPage] = useState(9);
  const [currentSelectedContacts, setCurrentSelectedContacts] = useState({});
  const selectedCheckedContacts = Object.values(currentSelectedContacts).filter(
    (obj) => obj.checked
  );
  const selectedCheckedContactPhoneNumbers = Object.values(
    currentSelectedContacts
  )
    .filter((obj) => obj.checked)
    .map((obj) => obj.phone);
  const selectedCheckedContactIds = Object.keys(currentSelectedContacts).filter(
    (key) => currentSelectedContacts[key]?.checked
  );

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

  // ========================== Custom Hooks =========================
  const { availableContacts, availableSMS, loading } =
    useGetMassSMSInitialDetail({
      setFilterContacts,
      reset,
      setFilterValue,
      unAssignFilter,
      setCurrentSelectedContacts,
      params,
    });
  const { handleChangeFilter, currentFilter } = useMassSMSHelper({
    availableContacts,
    setFilterContacts,
    filterValue,
    setFilterValue,
    unAssignFilter,
  });

  const onSaveAs = async (smsData) => {
    if (!selectedCheckedContactIds.length) {
      await showWarnAlert({
        title: '',
        text: 'Please select one or more contact.',
        icon: 'warning',
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
        customClass: {
          confirmButton: 'btn btn-primary',
        },
        buttonsStyling: false,
      });
    } else {
      const hasAllContactsContainNumber = Object.keys(currentSelectedContacts)
        .map((key) => currentSelectedContacts[key].phone)
        .every(Boolean);

      if (!hasAllContactsContainNumber) {
        await showWarnAlert({
          title: '',
          text: "One or more contact doesn't have phone number",
          icon: 'warning',
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
          customClass: {
            confirmButton: 'btn btn-primary',
          },
          buttonsStyling: false,
        });
        return;
      }

      if (params.id !== 'add') {
        if (!smsData.title) {
          setError(
            `title`,
            { type: 'focus', message: `Title is Required.` },
            { shouldFocus: true }
          );
          return;
        }

        const toastId = showToast(TOASTTYPES.loading, '', 'Processing...');
        setSaveAsLoading(true);

        const massSMS = {
          title: smsData.title,
          contacts: selectedCheckedContactIds,
          company: user.company._id,
          template: smsData.template.value,
        };

        updateMassSMS(params.id, massSMS).then((res) => {
          setSaveAsLoading(false);
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            showToast(
              TOASTTYPES.success,
              toastId,
              'Mass SMS update successfully!'
            );
            reset({});
            if (user.role === 'superadmin') {
              history.push(`${basicRoute}/mass-sms`);
            } else if (user.role === 'admin') {
              history.push(`${basicRoute}/mass-sms`);
            }
          }
        });
      } else {
        const result = await showWarnAlert({
          input: 'text',
          inputPlaceholder: 'Enter title',
          text: 'Enter title to save mass sms.',
          showCancelButton: true,
          confirmButtonText: 'Save',
          allowOutsideClick: false,
          customClass: {
            confirmButton: 'btn btn-primary ms-1',
            cancelButton: 'btn btn-danger',
            input:
              'email-title d-flex ms-1 me-1 mt-1 w-80 justify-content-center',
          },
          buttonsStyling: false,
          preConfirm: () => {
            if (!document.getElementsByClassName('swal2-input')?.[0]?.value) {
              Swal.showValidationMessage('Title is Required.');
            }
          },
          reverseButtons: true,
        });
        if (result.isConfirmed) {
          const toastId = showToast(TOASTTYPES.loading, '', 'Processing...');
          setSaveAsLoading(true);

          const massSMS = {
            contacts: selectedCheckedContactIds,
            company: user.company._id,
            template: smsData.template.value,
            title: result.value,
          };

          addMassSMS(massSMS).then((res) => {
            setSaveAsLoading(false);
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              showToast(
                TOASTTYPES.success,
                toastId,
                'Mass sms save as successfully!'
              );
              reset({});
              if (user.role === 'superadmin') {
                history.push(`${basicRoute}/mass-sms`);
              } else if (user.role === 'admin') {
                history.push(`${basicRoute}/mass-sms`);
              }
            }
          });
        }
      }
    }
  };

  const onSendMassSMS = async () => {
    const values = getValues();
    if (!values.template) {
      setError(
        `template`,
        { type: 'focus', message: `Template is required.` },
        { shouldFocus: true }
      );
    } else {
      if (!selectedCheckedContactPhoneNumbers.length) {
        await showWarnAlert({
          title: '',
          text: 'Please select one or more contact.',
          icon: 'warning',
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
          customClass: {
            confirmButton: 'btn btn-primary',
          },
          buttonsStyling: false,
        });
      } else {
        setOpenSendMassSMS(true);
      }
    }
  };

  const confirmedSendMassSMS = async (values) => {
    if (
      [...FORM_SCHEDULE_TIMER, { label: 'custom', value: 'custom' }].find(
        (obj) => obj.value === values.delay?.value
      ) &&
      !values.title
    ) {
      sendSMSSetError(
        `title`,
        { type: 'focus', message: `Scheduled Job Title.` },
        { shouldFocus: true }
      );
    } else {
      if (values.delay.value === 'custom' && values.delayTime) {
        values.sendAfter =
          moment(values.delayTime).valueOf() - moment().valueOf();
      } else {
        values.sendAfter =
          moment().add(values.delay.value, 'minutes').valueOf() -
          moment().valueOf();
        values.delayTime = moment().add(values.delay.value, 'minutes').toDate();
      }

      if (values.sendAfter < 0) {
        values.sendAfter = 0;
      }

      const template = getValues()?.template?.value;
      values.contacts = selectedCheckedContacts;
      values.template = template;
      values.company = user.company._id;

      setSendingMassSMS(true);
      try {
        const res = await sendMassSMSWithoutSave(values);
        if (res.error) {
          showToast(TOASTTYPES.error, '', res.error);
        } else {
          showToast(TOASTTYPES.success, '', 'SMS Send Successfully!');
        }
        setSendingMassSMS(false);
      } catch (error) {
        setSendingMassSMS(false);
      }
      onMassSMSSendClose();
    }
  };

  const onMassSMSSendClose = () => {
    setOpenSendMassSMS(false);
    sendSMSReset({});
  };

  const getSelectContactValue = (key) => {
    return currentSelectedContacts?.[key];
  };

  const delayStatus = useWatch({ control: sendSMSControl, name: 'delay' });

  return (
    <div>
      <Card className='create-mass-sms-card'>
        <CardHeader className='create-mass-sms-header'>
          <div
            id={'goback'}
            className='back-arrow'
            onClick={() => {
              if (user.role === 'superadmin') {
                history.push('/company/mass-sms');
              } else {
                history.push(`${basicRoute}/mass-sms`);
              }
            }}
          ></div>
          <UncontrolledTooltip placement='top' target={`goback`}>
            Go Back
          </UncontrolledTooltip>
          <CardTitle>
            {params.id !== 'add' ? 'Update Mass SMS' : 'Create Mass SMS'}
          </CardTitle>
          <div className='action-btn-header'>
            {params.id === 'add' ? (
              <>
                <SaveButton
                  loading={sendingMassSMS}
                  width='165px'
                  type='button'
                  name='Send Mass SMS'
                  onClick={() => {
                    onSendMassSMS();
                  }}
                  className='align-items-center justify-content-center'
                  disabled={!selectedCheckedContacts.length}
                ></SaveButton>
                <SaveButton
                  loading={saveAsLoading}
                  width={'100px'}
                  type='button'
                  onClick={handleSubmit(onSaveAs)}
                  name={'Save As'}
                  className='ms-1 align-items-center justify-content-center'
                  disabled={!selectedCheckedContacts.length}
                ></SaveButton>
              </>
            ) : (
              <SaveButton
                loading={saveAsLoading}
                width={'185px'}
                type='submit'
                name='Update Mass SMS'
                className='ms-1 align-items-center justify-content-center update-mass-sms-btn'
                disabled={!selectedCheckedContacts.length}
              ></SaveButton>
            )}
          </div>
        </CardHeader>
        <CardBody className='create-mass-sms-body'>
          {loading ? (
            <>
              <div className='d-flex justify-content-center mt-2 mb-2'>
                <Spinner color='primary' />
              </div>
            </>
          ) : (
            <>
              <Form
                className='auth-login-form'
                onSubmit={handleSubmit(onSaveAs)}
                autoComplete='off'
              >
                <div className='title-template-row-wrapper'>
                  <Row className='title-template-row'>
                    {params.id !== 'add' && (
                      <Col md='6'>
                        <FormField
                          name='title'
                          label='Title'
                          placeholder='Enter Title'
                          type='text'
                          errors={errors}
                          control={control}
                        />
                      </Col>
                    )}
                    <Col className='select-template-field' md='6'>
                      <FormField
                        name='template'
                        label='Select Templates'
                        placeholder='Select SMS template'
                        type='select'
                        errors={errors}
                        control={control}
                        options={availableSMS}
                      />
                    </Col>
                  </Row>
                </div>
                <div className='contact-filters-wrapper'>
                  <Filter
                    loading={loading}
                    mode={''}
                    contacts={availableContacts}
                    setFilterContacts={setFilterContacts}
                    currentFilter={currentFilter}
                    filterValue={filterValue}
                    handleChangeFilter={handleChangeFilter}
                  />
                </div>
                <div className='create-mass-email-contact-header'>
                  <div className='left'>
                    <h3 className='heading'>Contacts</h3>
                  </div>
                </div>
                <Row className='create-mass-email-contact-list'>
                  {filterContacts?.length > 0 ? (
                    filterContacts.map((contact, index) => {
                      if (index < itemPerPage) {
                        return (
                          <Col className='contact-col' md='4' key={index}>
                            <ContactCard
                              label='invite'
                              index={index}
                              contact={contact}
                              errors={errors}
                              control={control}
                              getValues={getSelectContactValue}
                              setValue={(id, checked) =>
                                setCurrentSelectedContacts({
                                  ...currentSelectedContacts,
                                  [id]: { ...contact, checked },
                                })
                              }
                            />
                          </Col>
                        );
                      }
                    })
                  ) : (
                    <>
                      <NoRecordFound />
                    </>
                  )}
                  {itemPerPage < filterContacts?.length && (
                    <div className='text-center mt-1'>
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
                </Row>
              </Form>
            </>
          )}
        </CardBody>
      </Card>
      {/* send mass email modal with it's detail */}
      {openSendMassSMS ? (
        <SendMassSMSModal
          currentSelectedContacts={Object.values(currentSelectedContacts)}
          onMassSMSSendClose={onMassSMSSendClose}
          openSendMassSMS={openSendMassSMS}
          onSendMassSMS={confirmedSendMassSMS}
          handleSubmit={sendSMSHandleSubmit}
          delayStatus={delayStatus}
          clearErrors={sendSMSClearErrors}
          setValue={sendSMSSetValue}
          control={sendSMSControl}
          errors={sendSMSErrors}
          fetchLoading={false}
          getValues={sendSMSGetValues}
          sendingMassSMS={sendingMassSMS}
        />
      ) : null}
    </div>
  );
};

export default CreateMassSMS;
