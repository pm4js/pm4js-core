class BusinessHours {
	static apply(startDate, endDate, workingHours=null, weekends=null) {
		if (workingHours == null) {
			workingHours = BusinessHours.DEFAULT_WORKING_HOURS;
		}
		
		if (weekends == null) {
			weekends = BusinessHours.DEFAULT_WEEKENDS;
		}
		
		// Store minutes worked
		var minutesWorked = 0;
	  
		// Validate input
		if (endDate < startDate) { return 0; }
		
		// Loop from your Start to End dates (by hour)
		var current = startDate;

		// Loop while currentDate is less than end Date (by minutes)
		while(current < endDate){          
			// Is the current time within a work day (and if it occurs on a weekend or not)          
			if(current.getHours() >= workingHours[0] && current.getHours() <= workingHours[1] 
			   && !(weekends.includes(current.getDay()))) {
				  minutesWorked++;
			}
			 
			// Increment current time
			current.setTime(current.getTime() + 1000 * 60);
		}

		// Return the number of seconds
		return minutesWorked * 60;
	}
}

BusinessHours.DEFAULT_WORKING_HOURS = [7, 17];
BusinessHours.DEFAULT_WEEKENDS = [0, 6];
BusinessHours.ENABLED = false;

try {
	require('../../pm4js.js');
	global.BusinessHours = BusinessHours;
	module.exports = {BusinessHours: BusinessHours};
}
catch (err) {
	// not in Node
	//console.log(err);
}
