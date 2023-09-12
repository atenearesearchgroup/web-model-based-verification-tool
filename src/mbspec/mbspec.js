import {State} from "./state.js"
import $ from "../jquery/src/jquery.js"
import * as mbspecmodel from "./model.js"
import * as alloymodel from "./alloymodel.js"


class MBSpecLinkOptions{
    static ASSOCIATION = "ASSOCIATION"
    static EXTENSION="EXTENSION"
}
class MBSpecLModelViews{
    static SEMANTIC_MODEL = "SEMANTIC_MODEL"
    static ALLOY_MODEL = "ALLOY_MODEL"
}
class MBSpecViews{
    static CLASS = "CLASS"
    static ATTRIBUTES = "ATTRIBUTES"
    static OPERATIONS = "OPERATIONS"
    static ASSOCIATION = "ASSOCIATION"
    static EXTENSION = "EXTENSION"
}
class MBSpecSelectedItemType{
    static CLASS = "CLASS"
    static ASSOCIATION = "ASSOCIATION"
    static EXTENSION = "EXTENSION"
}
class MBSpecSelectedItem{
    item = null
    type = new MBSpecSelectedItemType()
    constructor(item, type){
        this.item = item
        this.type = type
    }
}

export class MBSpec{
    state = null
    graph = null
    umlmodel = null
    activeEditor = null
    activeView = null
    activeModelView = null
    diagram = null
    selectedItem = null
    addNewAttributeToInterfaceFunction = null
    linkOption = null

    constructor(diagram, data){
        this.diagram = diagram
        this.csrftoken = this.getCookie('csrftoken')
        this.state = new State()
        this.umlmodel = new mbspecmodel.MBSpecUMLModel()
        this.activeView = MBSpecViews.model
        this.activeModelView = MBSpecLModelViews.SEMANTIC_MODEL
        this.linkOption = MBSpecLinkOptions.ASSOCIATION

        this.data = data
        this.specificationName = data.name
        this.api_validateSpecification = data.apivalidate
        this.api_saveSpecification = data.apisave

        let App = this

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!App.csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", App.csrftoken);
                }
            }
        });

        $("#btnAddClass").on("click", function(){
            App.addClassWithName("Class")
        })
        $("#btnAttributesView").on("click", function(){
            App.activeView = MBSpecViews.ATTRIBUTES
            App.updateState()
        })
        $("#btnOperationsView").on("click", function(){
            App.activeView = MBSpecViews.OPERATIONS
            App.updateState()
        })  
        $("#btnClassView").on("click", function(){
            App.activeView = MBSpecViews.CLASS
            App.updateState()
        })
        $("#btnSemanticModel").on("click", function(){
            App.activeModelView = MBSpecLModelViews.SEMANTIC_MODEL
            App.updateState()
        })
        $("#btnAlloyModel").on("click", function(){
            App.activeModelView = MBSpecLModelViews.ALLOY_MODEL
            App.updateState()
        })        
        $("#classViewClassName").on("change", function(){
            if(App.getSelectedItem()!==null && App.getSelectedItem().type == MBSpecSelectedItemType.CLASS){             
                App.updateClassName( $(this).val() )
            }
        })
        $("#classViewClassStereotype").on("change", function(){
            if(App.getSelectedItem()!==null && App.getSelectedItem().type == MBSpecSelectedItemType.CLASS){
                App.getSelectedItem().item.stereotype = $(this).val()
                App.updateClass(App.getSelectedItem().item)
            }
        })
        $("#associationView INPUT").on("change", function(){
            if(App.getSelectedItem()!==null && App.getSelectedItem().type == MBSpecSelectedItemType.ASSOCIATION){
                if($(this).attr("id")== "associationName")
                    App.getSelectedItem().item.association = $(this).val()
                else if($(this).attr("id")== "associationFromCardinality")
                    App.getSelectedItem().item.participants[0].cardinality = $(this).val();
                else if($(this).attr("id")== "associationFromRole")
                    App.getSelectedItem().item.participants[0].role = $(this).val()
                else if($(this).attr("id")== "associationToCardinality")
                    App.getSelectedItem().item.participants[1].cardinality = $(this).val()
                else if($(this).attr("id")== "associationToRole")
                    App.getSelectedItem().item.participants[1].role = $(this).val()                         
                App.updateAssociation(App.getSelectedItem().item)
            }
        })
        $("#associationType").on("change", function(){
            if(App.getSelectedItem()!==null && App.getSelectedItem().type == MBSpecSelectedItemType.ASSOCIATION){
                App.getSelectedItem().item.type = $(this).val()                         
                App.updateAssociation(App.getSelectedItem().item)
            }
        })
        $("#btnLinkOption INPUT").on("change", function(){
            App.setLinkOption($(this).val())
        })

        this.addNewAttributeToInterfaceFunction = function(attribute){
            
            const line = $("#attributesViewForm DIV.template").html()

            $("#attributesViewForm DIV.attributeList").append(line)
            $("#attributesViewForm DIV.attributeList DIV.item").last().find("INPUT")
            $("#attributesViewForm DIV.attributeList DIV.item").last().find("BUTTON").on("click", function(){
                if(App.getSelectedItem()!==null && App.getSelectedItem().type == MBSpecSelectedItemType.CLASS){                
                    $(this).parent().parent().remove()
                    let targetClass = App.getSelectedItem().item
                    App.commitChangeOfAttributeToClass(targetClass)
                }
            })

            let onChangedEvent = function(){
                if(App.getSelectedItem()!==null && App.getSelectedItem().type == MBSpecSelectedItemType.CLASS){
                    let derived = false
                    if($(this).parent().parent().find("SELECT").val()=="/")
                        derived = true
                    let attributeName = $(this).parent().parent().find("INPUT.attributeName").val()
                    let attributeType = $(this).parent().parent().find("INPUT.attributeType").val()
    
    
                    $(this).parent().parent().removeClass("invalid")
                    if(App.validateAttribute(derived, attributeName, attributeType)){
                        let targetClass = App.getSelectedItem().item
                        App.commitChangeOfAttributeToClass(targetClass)
                    }
                    else
                        $(this).parent().parent().addClass("invalid")
                }
            }
    
            if(attribute instanceof mbspecmodel.MBSpecAttribute){
                if(attribute.derived)
                    $("#attributesViewForm DIV.attributeList DIV.item").last().find("SELECT").val("/")
                $("#attributesViewForm DIV.attributeList DIV.item").last().find("INPUT.attributeName").val(attribute.attribute)
                $("#attributesViewForm DIV.attributeList DIV.item").last().find("INPUT.attributeType").val(attribute.type)
            }
            
    
            $("#attributesViewForm DIV.attributeList DIV.item").last().find("INPUT").on("change", onChangedEvent)
            $("#attributesViewForm DIV.attributeList DIV.item").last().find("SELECT").on("change", onChangedEvent)
            
            $("#attributesViewForm DIV.attributeList DIV.item INPUT.attributeType").off("keydown")
            $("#attributesViewForm DIV.attributeList DIV.item").last().find("INPUT.attributeType").on("keydown", function(e){
                if( $('attributesViewForm DIV.attributeList DIV.item').index($(this).parent()) == $('attributesViewForm DIV.attributeList DIV.item').length - 1){
                    var keyCode = e.keyCode || e.which; 
                    if(e.shiftKey && e.keyCode == 9){
                    }
                    else if (keyCode == 9) { 
                        $("#btnAddAttribute").trigger("click")
                    }
                }
            })
        }
        $("#btnAddAttribute").on("click", this.addNewAttributeToInterfaceFunction)
        $("#btnSave").on("click", function () {
            let content = App.getDiagram().exportToJson()
            // Create element with <a> tag
            const link = document.createElement("a")
            // Create a blog object with the file content which you want to add to the file
            const file = new Blob([content], { type: "text/plain;charset=utf-8" })
            // Add file content in the object URL
            link.href = URL.createObjectURL(file)
            // Add file name
            link.download = "atenea_model.json"

            // Add click event to <a> tag to save file.
            //document.body.appendChild(link);
            link.click()
            let url = link.href
            window.URL.revokeObjectURL(url)

        })


        const fileSelector = document.getElementById('btnLoadFile');
        const fileUploadModal = document.getElementById('fileUploadModal')        
        fileSelector.addEventListener('change', (event) => {
            var modal = bootstrap.Modal.getInstance(fileUploadModal)
            modal.hide()

            const file = event.target.files[0]
            const reader = new FileReader()

            reader.addEventListener(
                "load",
                () => {
                    fileSelector.value = ""
                    App.getDiagram().loadFromJson(reader.result)                    
                },
                false,
            )
          
            if(file) {
                reader.readAsText(file);
            }
        })

        this.updateState()
    }

    updateState(){
        this.updateViews()
        this.updateModelViews()
    }
    updateModelViews(){
        this.writeSemanticModel()
        this.writeAlloyModel()

        $("#semanticModelView").hide()
        $("#alloyModelView").hide()

        $("#btnSemanticModel").removeClass("active")
        $("#btnAlloyModel").removeClass("active")

        if(this.activeModelView == MBSpecLModelViews.SEMANTIC_MODEL){
            
            $("#semanticModelView").show()
            $("#btnSemanticModel").addClass("active")
        }
        else if(this.activeModelView == MBSpecLModelViews.ALLOY_MODEL){
            $("#alloyModelView").show()
            $("#btnAlloyModel").addClass("active")
        }        
    }
    updateViews(){
        $("#classView").hide()
        $("#associationView").hide()
        $("#extensionView").hide()

        $("#btnClassView").removeClass("active")
        $("#btnAttributesView").removeClass("active") 
        $("#btnAssociationView").removeClass("active")        
        $("#btnExtensionView").removeClass("active")        

        $("#classViewForm").hide()
        $("#attributesViewForm").hide()
        $("#associationViewForm").hide()
        $("#extensionViewForm").hide()

        if(this.activeView == MBSpecViews.CLASS){
            $("#classView").show()
            $("#btnClassView").addClass("active")
            $("#classViewForm").show()            
        }
        else if(this.activeView == MBSpecViews.ATTRIBUTES){
            $("#classView").show()
            $("#btnAttributesView").addClass("active")
            $("#attributesViewForm").show()
        }
        else if(this.activeView == MBSpecViews.ASSOCIATION){
            $("#associationView").show()
            $("#btnAssociationView").addClass("active")
            $("#associationViewForm").show()
        }
        else if(this.activeView == MBSpecViews.EXTENSION){
            $("#extensionView").show()
            $("#btnExtensionView").addClass("active")
            $("#extensionViewForm").show()
        }        

    }
    writeSemanticModel(){
        //nunjucks.configure('nunjucks/templates', { autoescape: true });
        //let res = nunjucks.render("semanticModel.tpl", { context: this.umlmodel });
        const  res = JSON.stringify(this.umlmodel, null, 2)        
        $("#semanticModelView PRE").html(res)
    }
    writeAlloyModel(){
        var env = nunjucks.configure('nunjucks/templates', { autoescape: true })
        // env.addFilter('cardinality', function(str, count) {
        //     if(str == "*")
        //         return str.slice("set")
        // })
        env.addFilter('isAbstract', function(isAbstract) {
            if(isAbstract)
                return "abstract "
        })
        env.addFilter('extendsSignature', function(extension) {
            if(extension!="")
                return "extends " + extension
        })
        env.addFilter('aIsInB', function(a, b) {
            if(b.cardinality == alloymodel.AlloyCardinality.ONE)
                return "b."+b.name+"=a"
            else
                return "a in b."+b.name
        })
        env.addFilter('bIsInA', function(a, b) {
            if(a.cardinality == alloymodel.AlloyCardinality.ONE)
                return "a."+a.name+"=b"
            else
                return "b in a."+a.name
        })                   
        let model = new alloymodel.AlloyModel("atenea", [])

        let relationsByEndRole = []
        this.getUmlAssociations().forEach(item => {
            let cardinalityA = this.mapAlloyCardinality(item.participants[1].cardinality)
            let relationA = new alloymodel.AlloyRelation(item.participants[1].role, cardinalityA, item.participants[1].participant)
            relationsByEndRole.push({"signature": item.participants[0].participant, "relation": relationA})
           
            let cardinalityB = this.mapAlloyCardinality(item.participants[0].cardinality)
            let relationB = new alloymodel.AlloyRelation(item.participants[0].role, cardinalityB, item.participants[0].participant)
            relationsByEndRole.push({"signature": item.participants[1].participant, "relation": relationB})   
            
            model.binaryRelations.push(new alloymodel.AlloyBinaryRelation(item.association, relationA, relationB))
        })        
        model.relations = relationsByEndRole
        this.getUmlClasses().forEach(item => {
            let className = item.name
            let isAbstract = false
            if(item.stereotype=="abstract")
                isAbstract = true
            
            let relations = []
            model.relations.forEach(relation => {
                if(relation.signature == className)
                    relations.push(relation.relation)
            })
            let extension = ""
            this.getUmlExtensions().forEach(ext => {
                if(ext.origin == className)
                    extension = ext.target
            })

            let signature = new alloymodel.AlloySignature(className, relations, extension, isAbstract)
            model.signatures.push(signature)
        })
        
        let res = nunjucks.render("alloyModel.tpl", { context: model })
        $("#alloyModelView PRE").html(res)
    }
    mapAlloyCardinality(target){
        let cardinality = ""
        if(target == "*")
            cardinality = alloymodel.AlloyCardinality.SET
        else if(target == "1")
            cardinality = alloymodel.AlloyCardinality.ONE
        
        return cardinality
    }   
    addNewAttributeToInterface(attribute){
        let funct = this.addNewAttributeToInterfaceFunction
        let App = this
        funct(attribute)
    }
    commitChangeOfAttributeToClass(targetClass){
        let attributes = []
        $("#attributesViewForm DIV.attributeList DIV.item").each(function(){
            let derived = false
            if($(this).find("SELECT").val()=="/")
                derived = true
            let attributeName = $(this).find("INPUT.attributeName").val()
            let attributeType = $(this).find("INPUT.attributeType").val()
            
            attributes.push( new mbspecmodel.MBSpecAttribute(attributeName, attributeType, derived))
        })

        targetClass.attributes = []
        attributes.forEach(item => {
            targetClass.attributes.push(item)
        })
        this.commitChangesToClass(targetClass)
    }
    commitChangesToClass(targetClass){
        this.getUmlClasses().forEach(item => {
            if(item.id == targetClass.id)
                item = targetClass.item
        })
        this.updateClass(this.getSelectedItem().item)
        this.updateState()
    }
    validateAttribute(derived, attribute, type) {
        /*
        if(derived!=null && attribute!=null && type!=null && attribute!="" && type!="")
            return true
        else
            return false
        */
        return true
    }
    nothingSelected(){
        this.setSelectedItem(null)
        this.activeView = null
        this.updateState() 
    }
    classSelectedToEditNow(id){
        this.classSelected(id)
        $("#classViewClassName").focus()
        $("#classViewClassName").select()          
    }
    classSelected(id){
        const targetClass = this.getClassById(id)
        if(targetClass!==null){
            this.activeView = MBSpecViews.CLASS
            this.setSelectedItem(new MBSpecSelectedItem(targetClass, MBSpecSelectedItemType.CLASS))
            this.loadAttributesFromSelectedClass()
        }
        else
            this.setSelectedItem(null)
        this.updateState()      
    }
    associationSelected(id){
        const targetAssoc = this.getAssociationById(id)
        if(targetAssoc!==null){
            this.activeView = MBSpecViews.ASSOCIATION
            this.setSelectedItem(new MBSpecSelectedItem(targetAssoc, MBSpecSelectedItemType.ASSOCIATION))
            this.loadAttributesFromSelectedAssociation()
        }
        else
            this.setSelectedItem(null)
        
        this.updateState()
    }
    extensionSelected(id){
        const targetExtension = this.getExtensionById(id)
        if(targetExtension!==null){
            this.activeView = MBSpecViews.EXTENSION
            this.setSelectedItem(new MBSpecSelectedItem(targetExtension, MBSpecSelectedItemType.EXTENSION))
            this.loadAttributesFromSelectedExtension()
        }
        else
            this.setSelectedItem(null)
        
        this.updateState()
    }    
    loadAttributesFromSelectedClass(){
        let selectedClass = this.getSelectedItem().item
        $("#classViewClassName").val(selectedClass.name)
        $("#classViewClassStereotype").val(selectedClass.stereotype)        
        $("#attributesViewForm DIV.attributeList").html("")
        selectedClass.attributes.forEach(item => {
            this.addNewAttributeToInterface(item)
        })
    }
    loadAttributesFromSelectedAssociation(){
        let selectedAssociation = this.getSelectedItem().item
        $("#associationName").val(selectedAssociation.association)
        $("#associationType").val(selectedAssociation.type)
        let from = selectedAssociation.participants[0]
        let to = selectedAssociation.participants[1]
        $("#associationFromClassName").val(from.participant)
        $("#associationFromCardinality").val(from.cardinality)
        $("#associationFromRole").val(from.role)
        $("#associationToClassName").val(to.participant)
        $("#associationToCardinality").val(to.cardinality)
        $("#associationToRole").val(to.role)
    }
    loadAttributesFromSelectedExtension(){
        let selectedExtension = this.getSelectedItem().item
        $("#extensionFrom").val(selectedExtension.origin)
        $("#extensionTo").val(selectedExtension.target)
    }
    updateClassName(className) {
        let actualClassName = this.getSelectedItem().item.name
        if (actualClassName != className) {
            this.getUmlAssociations().forEach(item => {
                if (item.participants[0].participant == actualClassName) {
                    item.participants[0].participant = className
                }
                if (item.participants[1].participant == actualClassName) {
                    item.participants[1].participant = className
                }
            })
        }    
        this.getSelectedItem().item.name = className
        this.updateClass(this.getSelectedItem().item)           
    }
    updateClass(modifiedClass) {
        this.getDiagram().updateClass(modifiedClass)
        this.updateState()
    }
    updateAssociation(modifiedAssociation){
        this.getDiagram().updateAssociation(modifiedAssociation)
        this.updateState()
    }
    addExtension(fromNode, toNode, id){
        let extension = new mbspecmodel.MBSpecExtension(id, fromNode, toNode)
        this.getUmlExtensions().push(extension)
        this.updateState()
    } 
    addExtensionWithClass(newExtension){
        this.getUmlExtensions().push(newExtension)
        this.updateState()        
    }
    addAssociation(fromNode, toNode, id){
        let from = new mbspecmodel.MBSpecAssociationParticipant(fromNode, "", "", false)
        let to = new mbspecmodel.MBSpecAssociationParticipant(toNode, "", "", false)
        let participants = [from, to]
        let newAssociation = new mbspecmodel.MBSpecAssociation(id, "", mbspecmodel.MBSpecAssociationTypes.ASSOCIATION, participants, null)        
        this.addAssociationWithClass(newAssociation)
    }
    addAssociationWithCompleteData(fromNode, toNode, id, participantsRaw){
        let from = new mbspecmodel.MBSpecAssociationParticipant(fromNode, participantsRaw[0].role, participantsRaw[0].cardinality, false)
        let to = new mbspecmodel.MBSpecAssociationParticipant(toNode, participantsRaw[1].role, participantsRaw[1].cardinality, false)
        let participants = [from, to]
        let newAssociation = new mbspecmodel.MBSpecAssociation(id, "", mbspecmodel.MBSpecAssociationTypes.ASSOCIATION, participants, null)        
        this.addAssociationWithClass(newAssociation)
    }    
    addAssociationWithClass(newAssociation){
        this.getUmlAssociations().push(newAssociation)
        this.updateState()
    }
    addClassWithName(name){
        this.addClassWithoutToken(name, [], null, null, null, null)
    }  
    addClassWithoutToken(name, attributes, operations, stereotype, association, extension){
        this.addClass(this.newToken(), name, attributes, operations, stereotype, association, extension)
    }
    addClass(token, name, attributes, operations, stereotype, association, extension){
        let newClass = new mbspecmodel.MBSpecClass(token, name, attributes, operations, stereotype, association, extension)
        this.getUmlClasses().push(newClass)
        this.getDiagram().addClass(newClass)
        this.updateState()
    }  
    addClassFromDiagram(token, name, attributes, operations, stereotype, association, extension){
        let newClass = new mbspecmodel.MBSpecClass(token, name, attributes, operations, stereotype, association, extension)
        this.getUmlClasses().push(newClass)
        this.updateState()
    }
    attributeToJson(attribute, type, derived){
        return new mbspecmodel.MBSpecAttribute(attribute, type, derived)        
    }
    deleteClass(id){
        this.getUmlClasses().forEach(function(item, index, object) {
            if(item.id == id)
                object.splice(index, 1)
        })
    }
    deleteAssociation(id){
        this.getUmlAssociations().forEach(function(item, index, object) {
            if(item.id == id)
                object.splice(index, 1)
        })
    }
    deleteExtension(id){
        this.getUmlExtensions().forEach(function(item, index, object) {
            if(item.id == id)
                object.splice(index, 1)
        })
    }
    getSelectedItem(){
        return this.selectedItem
    }
    setSelectedItem(value){
        this.selectedItem = value       
    }
    getClassById(id){
        let res = null
        this.getUmlClasses().forEach(item => {
            if(item.id == id)
                res = item
        })
        return res
    }
    getAssociationById(id){
        let res = null
        this.getUmlAssociations().forEach(item => {
            if(item.id == id)
                res = item
        })
        return res
    }
    getExtensionById(id){
        let res = null
        this.getUmlExtensions().forEach(item => {
            if(item.id == id)
                res = item
        })
        return res
    }    
    getDiagram(){
        return this.diagram        
    }
    getUmlClasses(){
        if(this.umlmodel.classes == null)
            this.umlmodel.classes = []
        
        return this.umlmodel.classes
    }
    getUmlAssociations(){
        if(this.umlmodel.associations == null)
            this.umlmodel.associations = []
        
        return this.umlmodel.associations
    }
    getUmlExtensions(){
        if(this.umlmodel.extensions == null)
            this.umlmodel.extensions = []
        
        return this.umlmodel.extensions
    }      
    getLinkOption(){
        return this.linkOption   
    }  
    setLinkOption(value){
        this.linkOption = value
    }
    newToken(){
        const rand = () => {
            return Math.random().toString(36).substr(2);
        };
        return rand() + rand();
    }
    clearModel(){
        this.umlmodel = new mbspecmodel.MBSpecUMLModel()
        this.activeView = MBSpecViews.model
        this.updateModelViews()
    }
    getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';')
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                    break;
                }
            }
        }
        return cookieValue;
    }
    csrfSafeMethod(method){
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
}