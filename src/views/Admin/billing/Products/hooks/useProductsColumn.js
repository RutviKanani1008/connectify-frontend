// ==================== Packages =======================
import { Edit2, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
// ====================================================
import { getCurrentUser } from '../../../../../helper/user.helper';

export const useProductsColumn = ({ setAddModal }) => {
  const user = getCurrentUser();

  const productsColumns = ({ handleDelete }) => [
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
      name: 'Category',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.category?.name,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>
              {row?.category?.name ? row?.category?.name : '-'}
            </span>
          </div>
        );
      },
    },
    {
      name: 'Description',
      sortable: true,
      minWidth: '250px',
      selector: (row) => row?.description,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.description}</span>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      allowOverflow: true,
      maxWidth: '100px',
      cell: (row) => {
        return (
          <div className='d-flex'>
            {!row?.archived && (
              <>
                <Edit2
                  color={'#64c664'}
                  size={15}
                  className='cursor-pointer me-1'
                  onClick={() => {
                    setAddModal({ id: row?._id, toggle: true });
                  }}
                  id={`edit_${row?._id}`}
                ></Edit2>
                <UncontrolledTooltip
                  placement='top'
                  target={`edit_${row?._id}`}
                >
                  Edit
                </UncontrolledTooltip>
              </>
            )}

            {user?.role === 'admin' && (
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
            )}
          </div>
        );
      },
    },
  ];

  return { productsColumns };
};
