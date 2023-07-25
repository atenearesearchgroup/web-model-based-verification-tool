import { Graphviz } from "@hpcc-js/wasm/graphviz";
import $ from "../jquery/src/jquery.js"
import {MBSpecUMLModel} from "./models.js"


export class MBSpecGraph{

    graphheader = ""
    graphviz = undefined
    dotText = undefined
    umlmodel = new MBSpecUMLModel()
    instances = undefined
    svg = ""

    constructor(umlmodel){
        this.umlmodel = umlmodel
        this.graphheader = `
            graph [
                bgcolor="transparent"
                fontname="Helvetica,Arial,sans-serif"
            ]

            edge [
                fontname = "Helvetica"
                fontsize = 8
                color = "#CCCCCC"
                fontcolor = "#00FFFF"
            ]        
        `
    }

    async graphModel(){
        let dotInput = `
        digraph UML_class_diagram {       
        }
        `
        this.graphDot(dotInput, "#MBSpecModel")
    }

    async graphDot(dotInput, graphWindow){
        const promise = new Promise((resolve, reject) => {
            if(this.graphviz == undefined)
                this.graphviz = Graphviz.load()
            resolve(this.graphviz)
        })
        promise
        .then((value) => {
            let svg = value.dot(dotInput)
            this.graphviz = value
            this.svg = svg
            $(graphWindow).html(svg)
        })
        .catch((err) => {
            console.error(err);
        });
    }  

    async updateModel(umlmodel){
        this.umlmodel = umlmodel
        this.dotText = `
        digraph UML_class_diagram {
            ${this.graphheader}
            ${this.dotEnumerations()}
            ${this.dotClasses()}
            ${this.dotExtensions()}
            ${this.dotImplementations()}
            ${this.dotAssociations()}
        }
        `
        this.graphDot(this.dotText, "#MBSpecModel")
    }

    async updateInstances(instances){
        this.instances = instances
        this.dotText = `
        digraph UML_instances_diagram {
            ${this.graphheader}
            ${this.dotInstances()}
        }
        `
        this.graphDot(this.dotText, "#MBSpecInstances")        
    }

    getSVG(){
        return this.svg
    }

    dotEnumerations(){
        let res = []
        this.umlmodel.enumerations.forEach( item => {
            res.push( this.dotEnumeration(item) )
        })
        return res.join(" ")
    }

    dotClasses(){
        let res = []
        this.umlmodel.classes.forEach( item => {
            res.push( this.dotClass(item) )
        })
        return res.join(" ")
    }

    dotExtensions(){
        let res = []
        this.umlmodel.extensions.forEach( item => {
            res.push( this.dotExtension(item) )
        })
        return res.join(" ")
    }
    
    dotImplementations(){
        let res = []
        this.umlmodel.implementations.forEach( item => {
            res.push( this.dotImplementation(item) )
        })
        return res.join(" ")
    }

    dotAssociations(){
        let res = []
        this.umlmodel.associations.forEach( item => {
            res.push( this.dotAssociation(item) )
        })
        return res.join(" ")
    }

    dotEnumeration(target){        
        let name = target.name
        let stereotype = "«enum»<br/>"
        let values = []
        target.values.forEach(item => {
            values.push(`<tr><td align="left" >${item}</td></tr>`)
        })

        let valuesDefinition = ''
        if(values.length>0)
            valuesDefinition = `
                <tr><td>
                    <table border="0" cellborder="0" cellspacing="0" >
                        ${values.join("")}
                    </table>
                </td></tr>            
            `
        let result = `
        ${name} [
            fontname = "Helvetica"
            fontsize = 9
            shape = "plain"
            style= "filled"
            fillcolor= "gray95"
            label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="2">
                <tr>
                    <td>${stereotype}<b>${name}</b></td>
                </tr>
                ${valuesDefinition}
            </table>>
        ]`
        return result
    }    

    dotClass(target, isInstance = false){   
        let name = target.name
        let stereotype = ""
        if(target.stereotype!="")
            stereotype = "«" + target.stereotype + "»<br/>"
        let attributes = []
        target.attributes.forEach(item => {
            let printAttribute = true
            let derived = ""
            if(item.value == "null" || item.value == "")
                printAttribute = false
            if(item.derived == true)
                derived = "/"
            if(isInstance){
                if(printAttribute)
                    attributes.push(`<tr><td align="left" >${derived}${item.attribute} = ${item.value}</td></tr>`)
            }
            else
                attributes.push(`<tr><td align="left" >${derived}${item.attribute}: ${item.type}</td></tr>`)
        })
        let operations = []
        if(typeof target.operations !== "undefined"){
            target.operations.forEach(item => {
                let parameters = []
                item.parameters.forEach(subitem => {
                    parameters.push(`${subitem.parameter}: ${subitem.type}`)
                })
                operations.push(`<tr><td align="left" >${item.operation}(${parameters.join(", ")}): ${item.type}</td></tr>`)
            })
        }
        
        let attributesDefinition = ''
        let operationsDefinition = ''
        if(attributes.length>0)
            attributesDefinition = `
                <tr><td>
                    <table border="0" cellborder="0" cellspacing="0" >
                        ${attributes.join("")}
                    </table>
                </td></tr>            
            `
        if(operations.length>0)
            operationsDefinition = `
                <tr><td>
                    <table border="0" cellborder="0" cellspacing="0" >
                        ${operations.join("")}
                    </table>
                </td></tr>            
            `        
        let result = `
        "${name}" [
            fontname = "Helvetica"
            fontsize = 9
            shape = "plain"
            style= "filled"
            fillcolor= "gray95"
            label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="2">
                <tr>
                    <td>${stereotype}<b>${name}</b></td>
                </tr>
                ${attributesDefinition}
                ${operationsDefinition}          
            </table>>
        ]`
        return result
    }

    dotExtension(target){        
        return ` ${target.target} -> ${target.origin} [dir=back arrowtail=empty style=""] `
    }
    dotImplementation(target){
        let res = []
        target.target.forEach(item => {    
            res.push(this.dotImplementationClass(item, target.origin))
        })
        return res.join(" ")
    }
    dotImplementationClass(target, origin){        
        return ` ${target} -> ${origin} [dir=back arrowtail=empty style="dashed"] `
    }
    dotAssociation(target){
        if(target.participants.length>1){
            if(target.participants.length == 2){
                //binary
                let obj1 = target.participants[0]
                let obj2 = target.participants[1]
                
                if(target.associationClass != ""){
                    if(target.type == "association")
                        return `
                        "${target.association}" [shape="point" width="0"]
                        "${obj1.participant}" -> "${target.association}" [dir="none" taillabel="${this.dotRoleCardinalityOrdered(obj1.role, obj1.cardinality, obj1.ordered)}" label="${this.dotAssociationName(target.association)}"]
                        "${target.association}" -> "${obj2.participant}" [dir="none" headlabel="${this.dotRoleCardinalityOrdered(obj2.role, obj2.cardinality, obj2.ordered)}"]
                        "${target.associationClass}" -> "${target.association}" [dir="none" style="dashed"]
                        subgraph subs {rank="same" "${target.association}" "${target.associationClass}"}                        
                        `
                    else if(target.type == "composition")
                        return `  
                        "${target.association}" [shape="point" width="0"]
                        "${obj1.participant}" -> "${target.association}" [dir="back" style="" arrowtail="diamond" taillabel="${this.dotRoleCardinalityOrdered(obj1.role, obj1.cardinality, obj1.ordered)}" label="${this.dotAssociation(target.association)}"]
                        "${target.association}" -> "${obj2.participant}" [dir="none" headlabel="${this.dotRoleCardinalityOrdered(obj2.role, obj2.cardinality, obj2.ordered)}"]
                        "${target.associationClass}" -> "${target.association}" [dir="none" style="dashed"]
                        subgraph subs {rank="same" "${target.association}" "${target.associationClass}"}
                        `
                    else if(target.type == "aggregation")
                        return `
                        "${target.association}" [shape="point" width="0"]
                        "${obj1.participant}" -> "${target.association}" [dir="back" style="" arrowtail="odiamond" taillabel="${this.dotRoleCardinalityOrdered(obj1.role, obj1.cardinality, obj1.ordered)}" label="${this.dotAssociationName(target.association)}"]
                        "${target.association}" -> "${obj2.participant}" [dir="none" headlabel="${this.dotRoleCardinalityOrdered(obj2.role, obj2.cardinality, obj2.ordered)}"]
                        "${target.associationClass}" -> "${target.association}" [dir="none" style="dashed"]
                        subgraph subs {rank="same" "${target.association}" "${target.associationClass}"}
                        `
                }
                else{
                    if(target.type == "association")
                        return ` "${obj1.participant}" -> "${obj2.participant}" [xlabel="${this.dotAssociationName(target.association)}" dir="none" style="" taillabel="${this.dotRoleCardinalityOrdered(obj1.role, obj1.cardinality, obj1.ordered)}" headlabel="${this.dotRoleCardinalityOrdered(obj2.role, obj2.cardinality, obj2.ordered)}"] `
                    else if(target.type == "composition")
                        return `  "${obj1.participant}" -> "${obj2.participant}" [label="${this.dotAssociationName(target.association)}" dir="back" style="" arrowtail="diamond" taillabel="${this.dotRoleCardinalityOrdered(obj1.role, obj1.cardinality, obj1.ordered)}" headlabel="${this.dotRoleCardinalityOrdered(obj2.role, obj2.cardinality, obj2.ordered)}"] `
                    else if(target.type == "aggregation")
                        return ` "${obj1.participant}" -> "${obj2.participant}" [label="${this.dotAssociationName(target.association)}" dir="back" style="" arrowtail="odiamond" taillabel="${this.dotRoleCardinalityOrdered(obj1.role, obj1.cardinality, obj1.ordered)}" headlabel="${this.dotRoleCardinalityOrdered(obj2.role, obj2.cardinality, obj2.ordered)}"] `
                }
            }
            else{
                let associations = []
                target.participants.forEach(item => {
                    associations.push(`"${item.participant}" -> "${target.association}" [dir="none" taillabel="${this.dotRoleCardinalityOrdered(item.role, item.cardinality, item.ordered)}"]`)
                })

                let associationClass = []
                if(target.associationClass != ""){
                    associationClass.push(`
                    "${target.associationClass}" -> "${target.association}" [dir="none" style="dashed"]
                    subgraph subs {rank="same" "${target.association}" "${target.associationClass}"}                    
                    `)
                }

                return `
                "${target.association}" [
                    fontname = "Helvetica"
                    fontsize = 9                
                    style= "filled"
                    fillcolor= "gray95"                
                    shape="diamond"
                    fontcolor = "#00FFFF" 
                    label=""
                ]
                ${associations.join("\n")}
                ${associationClass.join("\n")}
                `
            }
        }
    }
    dotInstances(){
        let res = []
        this.instances.objects.forEach( item => {
            res.push( this.dotClass(item.objectInstance, true) )
        })
        this.instances.associations.forEach( item => {
            res.push( this.dotAssociation(item, true) )
        })
        return res.join(" ")
    }

    dotRoleCardinalityOrdered(role, cardinality, ordered){
        //return role + " " + cardinality + " " + ordered
        return cardinality
    }
    dotAssociationName(name){
        //return name
        return ""
    }
}