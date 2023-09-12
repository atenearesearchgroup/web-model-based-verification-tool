import { MBSpec } from "./mbspec.js";
import { GojsAdapter } from "./gojsadapter.js";

export class Atenea {
    data = []
    nodedata = []
    linkdata = []

    constructor(data){
        this.data = data
    }

    setNodedata(nodedata){
        this.nodedata = nodedata
    }
    setLinkdata(linkdata){
        this.linkdata = linkdata
    }
    getNodedata(){
        return this.nodedata
    }
    getLinkdata(){
        return this.linkdata
    }
    load(){
        let gojsAdapter = new GojsAdapter(this.getNodedata(), this.getLinkdata())
        let mbspec = new MBSpec(gojsAdapter, this.data)
        gojsAdapter.setMBSpec(mbspec)
        gojsAdapter.syncMBSPECWithDiagramJson({"nodeDataArray": this.getNodedata(), "linkDataArray": this.getLinkdata()})
    }


}