// ==================== Packages =======================
import { useEffect, useState, useMemo, useRef } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Form,
  Col,
  Row,
  Spinner,
  UncontrolledTooltip,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye } from 'react-feather';
// ====================================================
import { FormField } from '@components/form-fields';
import { SaveButton } from '@components/save-button';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';
import { useGetContactsForMassEmail } from '../../../Admin/contact/hooks/useContactService';
import ContactCard from '../../../Admin/event/components/ContactCard';
import MassContactFilter from '../../../Admin/campaigns/mass-email-tool/components/MassContactFilter';
import useMassEmailHelper from '../../../Admin/campaigns/mass-email-tool/hooks/useMassEmailHelper';
import EmailTemplatePreviewModal from '../../../templates/components/EmailTemplatePreviewModal';
import { useGetDirectMailInitialDetail } from '../services/directMail.services';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { useGetContactsNewAPI } from '../../../Admin/contact/service/contact.services';
import DirectMailPrint from '../../DirectMailTemplate/components/DirectMailPrint';
import { useReactToPrint } from 'react-to-print';
import { useLazyGetDirectMailTemplateQuery } from '../../../../redux/api/directMailTemplateApi';
import { useCreateDirectMail, useUpdateDirectMail } from '../hooks/useApi';

const massEmailSchema = yup.object().shape({
  directMailTemplate: yup
    .object()
    .shape({
      label: yup.string().required('Required'),
      value: yup.string().required('Required'),
    })
    .required('Template is required.')
    .nullable(),
  title: yup.string().required('Title is required'),
});

const CreateDirectMail = () => {
  // ========================== Hooks =========================
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(massEmailSchema),
  });

  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();
  const params = useParams();
  const user = useSelector(userData);

  // ============================== states ============================
  const [addOrEditLoading, setAddOrEditLoading] = useState(false);
  const [isSaveAndPrint, setIsSaveAndPrint] = useState(false);
  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState({
    checkAll: false,
    checkAllPages: false,
    selectedContact: {},
    unSelectedContact: {},
  });
  const [currentDataForPrint, setCurrentDataForPrint] = useState({
    postcardBack: '',
    postcardFront: '',
    type: '',
    body: '',
    footer: '',
    header: '',
    contacts: [],
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
    stage: [],
  });

  // ** Ref **
  const templatePrintRef = useRef(null);

  // ** APIS **
  const [getDirectMailTemplate] = useLazyGetDirectMailTemplateQuery();

  // ** Custom Hooks **
  const { getContacts, contactsData, isLoading } = useGetContactsForMassEmail({
    initialQuery: {
      select:
        'firstName,lastName,email,group,hasUnsubscribed,userProfile,company_name,website,phone,address1,address2,city,state,zip',
      archived: false,
      limit: 9,
    },
    previousDataStore: true,
  });
  const { createDirectMail } = useCreateDirectMail();
  const { updateDirectMail } = useUpdateDirectMail();
  // const { createDirectMail, isLoading: createLoading } = useCreateDirectMail();
  // const { updateDirectMail, isLoading: updateLoading } = useUpdateDirectMail();
  const { getContactsNewAPI } = useGetContactsNewAPI();
  const {
    availableDirectTemplate,
    availableDirectMailTemplates,
    loading: emailTemplateLoading,
  } = useGetDirectMailInitialDetail({
    reset,
    setFilterValue,
    unAssignFilter,
    params,
    setSelectedContact,
  });
  const { handleChangeFilter, currentFilter, setCurrentFilter } =
    useMassEmailHelper({
      filterValue,
      setFilterValue,
      unAssignFilter,
    });

  const handlePrintNote = useReactToPrint({
    content: () => templatePrintRef.current,
  });

  const selectedCheckedContactIds = useMemo(() => {
    return Object.keys(selectedContact.selectedContact).filter(
      (key) => selectedContact.selectedContact[key]
    );
  }, [selectedContact]);

  const unSelectedContactIds = useMemo(() => {
    if (!selectedContact.checkAllPages) {
      return [];
    }
    return Object.keys(selectedContact.unSelectedContact).filter(
      (key) => selectedContact.unSelectedContact[key]
    );
  }, [selectedContact]);

  const selectedCount = useMemo(() => {
    if (!selectedContact.checkAllPages) {
      return selectedCheckedContactIds.length;
    }

    return (
      contactsData.total -
      contactsData.unsSubscribedCount -
      unSelectedContactIds.length
    );
  }, [
    contactsData,
    selectedContact,
    selectedCheckedContactIds,
    unSelectedContactIds,
  ]);

  const isAllNotSelected = useMemo(() => {
    if (
      !selectedCheckedContactIds.length ||
      selectedCheckedContactIds.length === contactsData.total
    ) {
      return false;
    }

    if (!selectedContact.checkAllPages) {
      return true;
    }

    return !!unSelectedContactIds.length;
  }, [
    contactsData,
    selectedContact,
    selectedCheckedContactIds,
    unSelectedContactIds,
  ]);

  useEffect(() => {
    if (params.id === 'add' && availableDirectTemplate?.length) {
      setValue('directMailTemplate', availableDirectTemplate[0]);
    }
  }, [availableDirectTemplate]);

  useEffect(() => {
    const currentCount = contactsData.results.filter(
      (obj) => !obj?.hasUnsubscribed
    ).length;

    if (currentCount === selectedCheckedContactIds.length) {
      if (selectedContact.checkAll === false) {
        setSelectedContact((prev) => ({ ...prev, checkAll: true }));
      }
    } else {
      if (selectedContact.checkAll === true) {
        setSelectedContact((prev) => ({ ...prev, checkAll: false }));
      }
    }
  }, [contactsData.results, selectedCheckedContactIds]);

  useEffect(() => {
    const filter = {};
    Object.keys(currentFilter).forEach((key) => {
      if (currentFilter[key] !== null) {
        if (_.isArray(currentFilter[key])) {
          currentFilter[key] = currentFilter?.[key].reduce(
            (previousVal, currentVal) => {
              return [...previousVal, currentVal];
            },
            []
          );
        }
        if (key === 'pipeline') {
          filter[key] = currentFilter[key]?.id;
        } else {
          filter[key] = currentFilter[key];
        }
      }
    });
    delete filter.page;
    if (currentFilter.page === 1) {
      setSelectedContact({
        checkAll: false,
        checkAllPages: false,
        selectedContact: {},
        unSelectedContact: {},
      });
    }
    getContacts({
      page: currentFilter.page,
      search: currentFilter.search || '',
      filters: { ...filter },
    });
  }, [currentFilter]);

  // here handle if checked selectAll that time new data arrival checked
  useEffect(() => {
    if (selectedContact.checkAllPages) {
      setSelectedContact((prev) => ({
        ...prev,
        selectedContact: {
          ...contactsData.results
            .filter((obj) => !obj.hasUnsubscribed)
            .reduce(
              (prevValue, obj) => ({ ...prevValue, [obj._id]: true }),
              {}
            ),
          ...prev.selectedContact,
        },
      }));
    }
  }, [contactsData.results]);

  const onDirectMailSubmit = async (values, isDirectPrint = false) => {
    let directMail = JSON.parse(JSON.stringify(values));

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
      if (!values.title) {
        setError(
          `title`,
          { type: 'focus', message: `Title is Required.` },
          { shouldFocus: true }
        );
        return;
      }
      if (params.id !== 'add') {
        setAddOrEditLoading(true);
        directMail.contacts = selectedCheckedContactIds;
        directMail.company = user.company._id;
        directMail.directMailTemplate = directMail.directMailTemplate.value;

        // =====================================================
        directMail.selected = selectedContact.checkAllPages
          ? 'All'
          : 'currentContacts';
        directMail.exceptionsContacts = unSelectedContactIds;
        directMail.massCreatedAt = new Date();
        const filter = {};
        Object.keys(currentFilter).forEach((key) => {
          if (currentFilter[key] !== null) {
            filter[key] = currentFilter[key];
          }
        });
        delete filter.page;
        delete filter.search;
        directMail.filters = { ...filter };
        directMail.search = currentFilter.search || '';

        await updateDirectMail(params.id, directMail);

        // const { data, error } = await updateDirectMail(params.id, directMail);
        // if (!error && data) {
        //   history.push(`${basicRoute}/direct-mail`);
        // }
      } else {
        setAddOrEditLoading(true);
        const obj = {};
        const template = getValues()?.directMailTemplate?.value;
        obj.contactsIds = selectedCheckedContactIds;
        obj.directMailTemplate = template;
        obj.company = user.company._id;
        // =====================================================
        obj.selected = selectedContact.checkAllPages
          ? 'All'
          : 'currentContacts';
        obj.contacts = selectedCheckedContactIds;
        obj.exceptionsContacts = unSelectedContactIds;
        obj.massCreatedAt = new Date();
        const filter = {};
        Object.keys(currentFilter).forEach((key) => {
          if (currentFilter[key] !== null) {
            filter[key] = currentFilter[key];
          }
        });
        delete filter.page;
        delete filter.search;
        obj.title = values.title;
        obj.filters = { ...filter };
        obj.search = currentFilter.search || '';

        const { data, error } = await createDirectMail(obj);

        if (!error && data) {
          history.push(`${basicRoute}/direct-mail/${data._id}`);
        }

        directMail = obj;
      }

      if (isDirectPrint === true) {
        const template = await getDirectMailTemplate({
          id: directMail?.directMailTemplate,
        });
        if (directMail?.selected !== 'currentContacts') {
          const { data } = await getContactsNewAPI({
            params: {
              company: user.company._id,
              select:
                'firstName,lastName,companyType,email,phone,company_name,website,address1,address2,city,state,zip',
              page: 1,
              limit: 10000,
              hasUnsubscribed: false,
            },
          });
          const contacts = data?.results.filter(
            (obj) => !unSelectedContactIds.includes(obj._id)
          );

          setCurrentDataForPrint({
            body: template?.data?.data?.body,
            header: template?.data?.data?.header,
            footer: template?.data?.data?.footer,
            postcardBack: template?.data?.data?.postcardBack,
            postcardFront: template?.data?.data?.postcardFront,
            type: template?.data?.data?.type,
            contacts,
          });
        } else {
          const { data } = await getContactsNewAPI({
            params: {
              company: user.company._id,
              select:
                'firstName,lastName,companyType,email,phone,company_name,website,address1,address2,city,state,zip',
              page: 1,
              limit: 10000,
              hasUnsubscribed: false,
            },
          });
          const contacts = data?.results.filter((obj) =>
            selectedCheckedContactIds.includes(obj._id)
          );

          setCurrentDataForPrint({
            body: template?.data?.data?.body,
            header: template?.data?.data?.header,
            footer: template?.data?.data?.footer,
            postcardBack: template?.data?.data?.postcardBack,
            postcardFront: template?.data?.data?.postcardFront,
            type: template?.data?.data?.type,
            contacts,
          });
        }
        setTimeout(() => {
          handlePrintNote();
        }, 1000);
      }
      setAddOrEditLoading(false);
    }
  };

  const getSelectContactValue = (key) => {
    return selectedContact.selectedContact?.[key];
  };

  const previewTemplate = () => {
    const selectedTemplate = getValues('template');

    const template = availableDirectMailTemplates.find(
      (temp) => temp._id === selectedTemplate.value
    );

    setTemplatesPreview(template);
    setPreviewModal(true);
  };

  const showTemplateError = () => {
    let tempError = { ...errors };
    {
      'directMailTemplate'.split('.').map((obj) => {
        if (tempError) {
          tempError = tempError[obj];
        }
      });
    }
    return tempError;
  };

  const handleCreateAndPrint = () => {
    const values = getValues();
    onDirectMailSubmit(values, true);
  };

  return (
    <div className='create__mass__email__page create__direct__mail__page'>
      {emailTemplateLoading ? (
        <div className='create-directemail-loader-wrapper'>
          <Spinner />
        </div>
      ) : (
        <Form
          className='auth-login-form create__mass__email__form'
          onSubmit={handleSubmit(onDirectMailSubmit)}
          autoComplete='off'
        >
          <Card>
            <CardHeader>
              <div className='left'>
                <span
                  className='back-arrow'
                  onClick={() => {
                    history.push(`${basicRoute}/direct-mail`);
                  }}
                  id={'goback'}
                >
                  <UncontrolledTooltip placement='top' target={`goback`}>
                    Go Back
                  </UncontrolledTooltip>
                </span>
                <CardTitle>
                  {params.id !== 'add'
                    ? 'Update Direct Email'
                    : 'Create Direct Email'}
                </CardTitle>
              </div>
              <div className='right'>
                <div className='btns-wrapper'>
                  <SaveButton
                    id='send-mass-email-btn'
                    loading={isSaveAndPrint === true && addOrEditLoading}
                    width='auto'
                    type='button'
                    name={`${
                      params.id === 'add' ? 'Create' : 'Update'
                    } and Print`}
                    onClick={() => {
                      selectedCheckedContactIds.length &&
                        handleCreateAndPrint();
                      setIsSaveAndPrint(true);
                    }}
                    className={`prepare-btn ${
                      selectedCheckedContactIds.length ? '' : 'opacity-50'
                    }`}
                    disabled={!selectedCheckedContactIds.length}
                  ></SaveButton>

                  {!selectedCheckedContactIds.length && (
                    <UncontrolledTooltip
                      placement='top'
                      target='send-mass-email-btn'
                    >
                      Please select at least one contact
                    </UncontrolledTooltip>
                  )}
                  <SaveButton
                    id='save-as-mass-email-btn'
                    onClick={(e) => {
                      selectedCheckedContactIds.length &&
                        handleSubmit(onDirectMailSubmit)(e);
                      setIsSaveAndPrint(false);
                    }}
                    loading={isSaveAndPrint === false && addOrEditLoading}
                    width={'100px'}
                    type='button'
                    name={`${params.id === 'add' ? 'Create' : 'Update'}`}
                    className={`save-as-btn ${
                      selectedCheckedContactIds.length ? '' : 'opacity-50'
                    }`}
                    disabled={!selectedCheckedContactIds.length}
                  ></SaveButton>
                  {!selectedCheckedContactIds.length && (
                    <UncontrolledTooltip
                      placement='top'
                      target='save-as-mass-email-btn'
                    >
                      Please select at least one contact
                    </UncontrolledTooltip>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody className='custom-card-body'>
              <div className='title-template-row-wrapper'>
                <Row className='title-template-row'>
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
                  <Col className='select-template-field' md='6'>
                    <Label className='form-label max-w-90' for='template'>
                      Select Templates
                    </Label>
                    <div className='form-field-wrapper'>
                      <FormField
                        loading={emailTemplateLoading}
                        className='w-100'
                        name='directMailTemplate'
                        placeholder='Select Email template'
                        type='select'
                        errors={errors}
                        control={control}
                        options={availableDirectTemplate}
                      />
                      {getValues('template') && (
                        <span
                          className='preview-icon'
                          onClick={previewTemplate}
                        >
                          <Eye size={20} />
                        </span>
                      )}
                    </div>
                    <FormFeedback style={{ display: 'block' }}>
                      {showTemplateError()?.message}
                    </FormFeedback>
                  </Col>
                </Row>
              </div>
              <div className='contact-filters-wrapper'>
                <MassContactFilter
                  setCurrentFilter={setCurrentFilter}
                  currentFilter={currentFilter}
                  filterValue={filterValue}
                  handleChangeFilter={handleChangeFilter}
                />
              </div>
              {(isLoading && !contactsData.results?.length) ||
              (isLoading && currentFilter.page === 1) ? (
                <div className='d-flex justify-content-center mt-2 mb-2'>
                  <Spinner color='primary' />
                </div>
              ) : (
                <>
                  <div className='create-mass-email-contact-header'>
                    <div className='left'>
                      <h3 className='heading'>Contacts</h3>
                      <span className='list-counter'>
                        ( <span className='label'>Total:</span>{' '}
                        <span className='value'>{contactsData.total}</span> ,{' '}
                        <span className='label'>Unsubscribe:</span>
                        <span className='value'>
                          {contactsData.unsSubscribedCount}
                        </span>{' '}
                        )
                      </span>
                    </div>
                    <div className='right'>
                      {(() => {
                        return selectedCheckedContactIds.length ? (
                          <div className='selected-contact-info'>
                            <span className='inner-wrapper'>
                              {selectedCount} contacts selected.{' '}
                              {isAllNotSelected ? (
                                <>
                                  Do you want to{' '}
                                  <span
                                    className='text-primary cursor-pointer'
                                    onClick={() => {
                                      setSelectedContact((prev) => ({
                                        ...prev,
                                        checkAllPages: true,
                                        unSelectedContact: {},
                                        selectedContact: {
                                          ...contactsData.results
                                            .filter(
                                              (obj) => !obj.hasUnsubscribed
                                            )
                                            .reduce(
                                              (prevValue, obj) => ({
                                                ...prevValue,
                                                [obj._id]: true,
                                              }),
                                              {}
                                            ),
                                        },
                                      }));
                                    }}
                                  >
                                    select all
                                  </span>{' '}
                                  {contactsData.total -
                                    contactsData.unsSubscribedCount}{' '}
                                  records?
                                </>
                              ) : null}
                            </span>
                          </div>
                        ) : null;
                      })()}
                      <Input
                        className='ms-1'
                        type='checkbox'
                        checked={contactsData.total && selectedContact.checkAll}
                        onChange={(e) => {
                          if (
                            selectedContact.checkAllPages &&
                            e.target.checked
                          ) {
                            setSelectedContact((prev) => ({
                              ...prev,
                              selectedContact: {
                                ...contactsData.results
                                  .filter((obj) => !obj.hasUnsubscribed)
                                  .reduce(
                                    (prevValue, obj) => ({
                                      ...prevValue,
                                      [obj._id]: true,
                                    }),
                                    {}
                                  ),
                              },
                              unSelectedContact: {},
                              checkAll: e.target.checked,
                            }));
                          } else {
                            setSelectedContact((prev) => ({
                              ...prev,
                              selectedContact: e.target.checked
                                ? {
                                    ...contactsData.results
                                      .filter((obj) => !obj.hasUnsubscribed)
                                      .reduce(
                                        (prevValue, obj) => ({
                                          ...prevValue,
                                          [obj._id]: true,
                                        }),
                                        {}
                                      ),
                                  }
                                : {},
                              unSelectedContact: {},
                              checkAllPages: false,
                              checkAll: e.target.checked,
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                  <Row className='create-mass-email-contact-list'>
                    {contactsData.results?.length ? (
                      contactsData.results.map((contact, index) => (
                        <Col className='contact-col' md='4' key={index}>
                          <ContactCard
                            selectedContact={selectedContact}
                            setSelectedContact={setSelectedContact}
                            showUnsubscribe
                            label='invite'
                            index={index}
                            contact={contact}
                            errors={errors}
                            control={control}
                            getValues={getSelectContactValue}
                            setValue={(id, checked) => {
                              if (selectedContact.checkAllPages) {
                                setSelectedContact((prev) => ({
                                  ...prev,
                                  selectedContact: {
                                    ...prev.selectedContact,
                                    [id]: checked,
                                  },
                                  unSelectedContact: {
                                    ...prev.unSelectedContact,
                                    [id]: !checked,
                                  },
                                  checkAll: false,
                                }));
                              } else {
                                setSelectedContact((prev) => ({
                                  ...prev,
                                  selectedContact: {
                                    ...prev.selectedContact,
                                    [id]: checked,
                                  },
                                  checkAll: false,
                                  checkAllPages: false,
                                }));
                              }
                            }}
                          />
                        </Col>
                      ))
                    ) : (
                      <>
                        <NoRecordFound />
                      </>
                    )}
                    {contactsData.total > contactsData.results?.length && (
                      <div className='text-center mt-1'>
                        <SaveButton
                          loading={isLoading}
                          outline
                          name='Load More'
                          width='150px'
                          onClick={() => {
                            const page = contactsData.results.length / 9;
                            setCurrentFilter((prev) => ({
                              ...prev,
                              page: page + 1,
                            }));
                          }}
                        />
                      </div>
                    )}
                  </Row>
                </>
              )}
            </CardBody>
          </Card>
        </Form>
      )}

      {/* Preview Mass Email Template */}
      <EmailTemplatePreviewModal
        templatePreview={templatePreview}
        previewModal={previewModal}
        setPreviewModal={setPreviewModal}
        setTemplatesPreview={setTemplatesPreview}
      />

      <DirectMailPrint
        body={currentDataForPrint.body}
        type={currentDataForPrint.type}
        postcardBack={currentDataForPrint.postcardBack}
        postcardFront={currentDataForPrint.postcardFront}
        ref={templatePrintRef}
        contacts={currentDataForPrint.contacts}
        header={currentDataForPrint?.header || ''}
        footer={currentDataForPrint?.footer || ''}
      />
    </div>
  );
};

export default CreateDirectMail;
