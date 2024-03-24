import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import { Button } from 'reactstrap';
import { Plus } from 'react-feather';
import { useGetDirectMail } from '../hooks/useApi';

function DirectMailListView({ columns, onClickAdd }, ref) {
  const tableRef = useRef(null);
  const [emailTemplates, setEmailTemplates] = useState({
    results: [],
    total: 0,
  });
  const [currentFilters, setCurrentFilters] = useState({
    limit: 10,
    page: 1,
    search: '',
    sort: null,
  });

  const { getDirectMail: getEmailTemplatesApi, isLoading: fetching } =
    useGetDirectMail();

  const getEmailTemplates = async (filter) => {
    try {
      setCurrentFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getEmailTemplatesApi({
        select: 'title,contacts,directMailTemplate',
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      setEmailTemplates({
        results: data?.results || [],
        total: data?.pagination?.total || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const header = () => {
    return (
      <div className='card-header-with-buttons card-header'>
        <h4 className='title card-title'>Direct Mail</h4>
        <div className='button-wrapper'>
          {/* <div
            className='btn-group'
            style={{ marginRight: '10px' }}
            md='2'
            sm='2'
          >
            <ExportData model='emailTemplate' query={currentFilters} />
          </div> */}
          <Button
            className='d-inline-flex'
            color='primary'
            onClick={onClickAdd}
          >
            <Plus size={15} />
            <span className='align-middle ms-50'>{'Create New'}</span>
          </Button>
        </div>
      </div>
    );
  };

  useImperativeHandle(ref, () => ({
    async removeRecordRefreshTable() {
      // check if the last record in the table is being deleted
      if ((emailTemplates.total - 1) % currentFilters.limit === 0) {
        tableRef.current.refreshTable({
          filterArgs: { ...currentFilters, page: currentFilters.page - 1 || 1 },
        });
        setCurrentFilters({
          ...currentFilters,
          page: currentFilters.page - 1,
        });
      } else {
        setCurrentFilters({
          ...currentFilters,
        });
        tableRef.current.refreshTable({
          filterArgs: { ...currentFilters },
        });
      }
    },
    async refreshTable() {
      setCurrentFilters({
        ...currentFilters,
      });
      tableRef.current.refreshTable({
        filterArgs: { ...currentFilters },
      });
    },
  }));

  return (
    <>
      <ServerSideTable
        ref={tableRef}
        blocking={fetching}
        selectableRows={false}
        columns={columns}
        getRecord={(filters) => getEmailTemplates(filters)}
        data={emailTemplates}
        itemsPerPage={currentFilters.limit}
        header={header()}
      />
    </>
  );
}

export default forwardRef(DirectMailListView);
