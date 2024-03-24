import { useMemo } from 'react';
import { convertHtmlToPlain } from '../../../../utility/Utils';

const useTaskManagerTooltip = ({ item }) => {
  const updateToolTip = useMemo(() => {
    return (
      <>
        {new Date(item?.latestUpdates?.createdAt).toLocaleString('default', {
          month: 'short',
        })}{' '}
        {new Date(item?.latestUpdates?.createdAt)
          .getDate()
          .toString()
          .padStart(2, '0')}
        {' - '}
        {item?.latestUpdates?.createdBy.firstName}{' '}
        {item?.latestUpdates?.createdBy.lastName}
        <br />
        {item?.latestUpdates?.content &&
          convertHtmlToPlain(item?.latestUpdates?.content)}
      </>
    );
  }, [
    item?.latestUpdates?.createdAt,
    item?.latestUpdates?.createdBy.firstName,
    item?.latestUpdates?.createdBy.lastName,
    item?.latestUpdates?.content,
  ]);

  return { updateToolTip };
};

export default useTaskManagerTooltip;
