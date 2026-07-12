import React from "react";
import ReactDOM from "react-dom/client";
import "maplibre-gl/dist/maplibre-gl.css";
import { App } from "./App";
import { ownScrollRestoration } from "./lib/urlState";
import "./styles/base.css";

ownScrollRestoration(window.history);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
