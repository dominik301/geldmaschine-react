import React, {useState, useContext } from "react";
import { useGameContext } from '@/contexts/GameContext';
import { SocketContext } from '@/contexts/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';


const Auction = () => {
    const { gameState, updateGameState } = useGameContext();
    const socket = useContext(SocketContext);
    const player = gameState.players[gameState.playerId];
    const ownedSquares = gameState.squares.filter(sq => sq.owner === gameState.playerId);
    const [selectedCheckbox, setSelectedCheckbox] = useState(0);

    const submit = () => {
        if (selectedCheckbox === 0) {
            alert("Bitte wähle ein Grundstück aus.")
        }
        else {
            if (socket) socket.emit("auctionHouse", selectedCheckbox);
            updateGameState({currentView: "board"});
        }
    }

    const showdeed = (i) => {
        updateGameState({showPropertyCard: i});
      };
    
    const hidedeed = () => {
        updateGameState({showPropertyCard: 0});
    };
    
    return (
        <div>
            <div id="popupbackground"></div>
            <div id="popupwrap">
                <div id="popup">
                    <div style={{position: 'relative'}}>
                        <div id="popuptext">
                        {ownedSquares.length > 0 ? (
                        <>
                            <p>{player.name}, wähle eines der Grundstücke für die Auktion aus, indem du es anklickst. Klicke OK, wenn du fertig bist.</p>
                            <table>
                                <tbody>
                                    {gameState.squares.map((sq, i) => (
                                        sq.owner === gameState.playerId && (
                                        <tr key={i} className='property-cell-row'>
                                            <td className='propertycellcheckbox'>
                                                <input type='checkbox' id={`propertycheckbox${i}`} 
                                                checked={selectedCheckbox === i}
                                                onChange={() => setSelectedCheckbox(i)}
                                                /></td>
                                            <td className='propertycellcolor' style={{background: sq.color}} onMouseOver={() => showdeed(i)} onMouseOut={() => hidedeed()}></td>
                                            <td className='propertycellname' title={sq.mortgage ? 'Hypothek aufgenommen' : ''}>{sq.name}
                                                {sq.house >= 1 && (
                                                    <FontAwesomeIcon icon={faHouse} title='Haus' />
                                                )}
                                                {sq.house === 2 && (
                                                    <FontAwesomeIcon icon={faHouse} title='Haus' />
                                                )}
                                            </td>
                                        </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                        </>
                        ) :
                        <p>{player.name}, du besitzt keine Grundstücke.</p>}
                        <input type='button' value='OK' onClick={submit} />
                        </div>
                        <div id="popupdrag"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auction;