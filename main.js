
var click = new Audio('click.wav');

function morph(params) {
	var minc = (params.b*params.s)/params.maxb;
	var maxc = (params.b*params.s)/params.minb;

	if (maxc < minc) {
		throw new Error('No possible c');
	}

	console.log('generating c in range', minc, maxc);

	var c = minc + Math.random()*(maxc - minc);

	return {
		b: params.b*params.s/c,
		maxb: params.maxb,
		minb: params.minb,
		n: params.n,
		s: Math.round(params.s/c),
		m: params.m,
	};
}

function play_sequence(params, done) {
	var nsamples = params.s*params.n*params.m;

	function sample(i) {
		if (i%(params.n*params.s) === 0) {
			return 1/1;
		} else if (i%params.s === 0) {
			return 1/2;
		} else {
			return 1/4;
		}
	}

	p_details.innerText = 'BPM = ' + params.b + ', subdivisions/beat = ' + params.s;

	var spans = [];
	for (var i = 0; i < nsamples; i++) {
		var span = p_sequence.appendChild(document.createElement('span'));
		spans.push(span);
		
		if (sample(i) >= 1) {
			span.innerText = '|';
		} else if (sample(i) >= 1/2) {
			span.innerText = '-';
		} else if (sample(i) >= 1/4) {
			span.innerText = ',';
		} else {
			span.innerText = ' ';
		}
	}

	var i = 0;
	function do_click() {
		if (i >= nsamples) {
			p_sequence.innerHTML = '';
			clearInterval(interval);
			if (done) { done(); }
			return;
		}

		if (i > 0) {
			spans[i-1].classList.remove('current');
		}
		spans[i].classList.add('current');
		click.volume = sample(i);
		click.play();
		i++;
	}

	do_click();
	var interval = setInterval(do_click, 60000/(params.b*params.s));
}

button_go.onclick = function() {
	button_go.disabled = true;

	var params = {
		b: +input_b.value,
		maxb: +input_maxb.value,
		minb: +input_minb.value,
		n: +input_n.value,
		s: +input_s.value,
		m: +input_m.value,
	};

	play_sequence(params, function() {
		play_sequence(morph(params));
	});
};

