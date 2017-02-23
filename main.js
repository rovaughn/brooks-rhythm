
// Is this well distributed?
function rand_int(min, max) {
	if (max < min) {
		throw new Error("max < min");
	}

	var x = Math.round(min + Math.random()*(max - min));

	if (x < min) { x = min; }
	if (x > max) { x = max; }

	return x;
}

function create_rounds() {
	var nrounds = +input_rounds_to_play.value;

	var minb = +input_beats_per_minute_min.value;
	var maxb = +input_beats_per_minute_max.value;
	var minn = +input_beats_per_measure_min.value;
	var maxn = +input_beats_per_measure_max.value;
	var mins = +input_subdivisions_per_beat_min.value;
	var maxs = +input_subdivisions_per_beat_max.value;
	var minm = +input_measures_per_round_min.value;
	var maxm = +input_measures_per_round_max.value;
	var minc = +input_subdivisions_to_combine_min.value;
	var maxc = +input_subdivisions_to_combine_max.value;

	var b = rand_int(minb, maxb);

	var rounds = [];
	for (var i = 0; i < nrounds; i++) {
		var n = rand_int(minn, maxn);
		var s = rand_int(mins, maxs);
		var m = rand_int(minm, maxm);
		var c = rand_int(
			Math.max(b*s/maxb, minc),
			Math.min(b*s/minb, maxc)
		);

		var sequence = '';
		for (var j = 0; j < s*n*m; j++) {
			if (j % (n*s) === 0) {
				sequence += '|';
			} else if (j % s === 0) {
				sequence += '-';
			} else {
				sequence += '.';
			}
		}

		rounds.push({
			beats_per_minute: b,
			beats_per_measure: n,
			subdivisions_per_beat: s,
			measures_per_round: m,
			subdivisions_to_combine: c,
			sequence: sequence,
		});

		b = b*s/c;
	}

	return rounds;
}

var volumes = {'|': 1.00, '-': 0.50, '.': 0.10};

function play_rounds(rounds, done) {
	var fragment = document.createDocumentFragment();
	var time = 0;

	var notes = [];

	var scheduled = [];

	for (var i = 0; i < rounds.length; i++) {
		var p = fragment.appendChild(document.createElement('p'));

		(function(i) {
			scheduled.push({
				time: time - 50,
				action: function() {
					input_beats_per_minute_chosen.value = rounds[i].beats_per_minute.toFixed(0);
					input_beats_per_measure_chosen.value = rounds[i].beats_per_measure;
					input_subdivisions_per_beat_chosen.value = rounds[i].subdivisions_per_beat;
					input_measures_per_round_chosen.value = rounds[i].measures_per_round;
					input_subdivisions_to_combine_chosen.value = rounds[i].subdivisions_to_combine;
				},
			});
		})(i);

		for (var j = 0; j < rounds[i].sequence.length; j++) {
			(function(i, j) {
				var span = p.appendChild(document.createElement('span'));
				span.innerText = rounds[i].sequence[j];

				var audio = new Audio('click.wav');
				audio.volume = volumes[rounds[i].sequence[j]];

				scheduled.push({
					time: time,
					action: function() {
						audio.play();
						span.classList.add('current');
					},
				});
			})(i, j);

			time += 60000 / (rounds[i].beats_per_minute * rounds[i].subdivisions_per_beat);
		}
	}

	div_notes.appendChild(fragment);

	var start = 500 + +new Date();

	for (var i = 0; i < scheduled.length; i++) {
		setTimeout(scheduled[i].action, start + scheduled[i].time - +new Date());
	}
}

button_go.onclick = function() {
	button_go.disabled = true;

	play_rounds(create_rounds(), function() {
		button_go.disabled = false;
	});
};

