import { useState, useRef } from 'react';
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';
import { useGetSelectedContactsForDirectMail } from '../services/directMail.services';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import useContactColumns from '../../../Admin/contact/hooks/useContactColumns';
import { useSelector } from 'react-redux';
import { userData } from '../../../../redux/user';
import DirectMailPrint from '../../DirectMailTemplate/components/DirectMailPrint';
import { Printer } from 'react-feather';
import { useReactToPrint } from 'react-to-print';
import { useLazyGetDirectMailTemplateQuery } from '../../../../redux/api/directMailTemplateApi';

export const ViewDirectMailModal = (props) => {
  const {
    openDirectMailPreview,
    onDirectMailPreviewModalClose,
    currentDirectMailDetails,
  } = props;

  // ** Store **
  const user = useSelector(userData);

  // ** State **
  const [allContactLoading, setAllContactLoading] = useState(false);

  // ** Ref **
  const tableRef = useRef(null);
  const templatePrintRef = useRef(null);

  // ** API **
  const [getDirectMailTemplate, { currentData }] =
    useLazyGetDirectMailTemplateQuery();

  // ** Custom Hooks **
  const {
    getSelectedContacts,
    contactsData: contactsTableData,
    isLoading: contactsLoading,
  } = useGetSelectedContactsForDirectMail({
    directMailId: currentDirectMailDetails?._id,
  });

  const {
    getSelectedContacts: getSelectedAllContacts,
    contactsData: allContactsTableData,
  } = useGetSelectedContactsForDirectMail({
    directMailId: currentDirectMailDetails?._id,
  });
  const { columns } = useContactColumns({
    handleConfirmDeleteAndArchive: () => {},
    user,
    showActions: false,
  });

  const handlePrintNote = async () => {
    setAllContactLoading(true);
    if (!allContactsTableData.results.length) {
      await getSelectedAllContacts({ page: 1, limit: 10000 });
    }
    await getDirectMailTemplate({
      id: currentDirectMailDetails.directMailTemplate?._id,
    });
    setTimeout(() => {
      printNote();
      setAllContactLoading(false);
    }, 1000);
  };

  const printNote = useReactToPrint({
    content: () => templatePrintRef.current,
  });

  return (
    <>
      <Modal
        isOpen={openDirectMailPreview}
        toggle={() => {
          onDirectMailPreviewModalClose();
        }}
        backdrop='static'
        className={`modal-dialog-centered view-direct-mail-modal contacts-tab-active modal-dialog-mobile`}
        size='xl'
      >
        <ModalHeader
          toggle={() => {
            onDirectMailPreviewModalClose();
          }}
        >
          <span className='title-text'>
            {currentDirectMailDetails?.title || ''}
          </span>
          <div className='icon-wrapper' style={{ display: 'none' }}>
            {allContactLoading ? (
              <Spinner />
            ) : (
              <>
                <Printer
                  size={15}
                  id='print_direct_mail_modal'
                  onClick={() => handlePrintNote()}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target='print_direct_mail_modal'
                  key='print_direct_mail_modal'
                >
                  Print
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
                disabled={allContactLoading}
                onClick={() => handlePrintNote()}
                style={{ width: '110px' }}
              >
                {allContactLoading ? (
                  <Spinner size='sm' />
                ) : (
                  <>
                    <Printer />
                    <span className='align-middle ms-50'>Print</span>
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
          <DirectMailPrint
            ref={templatePrintRef}
            type={currentData?.data?.type}
            postcardBack={currentData?.data?.postcardBack}
            postcardFront={currentData?.data?.postcardFront}
            body={currentData?.data?.body}
            header={currentData?.data?.header}
            footer={currentData?.data?.footer}
            contacts={allContactsTableData?.results || []}
          />
        </ModalBody>
      </Modal>
    </>
  );
};
