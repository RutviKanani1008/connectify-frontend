import moment from 'moment';
export const selectScheduleType = (key) => {
  const scheduleType = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    yearly: 'year',
  };
  return scheduleType[key];
};

export const handleDailyEvents = function (
  startDateArgs,
  endDateArgs,
  scheduleData
) {
  const startDates = [];
  const endDates = [];

  const startDate = moment(startDateArgs);
  const endDate = moment(endDateArgs);

  const start = startDate.clone();
  const end = endDate.clone();

  if (scheduleData.endType.value === 'until') {
    const untilDate = moment(scheduleData.untilDate);
    while (start.isSameOrBefore(untilDate)) {
      startDates.push(start.toDate());
      start.add(scheduleData.repeatEveryCount, 'days');
      endDates.push(end.toDate());
      end.add(scheduleData.repeatEveryCount, 'days');
    }
  } else {
    [...Array(scheduleData.occurrences)].forEach(() => {
      startDates.push(start.toDate());
      start.add(scheduleData.repeatEveryCount, 'days');
      endDates.push(end.toDate());
      end.add(scheduleData.repeatEveryCount, 'days');
    });
  }

  return { startDates, endDates };
};

export const handleWeeklyEvents = function (
  startDateArgs,
  endDateArgs,
  scheduleData
) {
  const startDates = [];
  const endDates = [];

  const dayDateObj = {};
  scheduleData.selectedDays.forEach((day) => {
    const today = moment(startDateArgs).day();

    if (today <= day) {
      dayDateObj[`${day}`] = {
        start: moment(startDateArgs).day(day).toDate(),
        end: moment(
          moment(startDateArgs).day(day).toDate().getTime() +
            moment(endDateArgs).diff(moment(startDateArgs))
        ).toDate(),
      };
    } else {
      dayDateObj[`${day}`] = {
        start: moment(startDateArgs)
          .add(scheduleData.repeatEveryCount, 'weeks')
          .day(day)
          .toDate(),
        end: moment(
          moment(startDateArgs)
            .add(scheduleData.repeatEveryCount, 'weeks')
            .day(day)
            .toDate() + moment(endDateArgs).diff(moment(startDateArgs))
        ).toDate(),
      };
    }
  });

  const startDate = moment(Object.values(dayDateObj)[0].start);
  let tempStart = startDate.clone();

  if (scheduleData.endType.value === 'until') {
    const untilDate = moment(scheduleData.untilDate);

    while (tempStart.isSameOrBefore(untilDate)) {
      Object.keys(dayDateObj).forEach((key, index) => {
        const startDate = moment(dayDateObj[key].start);
        const endDate = moment(dayDateObj[key].end);
        const start = startDate.clone();
        const end = endDate.clone();

        if (start.isSameOrBefore(untilDate)) {
          startDates.push(start.toDate());
          start.add(scheduleData.repeatEveryCount, 'weeks');
          endDates.push(end.toDate());
          end.add(scheduleData.repeatEveryCount, 'weeks');
          dayDateObj[key] = { start: start.toDate(), end: end.toDate() };
          if (index === 0) {
            tempStart = start;
          }
        }
      });
    }
  } else {
    [...Array(scheduleData.occurrences)].forEach(() => {
      Object.keys(dayDateObj).forEach((key) => {
        const startDate = moment(dayDateObj[key].start);
        const endDate = moment(dayDateObj[key].end);
        const start = startDate.clone();
        const end = endDate.clone();

        if (startDates.length < scheduleData.occurrences) {
          startDates.push(start.toDate());
          start.add(scheduleData.repeatEveryCount, 'weeks');
          endDates.push(end.toDate());
          end.add(scheduleData.repeatEveryCount, 'weeks');
          dayDateObj[key] = { start: start.toDate(), end: end.toDate() };
        }
      });
    });
  }

  return { startDates, endDates };
};

export const handleMonthlyEvents = function (
  startDateArgs,
  endDateArgs,
  scheduleData
) {
  const startDates = [];
  const endDates = [];

  const startDate = moment(startDateArgs);
  const endDate = moment(endDateArgs);

  const start = startDate.clone();
  const end = endDate.clone();

  if (scheduleData.endType.value === 'until') {
    const untilDate = moment(scheduleData.untilDate);
    while (start.isSameOrBefore(untilDate)) {
      let endDay = startDate.clone();
      endDay = endDay.endOf('month').date();
      if (endDay === startDate.date()) {
        let tempEndDay = start.clone();
        tempEndDay = tempEndDay.endOf('month').date();
        while (tempEndDay !== startDate.date()) {
          start.add(scheduleData.repeatEveryCount, 'months');
          end.add(scheduleData.repeatEveryCount, 'months');
        }
        startDates.push(start.toDate());
        start.add(scheduleData.repeatEveryCount, 'months');
        endDates.push(end.toDate());
        end.add(scheduleData.repeatEveryCount, 'months');
      } else {
        startDates.push(start.toDate());
        start.add(scheduleData.repeatEveryCount, 'months');
        endDates.push(end.toDate());
        end.add(scheduleData.repeatEveryCount, 'months');
      }
    }
  } else {
    [...Array(scheduleData.occurrences)].forEach(() => {
      let endDay = startDate.clone();
      endDay = endDay.endOf('month').date();
      if (endDay === startDate.date()) {
        let tempEndDay = start.clone();
        tempEndDay = tempEndDay.endOf('month').date();
        while (tempEndDay !== startDate.date()) {
          start.add(scheduleData.repeatEveryCount, 'months');
          end.add(scheduleData.repeatEveryCount, 'months');
        }
        startDates.push(start.toDate());
        start.add(scheduleData.repeatEveryCount, 'months');
        endDates.push(end.toDate());
        end.add(scheduleData.repeatEveryCount, 'months');
      } else {
        startDates.push(start.toDate());
        start.add(scheduleData.repeatEveryCount, 'months');
        endDates.push(end.toDate());
        end.add(scheduleData.repeatEveryCount, 'months');
      }
    });
  }

  return { startDates, endDates };
};

export const handleYearlyEvents = function (
  startDateArgs,
  endDateArgs,
  scheduleData
) {
  const startDates = [];
  const endDates = [];

  const startDate = moment(startDateArgs);
  const endDate = moment(endDateArgs);

  const start = startDate.clone();
  const end = endDate.clone();

  if (scheduleData.endType.value === 'until') {
    const untilDate = moment(scheduleData.untilDate);
    while (start.isSameOrBefore(untilDate)) {
      let endDay = startDate.clone();
      endDay = endDay.endOf('month').date();
      if (endDay === startDate.date()) {
        let tempEndDay = start.clone();
        tempEndDay = tempEndDay.endOf('month').date();
        while (tempEndDay !== startDate.date()) {
          start.add(scheduleData.repeatEveryCount, 'years');
          end.add(scheduleData.repeatEveryCount, 'years');
        }
        startDates.push(start.toDate());
        start.add(scheduleData.repeatEveryCount, 'years');
        endDates.push(end.toDate());
        end.add(scheduleData.repeatEveryCount, 'years');
      } else {
        startDates.push(start.toDate());
        start.add(scheduleData.repeatEveryCount, 'years');
        endDates.push(end.toDate());
        end.add(scheduleData.repeatEveryCount, 'years');
      }
    }
  } else {
    [...Array(scheduleData.occurrences)].forEach(() => {
      let endDay = startDate.clone();
      endDay = endDay.endOf('month').date();
      if (endDay === startDate.date()) {
        let tempEndDay = start.clone();
        tempEndDay = tempEndDay.endOf('month').date();
        while (tempEndDay !== startDate.date()) {
          start.add(scheduleData.repeatEveryCount, 'years');
          end.add(scheduleData.repeatEveryCount, 'years');
        }
        startDates.push(start.toDate());
        start.add(scheduleData.repeatEveryCount, 'years');
        endDates.push(end.toDate());
        end.add(scheduleData.repeatEveryCount, 'years');
      } else {
        startDates.push(start.toDate());
        start.add(scheduleData.repeatEveryCount, 'years');
        endDates.push(end.toDate());
        end.add(scheduleData.repeatEveryCount, 'years');
      }
    });
  }

  return { startDates, endDates };
};

export const createEventBasedOnScheduler = ({ scheduleData, tempEvent }) => {
  switch (scheduleData.schedule.value) {
    case 'never':
      return [
        {
          color: tempEvent.color,
          contacts: tempEvent.contacts,
          description: tempEvent.description,
          start: tempEvent.start,
          end: tempEvent.end,
          company: tempEvent.company,
          name: tempEvent.name,
        },
      ];

    case 'daily': {
      const dates = handleDailyEvents(
        tempEvent.start,
        tempEvent.end,
        scheduleData
      );
      const events = dates.startDates.map((startDate, index) => ({
        color: tempEvent.color,
        contacts: tempEvent.contacts,
        description: tempEvent.description,
        start: startDate,
        end: dates.endDates[index],
        company: tempEvent.company,
        name: tempEvent.name,
      }));
      return events;
    }
    case 'weekly': {
      const dates = handleWeeklyEvents(
        tempEvent.start,
        tempEvent.end,
        scheduleData
      );
      const events = dates.startDates.map((startDate, index) => ({
        color: tempEvent.color,
        contacts: tempEvent.contacts,
        description: tempEvent.description,
        start: startDate,
        end: dates.endDates[index],
        company: tempEvent.company,
        name: tempEvent.name,
      }));
      return events;
    }
    case 'monthly': {
      const dates = handleMonthlyEvents(
        tempEvent.start,
        tempEvent.end,
        scheduleData
      );
      const events = dates.startDates.map((startDate, index) => ({
        color: tempEvent.color,
        contacts: tempEvent.contacts,
        description: tempEvent.description,
        start: startDate,
        end: dates.endDates[index],
        company: tempEvent.company,
        name: tempEvent.name,
      }));
      return events;
    }
    case 'yearly': {
      const dates = handleYearlyEvents(
        tempEvent.start,
        tempEvent.end,
        scheduleData
      );
      const events = dates.startDates.map((startDate, index) => ({
        color: tempEvent.color,
        contacts: tempEvent.contacts,
        description: tempEvent.description,
        start: startDate,
        end: dates.endDates[index],
        company: tempEvent.company,
        name: tempEvent.name,
      }));
      return events;
    }
  }
};
