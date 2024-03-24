// ==================== Packages =======================
import moment from 'moment';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom';
import { Edit2 } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
import { getCurrentUser } from '../../../../helper/user.helper';

 const useInventoryOnlineOrderColumn = ({handleEditColumn}) => {
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();
  const user = getCurrentUser();
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
  ]
  const getStatusName = (name, type) => {
     const statusName = ORDER_STATUS.filter((item => item.value === name));
     if (statusName && statusName.length > 0) {
       const data = type === 'label' ? statusName[0]['label'] : statusName[0]['value']
       return data
     }
  }
  const inventoryOnlineOrderColumns = [
    {
      name: 'Order Number',
      minWidth: '250px',
      sortField: 'orderNumber',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/online-order-details/${row?._id}`)
              }
            >
              {row?.number}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Date',
      minWidth: '250px',
      sortField: 'createdAt',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/online-order-details/${row?._id}`)
              }
            >
              {' '}
              {row?.createdAt
                ? `${moment(new Date(row.createdAt)).format('YYYY-MM-DD')}`
                : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Customer',
      minWidth: '250px',
      sortField: 'customerDetails[0].name',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/online-order-details/${row?._id}`)
              }
            >
              {row?.customerDetails ? row.customerDetails[0].name : ''}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Order Status',
      minWidth: '250px',
      sortField: 'status',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className={`cursor-pointer online-order-status ${getStatusName(row?.status, 'value')}`}
              onClick={() =>
                history.push(`${basicRoute}/online-order-details/${row?._id}`)
              }
            >
              {getStatusName(row?.status, 'label')}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Amount',
      minWidth: '250px',
      sortField: 'total',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/online-order-details/${row?._id}`)
              }
            >
              {row?.total}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Payment Status',
      minWidth: '250px',
      sortField: 'payment_method',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/online-order-details/${row?._id}`)
              }
            >
              {row?.payment_method}
            </span>
          </div>
        );
      },
    },
    (user.inventoryRole === 'adminUser' &&
    {
      maxWidth: '100px',
      name: 'Actions',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='action-btn-wrapper'>
            {user.inventoryRole === 'adminUser' &&
              <div className='action-btn edit-btn'>
                <Edit2
                  size={15}
                  className='cursor-pointer'
                  onClick={() => {
                    handleEditColumn(row);
                  }}
                  id={`edit_${row?._id}`}
                ></Edit2>
                <UncontrolledTooltip
                  placement='top'
                  target={`edit_${row?._id}`}
                >
                  Edit
                </UncontrolledTooltip>
              </div>
            } 
          </div>
        );
      },
    }),
  ];

  return { inventoryOnlineOrderColumns };
};

export default useInventoryOnlineOrderColumn
