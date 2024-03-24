// ==================== Packages =======================
import { Edit2, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
// ====================================================

export const useInventoryProductCategoryColumn = ({
  setCurrentCategoryDetail,
  reset,
  setAddModal,
}) => {
  const inventoryProductCategoryColumns = ({ handleDelete }) => [
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
          <div className='action-btn-wrapper'>
            <div className='action-btn edit-btn'>
              <Edit2
                size={15}
                className='cursor-pointer'
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
            </div>
            <div className='action-btn delete-btn'>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                onClick={() => handleDelete(row?._id)}
                id={`delete_${row?._id}`}
              ></Trash>
              <UncontrolledTooltip
                placement='top'
                target={`delete_${row?._id}`}
              >
                Delete
              </UncontrolledTooltip>
            </div>
          </div>
        );
      },
    },
  ];

  return { inventoryProductCategoryColumns };
};
