import React from 'react';
import {Line} from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

/*
const data = {
    
    options:{
      responsive: true,
      interaction: {
          mode: 'index',
          intersect: false,
      },
      plugins: {},
      stacked: false,
      scales: {
          y: {
              type: 'linear',
              display: true,
              position: 'left',
          },
          y1: {
              type: 'linear',
              display: true,
              position: 'right',
  
              grid: {
                  drawOnChartArea: false,
              }
          },
      },
    }
  });
*/

const Chart = ({xValues, geldMengen, bankZinsen}) => {

  const data = {
    labels: xValues,
    datasets: [{
        backgroundColor: "rgba(255,0,0,1.0)",
        borderColor: "rgba(255,0,0,0.1)",
        data: geldMengen,
        label: "Geldmenge",
        yAxisID: 'y',
    },
    {
        backgroundColor: "rgba(0,0,255,1.0)",
        borderColor: "rgba(0,0,255,0.1)",
        data: bankZinsen,
        label: "Zinsen",
        yAxisID: 'y1',
    }]
  };

    return (
    <div id="graphwrap">
      <div id="mgraph">
        <div style={{position: "relative"}}>
          <span id="graphclose" title="Schließen"><FontAwesomeIcon icon={faCircleXmark} /></span>
          <div id="graphtext"><span>Spielverlauf</span></div>
          <div id="graphdrag"></div>
          <div id="graph">
            <Line data={data} />
            {//<canvas id="myChart" width="183px" height="150px"></canvas>
            }
          </div>
        </div>
      </div>
    </div>
    );
};

export default Chart;