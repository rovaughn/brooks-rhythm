
var click_audios = [];

for (var i = 0; i < 30; i++) {
	click_audios.push(new Audio('click.wav'));
}

var next_click_audio = 0;

function play_click(volume) {
	var audio = click_audios[next_click_audio];
	next_click_audio = (next_click_audio + 1) % click_audios.length;
	audio.volume = volume;
	audio.play();
}

function rand(min, max) {
	if (max < min) {
		throw new Error('max < min');
	}

	var x = Math.round(min + Math.random()*(max - min));

	if (x < min) { x = min; }
	if (x > max) { x = max; }

	return x;
}

function int_clip(x, min, max) {
	x = Math.round(x);
	if (x < min) { x = min; }
	if (x > max) { x = max; }
	return x;
}

function morph(params) {
	for (var i = 0; i < 1000; i++) {
		var c = rand(+input_c_min.value, +input_c_max.value);

		var new_params = {
			b: Math.round(params.s*params.b/c),
			n: params.n,
			s: Math.round(params.s/c),
			m: params.m,
		};

		if (+input_b_min.value <= new_params.b && new_params.b <= +input_b_max.value && +input_s_min.value <= new_params.s && new_params.s <= +input_s_max.value) {
			input_c_chosen.value = c;
			return new_params;
		}
	}

	throw new Error("Max iters exceeded");
}

function play_sequence(params, done) {
	input_b_chosen.value = params.b;
	input_n_chosen.value = params.n;
	input_s_chosen.value = params.s;
	input_m_chosen.value = params.m;

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

	var spans = [];
	for (var i = 0; i < nsamples; i++) {
		var span = p_sequence.appendChild(document.createElement('span'));
		spans.push(span);
		
		if (sample(i) >= 1) {
			span.innerText = '|';
		} else if (sample(i) >= 1/2) {
			span.innerText = '-';
		} else if (sample(i) >= 1/4) {
			span.innerText = '.';
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
		b: rand(+input_b_min.value, +input_b_max.value),
		n: rand(+input_n_min.value, +input_n_max.value),
		s: rand(+input_s_min.value, +input_s_max.value),
		m: rand(+input_m_min.value, +input_m_max.value),
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

