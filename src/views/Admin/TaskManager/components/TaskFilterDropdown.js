import { useState, useEffect } from 'react';
import { UncontrolledTooltip } from 'reactstrap';

import { Filter } from 'react-feather';
import CustomSelect from '../../../../@core/components/form-fields/CustomSelect';
import { TASK_SCHEDULER_TYPE } from '../../../../constant';
import _ from 'lodash';
import AsyncContactSelect from '../../billing/Quote/components/AsyncContactSelect';
import { selectThemeColors } from '../../../../utility/Utils';
import {
  contactOptionComponent,
  contactSingleValue,
} from '../../../forms/component/OptionComponent';
import { getContact } from '../../../../api/contacts';

const dropdownKeys = [
  'frequency',
  'contact',
  'contact',
  'assigned',
  'group',
  'groupStatus',
  'groupCategory',
  'tags',
  'pipeline',
  'pipelineStage',
];

const TaskFilterDropdown = ({
  currentFilter,
  setCurrentFilter,
  initialContactData,
  initialUserData,
  usersOptions,
  groupsOptions,
  relatedGroupOptions,
  setCurrentTaskPaginationMain,
}) => {
  const [filterCount, setFilterCount] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const [selectedContactOption, setSelectedContactOption] = useState();

  useEffect(() => {
    let updatedFilterCount = {};
    Object.entries(currentFilter).forEach(([key, value]) => {
      /* Exclude contact filter count from contact task manager */
      if (initialContactData && key === 'contact') return;
      if (initialUserData && key === 'assigned') return;

      if (dropdownKeys.includes(key)) {
        if (
          (!_.isArray(value) && value) ||
          (_.isArray(value) && value.length)
        ) {
          updatedFilterCount = { ...updatedFilterCount, [key]: true };
        }
      }
    });
    setFilterCount(updatedFilterCount);
  }, [initialContactData, initialUserData, currentFilter]);

  useEffect(() => {
    if (
      !initialContactData &&
      !initialUserData &&
      !selectedContactOption &&
      currentFilter?.contact
    ) {
      setInitialContact(currentFilter?.contact);
    }
  }, [
    initialContactData,
    initialUserData,
    currentFilter,
    selectedContactOption,
  ]);

  const setInitialContact = async (contactId) => {
    const res = await getContact(contactId);
    if (res.data?.response_type === 'success' && res.data.data) {
      const contact = res.data.data;
      const selectedOpt = {
        label:
          `${contact.firstName} ${contact.lastName}`.trim() || contact.email,
        value: contact._id,
        isEnableBilling: contact?.enableBilling || false,
      };
      setSelectedContactOption(selectedOpt);
    }
  };

  return (
    <>
      {/* new html */}
      <div
        className='selects-custom-dropdown-wrapper'
        onMouseLeave={() => {
          if (dropdownOpen) {
            toggleDropdown();
          }
        }}
      >
        <div
          className='icon_wrapper'
          // HELLO-D
          // tag='div'
          // caret
          onMouseOver={() => {
            if (!dropdownOpen) {
              toggleDropdown();
            }
          }}
          id='task_filter'
        >
          <Filter className='cursor-pointer' />
        </div>
        <UncontrolledTooltip placement='top' target='task_filter'>
          Filter
        </UncontrolledTooltip>
        <div
          style={{ display: dropdownOpen ? 'inline' : 'none' }}
          className='selects-custom-dropdown'
          // HELLO-D
          // container='body'
        >
          <div className='inner-wrapper fancy-scrollbar'>
            <div className='selects-custom-dropdown-item'>
              <CustomSelect
                menuPlacement='bottom'
                menuPosition='fixed'
                value={
                  TASK_SCHEDULER_TYPE.find(
                    (obj) => obj.value === currentFilter?.frequency
                  ) || null
                }
                width={200}
                classNamePrefix='custom-select'
                options={TASK_SCHEDULER_TYPE}
                isClearable={true}
                onChange={(freq) => {
                  // handleFilterCount(freq, 'frequency');
                  setCurrentFilter({
                    ...currentFilter,
                    frequency: freq?.value || null,
                    page: 1,
                  });
                  setCurrentTaskPaginationMain({
                    page: 1,
                    loadMore: true,
                    pagination: null,
                  });
                  toggleDropdown();
                }}
                label='Filter by Frequency'
              />
            </div>
            {!initialContactData?._id && (
              <>
                <div className='selects-custom-dropdown-item'>
                  <AsyncContactSelect
                    menuPlacement='bottom'
                    menuPosition='fixed'
                    styles={{
                      singleValue: (base) => ({
                        ...base,
                        display: 'flex',
                        alignItems: 'center',
                      }),
                    }}
                    isClearable
                    id='contact'
                    name='contact'
                    placeholder='Select contact'
                    theme={selectThemeColors}
                    className='react-select'
                    classNamePrefix='custom-select'
                    onChange={(contact) => {
                      setCurrentFilter({
                        ...currentFilter,
                        contact: contact?.value || null,
                        page: 1,
                      });
                      setCurrentTaskPaginationMain({
                        page: 1,
                        loadMore: true,
                        pagination: null,
                      });
                      toggleDropdown();
                      setSelectedContactOption(contact);
                    }}
                    value={selectedContactOption}
                    components={{
                      Option: contactOptionComponent,
                      contactSingleValue,
                    }}
                  />
                </div>
              </>
            )}
            {!initialUserData?._id && (
              <div className='selects-custom-dropdown-item'>
                <CustomSelect
                  menuPlacement='bottom'
                  menuPosition='fixed'
                  value={
                    usersOptions.data.find(
                      (obj) => obj.value === currentFilter?.assigned
                    ) || null
                  }
                  loading={usersOptions.loading}
                  width={200}
                  classNamePrefix='custom-select'
                  options={usersOptions.data}
                  isClearable={true}
                  onChange={(user) => {
                    // handleFilterCount(user, 'assignee');
                    setCurrentFilter({
                      ...currentFilter,
                      assigned: user?.value || null,
                      page: 1,
                    });
                    setCurrentTaskPaginationMain({
                      page: 1,
                      loadMore: true,
                      pagination: null,
                    });
                    toggleDropdown();
                  }}
                  label='Filter by Assign user'
                />
              </div>
            )}
            {!initialContactData?._id && !initialUserData._id ? (
              <>
                <div className='heading'>Segmentation Filter</div>
                <div className='selects-custom-dropdown-item'>
                  <CustomSelect
                    menuPlacement='bottom'
                    menuPosition='fixed'
                    value={
                      groupsOptions.data.find(
                        (obj) => obj.value === currentFilter?.group
                      ) || null
                    }
                    loading={groupsOptions.loading}
                    width={200}
                    classNamePrefix='custom-select'
                    options={groupsOptions.data}
                    isClearable={true}
                    onChange={(user) => {
                      setCurrentFilter({
                        ...currentFilter,
                        group: user?.value || null,
                        page: 1,
                      });
                      setCurrentTaskPaginationMain({
                        page: 1,
                        loadMore: true,
                        pagination: null,
                      });
                      toggleDropdown();
                    }}
                    label='Filter by Group'
                  />
                </div>
                <div className='selects-custom-dropdown-item'>
                  <CustomSelect
                    menuPlacement='bottom'
                    menuPosition='fixed'
                    value={
                      relatedGroupOptions?.category?.find(
                        (obj) => obj.id === currentFilter?.groupCategory
                      ) || null
                    }
                    // loading={groupsOptions.loading}
                    width={200}
                    classNamePrefix='custom-select'
                    options={relatedGroupOptions.category}
                    isClearable={true}
                    onChange={(category) => {
                      setCurrentFilter({
                        ...currentFilter,
                        groupCategory: category?.id || null,
                        page: 1,
                      });
                      setCurrentTaskPaginationMain({
                        page: 1,
                        loadMore: true,
                        pagination: null,
                      });
                      toggleDropdown();
                    }}
                    label='Filter by category'
                  />
                </div>
                <div className='selects-custom-dropdown-item'>
                  <CustomSelect
                    menuPlacement='bottom'
                    menuPosition='fixed'
                    value={
                      relatedGroupOptions.status?.find(
                        (obj) => obj.id === currentFilter?.groupStatus
                      ) || null
                    }
                    // loading={groupsOptions.loading}
                    width={200}
                    classNamePrefix='custom-select'
                    options={relatedGroupOptions.status}
                    isClearable={true}
                    onChange={(status) => {
                      // handleFilterCount(status, 'groupStatus');
                      setCurrentFilter({
                        ...currentFilter,
                        groupStatus: status?.id || null,
                        page: 1,
                      });
                      setCurrentTaskPaginationMain({
                        page: 1,
                        loadMore: true,
                        pagination: null,
                      });
                      toggleDropdown();
                    }}
                    label='Filter by Status'
                  />
                </div>
                <div className='selects-custom-dropdown-item'>
                  <CustomSelect
                    menuPlacement='bottom'
                    menuPosition='fixed'
                    value={
                      relatedGroupOptions?.tags?.filter((obj) =>
                        currentFilter?.tags?.includes(obj.id)
                      ) || []
                    }
                    isMulti
                    // loading={groupsOptions.loading}
                    classNamePrefix='custom-select'
                    width={200}
                    options={relatedGroupOptions.tags}
                    isClearable={true}
                    onChange={(tags) => {
                      // handleFilterCount(tags?.map((tag) => tag.id) || [], 'tags');
                      setCurrentFilter({
                        ...currentFilter,
                        tags: tags?.map((tag) => tag.id) || [],
                        page: 1,
                      });
                      setCurrentTaskPaginationMain({
                        page: 1,
                        loadMore: true,
                        pagination: null,
                      });
                      toggleDropdown();
                    }}
                    label='Filter by Tag'
                  />
                </div>
                <div className='selects-custom-dropdown-item'>
                  <CustomSelect
                    menuPlacement='bottom'
                    menuPosition='fixed'
                    value={
                      relatedGroupOptions?.pipeline?.find(
                        (obj) => obj.id === currentFilter?.pipeline
                      ) || null
                    }
                    // loading={groupsOptions.loading}
                    width={200}
                    classNamePrefix='custom-select'
                    options={relatedGroupOptions.pipeline}
                    isClearable={true}
                    onChange={(pipeline) => {
                      // handleFilterCount(pipeline, 'pipeline');
                      setCurrentFilter({
                        ...currentFilter,
                        pipeline: pipeline?.id || null,
                        page: 1,
                      });
                      setCurrentTaskPaginationMain({
                        page: 1,
                        loadMore: true,
                        pagination: null,
                      });
                      toggleDropdown();
                    }}
                    label='Filter by Pipeline'
                  />
                </div>
                <div className='selects-custom-dropdown-item'>
                  <CustomSelect
                    menuPlacement='bottom'
                    menuPosition='fixed'
                    value={
                      (
                        relatedGroupOptions.pipeline?.find(
                          (pipeline) => pipeline.id === currentFilter?.pipeline
                        )?.stages || []
                      )?.find(
                        (obj) => obj.id === currentFilter?.pipelineStage
                      ) || null
                    }
                    // loading={groupsOptions.loading}
                    width={200}
                    classNamePrefix='custom-select'
                    options={
                      relatedGroupOptions.pipeline?.find(
                        (pipeline) => pipeline.id === currentFilter?.pipeline
                      )?.stages || []
                    }
                    isClearable={true}
                    onChange={(stage) => {
                      // handleFilterCount(stage, 'pipelineStage');
                      setCurrentFilter({
                        ...currentFilter,
                        pipelineStage: stage?.id || null,
                        page: 1,
                      });
                      setCurrentTaskPaginationMain({
                        page: 1,
                        loadMore: true,
                        pagination: null,
                      });
                      toggleDropdown();
                    }}
                    label='Filter by Stage'
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
        {!!Object.keys(filterCount).length && (
          <div className='task__filter__count'>
            {Object.keys(filterCount).length}
          </div>
        )}
      </div>
      {/* new html end */}
    </>
  );
};

export default TaskFilterDropdown;
