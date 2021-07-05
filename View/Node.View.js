
import Basix 		from '../Lib/basix.js';

import NodeC 		from '../Controller/Node.Controller.js';

import Linkuage	from '../linkuage.js';

export default class Node extends Basix.Element {
	constructor(sketch, attached = null, x, y, ghost = false) {
		super({x, y, layer: 'Sketch'});
		this.sketch 	= sketch;
		this.attached 	= attached;
		this.ghost 		= ghost;
		this.sketch.nodes.push(this);
		this.merge 		= node => {
			delete this.controller
			this.controller = node;
			node.flesh	= this;
		}
		this.merge(new NodeC());
		this.update = (color = "#ccc") => {
			let osc = new OffscreenCanvas((Linkuage.config.NodeRadius + 1) * 2, (Linkuage.config.NodeRadius + 1) * 2);
			let ctx = osc.getContext('2d');
			ctx.fillStyle = '#555';
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.arc(Linkuage.config.NodeRadius + 1, Linkuage.config.NodeRadius + 1, Linkuage.config.NodeRadius, 0, Math.PI * 2);
			if (!this.ghost)
				ctx.fill();
			ctx.stroke();
			return osc;
		};
		this.figure 	= this.update();
		// positional variables
		this.dragged  	= {state: false, x: null, y: null, px: null, py: null};
		this.hovered   = false;
		this.lock 		= false;
		this.rs  		= true;
	}
	tick() {
		let { figure, attached, sketch, x, y } = this;
		let rx, ry;
		if (attached) {
			if (attached.io == 'IN')
				rx = sketch.x + attached.block.x  * sketch.scale;
			else
				rx = sketch.x + (attached.block.x + attached.block.width + 2) * sketch.scale;
			ry = sketch.y + (attached.block.y + Linkuage.config.BlockLabelVPadding + attached.index) * sketch.scale;
		} else {
			rx = sketch.x + x * sketch.scale;
			ry = sketch.y + y * sketch.scale;
		}
		if (!this.ghost) {
			if (((Basix.mouse.x - rx) ** 2 + (Basix.mouse.y - ry) ** 2) ** 0.5 <= Linkuage.config.NodeRadius + 1) {
				if (!this.hovered) {
					this.figure = this.update('#2ecc71');
					this.rs = false;
				}
				this.hovered = true;
			} else {
				if (this.sketch.anode != this && !this.rs) {
					this.figure = this.update();
					this.rs = true;
				}
				this.hovered = false;
			}
			if (!this.lock && this.hovered && Basix.mousedown['mouseleft']) {
				if (this.sketch.anode == null)
					this.sketch.anode = this;
			}
			if (this.hovered && Basix.mousedown['mouseright'] && Basix.keydown['Control']) {
				this.delete();
			}
		}
		this.lock = Basix.mousedown['mouseleft'];
	}
	render(context) {
		let { figure, attached, sketch, x, y, hovered } = this;
		if (attached) {
			if (attached.io == 'IN') {
				context.drawImage(figure, sketch.x + attached.block.x  * sketch.scale - (Linkuage.config.NodeRadius + 1), sketch.y + (attached.block.y + Linkuage.config.BlockLabelVPadding + attached.index) * sketch.scale - (Linkuage.config.NodeRadius + 1));
			} else {
				context.drawImage(figure, sketch.x + (attached.block.x + attached.block.width + 2) * sketch.scale - (Linkuage.config.NodeRadius + 1), sketch.y + (attached.block.y + Linkuage.config.BlockLabelVPadding + attached.index) * sketch.scale - (Linkuage.config.NodeRadius + 1));
			}
		} else {
			context.drawImage(figure, sketch.x + x * sketch.scale - (Linkuage.config.NodeRadius + 1), sketch.y + y * sketch.scale - (Linkuage.config.NodeRadius + 1));
		}
		context.strokeStyle = Linkuage.config.WireColor;
		context.beginPath();
		this.controller.slaves.forEach(node => {
			context.lineWidth = Linkuage.config.WireWidth;
			let start = {x, y}, target = {x: node.flesh.x, y: node.flesh.y}, center = {};
			if (attached)
				start = {x: attached.block.x + (attached.io == 'IN' ? 0 : (attached.block.width + 2)), y: attached.block.y + attached.index + Linkuage.config.BlockLabelVPadding};
			context.moveTo(sketch.x + start.x * sketch.scale, sketch.y + start.y * sketch.scale);
			if (node.flesh.attached) 
				target = {x: node.flesh.attached.block.x + (node.flesh.attached.io == 'IN' ? 0 : (node.flesh.attached.block.width + 2)), y: node.flesh.attached.block.y + node.flesh.attached.index + Linkuage.config.BlockLabelVPadding};
			context.lineTo(sketch.x + target.x * sketch.scale, sketch.y + target.y * sketch.scale);
			context.stroke();
			center.x = sketch.x + (start.x + target.x) * sketch.scale / 2;
			center.y = sketch.y + (start.y + target.y) * sketch.scale / 2;
			let angle = -Math.atan2((start.x - target.x) * sketch.scale, (start.y - target.y) * sketch.scale) * 180 / Math.PI;
			if (angle < 0) {
				angle = 180 - (-180 - angle)
			}
			angle = -angle / (180 / Math.PI);
			if (Basix.keydown['Control']) {
				context.beginPath();
				let vx = center.x + Linkuage.config.WireArrowSize / 2 * Math.sin(angle);
				let vy = center.y + Linkuage.config.WireArrowSize / 2 * Math.cos(angle);
				if (((Basix.mouse.x - vx) ** 2 + (Basix.mouse.y - vy) ** 2) ** 0.5 <= Linkuage.config.WireArrowSize) {
					context.strokeStyle = "#f44336";
					if (Basix.mousedown['mouseright']) {
						NodeC.disconnect(this.controller, node);
					}
				}
				context.arc(vx, vy, Linkuage.config.WireArrowSize, 0, Math.PI * 2);
				context.stroke();
			}
			context.beginPath();
			// context.lineWidth = 0.6;
			context.moveTo(center.x, center.y);
			context.lineTo(center.x + (Linkuage.config.WireArrowSize * Math.sin(angle + 0.6)), center.y + (Linkuage.config.WireArrowSize * Math.cos(angle + 0.6)));
			context.moveTo(center.x, center.y);
			context.lineTo(center.x + (Linkuage.config.WireArrowSize * Math.sin(angle - 0.6)), center.y + (Linkuage.config.WireArrowSize * Math.cos(angle - 0.6)));
			context.stroke();
		});
	}
	connect(node) {
		NodeC.connect(this.controller, node.controller);
	}
	disconnect(node) {
		NodeC.disconnect(this.controller, node.controller);
	}
	delete(hard = false) {
		if (this.attached && !hard) return;
		this.controller.slaves.forEach(slave => {
			NodeC.disconnect(this.controller, slave);
		});
		this.controller.masters.forEach(master => {
			NodeC.disconnect(master, this.controller);
		});
		this.sketch.nodes = this.sketch.nodes.filter(n => n !== this);
		this.remove();
	}
}