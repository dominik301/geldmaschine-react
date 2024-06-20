import React from 'react';
import Chart from 'chart.js/auto';
import { Line} from 'react-chartjs-2';
    
const MyChartComponent = ({xValues, geldMengen, bankZinsen}) => {

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

  const options = {
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
  };

    return (
    <dialog id="graphwrap">
      <div className="popup">
        <h2 className="popuptext">Spielverlauf</h2>
        <div style={{width: "60%", position: "relative", left: "20%"}} >
          <Line data={data} options={options}/>
        </div>
        <form method="dialog">
          <button onClick={() => document.getElementById("graphwrap").close()} autoFocus>Schließen</button>
        </form>
      </div>
    </dialog>
    );
};

export default MyChartComponent;