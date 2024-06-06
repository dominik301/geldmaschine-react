import './App.css';
import Board from './Board.js';
import MoneyBar from './Moneybar.js';
import Setup from './Setup.js';
//import Trade from './Trade.js';
//import Credit from './Credit.js';
import Control from './Control.js';
import Deed from './Deed.js';
import Chart from './Chart.js';
import Ereignisfeld from './Ereignisfeld.js';
import NavigationBar from './NavigationBar.js';
import Stats from './Stats.js';
import { useContext, useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import { SocketContext } from './SocketContext';

const ENDPOINT = "http://localhost:3000";

const Game = () => {
  const socket = useContext(SocketContext);
  const players = [
    { name: 'Player 1', color: 'yellow', position: 0, money: 0, sumKredit: 0, verfuegbareHypothek: 0, anleihen: 0, derivate: 0 },
    { name: 'Player 2', color: 'red', position: 0, money: 0, sumKredit: 0, verfuegbareHypothek: 0, anleihen: 0, derivate: 0 },
    // Add more players as needed
  ];
  const squares = [
    {color: "yellow", name: "Start/Bank", pricetext: "Wer auf oder über dieses Feld zieht, zahlt Zinsen für alle offenen Kredite.", groupNumber: 0, owner: 0, house: 0},
    {color: "rgb(255, 252, 92)", name: "Kiesweg 1", pricetext: "Miete:12.000", groupNumber: 1, owner: 0, house: 0},
    {color: "rgb(255, 252, 92)", name: "Kiesweg 2", pricetext: "Miete:14.000", groupNumber: 1, owner: 0, house: 0},
    {color: "transparent", name: "Ereignisfeld", pricetext: "", groupNumber: 0, owner: 0, house: 0},
    {color: "rgb(119, 248, 140)", name: "Alleenring 1", pricetext: "Miete:22.000", groupNumber: 1, owner: 0, house: 0},
    {color: "rgb(119, 248, 140)", name: "Alleenring 2", pricetext: "Miete:24.000", groupNumber: 1, owner: 0, house: 0},
    {color: "yellow", name: "Staat/Finanzamt", pricetext: "Wer auf oder über dieses Feld zieht, zahlt 10% Steuern aufs aktuelle Guthaben. Zieht Gelb auf oder über dieses Feld zahlt der Staat Zinsen auf alle Anleihen.", groupNumber: 0, owner: 0, house: 0},
    {color: "red", name: "Ziegelstraße 1", pricetext: "Miete:16.000", groupNumber: 1, owner: 0, house: 0},
    {color: "red", name: "Ziegelstraße 2", pricetext: "Miete:16.000", groupNumber: 1, owner: 0, house: 0},
    {color: "transparent", name: "Ereignisfeld", pricetext: "", groupNumber: 0, owner: 0, house: 0},
    {color: "rgb(92, 195, 255)", name: "Nasse Gasse 1", pricetext: "Miete:18.000", groupNumber: 1, owner: 0, house: 0},
    {color: "rgb(92, 195, 255)", name: "Nasse Gasse 2", pricetext: "Miete:18.000", groupNumber: 1, owner: 0, house: 0},
  ]
  const [playerId, setPlayerId] = useState(1);

  const bank = { geldMenge: 0, zinsenLotto: 0, anleihen: 0, derivate: 0 };
  const staat = { staatsSchuld: 0, steuer: 0 };
  
  const [currentView, setCurrentView] = useState('board');
  const [tab, setTab] = useState(0);

  const [ereignisText, setEreignisText] = useState('');
  const [ereignisTitle, setEreignisTitle] = useState('');

  var square = {};

  const [die0, setDie0] = useState(0);

  var turn = 1;

  var round = 1;

  var xValues = [];
  var geldMengen = [];
  var bankZinsen = []

  const changeView = (view) => {
    setCurrentView(view);
  }

  const setName = () => {
    const name = prompt("Gib deinen Namen ein", "SpielerIn");
    if (socket) {
      socket.emit('setName', name);
    }
    if (confirm("Dominik, möchtest du wirklich die Hypothek für Schlossallee für $2000 zurückzahlen?"))
      {
        console.log("confirmed");
      }
  }

  const displayStats = (HTML) => {
    changeView('stats');
    document.getElementById("statstext").innerHTML = HTML;
  }

  const updateChart = () => {
    xValues.push(round);
    geldMengen.push(bank.geldMenge)
    bankZinsen.push(bank.zinsenLotto)
    round++;
  }

  const showdeed = (i) => {
    //TODO
  }

  const hidedeed = () => {
    //TODO
  }

  useEffect(() => {

    setName();
       
    if (!socket) return;

    socket.on('setPlayerId',function(id){
      setPlayerId(id);
    });
    
    socket.on('playerno',function(pcount){
      if (players.length < pcount) {
        for (var i = players.length; i < pcount; i++) {
          players.push({ name: 'Player ' + (i + 1), money: 0, credit: 0, dispocredit: 0, availablecredit: 0, anleihen: 0, derivate: 0 });
        }
      }
      else if (players.length > pcount) {
        players.splice(pcount);
      }
    });

    socket.on('playerNames', function(names) {
      for (var i=0; i<players.length; i++) {
        players[i].name = names[i];
      }
    });

    socket.on('showdeed', function(sq) {
      square = sq;
      changeView('deed');
    });

    socket.on('updateDice', function(die){
      var snd = new Audio("short-dice-roll.wav"); // buffers automatically when created
      snd.play();
    
      setTimeout(() => { setDie0(die);}, 500);
    });

    socket.on('showstats', function(HTML) {
        displayStats(HTML);
    });

    socket.on('updateChart', updateChart);

    socket.on('popup', function(HTML, option, mortgage=false) {
      if (!option && typeof action === "string") {
          option = action;
      }

      option = option ? option.toLowerCase() : "";

      if (typeof action !== "function") {
          action = null;
      }

      if (option === "ja/nein") {
        if (confirm(HTML)) {
          action();
        }
    // Ok
    } else if (option !== "blank") {
        alert(HTML);
        action();
    }
    })

    socket.on('showEreignis', function(text, title) {
      //TODO
    });

    socket.on('eliminatePlayer', function(HTML, action) {
      alert(HTML);
      socket.emit('eliminate');
    });
    
  }, []);

  if (currentView === 'setup') {
    return <Setup players={players} playerId={playerId} />;
  }
  return (
    <div>

    {currentView === 'stats' && (
      <Stats players={players} squares={squares} showdeed={showdeed} hidedeed={hidedeed} />
    )}

    { currentView === 'chart' && (
      <Chart />)
    }

    <div id="refresh">
      Lade die Seite neu, um ein neues Spiel zu beginnen.
    </div>

    {
      /*
      <Deed square={square}/>
      
      { false && currentView === 'trade' && (
      <Trade />
      //TODO
      )}

      { currentView === 'credit' && (
      <Credit changeView={changeView}/>
      )}
      */
    }
    <Ereignisfeld text={ereignisText} title={ereignisTitle}/>

    <NavigationBar setTab={setTab} changeView={changeView} playerId={playerId}/>
    <Board squares={squares} player={players}/>
    <MoneyBar players={players} bank={bank} staat={staat}/>
    <Control player={players[playerId]} die0={die0} square={squares} turn={turn} 
    playerId={playerId} changeView={changeView} tab={tab} showdeed={showdeed} hidedeed={hidedeed}/>

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

    newSocket.on('setHTML', function(element, text) {
      document.getElementById(element).innerHTML = text;
    });

    newSocket.on('focusbutton', function(button) {
      document.getElementById(button).focus();
  });
  
    newSocket.on('changeButton', function(button, value, title){
      document.getElementById(button).value = value;
      document.getElementById(button).title = title;
  });

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
    <div className="App">
      <header className="App-header">
        <SocketContext.Provider value={socket}>
          <Game />
        </SocketContext.Provider>
      </header>
    </div>
  );
}

export default App;

/*

function hidedeed() {
  $("#deed").hide();
}

function showdeed(property) {
  socket.emit('showdeed', property)
}


var allow2houses = false;

socket.on('buyhouse2', function(isAllowed) {
    allow2houses = isAllowed;
});

var square;
socket.on('updateSquare', function(msquare) {
    square = msquare;
});

var player;
var meineBank;
socket.on('updatePlayer', function(mplayer, mbank) {
    player = mplayer;
    meineBank = mbank;
});

socket.on('show', function(element, isShow) {
    if (isShow) {
        $(element).show();
    } else {
        $(element).hide();
    }
    
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