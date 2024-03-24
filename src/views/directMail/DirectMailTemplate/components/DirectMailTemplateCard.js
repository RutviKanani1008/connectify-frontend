import { Copy, Edit2, Eye, Printer, Trash } from 'react-feather';
import { Spinner, UncontrolledTooltip } from 'reactstrap';
import DirectMailPrint from './DirectMailPrint';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useLazyGetDirectMailTemplateQuery } from '../../../../redux/api/directMailTemplateApi';

const DirectMailTemplateCard = ({
  template,
  setIsOpen,
  setCurrentTemplate,
  handleConfirmDelete,
  handleConfirmClone,
  history,
  basicRoute,
}) => {
  const { name, description, _id } = template;

  const templatePrintRef = useRef(null);

  const [getDirectMailTemplate, { isFetching, currentData }] =
    useLazyGetDirectMailTemplateQuery();

  const body = currentData?.data?.body;
  const header = currentData?.data?.header;
  const footer = currentData?.data?.footer;
  const type = currentData?.data?.type;
  const postcardBack = currentData?.data?.postcardBack;
  const postcardFront = currentData?.data?.postcardFront;

  const printNote = useReactToPrint({
    content: () => templatePrintRef.current,
  });

  const handlePrintNote = async () => {
    await getDirectMailTemplate({ id: _id });
    printNote();
  };

  return (
    <>
      <div className='company-form-card'>
        <div className='header-wrapper'>
          <div className='form-card-title'>{name}</div>
          <div className='action-btn-wrapper'>
            <div className='action-btn view-btn'>
              <Eye
                size={15}
                color='#000000'
                className='cursor-pointer'
                onClick={() => {
                  setIsOpen((prev) => ({ ...prev, preview: true }));
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
                  history.push(`${basicRoute}/templates/direct-mail/${_id}`);
                  setCurrentTemplate(template);
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
              onClick={() => handlePrintNote()}
            >
              {isFetching ? (
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
        <div className='body-wrapper'>
          {description && (
            <div className='cn-wrapper'>
              <h3 className='title'>Description</h3>
              <p className='text'>{description}</p>
            </div>
          )}
        </div>
      </div>
      <DirectMailPrint
        header={header}
        footer={footer}
        body={body}
        type={type}
        postcardBack={postcardBack}
        postcardFront={postcardFront}
        ref={templatePrintRef}
        contacts={[{}]}
      />
    </>
  );
};
export default DirectMailTemplateCard;
