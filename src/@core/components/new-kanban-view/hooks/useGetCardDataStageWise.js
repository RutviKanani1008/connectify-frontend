import { useState } from 'react';
import _ from 'lodash';
import { getStageContacts } from '../../../../api/contacts';

const useGetCardDataStageWise = ({ user, setStages }) => {
  // ** State **
  const [loading, setLoading] = useState(true);
  const [stageContacts, setStageContacts] = useState({});

  const getCardDataStageWise = async ({
    customPipelineId,
    groupId,
    moduleKey,
    stages,
    page = 1,
    limit = 20,
  }) => {
    setLoading(true);

    const { data, error } = await getStageContacts({
      customPipeline: customPipelineId,
      group: groupId,
      archived: false,
      company: user.company._id,
      aggregateOn: moduleKey,
      page,
      limit,
      stages: stages.join(','),
    });

    if (!error && _.isArray(data.data)) {
      const resultObj = { ...stageContacts };

      setStages((prev) => {
        return prev.map((stage) => {
          const stageObj = data.data.find((obj) => obj._id === stage.id);
          if (stageObj) {
            resultObj[stage.id] = {
              contacts: stageObj?.contacts || [],
              total: stageObj?.total || 0,
              currentPage: 1,
              hasMoreContacts: stageObj?.hasMoreContacts ?? false,
            };
          }

          let cards =
            stageObj?.contacts.map((c) => {
              return {
                id: c._id,
                title:
                  [c.firstName || '', c.lastName || ''].join(' ').trim() ||
                  c.email,
                companyName: c.company_name,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email,
                userProfile: c.userProfile,
              };
            }) || [];

          if (page !== 1) {
            cards = [...stage.cards, ...cards];
          }

          return {
            ...stage,
            total: stageObj?.total || stage?.total || 0,
            cards,
          };
        });
      });
      setStageContacts(resultObj);

      setLoading(false);
    } else {
      setStageContacts([]);
      setLoading(false);
    }
  };

  return {
    getCardDataStageWise,
    loading,
    stageContacts,
    setStageContacts,
  };
};

export default useGetCardDataStageWise;
