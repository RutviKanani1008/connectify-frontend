/* eslint-disable no-mixed-operators */
import moment from 'moment';
const useEventScheduler = ({
  setScheduleData,
  scheduleData,
  setStartDateEndDateState,
  startDateEndDateState,
}) => {
  const handleScheduler = (value) => {
    setScheduleData({ ...scheduleData, schedule: value });
  };

  const handleEndType = (value) => {
    setScheduleData({ ...scheduleData, endType: value });
  };

  const handleRepeatEvery = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setScheduleData({
        ...scheduleData,
        repeatEveryCount: e.target.value,
      });
    }
  };

  const handleOccurrences = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setScheduleData({
        ...scheduleData,
        occurrences: e.target.value,
      });
    }
  };

  const handleUntilDate = (date) => {
    setScheduleData({
      ...scheduleData,
      untilDate: moment(date[0]).endOf('day').toDate(),
    });
  };

  const handleStartDate = (date) => {
    let tempStartDateEndDateState = {
      ...startDateEndDateState,
    };
    if (
      new Date(date[0]).getTime() >
      new Date(tempStartDateEndDateState.endDate).getTime()
    ) {
      tempStartDateEndDateState = {
        ...tempStartDateEndDateState,
        endDate: new Date(date[0].getTime() + 10 * 60000),
      };
    }
    if (
      new Date(date[0]).getTime() > new Date(scheduleData.untilDate).getTime()
    ) {
      setScheduleData({
        ...scheduleData,
        untilDate: moment(date[0]).endOf('day').toDate(),
      });
    }
    setStartDateEndDateState({
      ...tempStartDateEndDateState,
      startDate: date[0],
    });
  };

  const handleEndDate = (date) => {
    const tempStartDateEndDateState = {
      ...startDateEndDateState,
    };

    if (
      new Date(date[0]).getTime() > new Date(scheduleData.untilDate).getTime()
    ) {
      setScheduleData({
        ...scheduleData,
        untilDate: moment(date[0]).endOf('day').toDate(),
      });
    }
    setStartDateEndDateState({
      ...tempStartDateEndDateState,
      endDate: date[0],
    });
  };

  return {
    handleScheduler,
    handleEndType,
    handleRepeatEvery,
    handleOccurrences,
    handleUntilDate,
    handleStartDate,
    handleEndDate,
  };
};

export default useEventScheduler;
