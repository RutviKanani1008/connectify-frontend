// ** Package Imports **
import React, { useEffect, useState } from 'react';
import { Form } from 'reactstrap';
import { useFieldArray, useWatch } from 'react-hook-form';

// ** APIS **
import { uploadFile, useRemoveAttachment } from '../../../../api/auth';
import { getContact, updateContact } from '../../../../api/contacts';

// ** APIS **
import { getGroupDetails, getGroups } from '../../../../api/groups';
import { getCompany } from '../../../../api/company';

// ** Components **
import UILoader from '@components/ui-loader';
import AddGroupSections from './AddGroupSections';
import AddPipeline from './AddPipeline';
import { PersonalInfo } from './PersonalInfo';
import Events from './Events';
import { SaveButton } from '../../../../@core/components/save-button';
import AddGroups from './AddGroups';
import { FunnelView } from './FunnelView';

// ** Helper *
import { showWarnAlert } from '../../../../helper/sweetalert.helper';

// ** Constant **
import { AVAILABLE_PERSONAL_TABS } from '../../../../constant/contact.constant';
import AddGroupTags from './AddGroupTags';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { useGetFolders } from '../../groups/hooks/groupApis';

const ContactForm = ({
  onSubmit,
  params,
  user,
  setCurrentTab,
  setInitialValue,
  isModal,
  initialValue,
  buttonLoading,
  enableBilling,
  fileUploadURL,
  setButtonLoading,
  setFileUploadURL,
  setIsArchived,
  setEnableBilling,
  setContactUserId,
  // ** Forms **
  handleSubmit,
  control,
  reset,
  setValue,
  getValues,
  register,
  errors,
  clearErrors,
  setError,
}) => {
  const history = useHistory();

  // ** Form Vars **
  const { fields: companyField, append: companyAppend } = useFieldArray({
    control,
    name: 'companyDetails',
  });
  // ** Form Watcher Values
  const group = useWatch({
    control,
    name: 'group',
  });

  // ** States **
  const [companyName] = useState([]);
  const [contactStages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [paramsIds, setParamsIds] = useState(false);
  const [groupChangeLoading, setGroupChangeLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isCompanyChange, setIsCompanyChange] = useState(true);
  const [canUpdateBilling, setCanUpdateBilling] = useState(true);
  const [groups, setGroups] = useState([]);
  const [personalInfoTab, setPersonalInfoTab] = useState(
    AVAILABLE_PERSONAL_TABS.personal_info
  );
  const [availablePipeline, setAvailablePipeline] = useState(false);
  const { getFolders } = useGetFolders();
  const [currentTagFolders, setCurrentTagFolders] = useState([]);
  const [currentOpenTags, setCurrentOpenTags] = useState({});
  const { removeAttachment } = useRemoveAttachment();

  useEffect(() => {
    getCompanyNames();
    getTagsDetails();
  }, []);

  useEffect(() => {
    reset(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const searchValue = new URLSearchParams(location.search);
    const isTabSelected = searchValue.get('selectTab');
    if (isTabSelected) {
      setCurrentTab(isTabSelected);
      const url = new URL(window.location);
      url.searchParams.delete('selectTab');
      history.push({
        pathname: history.location?.pathname,
        search: url.searchParams.toString(),
      });
    }
    if (params.id === 'add') {
      setInitialValue({});
    }
    setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.personal_info);
  }, [params.id]);

  useEffect(() => {
    if (params.id !== 'add' && !isModal) {
      getCompanyDetails();
    } else {
      if (paramsIds) {
        const search = window.location.search;
        const searchValue = new URLSearchParams(search);
        const statusId = searchValue.get('status');
        const company = searchValue.get('company');
        if (statusId && company) {
          setParamsIds({ status: statusId, company });
          history.replace({
            pathname: '/contacts/add',
            status: history.location.state,
          });
        }
        setInitialValue({
          questions: [
            { question: 'Are you male?', answer: '' },
            { question: 'What is your age?', answer: '' },
            { question: 'Do you believe in a Supreme Being?', answer: '' },
            { question: 'Do you have a felony arrest record?', answer: '' },
            { question: 'How did you learn about us?', answer: '' },
            {
              question: 'Tell us about yourself and your interest .',
              answer: '',
            },
          ],
          companyDetails: [],
        });
      }
    }

    return () => {
      setInitialValue({});
      reset({});
    };
  }, [params?.id]);

  useEffect(() => {
    if (group?.value) {
      getFoldersDetails();
    }
  }, [group]);

  useEffect(() => {
    if (isFirstTime && companyName && companyName.length > 0) {
      let flag = 0;
      const initial = { status: '', companyDetail: '' };
      if (paramsIds && paramsIds.company) {
        const companyIdDetail = companyName.filter(
          (company) => company.value === paramsIds.company
        );
        if (companyIdDetail && companyIdDetail.length > 0) {
          const companyObj = {};
          companyObj['label'] = companyIdDetail[0].label;
          companyObj['value'] = companyIdDetail[0].value;
          if (isCompanyChange) {
            handleCompanyChange({ value: paramsIds.company });
          }
          initial.companyDetail = companyObj;
          setIsCompanyChange(false);
          flag = 1;
        }
      }
      if (contactStages && contactStages.length > 0 && flag) {
        if (paramsIds && paramsIds.status) {
          const statges = contactStages.filter(
            (stages) => stages.value === paramsIds?.status
          );
          if (statges && statges.length > 0) {
            const status = {};
            status['label'] = statges[0].label;
            status['value'] = statges[0].value;
            initial.status = status;
            flag = 2;
          }
        }
      }
      if (flag === 2) {
        setIsFirstTime(false);
        setInitialValue(initial);
      }
    }
  }, [paramsIds, companyName, contactStages]);

  const getFoldersDetails = async () => {
    const { data, error } = await getFolders({
      company: user.company._id,
      folderFor: 'tags',
      model: 'group',
      modelRecordId: group?.id ? group.id : null,
    });

    if (!error) {
      const sortedFolders = (data || [])?.sort(
        ({ createdAt: a }, { createdAt: b }) => moment(b) - moment(a)
      );
      const folders = [
        { folderName: 'Unassigned', _id: null },
        ...sortedFolders,
      ];
      setCurrentTagFolders(folders);
      setCurrentOpenTags(
        folders.reduce((p, c) => ({ ...p, [c._id]: true }), {})
      );
    }
  };

  const userProfileUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    const formData = new FormData();
    formData.append('filePath', `${user.company._id}/profile-pictures`);
    formData.append('image', file);

    if (params.id !== 'add') {
      formData.append('model', 'contact');
      formData.append('field', 'userProfile');
      formData.append('id', params.id);
      formData.append('type', 'userProfile');
    }
    if (fileUploadURL) {
      formData.append('removeAttachments', [fileUploadURL]);
    }
    setImageUploading(true);
    uploadFile(formData).then((res) => {
      if (res.error) {
        setImageUploading(false);
      } else {
        if (res?.data?.data) {
          setFileUploadURL(res?.data?.data);
          setValue('userProfile', res?.data?.data);
          clearErrors('userProfile');
        }
        setImageUploading(false);
      }
    });
  };

  const handleImageReset = async () => {
    if (fileUploadURL) {
      await removeAttachment({
        attachmentUrl: [fileUploadURL],
        modelDetail: {
          model: 'contact',
          id: params.id,
        },
      });
    }
    setFileUploadURL(false);
    clearErrors('userProfile');
    setValue('userProfile', null);
  };

  const updateBillingStatus = async (e) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to update billing status?',
    });

    if (result.value) {
      setEnableBilling(e.target.checked);
    } else {
      setEnableBilling(!e.target.checked);
      e.target.checked = !e.target.checked;
    }
  };

  const updateUnsubscribeStatus = async (e) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to update unsubscribe status?',
    });

    if (result.value) {
      setValue('hasUnsubscribed', e.target.checked);
      await updateContact(params.id, { hasUnsubscribed: e.target.checked });
    } else {
      e.target.checked = !e.target.checked;
    }
  };

  const getCompanyDetails = async () => {
    setLoading(true);
    const contactDetail = await getContact(params.id);

    if (contactDetail?.data?.data) {
      const contact = contactDetail.data.data;

      setIsArchived(contact?.archived || false);
      setFileUploadURL(contact?.userProfile);

      if (contact?.canUpdateBillingStatus !== undefined) {
        setCanUpdateBilling(contact?.canUpdateBillingStatus);
      }

      setEnableBilling(!!contact?.enableBilling);

      const companies = [];
      if (contact.pipelineDetails && contact.pipelineDetails.length > 0) {
        const pipeline = [];
        contact.pipelineDetails.forEach((pipelineObj) => {
          if (pipelineObj && pipelineObj.pipeline && pipelineObj.pipeline.id) {
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
            pipeline.push(pipelineObj.pipeline);
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
            pipelineObj.statusHistory = pipelineObj.statusHistory.reverse();
          }

          pipelineObj.currentNote = '';
          pipelineObj.isExistingNote = false;
          pipelineObj.newAdded = false;
        });
        contact['pipeline'] = pipeline;

        contact.company = companies;
      }
      if (contact?.group?.id?._id) {
        const obj = {};
        obj.id = contact?.group?.id?._id;
        obj.value = contact?.group?.id?.groupCode;
        obj.label = contact?.group?.id?.groupName;
        delete contact?.group?.id;
        contact.group = obj;
        handleGroupChange(obj, false, true);
      }
      if (contact?.status) {
        const obj = {};
        obj.id = contact?.status?.id?._id;
        obj.value = contact?.status?.id?.statusCode;
        obj.label = contact?.status?.id?.statusName;
        contact.status = obj;
      }

      if (contact?.category) {
        const obj = {};
        obj.id = contact?.category?.id?._id;
        obj.value = contact?.category?.id?.categoryId;
        obj.label = contact?.category?.id?.categoryName;

        delete contact?.category?.id;
        contact.category = obj;
      }

      if (contact?.tags && contact?.tags?.length > 0) {
        const tags = JSON.parse(JSON.stringify(contact?.tags));
        tags.map((tag) => {
          tag.id = tag._id;
          tag.value = tag?.tagId;
          tag.label = tag?.tagName;
        });
        contact.tags = tags;
      }

      if (!contact.questions) {
        contact.questions = [];
      }
      contact.activeAsUser = contact?.userId?.active;
      // contact.hasUnsubscribed = true;
      setContactUserId(contact?.userId?._id);
      contact.userId = contact?.userId?._id;
      setInitialValue(contact);
    }
    setLoading(false);
  };

  const handleSetOldGroupValue = () => {
    if (initialValue?.status?.value) {
      setValue('status', initialValue?.status);
    }
    if (initialValue?.category?.value) {
      setValue('category', initialValue?.category);
    }
    setValue('tags', null);
  };

  const setGroupRelatedValue = (
    groupValues,
    earseOldValue,
    selectedGroup,
    isItInitialTime
  ) => {
    if (initialValue?.group?.id === selectedGroup && !isItInitialTime) {
      handleSetOldGroupValue();
    } else if (earseOldValue) {
      setValue('status', null);
      setValue('category', null);
      setValue('tags', null);
      setValue('pipeline', null);
      setValue('pipelineDetails', []);
    }
    if (groupValues?.status) {
      const listObj = [];
      groupValues?.status?.forEach((status) => {
        const obj = {};
        obj.id = status._id;
        obj.value = status.statusCode;
        obj.label = status.statusName;
        listObj.push(obj);
      });
      setValue('statusList', listObj);
    }
    if (groupValues?.category) {
      const listObj = [];
      groupValues?.category?.forEach((category) => {
        const obj = {};
        obj.id = category._id;
        obj.value = category.categoryId;
        obj.label = category.categoryName;
        listObj.push(obj);
      });
      setValue('categoryList', listObj);
    }
    if (groupValues?.tags) {
      const listObj = [];
      groupValues?.tags?.forEach((tag) => {
        const obj = {};
        obj.id = tag._id;
        obj.folder = tag.folder;
        obj.value = tag.tagId;
        obj.label = tag.tagName;
        listObj.push(obj);
      });
      setValue('tagList', listObj);
    }
    if (groupValues?.pipeline) {
      const listObj = [];
      groupValues?.pipeline?.forEach((pipeline) => {
        const obj = {};
        obj.id = pipeline._id;
        obj.value = pipeline.pipelineCode;
        obj.label = pipeline.pipelineName;
        listObj.push(obj);
      });
      setAvailablePipeline(groupValues?.pipeline);
      setValue('pipelineList', listObj);
    }
    if (groupValues?.customeFields) {
      const exsistingCustomFields = getValues('questions') || [];
      const listObj = [];
      groupValues?.customeFields?.forEach((fields) => {
        if (
          !exsistingCustomFields.find(
            (exsist) => exsist.question === fields.fieldName
          )
        ) {
          const obj = {};
          obj.question = fields.fieldName;
          obj.answer = '';
          listObj.push(obj);
        }
      });
      setValue('questions', [
        ...(getValues('questions')?.length ? getValues('questions') : []),
        ...(!isItInitialTime ? listObj : []),
      ]);
    }
  };

  const handleGroupChange = (
    value,
    earseOldValue = true,
    isItInitialTime = false
  ) => {
    setGroupChangeLoading(true);
    getGroupDetails(value.id).then((res) => {
      if (res.data.data) {
        setGroupRelatedValue(
          res.data.data,
          earseOldValue,
          value.id,
          isItInitialTime
        );
        setGroupChangeLoading(false);
      }
    });
  };

  const getTagsDetails = () => {
    getGroups({ company: user.company._id, active: true })
      .then((res) => {
        const group = res.data.data;
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
        setGroups(groupObj);
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  const getSelectedCompany = async (selectedCompany) => {
    const getStage = await getCompany({
      select: 'contactStages,isGrandLodge',
      _id: selectedCompany.value,
    });
    const company = [];
    if (getStage && getStage.data.data && getStage.data.data.length > 0) {
      const sortStage = getStage.data?.data[0]?.contactStages.sort(
        ({ order: a }, { order: b }) => a - b
      );

      sortStage.forEach((stage) => {
        const obj = {};
        obj['value'] = stage?.code;
        obj['label'] = stage?.title;
        obj['id'] = stage?._id;
        company.push(obj);
      });

      companyAppend({
        company: selectedCompany,
        contactStages: company,
        status: '',
        currentNote: '',
        isExistingNote: false,
        notes: [],
        showMemberError: false,
        showStatusError: false,
      });
    }
  };

  const handleCompanyChange = async (value) => {
    if (value && value.length > 0 && value.length > companyField.length) {
      const result = value.filter((o1) => {
        return !companyField.some((o2) => {
          return o1.value === o2.company.value; // return the ones with equal id
        });
      });
      if (result.length === 1) {
        getSelectedCompany(result[0]);
      }
    } else {
      const result = await showWarnAlert({
        text: 'are you want to Delete this company detail?',
      });

      if (result.value) {
        const deleteCompany = companyField.filter((o1) => {
          return !value.some((o2) => {
            return o2.value === o1.company.value; // return the ones with equal id
          });
        });
        if (deleteCompany && deleteCompany.length === 1) {
          const remaining = companyField.filter(
            (company) =>
              company.company.value !== deleteCompany[0].company.value
          );
          setValue(`companyDetails`, remaining);
        }
      } else {
        const deleteCompany = companyField.filter((o1) => {
          return !value.some((o2) => {
            return o2.value === o1.company.value; // return the ones with equal id
          });
        });
        if (deleteCompany && deleteCompany.length === 1) {
          const companyDetail = getValues('company');
          companyDetail.push(deleteCompany[0].company);
          setValue(`company`, companyDetail);
        }
      }
    }
  };

  const getCompanyNames = async () => {
    const company = [];
    if (user && user.company && params.id === 'add') {
      const companyDetail = {};
      companyDetail['value'] = user.company._id;
      companyDetail['label'] = user.company.name;

      companyAppend({
        company: companyDetail,
        contactStages: company,
        status: '',
        currentNote: '',
        isExistingNote: false,
        notes: [],
        showMemberError: false,
        showStatusError: false,
      });
    }
  };

  const isGroupSelected = !!group;
  const Section = () => {
    return (
      <>
        <AddGroupSections
          register={register}
          control={control}
          getValues={getValues}
          setValue={setValue}
          errors={errors}
          personalInfoTab={personalInfoTab}
          isGroupSelected={isGroupSelected}
          selectedGroup={group}
          currentTagFolders={currentTagFolders}
          currentOpenTags={currentOpenTags}
          setCurrentOpenTags={setCurrentOpenTags}
          initialValue={initialValue}
        />
        {group &&
          group.value &&
          personalInfoTab === AVAILABLE_PERSONAL_TABS.pipeline && (
            <AddPipeline
              availablePipeline={availablePipeline}
              buttonLoading={buttonLoading}
              setButtonLoading={setButtonLoading}
              register={register}
              control={control}
              getValues={getValues}
              setValue={setValue}
              errors={errors}
              initialValue={initialValue}
            />
          )}
      </>
    );
  };

  return (
    <UILoader blocking={loading}>
      <Form
        className='auth-login-form'
        onSubmit={handleSubmit(onSubmit)}
        autoComplete='off'
      >
        <div className='contact-personalInfo-wrapper'>
          <div className='vertical-tab-mobile-overllay'></div>
          <div className='vertical-tab-wrapper'>
            <span className='mobile-close-btn'></span>
            <div className='inner-scroll-wrapper hide-scrollbar'>
              <div
                className={`vertical-tab-item ${
                  personalInfoTab === AVAILABLE_PERSONAL_TABS.personal_info &&
                  'active'
                }`}
                onClick={() => {
                  setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.personal_info);
                }}
              >
                Personal Info
              </div>
              <div
                className={`vertical-tab-item ${
                  personalInfoTab === AVAILABLE_PERSONAL_TABS.event && 'active'
                }`}
                onClick={() => {
                  setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.event);
                }}
              >
                Events
              </div>
              <div
                className={`vertical-tab-item ${
                  personalInfoTab === AVAILABLE_PERSONAL_TABS.groups && 'active'
                }`}
                onClick={() => {
                  setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.groups);
                }}
              >
                Groups
              </div>
              {group && group.value && (
                <>
                  <div
                    className={`vertical-tab-item ${
                      personalInfoTab === AVAILABLE_PERSONAL_TABS.category &&
                      'active'
                    }`}
                    onClick={() => {
                      setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.category);
                    }}
                  >
                    Category
                  </div>
                  <div
                    className={`vertical-tab-item ${
                      personalInfoTab === AVAILABLE_PERSONAL_TABS.status &&
                      'active'
                    }`}
                    onClick={() => {
                      setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.status);
                    }}
                  >
                    Status
                  </div>
                  <div
                    className={`vertical-tab-item ${
                      personalInfoTab === AVAILABLE_PERSONAL_TABS.tags &&
                      'active'
                    }`}
                    onClick={() => {
                      setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.tags);
                    }}
                  >
                    Tags
                  </div>
                  <div
                    className={`vertical-tab-item ${
                      personalInfoTab === AVAILABLE_PERSONAL_TABS.pipeline &&
                      'active'
                    }`}
                    onClick={() => {
                      setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.pipeline);
                    }}
                  >
                    Pipeline
                  </div>
                </>
              )}
              <div
                className={`vertical-tab-item ${
                  personalInfoTab === AVAILABLE_PERSONAL_TABS.custom_field &&
                  'active'
                }`}
                onClick={() => {
                  setPersonalInfoTab(AVAILABLE_PERSONAL_TABS.custom_field);
                }}
              >
                Custom Fields
              </div>
            </div>
          </div>
          <div className='right-tabContant-wrapper'>
            <div className='contact-create-new-viewport-scroll hide-scrollbar'>
              {personalInfoTab === AVAILABLE_PERSONAL_TABS.personal_info && (
                <>
                  <FunnelView
                    availableGroups={groups}
                    control={control}
                    handleGroupChange={handleGroupChange}
                    getValues={getValues}
                    setValue={setValue}
                    groupChangeLoading={groupChangeLoading}
                  />
                  <PersonalInfo
                    fileUploadURL={fileUploadURL}
                    errors={errors}
                    control={control}
                    userProfileUpload={userProfileUpload}
                    handleImageReset={handleImageReset}
                    imageUploading={imageUploading}
                    setValue={setValue}
                    getValues={getValues}
                    params={params}
                    updateUnsubscribeStatus={updateUnsubscribeStatus}
                    register={register}
                    canUpdateBilling={canUpdateBilling}
                    enableBilling={enableBilling}
                    updateBillingStatus={updateBillingStatus}
                    initialValue={initialValue}
                    setError={setError}
                  />
                  {group && group.value && (
                    <AddGroupTags
                      getValues={getValues}
                      setValue={setValue}
                      control={control}
                      errors={errors}
                      showHistory={false}
                      selectedGroup={group}
                      initialValue={initialValue}
                    />
                  )}
                </>
              )}
              {personalInfoTab === AVAILABLE_PERSONAL_TABS.event &&
                params.id &&
                params.id !== 'add' &&
                !isModal && <Events isModal={isModal} reset={reset} />}

              {personalInfoTab === AVAILABLE_PERSONAL_TABS.groups && (
                <AddGroups
                  groups={groups}
                  handleGroupChange={handleGroupChange}
                  errors={errors}
                  control={control}
                  initialValue={initialValue}
                  getValues={getValues}
                />
              )}
              <Section />
            </div>
            {!isModal && (
              <div className='d-flex align-items-center justify-content-center fixed-button-wrapper'>
                <SaveButton
                  disabled={groupChangeLoading}
                  width='230px'
                  className='align-items-center justify-content-center'
                  type='submit'
                  loading={buttonLoading.submitLoading}
                  name={
                    params.id !== 'add' ? 'Update Contact' : 'Create Contact'
                  }
                ></SaveButton>
              </div>
            )}
          </div>
        </div>
      </Form>
    </UILoader>
  );
};

export default ContactForm;
