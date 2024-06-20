import * as React from 'react';

export default function FormDialog({setName}) {

  return (
    <dialog id="namedialog">
        <div id="popup" className="popup" style={{width: "300px", minWidth: "300px", top: "30vh"}}>
            <div className="popuptext">
                <h3>Gib deinen Namen ein</h3>
                <input type="text" id="name" name="name" placeholder="Name" required />
            </div>
            <form method="dialog">
                <button onClick={() => {setName(document.getElementById("name").value); document.getElementById("namedialog").close()}} autoFocus>OK</button>
            </form>
        </div>
    </dialog>
  );
}