import { Atenea } from "./mbspec/atenea.js";

const data = document.currentScript.dataset;


const App = new Atenea(data)
App.load()
