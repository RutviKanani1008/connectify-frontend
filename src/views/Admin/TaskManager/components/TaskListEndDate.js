import moment from 'moment';
import { useMemo, useRef, useState } from 'react';
import CustomDatePicker from '../../../../@core/components/form-fields/CustomDatePicker';

const TaskListEndDate = ({ item, handleUpdateDueDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef();
  isOpenRef.current = isOpen;

  const dateText = useMemo(() => {
    return `${new Date(item.endDate).toLocaleString('default', {
      month: 'short',
    })} ${new Date(item.endDate).getDate().toString().padStart(2, '0')}`;
  }, [item]);

  return (
    <div className='task-date'>
      {item.endDate ? (
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
                defaultDate: moment(item.endDate).format('MM-DD-YYYY'),
                dateFormat: 'm-d-Y',
                enable: [
                  function (date) {
                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                    return date >= today;
                  },
                  moment(item.endDate).format('MM-DD-YYYY'),
                ],
                altInput: true,
                altFormat: 'M d',
              }}
              value={moment(item.endDate).format('MM-DD-YYYY')}
              className='form-control invoice-edit-input due-date-picker'
              name='dueDate'
              enableTime={false}
              onChange={(dueDate) => {
                setIsOpen(false);
                handleUpdateDueDate(item, dueDate[0]);
              }}
            />
          </div>
        )
      ) : null}
    </div>
  );
};

export default TaskListEndDate;
