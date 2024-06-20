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

const ENDPOINT = "ws://192.168.188.26:4000";

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

    socket.on('showEreignis', function(text, title) {
      setEreignisText(text);
      setEreignisTitle(title);
      document.getElementById("ereignisfeld").showModal();
    });

    socket.on('eliminatePlayer', function(HTML, action) {
      alert(HTML);
      socket.emit('eliminate');
    });

    socket.on('receiveOffer', function(tradeObj) {
        let initiator = tradeObj.initiator;
        let recipient = tradeObj.recipient;

        setOffer(tradeObj);
        const trade = document.getElementById("trade");
        trade.showModal();

        alert(recipient.name + " hat dir, " + initiator.name + ", einen Tausch angeboten. Du kannst das Angebot annehmen, ablehnen oder verändern.");
              
    });

    socket.on("auction", function(_auctionproperty, _player, _square, _highestbidder, _highestbid) {
      setAuctionproperty(_auctionproperty);
      setHeighestbidder(_highestbidder);
      setHeighestbid(_highestbid);
      const auction = document.getElementById("bid");
      auction.showModal();
    });

    socket.on("chooseProperty", function(player, square) {
      const auction = document.getElementById("auction");
      auction.close();
    });
    
  }, [socket]);

  if (gameState.currentView === 'setup') {
    return <Setup />;
  }
  return (
    <div>

    <Ereignisfeld text={ereignisText} title={ereignisTitle}/>

    <Stats />

    <Chart />

    <Bid highestbidder={heighestbidder} highestbid={heighestbid} auctionproperty={auctionproperty} />

    <Auction />

    <div id="refresh">
      Lade die Seite neu, um ein neues Spiel zu beginnen.
    </div>

    { gameState.showPropertyCard > 0 && (
      <Deed squareId={gameState.showPropertyCard} />
    )}
    <Board />
    <MoneyBar />

    <Credit />

    <NavigationBar />
    <Control />

    <Trade offer={offer} />

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
