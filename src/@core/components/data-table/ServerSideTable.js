// ** React Imports
import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';

// ** Third Party Components
import Select from 'react-select';
import ReactPaginate from 'react-paginate';
import DataTable from 'react-data-table-component';
import UILoader from '@components/ui-loader';
import _ from 'lodash';
import { ChevronDown } from 'react-feather';

// ** Reactstrap Imports
import { Col, Card, Input, CardBody } from 'reactstrap';
import { PAGINATION_LIMIT_OPTIONS } from '../../../constant/table.constant';
import { selectThemeColors } from '../../../utility/Utils';
import NoRecordFound from './NoRecordFound';
import TableLoader from './TableLoader';

// ** Bootstrap Checkbox Component
const BootstrapCheckbox = React.forwardRef((props, ref) => (
  <div className='form-check'>
    <Input type='checkbox' ref={ref} {...props} />
  </div>
));
BootstrapCheckbox.displayName = 'BootstrapCheckbox';

const ServerSideTable = forwardRef(
  (
    {
      header = false,
      columns,
      data,
      itemsPerPage,
      initialTableFilters = {},
      selectableRows = false,
      showPagination = true,
      showSearch = true,
      blocking = false,
      getRecord,
      selectedRow = [],
      setSelectedRow = () => {},
      unselectedRows = [],
      setUnselectedRows = () => {},
      setIsSelectedTotalData = () => {},
      isSelectedTotalData,
      loading = false,
      extraMessage,
      filters = false,
      searchPlaceholder,
      initialDataFetch = true,
      cardClass = '',
    },
    ref
  ) => {
    // ** States
    const initialFilter = {
      page: 1,
      limit: 10,
      search: '',
      sort: '',
      ...initialTableFilters,
    };
    const [filter, setFilter] = useState(initialFilter);
    const [dataFetchEnable, setDataFetchEnable] = useState(initialDataFetch);

    const isAllSelected = useMemo(() => {
      return data?.results?.every((d) =>
        selectedRow.map((r) => r?._id).includes(d?._id)
      );
    }, [selectedRow, data.results]);

    const selectedRowLength = useMemo(() => {
      if (!selectedRow.length) {
        return 0;
      }

      if (isSelectedTotalData) {
        return data.total - unselectedRows.length;
      }
      return selectedRow.length;
    }, [isSelectedTotalData, data.total, selectedRow, unselectedRows]);

    useEffect(() => {
      if (isSelectedTotalData && data.results?.length) {
        const updatedRow = data.results.filter((row) => {
          if (unselectedRows.map((u) => u._id).includes(row._id)) {
            return false;
          }
          return true;
        });

        setSelectedRow(updatedRow);
      }
    }, [data.results]);

    const memoColumn = useMemo(() => {
      if (selectableRows) {
        columns = [
          {
            name: (
              <div className='form-check'>
                <Input
                  checked={isAllSelected}
                  type='checkbox'
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRow((prev) => {
                        const updated = [...prev];
                        const prevIds = updated.map((data) => data?._id);
                        (data?.results || []).forEach((d) => {
                          if (!prevIds.includes(d?._id)) updated.push(d);
                        });
                        return updated;
                      });
                    } else {
                      setSelectedRow([]);
                      setIsSelectedTotalData(false);
                    }
                    setUnselectedRows([]);
                  }}
                />
              </div>
            ),
            cell: (row) => {
              return (
                <div className='form-check'>
                  <Input
                    checked={
                      selectedRow.find((obj) => obj._id === row._id) || false
                    }
                    type='checkbox'
                    onChange={(e) => {
                      const updatedSelectedRows = e.target.checked
                        ? [...selectedRow, row]
                        : selectedRow.filter((obj) => obj._id !== row._id);

                      setSelectedRow(updatedSelectedRows);

                      if (isSelectedTotalData) {
                        const updatedUnselectedRows = !e.target.checked
                          ? [...unselectedRows, row]
                          : unselectedRows.filter((obj) => obj._id !== row._id);

                        setUnselectedRows(updatedUnselectedRows);
                      }
                    }}
                  />
                </div>
              );
            },
          },
          ...columns,
        ];
      }

      return columns;
    }, [selectedRow, isSelectedTotalData, data.results]);

    // Handle all data filter
    useEffect(() => {
      if (dataFetchEnable) {
        getRecord(filter);
      }
    }, [filter]);

    useImperativeHandle(ref, () => ({
      async refreshTable({ filterArgs = {}, reset = false }) {
        setSelectedRow([]);
        setUnselectedRows([]);
        setIsSelectedTotalData(false);
        setDataFetchEnable(true);

        let tempFilter = {};
        if (reset) {
          tempFilter = { ...initialFilter, ...filterArgs };
        } else {
          tempFilter = { ...filter, ...filterArgs };
        }
        if (_.isEqual(tempFilter, filter)) {
          getRecord(filter);
        } else {
          setFilter(tempFilter);
        }
      },
      selectedRowLength,
      resetSelectedRows,
      filter,
    }));

    function resetSelectedRows() {
      setSelectedRow([]);
      setUnselectedRows([]);
      setIsSelectedTotalData(false);
    }

    const debounceFn = useCallback(
      _.debounce(async (search) => {
        setFilter((prev) => ({
          ...prev,
          page: 1,
          search: search ? search.trim() : search,
        }));
      }, 300),
      []
    );

    const handleSearch = async (e) => {
      const value = e.target.value;
      await debounceFn(value);
      resetSelectedRows();
      setIsSelectedTotalData(false);
      setUnselectedRows([]);
    };

    const handlePageLimit = (limit) => {
      setFilter((pre) => ({ ...pre, limit, page: 1 }));
    };

    // ** Function to handle Pagination
    const handlePagination = (page) => {
      setFilter((prev) => ({ ...prev, page: page.selected + 1 }));
    };

    // ** Custom Pagination
    const CustomPagination = () => (
      <div className='d-flex align-items-center justify-content-between rdt_Table_footer'>
        <ReactPaginate
          previousLabel=''
          nextLabel=''
          forcePage={filter.page - 1}
          onPageChange={handlePagination}
          pageCount={Math.ceil(data.total / filter.limit) || 1}
          breakLabel='...'
          pageRangeDisplayed={2}
          marginPagesDisplayed={2}
          activeClassName='active'
          pageClassName='page-item'
          breakClassName='page-item'
          nextLinkClassName='page-link'
          pageLinkClassName='page-link'
          breakLinkClassName='page-link'
          previousLinkClassName='page-link'
          nextClassName='page-item next-item'
          previousClassName='page-item prev-item'
          containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pe-1 mt-1'
        />
        <div className='d-inline-flex align-items-center'>
          <div className='form-label form-label d-inline-flex'>
            Showing {filter.limit * (filter.page - 1) + 1} to{' '}
            {Math.min(filter.limit * filter.page, data.total)} of {data.total}
          </div>
          <div className='table__page__limit'>
            <Select
              className='me-1'
              menuPosition='fixed'
              defaultValue={
                PAGINATION_LIMIT_OPTIONS.find(
                  (obj) => obj.value === itemsPerPage
                ) || PAGINATION_LIMIT_OPTIONS[1]
              }
              value={PAGINATION_LIMIT_OPTIONS.find(
                (obj) => obj.value === filter.limit
              )}
              theme={selectThemeColors}
              classNamePrefix='table__page__limit'
              options={PAGINATION_LIMIT_OPTIONS}
              onChange={(e) => handlePageLimit(e.value)}
            />
          </div>
        </div>
      </div>
    );

    // ** Sort Column
    const handleSort = (e, sortDirection) => {
      setFilter((prev) => ({
        ...prev,
        sort: { [e.sortField]: sortDirection === 'asc' ? 1 : -1 },
        page: 1,
      }));
    };

    return (
      <Fragment>
        <Card className={`${cardClass ? cardClass : ''}`}>
          {header && header}
          <CardBody>
            <div className='rdt_Table_wrapper'>
              {extraMessage && (
                <Col>
                  <div className='rdt_Table_infobar'>
                    <div className='inner-cn'>{extraMessage}</div>
                  </div>
                </Col>
              )}
              {(selectedRow.length > 0 || isSelectedTotalData) && (
                <Col>
                  <div className='rdt_Table_infobar'>
                    <div className='inner-cn'>
                      {selectedRowLength} record selected.
                      {data.total !== selectedRowLength &&
                      (!isSelectedTotalData || unselectedRows.length) ? (
                        <>
                          Do you want to{' '}
                          <span
                            className='text-primary cursor-pointer'
                            onClick={() => {
                              setIsSelectedTotalData(true);
                              setSelectedRow(data.results);
                              setUnselectedRows([]);
                            }}
                          >
                            select all {data.total}
                          </span>{' '}
                          records ?
                        </>
                      ) : null}
                    </div>
                  </div>
                </Col>
              )}

              {showSearch ? (
                <div
                  className={`search-box-wrapper ${
                    filters && 'search-box-wrapper-contactList'
                  }`}
                >
                  <div className='form-element-icon-wrapper'>
                    <svg
                      version='1.1'
                      id='Layer_1'
                      x='0px'
                      y='0px'
                      viewBox='0 0 56 56'
                    >
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
                      className='dataTable-filter mb-50'
                      placeholder={
                        searchPlaceholder
                          ? searchPlaceholder
                          : 'Search user here...'
                      }
                      type='text'
                      bsSize='sm'
                      id='search-input'
                      onChange={handleSearch}
                    />
                  </div>
                  {filters && filters}
                </div>
              ) : (
                <></>
              )}
              <UILoader blocking={blocking}>
                <div className='react-dataTable'>
                  <DataTable
                    noHeader
                    noDataComponent={<NoRecordFound />}
                    sortServer
                    paginationServer
                    pagination={showPagination}
                    columns={memoColumn}
                    paginationPerPage={filter.limit}
                    className='react-dataTable'
                    sortIcon={<ChevronDown size={10} />}
                    paginationDefaultPage={filter.page + 1}
                    paginationComponent={CustomPagination}
                    data={data.results}
                    onSort={handleSort}
                    progressPending={loading}
                    progressComponent={<TableLoader />}
                  />
                </div>
              </UILoader>
            </div>
          </CardBody>
        </Card>
      </Fragment>
    );
  }
);

ServerSideTable.displayName = 'ServerSideTable';

export default ServerSideTable;
