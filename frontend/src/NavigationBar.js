import React, {useContext} from 'react';
import { SocketContext } from './SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPercent, faAlignJustify, faHouse, faPeopleArrowsLeftRight, faMoneyBill1, faInfo, faChartLine } from '@fortawesome/free-solid-svg-icons';
import './NavigationBar.css';
import { useGameContext } from './GameContext';

const NavigationBar = () => {
    const socket = useContext(SocketContext);
    const {gameState, updateGameState} = useGameContext();

    const changeZinssatz = () => {
        const value = prompt("Zinssatz ändern", "5");
        // can value be parsed as int?
        if (!isNaN(parseInt(value)) && socket) {
            socket.emit("zinssatz", parseInt(value))
        }
    }

    const changeView = (view) => {
        updateGameState({currentView: view});
    }

    const setTab = (tab) => {
        updateGameState({tab: tab});
    }

    return (
        <div id="icon-bar">
            <a className="active" id="logicon" onClick={() => setTab(0)} title="Den Spielverlauf anzeigen"><FontAwesomeIcon icon={faAlignJustify} /></a>
            <a onClick={() => setTab(1)} title="Grundstücke anzeigen und Häuser kaufen"><FontAwesomeIcon icon={faHouse} /></a>
            <a onClick={() => changeView("trade")} title="Grundstücke, Anleihen und Derivate mit Spielern und Bank tauschen"><FontAwesomeIcon icon={faPeopleArrowsLeftRight} /></a>
            <a onClick={() => changeView("credit")} title="Kredit aufnehmen oder tilgen"><FontAwesomeIcon icon={faMoneyBill1} /></a>
            <a onClick={() => updateGameState({showStats: true})} title="Statistik anzeigen"><FontAwesomeIcon icon={faInfo} /></a>
            <a onClick={() => updateGameState({showChart: true})} title="Verlauf von Geldmenge und Zinsen anzeigen"><FontAwesomeIcon icon={faChartLine} /></a>
            {gameState.playerId === 1 && (
            <a id="zinsen" onClick={changeZinssatz}><FontAwesomeIcon icon={faPercent} /></a>
            )}
        </div>
    );
};

export default NavigationBar;