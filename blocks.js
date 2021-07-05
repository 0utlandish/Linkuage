
import Basix 		from './Lib/basix.js';

import Sketch 		from './View/Sketch.View.js';
import Block 		from './View/Block.View.js';

import Linkuage 	from './linkuage.js';

Linkuage.SKETCH = new Sketch(50, 50, 120, 100, Linkuage.config.GridScale);

export class AND extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'And', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, parseInt(temp[0]) && parseInt(temp[1]));
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class NAND extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Nand', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, !(temp[0] && temp[1]));
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class OR extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Or', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, temp[0] || temp[1]);
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class XOR extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Xor', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, temp[0] ^ temp[1]);
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class CONCAT extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Concat', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, temp[0] + "" + temp[1]);
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class SUBTRACT extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Subtract', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, temp[0] - temp[1]);
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class SUM extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Sum', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, parseInt(temp[0]) + parseInt(temp[1]));
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class MULTIPLY extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Multiply', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, temp[0] * temp[1]);
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class DIVIDE extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Divide', 2, 1);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			this.emit(0, temp[0] / temp[1]);
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class COMPARE extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Compare', 2, 3, [], ['E', 'G', 'S']);
		this.pins = [null, null];
	}
	collect(i, v, o) {
		this.pins[i] = v;
		if (!this.pins.includes(null)) {
			let temp = this.pins;
			this.reset();
			if (temp[0] == temp[1]) {
				this.emit(1, temp[0]);
			} else if (temp[0] > temp[1]) {
				this.emit(0, temp[0]);
			} else {
				this.emit(2, temp[1]);
			}
		}
	}
	reset() {
		this.pins = [null, null];
	}
}

export class NEGATE extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Negate', 1, 1);
	}
	collect(i, v, o) {
		this.emit(0, -v);
	}
}

export class ABS extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Abs', 1, 1);
	}
	collect(i, v, o) {
		this.emit(0, Math.abs(v));
	}
}

export class ONCE extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Once ◻', 1, 1);
		this.flag = false;
	}
	collect(i, v, o) {
		if (!this.flag) {
			this.emit(0, v);
			this.flag = true;
			this.controller.name = 'Once ◼';
			this.figure = this.update();
		}
	}
	reset() {
		this.controller.name = 'Once ◻';
		this.figure = this.update();
		this.flag = false;
	}
}

export class NOT extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Not', 1, 1);	}
	collect(i, v, o) {
		this.emit(0, (v ? 0 : 1));
	}
}

export class DELAY extends Block {
	constructor(x, y, d = 500) {
		super(Linkuage.SKETCH, x, y, `Delay [${d}ms]`, 1, 1);	
		this.delay = d;
	}
	collect(i, v, o) {
		this.timer = setTimeout(() => {
			this.emit(0, v);
		}, this.delay);
	}
	reset() {
		clearTimeout(this.timer);
	}
}

export class REGISTER extends Block {
	constructor(x, y, v = null) {
		super(Linkuage.SKETCH, x, y, `Register [${v}]`, 2, 1, ['S', 'R']);
		this.value = v;
        this.default = v;
	}
	collect(i, v, o) {
		if (i == 0) {
			this.value = v;
			this.controller.name = `Register [${this.value}]`;
			this.figure = this.update();
		} else {
			this.emit(0, this.value);
		}
	}
	reset() {
		this.value = this.default;
        this.controller.name = `Register [${this.default}]`;
        this.figure = this.update();
	}
}

export class COUNTER extends Block {
	constructor(x, y, l = Infinity, s = 1) {
		super(Linkuage.SKETCH, x, y, `Counter / ${l}`, 1, 2, [], ['+', 'F']);
		this.limit = l;
		this.step = s;
		this.value = 0;
	}
	collect(i, v, o) {
		this.value += this.step;
		if (this.value >= this.limit) {
			this.value = 0;
			this.emit(1, true);
		} else {
			this.emit(0, this.value);
		}
	}
	reset() {
		this.value = 0;
	}
}

export class ITERATOR extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, `Iterator`, 1, 1, ['I']);
	}
	collect(i, v, o) {
		for (let x = 0;x < v;x++) {
			this.emit(0, x);
		}
	}
}

export class GATE extends Block {
	constructor(x, y, l = 8) {
		super(Linkuage.SKETCH, x, y, `Gate (${l})`, 1, 1);
		this.loop = l;
		this.index = 0;
	}
	collect(i, v, o) {
		if (this.index < this.loop) {
			this.index++;
			this.emit(0, v);
		}
	}
	reset() {
		this.index = 0;
	}
}

export class EXPONENT extends Block {
	constructor(x, y, p = 2) {
		super(Linkuage.SKETCH, x, y, `Exponent [${p}]`, 1, 1);
		this.power = p;
	}
	collect(i, v, o) {
		this.emit(0, v ** this.power);
	}
}

export class ROOT extends Block {
	constructor(x, y, d = 2) {
		super(Linkuage.SKETCH, x, y, `Root [${d}]`, 1, 1);
		this.degree = d;
	}
	collect(i, v, o) {
		this.emit(0, v ** (1 / this.degree));
	}
}

export class INT extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, `Int`, 1, 1);
	}
	collect(i, v, o) {
		this.emit(0, +v);
	}
}

export class STR extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, `Str`, 1, 1);
	}
	collect(i, v, o) {
		this.emit(0, v + '');
	}
}

export class INPUT extends Block {
	constructor(x, y, l = 'input : ') {
		super(Linkuage.SKETCH, x, y, `Input`, 1, 1);
		this.label = l;
	}
	collect(i, v, o) {
		const p = prompt(this.label);
		this.emit(0, p);
	}
}

export class PRINT extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, 'Print', 1, 0);
	}
	collect(i, v, o) {
		console.log('[Print] :', v);
	}
}

export class DISPLAY extends Block {
	constructor(x, y, l = 15) {
		super(Linkuage.SKETCH, x, y, 'O'.repeat(l), 1, 0);
		this.length = l;
	}
	collect(i, v, o) {
		this.controller.name = v;
		this.figure = this.update();
	}
	reset() {
		this.controller.name = 'O'.repeat(this.length);
		this.figure = this.update();
	}
}

export class CONST extends Block {
	constructor(x, y, v = 5, p = 0) {
		super(Linkuage.SKETCH, x, y, `Const [${v}]`, 0, 1);
		this.value = v;
		Linkuage.starts.push(this);
		this.priority = p;
	}
	trigger() {
		this.emit(0, this.value);
	}
}

export class START extends Block {
	constructor(x, y, p) {
		super(Linkuage.SKETCH, x, y, `Start`, 0, 1);
		Linkuage.starts.push(this);
		this.priority = p;
	}
	trigger() {
		this.emit(0, true);
	}
}

export class RANDOM extends Block {
	constructor(x, y, p) {
		super(Linkuage.SKETCH, x, y, `Random`, 0, 1);
		Linkuage.starts.push(this);
		this.priority = p;
	}
	trigger() {
		this.emit(0, Math.random());
	}
}

export class PULSE extends Block {
	constructor(x, y, i = 300, p = 0) {
		super(Linkuage.SKETCH, x, y, `Pulse [${i}ms]`, 0, 1);
		Linkuage.starts.push(this);
		this.priority = p;
		this.interval = i;
	}
	trigger() {
		this.timer = setInterval(() => {
			this.emit(0, true);
		}, this.interval);
	}
	reset() {
		clearInterval(this.timer);
	}
}

export class END extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, `End`, 1, 0);
	}
	collect(i, v, o) {
		alert(`Program Ended [Final Value : ${v}]`);
		document.querySelector('#stop').onclick();
	}
}

export class BEEP extends Block {
	constructor(x, y) {
		super(Linkuage.SKETCH, x, y, `Beep`, 1, 0);
	}
	collect(i, v, o) {
		Basix.resources.list.sfx['beep'].play();
	}
}