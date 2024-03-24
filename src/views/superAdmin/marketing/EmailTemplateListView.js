import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import ServerSideTable from '../../../@core/components/data-table/ServerSideTable';
import { useGetEmailTemplates } from './hooks/useApis';

function EmailTemplateListView({ columns, currentFolder }, ref) {
  const tableRef = useRef(null);
  const [emailTemplates, setEmailTemplates] = useState({
    results: [],
    total: 0,
  });
  const [currentFilters, setCurretFilters] = useState({
    limit: 10,
    page: 1,
    search: '',
    sort: null,
  });

  const { getEmailTemplates: getEmailTemplatesApi, isLoading: fetching } =
    useGetEmailTemplates();

  const getEmailTemplates = async (filter) => {
    try {
      setCurretFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getEmailTemplatesApi({
        folder: currentFolder,
        select:
          'name,company,subject,name,body,status,htmlBody,jsonBody,isAutoResponderTemplate,tags,folder',
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
        getRecord={(filters) => getEmailTemplates(filters)}
        data={emailTemplates}
        itemsPerPage={currentFilters.limit}
        header={header()}
        searchPlaceholder={'Search email templates here...'}
      />
    </>
  );
}

export default forwardRef(EmailTemplateListView);
