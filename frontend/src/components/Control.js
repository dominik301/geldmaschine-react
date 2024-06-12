import React, { useState, useContext, useEffect  } from "react";
import { SocketContext } from '../contexts/SocketContext';
import { useGameContext } from '../contexts/GameContext';
import '../styles/Control.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive, faDiceSix} from '@fortawesome/free-solid-svg-icons';


const Alert = ({alertText}) => {
  return (
    <div id="alert">
      {alertText.map((text, index) => (
        <div key={index}>
          {text}
        </div>
      ))}
    </div>
  );
};

const Control = () => {
  const socket = useContext(SocketContext);
  const { players, squares, playerId, tab, turn, diceRolled, die0 } = useGameContext().gameState;
  const { updateGameState } = useGameContext();
  const [alerts, setAlerts] = useState([]);
  const [allow2houses, setAllow2houses] = useState(false);
  const [ownedProperties, setOwnedProperties] = useState([]);

  const ICONS = {
    1:faDiceOne,
    2:faDiceTwo,
    3:faDiceThree,
    4:faDiceFour,
    5:faDiceFive,
    6:faDiceSix
  }

  const [selectedCheckbox, setSelectedCheckbox] = useState(-1);

  const buyHouse = () => {  
    socket.emit('buyhouse', selectedCheckbox);
  }

  const mortgage = () => {
    socket.emit('mortgage', selectedCheckbox);           
  }

  const sellHouse = () => {    
    socket.emit('sellhouse', selectedCheckbox);
  }

  const buy = () => {
    socket.emit('buy');
  }

  const nextTurn = () => {
      socket.emit('next');
      if (diceRolled) {
          setAllow2houses(false);
          updateGameState({diceRolled: false});
      }
  }

  const sozialHilfe = () => {
      socket.emit('sozialhilfe');
  }

  const credit = () => {
    updateGameState({currentView: "credit"});
  }

  const showdeed = (i) => {
    updateGameState({showPropertyCard: i});
  };

  const hidedeed = () => {
    updateGameState({showPropertyCard: 0});
  };

  useEffect(() => {
    setOwnedProperties(squares.filter(square => square.owner === playerId));
  }, [squares]);

  useEffect(() => {
    if (!socket) return;

    socket.on('addAlert', function(alertText) {
      setAlerts([...alerts, alertText]);
    })

    socket.on('buyhouse2', function(isAllowed) {
      setAllow2houses(isAllowed);
    });

    socket.on('popup', function(HTML, option, mortgage=false) {

      const doMortgage = () =>{
        socket.emit("doMortgage", selectedCheckbox);
      }

      var action = null;
      
      if (mortgage) {
        action = doMortgage;
      }
      
      option = option ? option.toLowerCase() : "";

      if (option === "ja/nein") {
        if (window.confirm(HTML)) {
          action();
        }
      // Ok
      } else if (option !== "blank") {
          alert(HTML);
          action();
      }
    })

    return () => {
      socket.off('updateDice');
      socket.off('addAlert');
      socket.off('buyhouse2');
      socket.off('popup');
    }
  }, []);

    return (
        <div id="control">
      <table>
        <tbody>
        <tr>
          <td style={{textAlign: "left", verticalAlign: "top", border: "none"}}>

            {tab === 0 && (<div id="buy">
              <Alert alertText={alerts}/>
              {diceRolled && (<div id="landed">
                <div>Du bist auf <a href='javascript:void(0);' 
                  onMouseOver={() => showdeed(players[playerId].position)}
                  onMouseOut={hidedeed}
                  className='statscellcolor'>{squares[players[playerId].position].name}
                </a> gelandet.</div>
                {(squares[players[playerId].position].owner === 0 && squares[players[playerId].position].groupNumber === 1) ? (
                <input type='button' onclick={buy} 
                  value={`Kaufe (" + s.price + ")`}
                  title={`Kaufe ${squares[players[playerId].position].name} für ${squares[players[playerId].position].houseprice}.`}/>) : (
                <div>
                  {squares[players[playerId].position].owner !== 0 && (
                  <>{players[squares[players[playerId].position].owner].name} hat {squares[players[playerId].position].rent} Miete kassiert.</>
                  )}
                </div>
                )}
              </div>)}
            </div>)}

            {tab === 1 && (<div id="manage">
              {ownedProperties.length > 0 && selectedCheckbox !== -1 && (
              <div id="option">
                  <div id="buildings" title="Available buildings"></div>
                  { !squares[selectedCheckbox].mortgage && (
                    <div>
                    {(squares[selectedCheckbox].house === 0 || 
                    (squares[selectedCheckbox].house === 1 && allow2houses)) && 
                    (<input type="button" value="Haus kaufen" 
                    title={`Kaufe ein Haus für ${squares[selectedCheckbox].houseprice}`}
                    id="buyhousebutton" onClick={buyHouse}/>)}
                    { squares[selectedCheckbox].house >= 1 && (<input type="button" value="Haus verkaufen" 
                    title={`Verkaufe ein Haus für ${squares[selectedCheckbox].houseprice}`}
                    id="sellhousebutton" onClick={sellHouse}/>
                    )}
                    </div>
                  )}
                  { squares[selectedCheckbox].house === 0 && 
                  (<input type="button" 
                    value = {squares[selectedCheckbox].mortgage ? 
                      "Hypothek zurückzahlen" : 
                      ("Hypothek ($" + squares[selectedCheckbox].price + ")")} 
                    title = {squares[selectedCheckbox].mortgage ? 
                      "Hypothek auf " + squares[selectedCheckbox].name + " für " + squares[selectedCheckbox].price + " zurückzahlen." : 
                      "Hypothek auf " + squares[selectedCheckbox].name + " für " + squares[selectedCheckbox].price + " aufnehmen."}
                    id="mortgagebutton" onClick={mortgage}/>)}
                </div>
              )}
              <div id="owned">
                {ownedProperties.length > 0 ? (
                <table>
                  <tbody>
                  {squares.map((sq1, i) => (
                    sq1.owner === playerId && (
                    <tr key={i} className="property-cell-row">
                      <td className="propertycellcheckbox">
                        <input type="checkbox" id={`propertycheckbox${i}`} 
                        checked={selectedCheckbox === i}
                        onChange={() => setSelectedCheckbox(i)} />
                      </td>
                      <td className="propertycellcolor" style={{background: sq1.color}} onMouseOver={() => showdeed(i)} onMouseOut={hidedeed}></td>
                      <td className="propertycellname" title={sq1.mortgage ? "Hypothek aufgenommen" : ""} style={{color: "grey"}}>{sq1.name}
                        {Array.from({ length: sq1.house}).map((_, index) => (
                          <FontAwesomeIcon icon={faHouse} title="Haus" key={index} />
                        ))}
                      </td>
                    </tr>
                    )
                  ))}
                </tbody>
                </table>
                 ) :
                 (
                  <div>
                    Du besitzt keine Grundstücke.
                  </div>
                )}
              </div>
            </div>)}

          </td>
          <td style={{verticalAlign: "top", border: "none"}}>
            <div>
              {die0 > 0 && document.images && (<div id="die0" title={`Die (${die0} spots)`} className="die">
                <FontAwesomeIcon icon={ICONS[die0]} />
              </div>)}
              {die0 > 0 && !document.images && (<div id="die0" title="Die" className="die die-no-img">
                {die0}
              </div>)}
            </div>

          </td>
        </tr><tr>
          <td colSpan="2" style={{border: "none"}}>
            <div style={{paddingTop: "8px"}}>
              {turn === playerId && (<input type="button" id="nextbutton" onClick={nextTurn} title="Würfel und rücke entsprechend vor." value={!diceRolled ? "Würfeln" : "Spielzug beenden"}/>)}
              {turn === playerId && players[playerId].money < 0 && (<input type="button" id="creditbutton" onClick={credit} title="Du musst einen Kredit aufnehmen, um dein Guthaben auszugleichen." value="Kredit aufnehmen"/>)}
              {false && (<input type="button" id="resignbutton" onClick={sozialHilfe} title="Wenn du deine Schulden nicht zahlen kannst, zahlt der Staat dir Sozialhilfe." value="Sozialhilfe beziehen"/>)}
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    );
};

export default Control;