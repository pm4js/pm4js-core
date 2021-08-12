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
	    * [Visualization (vanilla Graphviz)](#process-trees---visualization-vanilla-graphviz)
	    * [Conversion to an accepting Petri net](#process-trees---conversion-to-an-accepting-petri-net)
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
	* [Filtering]
		* [Filtering Event Logs](#filtering-event-logs)
* Statistics
	* Log
		* [General Statistics](#log---general-statistics)

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

### Process trees - Visualization vanilla Graphviz

It is possible to obtain the Graphviz representation of a process tree object, which can be represented in Javascript by using the library [Viz.js](http://viz-js.com/).
The following code provides the visualization starting from a process tree object
**let gv = ProcessTreeVanillaVisualizer.apply(processTree); console.log(gv);**

### Process trees - Conversion to an accepting Petri net
A process tree object can be converted to an accepting Petri net, by using the included converter.
The following code provides the conversion starting from a process tree object
**let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);**

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
to an invisible transition can have either cost 0 or 1, another move on model or a move on log has cost 10000; so, traces having an alignment cost lower than 10000 are to be considered fit).
* **movesUsage**: the number of occurrences for each move in all the reported alignments.
* **fitTraces**: the number of traces that are fit, given the optimal alignment.
* **totalCost**: the sum of the costs of all the alignments that are performed.

### Alignments on Directly Follows Graphs

The optimal alignments approach on DFGs works in a similar way to the aforementioned approach on Petri nets. To execute (optimal) alignments based on a DFG, the following command can be executed:

**let alignmentResult = DfgAlignments.apply(eventLog, frequencyDfg);**

The object **alignmentResult**, of type **DfgAlignmentsResults**, contains the following properties:
* **logActivities**: dictionary associating to each activity of the event log its number of occurrences.
* **frequencyDfg**: the frequency directly-follows graph against which the alignments are performed.
* **overallResult**: array containing the alignments results for each trace of the event log. Each alignment is a dictionary with two keys: **alignment**, that is the
list of moves performed during the alignments, and **cost**, that is the total cost of the moves (with the assumption that a sync move has cost 0, an move on model corresponding
to an invisible transition can have either cost 0 or 1, another move on model or a move on log has cost 10000; so, traces having an alignment cost lower than 10000 are to be considered fit).
* **movesUsage**: the number of occurrences for each move in all the reported alignments.
* **fitTraces**: the number of traces that are fit, given the optimal alignment.
* **totalCost**: the sum of the costs of all the alignments that are performed.

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

# Statistics

## Log

### Log - General Statistics

PM4JS offers some general log [statistics](./pm4js/statistics/log/general.js). The provided statistics are:
* Retrieval of a dictionary of start activities. For each start activity, returns the number of cases that started with the given activity: **GeneralLogStatistics.getStartActivities(eventLog)**. As optional parameter, an activity key can be provided.
* Retrieval of a dictionary of end activities. For each end activity, returns the number of cases that finished with the given activity: **GeneralLogStatistics.getEndActivities(eventLog)**. As optional parameter, an activity key can be provided.
* Retrieval of the count of the occurrences of the values of an attribute (as dictionary): **GeneralLogStatistics.getAttributeValues(eventLog, attributeKey)**
* Retrieval of the variants of an event log. A dictionary associating to each variant the number of occurrences for the given variant is returned: **GeneralLogStatistics.getVariants(eventLog)**. As optional parameter, an activity key can be provided.
* Retrieval of the set of attributes at the event level starting from an event log: **GeneralLogStatistics.getEventAttributesList(eventLog)**
* Retrieval of the set of attributes at the trace level starting from an event log: **GeneralLogStatistics.getCaseAttributesList(eventLog)**
* Retrieval of the average sojourn time for each activity of the event log: **GeneralLogStatistics.getAverageSojournTime(eventLog, "concept:name", "time:timestamp", "time:timestamp")** (the arguments are the event log, the activity key, the timestamp key, the start timestamp key.
