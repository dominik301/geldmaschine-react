import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';

const Ereignisfeld = ({text, title}) => {
    
    return (
        <dialog id="ereignisfeld">
            <div id="popup" className="popup" style={{width: "300px", minWidth: "300px", top: "30vh"}}>
                <div className="popuptext">
                    <FontAwesomeIcon icon={faQuestion} style={{
                        fontSize: "xx-large",
                        height: "1em",
                        width: "1em",
                        float: "left",
                        margin: "8px 8px 8px 0px"
                     }}/>
                     <h3>
                    {title}
                    </h3>
                    <p style={{textAlign: "justify"}}>{text}</p>
                </div>
                <form method="dialog">
                    <button autoFocus>Schließen</button>
                </form>
            </div>
        </dialog>
    );
}

export default Ereignisfeld;
