// basix utility stuff
export const util = {
    // user can use this loop to implement the logic and render objects
    loop: e => {},
    // linear interpolation (yea i know)
    lerp: (a, b, n) => {
        return a + (b - a) * Math.min(1, Math.max(0, n));
    },
    // store time in ms since loop is running
    now: 0,
    // ease value change
    ease(o, p, v, d, t = 'linear', c = e=>{}) {
        const ease = {
            startedAt: (util.now || 0),
            endsAt: (util.now || 0) + d,
            initialValue: o[p],
            o,
            p,
            v,
            t,
            c
        };
        util.easeStorage.push(ease);
        return {
            stop: (f = false) => {
                util.easeStorage = util.easeStorage.filter(e => e != ease);
                if(f)
                    ease.c();
            }
        }
    },
    easeStorage: [],
    easeTypes: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 + (--t) * t * t * t * t,
        easeInOutQuint: t => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    },
};

// (pre)loads assets
export class loader {
   constructor() {
      this.files  = [];
      this.done   = e=>{};
   }
   // insert a file to storage
   insert(type, name, src) {
      this.files[type] = this.files[type] || [];
      this.files[type][name] = {
         agent: undefined,
         loaded: false,
         src
      };
   }
   // load all files
   async load(d) {
      this.done = d;
      const all = [];
      for (let type in this.files) {
         switch (type) {
            case 'sfx':
               for (let file in this.files[type]) {
                  const sound = document.createElement("audio");
                  sound.addEventListener('error', function(e) {
                      e.preventDefault();
                  });
                  this[file] = sound;
                  this.files[type][file].loaded = new Promise((resolve, reject) => {
                     this[file].addEventListener('canplaythrough', () => {
                        resolve(true);
                     }, false);
                     this[file].onerror = () => {
                        reject(false);
                     }
                  });
                  all.push(this.files[type][file].loaded);
                  sound.src = this.files[type][file].src;
                  sound.setAttribute("preload", "auto");
                  sound.setAttribute("controls", "none");
                  sound.style.display = "none";
                  document.body.appendChild(sound);
                  sound.play = (v = 1, l = false) => {
                      let clone = sound.cloneNode(true);
                      document.querySelector("body").appendChild(clone);
                      clone.volume = v;
                      clone.loop = l;
                      clone.play();
                      clone.addEventListener('ended', () => {
                          clone.remove();
                      });
                      return clone;
                  }
               }
               break;
            case 'gfx':
                  const image = new Image();
                  this[file] = image;
                  this.files[type][file].loaded = new Promise((resolve, reject) => {
                     this[file].onload = () => {
                        resolve(true);
                     }
                     this[file].onerror = () => {
                        reject(false);
                     }
                  });
                  image.src = this.files[type][file].src;
               break;
         }
      }
      Promise.all(all).then(this.done);
   }
}

// represent a 2D vector
export class vector2 {
    constructor(dx = 0, dy = 0) {
        this.dx = dx;
        this.dy = dy;
    }
    // returns a copy of this vector
    clone() {
        return new vector2(this.dx, this.dy);
    }
    // gets dx & dy from another vector
    scan(vector) {
        this.dx = vector.dx;
        this.dy = vector.dy;
    }
    // set dx & dy
    set(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }
    // changes the length of the vector to 1 in the same direction
    normalize() {
        const vectorLength = this.len();
        this.dx /= vectorLength;
        this.dy /= vectorLength;
        return this;
    }
    // scale vector (if `ys` is empty first parameter applies to both)
    scale(xs, ys) {
        if(ys !== undefined) {
            this.dx *= xs;
            this.dy *= ys;
        } else {
            this.dx *= xs;
            this.dy *= xs;
        }
    }
    // inverse the vector
    inverse() {
        this.scale(-1);
    }
    // vector + vector
    add(vector) {
        return new vector2(this.dx + vector.dx, this.dy + vector.dy);
    }
    // vector - vector
    subtract(vector) {
        return new vector2(this.dx - vector.dx, this.dy - vector.dy);
    }
    // vector * vector
    multiply(vector) {
        return new vector2(this.dx * vector.dx, this.dy * vector.dy);
    }
    // vector / vector
    divide(vector) {
        return new vector2(this.dx / vector.dx, this.dy / vector.dy);
    }
    // return length of the vector
    len() {
        return (this.dx ** 2 + this.dy ** 2) ** 0.5;
    }
    // return vector angle in radian
    getAngleInRadian() {
        return Math.atan2(this.dy, this.dx);
    }
    // return vector angle in degree
    getAngleInDegree() {
        return this.getAngleInRadian() * (180 / Math.PI);
    }
    // rotate the vector
    rotate(angle) {
        const dx = this.dx * Math.cos(angle) - this.dy * Math.sin(angle);
        const dy = this.dx * Math.sin(angle) + this.dy * Math.cos(angle);
        this.dx = dx;
        this.dy = dy;
    }
    // dot operation
    dot(vector) {
        return this.dx * vector.dx + this.dy * vector.dy;
    }
    // return angle between two vectors
    getAngleBetween(vector) {
        const dot = this.dot(vector);
        const mult = this.len() * vector.len();
        if(mult == 0) {
            return false;
        } else {
            const costheta = dot / mult;
            return Math.acos(costheta);
        }
    }
    // normal vector of this
    normal() {
        return new vector2(this.dy, -this.dx);
    }
    // return true if this vector is longer than `vector`
    isLongerThan(vector) {
        return this.len() > vector.len();
    }
    // return string representing this vector
    toString() {
        return `(${this.dx},${this.dy})`;
    }
}

// every thing that is going to be displayed shall exist in a scene
export class scene {
    constructor({
        canvas = null,
        width = window.innerWidth,
        height = window.innerHeight,
        backgroundColor = "#000",
        origin = {
            x: 0,
            y: 0
        },
        lighting = false
    } = {}) {
        // create canvas DOM element if its not passed to constructor
        this.view = canvas || document.createElement("canvas");
        // apply some css to canvas to make it cleaner
        const canvasStylesToApply = {
            "position": "absolute",
            "left": "0",
            "top": "0",
            "background-color": backgroundColor
        }
        for(const style in canvasStylesToApply) {
            this.view.style[style] = canvasStylesToApply[style];
        }
        this.view.setAttribute("width", `${width}px`);
        this.view.setAttribute("height", `${height}px`);
        this.view.setAttribute("oncontextmenu", "return false");
        if(canvas === null)
            document.body.appendChild(this.view);
        // stores all the elements that exists in this scene
        this.storage = [];
        // store lights
        this.lights = [];
        this.context = this.view.getContext('2d');
        this.width = width;
        this.height = height;
        this.backgroundColor = backgroundColor;
        this.origin = {};
        this.origin.x = origin.x;
        this.origin.y = origin.y;
        // if lighting is true then this will create a layer of darkness above every thing
        this.lighting = lighting;
        this.darknesh = 1;

    }
    // add a new element to the scene in order to display it
    add(newElements) {
        if(!newElements) return;
        if(!Array.isArray(newElements)) {
            newElements = [newElements];
        }
        for(let newElement of newElements) {
            if(this.storage.includes(newElement)) continue;
            if(!newElement.LIGHT)
                this.storage.push(newElement);
            else
                this.lights.push(newElement);
            newElement.scene = this;
            // whenever an element is added to the scene, onSceneAdd event will be called for that element
            ((newElement.onSceneAdd || (e => {})).bind(newElement))();
        }
        return this;
    }
    // remove an existing elements form scene [UNDONE]
    remove(existingElements) {
        if(!Array.isArray(existingElements)) {
            existingElements = [existingElements];
        }
        for(let existingElement of existingElements) {
            // whenever an element is removed from the scene, onSceneRemove event will be called for that element
            ((existingElement.onSceneRemove || (e => {})).bind(existingElement))();
            if(!existingElement.LIGHT)
                this.storage = this.storage.filter(element => element !== existingElement);
            else
                this.lights = this.lights.filter(element => element !== existingElement);
        }
    }
    // erase the canvas (aka clear)
    erase() {
        this.context.globalCompositeOperation = 'source-over';
        this.context.clearRect(0, 0, this.width, this.height);
        return this;
    }
    // fill canvas with a color
    refill(color = this.backgroundColor) {
        this.context.globalCompositeOperation = 'source-over';
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.fill();
        return this;
    }
    // update all visible elements in the storage
    update(camera) {
        if(!camera) return;
        this.darknesh++;
        this.context.translate(camera.x + this.origin.x, camera.y + this.origin.y);
        this.context.scale(camera.scale, camera.scale);
        this.context.scale((camera.mirrorx ? -1 : 1), (camera.mirrory ? -1 : 1));
        this.context.rotate(camera.rotation);
        if (this.lighting)
           this.lights.forEach(light => {
               const grd = this.context.createRadialGradient(light.x, light.y, light.size, light.x, light.y, light.radius);
               grd.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 255)`);
               grd.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);
               this.context.fillStyle = grd;
               this.context.beginPath();
               this.context.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
               this.context.fill();
           });
        if (this.lighting)
           this.context.globalCompositeOperation = 'source-atop';
        this.storage.sort(function(Element1, Element2) {
            if((Element1.z === undefined ? 0 : Element1.z) < (Element2.z === undefined ? 0 : Element2.z)) return -1;
            else return 1;
        });
        for(const element of this.storage) {
            if((element.visible || element.visible == undefined) && element.update)
                element.update(this.context);
        }
        this.context.rotate(-camera.rotation);
        this.context.scale((camera.mirrorx ? -1 : 1), (camera.mirrory ? -1 : 1));
        this.context.scale(1 / camera.scale, 1 / camera.scale);
        this.context.translate(-camera.x - this.origin.x, -camera.y - this.origin.y);
        return this;
    }
};

// camera is the offset from which you are looking at the canvas
export class camera {
    constructor({
        x = 0,
        y = 0,
        rotation = 0,
        scale = 1,
        mirrorx = false,
        mirrory = false
    } = {}) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scale = scale;
        this.mirrorx = mirrorx;
        this.mirrory = mirrory;
    }
    // camera will look at an element with some offset [UNDONE]
    lookAt({
        x = 0,
        y = 0
    } = {}) {
        this.x = -x;
        this.y = -y;
    }
}

// basix internal loop starts here
const internalLoop = (elapsed) => {
    requestAnimationFrame(internalLoop);
    const delta = elapsed - util.now;
    util.now = elapsed;
    if(!isNaN(delta)) {
        util.loop(delta, elapsed);
        util.easeStorage.forEach(ease => {
            ease.o[ease.p] = util.lerp(ease.initialValue, ease.v, util.easeTypes[ease.t]((util.now - ease.startedAt) / (ease.endsAt - ease.startedAt)));
            if(util.now >= ease.endsAt) {
                util.easeStorage = util.easeStorage.filter(e => e != ease);
                ease.c();
            }
        });
    }
}; internalLoop();