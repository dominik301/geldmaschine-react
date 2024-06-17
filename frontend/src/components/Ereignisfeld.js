import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import '../styles/Ereignisfeld.css';

const Ereignisfeld = ({text, title}) => {
    
    return (
        <div>
        <div id="popupbackground"></div>
        <div id="popupwrap">
            <div id="popup" style={{width: "300px", top: "0px", left: "0px"}}>
            <div style={{position: "relative"}}>
                <div id="popuptext">
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
                <div id="popupdrag"></div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default Ereignisfeld;
