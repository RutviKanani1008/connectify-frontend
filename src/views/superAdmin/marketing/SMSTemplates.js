import classNames from 'classnames';
import React, { useState, useRef } from 'react';
import { Grid, List } from 'react-feather';
import { Button, ButtonGroup, Card } from 'reactstrap';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { TOASTTYPES, showToast } from '../../../utility/toast-helper';
import { cloneSmsTemplate, deleteSmsTemplate } from '../../../api/smsTemplates';
import SendTestSMSModal from '../../templates/components/SendTestSMSModal';
import { TemplateForm } from '../inter-communication-template/TemplateForm';
import { useSMSTemplateColumns } from './hooks/useTemplateColumns';
import SmsTemplateListView from './SmsTemplateListView';
import SmsTemplateGridView from './SmsTemplateGridView';

const MySwal = withReactContent(Swal);

const SMSTemplates = () => {
  const [activeView, setActiveView] = useState('grid');
  const [showForm, setShowForm] = useState(false);

  const [currentTemplates, setCurrentTemplates] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [openSmsModal, setOpenSmsModal] = useState(false);
  const [dataKey, setDataKey] = useState(Math.random());
  const listView = useRef(null);

  const smsColumns = useSMSTemplateColumns({
    onEdit: (row) => {
      setEditItem(row);
      setShowForm(true);
    },
    onClone: cloneTemplateDetails,
    onSend: sendTestSMS,
    onDelete: handleConfirmDelete,
  });

  function handleConfirmDelete(item, type) {
    return MySwal.fire({
      title: 'Are you sure?',
      text: `Are you sure you would like to delete this ${type} template ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        const toastId = showToast(TOASTTYPES.loading, '', 'Deleting...');

        deleteSmsTemplate(item._id)
          .then((res) => {
            if (res.error) {
              showToast(TOASTTYPES.error, toastId, res.error);
            } else {
              listView.current && listView.current.removeRecordRefreshTable();
              setDataKey(Math.random());
              showToast(
                TOASTTYPES.success,
                toastId,
                'Template Deleted Successfully'
              );
            }
          })
          .catch(() => {});
      }
    });
  }

  function sendTestSMS(item) {
    setCurrentTemplates(item);
    setOpenSmsModal(true);
  }

  function cloneTemplateDetails(id, type) {
    return MySwal.fire({
      title: 'Are you sure?',
      text: `Are you sure you would like to clone ${type} this template ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ms-1',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        const toastId = showToast(TOASTTYPES.loading, '', 'Clone Templates...');

        cloneSmsTemplate(id).then((res) => {
          if (res.error) {
            showToast(TOASTTYPES.error, toastId, res.error);
          } else {
            if (res.data.data) {
              listView.current && listView.current.refreshTable();
              setDataKey(Math.random());
              showToast(
                TOASTTYPES.success,
                toastId,
                'Template Cloned Successfully'
              );
            }
          }
        });
      }
    });
  }

  const onSave = () => {
    listView.current && listView.current.refreshTable();
    setDataKey(Math.random());
  };
  return (
    <>
      <Card className='company-template-tab-card sms-template-card'>
        <ButtonGroup className="grid-card-view-toggle-btns">
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
            <SmsTemplateGridView
              cloneTemplateDetails={cloneTemplateDetails}
              setEditItem={setEditItem}
              setShowForm={setShowForm}
              handleConfirmDelete={handleConfirmDelete}
              sendTestSMS={sendTestSMS}
              key={`${dataKey}_grid`}
            />
          </>
        ) : (
          <SmsTemplateListView
            columns={smsColumns}
            onClickAdd={() => {
              setShowForm(true);
            }}
            ref={listView}
          />
        )}
      </Card>

      <TemplateForm
        isOpen={showForm}
        setIsOpen={setShowForm}
        templateType={'sms'}
        values={editItem}
        setEditItem={setEditItem}
        onSave={onSave}
      />

      {/* Send Test SMS Modal */}
      <SendTestSMSModal
        openSmsModal={openSmsModal}
        setCurrentTemplates={setCurrentTemplates}
        setOpenSmsModal={setOpenSmsModal}
        currentTemplates={currentTemplates}
      />
    </>
  );
};

export default SMSTemplates;
