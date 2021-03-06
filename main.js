p_version.innerText = "Version: 0.7";

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

function fraction(a, b) {
	var x = a / b;
	var best_error = Infinity;
	var best_ratio = null;
 
	for (var denominator = 1; denominator <= 100; denominator++) {
		var numerator = Math.round(x * denominator);
		var error = Math.abs(numerator / denominator - x);

		if (error < best_error) {
			best_error = error;
			best_ratio = numerator + '/' + denominator;
		}
	}

	return best_ratio;
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
	var s = rand_int(mins, maxs);

	var rounds = [];
	for (var i = 0; i < nrounds; i++) {
		var m = rand_int(minm, maxm);
		var n = rand_int(minn, maxn);

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
			message: Math.round(b) + " beats per minute; " + s + " subdivisions per beat; " + Math.round(b*s) + " subdivisions per minute",
			sequence: sequence,
		});

		var new_s, new_b;

        do {
            do {
                new_s = rand_int(mins, maxs);
            } while (new_s === s);

            if (i % 2 === 0) {
                // Adjust b to keep ss = b*s constant.
                new_b = b * s/new_s;
            }
        } while (new_b < minb || new_b > maxb);

		s = new_s;
        b = new_b;
	}

	return rounds;
}

function ljust(str, width) {
	return str + Array(width - str.length + 1).join(" ");
}

var volumes = {"|": 1.00, "-": 0.50, ".": 0.10};

var global_span_to_clear = null;

function display_rounds(rounds) {
	var fragment = document.createDocumentFragment();
	var time = 0;

	var notes = [];

	var schedule = [];

	var last_span = null;

	for (var i = 0; i < rounds.length; i++) {
		var p = fragment.appendChild(document.createElement('p'));

		p.appendChild(document.createTextNode(rounds[i].message + "\n"));
		p.appendChild(document.createTextNode(" "));

		for (var j = 0; j < rounds[i].beats_per_measure * rounds[i].measures_per_round; j++) {
			p.appendChild(document.createTextNode(ljust(''+rounds[i].subdivisions_per_beat, rounds[i].subdivisions_per_beat)));
		}

		p.appendChild(document.createTextNode("\n"));
		p.appendChild(document.createTextNode(rounds[i].beats_per_measure));

		for (var j = 0; j < rounds[i].sequence.length; j++) {
			(function(i, j, span_to_clear) {
				var span = p.appendChild(document.createElement('span'));
				last_span = span;
				span.innerText = rounds[i].sequence[j];

				var audio = new Audio('click.opus');
				audio.volume = volumes[rounds[i].sequence[j]];

				schedule.push({
					time: time,
					action: function() {
						audio.play();
						span_to_clear && span_to_clear.classList.remove('current');
                        global_span_to_clear = span;
						span.classList.add('current');
					},
				});
			})(i, j, last_span);

			time += 60000 / (rounds[i].beats_per_minute * rounds[i].subdivisions_per_beat);
		}
	}

	schedule.push({
		time: time,
		action: function() {
			last_span.classList.remove('current');
		},
	});

	div_notes.innerHTML = '';
	div_notes.appendChild(fragment);

	return schedule;
}

var current_timeouts = [];
var current_done = null;

function play_rounds(schedule, done) {
	var start = 16 + +new Date();

    current_timeouts = [];
    current_done = done;

	for (var i = 0; i < schedule.length; i++) {
		current_timeouts.push(
            setTimeout(schedule[i].action, start + schedule[i].time - +new Date())
        );
	}

	current_timeouts.push(
        setTimeout(done, start + schedule[schedule.length-1].time - +new Date())
    );
}

var current_rounds = null;
var current_schedule = null;

button_generate.onclick = function() {
	current_rounds = create_rounds();
	current_schedule = display_rounds(current_rounds);

	button_play.disabled = false;
	button_save.disabled = false;
};

button_play.onclick = function() {
    if (button_play.innerText === "Stop") {
        for (var i = 0; i < current_timeouts.length; i++) {
            clearTimeout(current_timeouts[i]);
        }

        current_done();
    } else if (button_play.innerText === "Play") {
        button_generate.disabled = true;
        button_play.innerText = "Stop";

        play_rounds(current_schedule, function() {
            global_span_to_clear && global_span_to_clear.classList.remove('current');
            button_generate.disabled = false;
            button_play.innerText = "Play";
        });
    }
};

function regenerate_load_options() {
    select_load.innerHTML = '';

    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);

        var m;
        if (m = key.match(/^generated:(.*)/)) {
            var option = document.createElement('option');
            option.value = m[1];
            option.innerText = m[1];
            select_load.appendChild(option);
        }
    }
}

regenerate_load_options();

button_save.onclick = function() {
    var name = input_save.value;

    if (!name) {
        alert("Please choose a name to save as.");
    }

    localStorage['generated:' + name] = JSON.stringify(current_rounds);
    regenerate_load_options();
    console.log('saved');
    regenerate_load_options();

    input_save.value = '';
};

button_load.onclick = function() {
    var name = select_load.value;
	current_rounds = JSON.parse(localStorage['generated:' + name]);
	current_schedule = display_rounds(current_rounds);

	button_play.disabled = false;
	button_save.disabled = false;
};
