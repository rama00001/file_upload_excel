import React, { useEffect, useState } from "react";
import "./app.scss";
// Components
import SignInPage from "./components/LoginPage";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";

function App() {

  return (
    <Router>
      <div className="app">
        <main className="content">
          <div className="container">
            <SignInPage></SignInPage>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
