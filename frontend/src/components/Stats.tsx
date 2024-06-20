import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark , faHouse, faMotorcycle, faSailboat, faCar } from '@fortawesome/free-solid-svg-icons';
import { useGameContext } from '../contexts/GameContext.tsx';
import '../styles/Stats.css';

const Stats = () => {
  const { gameState, updateGameState } = useGameContext();

  const showdeed = (index) => {
    updateGameState({showPropertyCard: index});
  }

  const hidedeed = () => {
    updateGameState({showPropertyCard: 0});
  }

    return (
      <dialog id="statswrap">
        <div id="stats" className="popup">
          <div style={{position: "relative"}}>
            <table className="popuptext" align="center">
                <tbody>
                  <tr>
                  {gameState.players.map((player, index) => (
                    index > 0 && (
                    <td key={index} className='statscell' id={`statscell${index}`} style={{border: `2px solid ${player.color}`}} >
                      <div className='statsplayername'> {player.name} </div>
                        <table><tbody>
                        {gameState.squares.map((sq, i) => (
                          sq.owner === index && (
                            <tr key={i} >
                              <td className='statscellcolor' style={{background: sq.color}} onMouseOver={() => showdeed(i)} onMouseOut={hidedeed} ></td>
                              <td className='statscellname'>{sq.name}
                              {sq.house > 0 && (
                                <span style={{float: "right", fontWeight: "bold"}}
                                  title={sq.mortgage ? 'Hypothek aufgenommen' : ''}>{sq.house}
                                  &nbsp;&nbsp;<FontAwesomeIcon icon={faHouse} title='House' className='house' style={{float: "none"}} />
                                </span>
                              )}
                              </td>
                            </tr>
                          )
                        ))}
                        </tbody></table>
                        {false && (
                          <div>
                            {player.name} hat keine Grundstücke.
                          </div>
                        )}
                        {player.motorrad > 0 && (
                          <span><FontAwesomeIcon icon={faMotorcycle} /></span>
                        )}
                        {player.yacht > 0 && (
                          <span><FontAwesomeIcon icon={faSailboat} /></span>
                        )}
                        {player.auto > 0 && (
                          <span><FontAwesomeIcon icon={faCar} /></span>
                        )}
                    </td>
                  )
                  ))}
                  </tr>
                </tbody>
            </table>
          </div>
          <form method="dialog">
            <button autoFocus>Schließen</button>
          </form>
        </div>
      </dialog>
    );
}

export default Stats;
