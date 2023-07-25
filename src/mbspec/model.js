export class MBSpecAssociationTypes{
    static ASSOCIATION = "association"
    static COMPOSITION = "composition"
    static AGGREGATION = "aggregation"
}
export class MBSpecUMLModel{
    classes = [] // new Array<MBSpecClass>[]
    associations = [] // new Array<MBSpecAssociation>[]
    extensions = [] // new Array<MBSpecExtension>[]
    implementations = [] // new Array<MBSpecImplementation>[]
    enumerations = [] // new Array<MBSpecEnum>[]
    constructor(classes, associations, extensions, implementations, enumerations, generalizations){
        this.classes = classes
        this.associations = associations
        this.extensions = extensions
        this.implementations = implementations
        this.enumerations = enumerations
        this.generalizations = generalizations
    }
}

export class MBSpecAttribute{
    derived = false
    attribute = ""
    type = ""
    constructor(attribute, type, derived = false){
        this.attribute = attribute
        this.type = type
        this.derived = derived
    }
 
}

export class MBSpecAttributeValue extends MBSpecAttribute{
    value = ""
    constructor(attribute, type, value, derived = false){
        super(attribute, type, derived)
        this.value = value
    }
}

export class MBSpecOperationParameter{
    parameter = ""
    type = ""
    constructor(parameter, type){
        this.parameter = parameter
        this.type = type
    }
}

export class MBSpecOperation{
    operation = ""
    type = ""
    parameters = [] // new Array<MBSpecOperationParameter>[]
    constructor(operation, type, parameters){
        this.operation = operation
        this.type = type
        this.parameters = parameters
    }    
}

export class MBSpecClass{
    id = null
    name = ""
    attributes = [] // new Array<MBSpecAttribute>[]
    operations = [] // new Array<MBSpecOperation>[]
    stereotype = ""
    association = ""
    extension = ""
    constructor(id, name, attributes, operations, stereotype, association, extension){
        this.id = id
        this.name = name
        this.attributes = attributes
        this.operations = operations
        this.stereotype = stereotype
        this.association = association
        this.extension = extension
    }
}

export class MBSpecExtension{
    id = ""
    origin = ""
    target = ""
    constructor(id, origin, target){
        this.id = id
        this.origin = origin
        this.target = target
    }
}

export class MBSpecImplementation{
    origin = ""
    target = []
    from = 0
    to = 0
    constructor(origin, target, from, to){
        this.origin = origin
        this.target = target
        this.from = from
        this.to = to
    }
}

export class MBSpecAssociationParticipant{
    participant = ""
    role = ""
    cardinality = ""
    ordered = false

    constructor(participant, role, cardinality, ordered){
        this.participant = participant
        this.role = role
        this.cardinality = cardinality
        this.ordered = ordered
    }
}

export class MBSpecAssociation{
    id = null
    association = ""
    type = ""
    participants = [] // Array<MBSpecAssociationParticipant>[]
    associationClass = ""

    constructor(id, association, type, participants, associationClass){
        this.id = id
        this.association = association
        this.type = type
        this.participants = participants
        this.associationClass = associationClass
    }
}


export class MBSpecEnum{
    name = ""
    values = []   

    constructor(name, values){
        this.name = name
        this.values = values
    }
}

class MBSpecTransaction{
    type = ""
    objectName = ""
    className = ""

    constructor(type, objectName, className){
        this.type = type
        this.objectName = objectName
        this.className = className
    }    
}

export class MBSpecNewObject extends MBSpecTransaction{
    constructor(objectName, className){
        super("NewObject", objectName, className)
    }
}

export class MBSpecNewAssociation extends MBSpecTransaction{
    participants = [] // new Array<String>[]
    constructor(objectName, className, participants){
        super("NewAssociation", objectName, className)
        this.participants = participants
    }
}

export class MBSpecAssignAttribute extends MBSpecTransaction{
    attributeName = ""
    value = ""
    valueType = ""
    constructor(objectName, attributeName, value, valueType){
        super("NewAssignAttribute", objectName, "")
        this.attributeName = attributeName
        this.value = value
        this.valueType = valueType
    }
}

export class MBSpecInstance{
    objectName = null
    objectInstance = null
    constructor(objectName, objectInstance){
        this.objectName = objectName
        this.objectInstance = objectInstance
    }
}

export class MBSpecInstances{
    objects = []
    associations = []
    constructor(objects, associations){
        this.objects = objects
        this.associations = associations
    }    
}

export class MBSpecOCLRule{
    ruleType = ""
    targetClass = ""
    targetAttribute = ""
    targetReturnType = ""
    rule = ""
    constructor(ruleType, targetClass, targetAttribute, targetReturnType, rule){
        this.ruleType = ruleType
        this.targetClass = targetClass
        this.targetAttribute = targetAttribute
        this.targetReturnType = targetReturnType
        this.rule = rule
    }
}

export class MBSpecResponseToClient{
    status = ""
    result = ""
    constructor(status, result){
        this.status = status
        this.result = result
    }
}
