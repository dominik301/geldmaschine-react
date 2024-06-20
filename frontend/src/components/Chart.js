import React, {useEffect, useContext, useState, useRef} from 'react';
import Chart from 'chart.js/auto';
import { Line} from 'react-chartjs-2';
import { SocketContext } from '../contexts/SocketContext';
import { useGameContext } from '../contexts/GameContext.tsx';
    
const MyChartComponent = () => {
  const socket = useContext(SocketContext);
  const { gameState } = useGameContext();
  const gameStateRef = useRef(gameState);
  const [chartData, setChartData ] = useState({
    xValues: [],
    geldMengen: [],
    bankZinsen: [],
    round: 1
  });

  function updateChart() {
    setChartData(({xValues, geldMengen, bankZinsen, round}) => { return {
      xValues: [...xValues, round],
      geldMengen: [...geldMengen, gameStateRef.current.bank.geldMenge],
      bankZinsen: [...bankZinsen, gameStateRef.current.bank.zinsenLotto],
      round: round + 1
    }});
  }

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
       
    if (!socket) return;

    socket.on('updateChart', updateChart);
    
  }, [socket]);

  

  const data = {
    labels: chartData.xValues,
    datasets: [{
        backgroundColor: "rgba(255,0,0,1.0)",
        borderColor: "rgba(255,0,0,0.1)",
        data: chartData.geldMengen,
        label: "Geldmenge",
        yAxisID: 'y',
    },
    {
        backgroundColor: "rgba(0,0,255,1.0)",
        borderColor: "rgba(0,0,255,0.1)",
        data: chartData.bankZinsen,
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