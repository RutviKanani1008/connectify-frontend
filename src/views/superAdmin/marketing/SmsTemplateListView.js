import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import ServerSideTable from '../../../@core/components/data-table/ServerSideTable';
import { useGetSmsTemplates } from './hooks/useApis';
import { Button } from 'reactstrap';
import { Plus } from 'react-feather';
import ExportData from '../../../components/ExportData';

function SmsTemplateListView({ columns, onClickAdd }, ref) {
  const tableRef = useRef(null);
  const [smsTemplates, setSmsTemplates] = useState({
    results: [],
    total: 0,
  });
  const [currentFilters, setCurretFilters] = useState({
    limit: 10,
    page: 1,
    search: '',
    sort: null,
  });

  const { getSmsTemplates: getSmsTemplatesApi, isLoading: fetching } =
    useGetSmsTemplates();

  const getSmsTemplates = async (filter) => {
    try {
      setCurretFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getSmsTemplatesApi({
        select: 'name,company,name,body',
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      setSmsTemplates({
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
        <h4 className='title card-title'>SMS Templates</h4>
        <div className='button-wrapper'>
          <div
            className='btn-group'
            style={{ marginRight: '10px' }}
            // HELLO-D
            // md='2'
            // sm='2'
          >
            <ExportData model='smsTemplate' query={currentFilters} />
          </div>
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
      if ((smsTemplates.total - 1) % currentFilters.limit === 0) {
        tableRef.current.refreshTable({
          filterArgs: { ...currentFilters, page: currentFilters.page - 1 || 1 },
        });
        setCurretFilters({
          ...currentFilters,
          page: currentFilters.page - 1,
        });
      } else {
        setCurretFilters({
          ...currentFilters,
        });
        tableRef.current.refreshTable({
          filterArgs: { ...currentFilters },
        });
      }
    },
    async refreshTable() {
      setCurretFilters({
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
        getRecord={(filters) => getSmsTemplates(filters)}
        data={smsTemplates}
        itemsPerPage={currentFilters.limit}
        header={header()}
      />
    </>
  );
}

export default forwardRef(SmsTemplateListView);
