import { useEffect, useState } from 'react';
import {
  useDeleteEmailSender,
  useGetEmailSenderAPI,
  useUpdateEmailSenderStatus,
} from '../../../Admin/campaigns/mass-email-tool/service/emailSender.service';
import ItemTable from '../../../../@core/components/data-table';
import { Spinner, UncontrolledTooltip } from 'reactstrap';
import { CheckCircle, Trash } from 'react-feather';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { isArray } from 'lodash';
import AddSenderEmailModal from './AddSenderEmailModal';

export const CompanySenderEmail = ({ company }) => {
  const [isOpen, setIsOpen] = useState();

  const { getEmailSenderAPI, isLoading: checkingSendingMail } =
    useGetEmailSenderAPI();
  const { deleteEmailSenderAPI } = useDeleteEmailSender();
  const { updateEmailSenderStatus } = useUpdateEmailSenderStatus();
  const [currentCompanySenderEmail, setCurrentCompanySenderEmail] = useState(
    []
  );
  const getSenderEmail = async () => {
    const { data, error } = await getEmailSenderAPI({ company });
    if (!error) {
      setCurrentCompanySenderEmail(data);
    }
  };
  useEffect(() => {
    getSenderEmail();
  }, []);

  const handleDeleteEmail = async (id) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this email?',
    });

    if (result.value) {
      const { error } = await deleteEmailSenderAPI(id, 'Delete Email Sender..');

      if (!error) {
        if (isArray(currentCompanySenderEmail)) {
          const tempCurrentCompanySenderEmail =
            currentCompanySenderEmail?.filter((obj) => obj?._id !== id);
          if (isArray(currentCompanySenderEmail))
            setCurrentCompanySenderEmail(tempCurrentCompanySenderEmail);
        }
      }
    }
  };

  const handleChangeStatus = async (id, status) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to update this status?',
    });

    if (result.value) {
      const { error } = await updateEmailSenderStatus(
        id,
        { status },
        'Update Email Sender status..'
      );

      if (!error) {
        if (isArray(currentCompanySenderEmail)) {
          const tempCurrentCompanySenderEmail = JSON.parse(
            JSON.stringify(currentCompanySenderEmail)
          );
          tempCurrentCompanySenderEmail.map((senderEmail) => {
            if (senderEmail._id === id) {
              senderEmail.status = status;
            }
          });
          setCurrentCompanySenderEmail(tempCurrentCompanySenderEmail);
        }
      }
    }
  };
  const columns = [
    {
      name: 'Email',
      minWidth: '400px',
      sortable: (row) => row?.email,
      selector: (row) => row?.email,
      cell: (row) => <span className=''>{row?.email}</span>,
    },
    {
      name: 'Actions',
      minWidth: '250px',
      maxWidth: '300px',

      allowOverflow: true,
      cell: (row) => {
        const { _id, status } = row;

        return (
          <div className='action-btn-wrapper'>
            <div className='action-btn verify-btn'>
              <CheckCircle
                className='cursor-pointer'
                color={status === 'Verified' ? 'green' : 'gray'}
                size={20}
                onClick={() => {
                  handleChangeStatus(
                    _id,
                    status === 'Verified' ? 'Pending' : 'Verified'
                  );
                }}
                id={`verified_${_id}`}
              />
            </div>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`verified_${_id}`}
            >
              {status === 'Verified'
                ? 'Click to mark as unverified'
                : 'Click to mark as verified'}
            </UncontrolledTooltip>

            <div className='action-btn verify-btn'>
              <Trash
                size={20}
                color='red'
                className='cursor-pointer'
                onClick={() => {
                  handleDeleteEmail(_id);
                }}
                id={`delete_${_id}`}
              />
            </div>
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`delete_${_id}`}
            >
              Delete
            </UncontrolledTooltip>
          </div>
        );
      },
    },
  ];
  return (
    <>
      {checkingSendingMail ? (
        <div className='mb-2 text-primary text-center'>
          <Spinner color='primary' />
        </div>
      ) : (
        <>
          <ItemTable
            // ExportData={
            //   <ExportData
            //     model='product'
            //     query={{ type: 'recurring', fileName: 'recurring-product' }}
            //   />
            // }
            hideExport={true}
            showCard={false}
            columns={columns}
            data={currentCompanySenderEmail}
            title=''
            addItemLink={false}
            onClickAdd={() => setIsOpen(true)}
            buttonTitle={'Add Sender Email'}
            itemsPerPage={10}
          />
        </>
      )}
      {isOpen && (
        <AddSenderEmailModal
          company={company}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          getSenderEmail={getSenderEmail}
        />
      )}
    </>
  );
};
