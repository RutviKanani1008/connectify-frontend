import React, { useRef, useState } from 'react';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import {  X } from 'react-feather';
// import ExportData from '../../../../components/ExportData';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import  useInventoryOnlineOrderColumn from '../hooks/useInventoryOnlineOrderColumn';
import { useGetOnlineOrders, useUpdateOnlineOrder } from '../hooks/InventoryOnlineOrderApi';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { SaveButton } from '../../../../@core/components/save-button';


const ORDER_STATUS = [
  {
    value: 'processing',
    label: 'Processing'
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
    value: 'refunded',
    label: 'Refunded',
  },
  {
    value: 'failed',
    label: 'Failed',
  },
  {
    value: 'checkout-draft',
    label: 'Draft',
  },
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'ready-for-ship',
    label: 'Ready For shipping',
  },
  {
    value: 'waiting-for-pick',
    label: 'Waiting For Pickup',
  }
];

const OnlineOrder = () => {
  const refRangePicker = useRef(null);
  const user = useSelector(userData);
  const tableRef = useRef(null);
  const [orders, setOrders] = useState({ results: [], total: 0 });
  const [selectedDate, setSelectedDate] = useState(false);
  const [openModal, setOpenModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState({})
 
  const { getOnlineOrders, isLoading: getOnlineOrderLoading } =
    useGetOnlineOrders();
    const { updateOnlineOrder } = useUpdateOnlineOrder();


  const handleEditColumn = (data) => {
    setCurrentOrder(data);
    setOpenModal(true);
  }

  const { inventoryOnlineOrderColumns } = useInventoryOnlineOrderColumn({handleEditColumn});

  const [currentFilters, setCurrentFilters] = useState({
    limit: 5,
    page: 1,
    search: '',
    sort: { column: '', order: null },
    startDate: null,
    endDate: null,
    orderStatus: null,
  });

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

    const { data, error } = await getOnlineOrders({
      companyId,
      limit: filter.limit,
      page: filter.page,
      sort: filter.sort,
      search: filter.search,
      startDate: filter.startDate,
      endDate: filter.endDate,
      orderStatus: filter.orderStatus,
      select:
        'total,status,shipping,payment_method,number,company,createdBy,customerDetails,wooID',
    });
    const orders = data?.results;

    if (!error) setOrders({ results: orders, total: data.pagination.total });
  };

  const header = () => {
    return (
      <div className='card-header-with-buttons card-header product-list-header'>
        <h4 className='title card-title'>Online Orders</h4>
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
          {/* {<ExportData model='inventoryOfflineOrder' query={currentFilters} />} */}
        </div>
      </div>
    );
  };

  const onSubmit = async () => {
    const rawData = currentOrder;
    rawData.company =  user?.company._id;
     const { error } = await updateOnlineOrder(currentOrder._id, rawData, 'Update Order...'); 
      if (!error) {
        getRecords(currentFilters)
        setOpenModal(false);
      }
  }

  const getCurrentValue = (status) => {
    const value = ORDER_STATUS.filter((item => item.value === status));
    return value[0];
  }

  return (
    <>
      <div className='inventory-warehouse-locations-table-wrapper'>
        <ServerSideTable
          columns={inventoryOnlineOrderColumns}
          ref={tableRef}
          blocking={getOnlineOrderLoading}
          data={orders}
          getRecord={getRecords}
          itemsPerPage={10}
          header={header()}
          searchPlaceholder='Search Order Here ...'
        />
      </div>
      {openModal && 
      <Modal
      isOpen={openModal}
      toggle={() => {
        setOpenModal(false)
      }}
      className='modal-dialog-centered add-inventory-product-category-modal'
      backdrop='static'
    >
      <ModalHeader
        toggle={() =>
          setOpenModal(false)
        }
      > Update Order Status
      </ModalHeader>

      <ModalBody>
        <>       
          <div className=''>
            <Select
              name='status'
              label='Name'
              placeholder='Select Status'     
              options={ORDER_STATUS}
              value={getCurrentValue(currentOrder.status)}
              onChange={(e) => {
                setCurrentOrder({
                  ...currentOrder,
                  status: e.value,
                });
              }}
            />
          </div>      
        </>
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={() =>
            setOpenModal(false)
          }
        >
          Cancel
        </Button>
       
          <SaveButton
            width='171px'
            type='submit'
            name= 'Update'
            onClick={() =>
            onSubmit()
          }
          ></SaveButton>
       
      </ModalFooter>
    </Modal>
      }
    </>
  );
};

export default OnlineOrder;
