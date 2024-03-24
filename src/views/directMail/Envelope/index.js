import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle } from 'reactstrap';
import _ from 'lodash';
import { Plus } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { showToast, TOASTTYPES } from '@src/utility/toast-helper';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import UILoader from '../../../@core/components/ui-loader';
import EnvelopePreviewModal from './components/EnvelopePreviewModal';
import EnvelopeCard from './components/EnvelopeCard';
import {
  useCloneEnvelopeMutation,
  useDeleteEnvelopeMutation,
  useLazyGetEnvelopesQuery,
} from '../../../redux/api/envelopeApi';
import NoRecordFound from '../../../@core/components/data-table/NoRecordFound';
import useGetBasicRoute from '../../../hooks/useGetBasicRoute';
import { handlePrintHelper } from './helper';
import { ENVELOPE_SIZE_MAPPER } from './constant';

const initialFilters = {
  limit: 9,
  page: 1,
  search: '',
  sort: null,
};

const Envelope = () => {
  // ** Hooks Vars **
  const history = useHistory();

  // ** State
  const [isOpen, setIsOpen] = useState({
    add: false,
    preview: false,
    edit: false,
  });
  const [templates, setTemplates] = useState({
    data: [],
    total: 0,
  });
  const [currentTemplate, setCurrentTemplate] = useState({});
  const [currentFilters, setCurrentFilters] = useState(initialFilters);

  // ** APIS **
  const [getEnvelopes, { isFetching, currentData }] =
    useLazyGetEnvelopesQuery();
  const [deleteEnvelope] = useDeleteEnvelopeMutation();
  const [cloneEnvelope] = useCloneEnvelopeMutation();

  // ** Custom Hooks **
  const { basicRoute } = useGetBasicRoute();

  useEffect(() => {
    getEnvelopesFunc(currentFilters);
  }, [
    currentFilters.limit,
    currentFilters.page,
    currentFilters.search,
    currentFilters.sort,
  ]);

  useEffect(() => {
    if (
      _.isArray(currentData?.data?.results) &&
      currentData?.data?.pagination
    ) {
      if (currentFilters.page === 1) {
        setTemplates({
          data: [...currentData.data.results],
          total: currentData.data.pagination.total,
        });
      } else {
        setTemplates({
          data: [...templates.data, ...currentData.data.results],
          total: currentData.data.pagination.total,
        });
      }
    }
  }, [currentData]);

  const getEnvelopesFunc = async () => {
    await getEnvelopes({
      params: {
        select: 'name,body',
        limit: currentFilters.limit,
        page: currentFilters.page,
        search: currentFilters.search,
        sort: currentFilters.sort,
      },
    });
  };

  const handleConfirmDelete = async (id) => {
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this envelope?',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const toastId = showToast(TOASTTYPES.loading);
        const result = await deleteEnvelope({ id });
        if (result?.data?.data) {
          showToast(
            TOASTTYPES.success,
            toastId,
            'Envelope Deleted Successfully'
          );
          refreshData();
          return true;
        }
      },
    });
  };

  const handleConfirmClone = async (id) => {
    await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to clone this envelope?',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const toastId = showToast(TOASTTYPES.loading);
        const result = await cloneEnvelope({ id });
        if (result?.data?.data) {
          showToast(TOASTTYPES.success, toastId, 'Envelope Clone Successfully');
          refreshData();
          return true;
        }
      },
    });
  };

  const refreshData = () => {
    if (_.isEqual(initialFilters, currentFilters)) {
      getEnvelopesFunc();
    } else {
      setCurrentFilters({ ...initialFilters });
    }
  };

  const handlePrint = (body) => {
    const heightInPx = body.envelopeSize
      ? `${ENVELOPE_SIZE_MAPPER[body.envelopeSize].height}px`
      : `${Math.round((+body.height * 500) / 100)}px`;
    const widthInPx = body.envelopeSize
      ? `${ENVELOPE_SIZE_MAPPER[body.envelopeSize].width}px`
      : `${Math.round((+body.width * 1177) / 100)}px`;
    handlePrintHelper({
      body: body.body,
      heightInPx,
      widthInPx,
      marginInPx: body.margin,
    });
  };

  return (
    <>
      <Card className='direct__mail__card envelope-card'>
        <CardHeader>
          <CardTitle tag='h4' className=''>
            Envelope
          </CardTitle>
          <Button
            className='ms-2'
            color='primary'
            onClick={() => {
              history.push(`${basicRoute}/envelope/add`);
            }}
          >
            <Plus size={15} />
            <span className='align-middle ms-50'>Add New</span>
          </Button>
        </CardHeader>
        <div className='mobile__scroll__wrapper'>
          <CardBody
            className={`hide-scrollbar ${
              currentFilters.limit * currentFilters.page < templates.total &&
              'load-more-active'
            }`}
          >
            <UILoader blocking={isFetching}>
              <div
                className={`company-email-inner-scroll hide-scrollbar ${
                  currentFilters.limit * currentFilters.page <
                    templates.total && 'load-more-active'
                }`}
              >
                <div className='company-email-temp-card-row'>
                  <div className='envelope-listing-table'>
                    <div className='table-header'>
                      <div className='table-row'>
                        <div className='table-cell'>Template Name</div>
                        <div className='table-cell'>Action</div>
                      </div>
                    </div>
                    <div className='table-body'>
                      {templates.data.length > 0 ? (
                        templates.data.map((template, key) => (
                          <div className='table-row' key={key}>
                            <EnvelopeCard
                              handlePrint={handlePrint}
                              setIsOpen={setIsOpen}
                              basicRoute={basicRoute}
                              template={template}
                              setCurrentTemplate={setCurrentTemplate}
                              history={history}
                              handleConfirmDelete={handleConfirmDelete}
                              handleConfirmClone={handleConfirmClone}
                            />
                          </div>
                        ))
                      ) : (
                        <NoRecordFound />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </UILoader>
          </CardBody>
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
        </div>
      </Card>
      {isOpen.preview && (
        <EnvelopePreviewModal
          setIsOpen={(value) => {
            setIsOpen((prev) => ({
              ...prev,
              preview: value,
            }));
            setCurrentTemplate({});
          }}
          isOpen={isOpen.preview}
          currentTemplate={currentTemplate}
        />
      )}
    </>
  );
};

export default Envelope;
