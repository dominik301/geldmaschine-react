import React, { useState, useContext } from "react";
import { SocketContext } from './SocketContext';
import './Control.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive, faDiceSix, faDice} from '@fortawesome/free-solid-svg-icons';
/*
socket.on('updateOption', function(square){
  $("#buildings").hide();
});

*/
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

const Control = ({player, die0, square, turn, playerId, changeView, tab, showdeed, hidedeed}) => {
  const socket = useContext(SocketContext);

  const ICONS = {
    1:faDiceOne,
    2:faDiceTwo,
    3:faDiceThree,
    4:faDiceFour,
    5:faDiceFive,
    6:faDiceSix
  }

  var allow2houses = false;

  var alerts = ["Willkommen bei Monopoly!",
    "Du bist an der Reihe."
  ];

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

  const doMortgage = () =>{
    socket.emit("doMortgage", selectedCheckbox);
  }

  const nextTurn = () => {
      socket.emit('next');
      const nextB = document.getElementById("nextbutton");
      if (nextB.value === "Spielzug beenden") {
          allow2houses = false;
      }
  }

  const sozialHilfe = () => {
      socket.emit('sozialhilfe');
  }

  const credit = () => {
    changeView("credit");
  }

    return (
        <div id="control">
      <table>
        <tbody>
        <tr>
          <td style={{textAlign: "left", verticalAlign: "top", border: "none"}}>

            {tab === 0 && (<div id="buy">
              <Alert alertText={alerts}/>
              <div id="landed"></div>
            </div>)}

            {tab === 1 && (<div id="manage">
              <div id="option">
                <div id="buildings" title="Available buildings"></div>
                { selectedCheckbox > 0 && selectedCheckbox < 12 && !square[selectedCheckbox].mortgage && (
                  <div>
                  {(square[selectedCheckbox].house === 0 || (square[selectedCheckbox].house === 1 && allow2houses)) && (<input type="button" value="Haus kaufen" 
                  title={`Kaufe ein Haus für ${square[selectedCheckbox].houseprice}`}
                  id="buyhousebutton" onClick={buyHouse}/>)}
                  { square[selectedCheckbox].house >= 1 && (<input type="button" value="Haus verkaufen" 
                  title={`Verkaufe ein Haus für ${square[selectedCheckbox].houseprice}`}
                  id="sellhousebutton" onClick={sellHouse}/>
                  )}
                  </div>
                )}
                { selectedCheckbox > 0 && selectedCheckbox < 12 && square[selectedCheckbox].house === 0 && (<input type="button" 
                  value = {square[selectedCheckbox].mortgage ? "Hypothek zurückzahlen" : ("Hypothek ($" + square[selectedCheckbox].price + ")")} 
                  title = {square[selectedCheckbox].mortgage ? "Hypothek auf " + square[selectedCheckbox].name + " für " + square[selectedCheckbox].price + " zurückzahlen." : "Hypothek auf " + square[selectedCheckbox].name + " für " + square[selectedCheckbox].price + " aufnehmen."}
                  id="mortgagebutton" onClick={mortgage}/>)}
                
              </div>
              <div id="owned">
                <table>
                  <tbody>
                {square.map((sq1, i) => ( sq1.owner === playerId && (
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
            <div id="quickstats" >
              <div><span id="pname" >{player.name}</span>:</div>
              <div><span id="pmoney">${player.money}</span></div>
            </div>
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
              {turn === playerId && (<input type="button" id="nextbutton" onClick={nextTurn} title="Würfel und rücke entsprechend vor." value="Würfeln"/>)}
              {turn === playerId && player.money < 0 && (<input type="button" id="creditbutton" onClick={credit} title="Du musst einen Kredit aufnehmen, um dein Guthaben auszugleichen." value="Kredit aufnehmen"/>)}
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