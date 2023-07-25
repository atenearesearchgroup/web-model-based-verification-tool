export class AlloyCardinality{
    static ONE = "one"
    static SET = "set"
}

export class AlloyModel {
    signatures = [] // new Array<AlloySignature>[]
    binaryRelations = [] // new Array<AlloyBinaryRelation>[]

    constructor(name, signatures, binaryRelations=[]){
        this.name = name
        this.signatures = signatures
        this.binaryRelations = binaryRelations
    }
}

export class AlloySignature{
    abstract = false
    name = ""
    relations = [] // new Array<AlloyRelation>[]
    extension = ""

    constructor(name, relations, extension, abstract=false){
        this.abstract = abstract
        this.name = name
        this.relations = relations
        this.extension = extension
    }
 
}

export class AlloyBinaryRelation{
    name = ""
    a = null //AlloyRelation
    b = null //AlloyRelation

    constructor(name, a, b){
        this.name = name
        this.a = a
        this.b = b
    }
 
}

export class AlloyRelation{
    name = ""
    cardinality = ""
    type = ""

    constructor(name, cardinality, type){
        this.name = name
        this.cardinality = cardinality
        this.type = type
    }
 
}
