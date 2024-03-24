import moment from 'moment';
import { useTaskTimerReport } from '../service/taskTimer.services';
import { getDateStringFromDuration } from '../../../../@core/components/form-fields/CustomDatePicker';

export const useTaskTimerReports = ({
  setAvailableGraphTaskTimerReport,
  setAvailableTaskTimerReport,
  currentStartDate,
  currentEndDate,
  values,
  setError,
  extraFilers = {},
}) => {
  const { taskTimerReport, isLoading: taskTimerReportLoading } =
    useTaskTimerReport();

  const checkDateForDuplications = (
    dateWiseSpendHours,
    tempGraphTimerReport,
    individualTimer
  ) => {
    dateWiseSpendHours.forEach((eachDayTimeSpend) => {
      const dateInTotalDuration = moment(eachDayTimeSpend?.date)?.valueOf();
      if (
        dateInTotalDuration >= currentStartDate &&
        dateInTotalDuration <= currentEndDate
      ) {
        //
        const isDateExsist = tempGraphTimerReport.find((tempReport) =>
          moment(tempReport?.date, 'MM/DD/YYYY').isSame(
            moment(eachDayTimeSpend?.date).format('MM/DD/yyyy')
          )
        );
        if (isDateExsist) {
          tempGraphTimerReport.map((tempReport) => {
            if (
              moment(tempReport?.date, 'MM/DD/YYYY').isSame(
                moment(
                  moment(eachDayTimeSpend?.date).format('MM/DD/yyyy')
                ).format('MM/DD/yyyy')
              )
            ) {
              tempReport.totalDuration = Number(
                (
                  Number(tempReport.totalDuration) +
                  Number(eachDayTimeSpend?.hours)
                ).toFixed(1)
              );

              // Check timer task info is exist on that day or not.
              if (
                tempReport.tasksInfo.find(
                  (task) => task.taskNumber === individualTimer.task.taskNumber
                )
              ) {
                //
                tempReport.tasksInfo.map((task) => {
                  if (task.taskNumber === individualTimer.task.taskNumber) {
                    task.duration =
                      task.duration + Number(eachDayTimeSpend?.hours);
                  }
                });
              } else {
                tempReport.tasksInfo.push({
                  taskNumber: individualTimer.task.taskNumber,
                  duration: Number(eachDayTimeSpend?.hours),
                });
              }
            }
          });
        } else {
          tempGraphTimerReport.push({
            date: moment(eachDayTimeSpend?.date).format('MM/DD/yyyy'),
            totalDuration: Number(eachDayTimeSpend?.hours),
            tasksInfo: [
              {
                taskNumber: individualTimer.task.taskNumber,
                duration: Number(eachDayTimeSpend?.hours),
              },
            ],
          });
        }
      }
    });
  };

  const getDateBetweenDates = (tempStartDate, tempEndDate) => {
    // Parse the input strings into Moment.js objects
    const startDate = moment(tempStartDate, 'MM/DD/YYYY hh:mm A');
    const endDate = moment(tempEndDate, 'MM/DD/YYYY hh:mm A');

    // Format and return the result
    const result = [];

    const currentDate = startDate.clone();

    while (currentDate.isSameOrBefore(endDate)) {
      const formattedDate = currentDate.format('MM/DD/YYYY');
      const endOfDay = currentDate.clone().endOf('day');
      const hoursRemaining = Math.min(
        endOfDay.diff(currentDate, 'hours', true),
        endDate.diff(currentDate, 'hours', true)
      );

      result.push({
        date: formattedDate,
        hours: hoursRemaining.toFixed(1),
      });

      currentDate.add(1, 'day').startOf('day');
    }

    return result;
  };

  const handleSearchReport = async (values) => {
    const { data, error } = await taskTimerReport({
      //   ...values,
      startDate: moment(values.startDate).valueOf(),
      endDate: moment(values.endDate).valueOf(),
      contact: values?.contact,
      ...extraFilers,
    });
    if (!error && data.length) {
      const tempTaskTimerReport = [...data];

      const tempTimerReport = [];
      const tempGraphTimerReport = [];
      let grandTotalDuration = 0;
      if (tempTaskTimerReport.length) {
        tempTaskTimerReport.forEach((individualTimer) => {
          // For Table Use
          const isExists = tempTimerReport.find(
            (tempReport) =>
              String(tempReport?.task?._id) ===
              String(individualTimer?.task?._id)
          );

          if (individualTimer?.pauses?.length) {
            let totalPauseTime = 0;
            individualTimer?.pauses.forEach((pausedTime, index) => {
              if (
                index === 0 &&
                individualTimer?.startedAt > currentStartDate &&
                pausedTime?.pausedAt <= currentEndDate
              ) {
                totalPauseTime =
                  totalPauseTime +
                  (pausedTime?.pausedAt - individualTimer?.startedAt);
              } else {
                if (
                  individualTimer?.pauses?.[index - 1]?.resumedAt >=
                    currentStartDate &&
                  pausedTime?.pausedAt <= currentEndDate
                ) {
                  totalPauseTime =
                    totalPauseTime +
                    (pausedTime?.pausedAt -
                      individualTimer?.pauses?.[index - 1]?.resumedAt);
                }
              }
              if (
                individualTimer?.pauses.length - 1 === index &&
                individualTimer.endedAt &&
                individualTimer.endedAt <= currentEndDate
              ) {
                totalPauseTime =
                  totalPauseTime +
                  (individualTimer?.endedAt - pausedTime?.resumedAt);
              }
            });
            individualTimer.totalTime = totalPauseTime;
          }

          grandTotalDuration = grandTotalDuration + individualTimer.totalTime;
          if (isExists) {
            tempTimerReport.map((timerReport) => {
              if (
                String(timerReport?.task?._id) ===
                String(individualTimer?.task?._id)
              ) {
                timerReport.totalDuration =
                  timerReport.totalDuration + individualTimer.totalTime;
              }
            });
          } else {
            if (individualTimer.totalTime) {
              tempTimerReport.push({
                _id: individualTimer?._id,
                task: individualTimer.task,
                totalDuration: individualTimer.totalTime,
              });
            }
            // }
          }
          // For Graph use
          const startDate = moment(
            moment.duration(Number(individualTimer?.startedAt)).asMilliseconds()
          ).format('MM/DD/yyyy');

          let endDate = null;
          if (individualTimer?.endedAt) {
            endDate = moment(
              moment.duration(Number(individualTimer?.endedAt)).asMilliseconds()
            ).format('MM/DD/yyyy');
          }

          if (
            moment(startDate).isValid() &&
            endDate &&
            moment(endDate).isValid() &&
            individualTimer?.pauses?.length
          ) {
            if (individualTimer?.pauses?.length) {
              //
              individualTimer?.pauses?.forEach((paused, index) => {
                if (index === 0) {
                  const dateWiseSpendHours = getDateBetweenDates(
                    getDateStringFromDuration(
                      Number(individualTimer?.startedAt)
                    ),
                    getDateStringFromDuration(Number(paused?.pausedAt))
                  );

                  if (dateWiseSpendHours.length) {
                    checkDateForDuplications(
                      dateWiseSpendHours,
                      tempGraphTimerReport,
                      individualTimer
                    );
                  }
                } else {
                  //
                  const dateWiseSpendHours = getDateBetweenDates(
                    getDateStringFromDuration(
                      Number(individualTimer.pauses[index - 1]?.resumedAt)
                    ),
                    getDateStringFromDuration(Number(paused?.pausedAt))
                  );
                  if (dateWiseSpendHours.length) {
                    checkDateForDuplications(
                      dateWiseSpendHours,
                      tempGraphTimerReport,
                      individualTimer
                    );
                  }
                }
                if (individualTimer?.pauses.length - 1 === index) {
                  const dateWiseSpendHours = getDateBetweenDates(
                    getDateStringFromDuration(Number(paused?.resumedAt)),
                    getDateStringFromDuration(Number(individualTimer?.endedAt))
                  );
                  if (dateWiseSpendHours.length) {
                    checkDateForDuplications(
                      dateWiseSpendHours,
                      tempGraphTimerReport,
                      individualTimer
                    );
                  }
                }
              });
            } else {
              // In case start date and end date is not same and not having paused.
              const dateWiseSpendHours = getDateBetweenDates(
                getDateStringFromDuration(Number(individualTimer?.startedAt)),
                getDateStringFromDuration(Number(individualTimer?.endedAt))
              );
              if (dateWiseSpendHours.length) {
                checkDateForDuplications(
                  dateWiseSpendHours,
                  tempGraphTimerReport,
                  individualTimer
                );
              }
            }
          } else {
            const dateWiseSpendHours = getDateBetweenDates(
              getDateStringFromDuration(Number(individualTimer?.startedAt)),
              getDateStringFromDuration(Number(individualTimer?.endedAt))
            );
            if (dateWiseSpendHours.length) {
              checkDateForDuplications(
                dateWiseSpendHours,
                tempGraphTimerReport,
                individualTimer
              );
            }
            //
          }
        });
      }
      tempTimerReport.push({
        _id: null,
        isGrandTotal: true,
        task: { name: 'Total Duration' },
        totalDuration: grandTotalDuration,
      });

      setAvailableGraphTaskTimerReport(tempGraphTimerReport);
      setAvailableTaskTimerReport(tempTimerReport);
    } else {
      setAvailableGraphTaskTimerReport([]);
      setAvailableTaskTimerReport([]);
    }
  };

  const handleGetTimerReport = () => {
    let isAnyError = false;
    if (!values.startDate || !values.endDate) {
      setError(
        `date`,
        { type: 'focus', message: `Select Start and End Date.` },
        { shouldFocus: true }
      );
      isAnyError = true;
    }

    if (!isAnyError) {
      handleSearchReport({
        ...values,
        startDate: moment(values.startDate).valueOf(),
        endDate: moment(values.endDate).valueOf(),
        contact: values?.contact?.value,
      });
    } else {
      return false;
    }
  };
  return {
    getDateBetweenDates,
    handleSearchReport,
    taskTimerReportLoading,
    handleGetTimerReport,
  };
};
