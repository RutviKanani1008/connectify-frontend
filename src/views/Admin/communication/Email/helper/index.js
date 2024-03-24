export const isUnReadMail = (flags) => {
  return flags.reduce(
    (prev, obj) => (!obj.includes(`\\Seen`) ? prev + 1 : prev),
    0
  );
};

export const isMailStarred = (flags) => {
  return flags.reduce(
    (prev, obj) => (obj.includes(`\\Flagged`) ? prev + 1 : prev),
    0
  );
};

export const flaggedAddIn2DArray = (array) => {
  const tempArray = [...array]?.map((obj) =>
    [...obj, '\\Flagged'].filter((flags) => flags !== '\\Seen')
  );
  return tempArray;
};

export const flaggedRemoveFrom2DArray = (array) => {
  const tempArray = [...array]?.map((obj) =>
    obj.filter((flags) => flags !== '\\Flagged')
  );
  return tempArray;
};

export const seenFlagRemoveFrom2DArray = (array) => {
  const tempArray = [...array]?.map((obj) =>
    obj.filter((flags) => flags !== '\\Seen')
  );
  return tempArray;
};
