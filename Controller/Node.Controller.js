
export default class Node {
   constructor() {
      // nodes from which this node receive data
      this.masters = [];
      // nodes to which this node send data
      this.slaves = [];
      // block that this node is attached to (can be null) 
      this.attached = {
         block: null, // block var
         io: null, // input or output
         index: null // pin index
      };
      // view object
      this.flesh = null;
   }
   // connect two nodes update related blocks masters and slaves relationship
   static connect(master, slave) {
      master.slaves.push(slave);
      slave.masters.push(master);
      master.findMasterBlocks().forEach(m => {
         master.findSlaveBlocks().forEach(s => {
            let mb = m.block;
            let sb = s.block;
            mb.slaves[m.index] = mb.slaves[m.index].filter(b => b !== s);
            mb.slaves[m.index].push(s);
            sb.masters[s.index] = sb.masters[s.index].filter(b => b !== m);
            sb.masters[s.index].push(m);
         });
      });
   }
   // disconnect two nodes update related blocks masters and slaves relationship
   static disconnect(master, slave) {
      master.slaves = master.slaves.filter(s => s !== slave);
      slave.masters = slave.masters.filter(m => m !== master);
      master.findMasterBlocks().forEach(m => {
         let mb = m.block;
         mb.slaves[m.index] = [];
         mb.slaves[m.index] = mb.outputs[m.index].findSlaveBlocks();
      });
      slave.findSlaveBlocks().forEach(s => {
         let sb = s.block;
         sb.masters[s.index] = [];
         sb.masters[s.index] = sb.inputs[s.index].findMasterBlocks();
      });
   }
   // attach this node to a pin on a block
   attach(block, io, index) {
      this.attached   = {
         block: block,
         io: io,
         index: index
      };
   }
   // find blocks that are directly connected to this or this node's slaves (input) [recursive]
   findSlaveBlocks(found = []) {
      if (this.attached.block && this.attached.io == 'IN') 
         found.push(this.attached);
      this.slaves.forEach(slave => {
         slave.findSlaveBlocks(found);
      });
      return found.filter((v, i, a) => a.indexOf(v) === i);
   }
   // find blocks that are directly connected to this or this node's masters (output) [recursive]
   findMasterBlocks(found = []) {
      if (this.attached.block && this.attached.io == 'OUT') 
         found.push(this.attached);
      this.masters.forEach(master => {
         master.findMasterBlocks(found);
      });
      return found.filter((v, i, a) => a.indexOf(v) === i);
   }
}