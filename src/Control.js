import React, { useState, useContext, useEffect } from "react";
import { SocketContext } from './SocketContext';
import './Control.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive, faDiceSix} from '@fortawesome/free-solid-svg-icons';
import { useGameContext } from './GameContext';

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
  const { gameState, updateGameState } = useGameContext();
  const player = gameState.players[gameState.playerId];
  const [die0, setDie0] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [allow2houses, setAllow2houses] = useState(false);

  const ICONS = {
    1:faDiceOne,
    2:faDiceTwo,
    3:faDiceThree,
    4:faDiceFour,
    5:faDiceFive,
    6:faDiceSix
  }

  const [selectedCheckbox, setSelectedCheckbox] = useState(null);

  const buyHouse = () => {  
    socket.emit('buyhouse', selectedCheckbox);
  }

  const mortgage = () => {
    socket.emit('mortgage', selectedCheckbox);           
  }

  const sellHouse = () => {    
    socket.emit('sellhouse', selectedCheckbox);
  }

  const nextTurn = () => {
      socket.emit('next');
      const nextB = document.getElementById("nextbutton");
      if (nextB.value === "Spielzug beenden") {
          setAllow2houses(false);
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
    if (!socket) return;

    socket.on('updateDice', function(die){
      var snd = new Audio("short-dice-roll.wav"); // buffers automatically when created
      snd.play();
    
      setTimeout(() => { setDie0(die);}, 500);
    });

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

            {gameState.tab === 0 && (<div id="buy">
              <Alert alertText={alerts}/>
              <div id="landed"></div>
            </div>)}

            {gameState.tab === 1 && (<div id="manage">
              <div id="option">
                <div id="buildings" title="Available buildings"></div>
                { selectedCheckbox > 0 && selectedCheckbox < 12 && !gameState.squares[selectedCheckbox].mortgage && (
                  <div>
                  {(gameState.squares[selectedCheckbox].house === 0 || 
                  (gameState.squares[selectedCheckbox].house === 1 && allow2houses)) && 
                  (<input type="button" value="Haus kaufen" 
                  title={`Kaufe ein Haus für ${gameState.squares[selectedCheckbox].houseprice}`}
                  id="buyhousebutton" onClick={buyHouse}/>)}
                  { gameState.squares[selectedCheckbox].house >= 1 && (<input type="button" value="Haus verkaufen" 
                  title={`Verkaufe ein Haus für ${gameState.squares[selectedCheckbox].houseprice}`}
                  id="sellhousebutton" onClick={sellHouse}/>
                  )}
                  </div>
                )}
                { selectedCheckbox > 0 && selectedCheckbox < 12 && gameState.squares[selectedCheckbox].house === 0 && 
                (<input type="button" 
                  value = {gameState.squares[selectedCheckbox].mortgage ? 
                    "Hypothek zurückzahlen" : 
                    ("Hypothek ($" + gameState.squares[selectedCheckbox].price + ")")} 
                  title = {gameState.squares[selectedCheckbox].mortgage ? 
                    "Hypothek auf " + gameState.squares[selectedCheckbox].name + " für " + gameState.squares[selectedCheckbox].price + " zurückzahlen." : 
                    "Hypothek auf " + gameState.squares[selectedCheckbox].name + " für " + gameState.squares[selectedCheckbox].price + " aufnehmen."}
                  id="mortgagebutton" onClick={mortgage}/>)}
                
              </div>
              <div id="owned">
                <table>
                  <tbody>
                {gameState.squares.map((sq1, i) => ( sq1.owner === gameState.playerId && (
                  <tr className="property-cell-row">
                    <td className="propertycellcheckbox">
                      <input type="checkbox" id={`propertycheckbox${i}`} 
                      checked={selectedCheckbox === i}
                      onChange={() => setSelectedCheckbox(i)} />
                    </td>
                    <td className="propertycellcolor" style={{background: sq1.color}} onMouseOver={showdeed(i)} onMouseOut={hidedeed}></td>
                    <td className="propertycellname" title={sq1.mortgage ? "Hypothek aufgenommen" : ""} style={{color: "grey"}}>{sq1.name}
                      {Array.from({ length: sq1.house}).map((_, index) => (
                        <FontAwesomeIcon icon={faHouse} title="Haus" key={index} />
                      ))}
                    </td>
                  </tr>
                )))}
                </tbody>
                </table>
                {true && (
                  <div>
                    {player.name}, du besitzt keine Grundstücke.
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
              {gameState.turn === gameState.playerId && (<input type="button" id="nextbutton" onClick={nextTurn} title="Würfel und rücke entsprechend vor." value="Würfeln"/>)}
              {gameState.turn === gameState.playerId && player.money < 0 && (<input type="button" id="creditbutton" onClick={credit} title="Du musst einen Kredit aufnehmen, um dein Guthaben auszugleichen." value="Kredit aufnehmen"/>)}
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