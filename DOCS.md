## Process Mining for Javascript (PM4JS) - Documentation

## Working with Event Logs

An event log is the starting point for a process mining analysis.
In PM4JS, we offer a data structure to store event data.
The structure is implemented in the class [**EventLog**](./pm4js/objects/log/log.js).

The class **EventLog** contains the following properties:
* **traces**: an array containing Trace objects (the cases of the event log).
* **attributes**: a dictionary associating to an attribute name an Attribute object. This contains the attributes at the log level.
* **classifiers**: a dictionary associating to each classifier name the list of attributes that should be considered as classifier.
* **extensions**: a dictionary associating to each extension name the prefix and the URI of the extension.
* **globals**: a dictionary associating to each global scope a Global object.

The class **Trace** contains the following properties:
* **events**: an array containing Event objects (the events of a case).
* **attributes**: a dictionary associating to an attribute name an Attribute object. This contains the attributes at the case level.

The class **Event** contains the following properties:
* **attributes**: a dictionary associating to an attribute name an Attribute object. This contains the attributes at the event level.

The class **Attribute** contains the following properties:
* **value**: the value of the attribute.
* **children**: child attributes, each one of the Attribute class.

It is possible to iterate over a log object, and its properties, as follows:
for trace in log.traces:
> console.log(trace.attributes["concept:name"].value); // prints the case identifier (standard XES)

> for event in trace.events:

> > console.log(event.attributes["concept:name"].value); // prints the activity name (standard XES)

### Importing XES logs

[XES](https://xes-standard.org/) is the current standard for the storage of event logs. A XES file is an XML file with a given structure. We can import the contents of a XES file in an **EventLog** object by doing:
**let eventLog = XesImporter.apply(xmlString);**
A practical example (using JQuery) to read a file located in **prova.xes** :

$.get("prova.xes", function(data) {
> let eventLog = XesImporter.apply(data);
> console.log(eventLog);
> 
});

### Importing CSV logs

Similarly to XES, also the importing of CSVs starts from the contents of a string.

**let eventLog = CsvImporter.apply(txtStri, 'sep', 'quotechar', 'case ID column', 'activity column', 'timestamp column');**

where:
* **txtStri** is the string containing the CSV to be imported.
* **sep** is the separator character (the character that splits the strings).
* **quotechar** is the quote character (allows for the separator inside the quote).
* **case ID column** is the column of the CSV that is the case identifier
* **activity column** is the column of the CSV that is the activity
* **timestamp column** is the column of the CSV that is the timestamp

A pratical example (using JQuery) to read a file located in **prova.xes** is the following (where the case identifier  column is **case:concept:name**, the activity column is **concept:name**, the timestamp column is **time:timestamp** ):

$.get("prova.csv", function(data) {
> let eventLog = CsvImporter.apply(data, ",", "\"", "case:concept:name", "concept:name", "time:timestamp");
> console.log(eventLog);
> 
});

### Exporting XES logs

An event log in PM4JS can be exported to a string representing a XES event log by doing:
**var xmlStri = XesExporter.apply(eventLog);**

### Exporting CSV logs

An event log in PM4JS can be exported to a string representing a CSV event log by doing:
**var csvStri = CsvExporter.apply(eventLog, 'sep', 'quotechar');**

Where:
* **sep**  is the separator character (the character that splits the strings).
* **quotechar** is the quote character (allows for the separator inside the quote).

A practical example follows:
**var csvStri = CsvExporter.apply(eventLog, ",", "\"")**

# Petri Nets

Petri Nets are widely used process models in process mining for their clear execution semantics. In PM4JS, we offer support for Petri nets (data structure, execution semantics, importing/exporting).

### Data Structure
The classes for the Petri net objects are the following and are located [here](./pm4js/objects/petri_net/petri_net.js)

The **PetriNet** class contains the following attributes:
* **name**: the name of the Petri net
* **places**: a dictionary containing places (key: place identifier; value: place object)
* **transitions**: a dictionary containing transitions (key: transition name; value: transition object)
* **arcs**: a dictionary containing arcs (key: arc name; value: arc object)
* **properties**: a dictionary containing optional properties
_Constructor:_ **= new PetriNet('name')** builds a Petri net with the given name.
_Methods:_
* **.addPlace(name)**: adds a place to the Petri net with the provided (unique) name. Returns the object.
* **.addTransition(name, label)**: adds a transition to the Petri net with the provided (unique) name and label. If the label is null, the transition is considered to be invisible.
* **.addArcFromTo(source, target, weight)**: adds an arc to the Petri net with the provided sources, targets and weight (default weight: 1).
* **.removePlace(place)**: removes the given place from the Petri net.
* **.removeTransition(transition)**: removes the given transition from the Petri net.

The **PetriNetPlace** class contains the following attributes:
* **name**: the name of the place
* **inArcs**: the set of arcs that are entering the place. Expressed as dictionary associating to the arc identifier the arc object.
* **outArcs**: the set of arcs that are exiting the place. Expressed as dictionary associating to the arc identifier the arc object.
* **properties**: a dictionary containing optional properties
_Constructor:_ **= new PetriNetPlace('name')** builds a place with the given unique name (but does not add it to the Petri net).

The **PetriNetTransition** class contains the following attributes:
* **name**: the name of the transition
* **label**: the label associated to the transition
* **inArcs**: the set of arcs that are entering the transition. Expressed as dictionary associating to the arc identifier the arc object.
* **outArcs**: the set of arcs that are exiting the transition. Expressed as dictionary associating to the arc identifier the arc object.
* **properties**: a dictionary containing optional properties
_Constructor:_ **= new PetriNetTransition('name', 'label')** builds a transition with the given unique name and a label not necessarily unique (but does not add it to the Petri net). The label could be possibly null if an invisible transition is added.
_Methods:_
* **.getPreMarking()**: gets the marking with the minimal number of tokens that enables the given transition.
* **.getPostMarking()**: gets the marking with the tokens that are added by the execution of the given transition.
* **.checkPreset(marking)**: checks whether the provided marking activates the given transition.

The **PetriNetArc** class contains the following attributes:
* **source**: the source place/transition of the arc
* **target**: the target place/transition of the arc
* **weight**: the weight of the arc
* **properties**: a dictionary containing optional properties
_Constructor:_ **= new PetriNetArc(source, target, weight)**

The **Marking** class contains the following attributes:
* **net**: the Petri net on top of which the marking is defined
* **tokens**: a dictionary associating to the places of the Petri net the corresponding number of tokens.
_Constructor:_ **= new Marking(net, tokens)**
_Methods_:
* **.copy()**: returns a copy of the current marking
* **.equals(marking)**: checks if the provided marking is identical to the current one.
* **.setTokens(place, tokens)**: changes the token dictionary to set the provided number of tokens for the provided place.
* **.enabledTransitions()**: returns an array containing all the transitions that are activated in the current marking.
* **.execute(transition)**: given a transition that is enabled in the current marking, returns the marking (a new one) obtained after firing the transition from the current marking.

The **AcceptingPetriNet** class contains the following attributes:
* **net**: a Petri net
* **im**: the initial marking (state) of the Petri net
* **fm**: the final marking (state) of the Petri net
_Constructor:_ **= new AcceptingPetriNet(petriNet, initialMarking, finalMarking)**

### Creation of a Petri net

1. A PetriNet object can be created with a name (**let petriNet = new PetriNet('name')**).
2. A place (source place) can be added to a Petri net with a given unique name (**let source = petriNet.addPlace('source')**).
3. A place (sink place) can be added to the Petri net (**let sink = petriNet.addPlace('sink')**).
4. A visible transition can be added to the Petri net (**let visible = petriNet.addTransition('VIS', 'Visible transition')**).
5. An invisible transition can be added to the Petri net (**let invisible = petriNet.addTransition('INVIS', null)**).
6. The arcs can be added to the Petri net (**petriNet.addArcFromTo(source, visible)**, **petriNet.addArcFromTo(source, invisible)**)
 
### Execution Semantics
A marking is an object containing the execution state of the Petri net model. Usually the execution starts from an _initial marking_, and finishes in a _final marking_. Given a Petri net and a marking/state **marking** on top of the Petri net, the list of transitions which are currently enabled in the marking can be retrieved by executing the method **let enabledTransitions = marking.getEnabledTransitions()**.
Given a transition **t** which is enabled in the current marking, it is possible to retrieve the marking obtained from **marking** after executing **t** by doing **let newMarking = marking.execute(t)**.

### Importing / Exporting
An accepting Petri net can be imported from a .PNML file by reading its contents and using the importer as follows:

**let acceptingPetriNet = PnmlImporter.apply(pnmlStri);**

Practical example:
**$.get("trial.pnml", function(pnmlStri) {
let acceptingPetriNet = PnmlImporter.apply(pnmlStri);
});**

The single properties (**acceptingPetriNet.net** for the Petri net, **acceptingPetriNet.im** for the initial marking, **acceptingPetriNet.fm** for the final marking) can be accessed.

An accepting Petri net can be exported to a XML string (PNML standard) by doing:
**let xmlStri = PnmlExporter.apply(acceptingPetriNet);**

### Visualization (vanilla / GraphViz)

It is possible to obtain the Graphviz representation of an accepting Petri net object, which can be represented in Javascript by using the library [Viz.js](http://viz-js.com/).
The following code provides the visualization
**let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet); // console.log(gv); **

# Process trees

In PM4JS, we offer support for process trees. Process trees (in alternative to Petri nets) are models which describe well block-structured process models.

### Data Structure
The classes for the process tree objects are the following and are located [here](./pm4js/objects/process_tree/process_tree.js).
The different operators are available in the **ProcessTreeOperator** class:
* **ProcessTreeOperator.SEQUENCE**: the sequence operator
* **ProcessTreeOperator.PARALLEL**: the parallel operator (AND)
* **ProcessTreeOperator.INCLUSIVE**: the inclusive choice (OR)
* **ProcessTreeOperator.EXCLUSIVE**: the exclusive choice (XOR)
* **ProcessTreeOperator.LOOP**: the loop operator
The **ProcessTree** class is the main class for process trees and contains the following attributes:
* **parentNode**: the parent node of the current tree (the root of the process tree has **null** as parent.
* **operator**: the operator of the tree (an element of **ProcessTreeOperator**). For leaf, it is **null**.
* **label**: the label associated to the current node, if it is a visible leaf. **null** otherwise.
* **id**: an unique identifier of the process tree.
* **children**: a list containing all the children of the process tree (which are other process trees).
_Constructor_: **= new ProcessTree(parent tree, operator, label)**
Example (sequence operator, root): **= new ProcessTree(null, ProcessTreeOperator.SEQUENCE, null)**
Example (xor operator, child of root): **let child1 = new ProcessTree(root, ProcessTreeOperator.EXCLUSIVE, null)**
Example (visible leaf, child of root): **let child2 = new ProcessTree(root, null, 'label of the visibile leaf')**
Example (invisible leaf): **let child3 = new ProcessTree(root, null, null)**
The children must be added to the children list of their parent node:
**root.children.push(child1); root.children.push(child3); root.children.push(child4);**

### Importing
A process tree can be imported by a .ptml file by using the provided importer, as follows:
**let processTree = PtmlImporter.apply(ptmlXmlString);**
Practical example:
**$.get("trial.ptml", function(ptmlStri) {
let processTree = PnmlImporter.apply(ptmlStri);
console.log(processTree);
});**

### Visualization (vanilla / GraphViz)

It is possible to obtain the Graphviz representation of a process tree object, which can be represented in Javascript by using the library [Viz.js](http://viz-js.com/).
The following code provides the visualization starting from a process tree object
**let gv = ProcessTreeVanillaVisualizer.apply(processTree); console.log(gv);**

### Conversion to an accepting Petri net
A process tree object can be converted to an accepting Petri net, by using the included converter.
The following code provides the conversion starting from a process tree object
**let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);**