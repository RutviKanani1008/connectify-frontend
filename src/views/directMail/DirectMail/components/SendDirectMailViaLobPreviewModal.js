import { useRef } from 'react';
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
import { Send } from 'react-feather';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import { useGetSelectedContactsForDirectMail } from '../services/directMail.services';
import useContactColumns from '../../../Admin/contact/hooks/useContactColumns';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import { useSendDirectMailViaLobAPI } from '../hooks/useApi';

const SendDirectMailViaLobPreviewModal = (props) => {
  const { isOpen, onModalClose, currentDirectMailDetails } = props;

  // ** Store **
  const user = useSelector(userData);

  // ** Ref **
  const tableRef = useRef(null);

  // ** Custom Hooks **
  const {
    getSelectedContacts,
    contactsData: contactsTableData,
    isLoading: contactsLoading,
  } = useGetSelectedContactsForDirectMail({
    directMailId: currentDirectMailDetails?._id,
  });

  const { sendDirectMailViaLobAPI, isLoading: sendLoading } =
    useSendDirectMailViaLobAPI();

  const { columns } = useContactColumns({
    handleConfirmDeleteAndArchive: () => {},
    user,
    showActions: false,
  });

  const handleSend = async () => {
    await sendDirectMailViaLobAPI({
      id: currentDirectMailDetails?._id,
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={() => {
          onModalClose();
        }}
        backdrop='static'
        className={`modal-dialog-centered view-direct-mail-modal contacts-tab-active modal-dialog-mobile`}
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            onModalClose();
          }}
        >
          <span className='title-text'>
            {currentDirectMailDetails?.title || ''}
          </span>
          <div className='icon-wrapper' style={{ display: 'none' }}>
            {sendLoading ? (
              <Spinner />
            ) : (
              <>
                <Send
                  size={15}
                  id='print_direct_mail_modal'
                  onClick={() => handleSend()}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target='print_direct_mail_modal'
                  key='print_direct_mail_modal'
                >
                  Send Via Lob
                </UncontrolledTooltip>
              </>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='top__header'>
            <div className='left'>
              <Label>Template Name:</Label>
              <div className='h5'>
                {currentDirectMailDetails?.directMailTemplate?.name || ''}
              </div>
            </div>
            <div className='right'>
              <Button
                className='print__btn'
                color='primary'
                disabled={sendLoading}
                onClick={() => handleSend()}
                style={{ width: '110px' }}
              >
                {sendLoading ? (
                  <Spinner size='sm' />
                ) : (
                  <>
                    <Send />
                    <span className='align-middle ms-50'>Send Via Blob</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className='contact__wrapper'>
            <ServerSideTable
              header={<></>}
              ref={tableRef}
              blocking={contactsLoading}
              initialTableFilters={{}}
              selectableRows={false}
              columns={columns}
              getRecord={getSelectedContacts}
              data={contactsTableData}
              itemsPerPage={10}
            />
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default SendDirectMailViaLobPreviewModal;
