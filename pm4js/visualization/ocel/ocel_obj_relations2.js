class OcelObjRelations2Visualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = PetriNetVanillaVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static stringToColour(str) {
	  var hash = 0;
	  for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	  }
	  var colour = '#';
	  for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		colour += ('00' + value.toString(16)).substr(-2);
	  }
	  return colour;
	}
	
	static apply(ocel, objectsInteractionGraph, objectsDescendantsGraph, objectsParents, objectsLocks, objectsInterrupts, enableInteraction=true, enableDescendants=true, enableParents=true, enableLocks=true, enableInterrupts=true) {
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		ret.push("rankdir=\"LR\"");
		let objectsArray = Object.keys(ocel["ocel:objects"]);
		for (let objId of objectsArray) {
			let obj = ocel["ocel:objects"][objId];
			let objType = obj["ocel:type"];
			let objTypeColor = OcelObjRelations2Visualizer.stringToColour(objType);
			let objGuid = OcelObjRelationsVisualizer.nodeUuid();
			ret.push(objGuid+" [label=\""+objId+"\n"+objType+"\", color=\""+objTypeColor+"\", textcolor=\""+objTypeColor+"\"]");
			uidMap[objId] = objGuid;
		}
		let interactionColor = "white";
		let descendantsColor = "white";
		let parentsColor = "white";
		let locksColor = "white";
		let interruptsColor = "white";
		
		if (enableInteraction) {
			interactionColor = "black";
		}
		if (enableDescendants) {
			descendantsColor = "gray";
		}
		if (enableParents) {
			parentsColor = "lightblue";
		}
		if (enableLocks) {
			locksColor = "violet";
		}
		if (enableInterrupts) {
			interruptsColor = "brown";
		}
		
		if (objectsInteractionGraph != null) {
			for (let obj1 in objectsInteractionGraph) {
				let objuid1 = uidMap[obj1];
				for (let obj2 of objectsInteractionGraph[obj1]) {
					if (obj1 < obj2) {
						let objuid2 = uidMap[obj2];
						ret.push(objuid1 + " -> "+objuid2+" [label=\"Interacts\", dir=none, color="+interactionColor+", fontcolor="+interactionColor+"]");
					}
				}
			}
		}
		
		if (objectsDescendantsGraph != null) {
			for (let obj1 in objectsDescendantsGraph) {
				let objuid1 = uidMap[obj1];
				for (let obj2 of objectsDescendantsGraph[obj1]) {
					let objuid2 = uidMap[obj2];
					ret.push(objuid2+" -> "+objuid1+" [label=\"Descends\", color="+descendantsColor+", fontcolor="+descendantsColor+"]");
				}
			}
		}
		
		if (objectsParents != null) {
			for (let obj1 in objectsParents) {
				let objuid1 = uidMap[obj1];
				let obj2 = objectsParents[obj1];
				let objuid2 = uidMap[obj2];
				ret.push(objuid2+" -> "+objuid1+" [label=\"IsParent\", color="+parentsColor+", fontcolor="+parentsColor+"]");
			}
		}
		
		if (objectsLocks != null) {
			for (let obj1 in objectsLocks) {
				let objuid1 = uidMap[obj1];
				for (let obj2 of objectsLocks[obj1]) {
					let objuid2 = uidMap[obj2];
					ret.push(objuid1+" -> "+objuid2+" [label=\"Locks\", color="+locksColor+", fontcolor="+locksColor+"]");
				}
			}
		}
		
		if (objectsInterrupts != null) {
			for (let obj1 in objectsInterrupts) {
				let objuid1 = uidMap[obj1];
				for (let obj2 of objectsInterrupts[obj1]) {
					let objuid2 = uidMap[obj2];
					ret.push(objuid1+" -> "+objuid2+" [label=\"Interrupts\", color="+interruptsColor+", fontcolor="+interruptsColor+"]");
				}
			}
		}
		
		ret.push("}");
		return ret.join('\n');
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelObjRelations2Visualizer: OcelObjRelations2Visualizer};
	global.OcelObjRelations2Visualizer = OcelObjRelations2Visualizer;
}
catch (err) {
	// not in node
}
