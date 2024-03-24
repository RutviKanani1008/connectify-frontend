import _ from 'lodash';
import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  Bookmark,
  Calendar,
  Eye,
  Grid,
  List,
  Mail,
  MessageSquare,
  Paperclip,
  PhoneCall,
  Plus,
  Trash,
  User,
} from 'react-feather';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import UILoader from '@components/ui-loader';
import {
  useDeleteReportProblem,
  useGetReportProblemById,
  useGetReportProblems,
  useReadNewReportProblems,
  useUpdateReportProblem,
} from './hooks/settingApis';
import { showWarnAlert } from '../../../helper/sweetalert.helper';
import moment from 'moment';
import FilePreviewModal from '../../../@core/components/form-fields/FilePreviewModal';
import classNames from 'classnames';
import ServerSideTable from '../../../@core/components/data-table/ServerSideTable';
import { useReportProblemColumns } from './hooks/useReportProblem';
import { useHistory, useLocation } from 'react-router-dom';
import AddReportProblem from '../../settings/AddReportProblem';
import { selectThemeColors } from '../../../utility/Utils';
import {
  OptionComponent,
  PriorityStatusCategorySingleValue,
} from '../../forms/component/OptionComponent';
import ReportProblemsComments from './ReportProblemsComments';
import { useDispatch, useSelector } from 'react-redux';
import { userData } from '../../../redux/user';
import { supportTicketStatus } from '../../../constant';
import { setSidebarCount } from '../../../redux/common';

const ReportProblems = () => {
  const gridItemsLimit = 9;
  const tableRef = useRef(null);

  const dispatch = useDispatch();
  const user = useSelector(userData);
  const isSuperAdmin = user?.role === 'superadmin';

  const [currPage, setCurrPage] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const [activeView, setActiveView] = useState('grid');

  const [reportData, setReportData] = useState({ results: [], total: 0 });
  const [openPreview, setOpenPreview] = useState(null);
  const [openPreviewImage, setOpenPreviewImage] = useState(null);
  const [openAddNewReport, setOpenAddNewReport] = useState(null);
  const [openComments, setOpenComments] = useState(null);

  const { getReportProblems, isLoading } = useGetReportProblems();
  const { updateReportProblem, isLoading: updateLoader } =
    useUpdateReportProblem();
  const { readNewReportProblems } = useReadNewReportProblems();

  const { deleteReportProblem } = useDeleteReportProblem();
  const { getReportProblemById } = useGetReportProblemById();

  const { columns } = useReportProblemColumns({
    handleDelete,
    handlePreview: (item) => setOpenPreview(item),
    handleOpenComments: (item) => setOpenComments(item),
    ticketStatus: (status) => ticketStatus(status),
    checkNewComments,
  });

  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (queryParams.has('id')) {
      const select =
        'id,firstName,lastName,email,phone,body,uploadFileURL,status,comments,isNew,userId,lastReadedCommentId,createdAt';

      getReportProblemById(queryParams.get('id'), { select })
        .then((res) => {
          if (queryParams.has('comment')) {
            setOpenComments(res.data);
          } else {
            setOpenPreview(res.data);
          }
        })
        .finally(() => {
          queryParams.delete('id');
          if (queryParams.has('comment')) {
            queryParams.delete('comment');
          }
          history.replace({
            search: queryParams.toString(),
          });
        });
    }

    dispatch(setSidebarCount({ supportTicket: 0 }));
  }, []);

  useEffect(() => {
    if (activeView === 'grid') {
      setCurrPage(1);
      loadAllReportProblems({ page: 1 }, true);
    }
  }, [activeView]);

  /* Read New Tickets */
  useEffect(() => {
    const newReportProblemsIds = reportData.results
      .filter((r) => r.isNew)
      .map((r) => r._id);

    readAllNewReportProblems(newReportProblemsIds);
  }, [reportData.results]);

  /* Read New Comments */
  useEffect(() => {
    if (openComments && checkNewComments(openComments)) {
      readAllNewComments(openComments);
    }
  }, [openComments]);

  const readAllNewReportProblems = async (ids = []) => {
    if (isSuperAdmin && ids.length) {
      await readNewReportProblems({ reportProblemIds: ids });
    }
  };

  const readAllNewComments = async (openComments) => {
    const reportProblemId = openComments._id;
    const reportComments = openComments.comments;
    const lastReadedCommentId = reportComments[reportComments.length - 1]?._id;

    await updateReportProblem(reportProblemId, { lastReadedCommentId }, false);

    /* Update State */
    setReportData((prev) => {
      const newResultSet = prev.results.map((r) =>
        r._id === openComments?._id ? { ...r, lastReadedCommentId } : r
      );
      return { ...prev, results: newResultSet };
    });
  };

  const loadAllReportProblems = async (params = {}, reset = false) => {
    const {
      search = searchVal,
      page = currPage,
      limit = gridItemsLimit,
    } = params;

    const select =
      'id,firstName,lastName,email,phone,body,uploadFileURL,status,comments,isNew,userId,lastReadedCommentId,createdAt';

    const reqParams = { ...(search && { search }), page, limit, select };

    const { data, error } = await getReportProblems(reqParams);
    if (!error) {
      const { reportProblems, total } = data;

      if (_.isArray(reportProblems)) {
        const newRecords =
          reset || activeView === 'list'
            ? reportProblems
            : [...(reportData.results || []), ...reportProblems];

        setReportData({ results: newRecords, total });
      }
    }
  };

  const debounceFn = useCallback(
    _.debounce(async (search) => {
      setCurrPage(1);
      await loadAllReportProblems({ search, page: 1 }, true);
    }, 300),
    []
  );

  async function handleDelete(id) {
    const result = await showWarnAlert({
      title: 'Are you sure?',
      text: 'Are you sure you would like to delete this Support Problem?',
    });

    if (result.value) {
      const { error } = await deleteReportProblem(
        id,
        'Delete Support Ticket..'
      );

      if (!error) {
        if (activeView === 'grid') {
          setCurrPage(1);
          await loadAllReportProblems({ page: 1 }, true);
        } else {
          tableRef?.current?.refreshTable({});
        }
      }
    }
  }

  const handleStatusUpdate = async (item, newStatus) => {
    const status = newStatus.value;

    if (status !== item?.status) {
      const result = await showWarnAlert({
        title: 'Are you sure?',
        text: 'Are you sure you would like to update status of ticket?',
      });
      if (result.value) {
        const { error } = await updateReportProblem(item._id, { status });
        if (!error) {
          setReportData((prev) => ({
            ...prev,
            results: prev.results.map((r) =>
              r._id === item._id ? { ...r, status } : r
            ),
          }));
        }
      }
    }
  };

  const handleAddNewComment = (openComments, newComment) => {
    setReportData((prev) => {
      const newResultSet = prev.results.map((r) =>
        r._id === openComments?._id
          ? {
              ...r,
              comments: [
                ...r.comments,
                {
                  _id: newComment._id,
                  commentedBy: newComment.commentedBy,
                },
              ],
            }
          : r
      );
      return { ...prev, results: newResultSet };
    });
  };

  const handleCloseAddReportModal = (isUpdate) => {
    if (isUpdate) {
      setCurrPage(1);
      loadAllReportProblems({ page: 1 }, true);
    }
    setOpenAddNewReport(false);
  };

  function ticketStatus(status) {
    return supportTicketStatus.find((s) => s.value === status);
  }

  function checkNewComments(item) {
    let isNew = false;
    if (item.comments.length) {
      const lastComment = item.comments[item.comments.length - 1];

      isNew =
        lastComment._id !== item.lastReadedCommentId &&
        lastComment.commentedBy !== user._id;
    }
    return isNew;
  }

  const selectBadge = (type) => {
    const status = ticketStatus(type)?.value;

    switch (status) {
      case 'Done':
        return 'success';
      case 'InProgress':
        return 'warning';
      case 'Pending':
        return 'warning';
    }
  };

  return (
    <>
      <div className='feature-requests-page support-tc-page'>
        <h2 className='mobile-page-title'>Support Tickets</h2>
        <div className='feature-requests-header d-flex justify-content-between align-items-center'>
          <Button
            className='add-btn  '
            color='primary'
            onClick={() => {
              setOpenAddNewReport(true);
              // history.push(`${basicRoute}/contact/add`);
            }}
          >
            <Plus size={15} />
            <span className='btn-text'>Add Support Ticket</span>
          </Button>
          <div className='view-toggle-btn d-inline-flex'>
            <ButtonGroup>
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
          </div>
        </div>

        {activeView === 'grid' ? (
          <UILoader blocking={isLoading}>
            <Card className='support__tickets__card feature-requests-card'>
              <CardHeader>
                <CardTitle>
                  <h4 className='card-title'>Support Tickets</h4>
                </CardTitle>
                <div className='search-box-wrapper'>
                  <div className='form-element-icon-wrapper'>
                    <svg
                      version='1.1'
                      id='Layer_1'
                      x='0px'
                      y='0px'
                      viewBox='0 0 56 56'
                    >
                      <path
                        d='M52.8,49.8c-4-4.1-7.9-8.2-11.9-12.4c-0.2-0.2-0.5-0.5-0.7-0.8c2.5-3,4.1-6.4,4.8-10.2c0.7-3.8,0.4-7.6-1-11.2
 c-1.3-3.6-3.5-6.7-6.5-9.2C29.4-0.8,17.8-0.9,9.6,5.9C1,13.1-0.8,25.3,5.4,34.7c2.9,4.3,6.8,7.3,11.8,8.8c6.7,2,13,0.9,18.8-3
 c0.1,0.2,0.3,0.3,0.4,0.4c3.9,4.1,7.9,8.2,11.8,12.3c0.7,0.7,1.3,1.3,2.2,1.6h1.1c0.5-0.3,1.1-0.5,1.5-0.9
 C54.1,52.8,54,51.1,52.8,49.8z M23.5,38.7c-8.8,0-16.1-7.2-16.1-16.1c0-8.9,7.2-16.1,16.1-16.1c8.9,0,16.1,7.2,16.1,16.1
 C39.6,31.5,32.4,38.7,23.5,38.7z'
                      ></path>
                    </svg>
                    <Input
                      className='form-control'
                      value={searchVal}
                      placeholder='Search...'
                      onChange={(e) => {
                        debounceFn(e.target.value);
                        setSearchVal(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody
                className={`pb-0 fancy-scrollbar ${
                  reportData.results.length < reportData.total &&
                  'load-more-active'
                }`}
              >
                <Row className='report-problem-row'>
                  {reportData.results?.length > 0 ? (
                    reportData.results.map((item, index) => {
                      return (
                        <Col
                          className='report-problem-col'
                          lg='4'
                          md='6'
                          sm='12'
                          key={`grid-${index}`}
                        >
                          <div className='company-form-card'>
                            <div className='header-wrapper'>
                              <div className='form-card-title'>
                                {`${item?.firstName || ''} ${
                                  item?.lastName || ''
                                }`}
                              </div>
                              <div className='action-btn-wrapper'>
                                <div
                                  className='action-btn view-btn'
                                  onClick={() => setOpenPreview(item)}
                                >
                                  <Eye
                                    size={15}
                                    color='black'
                                    id={`view_image_${index}`}
                                    className='cursor-pointer'
                                  />
                                  <UncontrolledTooltip
                                    placement='top'
                                    autohide={true}
                                    target={`view_image_${index}`}
                                  >
                                    Preview
                                  </UncontrolledTooltip>
                                </div>
                                {isSuperAdmin && (
                                  <div
                                    className='action-btn delete-btn'
                                    onClick={() => handleDelete(item._id)}
                                  >
                                    <Trash
                                      size={15}
                                      color='red'
                                      className='cursor-pointer'
                                      id={`delete_${index}`}
                                    />
                                    <UncontrolledTooltip
                                      placement='top'
                                      target={`delete_${index}`}
                                    >
                                      Delete
                                    </UncontrolledTooltip>
                                  </div>
                                )}
                                <div
                                  className='action-btn message-btn'
                                  onClick={() => setOpenComments(item)}
                                >
                                  <MessageSquare
                                    size={15}
                                    color='black'
                                    className='cursor-pointer'
                                    id={`comment_${index}`}
                                  />
                                  <>
                                    {checkNewComments(item) && (
                                      <div className='count'>New</div>
                                    )}
                                  </>
                                  <UncontrolledTooltip
                                    placement='top'
                                    target={`comment_${index}`}
                                  >
                                    Comments
                                  </UncontrolledTooltip>
                                </div>
                              </div>
                            </div>
                            <div className='body-wrapper'>
                              <>
                                {isSuperAdmin && item.isNew && (
                                  <div className='new-badge'>New</div>
                                )}
                              </>
                              {isSuperAdmin ? (
                                <div className='badge-selectBox'>
                                  <Select
                                    key={item.status}
                                    styles={{
                                      singleValue: (base) => ({
                                        ...base,
                                        display: 'flex',
                                        alignItems: 'center',
                                      }),
                                    }}
                                    id='status'
                                    name='status'
                                    value={ticketStatus(item?.status)}
                                    isDisabled={updateLoader}
                                    options={supportTicketStatus}
                                    theme={selectThemeColors}
                                    classNamePrefix='custom-select'
                                    onChange={(data) => {
                                      handleStatusUpdate(item, data);
                                    }}
                                    isSearchable={false}
                                    components={{
                                      Option: OptionComponent,
                                      SingleValue:
                                        PriorityStatusCategorySingleValue,
                                      DropdownIndicator: () => null,
                                      IndicatorSeparator: () => null,
                                    }}
                                  />
                                </div>
                              ) : (
                                <>
                                  {ticketStatus(item?.status) && (
                                    <div className='status-badge'>
                                      <Badge
                                        className=''
                                        color={`light-${selectBadge(
                                          item.status
                                        )}`}
                                        pill
                                      >
                                        {ticketStatus(item?.status).label}
                                      </Badge>
                                    </div>
                                  )}
                                </>
                              )}
                              <div className='support-ticket-row'>
                                <div className='date-label'>Email</div>
                                <div className='data-value'>{item.email}</div>
                              </div>
                              <div className='support-ticket-row'>
                                <div className='date-label'>Phone</div>
                                <div className='data-value'>{item.phone}</div>
                              </div>
                              {isSuperAdmin ? (
                                <div className='support-ticket-row'>
                                  <div className='date-label'>Company</div>
                                  <div className='data-value'>
                                    {item?.company?.name}
                                  </div>
                                </div>
                              ) : null}
                              <div className='support-ticket-row message'>
                                <div className='date-label'>Message</div>
                                <div className='data-value'>{item.body}</div>
                              </div>
                              <div className='support-ticket-row'>
                                <div className='date-label'>Date</div>
                                <div className='data-value'>
                                  {moment(new Date(item.createdAt)).format(
                                    'MM/DD/YYYY | HH:mm A'
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Col>
                      );
                    })
                  ) : (
                    <div className='d-flex justify-content-center m-4'>
                      <span className='no-data-found'>
                        {!isLoading && 'No Support Tickets found!'}
                      </span>
                    </div>
                  )}
                </Row>
              </CardBody>
              {reportData.results.length < reportData.total && (
                <div className='text-center loadMore-btn-wrapper'>
                  <Button
                    outline={true}
                    color='primary'
                    onClick={() => {
                      setCurrPage(currPage + 1);
                      loadAllReportProblems({ page: currPage + 1 });
                    }}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </Card>
          </UILoader>
        ) : (
          <>
            <div className='table-view'>
              <ServerSideTable
                header={
                  <CardHeader>
                    <div className='card-title'>
                      <h4 className='card-title'>Support Tickets</h4>
                    </div>
                  </CardHeader>
                }
                ref={tableRef}
                blocking={isLoading}
                selectableRows={false}
                columns={columns}
                getRecord={loadAllReportProblems}
                data={reportData}
                itemsPerPage={10}
              />
            </div>
          </>
        )}
      </div>

      {openAddNewReport && (
        <>
          <AddReportProblem
            open={openAddNewReport}
            onClose={handleCloseAddReportModal}
            onNewAdded={() => {
              setCurrPage(1);
              loadAllReportProblems({ page: 1 }, true);
            }}
          />
        </>
      )}

      <Modal
        scrollable={true}
        isOpen={!!openPreview}
        className={`modal-dialog-centered  support-ticket-preview-modal modal-dialog-mobile`}
        toggle={() => setOpenPreview(null)}
        size={'sm'}
        backdrop='static'
        fade={false}
      >
        <ModalHeader tag={'h5'} toggle={() => setOpenPreview(null)}>
          Support Ticket Preview
        </ModalHeader>

        <ModalBody>
          {openPreview && (
            <Fragment>
              <div style={{ display: 'none' }}>
                <div className='support-ticket-preview-row'>
                  <div className='date-label'>Name</div>
                  <div className='data-value'>{`${
                    openPreview.firstName || ''
                  } ${openPreview.lastName || ''}`}</div>
                </div>
                <div className='support-ticket-preview-row'>
                  <div className='date-label'>Email</div>
                  <div className='data-value'>{openPreview.email || '-'}</div>
                </div>
                <div className='support-ticket-preview-row'>
                  <div className='date-label'>Phone</div>
                  <div className='data-value'>{openPreview.phone || '-'}</div>
                </div>
                <div className='support-ticket-preview-row'>
                  <div className='date-label'>Created On</div>
                  <div className='data-value'>
                    {moment(new Date(openPreview.createdAt)).format(
                      'MM/DD/YYYY | HH:mm A'
                    )}
                  </div>
                </div>
                <div className='support-ticket-preview-row'>
                  <div className='date-label'>Status</div>
                  <div className='data-value'>
                    {ticketStatus(openPreview?.status)?.label || '-'}
                  </div>
                </div>
                <div className='support-ticket-preview-row'>
                  <div className='date-label'>Message</div>
                  <div className='data-value'>{openPreview.body}</div>
                </div>
                {openPreview.uploadFileURL?.length > 0 && (
                  <div className='support-ticket-preview-row attachment'>
                    <div className='date-label'>Attachment</div>
                    <div className='data-value'>
                      {openPreview?.uploadFileURL?.map((file) => {
                        return (
                          <>
                            <div className='file__drop__zone_wp'>
                              <div className='file__card m-1'>
                                <div className='d-flex justify-content-center file__preview__wp'>
                                  <div className='file__preview__sm'>
                                    <img
                                      src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file.fileUrl}`}
                                      alt='preview-doc'
                                    />
                                  </div>
                                  <div
                                    className='overlay cursor-pointer'
                                    onClick={() => {
                                      setOpenPreviewImage(file?.fileUrl);
                                    }}
                                  >
                                    <Eye color='#ffffff' />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className='user-name'>
                <div className='icon-wrapper'>
                  <User />
                </div>
                <div id='dataname' className='data-value'>
                  {openPreview.firstName || ''} {openPreview.lastName || ''}
                </div>
                <UncontrolledTooltip
                  placement='top'
                  autohide={true}
                  target={`dataname`}
                >
                  {openPreview.firstName || ''} {openPreview.lastName || ''}
                </UncontrolledTooltip>
              </div>
              <div className='scroll-wrapper hide-scrollbar'>
                <div className='double-row-data'>
                  <div className='data-row-new status'>
                    <div className='lable-wrapper'>
                      <span className='icon-wrapper'>
                        <Bookmark />
                      </span>
                      <span className='label-text'>Status:</span>
                    </div>
                    <div className='value-wrapper'>
                      <div id='datastatus' className='badgeLoyal-wrapper'>
                        <span
                          className='dot'
                          style={{
                            border: '1px solid rgb(255, 0, 0)',
                            backgroundImage:
                              'linear-gradient(to right, rgba(0, 0, 0, 0) 50%, rgb(255, 0, 0) 50%)',
                          }}
                        ></span>
                        <span
                          className='name'
                          style={{ color: 'rgb(255, 0, 0)' }}
                        >
                          {ticketStatus(openPreview?.status)?.label || '-'}
                        </span>
                        <span
                          className='bg-wrapper'
                          style={{ backgroundColor: 'rgb(255, 0, 0)' }}
                        ></span>
                        <span
                          className='border-wrapper'
                          style={{ border: '1px solid rgb(255, 0, 0)' }}
                        ></span>
                      </div>
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`datastatus`}
                      >
                        {' '}
                        {ticketStatus(openPreview?.status)?.label || '-'}
                      </UncontrolledTooltip>
                    </div>
                  </div>
                  <div className='data-row-new date'>
                    <div className='lable-wrapper'>
                      <span className='icon-wrapper'>
                        <Calendar />
                      </span>
                      <span className='label-text'>Created On:</span>
                    </div>
                    <div className='value-wrapper'>
                      <span className='date-value'>
                        {moment(new Date(openPreview.createdAt)).format(
                          'MM-DD-YYYY, HH:mm A'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='double-row-data'>
                  <div className='data-row-new email'>
                    <div className='lable-wrapper'>
                      <span className='icon-wrapper'>
                        <Mail />
                      </span>
                      <span className='label-text'>Email:</span>
                    </div>
                    <div className='value-wrapper'>
                      <span id='dataemail' className='email-value'>
                        {openPreview.email || '-'}
                      </span>
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`dataemail`}
                      >
                        {' '}
                        {openPreview.email || '-'}
                      </UncontrolledTooltip>
                    </div>
                  </div>
                  <div className='data-row-new phone'>
                    <div className='lable-wrapper'>
                      <span className='icon-wrapper'>
                        <PhoneCall />
                      </span>
                      <span className='label-text'>Phone:</span>
                    </div>
                    <div className='value-wrapper'>
                      <span id='dataphone' className='phone-value'>
                        {openPreview.phone || '-'}
                      </span>
                      <UncontrolledTooltip
                        placement='top'
                        autohide={true}
                        target={`dataphone`}
                      >
                        {' '}
                        {openPreview.phone || '-'}
                      </UncontrolledTooltip>
                    </div>
                  </div>
                </div>
                <div className='data-row-new message'>
                  <div className='lable-wrapper'>
                    <span className='icon-wrapper'>
                      <MessageSquare />
                    </span>
                    <span className='label-text'>Message:</span>
                  </div>
                  <div className='value-wrapper'>{openPreview.body}</div>
                </div>
                <div className='data-row-new attachment'>
                  <div className='lable-wrapper'>
                    <span className='icon-wrapper'>
                      <Paperclip />
                    </span>
                    <span className='label-text'>Attachment:</span>
                  </div>
                  <div className='value-wrapper'>
                    <div className='file__drop__zone_wp'>
                      {openPreview?.uploadFileURL?.map((file) => {
                        return (
                          <>
                            <div className='file-col'>
                              <div className='file__card'>
                                <div className='d-flex justify-content-center file__preview__wp'>
                                  <div className='file__preview'>
                                    <img
                                      src={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${file.fileUrl}`}
                                      alt='preview-doc'
                                    />
                                  </div>
                                  <div className='overlay cursor-pointer'>
                                    <div
                                      onClick={() => {
                                        setOpenPreviewImage(file?.fileUrl);
                                      }}
                                      className='icon-wrapper'
                                    >
                                      <Eye color='#ffffff' />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </ModalBody>
      </Modal>

      {openPreviewImage && (
        <FilePreviewModal
          visibility={!!openPreviewImage}
          url={openPreviewImage}
          toggleModal={() => setOpenPreviewImage(null)}
          title='Attachment Preview'
        />
      )}

      {!!openComments && (
        <ReportProblemsComments
          type='ReportProblem'
          openComments={openComments}
          setOpenComments={setOpenComments}
          onNewAdded={handleAddNewComment}
        />
      )}
    </>
  );
};

export default ReportProblems;
