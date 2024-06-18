import React, {useContext} from "react";
import { useGameContext } from '../contexts/GameContext.tsx';
import { SocketContext } from '../contexts/SocketContext';

const Bid = props => {
    const { gameState, updateGameState } = useGameContext();
    const socket = useContext(SocketContext);
    const player = gameState.players[gameState.playerId];
    var highestbidder = props.highestbidder || 0;
    var highestbid = props.highestbid || 0;
    const square = gameState.squares[props.auctionproperty];

    const auctionBid = () => {
        if (gameState.playerId === 0) return
        let bid_input = document.getElementById("bid") as HTMLInputElement;
        let bid = parseInt(bid_input.value, 10);
    
        if (isNaN(bid) || bid === null) {
            bid_input.value = "Gebe ein Gebot ab. Das Gebot muss eine Zahl sein.";
            bid_input.style.color = "red";
        } else {
            if (bid > player.money) {
                bid_input.value = "Du hast nicht genügend Geld um " + bid + " zu bieten.";
                bid_input.style.color = "red";
            } else if (bid > highestbid) {
                highestbid = bid;
                highestbidder = gameState.playerId;
                auctionPass();
            } else {
                bid_input.value = "Dein Gebot muss höher sein als das höchste Gebot. ($" + highestbid + ")";
                bid_input.style.color = "red";
            }
        }
    };

    const auctionPass = () => {
        if (highestbidder === 0) {
            highestbidder = gameState.playerId;
        }
        if (socket) socket.emit("newbid", highestbidder, highestbid)

        updateGameState({currentView: "board"});
    
    };
    
    const auctionExit = () => {
        if (window.confirm("Möchtest du wirklich nicht weiter bieten?") && socket) {
            socket.emit("auctionExit", gameState.playerId);
            auctionPass();
        }
    };

    const showdeed = (i) => {
        updateGameState({showPropertyCard: i});
      };
    
    const hidedeed = () => {
        updateGameState({showPropertyCard: 0});
    };

    return (
        <>
            <div id="popupbackground"></div>
            <div id="popupwrap">
                <div id="popup">
                    <div style={{position: "relative"}}>
                        <div id="popuptext">
                        <div style={{fontWeight: "bold", fontSize: "16px", marginBottom: "10px"}}>
                            Auktion <span id="propertyname">
                                <a onMouseOver={() => showdeed(props.auctionproperty)} onMouseOut={() => hidedeed()} className='statscellcolor'>{square.name}</a>
                            </span>
                        </div>
                        {highestbidder !== 0 && (
                        <div>
                            Höchstes Gebot = ${highestbid}({player[highestbidder].name})
                        </div>
                        )}
                        <div>
                           {player.name}, du bist an der Reihe.
                        </div>
                        <div>
                            <input id='bid' title={`Gib ein Gebot für ${square.name} ab.`} style={{width: "291px"}} />
                        </div>
                        <div>
                            <input type='button' onClick={auctionBid} title='Gib dein Gebot ab.'>Bieten</input>
                            <input type='button' title='Diese Runde nicht bieten.' onClick={auctionPass}>Aussetzen</input>
                            <input type='button' title={`Nicht mehr für ${square.name} bieten.`} onClick={auctionExit}>Auktion verlassen</input>
                        </div>

                        </div>
                        <div id="popupdrag"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Bid;