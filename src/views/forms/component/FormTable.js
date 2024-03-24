import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import ServerSideTable from '../../../@core/components/data-table/ServerSideTable';
import { useGetCompanyForms } from '../hooks/useApis';
import { CardHeader, CardTitle } from 'reactstrap';
import ExportData from '../../../components/ExportData';
import { useSelector } from 'react-redux';
import { userData } from '../../../redux/user';

function FormTable({ archived = false, columns }, ref) {
  const tableRef = useRef(null);
  const [forms, setForms] = useState({
    results: [],
    total: 0,
  });
  const [currentFilters, setCurretFilters] = useState({
    limit: 10,
    page: 1,
    search: '',
    sort: null,
  });
  const user = useSelector(userData);

  const { getCompanyForms, isLoading: fetching } = useGetCompanyForms();

  const getForms = async (filter, archived) => {
    try {
      setCurretFilters({
        limit: filter.limit,
        page: filter.page,
        search: filter.search,
        sort: filter.sort,
      });
      const { data } = await getCompanyForms({
        limit: filter.limit,
        page: filter.page,
        sort: filter.sort,
        search: filter.search,
        select:
          'title,archived,active,slug,fields,showDescription,showTitle,showCompanyName,showLogo',
        archived,
        companyId: user?.company._id,
      });
      setForms({
        results: data?.results || [],
        total: data?.pagination?.total || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const header = () => {
    return (
      <CardHeader>
        <CardTitle tag='h4' className='mb-0'>
          {!archived ? 'Forms' : 'Deleted Forms'}
        </CardTitle>
        <div className='d-inline-flex align-items-center justify-content-end'>
          <div className='d-inline-flex'>
            {
              <ExportData
                model='form'
                query={{ ...currentFilters, archived }}
              />
            }
          </div>
        </div>
      </CardHeader>
    );
  };

  useImperativeHandle(ref, () => ({
    async removeRecordRefreshTable() {
      // check if the last record in the table is being deleted
      if ((forms.total - 1) % currentFilters.limit === 0) {
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
    <ServerSideTable
      ref={tableRef}
      blocking={fetching}
      selectableRows={false}
      columns={columns}
      getRecord={(filters) => getForms(filters, archived)}
      data={forms}
      itemsPerPage={currentFilters.limit}
      header={header()}
    />
  );
}

export default forwardRef(FormTable);
