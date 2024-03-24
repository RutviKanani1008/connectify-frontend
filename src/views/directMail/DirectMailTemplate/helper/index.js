export const handlePrintHelper = ({
  body,
  type,
  postcardBack,
  postcardFront,
  header,
  footer,
  paddingTop,
  paddingBottom,
}) => {
  const windowOptions = `width=${window.screen.width},height=${window.screen.height}`;
  const newWindow = window.open('', '_blank', windowOptions);

  let html = '';

  if (type === 'letter') {
    html = `<div
    class='direct-mail-print'
  >
      ${
        header
          ? `<div class='direct-mail-letter-header'>
            <div class='direct-mail-letter-header-cn'>${header}</div>
          </div>`
          : ''
      }
      <div
        class='direct-mail-letter-contant'
        style="height:calc(1018.22px - ${paddingTop + paddingBottom}px);"
      >
        <div
          class='inner-wrapper'
        >${body}</div>
      </div>
      ${
        footer
          ? `<div class='direct-mail-letter-footer'>
            <div class='direct-mail-letter-footer-cn'>${footer}</div>
          </div>`
          : ''
      }
  </div>`;
  } else {
    html = `
    <div class='direct-mail-postcard-print-wrapper' key={index}>
    ${
      postcardFront
        ? `<div class='logo-wrapper'>
          <img
          style="width:100%;"
            src="${process.env.REACT_APP_S3_BUCKET_BASE_URL}${postcardFront}"
          ></img>
        </div>`
        : ''
    }
    ${
      postcardBack
        ? `<div class='logo-wrapper'>
          <img
            style="width:100%;"
            src="${process.env.REACT_APP_S3_BUCKET_BASE_URL}${postcardBack}"
          ></img>
        </div>`
        : ''
    }
  </div>
  `;
  }

  newWindow.document.write(`<html>
    <head>
      <title>Print Example</title>                           
      <style>   
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');   
      @page{
        size:796.8px 1123.2px !important;
        margin: 46px 46px 46px 46px !important;        
      }

      html{
        letter-spacing: 0.01rem;
      }
      html body p {
        line-height: 1.5rem;
      }
      *{
        word-break: break-word !important;
        box-sizing: border-box;
      }
      p {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      h6, .h6, h5, .h5, h4, .h4, h3, .h3, h2, .h2, h1, .h1{
        font-family: inherit;
        font-weight: 500;
        line-height: 1.2;
        color: #6e6b7b;
        margin-top: 0;
        margin-bottom: 0.5rem;
      }

      .direct-mail-print{
        width:100%;
        height:1018.22px;
        position: relative;
        overflow:hidden;
        font-family: 'Montserrat', sans-serif;
        color:#6e6b7b;
        font-size:14px;
      }
      .direct-mail-print .direct-mail-letter-contant{
        display:flex;
        overflow:hidden;
      }
      </style>
    </head>
    <body>
    ${html}
    </body>
  </html>`);
  newWindow.document.close();
  newWindow.onload = () => {
    newWindow.print();
  };
  newWindow.onafterprint = () => {
    newWindow.close();
  };
};
