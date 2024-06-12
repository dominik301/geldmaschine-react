import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    currentView: 'board', // board, trade, stats, etc.
    showCommunityChest: false,
    showPropertyCard: 0,
    turn: 1,
    playerId: 1,
    tab: 0,
    players: [
        { name: 'Player 1', color: 'yellow', position: 0, money: 0, sumKredit: 0, verfuegbareHypothek: 0, anleihen: 0, derivate: 0 },
        { name: 'Player 2', color: 'red', position: 0, money: 0, sumKredit: 0, verfuegbareHypothek: 0, anleihen: 0, derivate: 0 },
        // Add more players as needed
      ],
      squares: [
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
      ],
      bank: { geldMenge: 0, zinsenLotto: 0, anleihen: 0, derivate: 0 },
      staat: { staatsSchuld: 0, steuer: 0 },
    // other state properties
  });

  const updateGameState = (updates) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <GameContext.Provider value={{ gameState, updateGameState }}>
      {children}
    </GameContext.Provider>
  );
};