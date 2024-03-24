import _ from 'lodash';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useGetBasicRoute from '../../../../hooks/useGetBasicRoute';
import contactIcon from '../../../../assets/images/icons/contact-icon.svg';

import { useGetContactsByFilter } from '../../../../views/Admin/contact/service/contact.services';
import { ArrowLeft, Search } from 'react-feather';

// ** Custom Components
import Avatar from '@components/avatar';

const NavbarSearch = () => {
  const history = useHistory();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const { basicRoute } = useGetBasicRoute();
  const { getContacts, isLoading } = useGetContactsByFilter();

  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownForMobile, setShowDropdownForMobile] = useState(false);

  const [searchData, setSearchData] = useState([]);

  const closeDropdown = (e) => {
    const inputEl = document.getElementById('serachInput');

    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      !inputEl.contains(e.target)
    ) {
      setSearchText('');
      setSearchData([]);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const debounceFn = useCallback(
    _.debounce(async (search) => {
      if (search) {
        const result = await getContacts({
          search,
          page: 1,
          query: {
            select: 'firstName,lastName,email,userProfile',
          },
        });
        const searchData = result.data.allContacts;
        if (inputRef.current && !isLoading) {
          inputRef.current.focus();
        }

        setSearchData(searchData);
      } else {
        setSearchData([]);
      }
    }, 300),
    []
  );

  const handleSearch = (e) => {
    debounceFn(e.target.value);
    setSearchText(e.target.value);
  };

  return (
    <div className={`navbar-search ${showDropdownForMobile ? 'active' : ''}`}>
      <h4 className='mobile-title'>Search contact</h4>
      <div
        className='back-arrow'
        onClick={() => setShowDropdownForMobile(false)}
      >
        <ArrowLeft />
      </div>
      <input
        id='serachInput'
        ref={inputRef}
        type='text'
        value={searchText}
        onFocus={() => {
          setShowDropdown(true);
          setShowDropdownForMobile(true);
        }}
        // disabled={isLoading}
        onChange={handleSearch}
        placeholder='Search ...'
      />

      <div className='nav-search-content fancy-scrollbar' ref={dropdownRef}>
        {showDropdown ? (
          isLoading ? (
            <div className='d-flex justify-content-center py-2'>
              <div className='loading-round'></div>
            </div>
          ) : searchData?.length ? (
            searchData.map((item) => (
              <div
                className='nav-search-item cursor-pointer border-bottom d-flex align-items-center'
                key={item._id}
                onClick={() => {
                  setSearchText('');
                  setShowDropdown(false);
                  setShowDropdownForMobile(false);
                  history.push(`${basicRoute}/contact/${item?._id}`);
                }}
              >
                <div className='me-50'>
                  {item?.userProfile && item?.userProfile !== 'false' ? (
                    <Avatar
                      imgClassName='profile-img'
                      img={`${process.env.REACT_APP_S3_BUCKET_BASE_URL}${item.userProfile}`}
                      status='online'
                      content={`${item?.firstName} ${item?.lastName}`}
                      initials
                    />
                  ) : (
                    <Avatar
                      imgClassName='profile-img'
                      status='online'
                      className='user-profile'
                      color={'light-primary'}
                      content={`${item?.firstName} ${item?.lastName}`}
                      initials
                    />
                  )}
                </div>
                <div className='nav-search-item-cn'>
                  <div className='user-name'>
                    {`${item.firstName} ${item.lastName}`.trim() || item.email}
                  </div>
                  <div className='font-small-2 company-name'>
                    {item.company_name}
                  </div>
                </div>
              </div>
            ))
          ) : searchText ? (
            <div className='no-data-found'>
              <div className='img-wrapper'>
                <img src={contactIcon} alt='Contact' />
              </div>
              <div className='title'>No Contacts Found</div>
            </div>
          ) : null
        ) : null}
      </div>
      <div className='search-icon'>
        <Search />
      </div>
    </div>
  );
};

export default NavbarSearch;
