import React from 'react';
import '../../../assets/scss/chat.scss';

const Chat = () => {
  return (
    <div>
      <div className='chat_wrapper'>
        <div className='chat_inner d-flex'>
          <div className='left_sidebar'>
            <ul className='chat_ul'>
              <li>
                <a href='#'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
                    <polyline points='14 2 14 8 20 8'></polyline>
                    <line x1='16' y1='13' x2='8' y2='13'></line>
                    <line x1='16' y1='17' x2='8' y2='17'></line>
                    <polyline points='10 9 9 9 8 9'></polyline>
                  </svg>
                </a>
                <span>Files</span>
              </li>
              <li>
                <a href='#'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'></path>
                    <circle cx='9' cy='7' r='4'></circle>
                    <path d='M23 21v-2a4 4 0 0 0-3-3.87'></path>
                    <path d='M16 3.13a4 4 0 0 1 0 7.75'></path>
                  </svg>
                </a>
                <span>Contact</span>
              </li>
              <li>
                <a href='#'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <circle cx='12' cy='12' r='3'></circle>
                    <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'></path>
                  </svg>
                </a>
                <span>Settings</span>
              </li>
            </ul>
          </div>
          <div className='chat_middle d-flex'>
            <div className='recent_chats'>
              <div className='top_bar_wrapper'>
                <div className='top_bar d-flex'>
                  <div className='chat_con'>
                    <h2>Chat</h2>
                    <span>Start New Conversation</span>
                  </div>
                  <div className='chat_search'>
                    <img
                      className='search_img'
                      src='/static/media/search-gray-icon.f7359275.svg'
                    />
                  </div>
                </div>
                <div className='chat_tabs'>
                  <ul className='d-flex'>
                    <li>
                      <a href='#' className='active'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
                        </svg>
                        <span className='nav-link-text'>Chat</span>
                      </a>
                    </li>
                    <li>
                      <a href='#'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'></path>
                        </svg>
                        <span className='nav-link-text'>Call</span>
                      </a>
                    </li>
                    <li>
                      <a href='#'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='20'
                          height='20'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'></path>
                          <circle cx='9' cy='7' r='4'></circle>
                          <path d='M23 21v-2a4 4 0 0 0-3-3.87'></path>
                          <path d='M16 3.13a4 4 0 0 1 0 7.75'></path>
                        </svg>
                        <span className='nav-link-text'>Contact</span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className='direct_chat_tabs'>
                  <ul className='d-flex'>
                    <li>
                      <a href='#' className='active'>
                        <span className='nav-link-text'>Direct</span>
                      </a>
                    </li>
                    <li>
                      <a href='#'>
                        <span className='nav-link-text'>Group</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='chatboxes'>
                <div className='single_chat_box d-flex'>
                  <div className='contact_img'>
                    <img
                      className='chat_user_img'
                      src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                    />
                    <span className='active_user'></span>
                  </div>
                  <div className='contact_con'>
                    <h6 className='contact_name'>Lorem Ipsum</h6>
                    <span className='contact_chat'>
                      Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem
                      Ipsum Lorem Ipsum Lorem Ipsum
                    </span>
                  </div>
                </div>
                <div className='single_chat_box d-flex'>
                  <div className='contact_img'>
                    <img
                      className='chat_user_img'
                      src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                    />
                    <span className='away_user'></span>
                  </div>
                  <div className='contact_con'>
                    <h6 className='contact_name'>Lorem Ipsum</h6>
                    <span className='contact_chat'>
                      Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem
                      Ipsum Lorem Ipsum Lorem Ipsum
                    </span>
                  </div>
                </div>
                <div className='single_chat_box d-flex'>
                  <div className='contact_img'>
                    <img
                      className='chat_user_img'
                      src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                    />
                    <span className='busy_user'></span>
                  </div>
                  <div className='contact_con'>
                    <h6 className='contact_name'>Lorem Ipsum</h6>
                    <span className='contact_chat'>
                      Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem
                      Ipsum Lorem Ipsum Lorem Ipsum
                    </span>
                  </div>
                </div>
                <div className='new_chat'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='feather feather-plus'
                  >
                    <line x1='12' y1='5' x2='12' y2='19'></line>
                    <line x1='5' y1='12' x2='19' y2='12'></line>
                  </svg>
                </div>
              </div>
            </div>
            <div className='chatbox'>
              <div className='contact-details d-flex'>
                <div className='single_chat_box d-flex'>
                  <div className='contact_img'>
                    <img
                      className='chat_user_img'
                      src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                    />
                    <span className='active_user'></span>
                  </div>
                  <div className='contact_con'>
                    <h6 className='contact_name'>Lorem Ipsum</h6>
                    <span className='active_text'>Active</span>
                  </div>
                </div>
                <div className='specific_search'>
                  <img
                    className='search_img'
                    src='/static/media/search-gray-icon.f7359275.svg'
                  />
                </div>
              </div>
              <div className='contact-chat'>
                <ul className='chatappend'>
                  <li className='replies d-flex'>
                    <div className='profile'>
                      <img
                        className='chat_user_img'
                        src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                      />
                    </div>
                    <div className='media-body'>
                      <div className='contact-name'>
                        <h6>Lorem Ipsum</h6>
                        <span className='chat-time'>01:40 Am</span>
                        <ul className='msg-box'>
                          <li className='single-msg'>Hi I am Test,</li>
                          <li className='single-msg'>How are you today?</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li className='replies sender d-flex'>
                    <div className='profile'>
                      <img
                        className='chat_user_img'
                        src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                      />
                    </div>
                    <div className='media-body'>
                      <div className='contact-name'>
                        <h6>Lorem Ipsum</h6>
                        <span className='chat-time'>01:40 Am</span>
                        <ul className='msg-box'>
                          <li className='single-msg'>Hi I am Test,</li>
                          <li className='single-msg'>How are you today?</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li className='replies d-flex'>
                    <div className='profile'>
                      <img
                        className='chat_user_img'
                        src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                      />
                    </div>
                    <div className='media-body'>
                      <div className='contact-name'>
                        <h6>Lorem Ipsum</h6>
                        <span className='chat-time'>01:40 Am</span>
                        <ul className='msg-box'>
                          <li className='single-msg'>Hi I am Test,</li>
                          <li className='single-msg'>How are you today?</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li className='replies sender d-flex'>
                    <div className='profile'>
                      <img
                        className='chat_user_img'
                        src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                      />
                    </div>
                    <div className='media-body'>
                      <div className='contact-name'>
                        <h6>Lorem Ipsum</h6>
                        <span className='chat-time'>01:40 Am</span>
                        <ul className='msg-box'>
                          <li className='single-msg'>Hi I am Test,</li>
                          <li className='single-msg'>How are you today?</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li className='replies d-flex'>
                    <div className='profile'>
                      <img
                        className='chat_user_img'
                        src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                      />
                    </div>
                    <div className='media-body'>
                      <div className='contact-name'>
                        <h6>Lorem Ipsum</h6>
                        <span className='chat-time'>01:40 Am</span>
                        <ul className='msg-box'>
                          <li className='single-msg'>Hi I am Test,</li>
                          <li className='single-msg'>How are you today?</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li className='replies sender d-flex'>
                    <div className='profile'>
                      <img
                        className='chat_user_img'
                        src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                      />
                    </div>
                    <div className='media-body'>
                      <div className='contact-name'>
                        <h6>Lorem Ipsum</h6>
                        <span className='chat-time'>01:40 Am</span>
                        <ul className='msg-box'>
                          <li className='single-msg'>Hi I am Test,</li>
                          <li className='single-msg'>How are you today?</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li className='replies d-flex'>
                    <div className='profile'>
                      <img
                        className='chat_user_img'
                        src='https://cdn-icons-png.flaticon.com/512/3541/3541871.png'
                      />
                    </div>
                    <div className='media-body'>
                      <div className='contact-name'>
                        <h6>Lorem Ipsum</h6>
                        <span className='chat-time'>01:40 Am</span>
                        <ul className='msg-box'>
                          <li className='single-msg'>Hi I am Test,</li>
                          <li className='single-msg'>How are you today?</li>
                        </ul>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
