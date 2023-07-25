{% for signature in context.signatures %}
{{signature.abstract|isAbstract}}sig {{signature.name}} {{signature.extension|extendsSignature}}{
    {% for relation in signature.relations %}
    {{relation.name}}: {{relation.cardinality}} {{relation.type}},
    {% endfor %}
}
{% endfor %}

{% for relation in context.binaryRelations %}
fact {{relation.name}}Symmetry{
	all a:{{relation.b.type}}, b:{{relation.a.type}} | {{relation.a|aIsInB(relation.b)}} => {{relation.a|bIsInA(relation.b)}}
    &&
	all a:{{relation.b.type}}, b:{{relation.a.type}} | {{relation.a|bIsInA(relation.b)}} => {{relation.a|aIsInB(relation.b)}}
}
{% endfor %}