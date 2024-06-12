import React, { useContext, useEffect, useState } from 'react';
import { useGameContext } from '../GameContext';
import { SocketContext } from '../contexts/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSailboat, faCar, faMotorcycle} from '@fortawesome/free-solid-svg-icons';

const Trade = ({offer}) => {
    const socket = useContext(SocketContext);
    const { gameState, updateGameState } = useGameContext();
    const assets = [
        { asset: 'money', title: 'Wie viel Geld möchtest du tauschen?' },
        { asset: 'derivate', title: 'Wie viele Derivate möchtest du tauschen?' },
        { asset: 'anleihen', title: 'Wie viele Anleihen möchtest du tauschen?' },
    ];
    const [tradeAltered, setTradeAltered] = useState(false);
    const [tradeObj, setTradeObj] = useState({
        initiator: null,
        recipient: null,
        money: 0,
        property: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        anleihen: 0,
        derivate: 0,
        assets: [0, 0, 0],
    });
    const ownedProperties = gameState.squares.filter(square => square.owner === gameState.playerId);
    const propertiesRecipient = gameState.squares.filter(square => square.owner === tradeObj.recipient);
    const [allowRecipientToBeChanged, setAllowRecipientToBeChanged ] = useState(true);

    useEffect(() => {
        if (offer !== null) {
            setTradeObj(offer);
            setAllowRecipientToBeChanged(false);
        }
        if (!socket) return;
        socket.on('tradeObj', function(data) {
            setTradeObj(data);
        });
        
    }, [socket, offer]);

    useEffect(() => {
        if (gameState && gameState.players && gameState.playerId !== undefined) {
            setTradeObj((prev) => ({
                ...prev,
                initiator: prev.initiator || gameState.players[gameState.playerId],
                recipient: prev.recipient || gameState.players[gameState.playerId === 1 ? 2 : 1],
              }));
        }
      }, [gameState]);

    const cancelTrade = () => {
        updateGameState({currentView: "board"});
    };

    const acceptTrade = () => {
        if (!window.confirm(tradeObj.initiator.name + ", bist du sicher, dass du diesen Tausch mit " + tradeObj.recipient.name + " machen willst?")) {
            return false;
        }

        if (socket) socket.emit('acceptTrade', tradeObj);

        cancelTrade();
      };

      const proposeTrade = () => {

        var money = tradeObj.money;
        var initiator = tradeObj.initiator;
        var recipient = tradeObj.recipient;
        var reversedTradeProperty = [];
        var anleihen = tradeObj.anleihen;
        var derivate = tradeObj.derivate;
        var assets = tradeObj.assets;
        var reversedAssets = [];
        /*var isAPropertySelected = false;

        // Ensure that some properties are selected.
        for (var i = 0; i < 12; i++) {
            isAPropertySelected |= tradeObj.property[i];
        }*/

        if (isNaN(document.getElementById("trade-leftp-money").value)) {
            document.getElementById("trade-leftp-money").value = "Der Wert muss eine Zahl sein.";
            document.getElementById("trade-leftp-money").style.color = "red";
            return false;
        }
      
        if (isNaN(document.getElementById("trade-rightp-money").value)) {
            document.getElementById("trade-rightp-money").value = "Der Wert muss eine Zahl sein.";
            document.getElementById("trade-rightp-money").style.color = "red";
            return false;
        }
        
        if (money > 0 && money > initiator.money) {
            document.getElementById("trade-leftp-money").value = initiator.name + " hat keine " + money + ".";
            document.getElementById("trade-leftp-money").style.color = "red";
            return false;
        } else if (!(recipient.name === "Bank") && money < 0 && -money > recipient.money) {
            document.getElementById("trade-rightp-money").value = recipient.name + " hat keine " + (-money) + ".";
            document.getElementById("trade-rightp-money").style.color = "red";
            return false;
        }

        if (anleihen > 0 && anleihen > initiator.anleihen) {
            document.getElementById("trade-leftp-anleihen").value = initiator.name + " hat keine Anleihen im Wert von " + anleihen + ".";
            document.getElementById("trade-leftp-anleihen").style.color = "red";
            return false;
        } else if (anleihen < 0 && -anleihen > recipient.anleihen) {
            document.getElementById("trade-rightp-anleihen").value = recipient.name + " hat keine Anleihen im Wert von " + (-anleihen) + ".";
            document.getElementById("trade-rightp-anleihen").style.color = "red";
            return false;
        }

        if (derivate > 0 && derivate > initiator.derivate) {
            document.getElementById("trade-leftp-derivate").value = initiator.name + " hat keine Derivate im Wert von " + derivate + ".";
            document.getElementById("trade-leftp-derivate").style.color = "red";
            return false;
        } else if (derivate < 0 && -derivate > recipient.derivate) {
            document.getElementById("trade-rightp-derivate").value = recipient.name + " hat keine Derivate im Wert von " + (-derivate) + ".";
            document.getElementById("trade-rightp-derivate").style.color = "red";
            return false;
        }

        if (!window.confirm(initiator.name + ", bist du sicher, dass du dieses Angebot an " + recipient.name + " machen willst?")) {
            return false;
        }

        for (var i = 0; i < 12; i++) {
            reversedTradeProperty[i] = -tradeObj.property[i];
        }

        for (i = 0; i < assets.length; i++) {
            reversedAssets[i] = -assets[i];
        }

        var trade = {
            recipient: initiator,
            initiator: recipient,
            money: -money,
            property: reversedTradeProperty,
            anleihen: -anleihen,
            derivate: -derivate,
            assets: reversedAssets,
        }

        socket.emit('sendOffer', trade);

        cancelTrade();
      }

    const max = (a, b) => {
        return a > b ? a : b;
    }

    const showdeed = (i) => {
        updateGameState({showPropertyCard: i});
    }

    const hidedeed = () => {
        updateGameState({showPropertyCard: 0});
    }

    if (!tradeObj.initiator || !tradeObj.recipient) {
        return <div id="trade">Loading...</div>;
    }

    return (
    <div id="trade">
      <table style={{borderSpacing: "3px"}}>
        <tbody>
        <tr>
          <td className="trade-cell">
            <div id="trade-leftp-name">
                {tradeObj.initiator.name}
            </div>
          </td>
          <td className="trade-cell">
            <div id="trade-rightp-name">
                {allowRecipientToBeChanged ? (
                <select id="trade-rightp-name" title="Wähle einen Mitspieler zum Handeln aus." value={tradeObj.recipient.index} onChange={(event) => {
                    setTradeAltered(true)
                    parseInt(event.target.value) === 0 ? setTradeObj(prev => ({ ...prev, recipient: gameState.bank })) :
                    setTradeObj(prev => ({ ...prev, recipient: gameState.players[parseInt(event.target.value)] }))
                }}>
                {gameState.players.map((player, i) => (
                i !== gameState.playerId && (
                <option key={i} value={i} style={{color: player.color}}>{player.name}</option>
                )))}
                {
                //<option value={0} style={{color: gameState.bank.color}} selected={0 === tradeObj.recipient.index}>{gameState.bank.name}</option>
                }
                </select>
                ) : (
                tradeObj.recipient.name
                )}
            </div>
          </td>
        </tr>
        {tradeObj.recipient.name === "Bank" && (
            <tr>Derivate (Kurs: {gameState.bank.derivateKurs})</tr>
        )}
        {assets.map(({ asset, title }) => (
            <tr key={asset}>
                <td className="trade-cell">
                    {asset}: &nbsp;
                    <input id={`trade-leftp-${asset}`} value={max(tradeObj[asset], 0)} type="number" title={title} onChange={(event) => {
                        setTradeAltered(true)
                        setTradeObj(prev => ({ ...prev, [asset]: parseInt(event.target.value) || 0 }))
                        }} />
                </td>
                <td className="trade-cell">
                    {asset}: &nbsp;
                    <input id={`trade-rightp-${asset}`} value={max(-tradeObj[asset], 0)} type="number" title={title} onChange={(event) => {
                        setTradeAltered(true)
                        setTradeObj(prev => ({ ...prev, [asset]: -parseInt(event.target.value) || 0 }))
                        }} />
                </td>
            </tr>
        ))}
        <tr>
          <td id="trade-leftp-property" className="trade-cell">
            {ownedProperties.length > 0 ? (
            <table>
                <tbody>
                {gameState.squares.map((sq, i) => (
                    sq.owner === gameState.playerId && (
                        <tr key={i}>
                            <td className="propertycellcheckbox">
                                <input type="checkbox" id={`tradeleftcheckbox${i}`} onChange={(event) => {
                                    setTradeAltered(true)
                                    setTradeObj(prev => {
                                        const property = [...prev.property];
                                        property[i] = event.target.checked ? 1 : 0;
                                        return { ...prev, property };
                                    })
                                }} title={`Check this box to include ${sq.name} in the trade.`}
                                checked={tradeObj.property[i] === 1}
                                />
                            </td>
                            <td className="propertycellcolor" style={{background: sq.color, borderColor: "grey"}} onMouseOver={() => showdeed(i)} onMouseOut={hidedeed}></td>
                            <td className="propertycellname" title={sq.mortgage ? "Hypothek aufgenommen" : ""} style={{color: "grey"}}>
                                {sq.name}
                            </td>
                        </tr>
                    )  
                ))}
                </tbody>
            </table>
            ) : (
            <div>{tradeObj.initiator.name} hat keine Grundstücke zum Handeln.</div>
            )}
          </td>
          <td id="trade-rightp-property" className="trade-cell">
          {propertiesRecipient.length > 0 ? (
          <table>
                <tbody>
                {gameState.squares.map((sq, i) => (
                    sq.owner === tradeObj.recipient.index && (
                        <tr key={i}>
                            <td className="propertycellcheckbox">
                                <input type="checkbox" id={`tradeleftcheckbox${i}`} onChange={(event) => {
                                    setTradeAltered(true)
                                    setTradeObj(prev => {
                                        const property = [...prev.property];
                                        property[i] = event.target.checked ? -1 : 0;
                                        return { ...prev, property };
                                    })
                                }} title={`Check this box to include ${sq.name} in the trade.`}
                                checked={tradeObj.property[i] === -1}
                                />
                            </td>
                            <td className="propertycellcolor" style={{background: sq.color, borderColor: "grey"}} onMouseOver={() => showdeed(i)} onMouseOut={hidedeed}></td>
                            <td className="propertycellname" title={sq.mortgage ? "Hypothek aufgenommen" : ""} style={{color: "grey"}}>
                                {sq.name}
                            </td>
                        </tr>
                    )  
                ))}
                </tbody>
            </table>
            ) : (
                <div>{tradeObj.recipient.index !== 0 ? tradeObj.recipient.name : "Die Bank"} hat keine Grundstücke zum Handeln.</div>
            )}
          </td>
        </tr>
        <tr>
          <td id="trade-leftp-assets" className="trade-cell">
            <table>
                <tbody>
                    {tradeObj.initiator.yacht > 0 && (
                        <tr>
                            <td className="propertycellcheckbox">
                                <input type="checkbox" id="tradeleftcheckboxY" onChange={(event) => {
                                    setTradeAltered(true)
                                    setTradeObj(prev => {
                                        const assets = [...prev.assets];
                                        assets[2] = event.target.checked ? 1 : 0;
                                        return { ...prev, assets };
                                    })
                                }} title="Check this box to include Yacht in the trade."
                                checked={tradeObj.assets[2] === 1}
                                />
                            </td>
                            <td className="assetcellcolor">
                                <FontAwesomeIcon icon={faSailboat} />
                            </td>
                            <td className="propertycellname">Yacht</td>
                        </tr>
                    )}
                    {tradeObj.initiator.auto > 0 && (
                        <tr>
                            <td className="propertycellcheckbox">
                                <input type="checkbox" id="tradeleftcheckboxA" onChange={(event) => {
                                    setTradeAltered(true)
                                    setTradeObj(prev => {
                                        const assets = [...prev.assets];
                                        assets[1] = event.target.checked ? 1 : 0;
                                        return { ...prev, assets };
                                    })
                                }} title="Check this box to include Auto in the trade."
                                checked={tradeObj.assets[1] === 1}
                                />
                            </td>
                            <td className="assetcellcolor">
                                <FontAwesomeIcon icon={faCar} />
                            </td>
                            <td className="propertycellname">Auto</td>
                        </tr>
                    )}
                    {tradeObj.initiator.motorrad > 0 && (
                        <tr>
                            <td className="propertycellcheckbox">
                                <input type="checkbox" id="tradeleftcheckboxM" onChange={(event) => {
                                    setTradeAltered(true)
                                    setTradeObj(prev => {
                                        const assets = [...prev.assets];
                                        assets[0] = event.target.checked ? 1 : 0;
                                        return { ...prev, assets };
                                    })
                                }} title="Check this box to include Motorrad in the trade."
                                checked={tradeObj.assets[0] === 1}
                                />
                            </td>
                            <td className="assetcellcolor">
                                <FontAwesomeIcon icon={faMotorcycle} />
                            </td>
                            <td className="propertycellname">Motorrad</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {tradeObj.initiator.yacht === 0 && tradeObj.initiator.auto === 0 && tradeObj.initiator.motorrad === 0 && (
                <div>{tradeObj.initiator.name} hat keine Wertgegenstände zum Handeln.</div>
            )}
          </td>
          <td id="trade-rightp-assets" className="trade-cell">
          <table>
                <tbody>
                    {tradeObj.recipient.index > 0 && tradeObj.recipient.yacht > 0 && (
                        <tr>
                            <td className="propertycellcheckbox">
                                <input type="checkbox" id="tradeleftcheckboxY" onChange={(event) => {
                                    setTradeAltered(true)
                                    setTradeObj(prev => {
                                        const assets = [...prev.assets];
                                        assets[2] = event.target.checked ? -1 : 0;
                                        return { ...prev, assets };
                                    })
                                }} title="Check this box to include Yacht in the trade."
                                checked={tradeObj.assets[2] === -1}
                                />
                            </td>
                            <td className="assetcellcolor">
                                <FontAwesomeIcon icon={faSailboat} />
                            </td>
                            <td className="propertycellname">Yacht</td>
                        </tr>
                    )}
                    {tradeObj.recipient.index > 0 && tradeObj.recipient.auto > 0 && (
                        <tr>
                            <td className="propertycellcheckbox">
                                <input type="checkbox" id="tradeleftcheckboxA" onChange={(event) => {
                                    setTradeAltered(true)
                                    setTradeObj(prev => {
                                        const assets = [...prev.assets];
                                        assets[1] = event.target.checked ? -1 : 0;
                                        return { ...prev, assets };
                                    })
                                }} title="Check this box to include Auto in the trade."
                                checked={tradeObj.assets[1] === -1}
                                />
                            </td>
                            <td className="assetcellcolor">
                                <FontAwesomeIcon icon={faCar} />
                            </td>
                            <td className="propertycellname">Auto</td>
                        </tr>
                    )}
                    {tradeObj.recipient.index > 0 && tradeObj.recipient.motorrad > 0 && (
                        <tr>
                            <td className="propertycellcheckbox">
                                <input type="checkbox" id="tradeleftcheckboxM" onChange={(event) => {
                                    setTradeAltered(true)
                                    setTradeObj(prev => {
                                        const assets = [...prev.assets];
                                        assets[0] = event.target.checked ? -1 : 0;
                                        return { ...prev, assets };
                                    })
                                }} title="Check this box to include Motorrad in the trade."
                                checked={tradeObj.assets[0] === -1}
                                />
                            </td>
                            <td className="assetcellcolor">
                                <FontAwesomeIcon icon={faMotorcycle} />
                            </td>
                            <td className="propertycellname">Motorrad</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {(tradeObj.recipient.index === 0 || (tradeObj.recipient.yacht === 0 && tradeObj.recipient.auto === 0 && tradeObj.recipient.motorrad === 0)) && (
                <div>{tradeObj.recipient.name} hat keine Wertgegenstände zum Handeln.</div>
            )}
          </td>
        </tr>
        <tr>
          {tradeAltered && (<td colSpan="2" className="trade-cell">
            <input type="button" id="proposetradebutton" value="Tausch anbieten" onClick={proposeTrade} title="Handel mit Geld, Grundstücken, Anleihen und Derivaten anbieten." />
            <input type="button" id="canceltradebutton" value="Abbrechen" onClick={cancelTrade} title="Tausch abbrechen." />
          </td>)}
          {!tradeAltered && (
          <td colSpan="2" className="trade-cell">
            <input type="button" id="accepttradebutton" value="Tausch annehmen" onClick={acceptTrade} title="Nehme den angebotenen Tausch an." />
            <input type="button" id="rejecttradebutton" value="Tausch ablehnen" onClick={cancelTrade} title="Lehne den angebotenen Tausch ab." />
          </td>)}
        </tr>
        </tbody>
      </table>
    </div>
    );
};

export default Trade;