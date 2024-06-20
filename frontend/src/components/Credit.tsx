import React, {useContext} from 'react';
import { SocketContext } from '../contexts/SocketContext';
import { useGameContext } from '../contexts/GameContext.tsx';

const Credit = () => {
  const socket = useContext(SocketContext);
  const { gameState, updateGameState } = useGameContext();

  const cancelkredit = () => {
    const credit = document.getElementById('credit') as HTMLDialogElement;
    credit.close();
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
    <dialog id="credit">
      <div className="popup" style={{width: "315px", minWidth: "315px"}}>
      <table style={{borderSpacing: "3px"}}>
        <tbody>
        <tr>
          <td className="cell">
            $&nbsp;<input id="credit-leftp-money" style={{width: "90%"}} defaultValue="0" type="number" title="Gewünschte Höhe des Kredits eingeben." />
          </td>
        </tr>
        <tr>
          <td colSpan={2} className="cell">
              <button title="Kredit aufnehmen." onClick={kreditaufnehmenHandler} >Kredit aufnehmen</button>
              <button title="Kredit tilgen." onClick={kredittilgenHandler} >Kredit tilgen</button>
              <button onClick={cancelkredit} title="Fenster schließen." >Schließen</button>
          </td>
        </tr>
        </tbody>
      </table>
      </div>
    </dialog>
    );
}

export default Credit;