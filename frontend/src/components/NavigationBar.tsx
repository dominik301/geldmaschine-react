import React, {useContext} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPercent, faAlignJustify, faHouse, faPeopleArrowsLeftRight, faMoneyBill1, faInfo, faChartLine } from '@fortawesome/free-solid-svg-icons';
import '../styles/NavigationBar.css';
import { SocketContext } from '../contexts/SocketContext';
import { useGameContext } from '../contexts/GameContext.tsx';

const NavigationBar = () => {
    const socket = useContext(SocketContext);
    const {gameState, updateGameState} = useGameContext();

    const changeZinssatz = () => {
        const value = prompt("Zinssatz ändern", "5");
        if (value === null) return; // cancel button clicked
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

    const openGraph = () => {
        const chart = document.getElementById("graphwrap") as HTMLDialogElement;
        chart.showModal();
    }

    return (
        <nav style={{position: "absolute", top: 0}}>
            <a className={(gameState.currentView === "board" && gameState.tab === 0) ? "active" : ""} id="logicon" onClick={() => setTab(0)} title="Den Spielverlauf anzeigen"><FontAwesomeIcon icon={faAlignJustify} /></a>
            <a className={(gameState.currentView === "board" && gameState.tab === 1) ? "active" : ""} onClick={() => setTab(1)} title="Grundstücke anzeigen und Häuser kaufen"><FontAwesomeIcon icon={faHouse} /></a>
            <a className={gameState.currentView === "trade" ? "active" : ""} onClick={() => changeView("trade")} title="Grundstücke, Anleihen und Derivate mit Spielern und Bank tauschen"><FontAwesomeIcon icon={faPeopleArrowsLeftRight} /></a>
            <a className={gameState.currentView === "credit" ? "active" : ""} onClick={() => changeView("credit")} title="Kredit aufnehmen oder tilgen"><FontAwesomeIcon icon={faMoneyBill1} /></a>
            <a className={gameState.showStats ? "active" : ""} onClick={() => updateGameState({showStats: true})} title="Statistik anzeigen"><FontAwesomeIcon icon={faInfo} /></a>
            <a className={gameState.showChart ? "active" : ""} onClick={openGraph} title="Verlauf von Geldmenge und Zinsen anzeigen"><FontAwesomeIcon icon={faChartLine} /></a>
            {gameState.playerId === 1 && (
            <a id="zinsen" onClick={changeZinssatz}><FontAwesomeIcon icon={faPercent} /></a>
            )}
        </nav>
    );
};

export default NavigationBar;