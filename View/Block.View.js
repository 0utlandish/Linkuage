
import Basix 		from '../Lib/basix.js';

import BlockC 		from '../Controller/Block.Controller.js';
import NodeV 		from './Node.View.js';

import Linkuage	from '../linkuage.js';

OffscreenCanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	this.beginPath();
	this.moveTo(x+r, y);
	this.arcTo(x+w, y, x+w, y+h, r);
	this.arcTo(x+w, y+h, x, y+h, r);
	this.arcTo(x, y+h, x, y, r);
	this.arcTo(x, y, x+w, y, r);
	this.closePath();
	return this;
}

export default class Block extends Basix.Element {
	constructor(sketch, x, y, name, ipc, opc, _if = [], _of = []) {
		super({x, y, layer: 'Sketch'});
		this.controller = new BlockC(name, ipc, opc);
		this.nodes = [];
        this.if = _if;
        this.of = _of;
		for (let n = 0;n < this.controller.ipc;n++) {
			let t = new NodeV(sketch, {block: this, io: 'IN', index: n}, 0, 0);
			t.merge(this.controller.inputs[n]);
			this.nodes.push(t);
		}
		for (let n = 0;n < this.controller.opc;n++) {
			let t = new NodeV(sketch, {block: this, io: 'OUT', index: n}, 0, 0);
			t.merge(this.controller.outputs[n]);
			this.nodes.push(t);
		}
		this.controller.collect = (i, v, o) => {
			this.collect(i, v, o)
		};
		this.sketch = sketch;
        this.layer.context.font = `${Linkuage.config.BlockFont.Size}px ${Linkuage.config.BlockFont.Name}`;
		Linkuage.blocks.push(this);
		this.width  = Math.ceil(this.layer.context.measureText(this.controller.name).width / this.sketch.scale) + Linkuage.config.BlockLabelHPadding;
		this.height = Math.max(this.controller.ipc, this.controller.opc) - 1 + (Linkuage.config.BlockLabelVPadding * 2);
		this.update = () => {
			this.width  = Math.ceil(this.layer.context.measureText(this.controller.name).width / this.sketch.scale) + Linkuage.config.BlockLabelHPadding;
			// this.height = Math.max(this.controller.ipc, this.controller.opc) - 1 + (Linkuage.config.BlockLabelVPadding * 2);
			let osc = new OffscreenCanvas((this.width + 2) * this.sketch.scale, this.height * this.sketch.scale + 2);
			let ctx = osc.getContext('2d');
			ctx.strokeStyle = Linkuage.config.BlockStrokeColor;
			ctx.fillStyle = Linkuage.config.BlockFillColor;
			ctx.lineWidth = Linkuage.config.BlockBorderWidth;
			ctx.roundRect(this.sketch.scale, 1, this.width * this.sketch.scale, this.height * this.sketch.scale, 1);
			ctx.stroke();
			ctx.fill();
			ctx.fillStyle = Linkuage.config.BlockFont.Color;
			ctx.font = `${Linkuage.config.BlockFont.Size}px ${Linkuage.config.BlockFont.Name}`;
			ctx.fillText(this.controller.name, this.sketch.scale + (this.width * this.sketch.scale - this.layer.context.measureText(this.controller.name).width) / 2, (this.height * this.sketch.scale + ctx.measureText('Z').width) / 2 + 1);
            ctx.font = `${Linkuage.config.BlockFont.Size-2}px monospace`;
			for (let n = 0;n < this.controller.ipc;n++) {
                const flag = this.if[n] || '';
                ctx.fillText(flag, this.sketch.scale * 1.3 , (Linkuage.config.BlockLabelVPadding + n) * this.sketch.scale + ctx.measureText('Z').width / 2 + 1);
				ctx.strokeRect(0, (Linkuage.config.BlockLabelVPadding + n) * this.sketch.scale + 1, this.sketch.scale - 1, 0);
			}
			for (let n = 0;n < this.controller.opc;n++) {
                const flag = this.of[n] || '';
                ctx.fillText(flag, (this.width + 1) * this.sketch.scale - this.sketch.scale * .3 - ctx.measureText(flag).width, (Linkuage.config.BlockLabelVPadding + n) * this.sketch.scale + ctx.measureText('Z').width / 2 + 1);
				ctx.strokeRect((this.width + 1) * this.sketch.scale, (Linkuage.config.BlockLabelVPadding + n) * this.sketch.scale + 1, this.sketch.scale - 1, 0);
			}
			return osc;
		};
		this.figure 	= this.update();
		// positional variables
		this.dragged  	= {state: false, x: null, y: null, px: null, py: null};
	}
	tick() {
		let { dragged, x, y, width, height, mousepos, sketch } = this;
		if (Basix.mouse.x > sketch.x + x * sketch.scale && Basix.mouse.x < sketch.x + x * sketch.scale + width * sketch.scale) {
			if (Basix.mouse.y > sketch.y + y * sketch.scale && Basix.mouse.y < sketch.y + y * sketch.scale + height * sketch.scale) {
				this.hovered = true;
			} else {
				this.hovered = false;
			}
		} else {
			this.hovered = false;
		}
		if (Basix.mousedown['mouseleft'] && !dragged.state && this.hovered && (sketch.ablock == this || sketch.ablock == null)) {
			sketch.ablock = this;
			dragged.x = Basix.mouse.x;
			dragged.y = Basix.mouse.y;
			dragged.px = x;
			dragged.py = y;
			dragged.state = true;
		}
		if (!Basix.mousedown['mouseleft']) {
			if (dragged.state) {
				if (x >= sketch.width || x < 0 || y >= sketch.height || y < 0 || x + width + 2 > sketch.width || y + height > sketch.height) {
					this.x = dragged.px;
					this.y = dragged.py;
				}
				sketch.ablock = null;
				this.dragged = {state: false, x: null, y: null, px: null, py: null};
			}
			return;
		}
		if (dragged.state) {
			this.x = dragged.px + Math.floor((Basix.mouse.x - dragged.x) / sketch.scale);
			this.y = dragged.py + Math.floor((Basix.mouse.y - dragged.y) / sketch.scale);
		}
	}
	render(context) {
		let { figure, sketch, x, y } = this;
		context.drawImage(figure, sketch.x + x * sketch.scale, sketch.y + y * sketch.scale - 1);
		if (Basix.keydown['Control']) {
			context.fillStyle = "#888";
			if (((((Basix.mouse.x - (sketch.x + (x + 1) * sketch.scale + sketch.scale / 3)) ** 2 + (Basix.mouse.y - (sketch.y + y * sketch.scale + sketch.scale / 3))) ** 2) ** 0.5 <= sketch.scale / 1.5)) {
				context.fillStyle = "#f44336";
				if (Basix.mousedown['mouseright']) {
					this.delete();
				}
			}
			context.strokeStyle = "#fff";
			context.lineWidth = Linkuage.config.BlockBorderWidth;
			context.roundRect(sketch.x + (x + 1) * sketch.scale, sketch.y + y * sketch.scale, sketch.scale / 1.5, sketch.scale / 1.5, 0);
			context.fill();
			context.beginPath();
			context.lineWidth = 1;
			context.moveTo(sketch.x + (x + 1) * sketch.scale, sketch.y + y * sketch.scale);
			context.lineTo(sketch.x + (x + 1) * sketch.scale + sketch.scale / 1.5, sketch.y + y * sketch.scale + sketch.scale / 1.5);
			context.moveTo(sketch.x + (x + 1) * sketch.scale, sketch.y + y * sketch.scale + sketch.scale / 1.5);
			context.lineTo(sketch.x + (x + 1) * sketch.scale + sketch.scale / 1.5, sketch.y + y * sketch.scale);
			context.stroke();
		}
	}
	emit(i, v) {
		this.controller.emit(i, v);
	}
	reset() {
		// important
	}
	delete() {
		this.nodes.forEach(n => {
			n.delete(true);
		});
		Linkuage.blocks = Linkuage.blocks.filter(b => b !== this);
		this.remove();
	}
}