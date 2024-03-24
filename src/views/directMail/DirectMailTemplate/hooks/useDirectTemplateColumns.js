import { Copy, Edit2, Eye, Printer, Trash } from 'react-feather';
import { Spinner, UncontrolledTooltip } from 'reactstrap';

export const useDirectMailTemplateColumns = ({
  onPreview,
  onClone,
  onEdit,
  onPrint,
  printLoading,
  onDelete,
}) => {
  return [
    {
      name: 'Template Name',
      minWidth: '400px',
      sortable: (row) => row?.name,
      sortField: 'name',
      selector: (row) => row?.name,
      cell: (row) => <span className='text-capitalize'>{row.name}</span>,
    },
    {
      name: 'Description',
      minWidth: '400px',
      sortable: (row) => row?.description,
      sortField: 'subject',
      selector: (row) => row?.description,
      cell: (row) => {
        const { description } = row;
        return (
          <div className=''>
            <span className='align-middle ms-50'>{description} </span>
          </div>
        );
      },
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
            <div className='action-btn view-btn'>
              <Eye
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  onPreview(row);
                }}
                id={`preview_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`preview_${_id}`}
                >
                  Preview
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn copy-btn'>
              <Copy
                // color='orange'
                size={15}
                className='cursor-pointer'
                onClick={() => onClone(_id, 'email')}
                id={`clone_${_id}`}
              />
              {_id && (
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`clone_${_id}`}
                >
                  Clone
                </UncontrolledTooltip>
              )}
            </div>
            <div className='action-btn edit-btn'>
              <Edit2
                size={15}
                className='cursor-pointer'
                onClick={() => onEdit(row)}
                // color={'#64c664'}
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

            <div className='action-btn print-btn' onClick={() => onPrint(row)}>
              {printLoading === row?._id ? (
                <Spinner />
              ) : (
                <Printer color='#000000' size={15} id={`print_${_id}`} />
              )}
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`print_${_id}`}
                key={`print_${_id}`}
              >
                Print
              </UncontrolledTooltip>
            </div>

            <div className='action-btn edit-btn'>
              <Trash
                color='red'
                size={15}
                className='cursor-pointer'
                onClick={() => onDelete(row?._id)}
                id={`trash_${_id}`}
              />
            </div>
          </div>
        );
      },
    },
  ];
};
