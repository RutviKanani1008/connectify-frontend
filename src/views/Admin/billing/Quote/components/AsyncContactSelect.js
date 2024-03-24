import React, { useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { useGetContactsByFilter } from '../../../../../views/Admin/contact/service/contact.services';

const AsyncContactSelect = (props) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [finalOpts, setFinalOpts] = useState([]);

  const { getContacts } = useGetContactsByFilter();

  const loadOptions = async (searchVal) => {
    let newPage = page;
    if (search !== searchVal) {
      newPage = 1;
      setSearch(searchVal);
    }

    const data = await getContacts({
      search: searchVal,
      page: newPage,
      query: { select: 'firstName,lastName,enableBilling,email,userProfile' },
    });

    const { total, allContacts } = data.data;

    const options = allContacts.map((item) => ({
      label: `${
        item.firstName || item.lastName
          ? `${item.firstName} ${item.lastName}`.trim()
          : `${item.email}`
      } `,
      value: item._id,
      isEnableBilling: item?.enableBilling || false,
      profile: item?.userProfile || null,
    }));

    const updatedOpts = finalOpts.concat(options);
    setFinalOpts(updatedOpts);
    setPage(newPage + 1);

    return {
      options,
      hasMore: total > updatedOpts.length,
    };
  };

  return (
    <div>
      <AsyncPaginate
        {...props}
        debounceTimeout={300}
        value={props.value}
        onChange={props.onChange}
        loadOptions={loadOptions}
        options={props.options}
        defaultOptions={props.defaultOptions || []}
      />
    </div>
  );
};

export default AsyncContactSelect;
