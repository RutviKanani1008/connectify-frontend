import { Badge, UncontrolledTooltip } from 'reactstrap';
import CustomSelect from '../../../../@core/components/form-fields/CustomSelect';
import { ArchiveActiveAndUnsubscribeTab } from '../../../../@core/components/miniComponents/ArchiveAndActiveTab';
import { Filter } from 'react-feather';
import { useEffect, useState } from 'react';
import _ from 'lodash';

const ContactFilter = ({
  currentTab,
  groupOptions,
  selectedGroup,
  tableRef,
  setCurrentTab,
  handleGroupChange,
  relatedGroupOptions,
  setCurrentFilter,
  currentFilter,
  updateCurrentGroup,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterCount, setFilterCount] = useState({});

  useEffect(() => {
    if (updateCurrentGroup) {
      setFilterCount({});
    }
  }, [updateCurrentGroup]);

  const handleFilterCount = (value, type) => {
    if (value && (!_.isArray(value) || (_.isArray(value) && value.length))) {
      setFilterCount({ ...filterCount, [type]: true });
    } else {
      const tempFilterCount = { ...filterCount };
      if (tempFilterCount[type]) {
        delete tempFilterCount[type];
      }
      setFilterCount(tempFilterCount);
    }
  };

  return (
    <>
      <div
        className='d-flex align-items-center right-filter-wrapper'
        onMouseLeave={() => {
          if (dropdownOpen) {
            setDropdownOpen(!dropdownOpen);
          }
        }}
      >
        <div className='contact-list-all-filter-wrapper'>
          <CustomSelect
            width={200}
            classNamePrefix='custom-select'
            options={groupOptions}
            value={selectedGroup}
            isClearable={true}
            onChange={(e) => {
              handleGroupChange(e);
            }}
            label='Filter by Group'
          />
          {/* new html */}
          <div
            className={`selects-custom-dropdown-wrapper contact-list-taskFilter ${
              !selectedGroup || selectedGroup?.value === 'unAssigned'
                ? 'cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <div
              className='icon_wrapper'
              onMouseOver={() => {
                if (
                  !(selectedGroup?.value === 'unAssigned' || !selectedGroup) &&
                  !dropdownOpen
                ) {
                  setDropdownOpen(!dropdownOpen);
                }
              }}
            >
              <Filter
                className={`${
                  (!selectedGroup || selectedGroup?.value === 'unAssigned') &&
                  'cursor-not-allowed'
                }`}
                id='task_filter'
              />
              {!!Object.keys(filterCount).length && (
                <Badge
                  pill
                  color='danger'
                  className='badge-up task__filter__count'
                >
                  {Object.keys(filterCount).length}
                </Badge>
              )}
              <UncontrolledTooltip placement='top' target='task_filter'>
                Filter
              </UncontrolledTooltip>
            </div>
            <div
              style={{ display: dropdownOpen ? 'inline' : 'none' }}
              disabled={selectedGroup?.value === 'unAssigned' || !selectedGroup}
              className={`selects-custom-dropdown ${
                (!selectedGroup || selectedGroup?.value === 'unAssigned') &&
                'cursor-not-allowed'
              }`}
            >
              <div className='selects-custom-dropdown'>
                <div className='inner-wrapper fancy-scrollbar'>
                  <div className='selects-custom-dropdown-item'>
                    <CustomSelect
                      menuPlacement='bottom'
                      menuPosition='fixed'
                      value={
                        relatedGroupOptions?.category?.find(
                          (obj) => obj.id === currentFilter?.category
                        ) || null
                      }
                      width={200}
                      classNamePrefix='custom-select'
                      options={relatedGroupOptions.category}
                      isClearable={true}
                      onChange={(category) => {
                        handleFilterCount(category, 'category');
                        setCurrentFilter({
                          ...currentFilter,
                          category: category?.id || null,
                        });
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
                          (obj) => obj.id === currentFilter?.status
                        ) || null
                      }
                      width={200}
                      classNamePrefix='custom-select'
                      options={relatedGroupOptions.status}
                      isClearable={true}
                      onChange={(status) => {
                        handleFilterCount(status, 'groupStatus');
                        setCurrentFilter({
                          ...currentFilter,
                          status: status?.id || null,
                        });
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
                      classNamePrefix='custom-select'
                      isMulti
                      width={200}
                      options={relatedGroupOptions.tags}
                      isClearable={true}
                      onChange={(tags) => {
                        handleFilterCount(
                          tags?.map((tag) => tag.id) || [],
                          'tags'
                        );
                        setCurrentFilter({
                          ...currentFilter,
                          tags: tags?.map((tag) => tag.id) || [],
                        });
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
                      width={200}
                      classNamePrefix='custom-select'
                      options={relatedGroupOptions.pipeline}
                      isClearable={true}
                      onChange={(pipeline) => {
                        handleFilterCount(pipeline, 'pipeline');
                        setCurrentFilter({
                          ...currentFilter,
                          pipeline: pipeline?.id || null,
                        });
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
                            (pipeline) =>
                              pipeline.id === currentFilter?.pipeline
                          )?.stages || []
                        )?.find((obj) => obj.id === currentFilter?.stage) ||
                        null
                      }
                      width={200}
                      classNamePrefix='custom-select'
                      options={
                        relatedGroupOptions.pipeline?.find(
                          (pipeline) => pipeline.id === currentFilter?.pipeline
                        )?.stages || []
                      }
                      isClearable={true}
                      onChange={(stage) => {
                        handleFilterCount(stage, 'pipelineStage');
                        setCurrentFilter({
                          ...currentFilter,
                          stage: stage?.id || null,
                        });
                      }}
                      label='Filter by Stage'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* new html end */}

          <div className='contact-list-horizontal-tab'>
            <ArchiveActiveAndUnsubscribeTab
              tableRef={tableRef}
              currentGroup={selectedGroup}
              setCurrentTab={setCurrentTab}
              currentTab={currentTab}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactFilter;
