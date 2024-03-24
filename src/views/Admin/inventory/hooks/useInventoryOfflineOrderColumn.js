// ==================== Packages =======================
import moment from 'moment';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import { useHistory } from 'react-router-dom';
import { Edit2 } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';

export const useInventoryOfflineOrderColumn = () => {
  const { basicRoute } = useGetBasicRoute();
  const history = useHistory();

  const inventoryOfflineOrderColumns = () => [
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
                history.push(`${basicRoute}/offline-order-details/${row?._id}`)
              }
            >
              {row?.orderNumber}
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
                history.push(`${basicRoute}/offline-order-details/${row?._id}`)
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
      sortField: 'customerDetails.name',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/offline-order-details/${row?._id}`)
              }
            >
              {row?.customerDetails.name}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Order Status',
      minWidth: '250px',
      sortField: 'orderDetails.orderStatus.label',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/offline-order-details/${row?._id}`)
              }
            >
              {row?.orderDetails.orderStatus.label}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Amount',
      minWidth: '250px',
      sortField: 'totalAmount',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/offline-order-details/${row?._id}`)
              }
            >
              {row?.totalAmount}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Payment Status',
      minWidth: '250px',
      sortField: 'paymentDetails.paymentMethod.label',
      sortable: true,
      cell: (row) => {
        return (
          <div>
            <span
              className='cursor-pointer'
              onClick={() =>
                history.push(`${basicRoute}/offline-order-details/${row?._id}`)
              }
            >
              {row?.paymentDetails?.paymentMethod?.label}
            </span>
          </div>
        );
      },
    },
    {
      maxWidth: '100px',
      name: 'Actions',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='action-btn-wrapper'>
            {row?.orderDetails.orderStatus.value !== 'completed' && (
              <div className='action-btn edit-btn'>
                <Edit2
                  size={15}
                  className='cursor-pointer'
                  onClick={() => {
                    history.push(`${basicRoute}/add-order/${row?._id}`);
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
            )}
          </div>
        );
      },
    },
  ];

  return { inventoryOfflineOrderColumns };
};
