
exports.formatTime = formatTime;

function formatTime(secs) {
	var hours = Math.floor(secs / (60 * 60));

	var divisor_for_minutes = secs % (60 * 60);
	var minutes = Math.floor(divisor_for_minutes / 60);

	var divisor_for_seconds = divisor_for_minutes % 60;
	var seconds = Math.ceil(divisor_for_seconds);

	if (minutes < 10) {
		minutes = '0'
	}

	if (hours < 10) {
		hours = '0' + hours;
	}
	if (seconds < 10) {
		seconds = '0' + seconds;
	}

	var time = hours + ":" + minutes + ":" + seconds;

	return time;
}