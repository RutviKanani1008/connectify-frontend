import { Col, Input, Row } from 'reactstrap';
import CustomSelect from '../../../../../@core/components/form-fields/CustomSelect';
import { useCallback, useState } from 'react';
import _ from 'lodash';
const MassContactFilter = ({
  currentFilter,
  filterValue,
  handleChangeFilter,
  setCurrentFilter,
}) => {
  const [advanceFiltersVisible, setAdvanceFiltersVisible] = useState(false);
  const debounceFn = useCallback(
    _.debounce(async (search) => {
      setCurrentFilter((prev) => ({ ...prev, search, page: 1 }));
    }, 300),
    []
  );

  const handleFilter = (e) => {
    const value = e.target.value;
    debounceFn(value);
  };

  const getFilterValue = (key) => {
    return (
      filterValue?.[key]?.find(
        (grp) =>
          grp.id === currentFilter?.[key] ||
          grp.options?.find((el) => {
            if (key === 'pipeline') return el.id === currentFilter?.[key]?.id;
            else if (key === 'tags')
              return currentFilter?.[key]?.includes(el.id);
            else return currentFilter?.[key]?.includes(el.id);
          })
      ) || null
    );
  };

  return (
    <>
      <div className='contact-filter-heading'>
        <h3 className='sec-title'>Contact's Filters</h3>
        <div className='search-box-wrapper'>
          <div className='form-element-icon-wrapper'>
            <svg version='1.1' id='Layer_1' x='0px' y='0px' viewBox='0 0 56 56'>
              <path
                style={{ fill: '#acacac' }}
                d='M52.8,49.8c-4-4.1-7.9-8.2-11.9-12.4c-0.2-0.2-0.5-0.5-0.7-0.8c2.5-3,4.1-6.4,4.8-10.2c0.7-3.8,0.4-7.6-1-11.2
c-1.3-3.6-3.5-6.7-6.5-9.2C29.4-0.8,17.8-0.9,9.6,5.9C1,13.1-0.8,25.3,5.4,34.7c2.9,4.3,6.8,7.3,11.8,8.8c6.7,2,13,0.9,18.8-3
c0.1,0.2,0.3,0.3,0.4,0.4c3.9,4.1,7.9,8.2,11.8,12.3c0.7,0.7,1.3,1.3,2.2,1.6h1.1c0.5-0.3,1.1-0.5,1.5-0.9
C54.1,52.8,54,51.1,52.8,49.8z M23.5,38.7c-8.8,0-16.1-7.2-16.1-16.1c0-8.9,7.2-16.1,16.1-16.1c8.9,0,16.1,7.2,16.1,16.1
C39.6,31.5,32.4,38.7,23.5,38.7z'
              />
            </svg>
            <Input
              type='text'
              bsSize='sm'
              placeholder='Search'
              id='search-input'
              onChange={handleFilter}
            />
          </div>
        </div>
        <button
          type='button'
          onClick={() => setAdvanceFiltersVisible(!advanceFiltersVisible)}
          className='more-filter-btn'
        >
          <span>More</span> Filters
        </button>
      </div>
      {advanceFiltersVisible ? (
        <div className='filter-fields-wrapper'>
          <Row>
            <Col lg='3' md='4' sm='6' className='field-col mb-1'>
              <CustomSelect
                isMulti
                width={'100%'}
                classNamePrefix='custom-select'
                value={filterValue.group.find(
                  (obj) => obj.id === currentFilter.group
                )}
                customStylesOptions={{
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'white',
                  }),
                }}
                options={filterValue.group}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'group');
                }}
                label='Filter by Group'
              />
            </Col>
            <Col lg='3' md='4' sm='6' className='field-col mb-1'>
              <CustomSelect
                width={'100%'}
                classNamePrefix='custom-select'
                // value={filterValue.category.find(
                //   (obj) => obj.id === currentFilter.category
                // )}
                value={getFilterValue('category')}
                customStylesOptions={{
                  groupHeading: (base) => ({
                    ...base,
                    color: 'black',
                    margin: 0,
                    fontWeight: 'bold',
                  }),
                }}
                options={filterValue.category}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'category');
                }}
                label='Filter by Category'
              />
            </Col>
            <Col lg='3' md='4' sm='6' className='field-col mb-1'>
              <CustomSelect
                width={'100%'}
                classNamePrefix='custom-select'
                // value={filterValue.status.find(
                //   (obj) => obj.id === currentFilter.status
                // )}
                value={getFilterValue('status')}
                customStylesOptions={{
                  groupHeading: (base) => ({
                    ...base,
                    color: 'black',
                    margin: 0,
                    fontWeight: 'bold',
                  }),
                }}
                options={filterValue.status}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'status');
                }}
                label='Filter by Status'
              />
            </Col>
            <Col lg='3' md='4' sm='6' className='field-col mb-1'>
              <CustomSelect
                width={'100%'}
                classNamePrefix='custom-select'
                // value={filterValue.tags.find((obj) => obj.id === currentFilter.tags)}
                value={getFilterValue('tags')}
                options={filterValue.tags}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'tags');
                }}
                customStylesOptions={{
                  groupHeading: (base) => ({
                    ...base,
                    color: 'black',
                    margin: 0,
                    fontWeight: 'bold',
                  }),
                }}
                label='Filter by Tags'
              />
            </Col>
            <Col lg='3' md='4' sm='6' className='field-col mb-1'>
              <CustomSelect
                width={'100%'}
                classNamePrefix='custom-select'
                // value={filterValue.pipeline.find(
                //   (obj) => obj.id === currentFilter.pipeline
                // )}
                value={getFilterValue('pipeline')}
                customStylesOptions={{
                  groupHeading: (base) => ({
                    ...base,
                    color: 'black',
                    margin: 0,
                    fontWeight: 'bold',
                  }),
                }}
                options={filterValue.pipeline}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'pipeline');
                }}
                label='Filter by Pipeline'
              />
            </Col>
            {currentFilter?.pipeline &&
              currentFilter?.pipeline?.id !== 'UnassignedItem' && (
                <Col lg='3' md='4' sm='6' className='field-col mb-1'>
                  <CustomSelect
                    width={'100%'}
                    classNamePrefix='custom-select'
                    value={currentFilter?.pipeline?.stages?.find(
                      (obj) => obj.id === currentFilter.stage
                    )}
                    options={currentFilter?.pipeline?.stages || []}
                    isClearable={true}
                    onChange={(e) => {
                      handleChangeFilter(e, 'stage');
                    }}
                    label='Filter by Stage'
                  />
                </Col>
              )}
          </Row>
        </div>
      ) : null}
    </>
  );
};

export default MassContactFilter;
