import {Col, Row } from 'reactstrap';
import { Bar, PolarArea } from 'react-chartjs-2';
import useStatistics from './hooks/useStatistics';

const StatisticsDashboard = ({ sendGridStastics }) => {
  const { pieChartOption, barChartOption } = useStatistics();
  const pieChartData = {
    labels: sendGridStastics.map((m) => m.subTitle),
    datasets: [
      {
        borderWidth: 0,
        label: 'Send Grid',
        data: sendGridStastics.map((m) => m.title),
        backgroundColor: sendGridStastics.map((m) => m.pieChartColor),
      },
    ],
  };

  const barChartData = {
    labels: sendGridStastics.map((m) => m.subTitle),
    datasets: [
      {
        borderWidth: 0,
        label: 'Send Grid',
        data: sendGridStastics.map((m) => m.title),
        backgroundColor: sendGridStastics.map((m) => m.pieChartColor),
      },
    ],
  };

  return (
    <>
      <div className='card-wrapper'>
        {sendGridStastics.length > 0 &&
          sendGridStastics.map((item, index) => {
            return (
              <div className='card-box' key={index}>
                <StatisticsData
                  key={index}
                  icon={item?.icons}
                  color={item?.color}
                  stats={item.title}
                  statTitle={item.subTitle}
                />
              </div>
            );
          })}
      </div>
      <Row className='chart-row mt-0'>
        <Col className='chart-col' md='6' sm='12' lg='6'>
          <div className='inner-wrapper'>
            <h3 className='chart-title'>Pie Chart</h3>
            <div className='cart-wrapper'>
              <PolarArea
                data={pieChartData}
                options={pieChartOption}
                height={350}
              />
            </div>
          </div>
        </Col>
        <Col className='chart-col' md='6' sm='12' lg='6'>
          <div className='inner-wrapper'>
            <h3 className='chart-title'>Line Chart</h3>
            <div className='cart-wrapper'>
              <Bar data={barChartData} options={barChartOption} height={450} />
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

const StatisticsData = ({ icon, color, stats, statTitle, className }) => {
  return (
    <>
      <div className={`inner-wrapper ${className}`}>
        <div
          className={`avatar ${
            color ? `bg-light-${color}` : 'bg-light-primary'
          }`}
        >
          {icon}
        </div>
        <div className='details-wrapper'>
          <h4 className='title'>{statTitle}</h4>
          <div className='value'>{stats}</div>
        </div>
      </div>
    </>
  );
};

export default StatisticsDashboard;
