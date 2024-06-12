import React, { createContext, useState, useContext, useEffect } from 'react';
import { SocketContext } from './SocketContext';

const GameContext = createContext();

export const useGameContext = () => useContext(GameContext);

class Square {
  constructor({name, pricetext, color, price, owner, house, mortgage}) {
		this.name = (name || "");
		this.pricetext = (pricetext || "")
		this.color = (color || "transparent")
		this.owner = (owner || 0);
		this.mortgage = (mortgage || false);
		this.house = (house || 0);
		this.price = (price || 0);
		this.rent = this.price;
		this.houseprice = 3 * this.price;
		this.groupNumber = this.price !== 0 ? 1 : 0
	}
}

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    currentView: 'setup', // board, trade, stats, etc.
    showCredit: false,
    showStats: false,
    showCommunityChest: false,
    showPropertyCard: 0,
    showChart: false,
    turn: 1,
    playerId: 1,
    tab: 0,
    players: [
        { name: "Bank", geldMenge: 0, zinsenLotto: 0, anleihen: 0, derivate: 0, index: 0 },
        { name: 'Player 1', color: 'yellow', index: 1, position: 0, money: 0, sumKredit: 0, verfuegbareHypothek: 0, anleihen: 0, derivate: 0 },
        { name: 'Player 2', color: 'red', index: 2, position: 0, money: 0, sumKredit: 0, verfuegbareHypothek: 0, anleihen: 0, derivate: 0 },
        // Add more players as needed
      ],
      squares: [
        new Square({name: "Start/Bank", pricetext: "Wer auf oder über dieses Feld zieht, zahlt Zinsen für alle offenen Kredite.", color: "yellow"}),
        new Square({name: "Kiesweg 1", pricetext: "Miete:12.000", color: "rgb(255, 252, 92)", price: 12000, owner: 1, house: 1}),
        new Square({name: "Kiesweg 2", pricetext: "Miete:14.000", color: "rgb(255, 252, 92)", price: 14000, owner: 1}),
        new Square({}),
        new Square({name: "Alleenring 1", pricetext: "Miete:22.000", color: "rgb(119, 248, 140)", price: 22000}),
        new Square({name: "Alleenring 2", pricetext: "Miete:24.000", color: "rgb(119, 248, 140)", price: 24000}),
        new Square({name: "Staat/Finanzamt", pricetext: "Wer auf oder über dieses Feld zieht, zahlt 10% Steuern aufs aktuelle Guthaben. Zieht Gelb auf oder über dieses Feld zahlt der Staat Zinsen auf alle Anleihen.", color: "yellow"}),
        new Square({name: "Ziegelstraße 1", pricetext: "Miete:16.000", color: "red", price: 16000}),
        new Square({name: "Ziegelstraße 2", pricetext: "Miete:16.000", color: "red", price: 16000}),
        new Square({}),
        new Square({name: "Nasse Gasse 1", pricetext: "Miete:18.000", color: "rgb(92, 195, 255)", price: 18000}),
        new Square({name: "Nasse Gasse 2", pricetext: "Miete:18.000", color: "rgb(92, 195, 255)", price: 18000}),
      ],
      bank: { geldMenge: 0, zinsenLotto: 0, anleihen: 0, derivate: 0, index: 0 },
      staat: { staatsSchuld: 0, steuer: 0 },
      diceRolled: false,
      die0: 1,
    // other state properties
  });

  const socket = useContext(SocketContext);

  useEffect(() => {

    if (!socket) return;

    socket.on('updateDice', function(die){
      var snd = new Audio("short-dice-roll.wav"); // buffers automatically when created
      snd.play();
      let diceRolled = false;
      if (gameState.turn === gameState.playerId) {
        diceRolled = true;
      }
    
      setTimeout(() => {
        updateGameState({
          diceRolled: diceRolled,
          die0: die
        });
      }, 500);
    });

    socket.on('updateSquare', function(msquare) {
      // for each object in msquare, update the corresponding object in squares
      let squares = []
      msquare.forEach(function(item){
        let square = new Square(item);
        squares.push(square);
      })
      updateGameState({
        squares: squares,
        currentView: 'board'
      });
  });

  socket.on('updateMoney', function(_player, turn, _meineBank, meinStaat, _pcount) {
    updateGameState({
      players: _player, 
      bank: _meineBank, 
      staat: meinStaat,
      turn: turn
    });
  });

socket.on('updateOwned', function(player, _square) {
  let squares = []
  _square.forEach(function(item){
    let square = new Square(item);
    squares.push(square);
  })
  updateGameState({
    squares: squares,
    players: player
  });
});

socket.on('updatePosition', function(turn, p_old, p){
  let players = gameState.players;
  players[turn].position = p;
  updateGameState({
    turn: turn,
    players: players
  });
});
  
  }, [socket]);



  const updateGameState = (updates) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <GameContext.Provider value={{ gameState, updateGameState }}>
      {children}
    </GameContext.Provider>
  );
};