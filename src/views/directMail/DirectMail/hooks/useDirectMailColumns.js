import { Edit2, Printer, Trash } from 'react-feather';
import { Spinner, UncontrolledTooltip } from 'reactstrap';

export const useDirectMailColumns = ({
  onEdit,
  onDelete,
  getSpecifTemplateContactsDetail,
  currentLoadingId,
}) => {
  return [
    {
      name: 'Title',
      minWidth: '400px',
      sortable: (row) => row?.title,
      sortField: 'title',
      selector: (row) => row?.title,
      cell: (row) => <span className='text-capitalize'>{row.title}</span>,
    },
    {
      name: 'Actions',
      minWidth: '250px',
      maxWidth: '300px',
      allowOverflow: true,
      cell: (row) => {
        const { _id } = row;

        return (
          <div className='action-btn-wrapper'>
            <div className='action-btn edit-btn'>
              {currentLoadingId === _id ? (
                <Spinner />
              ) : (
                <>
                  <Printer
                    size={15}
                    id={`print_${_id}`}
                    onClick={() => {
                      getSpecifTemplateContactsDetail(_id, row);
                    }}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`print_${_id}`}
                    key={`print_${_id}`}
                  >
                    Print
                  </UncontrolledTooltip>
                </>
              )}
            </div>
            <div className='action-btn edit-btn'>
              <Edit2
                size={15}
                className='cursor-pointer'
                onClick={() => onEdit(row)}
                id={`edit_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`edit_${_id}`}
                >
                  Edit
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn edit-btn'>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                onClick={() => onDelete(row, 'email')}
                id={`trash_${_id}`}
              />
            </div>
          </div>
        );
      },
    },
  ];
};
