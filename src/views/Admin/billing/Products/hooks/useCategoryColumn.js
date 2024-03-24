// ==================== Packages =======================
import { Edit2, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
// ====================================================

export const useProductCategoryColumn = ({
  setCurrentCategoryDetail,
  reset,
  setAddModal,
}) => {
  const productCategoryColumns = ({ handleDelete }) => [
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
                  reset({ name: row.name });
                  setCurrentCategoryDetail(row);
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

  return { productCategoryColumns };
};
