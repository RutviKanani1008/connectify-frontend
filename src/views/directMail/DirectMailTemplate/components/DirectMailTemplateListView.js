import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import ServerSideTable from '../../../../@core/components/data-table/ServerSideTable';
import { useGetDirectMailTemplates } from '../services';

function EmailTemplateListView({ columns, folder }, ref) {
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

  const {
    getDirectMailTemplates: getDirectMailTemplatesApi,
    isLoading: fetching,
  } = useGetDirectMailTemplates();

  const getEmailTemplates = async (filter) => {
    try {
      setCurrentFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getDirectMailTemplatesApi({
        folder,
        select: 'name,description',
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
    return <></>;
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
    <ServerSideTable
      ref={tableRef}
      blocking={fetching}
      selectableRows={false}
      columns={columns}
      getRecord={(filters) => getEmailTemplates(filters)}
      data={emailTemplates}
      itemsPerPage={currentFilters.limit}
      header={header()}
      searchPlaceholder={'Search direct mail templates here...'}
    />
  );
}

export default forwardRef(EmailTemplateListView);
