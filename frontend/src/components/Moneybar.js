import React from 'react';
import '../styles/Moneybar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faMaximize, faMinimize } from '@fortawesome/free-solid-svg-icons';
import { useGameContext } from '../contexts/GameContext';

const Field = ({player, index, turn}) => {

  return (
    <tr id={`moneybarrow${index + 1}`} className="money-bar-row">
      <td className="moneybararrowcell">
      { turn === index + 1 && (
          <span>
          <FontAwesomeIcon id={`p${index + 1}arrow`} className="money-bar-arrow" icon={faArrowRight} />
          </span>
      )}
      </td>
      <td id={`p${index + 1}moneybar`} className="moneybarcell" style={{border: `2px solid ${player.color}`}}>
          <div>
          <span id={`p${index + 1}moneyname`}>{player.name}</span>:
          </div>
          <details>
          <summary>
          Guthaben: <span id={`p${index + 1}money`}>{player.money > 0 ? player.money : 0}</span>
          </summary>
            <div className="moneyopt">
            Kredit: <span id={`p${index + 1}credit`} className="player-credit">{-player.sumKredit}</span>
            </div>
            <div className="moneyopt">
            Dispokredit: <span id={`p${index + 1}dispocredit`} className="player-credit">{player.money > 0 ? 0 : player.money}</span>
            </div>
            <div className="moneyopt" title="Summe aus Anleihen, Derivaten und Immobilien (inkl.Häusern.)">
                verfügbare Kreditsumme: <span id={`p${index + 1}avcredit`} className="player-avcredit">{player.verfuegbareHypothek}</span>
            </div>
            <div className="moneyopt">
            Anleihen: <span id={`p${index + 1}anleihen`} className="player-anleihen">{player.anleihen}</span>
            </div>
            <div className="moneyopt">
            Derivate: <span id={`p${index + 1}derivate`} className="player-derivate">{player.derivate}</span>
            </div>
          </details>
      </td>
    </tr>
  );
};

const MoneyBar = () => {
  
  const { gameState } = useGameContext();

  return (
    <div id="moneybarwrap">
      <div id="moneybar">
        <table>
            <tbody>
            {gameState.players.map((player, index) => (
              index > 0 &&
              <Field key={index} player={player} index={index} turn={gameState.turn}/>
            ))}
          <tr id="moneybarrow7" className="money-bar-row">
            <td className="moneybararrowcell"></td>
            <td id="p7moneybar" className="moneybarcell">
              <div><span id="p7moneyname" >Bank</span>:</div>
              <div>Geldmenge: <span id="p7money">{gameState.bank.geldMenge}</span></div>
              <div>Zinsen: <span id="p7credit">{gameState.bank.zinsenLotto}</span></div>
              <div>Anleihen: <span id="p7anleihen" className="player-anleihen">{gameState.bank.anleihen}</span></div>
              <div>Derivate: <span id="p7derivate" className="player-derivate">{gameState.bank.derivate}</span></div>
            </td>
          </tr>
          <tr id="moneybarrow8" className="money-bar-row">
            <td className="moneybararrowcell"></td>
            <td id="p8moneybar" className="moneybarcell">
              <div><span id="p8moneyname" >Staat</span>:</div>
              <div>Staatsschuld: <span id="p8money" className="player-credit">{gameState.staat.staatsSchuld}</span></div>
              <div>Steuer: <span id="p8credit">{gameState.staat.steuer}</span></div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MoneyBar;