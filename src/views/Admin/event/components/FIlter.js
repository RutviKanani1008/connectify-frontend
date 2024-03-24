import { Col, Input, Row } from 'reactstrap';
import CustomSelect from '../../../../@core/components/form-fields/CustomSelect';
import { useState } from 'react';

const Filter = ({
  currentFilter,
  filterValue,
  handleChangeFilter,
  setFilterContacts,
  contacts,
  mode,
  loading = false,
}) => {
  const [advanceFiltersVisible, setAdvanceFiltersVisible] = useState(false);
  const handleFilter = (e) => {
    const value = e.target.value;
    const normalContactSearch = contacts.filter((item) => {
      item = { name: `${item.firstName} ${item.lastName}`, email: item.email };
      return JSON.stringify(item).toLowerCase().includes(value.toLowerCase());
    });
    setFilterContacts(normalContactSearch);
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
            <Col md='4' sm='6' lg='3' className='mb-1 field-col'>
              <CustomSelect
                width={'100%'}
                isDisabled={loading}
                classNamePrefix='custom-select'
                value={currentFilter.group}
                options={filterValue.group}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'group');
                }}
                label='Filter by Group'
              />
            </Col>
            <Col md='4' sm='6' lg='3' className='mb-1 field-col'>
              <CustomSelect
                width={'100%'}
                isDisabled={loading}
                classNamePrefix='custom-select'
                value={currentFilter.category}
                options={filterValue.category}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'category');
                }}
                label='Filter by Category'
              />
            </Col>
            <Col md='4' sm='6' lg='3' className='mb-1 field-col'>
              <CustomSelect
                width={'100%'}
                isDisabled={loading}
                classNamePrefix='custom-select'
                value={currentFilter.status}
                options={filterValue.status}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'status');
                }}
                label='Filter by Status'
              />
            </Col>
            <Col md='4' sm='6' lg='3' className='mb-1 field-col'>
              <CustomSelect
                width={'100%'}
                isDisabled={loading}
                classNamePrefix='custom-select'
                value={currentFilter.tags}
                options={filterValue.tags}
                isClearable={true}
                onChange={(e) => {
                  handleChangeFilter(e, 'tags');
                }}
                label='Filter by Tags'
              />
            </Col>
            {currentFilter?.pipeline &&
              currentFilter?.pipeline?.id !== 'UnassignedItem' && (
                <Col md='4' sm='6' lg='3' className='mb-1 field-col'>
                  <CustomSelect
                    width={'100%'}
                    isDisabled={loading}
                    classNamePrefix='custom-select'
                    value={currentFilter.stage}
                    options={currentFilter?.pipeline?.stages || []}
                    isClearable={true}
                    onChange={(e) => {
                      handleChangeFilter(e, 'stage');
                    }}
                    label='Filter by Stage'
                  />
                </Col>
              )}
            <Col md='4' sm='6' lg='3' className='mb-1 field-col'>
              <CustomSelect
                width={'100%'}
                isDisabled={loading}
                classNamePrefix='custom-select'
                value={currentFilter.pipeline}
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
                <Col md='4' sm='6' lg='3' className='mb-1 field-col'>
                  <CustomSelect
                    width={'100%'}
                    isDisabled={loading}
                    classNamePrefix='custom-select'
                    value={currentFilter.stage}
                    options={currentFilter?.pipeline?.stages || []}
                    isClearable={true}
                    onChange={(e) => {
                      handleChangeFilter(e, 'stage');
                    }}
                    label='Filter by Stage'
                  />
                </Col>
              )}
            {mode === 'edit' && (
              <Col md='4' sm='6' lg='3' className='mb-1 field-col'>
                <CustomSelect
                  width={'100%'}
                  isDisabled={loading}
                  classNamePrefix='custom-select'
                  value={currentFilter.rsvp}
                  options={filterValue.rsvp}
                  isClearable={true}
                  onChange={(e) => {
                    handleChangeFilter(e, 'rsvp');
                  }}
                  label='Filter by RSVP'
                />
              </Col>
            )}
          </Row>
        </div>
      ) : null}
    </>
  );
};

export default Filter;
