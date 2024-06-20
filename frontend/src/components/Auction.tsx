import React, {useState, useContext } from "react";
import { useGameContext } from '../contexts/GameContext.tsx';
import { SocketContext } from '../contexts/SocketContext';
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
            const auction = document.getElementById("auction") as HTMLDialogElement;
            auction.close();
        }
    }

    const showdeed = (i) => {
        updateGameState({showPropertyCard: i});
      };
    
    const hidedeed = () => {
        updateGameState({showPropertyCard: 0});
    };
    
    return (
        <dialog id="auction">
            <div className="popup" style={{width: "600px"}}>
                <div className="popuptext">
                {ownedSquares.length > 0 ? (
                <>
                    <p style={{}}>{player.name}, wähle eines der Grundstücke für die Auktion aus, indem du es anklickst. Klicke OK, wenn du fertig bist.</p>
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
                <button onClick={submit}>OK</button>
                </div>
            </div>
        </dialog>
    );
};

export default Auction;