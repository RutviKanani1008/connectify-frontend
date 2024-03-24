import { Fragment, useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { required } from '../../../configs/validationConstant';
import { FormField } from '../../../@core/components/form-fields';
import Avatar from '@components/avatar';
import {
  useGetAllReportFeatureComments,
  useAddReportFeatureComment,
} from './hooks/settingApis';
import DateFormat from '../../../components/DateFormate';
import { Send } from 'react-feather';
import NoRecordFound from '../../../@core/components/data-table/NoRecordFound';

const commentSchema = yup.object().shape({
  comment: yup.string().required(required('Comment')),
});

const ReportProblemsComments = ({
  type = 'ReportProblem',
  openComments,
  setOpenComments,
  onNewAdded,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(commentSchema),
  });

  const [comments, setComments] = useState([]);

  const { getReportFeatureCommentsById, isLoading } =
    useGetAllReportFeatureComments();
  const { createReportFeatureComment, isLoading: createLoader } =
    useAddReportFeatureComment();

  const loadComments = async () => {
    const { data, error } = await getReportFeatureCommentsById(
      openComments._id,
      { modelName: type }
    );
    if (!error && Array.isArray(data)) {
      setComments(data);
    }
  };

  useEffect(() => {
    loadComments();
  }, [openComments]);

  const onSubmit = async (data) => {
    const { comment } = data;

    const { data: resData, error } = await createReportFeatureComment(
      openComments._id,
      { message: comment, modelName: type }
    );

    if (!error) {
      onNewAdded(openComments, resData);
      setOpenComments(null);
    }
  };

  return (
    <Modal
      scrollable={true}
      isOpen={!!openComments}
      className={`modal-dialog-centered support-ticket-comment-modal modal-dialog-mobile`}
      toggle={() => setOpenComments(null)}
      size={'sm'}
      backdrop='static'
      fade={false}
    >
      <ModalHeader tag={'h5'} toggle={() => setOpenComments(null)}>
        {`${
          type === 'ReportProblem'
            ? 'Support Ticket Comments'
            : 'Feature Requests Comments'
        }`}
      </ModalHeader>
      {openComments && (
        <Fragment>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className='fancy-scrollbar'>
              {isLoading ? (
                <div className='d-flex align-items-center justify-content-center mt-2 mb-3'>
                  <Spinner />
                </div>
              ) : !comments.length ? (
                <NoRecordFound
                  title='No Comment Found'
                  text='Whoops... we do not see any comment for this request in our database'
                />
              ) : (
                comments.map((c) => (
                  <Fragment key={c._id}>
                    <div className='comment-box'>
                      <div className='inner-wrapper'>
                        <div className='img-wrapper'>
                          <div className='avatar'>
                            <Avatar
                              id={`avatar`}
                              color={'light-primary'}
                              content={
                                c.commentedBy?.firstName ||
                                c.commentedBy?.lastName
                                  ? `${c.commentedBy?.firstName} ${c.commentedBy?.lastName}`
                                  : c.commentedBy?.email
                              }
                              initials
                            />
                          </div>
                        </div>
                        <div className='right-wrapper'>
                          <div className='top-header'>
                            {(c.commentedBy?.firstName ||
                              c.commentedBy?.lastName) && (
                              <div className='user-name'>
                                {`${c.commentedBy?.firstName || ''} ${
                                  c.commentedBy?.lastName || ''
                                }`}
                              </div>
                            )}

                            <span className='time'>
                              <DateFormat
                                date={c.createdAt}
                                format='MM/DD/yyyy hh:mm A'
                              />
                            </span>
                          </div>
                          <div className='description' key={c._id}>
                            {c.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ))
              )}
            </ModalBody>

            <div className='comment-send-wrapper'>
              <div className='inner-wrapper'>
                <FormField
                  id='comment'
                  name='comment'
                  // label='Comment'
                  placeholder='Comment...'
                  type='text'
                  errors={errors}
                  control={control}
                />
                <Button
                  loading={createLoader}
                  disabled={createLoader}
                  color='primary'
                  name={'Send'}
                  type='submit'
                >
                  {createLoader ? <Spinner size='sm' /> : <Send />}
                </Button>
              </div>
            </div>
          </Form>
        </Fragment>
      )}
    </Modal>
  );
};

export default ReportProblemsComments;
