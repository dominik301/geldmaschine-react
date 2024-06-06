import React from 'react';
import './Board.css';

const Cell = ({id, square, player}) => {
  var index = 0;
  return (
    <td className="cell" id={`cell${id}`}>
      <div id={`cell${id}anchor`} className='cell-anchor'>
        <div id={`cell${id}color`} className='cell-color' style={{backgroundColor: square.color}}></div>
        <div id={`cell${id}positionholder`} className='cell-position-holder'>
          {player.map((p, i) => (
            p.position === id && (
            <div id={`player${i+1}figure`} className='cell-position' title={p.name} style={{backgroundColor: p.color, left: (index * 24) % 120 + "px", top: (index++ >= 5 ? 24 : 0) + "px}"}}></div>
          )
          ))}
        </div>
        <div id={`cell${id}name`} className='cell-name'>{square.name}</div>
        <div id={`cell${id}price`} className='cell-price'>{square.pricetext}</div>
        {square.house && (
          <div id={`cell${id}house`} className='cell-house'></div>
        )}
        {square.house === 2 && (
          <div id={`cell${id}house2`} className='cell-house2'></div>
        )}
        {square.groupNumber && square.owner > 0 && (
          <div id={`cell${id}owner`} className='cell-owner' style={{backgroundColor: player[square.owner].color}} title={player[square.owner].name}></div>
        )}
      </div>
    </td>
  );
};

const Board = ({squares, player}) => {

  return (
    <div>
      <table id="board">
        <tbody>
          <tr>
            <Cell id="6" className="board-corner" square={squares[6]} player={player}/>
            <Cell id="7" className="board-top" square={squares[7]} player={player}/>
            <Cell id="8" className="board-top" square={squares[8]} player={player}/>
            <Cell id="9" className="board-corner" square={squares[9]} player={player}/>
          </tr><tr>
            <Cell id="5" className="board-left" square={squares[5]} player={player}/>
            <td colSpan="2" className="board-center"></td>
            <Cell id="10" className="board-right" square={squares[10]} player={player}/>
          </tr><tr>
            <Cell id="4" className="board-left" square={squares[4]} player={player}/>
            <td colSpan="2" className="board-center"></td>
            <Cell id="11" className="board-right" square={squares[11]} player={player}/>
          </tr><tr>
            <Cell id="3" className="board-corner" square={squares[3]} player={player}/>
            <Cell id="2" className="board-bottom" square={squares[2]} player={player}/>
            <Cell id="1" className="board-bottom" square={squares[1]} player={player}/>
            <Cell id="0" className="board-corner" square={squares[0]} player={player}/>
          </tr>
        </tbody>
      </table>
      <div id="enlarge-wrap">
        {squares.map((square, i) => (
          <div key={i} id={`enlarge${i}`} className='enlarge'>
            <div id={`enlarge${i}color`} className='enlarge-color' style={{backgroundColor: square.color}}></div><br />
            <div id={`enlarge${i}name`} className='enlarge-name'>{square.name}</div><br />
            <div id={`enlarge${i}price`} className='enlarge-price'>{square.pricetext}</div><br />
            <div id={`enlarge${i}token`} className='enlarge-token'></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;