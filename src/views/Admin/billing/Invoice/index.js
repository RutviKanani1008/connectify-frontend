// ==================== Packages =======================
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isArray } from 'lodash';
// ====================================================
import UILoader from '@components/ui-loader';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import ItemTable from '../../../../@core/components/data-table';
import { useInvoiceColumns } from './hooks/useInvoiceColumn';
import {
  useDeleteInvoice,
  useGetInvoices,
  useSendInvoice,
} from './hooks/invoiceApis';
import { Button, ButtonGroup, Col, Row } from 'reactstrap';
import { Grid, List } from 'react-feather';
import classnames from 'classnames';
import InvoiceCardList from './components/InvoiceCardList';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import ExportData from '../../../../components/ExportData';

const Invoices = () => {
  // ========================== Hooks ================================
  const history = useHistory();

  // ========================== states ================================
  const [Invoices, setInvoices] = useState([]);
  const [activeView, setActiveView] = useState('grid');

  // ========================== Custom Hooks ==========================
  const { basicRoute } = useGetBasicRoute();
  const { getInvoices, isLoading } = useGetInvoices();
  const { deleteInvoice } = useDeleteInvoice();
  const { sendInvoice, isLoading: sendInvoiceLoading } = useSendInvoice();

  useEffect(() => {
    getRecords(false);
  }, []);

  const getRecords = async () => {
    const { data, error } = await getInvoices();

    if (!error) setInvoices(data);
  };
  const { invoiceColumns } = useInvoiceColumns({
    sendInvoiceLoading,
    sendInvoice,
    reloadInvoice: getRecords,
  });

  // delete start >>>
  const handleDelete = async (id = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Invoice?',
    });

    if (result.value) {
      const { error } = await deleteInvoice(id, 'Delete Invoice..');

      if (!error) {
        if (isArray(Invoices)) {
          const tempInvoices = Invoices?.filter((obj) => obj?._id !== id);
          if (isArray(Invoices)) setInvoices(tempInvoices);
        }
      }
    }
  };
  // delete end >>>

  const addNewInvoice = () => {
    history.push(`${basicRoute}/invoice/add`);
  };

  return (
    <>
      <div className='document-header mb-1'>
        <Row>
          <Col sm='12'>
            <div className='document-header-items'>
              <div className='result-toggler'>
                <span className='search-results'></span>
              </div>
              <div className='view-options d-flex'>
                <ButtonGroup>
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
            </div>
          </Col>
        </Row>
      </div>
      <UILoader blocking={isLoading}>
        {activeView === 'list' ? (
          <>
            <ItemTable
              ExportData={<ExportData model='invoice' />}
              sendInvoiceLoading={sendInvoiceLoading}
              columns={invoiceColumns({ handleDelete })}
              data={Invoices}
              title='Invoices'
              addItemLink={false}
              onClickAdd={addNewInvoice}
              buttonTitle={'Add Invoice'}
              itemsPerPage={10}
            />
          </>
        ) : (
          <InvoiceCardList
            sendInvoiceLoading={sendInvoiceLoading}
            sendInvoice={sendInvoice}
            invoiceData={Invoices}
            onClickAdd={addNewInvoice}
            handleDelete={handleDelete}
            reloadInvoice={getRecords}
          />
        )}
      </UILoader>
    </>
  );
};

export default Invoices;
