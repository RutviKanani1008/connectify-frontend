import { Copy, Edit2, Eye, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';

const useChecklistColumns = ({
  handleConfirmClone,
  setChecklistId,
  handleConfirmDelete,
  setIsViewOnly
}) => {
  const columns = [
    {
      name: 'Title',
      width: '80%',
      sortable: (row) => row?.name,
      selector: (row) => row?.name,
      cell: (row) => (
        <span
          className='text-capitalize cursor-pointer'
          onClick={() => {
            setChecklistId(row?._id);
          }}
        >
          {row.name}
        </span>
      ),
    },
    {
      name: 'Actions',
      width: '20%',
      allowOverflow: true,
      cell: (row) => {
        const { _id } = row;

        return (
          <div className='text-primary d-flex mt-md-0 mt-1'>
            <Eye
              color='#a3db59'
              size={15}
              className='me-1 cursor-pointer'
              onClick={() => {
                setChecklistId(_id);
                setIsViewOnly(true);
              }}
              id={`view_checklist_${_id}`}
            />
            <UncontrolledTooltip
              key={`view_checklist_${_id}`}
              placement='top'
              autohide={true}
              target={`view_checklist_${_id}`}
            >
              View Checklist
            </UncontrolledTooltip>
            <Copy
              color='orange'
              size={15}
              className='me-1 cursor-pointer'
              onClick={() => handleConfirmClone(_id)}
              id={`clone_${_id}`}
            />
            <UncontrolledTooltip
              key={`clone_${_id}`}
              placement='top'
              autohide={true}
              target={`clone_${_id}`}
            >
              Clone
            </UncontrolledTooltip>

            <Edit2
              size={15}
              className='me-1 cursor-pointer'
              onClick={() => {
                setChecklistId(_id);
              }}
              color={'#64c664'}
              id={`edit_${_id}`}
            />
            <UncontrolledTooltip
              key={`edit_${_id}`}
              placement='top'
              autohide={true}
              target={`edit_${_id}`}
            >
              Edit
            </UncontrolledTooltip>
            <Trash
              color='red'
              size={15}
              className='me-1 cursor-pointer'
              onClick={() => handleConfirmDelete(_id)}
              id={`trash_${_id}`}
            />
            <UncontrolledTooltip
              key={`trash_${_id}`}
              placement='top'
              autohide={true}
              target={`trash_${_id}`}
            >
              Delete
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];

  return { columns };
};

export default useChecklistColumns;
