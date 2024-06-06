import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark , faHouse, faMotorcycle, faSailboat, faCar } from '@fortawesome/free-solid-svg-icons';

const Stats = ({players, squares, showdeed, hidedeed}) => {

    return (
    <div>
      <div id="statsbackground"></div>
      <div id="statswrap">
        <div id="stats">
          <div style={{position: "relative"}}>
            <span id="statsclose" title="Schließen"><FontAwesomeIcon icon={faCircleXmark} /></span>
            <div id="statstext"></div>
            <table align="center">
                <tbody>
                  <tr>
                  {players.map((player, index) => (
                    <td key={index} className='statscell' id={`statscell${index + 1}`} style={{border: `2px solid ${player.color}`}} >
                      <div className='statsplayername'> {player.name} </div>
                        <table><tbody>
                        {squares.map((sq, i) => (
                          sq.owner === index + 1 && (
                            <tr key={i} >
                              <td className='statscellcolor' style={{background: sq.color}} onMouseOver={() => showdeed(i)} onMouseOut={hidedeed} ></td>
                              <td className='statscellname'>{sq.name}
                              {sq.house > 0 && (
                                <span style={{float: "right", fontWeight: "bold"}}
                                  title={sq.mortgage ? 'Hypothek aufgenommen' : ''}>{sq.house}
                                  &nbsp;&nbsp;<FontAwesomeIcon icon={faHouse} title='House' class='house' style={{float: "none"}} />
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
                        {player.motorrad && (
                          <span><FontAwesomeIcon icon={faMotorcycle} /></span>
                        )}
                        {player.yacht && (
                          <span><FontAwesomeIcon icon={faSailboat} /></span>
                        )}
                        {player.auto && (
                          <span><FontAwesomeIcon icon={faCar} /></span>
                        )}
                    </td>
                  ))}
                  </tr>
                </tbody>
            </table>
            <div id='titledeed'></div>
            <div id="statsdrag"></div>
          </div>
        </div>
      </div>
    </div>
    );
}

export default Stats;
