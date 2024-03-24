// ** external packages **
import moment from 'moment';

export const DateFormat = ({ date, errorValue, format = 'MM/DD/yyyy' }) => {
  if (!date) return <>{errorValue}</>;

  const renderDate = () => {
    return moment(date).format(format);
  };

  return <>{!Number.isNaN(new Date(date).getDate()) ? renderDate() : date}</>;
};

export default DateFormat;
