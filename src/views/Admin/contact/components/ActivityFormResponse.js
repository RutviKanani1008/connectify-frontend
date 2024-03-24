import { removeSpecialCharactersFromString } from '../../../../helper/common.helper';

export const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
};

export const ActivityFormResponse = ({
  fields,
  autoresponder,
  formResponse,
}) => {
  let bodyContent = autoresponder?.htmlBody || '';
  let subject = autoresponder?.subject;
  fields?.forEach((obj) => {
    String.prototype.replaceAll = function (target, payload) {
      const regex = new RegExp(target, 'g');
      return this.valueOf().replace(regex, payload);
    };
    const escapedSubstring = escapeRegExp(`@${obj.label}`);
    const replaceRegex = new RegExp(escapedSubstring, 'gi');
    bodyContent = bodyContent?.replaceAll(
      replaceRegex,
      obj?.type === 'select'
        ? formResponse?.[removeSpecialCharactersFromString(obj.label)]?.value ??
            ''
        : obj?.type === 'multiSelect' &&
          formResponse?.[removeSpecialCharactersFromString(obj?.label)]?.length
        ? formResponse?.[removeSpecialCharactersFromString(obj?.label)]
            ?.map((obj) => obj?.label)
            ?.join(', ')
        : formResponse?.[removeSpecialCharactersFromString(obj?.label)] ?? ''
    );
    subject = subject
      .split(`@[${obj?.label}](${obj?.label})`)
      .join(
        obj?.type === 'select'
          ? formResponse?.[removeSpecialCharactersFromString(obj?.label)]
              ?.value ?? ''
          : obj?.type === 'multiSelect' &&
            formResponse?.[removeSpecialCharactersFromString(obj?.label)]
              ?.length
          ? formResponse?.[removeSpecialCharactersFromString(obj?.label)]
              ?.map((obj) => obj?.label)
              ?.join(', ')
          : formResponse?.[removeSpecialCharactersFromString(obj?.label)] ?? ''
      );
  });

  return (
    <>
      <div
        className='right-dynamic-content'
        dangerouslySetInnerHTML={{
          __html: bodyContent,
        }}
      ></div>
    </>
  );
};
