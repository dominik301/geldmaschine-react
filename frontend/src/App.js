import './styles/App.css';
import Board from './components/Board3D.jsx';
import MoneyBar from './components/Moneybar.tsx';
import Setup from './components/Setup.tsx';
import Trade from './components/Trade.tsx';
import Credit from './components/Credit.tsx';
import Control from './components/Control.js';
import Deed from './components/Deed.tsx';
import Chart from './components/Chart.js';
import Ereignisfeld from './components/Ereignisfeld.tsx';
import NavigationBar from './components/NavigationBar.tsx';
import Stats from './components/Stats.tsx';
import Bid from './components/Bid.tsx';
import Auction from './components/Auction.tsx';

import { useContext, useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import { SocketContext } from './contexts/SocketContext';
import { GameProvider, useGameContext } from './contexts/GameContext.tsx';

const ENDPOINT = "http://localhost:4000";

const Game = () => {
  const socket = useContext(SocketContext);
  const { gameState, updateGameState } = useGameContext();

  const [ereignisText, setEreignisText] = useState('');
  const [ereignisTitle, setEreignisTitle] = useState('');
  const [offer, setOffer] = useState(null);

  const [heighestbidder, setHeighestbidder] = useState(0);
  const [heighestbid, setHeighestbid] = useState(0);
  const [auctionproperty, setAuctionproperty] = useState(1);

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

    } 
  }


  useEffect(() => {
    // Create event handlers for hovering and draging.

    document.body.addEventListener('mousemove', handleMouseMove);

  }, []);

  var round = 1;

  var xValues = [];
  var geldMengen = [];
  var bankZinsen = []

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

    socket.on('updateChart', updateChart);

    socket.on('showEreignis', function(text, title) {
      updateGameState({showCommunityChest: true});
      setEreignisText(text);
      setEreignisTitle(title);
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

    socket.on("auction", function(_auctionproperty, _player, _square, _highestbidder, _highestbid) {
      setAuctionproperty(_auctionproperty);
      setHeighestbidder(_highestbidder);
      setHeighestbid(_highestbid);
      updateGameState({currentView: 'bid'});
    });

    socket.on("chooseProperty", function(player, square) {
      updateGameState({currentView: 'auction'});  
    });
    
  }, [socket]);

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

    <Chart />

    { gameState.currentView === 'bid' && (
      <Bid highestbidder={heighestbidder} highestbid={heighestbid} auctionproperty={auctionproperty} />
    )}

    { gameState.currentView === 'auction' && (
      <Auction />
    )}

    <div id="refresh">
      Lade die Seite neu, um ein neues Spiel zu beginnen.
    </div>

    { gameState.showPropertyCard > 0 && (
      <Deed squareId={gameState.showPropertyCard} />
    )}
    <Board />
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

    window.addEventListener('beforeunload', function (e) {
      // Cancel the event
      e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
      e.stopImmediatePropagation();
      // Chrome requires returnValue to be set
      e.returnValue = '';
    });
    var newSocket = socket;
    if (!socket) {
      newSocket = socketIOClient(ENDPOINT); // replace ENDPOINT with your server's endpoint
      setSocket(newSocket);
    }
    
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
