import React from "react";
import { render } from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";

import './instrumentation';

import { App } from "./todo/app";
import "todomvc-app-css/index.css";

render(
    <HashRouter>
        <Routes>
            <Route path="*" element={<App />} />
        </Routes>
    </HashRouter>,
    document.getElementById("root")
);
