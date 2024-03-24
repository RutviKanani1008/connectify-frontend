import { useState } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { userData } from '../../../../redux/user';
import {
  useGetContactsForCloneMassEmailAPI,
  useGetContactsForMassEmailAPI,
  useGetContactsNewAPI,
  useGetSelectedContactsForMassEmailAPI,
} from '../service/contact.services';
import { useGetSelectedContactsForSavedMassEmailAPI } from '../../campaigns/mass-email-tool/service/massEmail.services';

export const useGetContactsListing = () => {
  const user = useSelector(userData);
  const { getContactsNewAPI, isError, isLoading, isSuccess } =
    useGetContactsNewAPI();

  const [contactsData, setContactData] = useState({ results: [], total: 0 });
  const [controller, setController] = useState(null);

  const getContacts = async (query = {}) => {
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);
    const { data, error } = await getContactsNewAPI({
      params: {
        company: user.company._id,
        select:
          'firstName,lastName,email,phone,company,role,archived,deleted,group,userId,website,company_name,group,company',
        include: JSON.stringify([
          { path: 'group.id', ref: 'Groups' },
          { path: 'company', select: 'name' },
        ]),
        ...query,
      },
      signal: tempController.signal,
    });

    if (!error && _.isArray(data?.results)) {
      tempController.abort();
      setContactData({
        results: data.results.map((obj) => ({ ...obj, selected: true })),
        total: data.total,
      });
    }
  };
  return { getContacts, isLoading, isSuccess, isError, contactsData };
};

export const useGetContacts = ({
  initialQuery = {},
  previousDataStore = false,
}) => {
  const user = useSelector(userData);
  const { getContactsNewAPI, isError, isLoading, isSuccess } =
    useGetContactsNewAPI();

  const [contactsData, setContactData] = useState({
    results: [],
    total: 0,
    unsSubscribedCount: 0,
  });
  const [controller, setController] = useState(null);

  const getContacts = async (query = {}) => {
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);

    const { data, error } = await getContactsNewAPI({
      params: {
        company: user.company._id,
        ...initialQuery,
        ...query,
      },
      signal: tempController.signal,
    });
    if (!error && _.isArray(data?.results)) {
      tempController.abort();
      const obj = {
        results: data.results,
        total: data.total,
        unsSubscribedCount: data.unsSubscribedCount,
      };
      if (previousDataStore && query.page !== 1) {
        setContactData((prev) => ({
          ...obj,
          results: [...prev.results, ...obj.results],
        }));
      } else {
        setContactData(obj);
      }
      return obj;
    }
  };
  return { getContacts, isLoading, isSuccess, isError, contactsData };
};

export const useGetContactsForMassEmail = ({
  initialQuery = {},
  previousDataStore = false,
}) => {
  const user = useSelector(userData);
  const { getContactsNewAPI, isError, isLoading, isSuccess } =
    useGetContactsForMassEmailAPI();

  const [contactsData, setContactData] = useState({
    results: [],
    total: 0,
    unsSubscribedCount: 0,
  });
  const [controller, setController] = useState(null);

  const getContacts = async (query = {}) => {
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);

    const { data, error } = await getContactsNewAPI({
      params: {
        company: user.company._id,
        ...initialQuery,
        ...query,
      },
      signal: tempController.signal,
    });
    if (!error && _.isArray(data?.results)) {
      tempController.abort();
      const obj = {
        results: data.results,
        total: data.total,
        unsSubscribedCount: data.unsSubscribedCount,
      };
      if (previousDataStore && query.page !== 1) {
        setContactData((prev) => ({
          ...obj,
          results: [...prev.results, ...obj.results],
        }));
      } else {
        setContactData(obj);
      }
      return obj;
    }
  };
  return { getContacts, isLoading, isSuccess, isError, contactsData };
};

export const useGetContactsForCloneMassEmail = ({
  initialQuery = {},
  previousDataStore = false,
}) => {
  const user = useSelector(userData);
  const { getContactsForCloneMassEmailAPI, isError, isLoading, isSuccess } =
    useGetContactsForCloneMassEmailAPI();

  const [contactsData, setContactData] = useState({
    results: [],
    total: 0,
    unsSubscribedCount: 0,
  });
  const [controller, setController] = useState(null);

  const getContactsForCloneMassEmail = async (query = {}) => {
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);

    const { data, error } = await getContactsForCloneMassEmailAPI({
      params: {
        company: user.company._id,
        ...initialQuery,
        ...query,
      },
      signal: tempController.signal,
    });
    if (!error && _.isArray(data?.results)) {
      tempController.abort();
      const obj = {
        results: data.results,
        total: data.total,
        unsSubscribedCount: data.unsSubscribedCount,
      };
      if (previousDataStore && query.page !== 1) {
        setContactData(() => ({
          ...obj,
          // results: [...prev.results, ...obj.results],
          results: [...obj.results],
        }));
      } else {
        setContactData(obj);
      }
      return obj;
    }
  };
  return {
    getContactsForCloneMassEmail,
    isLoading,
    isSuccess,
    isError,
    contactsData,
  };
};

export const useGetSelectedContactsForMassEmail = ({
  initialQuery = {},
  previousDataStore = false,
  massEmailId = null,
}) => {
  const user = useSelector(userData);
  const { getSelectedContactsAPI, isError, isLoading, isSuccess } =
    useGetSelectedContactsForMassEmailAPI();

  const {
    getMassEmailContactsAPI,
    isError: savedIsError,
    isLoading: savedIsLoading,
    isSuccess: savedIsSuccess,
  } = useGetSelectedContactsForSavedMassEmailAPI();

  const [contactsData, setContactData] = useState({ results: [], total: 0 });
  const [controller, setController] = useState(null);

  const getSelectedContacts = async (query = {}) => {
    let tempController = controller;
    if (tempController) {
      tempController.abort();
    }
    tempController = new AbortController();
    setController(tempController);

    query = { ...initialQuery, ...query };

    if (!massEmailId) {
      const { data, error } = await getSelectedContactsAPI({
        params: {
          filters: JSON.stringify({
            company: user.company._id,
            select:
              'firstName,lastName,email,phone,company,role,archived,deleted,group,userId,website,company_name,group,company',
            include: [
              { path: 'group.id', ref: 'Groups' },
              { path: 'company', select: 'name' },
            ],
            ...initialQuery,
            ...query,
          }),
        },
        signal: tempController.signal,
      });
      if (!error && _.isArray(data?.results)) {
        tempController.abort();
        const obj = {
          results: data.results,
          total: data.total,
        };

        if (previousDataStore && query.page !== 1) {
          setContactData((prev) => ({
            ...obj,
            results: [...prev.results, ...obj.results],
          }));
        } else {
          setContactData(obj);
        }
        return obj;
      }
    } else {
      const { data, error } = await getMassEmailContactsAPI(massEmailId, {
        params: {
          search: query.search,
          page: query.page,
          limit: query.limit,
          select:
            'firstName,lastName,email,phone,company,role,archived,deleted,group,userId,website,company_name,group,company',
        },
        signal: tempController.signal,
      });
      if (!error && _.isArray(data?.results)) {
        tempController.abort();
        const obj = {
          results: data.results,
          total: data.total,
        };

        if (previousDataStore && query.page !== 1) {
          setContactData((prev) => ({
            ...obj,
            results: [...prev.results, ...obj.results],
          }));
        } else {
          setContactData(obj);
        }
        return obj;
      }
    }
  };
  return {
    getSelectedContacts,
    isLoading: !massEmailId ? isLoading : savedIsLoading,
    isSuccess: !massEmailId ? isSuccess : savedIsSuccess,
    isError: !massEmailId ? isError : savedIsError,
    contactsData,
  };
};
