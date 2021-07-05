
import Linkuage from '../linkuage.js';

import Node     from './Node.Controller.js';

export default class Block {
   // @parameter {string}  name  : blocks name
   // @parameter {uint}    ipc   : input pins count
   // @parameter {uint}    opc   : output pins count
   constructor(name, ipc, opc) {
      this.name      = name;
      this.ipc       = ipc;
      this.opc       = opc;
      this.masters   = [];
      this.slaves    = [];
      this.inputs    = [];
      this.outputs   = [];
      for (let n = 0;n < ipc;n++) {
         this.masters.push([]);
         let instance = new Node();
         instance.attach(this, 'IN', n);
         this.inputs.push(instance);
      }
      for (let n = 0;n < opc;n++) {
         this.slaves.push([]);
         let instance = new Node();
         instance.attach(this, 'OUT', n);
         this.outputs.push(instance);
      }
   }
   collect(index, value, origin) {
      console.log(`[${this.name}] is trigged on pin '${index}' by the value of '${value}' from [${origin.name}]`);
   }
   emit(index, value) {
      if (Linkuage.pause) return;
      if (!this.slaves[index]) return;
      this.slaves[index].forEach(s => {
         if (Linkuage.running)
            s.block.collect(s.index, value, this);
      });
   }
}