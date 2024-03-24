import {
  AlertTriangle,
  ArrowUp,
  ArrowUpRight,
  Check,
  CheckCircle,
  MinusCircle,
  TrendingDown,
  TrendingUp,
} from 'react-feather';

const useStatistics = () => {
  const statisticsRawData = {
    blocks: {
      subTitle: 'blocks',
      icons: <AlertTriangle size={24} />,
      color: 'danger',
      pieChartColor: '#000e4b',
    },
    bounce_drops: {
      subTitle: 'Boumce drops',
      icons: <TrendingDown size={24} />,
      color: 'danger',
      pieChartColor: '#0b3c7f',
    },
    bounces: {
      subTitle: 'Bounces',
      icons: <TrendingUp size={24} />,
      color: 'danger',
      pieChartColor: '#cc1177',
    },
    clicks: {
      subTitle: 'Clicks',
      icons: <TrendingUp size={24} />,
      color: 'info',
      pieChartColor: '#776fdb',
    },
    deferred: {
      subTitle: 'Deferred',
      icons: <ArrowUpRight size={24} />,
      color: 'primary',
      pieChartColor: '#ce7e00',
    },
    delivered: {
      subTitle: 'Delivered',
      icons: <Check size={24} />,
      color: 'success',
      pieChartColor: '#664c77',
    },
    invalid_emails: {
      subTitle: 'Invalid Emails',
      icons: <AlertTriangle size={24} />,
      color: 'danger',
      pieChartColor: '#6677b9',
    },
    opens: {
      subTitle: 'opens',
      icons: <TrendingUp size={24} />,
      color: 'warning',
      pieChartColor: '#4e767e',
    },
    processed: {
      subTitle: 'Processed',
      icons: <CheckCircle size={24} />,
      color: 'primary',
      pieChartColor: '#caedff',
    },
    requests: {
      subTitle: 'Requests',
      icons: <TrendingUp size={24} />,
      color: 'warning',
      pieChartColor: '#ffbd1f',
    },
    spam_report_drops: {
      subTitle: 'Spam Reports Drops',
      icons: <AlertTriangle size={24} />,
      color: 'danger',
      pieChartColor: '#871b5a',
    },
    spam_reports: {
      subTitle: 'Spam Reports',
      icons: <AlertTriangle size={24} />,
      color: 'danger',
      pieChartColor: '#ff0000',
    },
    unique_clicks: {
      subTitle: 'Unique Clicks',
      icons: <ArrowUp size={24} />,
      color: 'primary',
      pieChartColor: '#87006e',
    },
    unique_opens: {
      subTitle: 'Unique Open',
      icons: <TrendingUp size={24} />,
      color: 'light-primary',
      pieChartColor: '#00ff9b',
    },
    unsubscribe_drops: {
      subTitle: 'Unsubscribe Drops',
      icons: <MinusCircle size={24} />,
      color: 'danger',
      pieChartColor: '#871b5a',
    },
    unsubscribes: {
      subTitle: 'Unsubscribes',
      icons: <MinusCircle size={24} />,
      color: 'danger',
      pieChartColor: '#836AF9',
    },
  };

  const pieChartOption = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    // layout: {
    //   padding: {
    //     top: -5,
    //     bottom: -45,
    //   },
    // },
    scales: {
      r: {
        grid: { display: false },
        ticks: { display: false },
      },

      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6e6b7b',
        },
      },
    },
  };
  // const pieChartOption = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   animation: { duration: 500 },
  //   layout: {
  //     padding: {
  //       top: -5,
  //       bottom: -45,
  //     },
  //   },
  //   scales: {
  //     r: {
  //       grid: { display: false },
  //       ticks: { display: false },
  //     },
  //   },
  //   plugins: {
  //     legend: {
  //       position: 'right',
  //       labels: {
  //         padding: 25,
  //         boxWidth: 9,
  //         color: '#6e6b7b',
  //         usePointStyle: true,
  //       },
  //     },
  //   },
  // };

  const barChartOption = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    elements: {
      bar: {
        borderRadius: {
          topRight: 15,
          bottomRight: 15,
        },
      },
    },
    layout: {
      padding: { top: -4 },
    },
    scales: {
      x: {
        min: 0,
        grid: {
          drawTicks: false,
          color: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'transparent',
        },
        ticks: { color: '#6e6b7b' },
      },
      y: {
        grid: {
          display: false,
          borderColor: 'rgba(200, 200, 200, 0.2)',
        },
        ticks: { color: '#6e6b7b' },
      },
    },
    plugins: {
      legend: {
        align: 'end',
        position: 'top',
        labels: { color: '#6e6b7b' },
      },
    },
  };

  return { statisticsRawData, pieChartOption, barChartOption };
};
export default useStatistics;
