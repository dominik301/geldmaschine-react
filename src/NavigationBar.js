import React, {useState, useContext} from 'react';
import { SocketContext } from './SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPercent, faAlignJustify, faHouse, faPeopleArrowsLeftRight, faMoneyBill1, faInfo, faChartLine } from '@fortawesome/free-solid-svg-icons';

const NavigationBar = ({setTab, changeView, playerId}) => {
    const socket = useContext(SocketContext);
    const [showZinsInput, setShowZinsInput] = useState(false);

    const changeZinssatz = (value) => {
        socket.emit("zinssatz", parseInt(value))
    }

    return (
        <div>
            <div id="icon-bar">
                <a className="active" id="logicon" onClick={() => setTab(0)} title="Den Spielverlauf anzeigen"><FontAwesomeIcon icon={faAlignJustify} /></a>
                <a onClick={() => setTab(1)} title="Grundstücke anzeigen und Häuser kaufen"><FontAwesomeIcon icon={faHouse} /></a>
                <a onClick={() => changeView("trade")} title="Grundstücke, Anleihen und Derivate mit Spielern und Bank tauschen"><FontAwesomeIcon icon={faPeopleArrowsLeftRight} /></a>
                <a onClick={() => changeView("credit")} title="Kredit aufnehmen oder tilgen"><FontAwesomeIcon icon={faMoneyBill1} /></a>
                <a onClick={() => changeView("stats")} title="Statistik anzeigen"><FontAwesomeIcon icon={faInfo} /></a>
                <a onClick={() => changeView("chart")} title="Verlauf von Geldmenge und Zinsen anzeigen"><FontAwesomeIcon icon={faChartLine} /></a>
                {playerId === 1 && (
                <a id="zinsen" onClick={() => setShowZinsInput(true)}><FontAwesomeIcon icon={faPercent} /></a>
                )}
            </div>
            {showZinsInput && (
            <div>
            <p>Zinssatz ändern</p>
            <div>
                <input type="number" id="zinssatzInput" title="Zinssatz" maxLength="3" value="5" size="3" onChange={() => changeZinssatz(this.value)}/> % 
                <input type="button" value="Schließen" id="closezinsbutton" onClick={() => setShowZinsInput(false)}/>
            </div>
            </div>)}
        </div>
    
    );
};

export default NavigationBar;