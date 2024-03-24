import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import {
  getConnectedMailAccounts,
  getCurrentMails,
  getMailFolders,
  getMails,
  getSelectedMails,
  selectAllMail,
  setConnectedMailAccounts,
  setCurrentMail,
  setMailFolder,
  setMailFoldersCount,
  setMails,
  setTotalMailCount,
} from '../../../../../redux/email';
import { useGetMappedImapFolderService } from '../services/mailProviderFolder.service';
import { singleElementRemoveFromArray } from '../../../../../utility/Utils';
import {
  useGetMailThreadQuery,
  useGetMailsQuery,
  useLazyGetConnectedSmtpAccountsQuery,
  useLazyGetIsMailSyncingQuery,
  useLazyGetMailsCountQuery,
  useLazyGetNextPrevMailServiceQuery,
  useMailMoveIntoSpecificFolderMutation,
  useMarkReadUnreadMutation,
  useMarkStarredUStarredMutation,
} from '../../../../../redux/api/mailApi';
import {
  flaggedAddIn2DArray,
  flaggedRemoveFrom2DArray,
  isUnReadMail,
  isMailStarred,
  seenFlagRemoveFrom2DArray,
} from '../helper';

export const useGetEmails = ({ queryArg = {}, skip = true }) => {
  // ** Store
  const dispatch = useDispatch();

  // ** States **
  const [mailLoading, setMailLoading] = useState(false);

  // ** APIS **
  const { isError, isSuccess, isFetching, data, refetch } = useGetMailsQuery(
    {
      params: {
        ...queryArg,
        select: '_id,mail_provider_thread_id,from,subject,send_date,flags',
      },
    },
    { skip }
  );

  useEffect(() => {
    setMailLoading(true);
    refetch();
  }, [queryArg]);

  useEffect(() => {
    if (data?.data && _.isArray(data.data.rows)) {
      setMailLoading(false);
      const { rows, count } = data.data;
      dispatch(setMails([...rows]));
      dispatch(setTotalMailCount(count));
      dispatch(setMailFoldersCount({ [queryArg.folder]: count }));
    }
  }, [data]);

  return {
    mails: data?.data?.rows,
    isError,
    isLoading: isFetching === true && mailLoading,
    isSuccess,
    refetch,
  };
};

export const useGetEmailThread = ({ query = {}, skip = true }) => {
  const dispatch = useDispatch();
  const [mailLoading, setMailLoading] = useState(true);

  const { isError, isSuccess, isFetching, data, refetch } =
    useGetMailThreadQuery({ params: query }, { skip });

  useEffect(() => {
    if (!skip) {
      setMailLoading(true);
      refetch();
    }
  }, [query, skip]);

  useEffect(() => {
    if (data?.data && _.isArray(data.data)) {
      setMailLoading(false);
      const updatedData = _.cloneDeep(data.data);
      updatedData.forEach((mail) => {
        // Here check if attachment found in body then cid same it is other wise make it null
        mail.attachments = mail?.attachments?.map((attachment) => {
          const tempHtml = mail.html;
          mail.html = mail.html?.replace(
            `cid:${attachment.cid}`,
            attachment.path
          );
          if (tempHtml?.includes(attachment.cid)) {
            return { ...attachment };
          } else {
            return { ...attachment, cid: null };
          }
        });
      });
      dispatch(setCurrentMail(updatedData));
    }
  }, [data]);

  return {
    isError,
    isLoading: isFetching && mailLoading,
    isSuccess,
    refetch,
  };
};

export const useGetConnectedSmtpAccounts = () => {
  const dispatch = useDispatch();
  const connectedMailAccounts = useSelector(getConnectedMailAccounts);

  const [getConnectedSmtpAccountsService, { isError, isFetching, isSuccess }] =
    useLazyGetConnectedSmtpAccountsQuery();

  const getConnectedSmtpAccounts = async () => {
    if (!connectedMailAccounts.length) {
      const { data, error } = await getConnectedSmtpAccountsService();
      if (!error && data && data.data && _.isArray(data.data)) {
        dispatch(setConnectedMailAccounts(data.data));
      }
    }
  };

  return {
    getConnectedSmtpAccounts,
    isError,
    isLoading: isFetching,
    isSuccess,
  };
};

export const useGetIsMailSyncing = ({ setMailCount }) => {
  const [initialMailSyncing, setInitialMailSyncing] = useState(false);
  const [getIsMailSyncingService, { isError, isFetching, isSuccess }] =
    useLazyGetIsMailSyncingQuery();

  const getIsMailSyncing = async () => {
    const { data, error } = await getIsMailSyncingService();
    if (data && data.data && !error) {
      setMailCount({
        fetchedMailCount: data.data.fetchedMailCount || 0,
        totalNumberOfMail: data.data.totalNumberOfMail || 0,
      });
      setInitialMailSyncing(data?.data?.isFullSyncRunning);
    }
  };

  return {
    getIsMailSyncing,
    setInitialMailSyncing,
    initialMailSyncing,
    isError,
    isLoading: isFetching,
    isSuccess,
  };
};

export const useGetMappedImapFolder = () => {
  const dispatch = useDispatch();

  const { getMappedImapFolderService, isError, isLoading, isSuccess } =
    useGetMappedImapFolderService();
  const folders = useSelector(getMailFolders);
  const getMappedImapFolder = async () => {
    if (_.isEmpty(folders)) {
      const { data, error } = await getMappedImapFolderService();
      if (!error && data && _.isObject(data.providerSelection)) {
        let folder = { ...data.providerSelection };
        // Here add unread tab in sidebar
        if (folder['Inbox']) {
          folder = Object.entries(folder);
          folder.splice(1, 0, ['Unread', 'Unread']);
          folder = Object.fromEntries(folder);
        }
        dispatch(setMailFolder({ ...folder }));
      }
    }
  };

  return { getMappedImapFolder, isLoading, isSuccess, isError };
};

export const useFoldersMailCount = () => {
  const dispatch = useDispatch();

  const [
    getFoldersMailCountAPI,
    { isFetching: isLoading, isSuccess, isError },
  ] = useLazyGetMailsCountQuery();

  const getFoldersMailCount = async (params) => {
    const { data, error } = await getFoldersMailCountAPI({ params });

    if (!error && data?.data) {
      dispatch(setMailFoldersCount(data.data.foldersCount));
    }
  };

  return { getFoldersMailCount, isLoading, isSuccess, isError };
};

export const useMarkReadUnread = () => {
  const [markReadUnreadService, { isLoading }] = useMarkReadUnreadMutation();

  // ** Store **
  const dispatch = useDispatch();
  const selectedMails = useSelector(getSelectedMails);
  const mails = useSelector(getMails);
  const mailsRef = useRef();
  mailsRef.current = mails;

  const markReadUnread = async (body) => {
    const { error } = await markReadUnreadService({ data: body });
    if (!error) {
      const unreadMails = selectedMails.filter((mail) =>
        isUnReadMail(mail.flags)
      );
      const readMails = selectedMails.filter(
        (mail) => !isUnReadMail(mail.flags)
      );

      if (unreadMails.length) {
        const tempMails = mailsRef.current.map((mail) =>
          unreadMails.find(
            (obj) =>
              obj.mail_provider_thread_id === mail.mail_provider_thread_id
          )
            ? {
                ...mail,
                flags: mail.flags.map((array) => [...(array || []), '\\Seen']),
              }
            : mail
        );

        dispatch(setMails(tempMails));
      } else {
        const tempMails = mailsRef.current.map((mail) =>
          readMails.find(
            (obj) =>
              obj.mail_provider_thread_id === mail.mail_provider_thread_id
          )
            ? {
                ...mail,
                flags: seenFlagRemoveFrom2DArray(mail.flags),
              }
            : mail
        );
        dispatch(setMails(tempMails));
      }
      dispatch(selectAllMail(false));
    }
  };

  return { markReadUnread, isLoading };
};

export const useMarkStarredUnStarred = ({ isMailDetail = false } = {}) => {
  const [markStarredUStarredService, { isLoading }] =
    useMarkStarredUStarredMutation();

  // ** Store **
  const dispatch = useDispatch();
  let mails = [];
  if (isMailDetail) {
    mails = useSelector(getCurrentMails);
  } else {
    mails = useSelector(getMails);
  }
  const mailsRef = useRef();
  mailsRef.current = mails;

  /*
   ==== single: this parameter pass for the if we want show loader of without loader api calling ===
   */

  const markStarredUnStarred = async (body, selectedMails, single, type) => {
    if (single && !(type === 'list')) {
      const unStarredMails = selectedMails.filter(
        (mail) => !mail.flags.includes('\\Flagged')
      );
      const starredMails = selectedMails.filter((mail) =>
        mail.flags.includes('\\Flagged')
      );

      if (unStarredMails.length) {
        const tempMails = mailsRef.current.map((mail) =>
          unStarredMails.find((obj) => obj.message_id === mail.message_id)
            ? {
                ...mail,
                flags: singleElementRemoveFromArray(
                  [...mail.flags, '\\Flagged'],
                  '\\Seen'
                ),
              }
            : mail
        );
        if (isMailDetail) {
          dispatch(setCurrentMail(tempMails));
        } else {
          dispatch(setMails(tempMails));
        }
      } else {
        const tempMails = mailsRef.current.map((mail) =>
          starredMails.find((obj) => obj.message_id === mail.message_id)
            ? {
                ...mail,
                flags: singleElementRemoveFromArray(mail.flags, '\\Flagged'),
              }
            : mail
        );
        if (isMailDetail) {
          dispatch(setCurrentMail(tempMails));
        } else {
          dispatch(setMails(tempMails));
        }
      }
      dispatch(selectAllMail(false));
      await markStarredUStarredService({ data: body });
    } else {
      if (!single) {
        await markStarredUStarredService({ data: body });
      }
      const unStarredMails = selectedMails.filter(
        (mail) => !isMailStarred(mail.flags)
      );
      const starredMails = selectedMails.filter((mail) =>
        isMailStarred(mail.flags)
      );

      if (unStarredMails.length) {
        const tempMails = mailsRef.current.map((mail) =>
          unStarredMails.find(
            (obj) =>
              obj.mail_provider_thread_id === mail.mail_provider_thread_id
          )
            ? {
                ...mail,
                flags: flaggedAddIn2DArray(mail.flags),
              }
            : mail
        );
        dispatch(setMails(tempMails));
      } else {
        const tempMails = mailsRef.current.map((mail) =>
          starredMails.find(
            (obj) =>
              obj.mail_provider_thread_id === mail.mail_provider_thread_id
          )
            ? {
                ...mail,
                flags: flaggedRemoveFrom2DArray(mail.flags),
              }
            : mail
        );
        dispatch(setMails(tempMails));
      }
      dispatch(selectAllMail(false));
      if (single) {
        await markStarredUStarredService({ data: body });
      }
    }
  };

  return { markStarredUnStarred, isLoading };
};

export const useGetNextPrevMail = ({ setNextPrevMails }) => {
  const [getNextPrevMailService, { isLoading }] =
    useLazyGetNextPrevMailServiceQuery();

  const getNextPrevMail = async (query) => {
    const { data, error } = await getNextPrevMailService({ params: query });
    if (data && data.data && !error) {
      setNextPrevMails(data.data);
    }
  };

  return { getNextPrevMail, isLoading };
};

export const useMailMoveIntoSpecificFolder = () => {
  // ** Store **
  const dispatch = useDispatch();
  const mails = useSelector(getMails);

  const [mailMoveIntoSpecificFolderService, { isLoading }] =
    useMailMoveIntoSpecificFolderMutation();

  const mailMoveIntoSpecificFolder = async (body) => {
    const { data, error } = await mailMoveIntoSpecificFolderService({
      data: body,
    });

    if (data && data.data && !error) {
      dispatch(
        setMails([
          ...mails.filter(
            (mail) => !body.threadIds.includes(mail.mail_provider_thread_id)
          ),
        ])
      );
      dispatch(selectAllMail(false));
    }
  };

  return { mailMoveIntoSpecificFolder, isLoading };
};
