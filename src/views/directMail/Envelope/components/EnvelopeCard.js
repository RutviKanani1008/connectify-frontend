import { Copy, Edit2, Eye, Printer, Trash } from 'react-feather';
import { UncontrolledTooltip } from 'reactstrap';

const EnvelopeCard = ({
  template,
  setCurrentTemplate,
  handleConfirmDelete,
  handleConfirmClone,
  history,
  basicRoute,
  setIsOpen,
  handlePrint,
}) => {
  const { name, _id, body } = template;

  return (
    <>
      <div className='table-cell'>
        <span className='template-name'>{name}</span>
      </div>
      <div className='table-cell'>
        <div className='action-btn-wrapper'>
          <div className='action-btn view-btn'>
            <Eye
              size={15}
              color='#000000'
              className='cursor-pointer'
              onClick={() => {
                setIsOpen((prev) => ({
                  ...prev,
                  preview: true,
                }));
                setCurrentTemplate(template);
              }}
              id={`preview_${_id}`}
            />

            <UncontrolledTooltip
              placement='top'
              autohide={true}
              key={`preview_${_id}`}
              target={`preview_${_id}`}
            >
              Preview
            </UncontrolledTooltip>
          </div>
          <div className='action-btn copy-btn'>
            <Copy
              color='#000000'
              size={15}
              className='cursor-pointer'
              onClick={() => {
                handleConfirmClone(_id);
              }}
              id={`clone_${_id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`clone_${_id}`}
              key={`clone_${_id}`}
            >
              Clone
            </UncontrolledTooltip>
          </div>

          <div className='action-btn edit-btn'>
            <Edit2
              color='#000000'
              size={15}
              className='cursor-pointer'
              onClick={() => {
                history.push(`${basicRoute}/envelope/${_id}`);
              }}
              id={`edit_${_id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`edit_${_id}`}
              key={`edit_${_id}`}
            >
              Edit
            </UncontrolledTooltip>
          </div>

          <div
            className='action-btn print-btn'
            onClick={() => handlePrint(body)}
          >
            <Printer color='#000000' size={15} id={`print_${_id}`} />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`print_${_id}`}
              key={`print_${_id}`}
            >
              Print
            </UncontrolledTooltip>
          </div>

          <div className='action-btn delete-btn'>
            <Trash
              color='red'
              size={15}
              className='cursor-pointer'
              onClick={() => handleConfirmDelete(_id)}
              id={`trash_${_id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`trash_${_id}`}
              key={`trash_${_id}`}
            >
              Delete
            </UncontrolledTooltip>
          </div>
        </div>
      </div>
    </>
  );
};
export default EnvelopeCard;
