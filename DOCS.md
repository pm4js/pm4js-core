# Process Mining for Javascript (PM4JS) - Documentation

## Menu

* Objects
   * [Working with Event Logs](#working-with-event-logs)
        * [Importing XES logs](#importing-xes-logs)
        * [Importing CSV logs](#importing-csv-logs)
        * [Exporting XES logs](#exporting-xes-logs)
        * [Exporting CSV logs](#exporting-csv-logs)
    * Petri Nets
	     * [Data Structure](#petri-nets---data-structure)
	     * [Creation of a Petri net](#petri-nets---creation-of-a-petri-net)
         * [Execution Semantics](#petri-nets---execution-semantics)
         * [Importing Exporting](#petri-nets---importing-exporting)
         * [Visualization (vanilla Graphviz)](#petri-nets---visualization-vanilla-graphviz)
    * Process Trees
	    * [Data Structure](#process-trees---data-structure)
	    * [Importing](#process-trees---importing)
		* [Exporting](#process-trees---exporting)
	    * [Visualization (vanilla Graphviz)](#process-trees---visualization-vanilla-graphviz)
	    * [Conversion to an accepting Petri net](#process-trees---conversion-to-an-accepting-petri-net)
	* Directly-Follows Graphs
		* [Frequency DFG](#frequency-dfg)
		* [Performance DFG](#performance-dfg)
		* [Importing a Frequency DFG](#importing-a-frequency-dfg)
		* [Exporting a Frequency DFG](#exporting-a-frequency-dfg)
		* [DFG capacity maximization](#dfg-capacity-maximization)
	* BPMN
		* [BPMN objects](#bpmn-objects)
		* [Importing BPMN](#importing-bpmn)
		* [Exporting BPMN](#exporting-bpmn)
		* [Converting a BPMN to an accepting Petri net](#converting-a-bpmn-to-an-accepting-petri-net)
		* [Converting an accepting Petri net to BPMN](#converting-an-accepting-petri-net-to-bpmn)
* Algorithms 
	* Process Discovery
		* [Inductive Miner](#inductive-miner)
		* [Inductive Miner Directly Follows](#inductive-miner-directly-follows)
		* [Log Skeleton](#log-skeleton)
		* [Directly Follows Graphs](#directly-follows-graphs)
	* Conformance Checking
		* [Token-Based Replay](#token-based-replay)
		* [Alignments on Petri nets](#alignments-on-petri-nets)
		* [Alignments on Directly Follows Graphs](#alignments-on-directly-follows-graphs)
		* [Conformance Checking using the Log Skeleton](#conformance-checking-using-the-log-skeleton)
	* Evaluation
		* [Replay Fitness of Petri nets](#replay-fitness-of-petri-nets)
		* [ETConformance precision of Petri nets](#etconformance-precision-of-petri-nets)
		* [Generalization of Petri nets](#generalization-of-petri-nets)
		* [Simplicity of Petri nets](#simplicity-of-petri-nets)
	* Filtering
		* [Filtering Event Logs](#filtering-event-logs)
		* [Sliding Directly Follows Graphs](#sliding-directly-follows-graphs)
	* Simulation
		* [Playout of a DFG](#playout-of-a-dfg)
	* [Feature Extraction](#feature-extraction)
	* [Interval Analysis](#interval-analysis)
* Statistics
	* Log
		* [General Statistics](#log---general-statistics)
* Support for Celonis
	* [Celonis Connector](#celonis-connector)


# Objects

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

### Petri Nets - Data Structure
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

### Petri Nets - Creation of a Petri net

1. A PetriNet object can be created with a name (**let petriNet = new PetriNet('name')**).
2. A place (source place) can be added to a Petri net with a given unique name (**let source = petriNet.addPlace('source')**).
3. A place (sink place) can be added to the Petri net (**let sink = petriNet.addPlace('sink')**).
4. A visible transition can be added to the Petri net (**let visible = petriNet.addTransition('VIS', 'Visible transition')**).
5. An invisible transition can be added to the Petri net (**let invisible = petriNet.addTransition('INVIS', null)**).
6. The arcs can be added to the Petri net (**petriNet.addArcFromTo(source, visible)**, **petriNet.addArcFromTo(source, invisible)**)
 
### Petri Nets - Execution Semantics
A marking is an object containing the execution state of the Petri net model. Usually the execution starts from an _initial marking_, and finishes in a _final marking_. Given a Petri net and a marking/state **marking** on top of the Petri net, the list of transitions which are currently enabled in the marking can be retrieved by executing the method **let enabledTransitions = marking.getEnabledTransitions()**.
Given a transition **t** which is enabled in the current marking, it is possible to retrieve the marking obtained from **marking** after executing **t** by doing **let newMarking = marking.execute(t)**.

### Petri Nets - Importing Exporting
An accepting Petri net can be imported from a .PNML file by reading its contents and using the importer as follows:

**let acceptingPetriNet = PnmlImporter.apply(pnmlStri);**

Practical example:
**$.get("trial.pnml", function(pnmlStri) {
let acceptingPetriNet = PnmlImporter.apply(pnmlStri);
});**

The single properties (**acceptingPetriNet.net** for the Petri net, **acceptingPetriNet.im** for the initial marking, **acceptingPetriNet.fm** for the final marking) can be accessed.

An accepting Petri net can be exported to a XML string (PNML standard) by doing:
**let xmlStri = PnmlExporter.apply(acceptingPetriNet);**

### Petri Nets - Visualization vanilla Graphviz

It is possible to obtain the Graphviz representation of an accepting Petri net object, which can be represented in Javascript by using the library [Viz.js](http://viz-js.com/).
The following code provides the visualization
**let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet); // console.log(gv); **

## Process trees

In PM4JS, we offer support for process trees. Process trees (in alternative to Petri nets) are models which describe well block-structured process models.

### Process trees - Data Structure
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
**root.children.push(child1); root.children.push(child2); root.children.push(child3);**

### Process trees - Importing

A process tree can be imported by a .ptml file by using the provided importer, as follows:
**let processTree = PtmlImporter.apply(ptmlXmlString);**
Practical example:
**$.get("trial.ptml", function(ptmlStri) {
let processTree = PnmlImporter.apply(ptmlStri);
console.log(processTree);
});**

### Process trees - Exporting

A process tree can be exported into an XML string, which can be then be stored in a .ptml file, by using the provided exporter, as follows:
**let xmlStri = PtmlExporter.apply(processTree);**

### Process trees - Visualization vanilla Graphviz

It is possible to obtain the Graphviz representation of a process tree object, which can be represented in Javascript by using the library [Viz.js](http://viz-js.com/).
The following code provides the visualization starting from a process tree object
**let gv = ProcessTreeVanillaVisualizer.apply(processTree); console.log(gv);**

### Process trees - Conversion to an accepting Petri net
A process tree object can be converted to an accepting Petri net, by using the included converter.
The following code provides the conversion starting from a process tree object
**let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);**

## Directly-Follows Graphs

### Frequency DFG

A frequency directly-follows graph is a type of model where the nodes are the activities, and edges express the directly-follows relationship between activities.
In PM4JS, it is implemented as an object with the following properties:
* **activities**: a dictionary associating to each activity the number of occurrences in the log.
* **startActivities**: a dictionary associating to each start activity the number of cases which started with the given activity. The activities must be elements of **activities**.
* **endActivities**: a dictionary associating to each end activity the number of cases which ended with the given activity. The activities must be elements of **activities**.
* **pathsFrequency**: a dictionary associating to each path between activities (expressed as a string separated by commas) the number of occurrences of the path.

A frequency DFG object can be instantiated in PM4JS with the following command: **let freqDfg = new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency)**.
So having the four dictionaries permits to create the frequency DFG object.

### Performance DFG

A performance directly-follows graph is a type of model where the nodes are the activities, and edges contain an aggregation of the times between the different activities.
In PM4JS, it is implemented as an object with the following properties:
* **activities**: a dictionary associating to each activity the number of occurrences in the log.
* **startActivities**: a dictionary associating to each start activity the number of cases which started with the given activity. The activities must be elements of **activities**.
* **endActivities**: a dictionary associating to each end activity the number of cases which ended with the given activity. The activities must be elements of **activities**.
* **pathsFrequency**: a dictionary associating to each path between activities (expressed as a string separated by commas) the number of occurrences of the path.
* **pathsPerformance**: a dictionary associating to each path between activities (expressed as a string separated by commas) the number of occurrences of the path. All the keys of
**pathsPerformance** shall also be keys of the **pathsFrequency** dictionary.
* **sojournTimes**: a dictionary associating to each activity the sojourn time in the activity (which is a positive real number). All the activities of **activities** should be
associated with their sojourn time.

A performance DFG object can be instantiated in PM4JS with the following command: **let perfDfg = new PerformanceDfg(activities, startActivities, endActivities, pathsFrequency, pathsPerformance, sojournTimes)**

### Importing a Frequency DFG

A frequency DFG can be imported from the contents of a **.dfg** file as follows:
**let frequencyDfg = FrequencyDfgImporter.apply(content);**
Practical example:
**$.get("trial.dfg", function(content) {
let frequencyDfg = FrequencyDfgImporter.apply(content);
console.log(frequencyDfg);
});**

### Exporting a Frequency DFG

A frequency DFG can be exported into the contents of a **.dfg** file as follows:
**let txtStri = FrequencyDfgExporter.apply(frequencyDfg);**

### DFG capacity maximization

Given the application of a DFG filtering operation, it might be that some arcs are lost and the sum of the ingoing/outgoing arcs is not matching exactly
the one of the underlying activities. To reduce this unpleasant effect, a possibility to maximize the arcs of the DFG is offered.

To apply the DFG maximization, the following command can be used:
**let maximizedDfg = FilteredDfgMaximization.apply(frequencyDfg);**

This requires the solution of a linear problem, in which the capacity of the arcs is maximized.

## BPMN

BPMN is a process notation with widespread usage in the business language, since it is very expressive and simple to discuss.
In PM4JS, we offer support for the management of BPMN diagrams.

### BPMN objects

The main class related to BPMN diagrams is **BpmnGraph**. An object of such class can be constructed by providing an identifier (with the **id** prefix and a combination of letters and numbers), so **new BpmnGraph(id)**.

The properties of the graph class are:
* **id**: a string uniquely identifying the diagram.
* **name**: a string that describes the content of the diagram.
* **nodes**: a dictionary associating to each node ID the corresponding node object (see later).
* **edges**: a dictionary associating to each edge ID the corresponding edge object (see later).
* **properties**: a dictionary hosting additional properties associated to the diagram.

The methods of this class are:
* **addNode(id)**: if a node with the given identifier is not contained in the diagram, adds and returns a new node object having the given identifier. Otherwise, returns the existing node.
* **addEdge(id)**: if an edge with the given identifier is not contained in the diagram, adds and returns a new edge object having the given identifier. Otherwise, returns the existing edge.
* **removeNode(id)**: removed the node with the given identifier in the diagram.

The class related to the BPMN nodes is **BpmnNode**. An object of such class can be constructed by providing the BPMN graph object and an unique
identifier (with the **id** prefix and a combination of letters and numbers), so **new BpmnNode(graph, id)**. Although, it is advised to use the method **addNode** of the graph object to add a new node in the BPMN diagram.

The properties of the node class are:
* **graph**: the BPMN graph the node belongs to.
* **id**: a string uniquely identifying the node.
* **name**: a string describing the meaning of the node.
* **type**: a string describing the type of the node (task, gateway ...).
* **incoming**: a dictionary of the incoming edges.
* **outgoing**: a dictionary of the outgoing edges.
* **bounds**: contains four properties (**x**, **y**, **width**, **height**) which describe
the absolute position and the size of the node in the graph.
* **properties**: a dictionary hosting additional properties associated to the node.

The methods of this class are:
* **addIncoming(id)**: adds an edge, with the given identifier, as incoming edge to the node (the edge enters the node).
* **addOutgoing(id)**: adds an edge, with the given identifier, as outgoing edge to the node (the edge exits the node).

The class related to the BPMN edges is **BpmnEdge**. An object of such class can be constructed by providing the BPMN graph object
and an unique identifier (with the **id** prefix and a combination of letters and numbers), so **new BpmnEdge(graph, id)**. Although, it is advised to use the method **addEdge** of the graph object to add a new edge in the BPMN diagram.

The properties of the edge class are:
* **graph**: the BPMN graph the node belongs to.
* **id**: a string uniquely identifying the edge.
* **name**: a string describing the meaning of the edge.
* **source**: a property containing the reference to the source node of the edge.
* **target**: a property containing the reference to the target node of the edge.
* **waypoints**: a list of points that are traversed by the edge to go from the source node to the target node.
* **properties**: a dictionary hosting additional properties associated to the edge.

The methods of this class are:
* **setSource(id)**: sets the node with the given identifier as source of the current edge.
* **setTarget(id)**: sets the node with the given identifier as target of the current edge.

### Importing BPMN

A BPMN diagram can be imported from the contents of a **.bpmn** file as follows:
**let bpmnGraph = BpmnImporter.apply(content);**
Practical example:
**$.get("trial.bpmn", function(content) {
let bpmnGraph = BpmnImporter.apply(content);
console.log(bpmnGraph);
});**

### Exporting BPMN

A BPMN diagram can be exported into the contents of a **.bpmn** file as follows:
**let xmlStri = BpmnExporter.apply(bpmnGraph);**

### Converting a BPMN to an accepting Petri net

Petri nets are useful diagrams for conformance checking purposes, hence it might be necessary
to convert the BPMN diagrams to Petri nets if conformance checking becomes necessary.
This is actually implemented for diagrams containing tasks and exclusive/inclusive gateways.

To convert a BPMN diagram to an accepting Petri net, the following method can be used:
**let acceptingPetriNet = BpmnToPetriNetConverter.apply(bpmnGraph)**

### Converting an accepting Petri net to BPMN

While Petri nets are of high utility in process mining, BPMN diagrams are more interesting for a business.
Hence, in some contexts the conversion of Petri net to BPMN diagrams may be useful.

To convert a workflow net (a sub-class of Petri nets) to a BPMN diagram, the following method can be used:
**let bpmnGraph = WfNetToBpmnConverter.apply(acceptingPetriNet)**

As important point to mention, the automatic layouting of the BPMN diagrams is still missing from the library.

# Algorithms

## Process Discovery

### Inductive Miner

The Inductive Miner is an important process discovery algorithm, that returns process trees with fitness [guarantees](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.396.197&rep=rep1&type=pdf).
The process tree can then be converted to a Petri net model, using the conversion method.

To discover a process tree from an event log using the inductive miner, the following command can be used:
**let processTree = InductiveMiner.apply(eventLog);**

The command can be provided with some parameters, including the activity key and the threshold for IMf (removing some noise from the log):
**let processTree = InductiveMiner.apply(eventLog, "concept:name", 0.2);**

### Inductive Miner Directly Follows

The Inductive Miner Directly-Follows is a version of the popular Inductive Miner algorithm that accepts as input a directly-follows graph and returns a process tree.
The process tree can then be converted to a Petri net model, using the conversion method.

To discover a process tree from an event log using the inductive miner, the following commands can be used:

**let frequencyDfg = FrequencyDfgDiscovery.apply(log, "concept:name");**

**let processTree = InductiveMiner.apply(null, null, 0.0, frequencyDfg);**


### Log Skeleton

A log skeleton is an important process model / classification approach that is learnt on an event log and can classify whether a trace belongs to the language of an event log.
The log skeleton approach is described [here](https://arxiv.org/pdf/1806.08247). The set of constraints discovered from the log skeleton are:
* **Equivalence**: assigns a probability that a couple of activities happen the same number of times inside a trace.
* **Never Together**: assigns a probability that a couple of activities do not happen together inside a trace.
* **Always After**: assigns a probability to a couple of activities, telling how much likely is that the second activity happens somewhen after the first activity of the couple.
* **Always Before**: assigns a probability to a couple of activities, telling how much likely is that the second activity happens somewhen before the first activity of the couple.
* **Directly-Follows**: assigns a probability to a couple of activities, telling how much likely is that the second activity directly-follows the first activity of the couple.
* **Activity Counter**: assigns a probability to the number of occurrences of an activity in a trace.

To discover a log skeleton from an event log, the following command can be used:
**let logSkeleton = LogSkeletonDiscovery.apply(eventLog);**

To provide the activity key to the discovery of the log skeleton, the following command can be used:
**let logSkeleton = LogSkeletonDiscovery.apply(eventLog, "concept:name");**

### Directly Follows Graphs

A directly-follows graph is a simple abstraction of the event log, that can show the activities of the graph and the relationships between them. We distinguish between
frequency directly-follows graph (showing the frequency of activities and paths), and performance directly-follows graphs (showing the performance of the paths, and the
sojourn times of the activities).

To discover a frequency directly-follows graph, the following commands can be used (the second is a detailed version of the first):
**let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog);**
**let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog, "concept:name");**

The Graphviz code of the frequency DFG visualization could be obtained doing:
**let gv = FrequencyDfgGraphvizVisualizer.apply(frequencyDfg);**

To discover a performance directly-follows graph, the following command can be used:
**let performanceDfg = PerformanceDfgDiscovery.apply(eventLog);**
**let performanceDfg = PerformanceDfgDiscovery.apply(eventLog, "concept:name");**

The Graphviz code of the performance DFG visualization could be obtained doing:
**let gv = PerformanceDfgGraphvizVisualizer.apply(performanceDfg);**

## Conformance Checking

### Token Based Replay

Token-based replay is a popular conformance checking technique, that measures conformance
between event logs and accepting Petri nets.
The implemented approach is described [here](ftp://ceur-ws.org/pub/publications/CEUR-WS/Vol-2371.zip#page=87).

Given an event log (of class **EventLog**) and an accepting Petri net (of class **AcceptingPetriNet**), the result of token-based replay can be obtained as follows (class **TokenBasedReplayResult**):
**let tokenBasedReplayResult = TokenBasedReplay.apply(eventLog, acceptingPetriNet);**
The returned object contains the following properties:
* **totalConsumed**: the number of consumed tokens among all the replayed cases.
* **totalProduced**: the number of produced tokens among all the replayed cases.
* **totalMissing**: the number of missing tokens among all the replayed cases.
* **totalRemaining**: the number of remaining tokens among all the replayed cases.
* **totalTraces**: the number of different cases in the replayed log.
* **fitTraces**: the number of cases that are perfectly fit according to the Petri net model.
* **logFitness**: the log fitness **0.5(1 - M/C) + 0.5(1 - R/P)**.
* **result**: contains a dictionary (replay results) for every case of the log.
* **averageTraceFitness*: the average of the fitness at the trace level, for all the cases of the log.
* **percentageFitTraces**: the ratio (between 0 and 1) of the traces of the log which are fit against the model.

The dictionary contains for each case the following properties:
* **consumed**: the number of consumed tokens during the replay.
* **produced**: the number of produced tokens during the replay.
* **missing**: the number of missing tokens during the replay.
* **remaining**: the number of remaining tokens during the replay.
* **visitedTransitions**: the transitions that were visited in the model during the replay
* **visitedMarkings**: the markings that were visited during the replay
* **missingActivitiesInModel**: activities that are in the case but not in the model.
* **fitness**: the value of fitness for the case **0.5(1 - M/C) + 0.5(1 - R/P)**
* **isFit**: boolean value that is True if the number of missing tokens is 0 and **missingActivitiesInModel** is empty; False otherwise
* **reachedMarking**: the marking reached at the end of the replay.

### Alignments on Petri nets

The optimal alignments approach try to find the best match between a process execution and a process model. The output of an alignment includes a list of moves,
of which the first component is referring to the trace, and the second component is referring to the model, leading both the trace/process execution
and the model from the initial to the final state. Alignments can act on different types of models. Here we consider alignments performed on accepting Petri nets.

Each move of the alignments can be:
* a sync move (when an activity is executed corresponding to a transition in the model). These are such that: **(register request; register request)**
* a move on model (when a transition is executed without a corresponding move in the process execution). These are such that: **(register request; >>)**
* a move on log (when an activity is executed in the trace without a corresponding move in the model). These are such that: **(>>; register request)**.

To execute (optimal) alignments based on a Petri net model, the following command can be executed:

**let alignmentResult = PetriNetAlignments.apply(eventLog, acceptingPetriNet)**
(as additional parameter, also the activity key, such as concept:name, can be provided).

The object **alignmentResult**, of type **PetriNetAlignmentsResults**, contains the following properties:
* **logActivities**: dictionary associating to each activity of the event log its number of occurrences.
* **acceptingPetriNet**: the accepting Petri net against which the alignments are performed.
* **overallResult**: array containing the alignments results for each trace of the event log. Each alignment is a dictionary with two keys: **alignment**, that is the
list of moves performed during the alignments, and **cost**, that is the total cost of the moves (with the assumption that a sync move has cost 0, an move on model corresponding
to an invisible transition can have either cost 0 or 1, another move on model or a move on log has cost 10000) which is then integer divided by 10000.
* **movesUsage**: the number of occurrences for each move in all the reported alignments.
* **totalTraces**: the number of traces of the underlying event log.
* **fitTraces**: the number of traces that are fit, given the optimal alignment.
* **totalCost**: the sum of the costs of all the alignments that are performed.
* **logFitness**: the log fitness against the model.
* **averageTraceFitness*: the average of the fitness at the trace level. The fitness for a trace is calculated as **1 - cost/bwc**, where *bwc* is the sum of the length of the trace and the
length of the shortest path in the model taking from the initial marking to the final marking.
* **percentageFitTraces**: the ratio (between 0 and 1) of the traces of the log which are fit against the model.

### Alignments on Directly Follows Graphs

The optimal alignments approach on DFGs works in a similar way to the aforementioned approach on Petri nets. To execute (optimal) alignments based on a DFG, the following command can be executed:

**let alignmentResult = DfgAlignments.apply(eventLog, frequencyDfg);**

The object **alignmentResult**, of type **DfgAlignmentsResults**, contains the following properties:
* **logActivities**: dictionary associating to each activity of the event log its number of occurrences.
* **frequencyDfg**: the frequency directly-follows graph against which the alignments are performed.
* **overallResult**: array containing the alignments results for each trace of the event log. Each alignment is a dictionary with two keys: **alignment**, that is the
list of moves performed during the alignments, and **cost**, that is the total cost of the moves (with the assumption that a sync move has cost 0, an move on model corresponding
to an invisible transition can have either cost 0 or 1, another move on model or a move on log has cost 10000) which is then integer divided by 10000.
* **movesUsage**: the number of occurrences for each move in all the reported alignments.
* **totalTraces**: the number of traces of the underlying event log.
* **fitTraces**: the number of traces that are fit, given the optimal alignment.
* **totalCost**: the sum of the costs of all the alignments that are performed.
* **logFitness**: the log fitness against the model.
* **averageTraceFitness*: the average of the fitness at the trace level. The fitness for a trace is calculated as **1 - cost/bwc**, where *bwc* is the sum of the length of the trace and the
length of the shortest path in the model taking from the initial marking to the final marking.
* **percentageFitTraces**: the ratio (between 0 and 1) of the traces of the log which are fit against the model.

### Conformance Checking using the Log Skeleton

It is possible to perform conformance checking between an event log and a log skeleton model. The command to perform conformance checking follows (the second is a more detailed version,
in which the activity key is provided as argument):
**let conformanceResult = LogSkeletonConformanceChecking.apply(log, skeleton)**
**let conformanceResult = LogSkeletonConformanceChecking.apply(log, skeleton, "concept:name")**

The returned object is of type *LogSkeletonConformanceCheckingResult*, and includes:
* **results**: the case-specific results of log skeleton conformance checking, that is an array of arrays, each subarray contains the deviations for a case.
* **deviationsRecord**: dictionary that associates to each type of deviation the list of indexes of the cases for which the deviation happen.
* **totalTraces**: total number of traces of the event log.
* **fitTraces**: number of traces of the event log which are fit according to the log skeleton model.

## Evaluation

### Replay Fitness of Petri nets

The replay fitness on Petri nets can be computed on different dimensions:
* The percentage of the traces of the log which are fit against the model.
* The overall log fitness.
* The average of the fitness for the single traces of the log.

The methods to calculate the fitness are derived from the implementations of token-based replay and alignments.
Namely,

**let fitnessResult = TbrFitness.apply(eventLog, acceptingPetriNet)** measures the fitness of the event log against the accepting Petri net model
using token-based replay. And

**let fitnessResult = AlignmentsFitness.apply(eventLog, acceptingPetriNet)** measures the fitness of the event log against the accepting Petri net model
using alignments.

The outputs of these methods are the ones described in the conformance checking section.

### ETConformance precision of Petri nets

The ETConformance is a way to measure precision which compare, for every possible prefix
of the event log, the set of transitions enabled in the log (the successors of the prefix)
and the transitions enabled in the model after replaying the prefix (using a replay technique such
as token-based replay). With these two sets of transitions, a set of escaping edges is found,
which is used to assign the precision. The ETConformance approach is described [here](http://www.bpm2010.org/wp-content/uploads/2010/05/Munoz-Gama-BPM10slides.pdf).

The precision using the ETConformance approach can be measured as follows:

**let precision = ETConformance.apply(eventLog, acceptingPetriNet)**

The output object (of class **ETConformanceResult**) contains the following properties:
* **activatedTransitions**: the total number of transitions activated in the model during the replay of the prefixes of the event log.
* **escapingEdges**: the total number of escaping edges obtained comparing the behavior allowed in the log and in the model.
* **precision**: the value of precision (between **0** and **1**).

### Generalization of Petri nets

The generalization is a less-well-defined concept than fitness and precision, but it is still one of the four fundamental evaluation properties. In [this](http://www.padsweb.rwth-aachen.de/wvdaalst/old/publications/p801.pdf) paper,
the generalization is defined as an average of the usage of the single transitions in the model during the replay. The more the transitions are needed during the
replay of the traces of the log, the more the generalization is high. We implemented the generalization approach using the token-based replay as underlying replay
algorithm.

The generalization (using this approach) can be measured as follows:

**let generalization = GeneralizationTbr.apply(eventLog, acceptingPetriNet)**

The output object (of class **GeneralizationTbrResults**) contains the following properties:
* **value**: the value of the generalization metric.

### Simplicity of Petri nets

The simplicity is a less-well-defined concept than fitness and precision, but it is still one of the four fundamental evaluation properties.
In [this](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.1066.6138&rep=rep1&type=pdf) paper, an approach to compute the simplicity is provided.
The average arc degree is calculated for both places and transitions. Then the simplicity is defined as an inverse of this mean degree (the details are contained in the paper).

The simplicity (using this approach) can be measured as follows:

**let simplicity = SimplicityArcDegree.apply(acceptingPetriNet)**

The output object (of class **SimplicityArcDegreeResults**) contains the following properties:
* **value**: the value of the simplicity metric.

## Filtering

### Filtering Event Logs

PM4JS offers different filtering functionalities, which can be used to restrict the behavior of an event log to the desidered one:
* **LogGeneralFiltering.filterStartActivities(log, activitiesArray, $positive$, $activityKey$)**: filters the cases having as start activity one of the ones specified in activitiesArray.
Can be reversed (keeping the traces not having as start activity one of the specified) by setting the positive parameter to false.
* **LogGeneralFiltering.filterEndActivities(log, activityArray, $positive$, $activityKey$)**: filters the cases having as end activity one of the ones specified in activitiesArray.
Can be reversed (keeping the traces not having as end activity one of the specified) by setting the positive parameter to false.
* **LogGeneralFiltering.filterVariants(log, variantsArray, $positive$, $activityKey$)**: filters the cases having as variant one of the ones specified in variantsArray.
Can be reversed (keeping the traces not having as variant one of the specified) by setting the postiive parameter to false.
* **LogGeneralFiltering.filterCaseSize(log, $minSize$, $maxSize$)**: filters the cases having a length (number of events) included in the specified range.
* **LogGeneralFiltering.filterCaseDuration(log, $minDuration$, $maxDuration$, $timestampKey$)**: filters the cases having a duration included in the specified range, with regards to the attribute
specified in **timestampKey**.
* **LogGeneralFiltering.filterCasesHavingEventAttributeValue(log, valuesArray, $positive$, $attributeKey$)**: filters the cases having at least one event for which the value for attribute key
falls in the specified range. Setting positive to false, it keeps the cases having no event for which the value for the attribute falls in the specified range.
* **LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, valuesArray, $positive$, $attributeKey$)**: filters the events (trimming the cases) having the specified value for the attribute.
Setting positive to false, it keeps the events for which the value for the attribute do not fall in the specified range.

The following logical-temporal filters are also implemented:
* **LogGeneralFiltering.fourEyesPrinciple(log, activity1, activity2, $positive$)**: if positive=false, filters the cases of the event log which violate the four eyes principle (activity1 and activity2 are done by the same resource); if positive=true, filters the cases of the event log which satisfy the four eyes principle.
* **LogGeneralFiltering.eventuallyFollows(log, [activity1, activity2, ...], $positive$)**: if positive=true, filters the cases of the event log where activity1 is eventually followed by activity2 is eventually followed ... if positive=false, filters the cases of the event log which do not satisfy such property.
* **LogGeneralFiltering.directlyFollows(log, [activity1, activity2, ...], $positive$)**: if positive=true, filters the cases of the event log where activity1 is directly followed by activity2 is directly followed ... if positive=false, filters the cases of the event log which do not satisfy such property.
* **LogGeneralFiltering.activityDoneDifferentResources(log, activity, $positive$)**: if positive=true, filters the cases of the event log where activity is repeated by different resources. If positive=false, filters the cases of the event log which do not satisfy such property.

### Sliding Directly Follows Graphs

PM4JS offers the possibility to slide the directly-follows graph, restricting the behavior to the desidered number of activities/paths.

To filter the directly-follows graph on the specified percentage of activities, the following command can be used:

**let filteredDfg = DfgSliders.filterDfgOnPercActivities(frequencyDfg, $percentage$)**

where percentage can be a number between 0 and 1. On the other hand, to filter the DFG on a specified amount of paths, the following command can be used:

**let filteredDfg = DfgSliders.filterDfgOnPercPaths(frequencyDfg, $percentage$, $keepAllActivities$)**

where percentage can be a number between 0 and 1; the **keepAllActivities** parameter is boolean (true/false) and establishes whether the filter is allowed
to remove activities (keepAllActivities=false) if the paths connecting them are infrequent, or is forced to keep the activities and at least one path entering/exiting them.

## Simulation

### Playout of a DFG

A playout operation returns an event log with a set of traces that are allowed by the model (in this case, a directly-follows graph).

To execute a playout of a DFG, and get the simulated log, the following command can be executed:
**let simulatedLog = DfgPlayout.apply(frequencyDfg);**

A more complete version of the aforementioned command is the following:
**let simulatedLog = DfgPlayout.apply(frequencyDfg, $numDesideredTraces$, $activityKey$);**
where **numDesideredTraces** is the desidered number of cases of the simulated log, and **activityKey** is the attribute at the event level that is used as activity.

## Feature Extraction

The conversion of a log to a matrix of numerical features is essential for machine learning purposes. Here, we describe the current implementation in PM4JS, that
accepts an event log and returns the matrix of the features (where each row is a different case).

The steps of the implemented feature selection are two:
* The features are selected from the log, or provided by the user.
* The matrix of the features is extracted.

The command:
**let featuresOutput = CaseFeatures.apply(eventLog);**
extracts the features from the log performing an automated feature selection.

The resulting **featuresOutput** variable is of type **CaseFeaturesOutput**, which has two fundamental properties:
* **data**: the matrix of features.
* **features**: the name of the features.

The **featuresOutput.data** can be provided to the available Javascript machine learning libraries to train any sort of model (e.g., clustering, classification, regression, ...).

To extract the matrix by providing manually the features to be used, the following command can be provided:
**let featuresOutput = CaseFeatures.apply(eventLog, $activityAttribute$, $caseIdAttribute$, $evStrAttr$, $evNumAttr$, $trStrAttr$, $trNumAttr$, $evSuccAttr$);**

Where:
* **activityAttribute** is the attribute at the event level that should be used as activity.
* **caseIdAttribute** is the attribute at the case level that should be used as case identifier.
* **evStrAttr** (if provided) is the list of string attributes at the event level that should be used for the feature extraction (one-hot encoding). If not provided, the default feature selection is performed for these attributes.
* **evNumAttr** (if provided) is the list of numeric attributes at the event level that should be used for the feature extraction. If not provided, the default feature selection is performed for these attributes.
* **trStrAttr** (if provided) is the list of string attributes at the case level that should be used  for the feature extraction (one-hot encoding). If not provided, the default feature selection is performed for these attributes.
* **trNumAttr** (if provided) is the list of numeric attributes at the case level that should be used for the feature extraction. If not provided, the default feature selection is performed for these attributes.
* **evSuccAttr** (if provided) use the paths between the attributes provided in the list as features.

## Interval Analysis

The interval analysis permits to understand different inter-case features of the event log (such as the work in progress, or the workload of a resource).

It starts from the construction of an interval tree given an event log.

**let intervalTree = IntervalTreeBuilder.apply(eventLog, timestampKey);**

The interval tree can be queried at any point of time to get information about the open activities of a case.
For example, if we have the following open cases (simplified): **c1: [[A, 1000], [B, 2000]], c2: [[A, 1100], [B, 1500]]**,
and perform:

**intervalTree.queryPoint(1300)**,

we will get both the exchange between the activities **A** and **B** of **c1**, and the activities **A** and **B** of **c2**,
while **intervalTree.queryPoint(1800)** would return only **c1** as open case.

After the calculation of the interval tree, several algorithms can be applied:

* **IntervalTreeAlgorithms.resourceWorkload(tree, pointOfTime)**: returns a dictionary with the number of events performed by a resource at a given point in time.
* **IntervalTreeAlgorithms.targetActivityWorkload(tree, pointOfTime)**: returns a dictionary with the number of events waiting to reach an activity at a given point in time.
* **IntervalTreeAlgorithms.sourceActivityWorkload(tree, pointOfTime)**: returns a dictionary with the number of events exiting an activity (and waiting to reach another act.) at a given point in time.

The information of the interval tree can be used, for example, to populate the token-flow in a process map.

# Statistics

## Log

### Log - General Statistics

PM4JS offers some general log [statistics](./pm4js/statistics/log/general.js). The provided statistics are:
* Retrieval of a dictionary of start activities. For each start activity, returns the number of cases that started with the given activity: **GeneralLogStatistics.getStartActivities(eventLog)**. As optional parameter, an activity key can be provided.
* Retrieval of a dictionary of end activities. For each end activity, returns the number of cases that finished with the given activity: **GeneralLogStatistics.getEndActivities(eventLog)**. As optional parameter, an activity key can be provided.
* Retrieval of the count of the occurrences of the values of an attribute (as dictionary): **GeneralLogStatistics.getAttributeValues(eventLog, attributeKey)**
* Retrieval of the variants of an event log. A dictionary associating to each variant the number of occurrences for the given variant is returned: **GeneralLogStatistics.getVariants(eventLog)**. As optional parameter, an activity key can be provided.
* Retrieval of the set of attributes at the event level starting from an event log: **GeneralLogStatistics.getEventAttributesList(eventLog)**
* Retrieval of the typed dictionary of attributes at the event level starting from an event log: **GeneralLogStatistics.getEventAttributesWithType(eventLog)**
* Retrieval of the set of attributes at the trace level starting from an event log: **GeneralLogStatistics.getCaseAttributesList(eventLog)**
* Retrieval of the typed dictionary of attributes at the trace level starting from an event log: **GeneralLogStatistics.getTraceAttributesWithType(eventLog)**
* Retrieval of the average sojourn time for each activity of the event log: **GeneralLogStatistics.getAverageSojournTime(eventLog, "concept:name", "time:timestamp", "time:timestamp")** (the arguments are the event log, the activity key, the timestamp key, the start timestamp key).
* Retrieval of the number of events the log: **GeneralLogStatistics.numEvents(eventLog)**.

# Support for Celonis

## Celonis Connector

We offer the possibility to connect to a Celonis instance with proxification (in the case of pure Javascript execution) and direct connection (with Node.JS).
In the folder **pm4js/utils/celonis** different proxies can be found. The script **celonis_proxy.py** is a simple Python proxy (based on Flask) that can be used
to connect PM4JS to Celonis.
Moreover, we offer the possibility to do the proxification using PHP (supported by popular web services). The offered proxies are:
* **celonis_proxy.php**: proxy for the GET calls.
* **celonis_proxy_post.php**: proxy for the POST calls.
* **celonis_proxy_put.php**: proxy for the PUT calls.

The proxy must be configured in the application, with the following syntax:

**CelonisMapper.PROXY_URL_GET = "URL TO THE GET PROXY"; CelonisMapper.PROXY_URL_POST = "URL TO THE POST PROXY"; CelonisMapper.PROXY_URL_PUT = "URL TO THE PUT PROXY";**

The connection can be instantiated with the following syntax (for the generation of the API key, please refer to the official documentation of Celonis):

**let celonisMapper = new CelonisMapper(celonisUrl, apiKey)**

The properties of the Celonis mapper object are:

* **dataPools**: associates the ID of a data pool with a dictionary containing information on the data pool.
* **dataPoolsNames**: associates the name of a data pool with its ID.
* **dataModels**: associates the ID of a data model with a dictionary containing information on the data model.
* **dataModelsNames**: associates the name of a data model with its ID.
* **dataPoolsDataModels**: associates the ID of a data pool with a dictionary mapping the ID of a data model to the data model itself.
* **dataModelsDataPools**: associates the ID of a data model with the corresponding ID of the data pool.
* **dataModelsTables**: associates the ID of a data model with its a dictionary associating the ID of a table with an object describing a table.
* **analysis**: associates the ID of an analysis with an object describing the analysis.
* **analysisNames**: associates the name of an analysis with the corresponding identifier.
* **analysisDataModel**: associates the ID of an analysis with the ID of the corresponding data model.

Some methods are offered by the Celonis mapper object:

* **createDataPool(dataPoolName)**: creates a new data pool with the specified name, and returns the corresponding identifier.
* **createDataModel(dataPoolId, dataModelName)**: creates a new data model with the specified name inside the data pool, and returns the corresponding identifier.
* **createWorkspace(dataModelId, workspaceName)**: creates a new workspace with the specified name, and returns the corresponding identifier.
* **createAnalysis(workspaceId, analysisName)**: creates a new analysis with the specified name, and returns the corresponding identifier.
* **addTableFromPool(dataModelId, tableName)**: adds a table from the data pool to the data model.
* **addForeignKey(dataModelId, table1, column1, table2, column2)**: adds a foreign key between two tables based on the provided information.
* **addProcessConfiguration(dataModelId, activityTable, caseTable, caseIdColumn, activityColumn, timestampColumn)**: adds a process configuration to the data model. A process configuration establishes the activity table, the case table (which can be null), the case ID column, the activity column and the timestamp column.
* **reloadDataModel(dataModelId)**: reloads the current data model.
* **performQueryAnalysis(analysisId, pqlQuery)**: performs the PQL query and returns the result as a Javascript array.

