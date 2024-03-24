/* eslint-disable no-tabs */
// ** React Imports
import React, { Fragment, useEffect, useState } from 'react';

// ** Third Party Components
import Select from 'react-select';
import ReactPaginate from 'react-paginate';
import DataTable from 'react-data-table-component';
import UILoader from '@components/ui-loader';
import {
  ChevronDown,
  Share,
  FileText,
  Plus,
  ArrowLeft,
  Trash,
  Edit,
} from 'react-feather';

export const caseInsensitiveSort = (rowA, rowB) => {
  const a = rowA?.toLowerCase();
  const b = rowB?.toLowerCase();

  if (a > b) {
    return 1;
  }

  if (b > a) {
    return -1;
  }

  return 0;
};

// ** Reactstrap Imports
import {
  // Row,
  Card,
  Input,
  // Label,
  Button,
  CardTitle,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledButtonDropdown,
  CardBody,
  UncontrolledTooltip,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
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

const ItemTable = ({
  columns,
  data,
  exportCSVData = false,
  title,
  addItemLink,
  itemsPerPage,
  buttonTitle,
  hideButton = false,
  addDisable = false,
  onClickAdd = false,
  childDropdown = null,
  hideExport = false,
  selectableRows = false,
  showBackButton = false,
  showCard = true,
  showHeader = true,
  archiveAndActiveTab = false,
  showImport = false,
  handelImportItem = false,
  handleDeleteMultiple = () => {},
  handleEditGroup = () => {},
  showPagination = true,
  showSearch = true,
  ExportData = false,
  blocking = false,
  loading = false,
  searchPlaceholder,
}) => {
  const history = useHistory();
  // ** States
  const [currentPage, setCurrentPage] = useState(0);
  const [perPageData, setPerPageData] = useState(5);
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedData, setSelectedRow] = useState([]);

  // ** Function to handle filter
  const handelAddNewItem = () => {
    if (onClickAdd) {
      onClickAdd();
    }
    if (addItemLink) {
      history.push(addItemLink);
    }
  };

  const handelImportItems = () => {
    if (handelImportItem) {
      handelImportItem();
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const handleFilter = () => {
    const value = searchValue;
    setCurrentPage(0);
    const filteredItems = data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filteredItems);
  };

  // archive and active time or search time handle pagination and filter
  useEffect(() => {
    handleFilter();
  }, [searchValue, archiveAndActiveTab]);

  // ** Function to handle Pagination
  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  useEffect(() => {
    if (itemsPerPage) {
      setPerPageData(itemsPerPage);
    }
  }, [itemsPerPage]);

  // ** Custom Pagination
  const CustomPagination = () => (
    <div className='d-flex align-items-center justify-content-between rdt_Table_footer'>
      <ReactPaginate
        previousLabel=''
        nextLabel=''
        forcePage={currentPage}
        onPageChange={handlePagination}
        pageCount={
          searchValue.length
            ? Math.ceil(filteredData.length / perPageData)
            : Math.ceil(data.length / perPageData) || 1
        }
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
      <div className='table__page__limit'>
        <Select
          className=''
          menuPosition='fixed'
          value={
            PAGINATION_LIMIT_OPTIONS.find(
              (page) => page.value === perPageData
            ) || PAGINATION_LIMIT_OPTIONS[0]
          }
          defaultValue={PAGINATION_LIMIT_OPTIONS[0]}
          theme={selectThemeColors}
          classNamePrefix='table__page__limit'
          options={PAGINATION_LIMIT_OPTIONS}
          onChange={(pageSize) => {
            setCurrentPage(0);
            setPerPageData(pageSize.value);
          }}
        />
      </div>
    </div>
  );

  // ** Converts table to CSV
  function convertArrayOfObjectsToCSV(array) {
    let result;
    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = Object.keys(array[0]).filter(
      (item) => item !== '__v' && item !== '_id'
    );
    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;
    array.forEach((item) => {
      let ctr = 0;
      keys.forEach((key) => {
        if (key !== '__v' && key !== '_id') {
          if (ctr > 0) result += columnDelimiter;
          result += item[key];
          ctr++;
        }
      });
      result += lineDelimiter;
    });
    return result;
  }

  // ** Downloads CSV
  function downloadCSV(array) {
    const link = document.createElement('a');
    let csv = convertArrayOfObjectsToCSV(array);
    if (csv === null) return;
    const filename = 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`;
    }
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    link.click();
  }

  const handleGoBack = () => {
    history.goBack();
  };

  // ** Sort Column
  const handleSort = () => {
    setCurrentPage(0);
  };

  return (
    <Fragment>
      {showCard ? (
        <>
          <Card className='rdt_Table_Card'>
            {showHeader && (
              <CardHeader className='card-header-with-buttons'>
                <CardTitle tag='h4' className='title'>
                  {showBackButton ? (
                    <>
                      <div className='px-1'>
                        <ArrowLeft
                          onClick={handleGoBack}
                          className='cursor-pointer me-1'
                          id={'goback'}
                        />
                        <UncontrolledTooltip placement='top' target={`goback`}>
                          Go Back
                        </UncontrolledTooltip>
                      </div>
                    </>
                  ) : null}
                  {title ? title : ''}
                </CardTitle>
                <div className='d-inline-flex justify-content-end'>
                  {childDropdown}
                  {archiveAndActiveTab && archiveAndActiveTab}
                  <div className='button-wrapper ms-1'>
                    {selectedData.length > 0 && (
                      <>
                        <Button
                          className='change-group-btn'
                          onClick={handleEditGroup}
                        >
                          <Edit size={15} />
                          <span className='align-middle ms-50'>
                            Change Group
                          </span>
                        </Button>
                        <Button
                          className='danger-btn'
                          color='danger'
                          onClick={() =>
                            handleDeleteMultiple(
                              selectedData.map((obj) => obj._id)
                            )
                          }
                        >
                          <Trash size={15} />
                          <span className='align-middle ms-50'>Delete</span>
                        </Button>
                      </>
                    )}
                    {showImport ? (
                      <>
                        <Button
                          className='import-btn'
                          color='secondary'
                          onClick={handelImportItems}
                        >
                          <Share size={15} />
                          <span className='align-middle ms-50'>Import</span>
                        </Button>
                      </>
                    ) : null}

                    {ExportData ? (
                      ExportData
                    ) : !hideExport ? (
                      <>
                        <div className='action-dropdown'>
                          <UncontrolledButtonDropdown>
                            <DropdownToggle color='secondary' caret outline>
                              <Share size={15} />
                              <span className='align-middle ms-50'>Export</span>
                            </DropdownToggle>
                            <DropdownMenu>
                              <DropdownItem
                                className='w-100'
                                onClick={() =>
                                  downloadCSV(
                                    exportCSVData ? exportCSVData : data
                                  )
                                }
                              >
                                <FileText size={15} />
                                <span className='align-middle ms-50'>
                                  Export to CSV
                                </span>
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledButtonDropdown>
                        </div>
                      </>
                    ) : null}

                    {!hideButton ? (
                      <>
                        <Button
                          className='add-btn'
                          color='primary'
                          onClick={handelAddNewItem}
                          disabled={addDisable}
                        >
                          <Plus size={15} />
                          <span className='align-middle ms-50'>
                            {buttonTitle}
                          </span>
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
            )}
            <CardBody>
              <div className='rdt_Table_wrapper'>
                {showSearch ? (
                  <div className='search-box-wrapper'>
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
                          searchPlaceholder ? searchPlaceholder : 'Search Users'
                        }
                        type='text'
                        bsSize='sm'
                        id='search-input'
                        value={searchValue}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <UILoader blocking={blocking}>
                  <div className='react-dataTable'>
                    <DataTable
                      key={`${perPageData}_${data.length}_${filteredData.length}`}
                      noHeader
                      onSelectedRowsChange={(e) => {
                        setSelectedRow(e.selectedRows);
                      }}
                      noDataComponent={<NoRecordFound />}
                      pagination={showPagination}
                      selectableRows={selectableRows}
                      columns={columns}
                      paginationPerPage={perPageData}
                      className='react-dataTable'
                      sortIcon={<ChevronDown size={10} />}
                      paginationDefaultPage={currentPage + 1}
                      paginationComponent={CustomPagination}
                      data={searchValue.length ? filteredData : data}
                      selectableRowsComponent={BootstrapCheckbox}
                      onSort={handleSort}
                      progressPending={loading}
                      progressComponent={<TableLoader />}
                    />
                  </div>
                </UILoader>
              </div>
            </CardBody>
          </Card>
        </>
      ) : (
        <>
          {showHeader && (
            <CardHeader className=''>
              <CardTitle tag='h4' className=''>
                <div className='d-flex'>
                  {showBackButton ? (
                    <>
                      <div className='px-1'>
                        <ArrowLeft
                          onClick={handleGoBack}
                          className='cursor-pointer me-1'
                          id={'goback'}
                        />
                        <UncontrolledTooltip placement='top' target={`goback`}>
                          Go Back
                        </UncontrolledTooltip>
                      </div>
                    </>
                  ) : null}
                  {title ? title : ''}
                </div>
              </CardTitle>
              <div className='d-flex mt-md-0 mt-1'>
                <div className='button-wrapper'>
                  <div className='btn-group' style={{ marginRight: '10px' }}>
                    {ExportData ? (
                      ExportData
                    ) : !hideExport ? (
                      <>
                        <UncontrolledButtonDropdown>
                          <DropdownToggle color='secondary' caret outline>
                            <Share size={15} />
                            <span className='align-middle ms-50'>Export</span>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem
                              className='w-100'
                              onClick={() =>
                                downloadCSV(
                                  exportCSVData ? exportCSVData : data
                                )
                              }
                            >
                              <FileText size={15} />
                              <span className='align-middle ms-50'>
                                Export to CSV
                              </span>
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledButtonDropdown>
                      </>
                    ) : null}
                  </div>

                  {!hideButton ? (
                    <>
                      <Button
                        className=''
                        color='primary'
                        onClick={handelAddNewItem}
                        disabled={addDisable}
                      >
                        <Plus size={15} />
                        <span className='align-middle ms-50'>
                          {buttonTitle}
                        </span>
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </CardHeader>
          )}
          <CardBody>
            <div className='rdt_Table_wrapper'>
              {showSearch ? (
                <>
                  {/* <Row className='justify-content-end mx-0'>
                  <div className='d-flex align-items-center item-table-search'>
                    <Label className='me-1' for='search-input'>
                      Searchbffdfdfdfd
                    </Label>
                    <Input
                      className='dataTable-filter mb-50'
                      type='text'
                      bsSize='sm'
                      id='search-input'
                      value={searchValue}
                      onChange={handleSearch}
                    />
                  </div>
                </Row> */}

                  <div className='search-box-wrapper'>
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
                          searchPlaceholder ? searchPlaceholder : 'Search Users'
                        }
                        type='text'
                        bsSize='sm'
                        id='search-input'
                        value={searchValue}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}

              <div className='react-dataTable'>
                <DataTable
                  key={`${perPageData}_${data.length}_${filteredData.length}`}
                  noHeader
                  noDataComponent={<NoRecordFound />}
                  pagination={showPagination}
                  selectableRows={selectableRows}
                  columns={columns}
                  paginationPerPage={perPageData}
                  className='react-dataTable'
                  sortIcon={<ChevronDown size={10} />}
                  paginationDefaultPage={currentPage + 1}
                  paginationComponent={CustomPagination}
                  data={searchValue.length ? filteredData : data}
                  selectableRowsComponent={BootstrapCheckbox}
                  onSort={handleSort}
                  progressPending={loading}
                  progressComponent={<TableLoader />}
                />
              </div>
            </div>
          </CardBody>
        </>
      )}
    </Fragment>
  );
};

export default ItemTable;
