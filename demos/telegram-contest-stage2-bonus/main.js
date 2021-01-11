var html = document.querySelector('html');
var toggleModeButton = document.querySelector('#toggle-mode');
var metaTheme = document.querySelector('meta[name=theme-color]');
toggleModeButton.addEventListener('click', function () {
	var classes = html.className.split(' ');
	var current = classes.indexOf('dark') >= 0; // true => dark

	toggleModeButton.querySelector('span').innerText = (['Day', 'Night'])[current-0];
	metaTheme.content = (['#242F3E', '#FAFAFA'])[current-0];

	if (current) {
		classes.splice(classes.indexOf('dark'), 1);
	} else 
		classes.push('dark');
	html.className = classes.join(' ');

	var event = document.createEvent('Event');
	event.initEvent('darkmode', false, true);
	document.dispatchEvent(event);
	// document.dispatchEvent(new Event('darkmode', {mode: !current}));
});
function updateToggleButtonShadow() {
	toggleModeButton.className = (html.scrollTop > html.scrollHeight - html.clientHeight - 32) ? 'no-shadow' : '';
}
window.addEventListener('scroll', updateToggleButtonShadow);
updateToggleButtonShadow();

var chartsCount = 5;
var loaded = 0;

function loadChart(i, callback) {
    request('data/' + (i+1) + '/overview.json', function (chartObject) {
    	chartObject.title = 'Chart #' + (i+1);
		callback(chartObject)
    });
}
function loadZoomed(i, t, callback) {
	var date = new Date(t);
	request('data/' + (i+1) + '/' + date.getFullYear() + '-' + z(date.getMonth()+1) + '/' + z(date.getDate()) + '.json', function (chart) {
		callback(chart);
	});
}
function z(str, n) {
	n = n || 2;
	str = str + '';
	if (str.length < n)
		return '0'.repeat(n - str.length) + str;
	return str+'';
}
function request(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function () {
        if (request.readyState != 4)
            return;
        
        if (request.status == 200) {
            var chartObject = JSON.parse(request.responseText);
			callback(chartObject)
        }
    }
    request.send();
}