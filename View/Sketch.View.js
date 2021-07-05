
import Basix      from '../Lib/basix.js';

import NodeV      from './Node.View.js';
import NodeC          from '../Controller/Node.Controller.js';

import Linkuage       from '../linkuage.js';

Basix.layers.add({
   name: 'Sketch',
   // monitor: true,
   background: '#fff',
   alpha: true,
   tps: 120,
   height: window.innerHeight - 29
});

Basix.layers.list['Sketch'].context.font = Linkuage.config.BlockFont;

// loading resources
Basix.resources.insert.sound('beep', './beep.mp3');
Basix.resources.load();

export default class Sketch extends Basix.Element {
   constructor(x, y, width, height, scale = 10) {
      super({x, y, layer: 'Sketch', z: -1});
      this.width     = width;
      this.height    = height;
      this.scale     = scale;
      this.map       = new Array(width);
      this.mousepos  = {x: null, y: null};
      this.nodes     = [];
      this.anode     = null;
      this.ablock    = null;
      this.ghost     = new NodeV(this, null, 0, 0, true);
      this.grid      = true;
      this.ghost.visible = false;
      for (let i = 0;i < height;i++) this.map[i] = new Array(height);
      this.update    = () => {
         let osc = new OffscreenCanvas(this.width * this.scale, this.height * this.scale);
         let ctx = osc.getContext('2d');
         ctx.strokeStyle = Linkuage.config.GridLineColor;
         ctx.lineWidth = Linkuage.config.GridLineWidth;
         ctx.beginPath();
         if (this.grid) {
            for (let i = 0;i <= this.width;i++) {
               ctx.moveTo(i * this.scale, 0);
               ctx.lineTo(i * this.scale, this.height * this.scale);
            }
            for (let j = 0;j <= this.height;j++) {
               ctx.moveTo(0, j * this.scale);
               ctx.lineTo(this.width * this.scale, j * this.scale);
            }
         }
         ctx.stroke();
         return osc;
      };
      this.figure = this.update();
      // positional variables
      this.dragged   = {state: false, x: null, y: null};
      this.lock   = false;
   }
   tick() {
      let { dragged, x, y, width, height, scale, mousepos } = this;
      if (Basix.mousedown['mouseright'] && !dragged.state) {
         dragged.x = x - Basix.mouse.x;
         dragged.y = y - Basix.mouse.y;
         dragged.state = true;
      }
      if (!Basix.mousedown['mouseright'])
         dragged.state = false;
      if (dragged.state) {
         this.x = Basix.mouse.x + dragged.x;
         this.y = Basix.mouse.y + dragged.y;
      }
      if (Basix.mouse.x >= x &&
          Basix.mouse.x <= x + width * scale &&
          Basix.mouse.y >= y &&
          Basix.mouse.y <= y + height * scale) {
         mousepos.x = Math.floor((Basix.mouse.x - x) / scale);
         mousepos.y = Math.floor((Basix.mouse.y - y) / scale);
      } else {
         mousepos    = {x: null, y: null};
      }
      if (this.anode) {
         this.ghost.visible = true;
         this.ghost.x = Math.floor((Basix.mouse.x - x + scale / 2) / scale);
         this.ghost.y = Math.floor((Basix.mouse.y - y + scale / 2) / scale);
         if (!this.anode.controller.slaves.includes(this.ghost.controller)) {
            NodeC.connect(this.anode.controller, this.ghost.controller);
         }
      }
      if (this.anode) {
         if (Basix.mousedown['mouseright']) {
            NodeC.disconnect(this.anode.controller, this.ghost.controller);
            this.anode = null;
            this.ghost.visible = false;
         }
         if (Basix.mousedown['mouseleft'] && !this.lock) {
            let f = false, temp;
            // console.log(this.nodes);
            this.nodes.forEach(node => {
               let x, y;
               if (node.attached) {
                  if (node.attached.io == 'IN') {
                     x = node.attached.block.x;
                     y = node.attached.block.y + node.attached.index + 1;
                  } else {
                     x = node.attached.block.x + node.attached.block.width + 2;
                     y = node.attached.block.y + node.attached.index + 1;
                  }
               } else {
                  x = node.x;
                  y = node.y;
               }
               // console.log({x, y}, this.ghost)
               if (x == this.ghost.x && y == this.ghost.y && !node.ghost) {
                  f = node;
               }
            });
            if (f)
               temp = f;
            else 
               temp = new NodeV(this, null, this.ghost.x, this.ghost.y);
            if (temp == this.anode) return;
            NodeC.disconnect(this.anode.controller, this.ghost.controller);
            NodeC.connect(this.anode.controller, temp.controller);
            setTimeout(() => {
               this.anode = null;
               if (Basix.keydown['Control']) {
                  this.anode = temp;
               }
            });
            this.ghost.visible = false;
         }
      }
      this.lock = Basix.mousedown['mouseleft'];
   }
   render(context) {
      let { figure, x, y } = this;
      context.drawImage(figure, x, y);
      context.lineWidth = 0.08
      context.roundRect(x, y, this.width * this.scale, this.height * this.scale, 1);
      context.stroke();
   }
}