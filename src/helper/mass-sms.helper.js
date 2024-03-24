// ==================== Packages =======================
import _ from 'lodash';

export const restructureScheduledSMSCSVData = (scheduledMassSMS) => {
  let scheduledMassSMSCSVData;
  if (scheduledMassSMS && _.isArray(scheduledMassSMS)) {
    scheduledMassSMSCSVData = scheduledMassSMS.map((obj) => {
      const tempObj = { ...obj };
      delete tempObj.massSMSId;
      return {
        ...tempObj,
        title: obj?.massSMSId?.saveAs || '-',
      };
    });
  }
  return scheduledMassSMSCSVData;
};
