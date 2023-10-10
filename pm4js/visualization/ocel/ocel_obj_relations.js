class OcelObjRelationsVisualizer {
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
	
	static apply(ocel, objectsInteractionGraph, objectsDescendantsGraph, objectsCobirthGraph, objectsCodeathGraph, objectInheritanceGraph, enableInteractionGraph=true, enableDescendantsGraph=true, enableCobirthGraph=true, enableCodeathGraph=true, enableObjectInheritanceGraph=true) {
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		ret.push("rankdir=\"LR\"");
		let objectsArray = Object.keys(ocel["ocel:objects"]);
		for (let objId of objectsArray) {
			let obj = ocel["ocel:objects"][objId];
			let objType = obj["ocel:type"];
			let objTypeColor = OcelObjRelationsVisualizer.stringToColour(objType);
			let objGuid = OcelObjRelationsVisualizer.nodeUuid();
			ret.push(objGuid+" [label=\""+objId+"\n"+objType+"\", color=\""+objTypeColor+"\", textcolor=\""+objTypeColor+"\"]");
			uidMap[objId] = objGuid;
		}
		let interactionColor = "white";
		let descendantsColor = "white";
		let inheritanceColor = "white";
		let cobirthColor = "white";
		let codeathColor = "white";
		
		if (enableInteractionGraph) {
			interactionColor = "black";
		}
		if (enableDescendantsGraph) {
			descendantsColor = "gray";
		}
		if (enableCobirthGraph) {
			cobirthColor = "green";
		}
		if (enableCodeathGraph) {
			codeathColor = "red";
		}
		if (enableObjectInheritanceGraph) {
			inheritanceColor = "blue";
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
		if (objectInheritanceGraph != null) {
			for (let obj1 in objectInheritanceGraph) {
				let objuid1 = uidMap[obj1];
				for (let obj2 of objectInheritanceGraph[obj1]) {
					let objuid2 = uidMap[obj2];
					ret.push(objuid2+" -> "+objuid1+" [label=\"Inherits\", color="+inheritanceColor+", fontcolor="+inheritanceColor+"]");
				}
			}
		}
		if (objectsCobirthGraph != null) {
			for (let obj1 in objectsCobirthGraph) {
				let objuid1 = uidMap[obj1];
				for (let obj2 of objectsCobirthGraph[obj1]) {
					if (obj1 < obj2) {
						let objuid2 = uidMap[obj2];
						ret.push(objuid1 + " -> "+objuid2+" [label=\"CoBirth\", dir=none, color="+cobirthColor+", fontcolor="+cobirthColor+"]");
					}
				}
			}
		}
		if (objectsCodeathGraph != null) {
			for (let obj1 in objectsCodeathGraph) {
				let objuid1 = uidMap[obj1];
				for (let obj2 of objectsCodeathGraph[obj1]) {
					if (obj1 < obj2) {
						let objuid2 = uidMap[obj2];
						ret.push(objuid1 + " -> "+objuid2+" [label=\"CoDeath\", dir=none, color="+codeathColor+", fontcolor="+codeathColor+"]");
					}
				}
			}
		}
		
		ret.push("}");
		return ret.join('\n');
	}
}

try {
	module.exports = {OcelObjRelationsVisualizer: OcelObjRelationsVisualizer};
	global.OcelObjRelationsVisualizer = OcelObjRelationsVisualizer;
}
catch (err) {
	// not in node
}
