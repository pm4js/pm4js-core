## Process Mining for Javascript - Documentation

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

## Petri Nets

Petri Nets are widely used process models in process mining for their clear execution semantics. In PM4JS, we offer support for Petri nets (data structure, execution semantics, importing/exporting).

### Data Structure
The classes for the Petri net objects are the following and are located [here](./pm4js/objects/petri_net/petri_net.js)

The **PetriNet** class contains the following attributes:
* **name**: the name of the Petri net
* **places**: a dictionary containing places (key: place identifier; value: place object)
* **transitions**: a dictionary containing transitions (key: transition name; value: transition object)
* **arcs**: a dictionary containing arcs (key: arc name; value: arc object)
* **properties**: a dictionary containing optional properties
Constructor: **= new PetriNet('name')** builds a Petri net with the given name.

The **PetriNetPlace** class contains the following attributes:
* **name**: the name of the place
* **inArcs**: the set of arcs that are entering the place
* **outArcs**: the set of arcs that are exiting the place
* **properties**: a dictionary containing optional properties
Constructor: **= new PetriNetPlace('name')** builds a place with the given unique name (but does not add it to the Petri net).

The **PetriNetTransition** class contains the following attributes:
* **name**: the name of the transition
* **label**: the label associated to the transition
* **inArcs**: the set of arcs that are entering the transition
* **outArcs**: the set of arcs that are exiting the transition
* **properties**: a dictionary containing optional properties
Constructor: **= new PetriNetTransition('name', 'label')** builds a transition with the given unique name and a label not necessarily unique (but does not add it to the Petri net). The label could be possibly null if an invisible transition is added.

The **PetriNetArc** class contains the following attributes:
* **source**: the source place/transition of the arc
* **target**: the target place/transition of the arc
* **weight**: the weight of the arc
* **properties**: a dictionary containing optional properties
Constructor: **= new PetriNetArc(source, target, weight)**

The **Marking** class contains the following attributes:
* **net**: the Petri net on top of which the marking is defined
* **tokens**: a dictionary associating to the places of the Petri net the corresponding number of tokens.
Constructor: **= new Marking(net, tokens)**

The **AcceptingPetriNet** class contains the following attributes:
* **net**: a Petri net
* **im**: the initial marking (state) of the Petri net
* **fm**: the final marking (state) of the Petri net
Constructor: **= new AcceptingPetriNet(petriNet, initialMarking, finalMarking)**

### Creation of a Petri net

1. A PetriNet object can be created with a name (**let petriNet = new PetriNet('name')**).
2. A place (source place) can be added to a Petri net with a given unique name (**let source = petriNet.addPlace('source')**).
3. A place (sink place) can be added to the Petri net (**let sink = petriNet.addPlace('sink')**).
4. A visible transition can be added to the Petri net (**let visible = petriNet.addTransition('VIS', 'Visible transition')**).
5. An invisible transition can be added to the Petri net (**let invisible = petriNet.addTransition('INVIS', null)**).
6. The arcs can be added to the Petri net (**petriNet.addArcFromTo(source, visible)**, **petriNet.addArcFromTo(source, invisible)**)
 
### Execution Semantics


### Importing / Exporting
An accepting Petri net can be imported from a .PNML file by reading its contents and using the importer as follows:

**let acceptingPetriNet = PnmlImporter.apply(pnmlStri);**

Practical example:
**$.get("trial.pnml", function(data) {
let acceptingPetriNet = PnmlImporter.apply(pnmlStri);
});**

An accepting Petri net can be exported to a XML string (PNML standard) by doing:
**let xmlStri = PnmlExporter.apply(acceptingPetriNet);**