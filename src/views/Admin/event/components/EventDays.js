import { singleElementRemoveFromArray } from '../../../../utility/Utils';

const EVENT_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const EventDays = ({ scheduleData, setScheduleData, allowSingle = false }) => {
  return (
    <div className='event-days'>
      {EVENT_DAYS.map((day, index) => (
        <button
          onClick={() => {
            let selectedDays = [...scheduleData.selectedDays];
            if (scheduleData.selectedDays.includes(index)) {
              if (scheduleData.selectedDays.length > 1) {
                selectedDays = [
                  ...singleElementRemoveFromArray(selectedDays, index),
                ];
              }
            } else {
              if (!allowSingle) selectedDays.push(index);
              else selectedDays = [index];
            }
            setScheduleData({ ...scheduleData, selectedDays });
          }}
          key={index}
          type='button'
          className={`event-days-btn ${
            scheduleData.selectedDays.includes(index) ? 'active' : ''
          }`}
          data-index='0'
          title='Sunday'
        >
          {day}
        </button>
      ))}
    </div>
  );
};
export default EventDays;
