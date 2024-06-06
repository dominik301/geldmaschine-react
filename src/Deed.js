import React from 'react';

const Deed = (square) => {

    return (
    <div id="deed">
      {!square.mortgage && (<div id="deed-normal" style={{display: "none"}}>
        <div id="deed-header" style={{backgroundColor: square.color}}>
          <div style={{margin:"5px", fontSize: "11px"}}>Immobilienkarte</div>
          <div id="deed-name">{square.name}</div>
        </div>
        <table id="deed-table">
            <tbody>
          <tr>
                      <td colSpan="2">
              Grundstückswert = Summe der Baukosten
            </td>
                  </tr>
                  <tr>
                      <td style={{textAlign: "left"}}><b>Baukosten je Haus: </b></td>
            <td style={{textAlign: "right"}}><b><span id="deed-houseprice">square.houseprice</span></b></td>
                  </tr>
                  <tr style={{borderBottom: "1px solid black"}}>
                      <td colSpan="2">
              Baukosten werden sofort anteilig an alle Mitspielenden ausgezahlt.
            </td>
          </tr>
          <tr>
                      <td style={{textAlign: "left"}}><b>Miete: </b></td>
            <td style={{textAlign: "right"}}><b><span id="deed-rent">{square.rent}</span></b></td>
                  </tr>
                  <tr>
                      <td colSpan="2">
              Fällig, wenn ein Spielzug auf diesem Feld endet.
            </td>
          </tr>
          </tbody>
        </table>
      </div>)}

      {square.mortgage && (<div id="deed-mortgaged">
        <div id="deed-mortgaged-name">{square.name}</div>
        <p>&bull;</p>
        <div>Hypothek aufgenommen</div>
        <div> für <span id="deed-mortgaged-mortgage">{square.price / 2}</span></div>
        <p>&bull;</p>
        <div style={{fontStyle: "italic", fontSize: "13px", margin: "10px"}}>Karte muss mit dieser Seite nach oben liegen, wenn eine Hypothek aufgenommen wurde.</div>
      </div>)}

    </div>
    );
};

export default Deed;
