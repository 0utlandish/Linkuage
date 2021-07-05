import Linkuage 		from './linkuage.js';
import * as Blocks 	    from './blocks.js';

document.querySelector('#search').oninput = function() {
	let key = this.value.toUpperCase();
	const list = Object.keys(Blocks).sort().filter(v => v.indexOf(key) > -1);
	document.querySelector('#blocks').innerHTML = '';
	for (let block of list) {
		const li = document.createElement('li');
		li.setAttribute('class', 'add');
		li.setAttribute('data-name', block.toUpperCase());
		li.innerHTML = `<ion-icon class='button' name="cube"></ion-icon>${block}`
		document.querySelector('#blocks').appendChild(li);
		li.onclick = function() {
			const v = prompt('Value : ');
			new Blocks[this.getAttribute('data-name')](0, 0, v);
			document.querySelector('.blocks').classList.toggle('hide');
		};
	}
}; document.querySelector('#search').oninput();

console.log(Blocks);

// toolbar buttons function
document.querySelector('#run').onclick = function() {
	this.classList.add("active");
	document.getElementById('stop').classList.remove("active");
	document.getElementById('pause').classList.remove("active");
	Linkuage.pause = false;
	if (!Linkuage.running) {
		Linkuage.running = true;
		Linkuage.starts.sort(function(a, b) {
			if (a.priority < b.priority) return -1;
			return 1;
		});
		Linkuage.starts.forEach(s => {
			s.trigger();
		});
	}
}

document.querySelector('#pause').onclick = function() {
	this.classList.add("active");
	document.getElementById('stop').classList.remove("active");
	document.getElementById('run').classList.remove("active");
	Linkuage.pause = true;
}

document.querySelector('#stop').onclick = function() {
	this.classList.add("active");
	document.getElementById('run').classList.remove("active");
	document.getElementById('pause').classList.remove("active");
	Linkuage.running = false;
	Linkuage.blocks.forEach(b => {
		b.reset();
	});
	Linkuage.pause = false;
}; document.querySelector('#stop').onclick();

/* key bindings */
document.onkeydown = e => {
	switch (Linkuage.config.KeyBinding[e.code]) {
			case 'RunPauseToggle':
				if (Linkuage.running) {
					if (Linkuage.pause) {
						document.querySelector('#run').onclick();
					} else {
						document.querySelector('#pause').onclick();
					}
				} else {
					document.querySelector('#run').onclick();
				}
				break;
			case 'Stop':
				document.querySelector('#stop').onclick();
				break;
			case 'OpenBlocksList':
				document.querySelector('.blocks #close').onclick();
				break;
	}
}

document.querySelector('.blocks #close').onclick = document.querySelector('#addblock').onclick = function() {
	document.querySelector('#search').focus();
	document.querySelector('.blocks').classList.toggle('hide');
	setTimeout(() => {
		document.querySelector('#search').value = '';
		document.querySelector('#search').oninput();
	}, 0);
};

document.querySelector('#gridtoggle').onclick = function() {
	Linkuage.SKETCH.grid = !Linkuage.SKETCH.grid;
	Linkuage.SKETCH.figure = Linkuage.SKETCH.update();
	this.classList.toggle('active');
}