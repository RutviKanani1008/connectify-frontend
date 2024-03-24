import { Label } from 'reactstrap';
import DatePicker from 'react-datepicker';
const CustomDateAndTimePicker = ({
  errors,
  name,
  value,
  onChange,
  label = false,
  disabled = false,
  dateFormat = 'Y-m-d h:i K',
  className = 'form-control',
  showMonthDropdown = true,
  showYearDropdown = true,
  showTimeInput = false,
  timeFormat = 'HH:mm',
  ...otherOptions
}) => {
  let tempError = { ...errors };
  name.split('.').map((obj) => {
    if (tempError) {
      tempError = tempError[obj];
    }
  });
  return (
    <>
      {label && (
        <Label className='form-label' for='startDate'>
          {label}
        </Label>
      )}
      <div className='date-picker-error-wp'>
        <DatePicker
          disabled={disabled}
          required
          id={name.toLowerCase()}
          name={name}
          className={className}
          onChange={onChange}
          selected={value}
          showMonthDropdown={showMonthDropdown}
          showYearDropdown={showYearDropdown}
          dateFormat={dateFormat}
          showTimeInput={showTimeInput}
          timeFormat={timeFormat}
          {...otherOptions}
        />
        {tempError && <span className='text-danger'>{tempError.message}</span>}
      </div>
    </>
  );
};

export default CustomDateAndTimePicker;
