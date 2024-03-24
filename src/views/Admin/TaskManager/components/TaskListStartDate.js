import { memo, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';

const TaskListStartDate = ({ item, handleUpdateStartDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef();
  isOpenRef.current = isOpen;

  const dateText = useMemo(() => {
    return `${new Date(item.startDate).toLocaleString('default', {
      month: 'short',
    })} ${new Date(item.startDate).getDate().toString().padStart(2, '0')}`;
  }, [item]);

  return (
    <div className='task-date'>
      {item.startDate ? (
        item?.completed || item?.trash ? (
          dateText
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <CustomDatePicker
              renderInBody
              options={{
                defaultDate: moment(item.startDate).format('MM-DD-YYYY'),
                dateFormat: 'm-d-Y',
                enable: [
                  function (date) {
                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                    return date >= today;
                  },
                  moment(item.startDate).format('MM-DD-YYYY'),
                ],
                altInput: true,
                altFormat: 'M d',
              }}
              value={moment(item.startDate).format('MM-DD-YYYY')}
              className='form-control invoice-edit-input due-date-picker'
              name='startDate'
              enableTime={false}
              onChange={(startDate) => {
                setIsOpen(false);
                handleUpdateStartDate(item, startDate[0]);
              }}
            />
          </div>
        )
      ) : null}
    </div>
  );
};

export default memo(TaskListStartDate);
