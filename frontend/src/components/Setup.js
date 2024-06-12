import React, {useContext, useEffect, useState} from 'react';
import { SocketContext } from '../contexts/SocketContext.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faInfo, faShield } from '@fortawesome/free-solid-svg-icons';
import { useGameContext } from '../GameContext.jsx';
import NameDialog from './NameDialog.jsx';

const Setup = () => {
    const socket = useContext(SocketContext);
    const [nieten, setNieten] = useState([]);
    const { gameState } = useGameContext();
    const spieler = [3, 4, 5, 6];

    const [name, setName] = useState('');
    const [open, setOpen] = useState(true);

    const [names, setNames] = useState([]);

    const playernumber_onchange = () => {

        if (gameState.playerId !== 1) {
            return;
        }
        let newNieten = [];
        try {
            var anzahlSpieler = document.getElementById("spieler").value;
            switch (+anzahlSpieler) {
            case 3:
                newNieten = [0, 2, 4];
                break;
            case 4:
                newNieten = [1, 4, 7];
                break;
            case 5:
                newNieten = [0, 4, 8];
                break;
            case 6:
                newNieten = [2, 7];
                break;
        }
        setNieten(newNieten);
        } catch (err) {
            console.log(err);
        }
    }
    
    const startClicked = function(e){
      //prevent the form from refreshing the page
      e.preventDefault();

      if (socket) {
        socket.emit("windowload");
    
        const nieten = document.getElementById("nieten").value;
        const pNo = document.getElementById("spieler").value;
        socket.emit('setup', true, pNo, nieten);
      }
      
    }

    useEffect(() => {  
        if (socket) {
            socket.emit('setName', name);
        }
    }, [name]);

    useEffect(() => {
        playernumber_onchange();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('playerNames', function(names) {
            setNames(Object.values(names));
        });

    }, [socket]);

    return (
    <div id="setup">
        <NameDialog open={open} setOpen={setOpen} setName={setName} />
      <div id="mytitle" > Spiel - Geldmaschine </div>
      
        <div id="setup-scrollable">
            <table>
            <tbody>
                {gameState.playerId === 1 && (
                    <tr id="setup-nieten">
                        <td><div id="nietenfield">
                        Anzahl Nieten
                        </div></td>
                        <td>
                        <select id="nieten" title="Wähle die Anzahl der Nieten.">
                            {nieten.map((niete, index) => (
                                <option key={index} id={`nieten${niete}`}>{niete}</option>
                            ))}
                        </select>
                        </td>
                    </tr>
                )}
                {gameState.playerId === 1 && (
                    <tr id="setup-spieler">
                        <td><div id="spielerfield">
                        Anzahl SpielerInnen
                        </div></td>
                        <td>
                        <select id="spieler" title="Wähle die Anzahl der Spieler." onChange={playernumber_onchange}>
                            {spieler.map((spieler, index) => (
                                <option key={index} id={`spieler${spieler}`}>{spieler}</option>
                            ))}
                        </select>
                        </td>
                    </tr>
                )}
            {names.map((pName, index) => (
                <tr key={index} id={`player${index+1}input`} className="player-input">
                <td><span>SpielerIn {index+1}:</span></td>
                <td>
                    <span id={`player${index}name`} >{pName}</span>
                </td>
                </tr>
            ))}
            <tr>
            {gameState.playerId === 1 && gameState.players.length < 7 && (
                <td><div style={{margin: "20px 0px"}}>
                <input id="startbutton" type="button" value="Spiel beginnen" title="Starte das Spiel." onClick={(event) => startClicked(event)} />
                </div></td>
            )}
                </tr>
            </tbody>
            </table>

            <div id="description">
                <span>
                    Das Spiel „Geldmaschine“ hat Samirah Kenawi entwickelt, damit Interessierte sich auf spielerische Weise Wissen über das Funktionieren unseres Geldsystems aneignen können.<br/><br/>
                    Zu den zwei Varianten der Ereigniskarten (Phase 1 und Phase 2) haben viele die richtige Idee: Phase 2 beginnt mit der Marktsättigung, wenn keine (ausreichende) privaten Investitionen mehr stattfinden. Der Staat versucht durch seine Wirtschafts- und Geldpolitik darauf zu reagieren.<br/><br/>
                    Natürlich ist das spielerische Modell stark vereinfacht. Es macht jedoch erfahrbar, wie durch Kreditaufnahme für Investitionen Geld in Umlauf kommt und wie die Geldversorgung ins Stocken gerät, wenn diese private Kreditaufnahme sinkt. Auch lässt es – wenn lange genug gespielt wird –, erkennen, wie Wertpapierhandel zu einem notwendigen Bestandteil der Ökonomie wird und welche Dynamik er entwickelt.<br/><br/>
                    Inzwischen hat Dominik Hüsener eine online-Version des Spiels erarbeitet. Sie ist noch relativ einfach gehalten. Allerdings erfolgen alle Buchungen automatisch und sehr viel schneller als mittels der Tabellen für die Brettspielversion. Um online spielen zu können, muss das Spiel von mindestens 3 Personen zeitnah geöffnet werden. Sinnvoll ist es, wenn alle Mitspielenden nebenbei einem virtuellen Raum beitreten, wobei die Kameras ausgeschaltet werden können. Dann können alle während des Spielens jederzeit miteinander reden.<br/><br/>
                    Wissen ist Macht. Um das heutige krisenbehaftete System überwinden zu können, müssen wir es verstehen lernen. Dazu will das Spiel einen Beitrag leisten.
                </span>
            </div>
        </div>

        <div id="credits">
            <ul>
                <li><a href="https://falschgeldsystem.de/spiel/" target="_blank">
                    <FontAwesomeIcon icon={faInfo} /> Anleitung</a></li>
                <li><a href="mailto:dominik.huesener@rwth-aachen.de"><FontAwesomeIcon icon={faComment} /> Feedback</a></li>
                <li><a href="./client/privacy.html" target="_blank"><FontAwesomeIcon icon={faShield} /> Datenschutz</a></li>
            </ul>
        </div>
    </div>
    );
};

export default Setup;