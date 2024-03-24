// ==================== Packages =======================
import { Edit2, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';
// ====================================================

export const useInventoryProductCriteriaColumn = ({
  setCurrentCriteriaDetail,
  setAddModal,
}) => {
  const inventoryProductCriteriaColumns = ({ handleDelete }) => [
    {
      name: 'Label',
      minWidth: '250px',
      sortable: (row) => row?.label,
      selector: (row) => row?.label,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.label}</span>
          </div>
        );
      },
    },
    {
      name: 'Type',
      minWidth: '250px',
      sortable: (row) => row?.type.label,
      selector: (row) => row?.type.label,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.type.label}</span>
          </div>
        );
      },
    },
    {
      name: 'Placeholder',
      minWidth: '250px',
      sortable: (row) => row?.placeholder,
      selector: (row) => row?.placeholder,
      cell: (row) => {
        return (
          <div>
            <span className='cursor-pointer'>{row?.placeholder}</span>
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
                  setCurrentCriteriaDetail(row);
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
            <div className='action-btn edit-btn'>
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

  return { inventoryProductCriteriaColumns };
};
