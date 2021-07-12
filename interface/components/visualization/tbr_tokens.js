class TbrTokensVisualization {
	static apply(tbrResult, component0) {
		let component = document.getElementById(component0);
		let consumedTokensP = document.createElement("p");
		let consumedTokensD = document.createElement("span");
		consumedTokensD.innerHTML = "<b>Consumed tokens:</b> ";
		let consumedTokens = document.createElement("span");
		consumedTokens.innerHTML = tbrResult["totalConsumed"];
		consumedTokensP.appendChild(consumedTokensD);
		consumedTokensP.appendChild(consumedTokens);
		let producedTokensP = document.createElement("p");
		let producedTokensD = document.createElement("span");
		producedTokensD.innerHTML = "<b>Produced tokens:</b> ";
		let producedTokens = document.createElement("span");
		producedTokens.innerHTML = tbrResult["totalProduced"];
		producedTokensP.appendChild(producedTokensD);
		producedTokensP.appendChild(producedTokens);
		let missingTokensP = document.createElement("p");
		let missingTokensD = document.createElement("span");
		missingTokensD.innerHTML = "<b>Missing tokens:</b> ";
		let missingTokens = document.createElement("span");
		missingTokens.innerHTML = tbrResult["totalMissing"];
		missingTokensP.appendChild(missingTokensD);
		missingTokensP.appendChild(missingTokens);
		let remainingTokensP = document.createElement("p");
		let remainingTokensD = document.createElement("span");
		remainingTokensD.innerHTML = "<b>Remaining tokens:</b> ";
		let remainingTokens = document.createElement("span");
		remainingTokens.innerHTML = tbrResult["totalRemaining"];
		remainingTokensP.appendChild(remainingTokensD);
		remainingTokensP.appendChild(remainingTokens);
		let fitTracesP = document.createElement("p");
		let fitTracesD = document.createElement("span");
		fitTracesD.innerHTML = "<b>Fit traces:</b> ";
		let fitTraces = document.createElement("span");
		fitTraces.innerHTML = tbrResult["fitTraces"]+"/"+tbrResult["totalTraces"];
		fitTracesP.appendChild(fitTracesD);
		fitTracesP.appendChild(fitTraces);
		let logFitnessP = document.createElement("p");
		let logFitnessD = document.createElement("span");
		logFitnessD.innerHTML = "<b>Log fitness:</b> ";
		let logFitness = document.createElement("span");
		logFitness.innerHTML = tbrResult["logFitness"];
		logFitnessP.appendChild(logFitnessD);
		logFitnessP.appendChild(logFitness);
		component.appendChild(consumedTokensP);
		component.appendChild(producedTokensP);
		component.appendChild(missingTokensP);
		component.appendChild(remainingTokensP);
		component.appendChild(fitTracesP);
		component.appendChild(logFitnessP);	
	}
}

Pm4JS.registerVisualizer("TbrTokensVisualization", "apply", "TokenBasedReplayResult", "Show Fitness and Tokens from the Replay", "Alessandro Berti");
