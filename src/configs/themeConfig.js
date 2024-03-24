// You can customize the template with the help of this file

//Template config options
const themeConfig = {
  app: {
    appName: process.env.REACT_APP_COMPANY_NAME,
    connectifyLogo: require(`@src/assets/images/icons/logo.png`).default,
    appLogoImage: require(`@src/assets/images/icons/logo.png`).default,
    smallLogo: require('@src/assets/images/icons/logo.png').default,
  },
  layout: {
    isRTL: false,
    skin: 'light', // light, dark, bordered, semi-dark
    routerTransition: 'fadeIn', // fadeIn, fadeInLeft, zoomIn, none or check this for more transition https://animate.style/
    type: 'vertical', // vertical, horizontal
    contentWidth: 'boxed', // full, boxed
    menu: {
      isHidden: false,
      isCollapsed: true,
    },
    navbar: {
      // ? For horizontal menu, navbar type will work for navMenu type
      type: 'floating', // static , sticky , floating, hidden
      backgroundColor: 'white', // BS color options [primary, success, etc]
    },
    footer: {
      type: 'static', // static, sticky, hidden
    },
    customizer: true,
    scrollTop: true, // Enable scroll to top button
    mobileTaskTimerOpen: false,
  },
};

export default themeConfig;
