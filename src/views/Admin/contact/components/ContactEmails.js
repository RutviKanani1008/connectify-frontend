import { useEffect, useState } from 'react';
import { BarChart2, Eye, Grid, List, Plus, XCircle } from 'react-feather';
import { useSelector } from 'react-redux';
import {
  Badge,
  Button,
  ButtonGroup,
  Col,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { userData } from '../../../../redux/user';
import { selectBadge } from '../../campaigns/mass-email-tool/components/ScheduledMassEmailCard';
import {
  useCancelScheduleSendContactEmail,
  useGetEmailTemplete,
  useGetSendContactMail,
} from '../hooks/contactEmailApi';
import ContactEmailTemplatePreviewModal from './EmailTemplatePreviewModal';
import { SendContactEmail } from './SendContactEmail';
import { ShowContactEmailStatistics } from './ShowContactEmailStatistics';
import { SendGridApiKeyErrorPage } from '../../campaigns/mass-email-tool/components/SendGridApiKeyErrorPage';
import classnames from 'classnames';
import ContactEmailCard from './ContactEmailCard';
import ItemTable from '../../../../@core/components/data-table';
import moment from 'moment';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';

export const ContactEmails = ({ currentContactDetail, params }) => {
  const [availableEmailTemplate, setAvailableEmailTemplate] = useState([]);
  const [availableSendContactEmail, setAvailableSendContactEmail] = useState(
    []
  );
  const user = useSelector(userData);
  const [showEmailStatisticsModal, setShowEmailStatisticsModal] = useState({
    isModalOpen: false,
    selectedEmail: null,
  });

  const [openSendMailModal, setOpenSendModal] = useState(false);
  const [openId, setOpenId] = useState();
  const [templatePreview, setTemplatesPreview] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [activeView, setActiveView] = useState('grid');

  const { getEmailTemplete } = useGetEmailTemplete();
  const { cancelScheduleContactEmail } = useCancelScheduleSendContactEmail();
  const { getSendContactEmail, isLoading: sendContactEmailLoading } =
    useGetSendContactMail();
  const getAvailableEmailTemplate = async () => {
    const { data, error } = await getEmailTemplete();
    if (!error) {
      setAvailableEmailTemplate(data);
    }
  };

  const getContactSendEmail = async () => {
    const { data, error } = await getSendContactEmail({
      company: user?.company?._id,
      contact: currentContactDetail?._id,
      populate: JSON.stringify([
        { path: 'emailTemplate' },
        { path: 'company' },
        { path: 'createdBy' },
      ]),
    });
    if (!error) {
      setAvailableSendContactEmail(data);
    }
  };
  const toggle = (id) => (openId === id ? setOpenId() : setOpenId(id));

  const handleCloseSendMailModal = () => {
    setOpenSendModal(false);
    toggle(10);
  };

  useEffect(() => {
    getAvailableEmailTemplate();
    getContactSendEmail();
  }, [currentContactDetail]);

  const deleteContactMassEmailSchedule = async (contactEmailId) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this schedule mass email?',
    });

    if (result.value) {
      const { error } = await cancelScheduleContactEmail({
        _id: contactEmailId?._id,
        jobId: contactEmailId?.jobId,
      });
      if (!error) {
        const tempObj = JSON.parse(JSON.stringify(availableSendContactEmail));
        tempObj?.map((email) => {
          if (email?._id === contactEmailId?._id) {
            email.status = 'CANCELED';
          }
        });
        setAvailableSendContactEmail(tempObj);
      }
    }
  };

  const handleCloseMailStatisticsModal = () => {
    setShowEmailStatisticsModal({
      isModalOpen: false,
      selectedEmail: null,
    });
  };

  const columns = [
    {
      name: 'Subject',
      minWidth: '350px',
      sortable: (row) => row?.subject,
      selector: (row) => row?.subject,
      cell: (row) => <span className='text-capitalize'>{row.subject}</span>,
    },
    {
      name: 'Scheduled Date Tim',
      minWidth: '200px',
      sortable: (row) => row?.subject,
      selector: (row) => row?.subject,
      cell: (row) => (
        <span className='text-capitalize'>
          {moment(new Date(row?.scheduledTime)).format('DD-MM-YY hh:mm A')}
        </span>
      ),
    },
    {
      name: 'Status',
      minWidth: '200px',
      sortable: (row) => row?.status,
      selector: (row) => row?.status,
      cell: (row) => (
        <span className='text-capitalize'>
          <Badge
            className='mb-1'
            color={`light-${selectBadge(row.status)}`}
            pill
          >
            {row?.status.toLowerCase()}
          </Badge>
        </span>
      ),
    },
    {
      name: 'Actions',
      minWidth: '250px',
      maxWidth: '300px',

      allowOverflow: true,
      cell: (row) => {
        const { _id, status, scheduledTime } = row;
        const isPastScheduled =
          new Date().getTime() > new Date(scheduledTime).getTime();
        return (
          <div className='text-primary d-flex mt-md-0 mt-1'>
            <Eye
              size={15}
              className='cursor-pointer me-1'
              onClick={() => {
                setTemplatesPreview(row);
                setPreviewModal(true);
              }}
              id={`view_${_id}`}
            />
            <UncontrolledTooltip
              placement='top'
              autohide={true}
              target={`view_${_id}`}
            >
              {/* View scheduled mass email detail */}
              View
            </UncontrolledTooltip>
            {isPastScheduled && status === 'SUCCESS' ? (
              <>
                <BarChart2
                  size={15}
                  color='#64c664'
                  className={`me-1 ${
                    status === 'SUCCESS'
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (status === 'SUCCESS') {
                      setShowEmailStatisticsModal({
                        isModalOpen: true,
                        selectedEmail: row,
                      });
                    }
                  }}
                  id={`sendgrid_${_id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`sendgrid_${_id}`}
                >
                  View Sendgrid Statistics
                </UncontrolledTooltip>
              </>
            ) : (
              <></>
            )}

            {!isPastScheduled && status === 'PENDING' ? (
              <>
                <XCircle
                  size={15}
                  color='red'
                  className={`me-1 ${
                    status === 'PENDING'
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (status === 'PENDING') {
                      deleteContactMassEmailSchedule(row);
                    }
                  }}
                  id={`cancel_${_id}`}
                />
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`cancel_${_id}`}
                >
                  Cancel scheduled mass email
                </UncontrolledTooltip>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {user?.integration?.sendGrid?.apiKey ? (
        <>
          <div className='contact-email-tab'>
            <div className='contact-email-tab-header d-flex justify-content-between'>
              <Button
                color='primary'
                onClick={() => {
                  setOpenSendModal(true);
                }}
              >
                <Plus size={15} style={{ marginRight: '7px' }} />
                Send Email
              </Button>
              <ButtonGroup className=''>
                <Button
                  tag='label'
                  className={classnames('btn-icon view-btn grid-view-btn', {
                    active: activeView === 'grid',
                  })}
                  color='primary'
                  outline
                  onClick={() => setActiveView('grid')}
                >
                  <Grid size={18} />
                </Button>
                <Button
                  tag='label'
                  className={classnames('btn-icon view-btn list-view-btn', {
                    active: activeView === 'list',
                  })}
                  color='primary'
                  outline
                  onClick={() => setActiveView('list')}
                >
                  <List size={18} />
                </Button>
              </ButtonGroup>
            </div>
            {activeView === 'grid' ? (
              <>
                <Row className='contact-email-card-row hide-scrollbar'>
                  {availableSendContactEmail &&
                  availableSendContactEmail.length > 0 ? (
                    availableSendContactEmail.map((item, key) => {
                      return (
                        <Col
                          className='contact-email-card-col'
                          md='4'
                          sm='4'
                          lg='4'
                          key={key}
                        >
                          <ContactEmailCard
                            setShowEmailStatisticsModal={
                              setShowEmailStatisticsModal
                            }
                            setTemplatesPreview={setTemplatesPreview}
                            setPreviewModal={setPreviewModal}
                            item={item}
                            deleteContactMassEmailSchedule={
                              deleteContactMassEmailSchedule
                            }
                          />
                        </Col>
                      );
                    })
                  ) : (
                    <>
                      {!sendContactEmailLoading && (
                        <div className='noRecordFound__wrapper'>
                          <NoRecordFound />
                        </div>
                      )}
                    </>
                  )}
                </Row>
              </>
            ) : (
              <>
                <div className='contact-email-list-view-wrapper'>
                  <ItemTable
                    hideExport={true}
                    showCard={false}
                    hideButton={true}
                    columns={columns}
                    data={availableSendContactEmail}
                    title={''}
                    itemsPerPage={10}
                    selectableRows={false}
                  />
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <SendGridApiKeyErrorPage />
      )}
      {openSendMailModal && (
        <SendContactEmail
          openSendMailModal={openSendMailModal}
          setOpenSendModal={setOpenSendModal}
          handleCloseSendMailModal={handleCloseSendMailModal}
          availableEmailTemplate={availableEmailTemplate}
          currentContactDetail={currentContactDetail}
          availableSendContactEmail={availableSendContactEmail}
          setAvailableSendContactEmail={setAvailableSendContactEmail}
          params={params}
        />
      )}
      {showEmailStatisticsModal.isModalOpen && (
        <ShowContactEmailStatistics
          showEmailStatisticsModal={showEmailStatisticsModal}
          handleCloseMailStatisticsModal={handleCloseMailStatisticsModal}
        />
      )}
      {previewModal && (
        <ContactEmailTemplatePreviewModal
          templatePreview={templatePreview}
          previewModal={previewModal}
          setPreviewModal={setPreviewModal}
          setTemplatesPreview={setTemplatesPreview}
        />
      )}
    </>
  );
};
