import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
window.setTimeout(() => {
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById("root")
    );
}, 1500);
reportWebVitals();
