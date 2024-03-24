// ==================== Packages =======================
import { Edit2, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
// ====================================================

export const useInventoryWarehouseColumn = ({
  setCurrentLocationDetail,
  setAddModal,
}) => {
  const inventoryWarehouseColumn = ({ handleDelete }) => [
    {
      name: 'Name',
      minWidth: '250px',
      sortable: (row) => row?.name,
      selector: (row) => row?.name,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.name}</span>
          </div>
        );
      },
    },
      {
      name: 'Store Type',
      minWidth: '250px',
      sortable: (row) => row?.type?.label,
      selector: (row) => row?.type?.label,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.type?.label}</span>
          </div>
        );
      },
    },
    {
      name: 'Address',
      minWidth: '250px',
      sortable: (row) => row?.address,
      selector: (row) => row?.address,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.address}</span>
          </div>
        );
      },
    },
    {
      name: 'City',
      minWidth: '250px',
      sortable: (row) => row?.city,
      selector: (row) => row?.city,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.city}</span>
          </div>
        );
      },
    },
    {
      name: 'State',
      minWidth: '250px',
      sortable: (row) => row?.state,
      selector: (row) => row?.state,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.state}</span>
          </div>
        );
      },
    },
    {
      name: 'Country',
      minWidth: '250px',
      sortable: (row) => row?.country,
      selector: (row) => row?.country,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.country}</span>
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
          <div className='d-flex'>
            <>
              <Edit2
                color={'#64c664'}
                size={15}
                className='cursor-pointer me-1'
                onClick={() => {
                  setCurrentLocationDetail(row);
                  if (setAddModal) {
                    setAddModal({ id: row?._id, toggle: true });
                  }
                }}
                id={`edit_${row?._id}`}
              ></Edit2>
              <UncontrolledTooltip placement='top' target={`edit_${row?._id}`}>
                Edit
              </UncontrolledTooltip>
            </>
            <>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer me-1'
                onClick={() => handleDelete(row?._id)}
                id={`delete_${row?._id}`}
              ></Trash>
              <UncontrolledTooltip
                placement='top'
                target={`delete_${row?._id}`}
              >
                Delete
              </UncontrolledTooltip>
            </>
          </div>
        );
      },
    },
  ];

  return { inventoryWarehouseColumn };
};
