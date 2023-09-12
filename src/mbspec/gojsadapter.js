import * as go from "../gojs/go"
import * as mbspecmodel from "./model.js"

class GojsAdapter{
    diagram = null
    mbspec = null
    nodedata = null
    linkdata = null    

    constructor(nodedata, linkdata){
        let App = this
        const $ = go.GraphObject.make;
    
        this.diagram =
        $(go.Diagram, "myDiagramDiv",
        {
            "undoManager.isEnabled": false,
            layout: $(go.TreeLayout,
            { // this only lays out in trees nodes connected by "generalization" links
                isInitial: false,
                isOngoing: false,
                angle: 90,
                path: go.TreeLayout.PathSource,  // links go from child to parent
                setsPortSpot: false,  // keep Spot.AllSides for link connection spot
                setsChildPortSpot: false,  // keep Spot.AllSides
                // nodes not connected by "generalization" links are laid out horizontally
                arrangement: go.TreeLayout.ArrangementHorizontal
            })
        });
  
        // the item template for properties
        var propertyTemplate =
          $(go.Panel, "Horizontal",
            $(go.TextBlock,
                { isMultiline: false, editable: false, width: 6 },
                new go.Binding("text")
            ),
            $(go.TextBlock,
                new go.Binding("text", "derived", t => t ? "/" : "")
            ),                
            $(go.TextBlock,
                { isMultiline: false, editable: false },
                new go.Binding("text", "attribute")
            ),
            $(go.TextBlock, "",
                new go.Binding("text", "type", t => t ? ": " : "")
            ),
            $(go.TextBlock,
                { isMultiline: false, editable: false },
                new go.Binding("text", "type")
            )
        );
  
        // the item template for methods
        var methodTemplate =
          $(go.Panel, "Horizontal",
            // method visibility/access
            $(go.TextBlock,
              { isMultiline: false, editable: false, width: 6 },
              new go.Binding("text")),
            // method name, underlined if scope=="class" to indicate static method
            $(go.TextBlock,
              { isMultiline: false, editable: false },
              new go.Binding("text", "name").makeTwoWay(),
              new go.Binding("isUnderline", "scope", s => s[0] === 'c')),
            // method parameters
            $(go.TextBlock, "()",
              // this does not permit adding/editing/removing of parameters via inplace edits
              new go.Binding("text", "parameters", parr => {
                var s = "(";
                for (var i = 0; i < parr.length; i++) {
                  var param = parr[i];
                  if (i > 0) s += ", ";
                  s += param.name + ": " + param.type;
                }
                return s + ")";
              })),
            // method return type, if any
            $(go.TextBlock, "",
              new go.Binding("text", "type", t => t ? ": " : "")),
            $(go.TextBlock,
              { isMultiline: false, editable: false },
              new go.Binding("text", "type").makeTwoWay())
        );

        
        this.diagram.nodeTemplate =
            $(go.Node, "Auto", 
            {
                locationSpot: go.Spot.Center,
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, { fill: "#f2f2f2" }),
            $(go.Panel, "Table", { 
                defaultRowSeparatorStroke: "black" 
                },
                // header
                $(go.Panel, "Vertical", { name: "header" },
                    {
                        row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center
                    },
                    $(go.TextBlock,{
                        font: "9pt sans-serif",
                        isMultiline: false, editable: false
                    }, 

                    new go.Binding("text", "stereotype", this.convertStereotype)),                   
                    $(go.TextBlock,{
                        font: "bold 11pt sans-serif",
                        isMultiline: false, editable: false
                    }, new go.Binding("text", "name"))              
                ),
                // ATTRIBUTES
                $(go.TextBlock, "ATTRIBUTES",
                    { row: 1, font: "italic 9pt sans-serif" },
                    new go.Binding("visible", "visible", v => !v).ofObject("ATTRIBUTES")),
                $(go.Panel, "Vertical", { name: "ATTRIBUTES" },
                    new go.Binding("itemArray", "attributes"),
                    {
                        row: 1, margin: 3, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left, background: "#f2f2f2",
                        itemTemplate: propertyTemplate
                    }
                ),
                
                // methods
                $(go.TextBlock, "Methods",
                    { row: 2, font: "italic 10pt sans-serif" },
                    new go.Binding("visible", "visible", v => !v).ofObject("METHODS")),
                $(go.Panel, "Vertical", { name: "METHODS" },
                    new go.Binding("itemArray", "methods"),
                    {
                    row: 2, margin: 3, stretch: go.GraphObject.Fill,
                    defaultAlignment: go.Spot.Left, background: "#f2f2f2",
                    itemTemplate: methodTemplate
                    }
                )
                // ,
                // $("PanelExpanderButton", "METHODS",
                //     { row: 2, column: 1, alignment: go.Spot.TopRight, visible: false },
                //     new go.Binding("visible", "methods", arr => arr.length > 0)) 
            ),
            // four small named ports, one on each side:
            this.makePort("T", go.Spot.Top, true, true),
            this.makePort("L", go.Spot.Left, true, true),
            this.makePort("R", go.Spot.Right, true, true),
            this.makePort("B", go.Spot.Bottom, true, true),    
            {
                mouseEnter: (e, node) => this.showSmallPorts(node, true),
                mouseLeave: (e, node) => this.showSmallPorts(node, false),      
                margin: new go.Margin(5, 5),  
                selectionAdornmentTemplate: $(go.Adornment, "Auto",
                    $(go.Shape, "RoundedRectangle", { fill: null, stroke: "#C100EA", strokeWidth: 2 }),
                    $(go.Placeholder)
                )
            }    
        );


        this.diagram.linkTemplate =
        $(go.Link, 
            { 
                routing: go.Link.AvoidsNodes,
                relinkableFrom: true,
                relinkableTo: true,
                reshapable: true,
                resegmentable: false
            },
            new go.Binding("points").makeTwoWay(),
            new go.Binding("isLayoutPositioned", "relationship", this.convertIsTreeLink),
            $(go.Shape, { strokeWidth: 1.4, stroke: "#333333" }),
            $(go.Shape, { scale: 1, stroke: "#333333" }, new go.Binding("scale", "relationship", this.relationshipScale), new go.Binding("fill", "relationship", this.relationshipFill), new go.Binding("fromArrow", "relationship", this.relationshipFrom)),
            $(go.Shape, { scale: 1, stroke: "#333333" }, new go.Binding("scale", "relationship", this.relationshipScale), new go.Binding("fill", "relationship", this.relationshipFill), new go.Binding("toArrow", "relationship", this.relationshipTo)),
            $(go.TextBlock, { margin: 5, stroke: "#333333", background:"#FFFFFF", isMultiline: false, editable: false }, new go.Binding("text", "name", this.relationshipNameValue), new go.Binding("visible", "name", this.relationshipNameVisibility)),
            $(go.TextBlock, { segmentIndex: 1, segmentOffset: new go.Point(NaN, NaN), segmentOrientation: go.Link.Horizontal, stroke: "#333333", background:"#FFFFFF"}, new go.Binding("text", "components", s => s[0].cardinality), new go.Binding("visible", "components", s => s[0].cardinality_visible) ),
            $(go.TextBlock, { segmentIndex: -1, segmentOffset: new go.Point(NaN, NaN), segmentOrientation: go.Link.Horizontal, stroke: "#333333", background:"#FFFFFF"}, new go.Binding("text", "components", s => s[1].cardinality), new go.Binding("visible", "components", s => s[1].cardinality_visible) ),
            $(go.TextBlock, { segmentIndex: 1, segmentOffset: new go.Point(7, 19), stroke: "#333333", background:"#FFFFFF"}, new go.Binding("text", "components", s => s[0].role ), new go.Binding("visible", "components", s => s[0].role_visible) ),    
            $(go.TextBlock, { segmentIndex: 4, segmentOffset: new go.Point(4, 15), stroke: "#333333", background:"#FFFFFF"}, new go.Binding("text", "components", s => s[1].role ), new go.Binding("visible", "components", s => s[1].role_visible) )
        );


        this.diagram.model = new go.GraphLinksModel({
            copiesArrays: true,
            copiesArrayObjects: true,
            nodeDataArray: nodedata,
            linkDataArray: linkdata
        });
        this.diagram.addDiagramListener("ObjectSingleClicked", function(e){
            const part = e.subject.part;
            const nodeData = part.data;
            if (part instanceof go.Node)
                App.classSelected(nodeData.id)
            else if (part instanceof go.Link){
                if(nodeData.relationship == "generalization")
                    App.extensionSelected(nodeData.id)
                else
                    App.associationSelected(nodeData.id)
            }
            else
                App.nothingSelected()
        });
        this.diagram.addDiagramListener("ObjectDoubleClicked", function(e){
            const part = e.subject.part;
            const nodeData = part.data;
            if (part instanceof go.Node)
                App.classSelectedToEditNow(nodeData.id)
        });        
        this.diagram.addDiagramListener("BackgroundSingleClicked", function(e){
            if (e.subject === null) {
                // Background was clicked
                App.nothingSelected()                
            }
        });    
        this.diagram.addDiagramListener("SelectionMoved", function(e){
            App.diagram.clearSelection()
            App.nothingSelected()
        });
        this.diagram.addDiagramListener("LinkDrawn", function(e){     
            const part = e.subject.part;  
            const linkData = part.data;
            if (part instanceof go.Link) {
                App.nothingSelected()
                App.diagram.startTransaction("link updated")
                linkData.key = App.newToken()
                linkData.id = linkData.key
                linkData.name = ""
                linkData.name_visible = false
                linkData.relationship = "association"

                if(App.getLinkOption() == "GENERALIZATION")
                    linkData.relationship = "generalization"

                linkData.components = [
                    {
                      "role": "",
                      "cardinality": "",
                      "cardinality_visible": false,
                      "role_visible": false
                    },
                    {
                        "role": "",
                        "cardinality": "",
                        "cardinality_visible": false,
                        "role_visible": false
                    }                    
                ]
                App.diagram.updateAllTargetBindings()
                App.diagram.commitTransaction("link updated")
                App.diagram.updateAllTargetBindings()
                App.diagram.updateAllRelationshipsFromData()
                if(App.getLinkOption() == "GENERALIZATION")
                    App.addExtension(part.fromNode.data, part.toNode.data, linkData)
                else
                    App.addAssociation(part.fromNode.data, part.toNode.data, linkData)
            }
        });
        this.diagram.addDiagramListener("SelectionDeleted", function(e){
            let itemsToBeDeleted = e.subject.toArray()
            itemsToBeDeleted.forEach( item => {
                const part = item.part;
                const nodeData = part.data;
                if (part instanceof go.Node)
                    App.deleteClass(nodeData.id)
                else if (part instanceof go.Link){
                    if(nodeData.relationship == "generalization")
                        App.deleteExtension(nodeData.id)
                    else
                        App.deleteAssociation(nodeData.id)
                }
            })
            App.nothingSelected()
        });


        this.diagram.addChangedListener(function(evt){
        });
        this.diagram.addModelChangedListener(function(event) {
        });


        this.disableLayout()
    }
    disableLayout() {
        this.diagram.layout.isOngoing = false;
        //this.diagram.layoutDiagram(true);        
    }
    enableLayout() {
        this.diagram.layout.isOngoing = true;
        //this.diagram.layoutDiagram(true);        
    }
    convertStereotype(r) {
        if(r!==null && r!="")
            return "<<"+r+">>"
        else
            return ""
    }      
    convertIsTreeLink(r) {
        return r === "generalization";
    }     
    relationshipFrom(r) {
        switch (r) {
            case "generalization": return "";
            case "aggregation": return "Diamond";
            case "composition": return "Diamond";
            default: return "";
        }
    }
    relationshipTo(r) {
        switch (r) {
            case "generalization": return "Triangle";
            case "aggregation": return "";
            default: return "";
        }
    }
    relationshipFill(r) {
        switch (r) {
            case "aggregation": return "#FFFFFF";
            case "generalization": return "#FFFFFF";
            case "composition": return "#333333";
            default: return "";
        }
    }
    relationshipScale(r) {
        switch (r) {
            case "generalization": return 1.3;
            case "aggregation": return 1.7;
            case "composition": return 1.7;
            default: return "";
        }

    }
    relationshipName(r) {
        if(typeof(r) == "string")
            return r
        else
            return ""
    }    
    relationshipNameVisibility(r) {
        if(r=="")
            return false
        else
            return true
    }
    relationshipComponentVisibilityFrom(r) {
        switch (r) {
            case "generalization": return false;
            case "composition": return false;
            case "aggregation": return false;
            default: return true;
        }
    }
    relationshipComponentVisibilityTo(r) {
        switch (r) {
            case "generalization": return false;
            case "composition": return true;
            case "aggregation": return true;
            default: return true;
        }
    }
    showSmallPorts(node, show) {
        node.ports.each(port => {
            if (port.portId !== "") {  // don't change the default port, which is the big shape
                port.fill = show ? "rgba(193, 0, 234, 0.7)" : null;
            }
        });
    }    
    makePort(name, spot, output, input) {
        // the port is basically just a small transparent square
        return go.GraphObject.make(go.Shape, "Circle",
        {
            fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
            stroke: null,
            desiredSize: new go.Size(10, 10),
            alignment: spot,  // align the port on the main Shape
            alignmentFocus: spot,  // just inside the Shape
            portId: name,  // declare this object to be a "port"
            fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
            fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
            cursor: "pointer"  // show a different cursor to indicate potential link point
        });
    }
    setMBSpec(value){
        this.mbspec = value
    }
    newToken(){
        const rand = () => {
            return Math.random().toString(36).substr(2);
        };
        return rand() + rand();
    }   
    nothingSelected(){
        this.mbspec.nothingSelected()
    }
    classSelected(id){
        this.mbspec.classSelected(id)
    }
    classSelectedToEditNow(id){
        this.mbspec.classSelectedToEditNow(id)
    }    
    associationSelected(id){
        this.mbspec.associationSelected(id)
    }
    extensionSelected(id){
        this.mbspec.extensionSelected(id)
    }   
    deleteClass(id){
        this.mbspec.deleteClass(id)
    }
    deleteAssociation(id){
        this.mbspec.deleteAssociation(id)
    }
    deleteExtension(id){
        this.mbspec.deleteExtension(id)
    }
    addAssociation(fromNode, toNode, linkData){
        this.mbspec.addAssociation(fromNode.name, toNode.name, linkData.id)
    }
    addExtension(fromNode, toNode, linkData){
        this.mbspec.addExtension(fromNode.name, toNode.name, linkData.id)
    }

    addClass(newClass){
        const newNodePosition = this.computeNewNodePosition()
        this.addClassWithLocation(newClass, newNodePosition)
    }
    addClassWithLocation(newClass, position) {      
        this.diagram.startTransaction("new node")
        
        newClass.key = newClass.id
        this.diagram.model.addNodeData(newClass)
        this.diagram.model.set(newClass, "loc", go.Point.stringify(position))

        this.diagram.commitTransaction("new node")
        this.diagram.updateAllTargetBindings()

        const newNode = this.diagram.findNodeForData(newClass)
        if(newNode!==null){
            this.diagram.centerRect(newNode.actualBounds)
            this.diagram.select(newNode)

            this.classSelected(newNode.data.id)
        }
    }
    updateClass(modifiedClass) {
        this.diagram.startTransaction("node updated")
        let nodeToModify
        this.diagram.nodes.each(function(item){
            const data = item.data
            const id = data.id
            if(id == modifiedClass.id){
                nodeToModify = item
            }
        })

        if(nodeToModify !== null){
            this.diagram.model.set(nodeToModify.data, "name", modifiedClass.name)
            this.diagram.model.set(nodeToModify.data, "stereotype", modifiedClass.stereotype)
            this.diagram.model.set(nodeToModify.data, "attributes", modifiedClass.attributes)
            this.diagram.model.set(nodeToModify.data, "operations", modifiedClass.operations)
        }
        this.diagram.model.setKeyForNodeData(modifiedClass, modifiedClass.id)

        this.diagram.updateAllTargetBindings()        
        this.diagram.commitTransaction("node updated")
    }
    updateAssociation(modifiedAssociation) {
        this.diagram.startTransaction("link updated")
        let linkDataToModify
        this.diagram.links.each(function(link){
            const linkData = link.data
            const id = linkData.id
            if(id == modifiedAssociation.id){
                linkDataToModify = linkData
            }
        })
        if(linkDataToModify !== null){
            linkDataToModify.name = modifiedAssociation.association
            linkDataToModify.relationship = modifiedAssociation.type

            linkDataToModify.components[0].cardinality = modifiedAssociation.participants[0].cardinality
            if(modifiedAssociation.participants[0].cardinality=="")
                linkDataToModify.components[0].cardinality_visible = false
            else
                linkDataToModify.components[0].cardinality_visible = true

            linkDataToModify.components[0].role = modifiedAssociation.participants[0].role
            if(modifiedAssociation.participants[0].role=="")
                linkDataToModify.components[0].role_visible = false
            else
                linkDataToModify.components[0].role_visible = true   
                
            linkDataToModify.components[1].cardinality = modifiedAssociation.participants[1].cardinality
            if(modifiedAssociation.participants[1].cardinality=="")
                linkDataToModify.components[1].cardinality_visible = false
            else
                linkDataToModify.components[1].cardinality_visible = true

            linkDataToModify.components[1].role = modifiedAssociation.participants[1].role
            if(modifiedAssociation.participants[1].role=="")
                linkDataToModify.components[1].role_visible = false
            else
                linkDataToModify.components[1].role_visible = true               
        }

        this.diagram.commitTransaction("link updated")
        this.diagram.updateAllTargetBindings()

    }
    computeNewNodePosition() {
        // Get the last existing node in the diagram
        let lastNode = null
        this.diagram.nodes.each((node) => {
            lastNode = node
        })
        if (lastNode) {
            // If there is a last node, position the new node below it
            const lastNodeBounds = lastNode.actualBounds
            const x = lastNodeBounds.x
            const y = lastNodeBounds.y + lastNodeBounds.height + 100
            return new go.Point(x, y)
        } 
        else {
            // If there are no existing nodes, position the new node at the origin (0, 0)
            return new go.Point(0, 0)
        }
    }    
    getLinkOption(){
        return this.mbspec.getLinkOption()
    }
    syncMBSPECWithDiagramJson(value_parsed){
        // First: clear the semantic model, wich includes the alloy model
        this.mbspec.clearModel()

        // Second: 
        // - iterate over each nodeDataArray item to create a new class in the semantic model
        // - create list of classes with name and id
        let listOfClassesWithId = []
        value_parsed.nodeDataArray.forEach(data => {
            let attributes = []
            if(data.attributes!=null){
                data.attributes.forEach(item => {
                    attributes.push(this.mbspec.attributeToJson(item.attribute, item.type, item.derived))
                })
            }
            this.mbspec.addClassFromDiagram(data.id, data.name, attributes, null, data.stereotype, null, data.extension)
            listOfClassesWithId.push({"id": data.id, "name": data.name})
        })
        console.log(listOfClassesWithId)

        // Third: iterate over each link andData to create either generalization or association, according to the "relationship" attribute value
        value_parsed.linkDataArray.forEach(data => {
            let from = data.from
            let to = data.to

            listOfClassesWithId.forEach(item => {
                if(item.id == data.from)
                    from = item.name
                if(item.id == data.to)
                    to = item.name
            })
            if(data.relationship == "generalization")
                this.mbspec.addExtension(from, to, data.id)
            else{
                const participants = []
                participants.push( new mbspecmodel.MBSpecAssociationParticipant(from, data.components[0].role, data.components[0].cardinality, false) )
                participants.push( new mbspecmodel.MBSpecAssociationParticipant(to, data.components[1].role, data.components[1].cardinality, false) )
                
                const newAssociation = new mbspecmodel.MBSpecAssociation(data.id, data.name, data.relationship, participants, null)    
                console.log(newAssociation)
                this.mbspec.addAssociationWithClass(newAssociation)                
            }

        })        
    }
    exportToJson(){
        this.diagram.model.modelData.position = go.Point.stringify(this.diagram.position)
        return this.diagram.model.toJson()
    }
    loadFromJson(value){
        const value_parsed = JSON.parse(value)
        this.diagram.model = go.Model.fromJson(value)
        this.syncMBSPECWithDiagramJson(value_parsed)   
    }    

}
    
    
export { GojsAdapter }