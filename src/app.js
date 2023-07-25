import { MBSpec } from "./mbspec/mbspec.js";
import { GojsAdapter } from "./mbspec/gojsadapter.js";

const data = document.currentScript.dataset;



// var nodedata = [
//     {
//       key: 1,
//       id: "idNice1",
//       name: "BankAccount",
//       __gohashid: "",
//       loc: "0 0",
//       attributes: [
//         { attribute: "owner", type: "String" },
//         { attribute: "balance", type: "Currency", default: "0" }
//       ],
//       methods: [
//         { attribute: "deposit", parameters: [{ name: "amount", type: "Currency" }]},
//         { attribute: "withdraw", parameters: [{ name: "amount", type: "Currency" }] }
//       ]
//     },
//     {
//       key: 11,
//       id: "idNice2",
//       name: "Person",
//       __gohashid: "id2",
//       loc: "0 0",      
//       attributes: [
//         { attribute: "name", type: "String" },
//         { attribute: "birth", type: "Date" }
//       ],
//       methods: [
//         { attribute: "getCurrentAge", type: "int" }
//       ]
//     },
//     {
//       key: 12,
//       id: "idNice3",
//       name: "Student",
//       __gohashid: "id3",
//       loc: "0 0",      
//       attributes: [
//         { attribute: "classes", type: "List<Course>" }
//       ],
//       methods: [
//         { attribute: "attend", parameters: [{ name: "class", type: "Course" }] },
//         { attribute: "sleep" }
//       ]
//     },
//     {
//       key: 13,
//       id: "idNice4",
//       name: "Professor",
//       __gohashid: "id4",
//       loc: "0 0",      
//       attributes: [
//         { attribute: "classes", type: "List<Course>" }
//       ],
//       methods: [
//         { attribute: "teach", parameters: [{ name: "class", type: "Course" }] }
//       ]
//     },
//     {
//       key: 14,
//       id: "idNice5",
//       name: "Course",
//       __gohashid: "id5",
//       loc: "0 0",      
//       attributes: [
//         { attribute: "name", type: "String" },
//         { attribute: "description", type: "String" },
//         { attribute: "professor", type: "Professor" },
//         { attribute: "location", type: "String" },
//         { attribute: "times", type: "List<Time>" },
//         { attribute: "prerequisites", type: "List<Course>" },
//         { attribute: "students", type: "List<Student>" }
//       ]
//     }
// ];
// var linkdata = [
//     { id: "a1", from: 12, to: 11, relationship: "generalization", "name": "asuno", "components": [{"role": "", "cardinality": "", "cardinality_visible": false, "role_visible": false}, {"role": "", "cardinality": "", "cardinality_visible": false, "role_visible": false}] },
//     { id: "a2", from: 13, to: 11, relationship: "association", "name": "asdos", "components": [{"role": "from", "cardinality": "1", "cardinality_visible": true, "role_visible": true}, {"role": "to", "cardinality": "*", "cardinality_visible": true, "role_visible": true}] },
//     { id: "a3", from: 13, to: 14, relationship: "aggregation", "name": "astres", "components": [{"role": "from", "cardinality": "1", "cardinality_visible": false, "role_visible": false}, {"role": "to", "cardinality": "*", "cardinality_visible": true, "role_visible": true}] },
//     { id: "a4", from: 1, to: 12, relationship: "composition", "name": "ascuatro", "components": [{"role": "from", "cardinality": "1", "cardinality_visible": false, "role_visible": false}, {"role": "to", "cardinality": "*", "cardinality_visible": true, "role_visible": true}] }
// ];

var nodedata = []
var linkdata = []
let gojsAdapter = new GojsAdapter(nodedata, linkdata)
let App = new MBSpec(gojsAdapter, data)
gojsAdapter.setMBSpec(App)
gojsAdapter.syncDiagramWithModel()


//window.addEventListener('DOMContentLoaded', startApp);
