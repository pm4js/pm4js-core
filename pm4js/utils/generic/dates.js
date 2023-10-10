class DateUtils {
	static formatDateString(d) {
		return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)+ ":" + ("0" + d.getSeconds()).slice(-2);
	}
}

try {
	module.exports = {DateUtils: DateUtils};
	global.DateUtils = DateUtils;
}
catch (err) {
	// not in node
	//console.log(err);
}
