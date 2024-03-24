export const handlePrintHelper = ({
  body,
  widthInPx,
  heightInPx,
  marginInPx,
}) => {
  const windowOptions = `width=${window.screen.width},height=${window.screen.height}`;
  const newWindow = window.open('', '_blank', windowOptions);
  newWindow.document.write(`<html>
    <head>
      <title>Print Example</title>
      <style>.sync-font-BridgetteFont4-Regular {
        font-family: "BridgetteFont4 Regular";
      }
      
      .sync-font-BeFontN3-Regular {
        font-family: "BeFontN3 Regular";
      }
      
      .sync-font-segoe-ui {
        font-family: "Segoe UI";
      }
      
      .sync-font-arial {
        font-family: "Arial,Helvetica,sans-serif";
      }
      
      .sync-font-courier-new {
        font-family: "Courier New,Courier,monospace";
      }
      
      .sync-font-georgia {
        font-family: "Georgia,serif";
      }
      
      .sync-font-impact {
        font-family: "Impact", "Haettenschweiler", "Arial Narrow Bold", sans-serif;
      }
      
      .sync-font-tahoma {
        font-family: "Tahoma,Geneva,sans-serif";
      }
      
      .sync-font-times-new-roman {
        font-family: "Times New Roman,Times,serif";
      }
      
      .sync-font-verdana {
        font-family: "Verdana", "Geneva", "Tahoma", sans-serif;
      }
      </style>
      <style>                     
        @page {size:${widthInPx} ${heightInPx} !important;  margin: 0px 0px 0px 0px !important;}
      </style>   
      <style>@font-face {
        font-family: "feather";
        src: url(/static/media/feather.ba142c9a.eot);
        /* IE9*/
        src: url(/static/media/feather.ba142c9a.eot#iefix) format('embedded-opentype'),
          
          url(/static/media/feather.3fa166a5.woff) format('woff'),
          
          url(/static/media/feather.aaacbaee.ttf) format('truetype'),
          
          url(/static/media/feather.65e8cac7.svg#feather) format('svg');
        /* iOS 4.1- */
        /* font-family: 'Be Font N';
        src: local('Be Font N'), url('fonts/BeFontN-Regular.ttf?t=1525787366991') format('truetype'); */
      }
      
      @font-face {
        font-family: 'BridgetteFont4 Regular';
        src: local('BridgetteFont4 Regular'), url(/static/media/BridgetteFont4-Regular.13509f0a.ttf) format('truetype');
      }
      
      @font-face {
        font-family: 'BeFontN3 Regular';
        src: local('BeFontN3 Regular'), url(/static/media/BeFontN3-Regular.b4f0d3f1.ttf) format('truetype');
      }
      
      .feather {
        /* use !important to prevent issues with browser extensions that change fonts */
        font-family: 'feather' !important;
        speak: none;
        font-style: normal;
        font-weight: normal;
        font-feature-settings: normal;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
      
        /* Better Font Rendering =========== */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .icon-alert-octagon:before {
        content: "\e81b";
      }
      
      .icon-alert-circle:before {
        content: "\e81c";
      }
      
      .icon-activity:before {
        content: "\e81d";
      }
      
      .icon-alert-triangle:before {
        content: "\e81e";
      }
      
      .icon-align-center:before {
        content: "\e81f";
      }
      
      .icon-airplay:before {
        content: "\e820";
      }
      
      .icon-align-justify:before {
        content: "\e821";
      }
      
      .icon-align-left:before {
        content: "\e822";
      }
      
      .icon-align-right:before {
        content: "\e823";
      }
      
      .icon-arrow-down-left:before {
        content: "\e824";
      }
      
      .icon-arrow-down-right:before {
        content: "\e825";
      }
      
      .icon-anchor:before {
        content: "\e826";
      }
      
      .icon-aperture:before {
        content: "\e827";
      }
      
      .icon-arrow-left:before {
        content: "\e828";
      }
      
      .icon-arrow-right:before {
        content: "\e829";
      }
      
      .icon-arrow-down:before {
        content: "\e82a";
      }
      
      .icon-arrow-up-left:before {
        content: "\e82b";
      }
      
      .icon-arrow-up-right:before {
        content: "\e82c";
      }
      
      .icon-arrow-up:before {
        content: "\e82d";
      }
      
      .icon-award:before {
        content: "\e82e";
      }
      
      .icon-bar-chart:before {
        content: "\e82f";
      }
      
      .icon-at-sign:before {
        content: "\e830";
      }
      
      .icon-bar-chart-2:before {
        content: "\e831";
      }
      
      .icon-battery-charging:before {
        content: "\e832";
      }
      
      .icon-bell-off:before {
        content: "\e833";
      }
      
      .icon-battery:before {
        content: "\e834";
      }
      
      .icon-bluetooth:before {
        content: "\e835";
      }
      
      .icon-bell:before {
        content: "\e836";
      }
      
      .icon-book:before {
        content: "\e837";
      }
      
      .icon-briefcase:before {
        content: "\e838";
      }
      
      .icon-camera-off:before {
        content: "\e839";
      }
      
      .icon-calendar:before {
        content: "\e83a";
      }
      
      .icon-bookmark:before {
        content: "\e83b";
      }
      
      .icon-box:before {
        content: "\e83c";
      }
      
      .icon-camera:before {
        content: "\e83d";
      }
      
      .icon-check-circle:before {
        content: "\e83e";
      }
      
      .icon-check:before {
        content: "\e83f";
      }
      
      .icon-check-square:before {
        content: "\e840";
      }
      
      .icon-cast:before {
        content: "\e841";
      }
      
      .icon-chevron-down:before {
        content: "\e842";
      }
      
      .icon-chevron-left:before {
        content: "\e843";
      }
      
      .icon-chevron-right:before {
        content: "\e844";
      }
      
      .icon-chevron-up:before {
        content: "\e845";
      }
      
      .icon-chevrons-down:before {
        content: "\e846";
      }
      
      .icon-chevrons-right:before {
        content: "\e847";
      }
      
      .icon-chevrons-up:before {
        content: "\e848";
      }
      
      .icon-chevrons-left:before {
        content: "\e849";
      }
      
      .icon-circle:before {
        content: "\e84a";
      }
      
      .icon-clipboard:before {
        content: "\e84b";
      }
      
      .icon-chrome:before {
        content: "\e84c";
      }
      
      .icon-clock:before {
        content: "\e84d";
      }
      
      .icon-cloud-lightning:before {
        content: "\e84e";
      }
      
      .icon-cloud-drizzle:before {
        content: "\e84f";
      }
      
      .icon-cloud-rain:before {
        content: "\e850";
      }
      
      .icon-cloud-off:before {
        content: "\e851";
      }
      
      .icon-codepen:before {
        content: "\e852";
      }
      
      .icon-cloud-snow:before {
        content: "\e853";
      }
      
      .icon-compass:before {
        content: "\e854";
      }
      
      .icon-copy:before {
        content: "\e855";
      }
      
      .icon-corner-down-right:before {
        content: "\e856";
      }
      
      .icon-corner-down-left:before {
        content: "\e857";
      }
      
      .icon-corner-left-down:before {
        content: "\e858";
      }
      
      .icon-corner-left-up:before {
        content: "\e859";
      }
      
      .icon-corner-up-left:before {
        content: "\e85a";
      }
      
      .icon-corner-up-right:before {
        content: "\e85b";
      }
      
      .icon-corner-right-down:before {
        content: "\e85c";
      }
      
      .icon-corner-right-up:before {
        content: "\e85d";
      }
      
      .icon-cpu:before {
        content: "\e85e";
      }
      
      .icon-credit-card:before {
        content: "\e85f";
      }
      
      .icon-crosshair:before {
        content: "\e860";
      }
      
      .icon-disc:before {
        content: "\e861";
      }
      
      .icon-delete:before {
        content: "\e862";
      }
      
      .icon-download-cloud:before {
        content: "\e863";
      }
      
      .icon-download:before {
        content: "\e864";
      }
      
      .icon-droplet:before {
        content: "\e865";
      }
      
      .icon-edit-2:before {
        content: "\e866";
      }
      
      .icon-edit:before {
        content: "\e867";
      }
      
      .icon-edit-1:before {
        content: "\e868";
      }
      
      .icon-external-link:before {
        content: "\e869";
      }
      
      .icon-eye:before {
        content: "\e86a";
      }
      
      .icon-feather:before {
        content: "\e86b";
      }
      
      .icon-facebook:before {
        content: "\e86c";
      }
      
      .icon-file-minus:before {
        content: "\e86d";
      }
      
      .icon-eye-off:before {
        content: "\e86e";
      }
      
      .icon-fast-forward:before {
        content: "\e86f";
      }
      
      .icon-file-text:before {
        content: "\e870";
      }
      
      .icon-film:before {
        content: "\e871";
      }
      
      .icon-file:before {
        content: "\e872";
      }
      
      .icon-file-plus:before {
        content: "\e873";
      }
      
      .icon-folder:before {
        content: "\e874";
      }
      
      .icon-filter:before {
        content: "\e875";
      }
      
      .icon-flag:before {
        content: "\e876";
      }
      
      .icon-globe:before {
        content: "\e877";
      }
      
      .icon-grid:before {
        content: "\e878";
      }
      
      .icon-heart:before {
        content: "\e879";
      }
      
      .icon-home:before {
        content: "\e87a";
      }
      
      .icon-github:before {
        content: "\e87b";
      }
      
      .icon-image:before {
        content: "\e87c";
      }
      
      .icon-inbox:before {
        content: "\e87d";
      }
      
      .icon-layers:before {
        content: "\e87e";
      }
      
      .icon-info:before {
        content: "\e87f";
      }
      
      .icon-instagram:before {
        content: "\e880";
      }
      
      .icon-layout:before {
        content: "\e881";
      }
      
      .icon-link-2:before {
        content: "\e882";
      }
      
      .icon-life-buoy:before {
        content: "\e883";
      }
      
      .icon-link:before {
        content: "\e884";
      }
      
      .icon-log-in:before {
        content: "\e885";
      }
      
      .icon-list:before {
        content: "\e886";
      }
      
      .icon-lock:before {
        content: "\e887";
      }
      
      .icon-log-out:before {
        content: "\e888";
      }
      
      .icon-loader:before {
        content: "\e889";
      }
      
      .icon-mail:before {
        content: "\e88a";
      }
      
      .icon-maximize-2:before {
        content: "\e88b";
      }
      
      .icon-map:before {
        content: "\e88c";
      }
      
      .icon-map-pin:before {
        content: "\e88e";
      }
      
      .icon-menu:before {
        content: "\e88f";
      }
      
      .icon-message-circle:before {
        content: "\e890";
      }
      
      .icon-message-square:before {
        content: "\e891";
      }
      
      .icon-minimize-2:before {
        content: "\e892";
      }
      
      .icon-mic-off:before {
        content: "\e893";
      }
      
      .icon-minus-circle:before {
        content: "\e894";
      }
      
      .icon-mic:before {
        content: "\e895";
      }
      
      .icon-minus-square:before {
        content: "\e896";
      }
      
      .icon-minus:before {
        content: "\e897";
      }
      
      .icon-moon:before {
        content: "\e898";
      }
      
      .icon-monitor:before {
        content: "\e899";
      }
      
      .icon-more-vertical:before {
        content: "\e89a";
      }
      
      .icon-more-horizontal:before {
        content: "\e89b";
      }
      
      .icon-move:before {
        content: "\e89c";
      }
      
      .icon-music:before {
        content: "\e89d";
      }
      
      .icon-navigation-2:before {
        content: "\e89e";
      }
      
      .icon-navigation:before {
        content: "\e89f";
      }
      
      .icon-octagon:before {
        content: "\e8a0";
      }
      
      .icon-package:before {
        content: "\e8a1";
      }
      
      .icon-pause-circle:before {
        content: "\e8a2";
      }
      
      .icon-pause:before {
        content: "\e8a3";
      }
      
      .icon-percent:before {
        content: "\e8a4";
      }
      
      .icon-phone-call:before {
        content: "\e8a5";
      }
      
      .icon-phone-forwarded:before {
        content: "\e8a6";
      }
      
      .icon-phone-missed:before {
        content: "\e8a7";
      }
      
      .icon-phone-off:before {
        content: "\e8a8";
      }
      
      .icon-phone-incoming:before {
        content: "\e8a9";
      }
      
      .icon-phone:before {
        content: "\e8aa";
      }
      
      .icon-phone-outgoing:before {
        content: "\e8ab";
      }
      
      .icon-pie-chart:before {
        content: "\e8ac";
      }
      
      .icon-play-circle:before {
        content: "\e8ad";
      }
      
      .icon-play:before {
        content: "\e8ae";
      }
      
      .icon-plus-square:before {
        content: "\e8af";
      }
      
      .icon-plus-circle:before {
        content: "\e8b0";
      }
      
      .icon-plus:before {
        content: "\e8b1";
      }
      
      .icon-pocket:before {
        content: "\e8b2";
      }
      
      .icon-printer:before {
        content: "\e8b3";
      }
      
      .icon-power:before {
        content: "\e8b4";
      }
      
      .icon-radio:before {
        content: "\e8b5";
      }
      
      .icon-repeat:before {
        content: "\e8b6";
      }
      
      .icon-refresh-ccw:before {
        content: "\e8b7";
      }
      
      .icon-rewind:before {
        content: "\e8b8";
      }
      
      .icon-rotate-ccw:before {
        content: "\e8b9";
      }
      
      .icon-refresh-cw:before {
        content: "\e8ba";
      }
      
      .icon-rotate-cw:before {
        content: "\e8bb";
      }
      
      .icon-save:before {
        content: "\e8bc";
      }
      
      .icon-search:before {
        content: "\e8bd";
      }
      
      .icon-server:before {
        content: "\e8be";
      }
      
      .icon-scissors:before {
        content: "\e8bf";
      }
      
      .icon-share-2:before {
        content: "\e8c0";
      }
      
      .icon-share:before {
        content: "\e8c1";
      }
      
      .icon-shield:before {
        content: "\e8c2";
      }
      
      .icon-settings:before {
        content: "\e8c3";
      }
      
      .icon-skip-back:before {
        content: "\e8c4";
      }
      
      .icon-shuffle:before {
        content: "\e8c5";
      }
      
      .icon-sidebar:before {
        content: "\e8c6";
      }
      
      .icon-skip-forward:before {
        content: "\e8c7";
      }
      
      .icon-slack:before {
        content: "\e8c8";
      }
      
      .icon-slash:before {
        content: "\e8c9";
      }
      
      .icon-smartphone:before {
        content: "\e8ca";
      }
      
      .icon-square:before {
        content: "\e8cb";
      }
      
      .icon-speaker:before {
        content: "\e8cc";
      }
      
      .icon-star:before {
        content: "\e8cd";
      }
      
      .icon-stop-circle:before {
        content: "\e8ce";
      }
      
      .icon-sun:before {
        content: "\e8cf";
      }
      
      .icon-sunrise:before {
        content: "\e8d0";
      }
      
      .icon-tablet:before {
        content: "\e8d1";
      }
      
      .icon-tag:before {
        content: "\e8d2";
      }
      
      .icon-sunset:before {
        content: "\e8d3";
      }
      
      .icon-target:before {
        content: "\e8d4";
      }
      
      .icon-thermometer:before {
        content: "\e8d5";
      }
      
      .icon-thumbs-up:before {
        content: "\e8d6";
      }
      
      .icon-thumbs-down:before {
        content: "\e8d7";
      }
      
      .icon-toggle-left:before {
        content: "\e8d8";
      }
      
      .icon-toggle-right:before {
        content: "\e8d9";
      }
      
      .icon-trash-2:before {
        content: "\e8da";
      }
      
      .icon-trash:before {
        content: "\e8db";
      }
      
      .icon-trending-up:before {
        content: "\e8dc";
      }
      
      .icon-trending-down:before {
        content: "\e8dd";
      }
      
      .icon-triangle:before {
        content: "\e8de";
      }
      
      .icon-type:before {
        content: "\e8df";
      }
      
      .icon-twitter:before {
        content: "\e8e0";
      }
      
      .icon-upload:before {
        content: "\e8e1";
      }
      
      .icon-umbrella:before {
        content: "\e8e2";
      }
      
      .icon-upload-cloud:before {
        content: "\e8e3";
      }
      
      .icon-unlock:before {
        content: "\e8e4";
      }
      
      .icon-user-check:before {
        content: "\e8e5";
      }
      
      .icon-user-minus:before {
        content: "\e8e6";
      }
      
      .icon-user-plus:before {
        content: "\e8e7";
      }
      
      .icon-user-x:before {
        content: "\e8e8";
      }
      
      .icon-user:before {
        content: "\e8e9";
      }
      
      .icon-users:before {
        content: "\e8ea";
      }
      
      .icon-video-off:before {
        content: "\e8eb";
      }
      
      .icon-video:before {
        content: "\e8ec";
      }
      
      .icon-voicemail:before {
        content: "\e8ed";
      }
      
      .icon-volume-x:before {
        content: "\e8ee";
      }
      
      .icon-volume-2:before {
        content: "\e8ef";
      }
      
      .icon-volume-1:before {
        content: "\e8f0";
      }
      
      .icon-volume:before {
        content: "\e8f1";
      }
      
      .icon-watch:before {
        content: "\e8f2";
      }
      
      .icon-wifi:before {
        content: "\e8f3";
      }
      
      .icon-x-square:before {
        content: "\e8f4";
      }
      
      .icon-wind:before {
        content: "\e8f5";
      }
      
      .icon-x:before {
        content: "\e8f6";
      }
      
      .icon-x-circle:before {
        content: "\e8f7";
      }
      
      .icon-zap:before {
        content: "\e8f8";
      }
      
      .icon-zoom-in:before {
        content: "\e8f9";
      }
      
      .icon-zoom-out:before {
        content: "\e8fa";
      }
      
      .icon-command:before {
        content: "\e8fb";
      }
      
      .icon-cloud:before {
        content: "\e8fc";
      }
      
      .icon-hash:before {
        content: "\e8fd";
      }
      
      .icon-headphones:before {
        content: "\e8fe";
      }
      
      .icon-underline:before {
        content: "\e8ff";
      }
      
      .icon-italic:before {
        content: "\e900";
      }
      
      .icon-bold:before {
        content: "\e901";
      }
      
      .icon-crop:before {
        content: "\e902";
      }
      
      .icon-help-circle:before {
        content: "\e903";
      }
      
      .icon-paperclip:before {
        content: "\e904";
      }
      
      .icon-shopping-cart:before {
        content: "\e905";
      }
      
      .icon-tv:before {
        content: "\e906";
      }
      
      .icon-wifi-off:before {
        content: "\e907";
      }
      
      .icon-minimize:before {
        content: "\e88d";
      }
      
      .icon-maximize:before {
        content: "\e908";
      }
      
      .icon-gitlab:before {
        content: "\e909";
      }
      
      .icon-sliders:before {
        content: "\e90a";
      }
      
      .icon-star-on:before {
        content: "\e90b";
      }
      
      .icon-heart-on:before {
        content: "\e90c";
      }
      
      .icon-archive:before {
        content: "\e90d";
      }
      
      .icon-arrow-down-circle:before {
        content: "\e90e";
      }
      
      .icon-arrow-up-circle:before {
        content: "\e90f";
      }
      
      .icon-arrow-left-circle:before {
        content: "\e910";
      }
      
      .icon-arrow-right-circle:before {
        content: "\e911";
      }
      
      .icon-bar-chart-line-:before {
        content: "\e912";
      }
      
      .icon-bar-chart-line:before {
        content: "\e913";
      }
      
      .icon-book-open:before {
        content: "\e914";
      }
      
      .icon-code:before {
        content: "\e915";
      }
      
      .icon-database:before {
        content: "\e916";
      }
      
      .icon-dollar-sign:before {
        content: "\e917";
      }
      
      .icon-folder-plus:before {
        content: "\e918";
      }
      
      .icon-gift:before {
        content: "\e919";
      }
      
      .icon-folder-minus:before {
        content: "\e91a";
      }
      
      .icon-git-commit:before {
        content: "\e91b";
      }
      
      .icon-git-branch:before {
        content: "\e91c";
      }
      
      .icon-git-pull-request:before {
        content: "\e91d";
      }
      
      .icon-git-merge:before {
        content: "\e91e";
      }
      
      .icon-linkedin:before {
        content: "\e91f";
      }
      
      .icon-hard-drive:before {
        content: "\e920";
      }
      
      .icon-more-vertical-:before {
        content: "\e921";
      }
      
      .icon-more-horizontal-:before {
        content: "\e922";
      }
      
      .icon-rss:before {
        content: "\e923";
      }
      
      .icon-send:before {
        content: "\e924";
      }
      
      .icon-shield-off:before {
        content: "\e925";
      }
      
      .icon-shopping-bag:before {
        content: "\e926";
      }
      
      .icon-terminal:before {
        content: "\e927";
      }
      
      .icon-truck:before {
        content: "\e928";
      }
      
      .icon-zap-off:before {
        content: "\e929";
      }
      
      .icon-youtube:before {
        content: "\e92a";
      }
      </style>                
    </head>
    <body>
    <div style="padding:${marginInPx}px;">
      ${body}
    </div>
    </body>
  </html>`);
  newWindow.document.close();
  newWindow.onload = () => {
    console.log(newWindow.print);
    newWindow.print();
  };
  newWindow.onafterprint = () => {
    newWindow.close();
  };
};
