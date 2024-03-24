import { Edit2, Eye, Printer, Send, Trash } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { Button, Spinner, UncontrolledTooltip } from 'reactstrap';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';

const DirectMailCard = ({
  item,
  handleConfirmDelete,
  setShowDirectMailPreview,
  getSpecifTemplateContactsDetail,
  currentLoadingId,
}) => {
  const history = useHistory();
  const { basicRoute } = useGetBasicRoute();
  const { title, _id, totalContacts } = item;

  return (
    <>
      <div className='company-form-card'>
        <div className='header-wrapper'>
          <div className='form-card-title'>{title}</div>
          <div className='action-btn-wrapper'>
            <div className='action-btn print-btn'>
              {currentLoadingId === _id ? (
                <Spinner />
              ) : (
                <>
                  <Printer
                    color='#000000'
                    size={15}
                    id={`print_${_id}`}
                    onClick={() => {
                      getSpecifTemplateContactsDetail(item);
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
            <div
              onClick={() => {
                setShowDirectMailPreview((prev) => ({
                  ...prev,
                  isPreviewShow: true,
                  currentDirectMail: item,
                }));
              }}
              className='action-btn view-btn'
              id='directmailviewbtn'
            >
              <Eye color='#000000' size={15} className='cursor-pointer' />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target='directmailviewbtn'
              >
                View
              </UncontrolledTooltip>
            </div>
            <div className='action-btn edit-btn'>
              <Edit2
                color='#000000'
                size={15}
                className='cursor-pointer'
                onClick={() => {
                  history.push(`${basicRoute}/direct-mail/${_id}`);
                }}
                id={`edit_${_id}`}
              />
              <UncontrolledTooltip
                placement='top'
                autohide={true}
                target={`edit_${_id}`}
              >
                Edit
              </UncontrolledTooltip>
            </div>
            {!item.isAutoResponderTemplate && (
              <>
                <div className='action-btn delete-btn'>
                  <Trash
                    color='red'
                    size={15}
                    className='cursor-pointer'
                    onClick={() => handleConfirmDelete(item)}
                    id={`trash_${_id}`}
                  />
                  <UncontrolledTooltip
                    placement='top'
                    autohide={true}
                    target={`trash_${_id}`}
                  >
                    Delete
                  </UncontrolledTooltip>
                </div>
              </>
            )}
          </div>
        </div>
        <div className='body-wrapper'>
          <div className='cn-wrapper'>
            <div className='data-row'>
              <div className='label'>Total number of contacts:</div>
              <div className='value'>{totalContacts || 0}</div>
            </div>
          </div>
          <div className='btn-wrapper'>
            <Button
              color='primary'
              onClick={() => {
                setShowDirectMailPreview((prev) => ({
                  ...prev,
                  sendDirectMailViaLobPreview: true,
                  currentDirectMail: item,
                }));
              }}
            >
              <div className='icon-wrapper'>
                <Send size={15} />
              </div>
              <span className='align-middle ms-50'>Send Via Lob</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
export default DirectMailCard;
