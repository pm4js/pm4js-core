class DtUtils {
	static dtToNodes(decisionTree) {
		let rootNode = decisionTree.root;
		rootNode.depth = 0;
		rootNode.categories = {};
		rootNode.parent = null;
		let visited = [];
		let toVisit = [rootNode];
		while (toVisit.length > 0) {
			let el = toVisit.pop();
			visited.push(el);
			if (el.category == null) {
				let lst = [el.match, el.notMatch];
				for (let el2 of lst) {
					if (el2 != null) {
						el2.depth = el.depth + 1;
						el2.categories = {};
						el2.parent = el;
						toVisit.push(el2);
					}
				}
			}
		}
		visited.reverse();
		let i = 0;
		while (i < visited.length) {
			let el = visited[i];
			let match = el.match;
			let notMatch = el.notMatch;
			if (match != null) {
				if (match.category != null) {
					el.categories[match.category] = el.matchedCount;
				}
				else {
					for (let cat in match.categories) {
						if (!(cat in el.categories)) {
							el.categories[cat] = match.categories[cat];
						}
						else {
							el.categories[cat] += match.categories[cat];
						}
					}
				}
			}
			if (notMatch != null) {
				if (notMatch.category != null) {
					el.categories[notMatch.category] = el.notMatchedCount;
				}
				else {
					for (let cat in notMatch.categories) {
						if (!(cat in el.categories)) {
							el.categories[cat] = notMatch.categories[cat];
						}
						else {
							el.categories[cat] += notMatch.categories[cat];
						}
					}
				}
			}
			i++;
		}
		visited.reverse();
		i = 0;
		while (i < visited.length) {
			visited[i].nidx = i;
			if (visited[i].categories != null) {
				let cat = Object.keys(visited[i].categories);
				let mc = cat[0];
				let mcc = visited[i].categories[mc];
				let summ = mcc;
				let j = 1;
				while (j < cat.length) {
					let thiscc = visited[i].categories[cat[j]]
					if (thiscc > mcc) {
						mc = cat[j];
						mcc = thiscc;
					}
					summ += thiscc;
					j++;
				}
				visited[i].mainCategory = mc;
				visited[i].mainCategoryCount = mcc;
				visited[i].mainCategoryPrevalence = mcc / summ;
			}
			i++;
		}
		return visited;
	}
	
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = DtUtils.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static getGvizString(nodes) {
		let ret = ["digraph G {"];
		let nodeUuids = {};
		for (let n of nodes) {
			let nuid = DtUtils.nodeUuid();
			nodeUuids[n.nidx] = nuid;
			let label = "";
			if (n.attribute != null) {
				label = n.attribute + " " + n.predicateName + " " + n.pivot + "\nN="+n.matchedCount+n.notMatchedCount+"\ncat = " + n.mainCategory+" ("+Math.round(n.mainCategoryPrevalence * 100, 2)+" %)";
			}
			else {
				label = "cat = "+n.category;
			}
			ret.push(nuid+" [label=\""+label+"\", shape=\"box\"];");
		}
		for (let n of nodes) {
			if (n.attribute != null) {
				ret.push(nodeUuids[n.nidx]+" -> "+nodeUuids[n.match.nidx]+" [label=\"True\"];");
				ret.push(nodeUuids[n.nidx]+" -> "+nodeUuids[n.notMatch.nidx]+" [label=\"False\"];");
			}
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	module.exports = {DtUtils: DtUtils};
	global.DtUtils = DtUtils;
}
catch (err) {
	// not in node
}
