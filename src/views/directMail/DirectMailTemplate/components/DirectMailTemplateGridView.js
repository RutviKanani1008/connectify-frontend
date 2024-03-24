/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  useCloneDirectMailTemplateMutation,
  useDeleteDirectMailTemplateMutation,
  useLazyGetDirectMailTemplatesQuery,
} from '../../../../redux/api/directMailTemplateApi';
import { Button, Col, Row, Spinner } from 'reactstrap';
import DirectMailTemplateCard from './DirectMailTemplateCard';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { showWarnAlert } from '../../../../helper/sweetalert.helper';
import { TOASTTYPES, showToast } from '../../../../utility/toast-helper';
import NoRecordFound from '../../../../@core/components/data-table/NoRecordFound';
import { ReactSortable } from 'react-sortablejs';
import { useUpdateDirectMailTemplateFolderOrder } from '../services';

const initialFilters = {
  limit: 9,
  page: 1,
  search: '',
  sort: { order: 1 },
};
const DirectMailTemplateGridView = (props) => {
  const {
    folder,
    setCurrentTemplate,
    setIsOpen,
    setCurrentFolders,
    currentFolders,
  } = props;
  const history = useHistory();

  // ** State **
  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  const [templates, setTemplates] = useState({
    data: [],
    total: 0,
  });

  // ** APIS **
  const [deleteDirectMailTemplate] = useDeleteDirectMailTemplateMutation();
  const [cloneDirectMailTemplate] = useCloneDirectMailTemplateMutation();

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();
  const { updateDirectMailTemplateFolderOrder } =
    useUpdateDirectMailTemplateFolderOrder();

  useEffect(() => {
    if (folder) {
      getDirectMailTemplatesFunc();
    }
  }, [
    currentFilters.limit,
    currentFilters.page,
    currentFilters.search,
    currentFilters.sort,
    folder,
  ]);

  const [getDirectMailTemplates, { isFetching, currentData }] =
    useLazyGetDirectMailTemplatesQuery();

  const getDirectMailTemplatesFunc = async () => {
    await getDirectMailTemplates({
      params: {
        folder,
        select: 'name,description',
        limit: currentFilters.limit,
        page: currentFilters.page,
        search: currentFilters.search,
        sort: currentFilters.sort,
      },
    });
  };

  useEffect(() => {
    if (
      _.isArray(currentData?.data?.results) &&
      currentData?.data?.pagination
    ) {
      if (currentFilters.page === 1) {
        setTemplates({
          data: [...currentData.data.results].map((obj) => ({
            ...obj,
            id: obj._id,
          })),
          total: currentData.data.pagination.total,
        });
      } else {
        setTemplates({
          data: [...templates.data, ...currentData.data.results].map((obj) => ({
            ...obj,
            id: obj._id,
          })),
          total: currentData.data.pagination.total,
        });
      }
    }
  }, [currentData]);

  const handleConfirmDelete = async (id) => {
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this template?',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const toastId = showToast(TOASTTYPES.loading);
        const result = await deleteDirectMailTemplate({ id });
        if (result?.data?.data) {
          showToast(
            TOASTTYPES.success,
            toastId,
            'Template Deleted Successfully'
          );
          setCurrentFolders([
            ...currentFolders.map((individualFolder) => {
              if (individualFolder._id === folder) {
                individualFolder.totalCounts = individualFolder.totalCounts - 1;
              }
              return individualFolder;
            }),
          ]);
          refreshData();
          return true;
        }
      },
    });
  };

  const handleConfirmClone = async (id) => {
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to clone this template?',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const toastId = showToast(TOASTTYPES.loading);
        const result = await cloneDirectMailTemplate({ id });
        if (result?.data?.data) {
          showToast(TOASTTYPES.success, toastId, 'Template Clone Successfully');
          refreshData();
          setCurrentFolders([
            ...currentFolders.map((individualFolder) => {
              if (individualFolder._id === folder) {
                individualFolder.totalCounts = individualFolder.totalCounts + 1;
              }
              return individualFolder;
            }),
          ]);
          return true;
        }
      },
    });
  };

  const refreshData = () => {
    if (_.isEqual(initialFilters, currentFilters)) {
      getDirectMailTemplatesFunc();
    } else {
      setCurrentFilters({ ...initialFilters });
    }
  };

  return (
    <>
      {isFetching ? (
        <div className='loader-wrapper'>
          <Spinner />
        </div>
      ) : (
        <>
          <div
            className={`company-email-inner-scroll hide-scrollbar ${
              currentFilters.limit * currentFilters.page < templates.total &&
              'load-more-active'
            }`}
          >
            <Row className='company-email-temp-card-row'>
              <ReactSortable
                className='direct-mail-template-folder'
                group='direct-mail-template-folder'
                list={templates.data}
                setList={(newList) => {
                  if (!_.isEqual(templates.data, newList) && newList.length) {
                    setTemplates((prev) => ({ ...prev, data: newList }));
                    updateDirectMailTemplateFolderOrder(
                      newList.map((obj) => ({
                        _id: obj._id,
                        folder: folder === 'unassigned' ? null : folder,
                      }))
                    );
                  }
                }}
                animation={250}
              >
                {templates.data.length > 0 ? (
                  templates.data.map((template, key) => (
                    <Col
                      id={template.id}
                      className='company-email-temp-card-col'
                      md='4'
                      key={key}
                    >
                      <DirectMailTemplateCard
                        basicRoute={basicRoute}
                        history={history}
                        template={template}
                        setCurrentTemplate={setCurrentTemplate}
                        setIsOpen={setIsOpen}
                        handleConfirmDelete={handleConfirmDelete}
                        handleConfirmClone={handleConfirmClone}
                      />
                    </Col>
                  ))
                ) : (
                  <div className='d-flex justify-content-center m-4'>
                    {!isFetching && <NoRecordFound />}
                  </div>
                )}
              </ReactSortable>
            </Row>
          </div>
          {currentFilters.limit * currentFilters.page < templates.total && (
            <div className='text-center loadMore-btn-wrapper'>
              <Button
                outline={true}
                color='primary'
                onClick={() => {
                  setCurrentFilters({
                    ...currentFilters,
                    page: currentFilters.page + 1,
                  });
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default DirectMailTemplateGridView;
