import classNames from 'classnames';
import React, { useState, useRef } from 'react';
import { Grid, List } from 'react-feather';
import { Button, ButtonGroup, Card } from 'reactstrap';

import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import DirectMailGridView from './components/DirectMailGridView';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import DirectMailListView from './components/DirectMailListView';
import { useHistory } from 'react-router-dom';
import { ViewDirectMailModal } from './components/ViewDirectMailModal';
import DirectMailPrint from '../DirectMailTemplate/components/DirectMailPrint';
import { useReactToPrint } from 'react-to-print';
import SendDirectMailViaLobPreviewModal from './components/SendDirectMailViaLobPreviewModal';
import { useDirectMailColumns } from './hooks/useDirectMailColumns';
import {
  useDeleteDirectMail,
  useGetSelectedContactsForDirectMailAPI,
} from './hooks/useApi';
import { useLazyGetDirectMailTemplateQuery } from '../../../redux/api/directMailTemplateApi';
const MySwal = withReactContent(Swal);

const DirectMailList = () => {
  // ** Hooks **
  const history = useHistory();

  // ** State **
  const [showDirectMailModal, setShowDirectMailModal] = useState({
    isPreviewShow: false,
    currentDirectMail: null,
    sendDirectMailViaLobPreview: false,
  });
  const [activeView, setActiveView] = useState('grid');
  const [dataKey, setDataKey] = useState(Math.random());
  const [currentMailData, setCurrentMailData] = useState({});
  const [currentLoadingId, setCurrentLoadingId] = useState('');
  const [specificDirectMailContacts, setSpecificDirectMailContacts] = useState(
    []
  );

  // ** Ref **
  const listView = useRef(null);
  const templatePrintRef = useRef(null);

  // ** APIS **
  const { getDirectMailContactsAPI } = useGetSelectedContactsForDirectMailAPI();
  const [getDirectMailTemplate] = useLazyGetDirectMailTemplateQuery();

  // ** Custom Hooks **
  const handlePrintNote = useReactToPrint({
    content: () => templatePrintRef.current,
  });
  const { basicRoute } = useGetBasicRoute();
  const { deleteDirectMail } = useDeleteDirectMail();

  const columns = useDirectMailColumns({
    onEdit: (row) => {
      history.push(`${basicRoute}/direct-mail/${row?._id}`);
    },
    onDelete: handleConfirmDelete,
    getSpecifTemplateContactsDetail,
    currentLoadingId,
  });

  function handleConfirmDelete(item) {
    return MySwal.fire({
      title: 'Are you sure?',
      text: `Are you sure you would like to delete this direct mail ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(async function (result) {
      if (result.value) {
        const { error } = await deleteDirectMail(item._id, 'Deleting...');
        if (!error) {
          setDataKey(Math.random());
          listView.current && listView.current.removeRecordRefreshTable();
        }
      }
    });
  }

  const onDirectMailPreviewModalClose = () => {
    setShowDirectMailModal({
      isPreviewShow: false,
      currentDirectMail: null,
      sendDirectMailViaLobPreview: false,
    });
  };

  async function getSpecifTemplateContactsDetail(item) {
    if (item.directMailTemplate?._id) {
      setCurrentLoadingId(item._id);
      const template = await getDirectMailTemplate({
        id: item.directMailTemplate?._id,
      });
      const { data } = await getDirectMailContactsAPI(item._id, {
        params: {
          page: 1,
          limit: 10000,
        },
      });
      setSpecificDirectMailContacts(data.results);
      setCurrentMailData({
        ...item,
        directMailTemplate: {
          type: template?.data?.data?.type,
          postcardBack: template?.data?.data?.postcardBack,
          postcardFront: template?.data?.data?.postcardFront,
          body: template?.data?.data?.body,
          header: template?.data?.data?.header,
          footer: template?.data?.data?.footer,
        },
      });
      setTimeout(() => {
        handlePrintNote();
        setCurrentLoadingId('');
      }, 1000);
    }
  }

  return (
    <>
      <Card className='email-template-card directmail-template-card'>
        <div className='inner-card-wrapper'>
          <ButtonGroup className='grid-card-view-toggle-btns'>
            <Button
              tag='label'
              className={classNames('btn-icon view-btn grid-view-btn', {
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
              className={classNames('btn-icon view-btn list-view-btn', {
                active: activeView === 'list',
              })}
              color='primary'
              outline
              onClick={() => setActiveView('list')}
            >
              <List size={18} />
            </Button>
          </ButtonGroup>
          {activeView === 'grid' ? (
            <>
              <DirectMailGridView
                handleConfirmDelete={handleConfirmDelete}
                setShowDirectMailPreview={setShowDirectMailModal}
                key={`${dataKey}_grid`}
                getSpecifTemplateContactsDetail={
                  getSpecifTemplateContactsDetail
                }
                currentLoadingId={currentLoadingId}
              />
            </>
          ) : (
            <div className='email-template-list-view'>
              <DirectMailListView
                columns={columns}
                onClickAdd={() => {
                  history.push(`${basicRoute}/direct-mail/add`);
                }}
                ref={listView}
              />
            </div>
          )}
        </div>
      </Card>
      {showDirectMailModal.isPreviewShow && (
        <ViewDirectMailModal
          currentDirectMailDetails={showDirectMailModal.currentDirectMail}
          openDirectMailPreview={showDirectMailModal.isPreviewShow}
          onDirectMailPreviewModalClose={onDirectMailPreviewModalClose}
        />
      )}

      <DirectMailPrint
        type={currentMailData?.directMailTemplate?.type}
        postcardBack={currentMailData?.directMailTemplate?.postcardBack}
        postcardFront={currentMailData?.directMailTemplate?.postcardFront}
        body={currentMailData?.directMailTemplate?.body || ''}
        header={currentMailData?.directMailTemplate?.header || ''}
        footer={currentMailData?.directMailTemplate?.footer || ''}
        ref={templatePrintRef}
        contacts={specificDirectMailContacts}
      />

      <SendDirectMailViaLobPreviewModal
        isOpen={showDirectMailModal.sendDirectMailViaLobPreview}
        onModalClose={onDirectMailPreviewModalClose}
        currentDirectMailDetails={showDirectMailModal.currentDirectMail}
      />
    </>
  );
};

export default DirectMailList;
