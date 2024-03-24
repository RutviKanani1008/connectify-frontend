import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useInventoryOfflineOrderColumn } from '../hooks/useInventoryOfflineOrderColumn';
import { useGetOfflineOrders } from '../hooks/InventoryOfflineOrderApi';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import { Plus, X } from 'react-feather';
import ExportData from '../../../../components/ExportData';
import { Button } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';

const ORDER_STATUS = [
  {
    value: 'processing',
    label: 'Processing',
  },
  {
    value: 'ready-for-pickup',
    label: 'Ready For Pickup',
  },
  {
    value: 'on-hold',
    label: 'On hold',
  },
  {
    value: 'completed',
    label: 'Completed',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'checkout-draft',
    label: 'Draft',
  },
];

const OfflineOrder = () => {
  const history = useHistory();
  const refRangePicker = useRef(null);
  const user = useSelector(userData);
  const tableRef = useRef(null);
  const { basicRoute } = useGetBasicRoute();
  const { inventoryOfflineOrderColumns } = useInventoryOfflineOrderColumn();
  const [orders, setOrders] = useState({ results: [], total: 0 });
  const [selectedDate, setSelectedDate] = useState(false);

  const { getOfflineOrders, isLoading: getOfflineOrderLoading } =
    useGetOfflineOrders();

  const [currentFilters, setCurrentFilters] = useState({
    limit: 5,
    page: 1,
    search: '',
    sort: { column: '', order: null },
    startDate: null,
    endDate: null,
    orderStatus: null,
  });

  const handelAddNewItem = () => {
    console.log(`nksdbcbdkndkjsdncdksj : ${basicRoute}/add-order/add`);
    history.push(`${basicRoute}/add-order/add`);
  };

  const filterByDateRange = (dateRange) => {
    if (dateRange.length >= 2) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      if (startDate !== null && endDate !== null) {
        const updatedFilters = { ...currentFilters, startDate, endDate };
        getRecords(updatedFilters);
        setSelectedDate(true);
      } else {
        const updatedFilters = {
          ...currentFilters,
          startDate: null,
          endDate: null,
        };
        getRecords(updatedFilters);
        setSelectedDate(false);
      }
    }
  };

  const clearDate = () => {
    refRangePicker.current.flatpickr.clear();
    setSelectedDate(false);
    const updatedFilters = {
      ...currentFilters,
      startDate: null,
      endDate: null,
    };
    getRecords(updatedFilters);
  };

  const filterByOrderStatus = (e) => {
    const updatedFilters = { ...currentFilters, orderStatus: e };
    getRecords(updatedFilters);
  };

  const getRecords = async (filter) => {
    setCurrentFilters({
      limit: filter.limit,
      page: filter.page,
      search: filter.search,
      sort: filter.sort,
      startDate: filter.startDate,
      endDate: filter.endDate,
      orderStatus: filter.orderStatus,
    });
    const companyId = user?.company._id;

    const { data, error } = await getOfflineOrders({
      companyId,
      limit: filter.limit,
      page: filter.page,
      sort: filter.sort,
      search: filter.search,
      startDate: filter.startDate,
      endDate: filter.endDate,
      orderStatus: filter.orderStatus,
      select:
        'totalAmount,customerDetails,orderDetails,shippingDetails,paymentDetails,orderNumber,company,createdBy',
    });
    const orders = data?.results;

    if (!error) setOrders({ results: orders, total: data.pagination.total });
  };

  const header = () => {
    return (
      <div className='card-header-with-buttons card-header product-list-header'>
        <h4 className='title card-title'>Offline Orders</h4>
        <div className='right'>
          <div className='product-date-box ms-1'>
            <Flatpickr
              id='filter-date'
              name='filter-date'
              className='form-control'
              placeholder='Filter By Date'
              onChange={(e) => filterByDateRange(e)}
              options={{
                static: true,
                time_24hr: false,
                mode: 'range',
              }}
              ref={refRangePicker}
            />
            {selectedDate && <X onClick={clearDate} />}
          </div>
          <div className='contact-select-box'>
            <Select
              classNamePrefix='custom-select'
              isClearable={true}
              options={ORDER_STATUS}
              onChange={(e) => {
                filterByOrderStatus(e);
              }}
              placeholder='Filter by Status'
            />
          </div>
          {<ExportData model='inventoryOfflineOrder' query={currentFilters} />}
          <Button
            className='add-product-btn'
            color='primary'
            onClick={handelAddNewItem}
          >
            <Plus size={15} />
            <span className='align-middle ms-50'>{'Add Order'}</span>
          </Button>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className='inventory-warehouse-locations-table-wrapper'>
        <ServerSideTable
          columns={inventoryOfflineOrderColumns()}
          ref={tableRef}
          blocking={getOfflineOrderLoading}
          data={orders}
          getRecord={getRecords}
          itemsPerPage={10}
          header={header()}
          searchPlaceholder='Search Order Here ...'
        />
      </div>
    </>
  );
};

export default OfflineOrder;
