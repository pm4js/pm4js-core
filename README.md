# pm4js-core

### Process Mining for Javascript - Core Package
PM4Js is a library for process mining in Javascript. The execution is supported in modern browsers (Chrome, ...) and Node.JS
### Install
#### Browser
Include the script **dist/pm4js_latest.js** in your web page to use the functionalities of PM4Js.
#### Node (package)
Install pm4js by doing **npm install -g pm4js**. Then, PM4Js can be used in Node by doing:
**require('pm4js')**.
#### Node (local installation)
Clone the Git project, and install the required packages by doing **npm install**. Then, PM4Js can be used in Node by doing:
**require('./init.js')**.
### Documentation
Extensive documentation is available [here](./DOCS.md).
Some examples are included in the **examples/html** folder (HTML pages) and **examples/node** folder (Node.JS examples).
### Features
The library currently offers the following set of features:

* Objects
   * [Working with Event Logs](./DOCS.md#working-with-event-logs)
        * [Importing XES logs](./DOCS.md#importing-xes-logs)
        * [Importing CSV logs](./DOCS.md#importing-csv-logs)
        * [Exporting XES logs](./DOCS.md#exporting-xes-logs)
        * [Exporting CSV logs](./DOCS.md#exporting-csv-logs)
    * Petri Nets
	     * [Data Structure](./DOCS.md#petri-nets---data-structure)
	     * [Creation of a Petri net](./DOCS.md#petri-nets---creation-of-a-petri-net)
         * [Execution Semantics](./DOCS.md#petri-nets---execution-semantics)
         * [Importing Exporting](./DOCS.md#petri-nets---importing-exporting)
         * [Visualization (vanilla Graphviz)](./DOCS.md#petri-nets---visualization-vanilla-graphviz)
    * Process Trees
	    * [Data Structure](./DOCS.md#process-trees---data-structure)
	    * [Importing](./DOCS.md#process-trees---importing)
		* [Exporting](./DOCS.md#process-trees---exporting)
	    * [Visualization (vanilla Graphviz)](./DOCS.md#process-trees---visualization-vanilla-graphviz)
	    * [Conversion to an accepting Petri net](./DOCS.md#process-trees---conversion-to-an-accepting-petri-net)
	* Directly-Follows Graphs
		* [Frequency DFG](./DOCS.md#frequency-dfg)
		* [Performance DFG](./DOCS.md#performance-dfg)
		* [Importing a Frequency DFG](./DOCS.md#importing-a-frequency-dfg)
		* [Exporting a Frequency DFG](./DOCS.md#exporting-a-frequency-dfg)
		* [DFG capacity maximization](./DOCS.md#dfg-capacity-maximization)
* Algorithms 
	* Process Discovery
		* [Inductive Miner](./DOCS.md#inductive-miner)
		* [Inductive Miner Directly Follows](./DOCS.md#inductive-miner-directly-follows)
		* [Log Skeleton](./DOCS.md#log-skeleton)
		* [Directly Follows Graphs](./DOCS.md#directly-follows-graphs)
	* Conformance Checking
		* [Token-Based Replay](./DOCS.md#token-based-replay)
		* [Alignments on Petri nets](./DOCS.md#alignments-on-petri-nets)
		* [Alignments on Directly Follows Graphs](./DOCS.md#alignments-on-directly-follows-graphs)
		* [Conformance Checking using the Log Skeleton](./DOCS.md#conformance-checking-using-the-log-skeleton)
	* Evaluation
		* [Replay Fitness of Petri nets](./DOCS.md#replay-fitness-of-petri-nets)
		* [ETConformance precision of Petri nets](./DOCS.md#etconformance-precision-of-petri-nets)
		* [Generalization of Petri nets](./DOCS.md#generalization-of-petri-nets)
		* [Simplicity of Petri nets](./DOCS.md#simplicity-of-petri-nets)
	* Filtering
		* [Filtering Event Logs](./DOCS.md#filtering-event-logs)
		* [Sliding Directly Follows Graphs](./DOCS.md#sliding-directly-follows-graphs)
* Statistics
	* Log
		* [General Statistics](./DOCS.md#log---general-statistics)

### Support
Support is provided by mail at the following mail address: [Alessandro Berti](mailto:a.berti@pads.rwth-aachen.de).
