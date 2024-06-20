import React, { createContext, useState, useContext, useEffect } from 'react';
import { SocketContext } from './SocketContext';

interface ISquare {
  name: string;
  pricetext: string;
  color: string;
  price: number;
  owner: number;
  house: number;
  mortgage: boolean;
  rent: number;
  houseprice: number;
  groupNumber: number;
}

class Square implements ISquare {
  name: string;
  pricetext: string;
  color: string;
  price: number;
  owner: number;
  house: number;
  mortgage: boolean;
  rent: number;
  houseprice: number;
  groupNumber: number;
  
  constructor({name="", pricetext="", color="transparent", price=0, owner=0, house=0, mortgage=false}) {
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

export interface IPlayer {
  name: string;
  color: string;
  index: number;
  position: number;
  money: number;
  sumKredit: number;
  verfuegbareHypothek: number;
  anleihen: number;
  derivate: number;
  motorrad: number;
  yacht: number;
  auto: number;
}

class Player implements IPlayer {
  name: string;
  color: string;
  index: number;
  position: number;
  money: number;
  sumKredit: number;
  verfuegbareHypothek: number;
  anleihen: number;
  derivate: number;
  motorrad: number;
  yacht: number;
  auto: number;
  
  constructor({name="", color="", index=0, position=0, money=0, sumKredit=0, verfuegbareHypothek=0, anleihen=0, derivate=0, motorrad=0, yacht=0, auto=0}) {
    this.name = (name || "");
    this.color = (color || "transparent")
    this.index = (index || 0);
    this.position = (position || 0);
    this.money = (money || 0);
    this.sumKredit = (sumKredit || 0);
    this.verfuegbareHypothek = (verfuegbareHypothek || 0);
    this.anleihen = (anleihen || 0);
    this.derivate = (derivate || 0);
    this.motorrad = (motorrad || 0);
    this.yacht = (yacht || 0);
    this.auto = (auto || 0);
  }
}

export interface IBank extends IPlayer{
  name: string;
  geldMenge: number;
  zinsenLotto: number;
  anleihen: number;
  derivate: number;
  index: number;
  derivateKurs: number;
}

class Bank extends Player implements IBank {
  geldMenge: number;
  zinsenLotto: number;
  derivateKurs: number;
  
  constructor({name="Bank", geldMenge=0, zinsenLotto=0, anleihen=0, derivate=0, index=0, derivateKurs=1.05}) {
    super({name, color: "black", index, anleihen, derivate});
    this.geldMenge = (geldMenge || 0);
    this.zinsenLotto = (zinsenLotto || 0);
    this.derivateKurs = (derivateKurs || 0);
  }
}

interface IGameContext {
  gameState: {
    currentView: string;
    showPropertyCard: number;
    turn: number;
    playerId: number;
    tab: number;
    players: IPlayer[];
    squares: ISquare[];
    bank: IBank;
    staat: { staatsSchuld: number, steuer: number };
    diceRolled: boolean;
    die0: number;
  };
  updateGameState: (updates: any) => void;
}

const GameContext = createContext<IGameContext>({
  gameState: {
  currentView: 'setup', // board, trade, stats, etc.
  showPropertyCard: 0,
  turn: 1,
  playerId: 1,
  tab: 0,
  players: [new Bank({}), new Player({})],
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
    bank: new Bank({}),
    staat: { staatsSchuld: 0, steuer: 0 },
    diceRolled: false,
    die0: 1,
  // other state properties
},
  updateGameState: (updates) => { }
});

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    currentView: 'setup', // board, setup
    showPropertyCard: 0,
    turn: 1,
    playerId: 1,
    tab: 0,
    players: [
        new Bank({name: "Bank", index: 0}),
        new Player({ name: 'Player 1', color: 'yellow', index: 1 }),
        new Player({ name: 'Player 2', color: 'red', index: 2 }),
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
      bank: new Bank({}),
      staat: { staatsSchuld: 0, steuer: 0 },
      diceRolled: false,
      die0: 1,
    // other state properties
  });

  const socket = useContext(SocketContext);

  useEffect(() => {

    if (!socket) return;

    socket.on('updateDice', function(die){
      /*var snd = new Audio("short-dice-roll.wav"); // buffers automatically when created
      snd.play();*/
    
      setTimeout(() => {
        updateGameState({
          die0: die
        });
      }, 500);
    });

    socket.on('updateSquare', function(msquare) {
      // for each object in msquare, update the corresponding object in squares
      let squares: ISquare[] = []
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
    let player = _player.filter((player) => player.name !== "")
    updateGameState({
      players: player, 
      bank: _meineBank, 
      staat: meinStaat,
      turn: turn
    });
  });

socket.on('updateOwned', function(_player, _square) {
  let player = _player.filter((player) => player.name !== "")
  let squares: ISquare[] = []
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

  setGameState((prev) => {

    // Create a new players array with the updated position
    const updatedPlayers = prev.players.map((player, index) =>
      index === turn
        ? { ...player, position: p.position }
        : player
    );

    // Return the new state with the updated players array
    return { ...prev, players: updatedPlayers, turn: turn};
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