// ** Reactstrap Imports
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Table,
  UncontrolledButtonDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import React, {
  Fragment,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import UILoader from '@components/ui-loader';
import _ from 'lodash';

// ** Third Party Components
import Select from 'react-select';
import ReactPaginate from 'react-paginate';
import { FileText, MoreVertical, Plus, Share } from 'react-feather';
import { PAGINATION_LIMIT_OPTIONS } from '../../../constant/table.constant';
import { selectThemeColors } from '../../../utility/Utils';
import NoRecordFound from './NoRecordFound';
import { ReactSortable } from 'react-sortablejs';

const SortableTable = forwardRef(
  (
    {
      isLoading,
      columns,
      data,
      onDragEnd,
      showHeader = true,
      title = false,
      hideButton = false,
      buttonTitle = false,
      onClickAdd = false,
      addItemLink = false,
      ExportData = false,
      hideExport = false,
      exportCSVData = false,
      itemsPerPage = 10,
      showSearch = true,
      searchPlaceholder,
      extraActions = null,
    },
    ref
  ) => {
    const history = useHistory();

    const [currentPage, setCurrentPage] = useState(0);
    const [perPageData, setPerPageData] = useState(5);
    const [filteredData, setFilteredData] = useState([]);
    const [sortableData, setSortableData] = useState([]);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
      if (_.isArray(data)) {
        setFilteredData(data);
      }
    }, [data]);

    const handelAddNewItem = () => {
      if (onClickAdd) {
        onClickAdd();
      }
      if (addItemLink) {
        history.push(addItemLink);
      }
    };

    const searchableColumns = columns.reduce((result, column) => {
      if (column.isSearchable) {
        result.push(column['searchKey']);
      }
      return result;
    }, []);

    const handleSearch = (e) => {
      const value = e.target.value;
      setSearchValue(value);
    };

    const handleFilter = () => {
      const value = searchValue;
      setCurrentPage(0);
      const filteredItems = value
        ? data.filter((item) => {
            return searchableColumns.some((column) => {
              return (
                Object.prototype.hasOwnProperty.call(item, column) &&
                item[column]
                  .toString()
                  .toLowerCase()
                  .includes(value.toLowerCase())
              );
            });
          })
        : data;
      if (_.isArray(filteredItems)) {
        setFilteredData(filteredItems);
      }
    };

    useEffect(() => {
      handleFilter();
    }, [searchValue]);

    const handleMove = (event) => {
      const relatedItemIsNotDraggable =
        event.related.getAttribute('item-non-draggable') === 'true'
          ? true
          : false;

      if (relatedItemIsNotDraggable) {
        return false; // Prevent moving to or from non-draggable items
      }
      return true;
    };

    // ** Function to handle Pagination
    const handlePagination = (page) => {
      setCurrentPage(page.selected);
    };

    useEffect(() => {
      if (itemsPerPage) {
        setPerPageData(itemsPerPage);
      }
    }, [itemsPerPage]);

    useImperativeHandle(ref, () => ({
      updateFilteredData: (newDataList) => {
        setSortableData([...newDataList]);
      },
    }));

    // ** Custom Pagination
    const CustomPagination = () => (
      <div className='rdt_Table_footer'>
        <ReactPaginate
          previousLabel=''
          nextLabel=''
          forcePage={currentPage}
          onPageChange={handlePagination}
          pageCount={
            searchValue.length
              ? Math.ceil(filteredData.length / perPageData) || 1
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

    const startIndex = currentPage * perPageData;
    const endIndex = startIndex + perPageData;

    useEffect(() => {
      const data = _.cloneDeep(filteredData);
      setSortableData(_.isArray(data) ? data.slice(startIndex, endIndex) : []);
    }, [startIndex, endIndex, filteredData]);

    return (
      <Fragment>
        {' '}
        <UILoader blocking={isLoading}>
          <Card className='cn-mgct-status-tags-cf-wrapper'>
            {showHeader && (
              <CardHeader className=''>
                <CardTitle tag='h4' className='left-title'>
                  <div className='d-flex'>
                    <>
                      <div
                        className='back-arrow'
                        id={'goback'}
                        onClick={handleGoBack}
                      ></div>
                      <UncontrolledTooltip placement='top' target={`goback`}>
                        Go Back
                      </UncontrolledTooltip>
                    </>
                    {title ? title : ''}
                  </div>
                </CardTitle>
                <div className='d-flex right-wrapper'>
                  <div className='button-wrapper'>
                    <div className='btn-group' style={{ marginRight: '10px' }}>
                      {extraActions}
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
              <div className='rdt_Table_wrapper loyal-table-new'>
                {showSearch && (
                  <>
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
                            searchPlaceholder ? searchPlaceholder : 'Search'
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
                )}
                <div className='react-dataTable'>
                  <div className='outer-table-responsive-wrapper'>
                    <div className='table-responsive'>
                      <Table>
                        <thead>
                          <tr>
                            <th scope='col' className='text-nowrap'>
                              #
                            </th>
                            {columns && columns.length > 0
                              ? columns.map((column, index) => (
                                  <th
                                    scope='col'
                                    className='text-nowrap'
                                    key={index}
                                  >
                                    {column.name}
                                  </th>
                                ))
                              : null}
                          </tr>
                        </thead>
                        {sortableData.length ? (
                          <ReactSortable
                            tag={'tbody'}
                            style={{ width: '100%' }}
                            list={sortableData}
                            setList={setSortableData}
                            onEnd={(e) => onDragEnd(e, sortableData)}
                            filter={'.non-draggable'}
                            onMove={handleMove}
                          >
                            {sortableData.map((row, index) => (
                              <tr
                                key={index}
                                className={`${
                                  row.isNotDraggable ? 'non-draggable' : ''
                                }`}
                                // HELLO-D
                                // item-non-draggable={
                                //   row.isNotDraggable ? 'true' : 'false'
                                // }
                                // item-id={row._id}
                              >
                                <td className='text-nowrap'>
                                  {row.isNotDraggable ? null : (
                                    <div className='drag-icon-wrapper'>
                                      <MoreVertical className='drag-icon' />
                                      <MoreVertical className='drag-icon' />
                                    </div>
                                  )}
                                </td>
                                {columns.map((column, index) => (
                                  <td className='text-nowrap' key={index}>
                                    {column?.cell?.(row) ||
                                      column?.selector?.(row)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </ReactSortable>
                        ) : (
                          <></>
                        )}
                      </Table>
                      {!sortableData.length && <NoRecordFound />}
                    </div>
                  </div>
                </div>
                {CustomPagination()}
              </div>
            </CardBody>
          </Card>
        </UILoader>
      </Fragment>
    );
  }
);

SortableTable.displayName = 'SortableTable';
export default SortableTable;
