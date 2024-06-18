import React, {useContext} from 'react';
import { useGameContext } from '../contexts/GameContext.tsx';
import { SocketContext } from '../contexts/SocketContext';

const Credit = () => {
  const { socket } = useContext(SocketContext);
  const { gameState, updateGameState } = useGameContext();

  const cancelkredit = () => {
    updateGameState({currentView: "board"});
  };

  const kreditaufnehmenHandler = () => {
    const kredit = document.getElementById('credit-leftp-money') as HTMLInputElement;

    if (isNaN(Number(kredit.value))) {
        kredit.value = "Bitte eine Zahl eingeben.";
        kredit.style.color = "red";
        return false;
    }

    var money = kredit.value;

    if (!window.confirm(gameState.players[gameState.playerId].name + ", möchtest Du wirklich einen Kredit aufnehmen?")) {
        return false;
    }
    if (socket) socket.emit('kreditaufnehmen', money);

    kredit.value = "0";
  }

  const kredittilgenHandler = () => {
    const kredit = document.getElementById('credit-leftp-money') as HTMLInputElement;

    if (isNaN(Number(kredit.value))) {
        kredit.value = "Bitte eine Zahl eingeben.";
        kredit.style.color = "red";
        return false;
    }

    if (!window.confirm(gameState.players[gameState.playerId].name + ", möchtest Du wirklich deinen Kredit tilgen?")) {
        return false;
    }
    if (socket) socket.emit('kredittilgen', kredit.value);
        
    kredit.value = "0";
  }

    return (
    <div id="credit">
      <table style={{borderSpacing: "3px"}}>
        <tbody>
        <tr>
          <td className="credit-cell">
            <div id="credit-leftp-name"></div>
          </td>
        </tr>
        <tr>
          <td className="credit-cell">
            $&nbsp;<input id="credit-leftp-money" defaultValue="0" type="number" title="Gewünschte Höhe des Kredits eingeben." />
          </td>
        </tr>
        <tr>
          <td colSpan={2} className="credit-cell">
            <button id="kreditaufnehmenbutton" title="Kredit aufnehmen." onClick={kreditaufnehmenHandler} >Kredit aufnehmen</button>
            <button id="kredittilgenbutton" title="Kredit tilgen." onClick={kredittilgenHandler} >Kredit tilgen</button>
            <button id="kreditcancelbutton" onClick={cancelkredit} title="Fenster schließen." >Schließen</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    );
}

export default Credit;