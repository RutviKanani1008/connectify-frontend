import _ from 'lodash';
import { useLazyGetCommunicationSettingsQuery } from '../../../../../redux/api/communicationSettingsApi';

export const useGetToAndCCEmails = () => {
  // ** APIS **
  const [getCommunicationSettings] = useLazyGetCommunicationSettingsQuery();

  const getToAndCCEmails = async ({
    type,
    mailObj,
    currentSelectedAccount,
  }) => {
    const { data } = await getCommunicationSettings({}, true);
    let defaultBCCEmails = [];
    let defaultCCEmails = [];

    if (data?.data) {
      defaultBCCEmails = data?.data.defaultBCCEmails
        .filter((email) => !!email)
        .map((email) => ({ label: email, value: email }));
      defaultCCEmails = data?.data.defaultCCEmails
        .filter((email) => !!email)
        .map((email) => ({ label: email, value: email }));
    }

    let toMails = [];
    let ccMails = [];
    const bccMails = defaultBCCEmails || [];
    if (type === 'reply') {
      const isSelf = mailObj.from.address === currentSelectedAccount?.username;
      if (isSelf) {
        const tempToMails = (mailObj?.to || []).map((m) => ({
          label: m.address,
          value: m.address,
        }));
        toMails = tempToMails;
      } else {
        const tempToMails = {
          label: mailObj.from.address,
          value: mailObj.from.address,
        };
        toMails = [tempToMails];
      }
    } else if (type === 'reply-all') {
      const isSelf = mailObj.from.address === currentSelectedAccount?.username;
      if (isSelf) {
        const tempToMails = (mailObj?.to || []).map((m) => ({
          label: m.address,
          value: m.address,
        }));
        toMails = tempToMails;
        const tempCcMails = (mailObj?.cc || []).map((m) => ({
          label: m.address,
          value: m.address,
        }));
        if (tempCcMails.length) {
          ccMails = tempCcMails;
        }
      } else {
        const tempToMails = {
          label: mailObj.from.address,
          value: mailObj.from.address,
        };
        toMails = [tempToMails];
        const filteredToMails = (mailObj.to || [])?.filter(
          (obj) => obj.address !== currentSelectedAccount?.username
        );
        const filteredCCMails = (mailObj.cc || [])?.filter(
          (m) => m.address !== currentSelectedAccount?.username
        );
        const tempCcMails = [...filteredToMails, ...filteredCCMails].map(
          (m) => ({
            label: m.address,
            value: m.address,
          })
        );
        if (tempCcMails.length) {
          ccMails = tempCcMails;
        }
      }
    }
    // if (_.isArray(ccMails) && !ccMails.includes('brian@btwebgroup.com')) {
    //   ccMails?.push({
    //     value: 'brian@btwebgroup.com',
    //     label: 'brian@btwebgroup.com',
    //   });
    // }
    // if (_.isArray(ccMails) && !ccMails.includes('hello@btwebgroup.com')) {
    //   ccMails?.push({
    //     value: 'hello@btwebgroup.com',
    //     label: 'hello@btwebgroup.com',
    //   });
    // }

    ccMails = [...ccMails, ...defaultCCEmails];
    ccMails = _.unionBy(ccMails, 'value');

    return { toMails, ccMails, bccMails };
  };

  return { getToAndCCEmails };
};
