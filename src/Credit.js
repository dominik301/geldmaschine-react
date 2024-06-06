import React from 'react';

const kredit = document.getElementById('credit-leftp-money');

kreditaufnehmenHandler = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();

    if (isNaN(document.getElementById("credit-leftp-money").value)) {
        document.getElementById("credit-leftp-money").value = "Bitte eine Zahl eingeben.";
        document.getElementById("credit-leftp-money").style.color = "red";
        return false;
    }

    var money = kredit.value;

    if (!confirm(document.getElementById("player" + playerId + "name").innerHTML + ", möchtest Du wirklich einen Kredit aufnehmen?")) {
        return false;
    }
    
    socket.emit('kreditaufnehmen', money);

    kredit.value = "0";
}

kredittilgenHandler = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();

    if (isNaN(document.getElementById("credit-leftp-money").value)) {
        document.getElementById("credit-leftp-money").value = "Bitte eine Zahl eingeben.";
        document.getElementById("credit-leftp-money").style.color = "red";
        return false;
    }

    if (!confirm(document.getElementById("player" + playerId + "name").innerHTML + ", möchtest Du wirklich deinen Kredit tilgen?")) {
        return false;
    }
    socket.emit('kredittilgen', kredit.value);
        
    kredit.value = "0";
}

const Credit = ({changeView}) => {
  const cancelkredit = () => {
    changeView("board");

    //$('#icon-bar a.active').removeClass('active');
    //$("#logicon").addClass('active');
  };

    return (
    <div id="credit">
      <table style={{borderSpacing: "3px"}}>
        <tr>
          <td className="credit-cell">
            <div id="credit-leftp-name"></div>
          </td>
        </tr>
        <tr>
          <td className="credit-cell">
            $&nbsp;<input id="credit-leftp-money" value="0" type="number" title="Gewünschte Höhe des Kredits eingeben." />
          </td>
        </tr>
        <tr>
          <td colspan="2" className="credit-cell">
            <input type="button" id="kreditaufnehmenbutton" value="Kredit aufnehmen" title="Kredit aufnehmen." onChange={kreditaufnehmenHandler()} />
            <input type="button" id="kredittilgenbutton" value="Kredit tilgen" title="Kredit tilgen." onClick={kredittilgenHandler()} />
            <input type="button" id="kreditcancelbutton" value="Schließen" onClick={cancelkredit} title="Fenster schließen." />
          </td>
        </tr>
      </table>
    </div>
    );
}

export default Credit;