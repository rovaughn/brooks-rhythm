
var click_audios = [];

for (var i = 0; i < 10; i++) {
	click_audios.push(new Audio('click.wav'));
}

var next_click_audio = 0;

function play_click(volume) {
	var audio = click_audios[next_click_audio];
	next_click_audio = (next_click_audio + 1) % click_audios.length;
	audio.volume = volume;
	audio.play();
}

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

	p_sequence.appendChild(document.createElement('br'));

	var i = 0;
	function do_click() {
		if (i > 0) {
			spans[i-1].classList.remove('current');
		}

		if (i >= nsamples) {
			clearInterval(interval);
			if (done) { done(); }
		} else {
			spans[i].classList.add('current');
			play_click(sample(i));
			i++;
		}
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

	var nrounds = +input_rounds.value;
	var ncompleted = 0;
	function do_rounds() {
		if (ncompleted >= nrounds) {
			button_go.disabled = false;
		} else {
			ncompleted++;
			play_sequence(params, do_rounds);
			params = morph(params);
		}
	}
	do_rounds();
};

