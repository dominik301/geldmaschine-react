import React from 'react';
import '../styles/Board.css';
import { useGameContext } from '../contexts/GameContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';


const Cell = ({cellId, type}) => {
  const { gameState } = useGameContext();
  const square = gameState.squares[cellId];

  var index = 0;
  return (
    <td className={`cell ${type}`} id={`cell${cellId}`}>
      <div id={`cell${cellId}anchor`} className='cell-anchor'>
        <div id={`cell${cellId}color`} className='cell-color' style={{backgroundColor: square.color}}></div>
        <div id={`cell${cellId}positionholder`} className='cell-position-holder'>
          {gameState.players.map((p, i) => (
            i > 0 && p.position === cellId && (
            <div key={i} id={`player${i}figure`} className='cell-position' title={p.name} style={{backgroundColor: p.color, left: (index * 24) % 120 + "px", top: (index++ >= 5 ? 24 : 0) + "px}"}}></div>
          )
          ))}
        </div>
        <div id={`cell${cellId}name`} className='cell-name'>{square.name}</div>
        <div id={`cell${cellId}price`} className='cell-price'>{square.pricetext}</div>
        {square.house > 0 && (
          <div id={`cell${cellId}house`} className='cell-house'>
            <FontAwesomeIcon icon={faHouse} />
          </div>
        )}
        {square.house === 2 && (
          <div id={`cell${cellId}house2`} className='cell-house2'>
            <FontAwesomeIcon icon={faHouse} />
          </div>
        )}
        {square.groupNumber > 0 && square.owner > 0 && (
          <div id={`cell${cellId}owner`} className='cell-owner' style={{backgroundColor: gameState.players[square.owner].color}} title={gameState.players[square.owner].name}></div>
        )}
      </div>
    </td>
  );
};

const Board = () => {
  return (
    <table id="board">
      <tbody>
        <tr>
          <Cell cellId={6} type="board-corner" />
          <Cell cellId={7} type="board-top" />
          <Cell cellId={8} type="board-top" />
          <Cell cellId={9} type="board-corner" />
        </tr><tr>
          <Cell cellId={5} type="board-left" />
          <td colSpan="2" type="board-center"></td>
          <Cell cellId={10} type="board-right" />
        </tr><tr>
          <Cell cellId={4} type="board-left" />
          <td colSpan="2" type="board-center"></td>
          <Cell cellId={11} type="board-right" />
        </tr><tr>
          <Cell cellId={3} type="board-corner" />
          <Cell cellId={2} type="board-bottom" />
          <Cell cellId={1} type="board-bottom" />
          <Cell cellId={0} type="board-corner" />
        </tr>
      </tbody>
    </table>
  );
};

export default Board;