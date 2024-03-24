import { useEffect, useState } from 'react';
import _ from 'lodash';
import { useLazyGetAfterTaskInstructionTemplateQuery } from '../../../../redux/api/afterTaskInstructionTemplateApi';

export const useGetAfterTaskInstructionTemplateList = ({ showTaskModal }) => {
  // ** State **
  const [
    afterTaskInstructionTemplateList,
    setAfterTaskInstructionTemplateList,
  ] = useState([]);
  const [controller, setController] = useState(null);

  //   ** APIS **
  const [getAfterTaskInstructionTemplate, { isLoading }] =
    useLazyGetAfterTaskInstructionTemplateQuery();

  useEffect(() => {
    if (!showTaskModal) {
      controller?.abort();
    }
  }, [showTaskModal]);

  useEffect(() => {
    getAfterTaskInstructionTemplateList();
  }, []);

  const getAfterTaskInstructionTemplateList = async () => {
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);
    const { data } = await getAfterTaskInstructionTemplate();

    if (_.isArray(data?.data)) {
      setAfterTaskInstructionTemplateList(data.data);
    }
  };

  return { afterTaskInstructionTemplateList, isLoading };
};
