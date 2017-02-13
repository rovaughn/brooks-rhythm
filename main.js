
var click = new Audio('click.wav');

go.onclick = function() {
	go.disabled = true;
	var b = +document.getElementById('b').value;
	var maxb = +document.getElementById('maxb').value;
	var minb = +document.getElementById('minb').value;
	var n = +document.getElementById('n').value;
	var s = +document.getElementById('s').value;
	var m = +document.getElementById('m').value;

	var arr = [];

	for (var i = 0; i < s*n*m; i++) {
		if (i%(n*s) === 0) {
			arr.push(1);
		} else if (i%s === 0) {
			arr.push(1/2);
		} else {
			arr.push(1/4);
		}
	}

	var arr_elem = document.getElementById('arr');
	var spans = [];

	for (var i = 0; i < arr.length; i++) {
		var elem = arr_elem.appendChild(document.createElement('span'));
		spans.push(elem);
		
		if (arr[i] >= 1) {
			elem.innerText = '|';
		} else if (arr[i] >= 1/2) {
			elem.innerText = '-';
		} else if (arr[i] >= 1/4) {
			elem.innerText = ',';
		} else {
			elem.innerText = ' ';
		}
	}

	var i = 0;
	var interval = setInterval(function() {
		if (i >= arr.length) {
			arr_elem.innerHTML = '';
			go.disabled = false;
			clearInterval(interval);
			return;
		} else if (i > 0) {
			spans[i-1].classList.remove('bold');
		}
		spans[i].classList.add('bold');
		click.volume = arr[i];
		click.play();
		if (i%(n*s) === 0) {
			click.volume = 1.00;
			click.play();
		} else if (i%s === 0) {
			click.volume = 0.50;
			click.play();
		} else {
			click.volume = 0.25;
			click.play();
		}

		i++;
	}, 400);
};

