// ==================== Packages =======================
import _ from 'lodash';

export const restructureScheduledMailCSVData = (scheduledMassEmails) => {
  let scheduledMassEmailsCSVData;
  if (scheduledMassEmails && _.isArray(scheduledMassEmails)) {
    scheduledMassEmailsCSVData = scheduledMassEmails.map((obj) => {
      const tempObj = { ...obj };
      delete tempObj.massEmailId;
      return {
        ...tempObj,
        title: obj?.massEmailId?.saveAs || '-',
      };
    });
  }
  return scheduledMassEmailsCSVData;
};
