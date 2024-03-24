// ==================== Packages =======================
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isArray } from 'lodash';
// ====================================================
import UILoader from '@components/ui-loader';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import ItemTable from '../../../../@core/components/data-table';
import { useQuoteColumns } from './hooks/useQuoteColumn';
import { useDeleteQuote, useGetQuotes, useSendQuote } from './hooks/quoteApis';
import { Button, ButtonGroup, Col, Row } from 'reactstrap';
import { Grid, List } from 'react-feather';
import classnames from 'classnames';
import QuoteCardList from './components/QuoteCardList';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import ExportData from '../../../../components/ExportData';

const Quotes = () => {
  // ========================== Hooks ================================
  const history = useHistory();

  // ========================== states ================================
  const [quotes, setQuotes] = useState([]);
  const [activeView, setActiveView] = useState('grid');

  // ========================== Custom Hooks ==========================
  const { basicRoute } = useGetBasicRoute();
  const { getQuotes, isLoading } = useGetQuotes();
  const { deleteQuote } = useDeleteQuote();
  const { sendQuote, isLoading: sendQuoteLoading } = useSendQuote();

  useEffect(() => {
    getRecords(false);
  }, []);

  const getRecords = async () => {
    const { data, error } = await getQuotes({
      select:
        'quoteId,customer,quoteDate,dueDate,status,expiryDate,quoteDate,slug',
    });
    if (!error) setQuotes(data);
  };

  const { quoteColumns } = useQuoteColumns({
    sendQuoteLoading,
    sendQuote,
    reloadQuote: getRecords,
  });
  // delete start >>>
  const handleDelete = async (id = null) => {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Quote?',
    });

    if (result.value) {
      const { error } = await deleteQuote(id, 'Delete Quote..');

      if (!error) {
        if (isArray(quotes)) {
          const tempQuotes = quotes?.filter((obj) => obj?._id !== id);
          if (isArray(quotes)) setQuotes(tempQuotes);
        }
      }
    }
  };
  // delete end >>>

  const addNewQuote = () => {
    history.push(`${basicRoute}/quote/add`);
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
              ExportData={<ExportData model='quote' />}
              sendQuoteLoading={sendQuoteLoading}
              columns={quoteColumns({ handleDelete })}
              data={quotes}
              title='Quotes'
              addItemLink={false}
              onClickAdd={addNewQuote}
              buttonTitle={'Add Quote'}
              itemsPerPage={10}
            />
          </>
        ) : (
          <QuoteCardList
            sendQuoteLoading={sendQuoteLoading}
            sendQuote={sendQuote}
            quoteData={quotes}
            onClickAdd={addNewQuote}
            handleDelete={handleDelete}
            isLoading={isLoading}
            reloadQuote={getRecords}
          />
        )}
      </UILoader>
    </>
  );
};

export default Quotes;
