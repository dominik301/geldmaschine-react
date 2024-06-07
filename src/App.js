import './App.css';
import Board, {EnlargeWrap} from './Board.js';
import MoneyBar from './Moneybar.js';
import Setup from './Setup.js';
import Trade from './Trade.js';
import Credit from './Credit.js';
import Control from './Control.js';
import Deed from './Deed.js';
import Chart from './Chart.js';
import Ereignisfeld from './Ereignisfeld.js';
import NavigationBar from './NavigationBar.js';
import Stats from './Stats.js';
import { useContext, useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import { SocketContext } from './SocketContext';
import { GameProvider, useGameContext } from './GameContext';

const ENDPOINT = "http://localhost:3000";

const Game = () => {
  const socket = useContext(SocketContext);
  const { gameState, updateGameState } = useGameContext();

  const [ereignisText, setEreignisText] = useState('');
  const [ereignisTitle, setEreignisTitle] = useState('');
  const [offer, setOffer] = useState(null);

  var round = 1;

  var xValues = [];
  var geldMengen = [];
  var bankZinsen = []

  const setName = () => {
    console.log("Called setName")
    const name = prompt("Gib deinen Namen ein", "SpielerIn");
    if (socket) {
      socket.emit('setName', name);
    }
  }

  const updateChart = () => {
    xValues.push(round);
    geldMengen.push(gameState.bank.geldMenge)
    bankZinsen.push(gameState.bank.zinsenLotto)
    round++;
  }

  useEffect(() => {
    if (gameState.currentView !== 'trade') {
      setOffer(null);
    }
  }
  , [gameState.currentView]);

  useEffect(() => {

    console.log("Called useEffect")

    setName();
       
    if (!socket) return;

    socket.on('setPlayerId',function(id){
      updateGameState({playerId: id});
    });
    
    socket.on('playerno',function(pcount){
      let players = gameState.players;
      if (players.length < pcount) {
        for (var i = players.length; i < pcount; i++) {
          players.push({ name: 'Player ' + (i + 1), money: 0, credit: 0, dispocredit: 0, availablecredit: 0, anleihen: 0, derivate: 0 });
        }
      }
      else if (players.length > pcount) {
        players.splice(pcount);
      }
      updateGameState({players: players});
    });

    socket.on('playerNames', function(names) {
      let players = gameState.players;
      for (var i=0; i<players.length; i++) {
        players[i].name = names[i];
      }
      updateGameState({players: players});
    });

    socket.on('updateChart', updateChart);

    socket.on('showEreignis', function(text, title) {
      //TODO
    });

    socket.on('eliminatePlayer', function(HTML, action) {
      alert(HTML);
      socket.emit('eliminate');
    });

    socket.on('receiveOffer', function(tradeObj) {
        let initiator = tradeObj.initiator;
        let recipient = tradeObj.recipient;

        updateGameState({currentView: 'trade'});
        setOffer(tradeObj);

        alert(recipient.name + " hat dir, " + initiator.name + ", einen Tausch angeboten. Du kannst das Angebot annehmen, ablehnen oder verändern.");
              
    });
    
  }, []);

  if (gameState.currentView === 'setup') {
    return <Setup />;
  }
  return (
    <div>

    { gameState.showCommunityChest && (
    <Ereignisfeld text={ereignisText} title={ereignisTitle}/>
    )}

    { gameState.showStats && (
      <Stats />
    )}

    { gameState.showChart && (
      <Chart />)
    }

    <div id="refresh">
      Lade die Seite neu, um ein neues Spiel zu beginnen.
    </div>

    { gameState.showPropertyCard > 0 && (
      <Deed squareId={gameState.showPropertyCard} />
    )}
    <Board />
    <EnlargeWrap />
    <MoneyBar />

    <NavigationBar />
    <Control />

    { gameState.currentView === 'credit' && (
      <Credit />
    )}

    { gameState.currentView === 'trade' && (
      <Trade offer={offer} />
    )}

  </div>
  );
};

function App() {
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    // Create event handlers for hovering and draging.

    var drag, dragX, dragY, dragObj, dragTop, dragLeft;

    const handleMouseMove = (e) => {
      var object;

      if (e.target) {
        object = e.target;
      } else if (window.event && window.event.srcElement) {
        object = window.event.srcElement;
      }


      if (object.classList.contains("propertycellcolor") || object.classList.contains("statscellcolor")) {
        /*
        if (e.clientY + 20 > window.innerHeight - 404) {
          document.getElementById("deed").style.top = (window.innerHeight - 404) + "px";
        } else {
          document.getElementById("deed").style.top = (e.clientY + 20) + "px";
        }
        document.getElementById("deed").style.left = (e.clientX + 10) + "px";
        */ //TODO

      } else if (drag) {
        if (e) {
          dragObj.style.left = (dragLeft + e.clientX - dragX) + "px";
          dragObj.style.top = (dragTop + e.clientY - dragY) + "px";

        } else if (window.event) {
          dragObj.style.left = (dragLeft + window.event.clientX - dragX) + "px";
          dragObj.style.top = (dragTop + window.event.clientY - dragY) + "px";
        }
      }
    };

    document.body.addEventListener('mousemove', handleMouseMove);

    const handleMouseUp = () => {
      drag = false;
    };

    document.body.addEventListener('mouseup', handleMouseUp);

    window.addEventListener('beforeunload', function (e) {
      // Cancel the event
      e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
      e.stopImmediatePropagation();
      // Chrome requires returnValue to be set
      e.returnValue = '';
    });

    const newSocket = socketIOClient(ENDPOINT); // replace ENDPOINT with your server's endpoint
    setSocket(newSocket);

    /*
    document.getElementById("statsdrag").onmousedown = function(e) {
        dragObj = document.getElementById("stats");
        dragObj.style.position = "relative";

        dragTop = parseInt(dragObj.style.top, 10) || 0;
        dragLeft = parseInt(dragObj.style.left, 10) || 0;

        if (window.event) {
            dragX = window.event.clientX;
            dragY = window.event.clientY;
        } else if (e) {
            dragX = e.clientX;
            dragY = e.clientY;
        }

        drag = true;
    };

    document.getElementById("graphdrag").onmousedown = function(e) {
        dragObj = document.getElementById("mgraph");
        dragObj.style.position = "relative";

        dragTop = parseInt(dragObj.style.top, 10) || 0;
        dragLeft = parseInt(dragObj.style.left, 10) || 0;

        if (window.event) {
            dragX = window.event.clientX;
            dragY = window.event.clientY;
        } else if (e) {
            dragX = e.clientX;
            dragY = e.clientY;
        }

        drag = true;
    };

    document.getElementById("popupdrag").onmousedown = function(e) {
        dragObj = document.getElementById("popup");
        dragObj.style.position = "relative";

        dragTop = parseInt(dragObj.style.top, 10) || 0;
        dragLeft = parseInt(dragObj.style.left, 10) || 0;

        if (window.event) {
            dragX = window.event.clientX;
            dragY = window.event.clientY;
        } else if (e) {
            dragX = e.clientX;
            dragY = e.clientY;
        }

        drag = true;
    };*/ //TODO
  
  
      /*$("#graphclose, #statsclose, #statsbackground").on("click", function() {
          $("#statswrap, #graphwrap").hide();
          $("#statsbackground").fadeOut(400);
  
          $('#icon-bar a.active').removeClass('active');
          $("#logicon").addClass('active');
      });*/ //TODO
    
    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <GameProvider >
        <Game />
      </GameProvider>
    </SocketContext.Provider>
  );
}

export default App;

/*

socket.on('updatePlayer', function(mplayer, mbank) {
    player = mplayer;
    meineBank = mbank;
});


  $(document).ready(function () {
    $('#icon-bar a').on('click', function(e) {

        $('#icon-bar a.active').removeClass('active');

        $(this).addClass('active');
        e.preventDefault();
    });
});


$('[title!=""]').qtip({
    suppress: 'false',
    show: {
        event: 'click'
    }
});


  
*/