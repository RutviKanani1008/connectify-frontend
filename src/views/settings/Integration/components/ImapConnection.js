import { Edit2, Link2, Mail, X } from 'react-feather';
import { Button } from 'reactstrap';
// ** Custom Components
import Avatar from '@components/avatar';
import { useEffect, useState } from 'react';
import { useRemoveSmtpImapCredentialMutation } from '../../../../redux/api/mailApi';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { useGetConnectedSmtpAccounts } from '../../../Admin/communication/Email/hooks/useEmailService';
import { useDispatch, useSelector } from 'react-redux';
import {
  getConnectedMailAccounts,
  removeMailAccounts,
  setMailFolder,
} from '../../../../redux/email';
import ConnectIMAP from '../../../Admin/communication/Email/components/ConnectIMAP/ConnectIMAP';
import EditImapConnection from '../../../Admin/communication/Email/components/ConnectIMAP/EditIMAPConnection';

const ImapConnection = () => {
  // ** Store Variables
  const dispatch = useDispatch();
  const connectedMailAccounts = useSelector(getConnectedMailAccounts);

  // ** States **
  const [openImapModal, setOpenImapModal] = useState(false);
  const [editImapConnection, setEditImapConnection] = useState(null);

  // ** API Services **
  const { getConnectedSmtpAccounts, isLoading } = useGetConnectedSmtpAccounts();
  const [removeSmtpImapCredential, { isLoading: removingAccount }] =
    useRemoveSmtpImapCredentialMutation();

  useEffect(() => {
    getConnectedSmtpAccounts();
  }, []);

  const closeImapModal = () => {
    setOpenImapModal(false);
  };

  const handleConfirmDelete = async (email) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to remove this account?',
    });
    if (result.value) {
      const { error } = await removeSmtpImapCredential({
        params: { email },
      });
      if (!error) {
        dispatch(removeMailAccounts(email));
        dispatch(setMailFolder({}));
      }
    }
  };

  return (
    <>
      <div className='integration-box email-connection'>
        <h3 className='heading'>SMTP / IMAP</h3>

        {!isLoading &&
          (connectedMailAccounts.length > 0 ? (
            <div className='connected-account-wrapper'>
              <div className='ca-header'>
                <div className='icon-wrapper'>
                  <Link2 size={18} />
                </div>
                <div className='right-text'>
                  <span className='title'>Connected Account</span>
                  <span className='text'>Manage your accounts from list</span>
                </div>
              </div>
              <div className='ca-body'>
                {connectedMailAccounts.map((obj, index) => (
                  <div className='connected-item' key={index}>
                    <div className='imap-wrapper'>
                      <div className='icon-wrapper'>
                        <Mail size={18} />
                      </div>
                      <h3 className='title'>Imap</h3>
                    </div>
                    <div className='user-wrapper'>
                      <Avatar color='primary' content={obj.username} initials />
                      <h4 className='email'>{obj.username}</h4>
                    </div>
                    <div className='action-btn-wrapper'>
                      <div className='action-btn edit-btn'>
                        <Edit2
                          size={14}
                          onClick={() => setEditImapConnection(obj)}
                        />
                      </div>
                      <div
                        className='action-btn close-btn'
                        onClick={() =>
                          !removingAccount && handleConfirmDelete(obj.username)
                        }
                      >
                        <X size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='connect-wrapper'>
              <div className='details'>
                <div className='icon-wrapper'>
                  <Mail size={18} />
                </div>
                <div className='details-text'>
                  <h3 className='title'>
                    Connect any email that supports IMAP protocol
                  </h3>
                  <p className='text'>
                    Enter your email address and we'll automatically connect
                    your qualified account, if account not qualified manual
                    entry is available.
                  </p>
                </div>
              </div>
              <Button
                color='primary'
                className='connect-IMAP-btn'
                onClick={() => setOpenImapModal(true)}
              >
                Connect IMAP Email
              </Button>
            </div>
          ))}
      </div>
      <ConnectIMAP closeModal={closeImapModal} isOpen={openImapModal} />

      <EditImapConnection
        connection={editImapConnection}
        closeModal={() => setEditImapConnection(null)}
      />
    </>
  );
};

export default ImapConnection;
