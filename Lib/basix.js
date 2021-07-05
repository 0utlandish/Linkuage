// ---------------------------//
//	   Basix Game Engine 	  //
// -------------------------- //

// author  : 0utlandish
// version : 1.4.0

// Basix global functions and attributes
const Basix = {
    version: "1.5.0"
};
// Basix configuration
Basix.config = {
    cursor: 'default',
}
Basix.layers = {
    counter: 1,
    list: {},
    add: args => {
        let def = {
            name: false
        }
        args = {
            ...def,
            ...args
        };
        args.name = args.name ? args.name : `Layer ${Basix.layers.counter++}`
        let layer = new Basix.Layer(args);
        layer.animate();
        return layer.tick();
    }
}
// Basix error logic manager
Basix.error = {
    add: (message) => {
        Basix.error.log.push({
            time: (new Date()).toLocaleTimeString(),
            message
        });
    },
    log: [],
    display: {
        last: (time = false) => {
            if (time)
                console.log(`%c[Basix] > %c${Basix.error.log[Basix.error.log.length-1].time} : %c${Basix.error.log[Basix.error.log.length-1].message}`, 'color: #E91E63', 'color: #1976D2', 'color: red');
            else
                console.log(`%c[Basix] > %c${Basix.error.log[Basix.error.log.length-1].message}`, 'color: #E91E63', 'color: red');
        },
        all: (time = false) => {
            Basix.error.log.forEach((err) => {
                if (time)
                    console.log(`%c[Basix] > %c${err.time} : %c${err.message}`, 'color: #E91E63', 'color: #1976D2', 'color: red');
                else
                    console.log(`%c[Basix] > %c${err.message}`, 'color: #E91E63', 'color: red');
            });
        }
    }
}
// loads assets (images, sounds, ...)
Basix.resources = {
    log: true,
    insert: {
        sound: (name, src) => {
            const sound = document.createElement("audio");
            sound.addEventListener('error', function(e) {
                console.log(e);
                e.preventDefault();
            });
            sound.src = src;
            sound.setAttribute("preload", "auto");
            sound.setAttribute("controls", "none");
            sound.style.display = "none";
            document.body.appendChild(sound);
            sound.play = () => {
                let clone = sound.cloneNode(true);
                document.querySelector("body").appendChild(clone);
                clone.play();
                clone.addEventListener('ended', () => {
                    clone.remove();
                });
            }
            Basix.resources.list.sfx[name] = sound;
        },
        image: (name, src) => {
            let image = new Image();
            image.src = src;
            Basix.resources.list.gfx[name] = image;
        }
    },
    list: {
        gfx: {},
        sfx: {}
    },
    progress: 0,
    index: 0,
    load: async () => {
        let count = 0;
        for (let group in Basix.resources.list) {
            for (let res in Basix.resources.list[group]) {
                count++;
            }
        }
        Basix.resources.log && console.log('%c[Basix] > %cLoading resources : ', 'color: #E91E63', 'color: #333');
        let loadings = [];
        return new Promise(async (pass) => {
            for (let group in Basix.resources.list) {
                for (let res in Basix.resources.list[group]) {
                    if (group == 'ready') continue;
                    let load = new Promise((resolve, reject) => {
                        if (Basix.resources.list[group][res].readyState > 3) {
                            Basix.resources.log && console.log(`%c[Basix] > %c${group} : ${res} %c(Loaded)`, 'color: #E91E63', 'color: #1976D2', 'background: green;color: #fff;font-size: 9px');
                            Basix.resources.index++;
                            resolve(true);
                            return true;
                        }
                        Basix.resources.list[group][res].addEventListener('canplaythrough', () => {
                            Basix.resources.log && console.log(`%c[Basix] > %c${group} : ${res} %c(Loaded)`, 'color: #E91E63', 'color: #1976D2', 'background: green;color: #fff;font-size: 9px')
                            Basix.resources.index++;
                            resolve(true);
                            return true;
                        }, false);
                        Basix.resources.list[group][res].onload = () => {
                            Basix.resources.log && console.log(`%c[Basix] > %c${group} : ${res} %c(Loaded)`, 'color: #E91E63', 'color: #1976D2', 'background: green;color: #fff;font-size: 9px');
                            Basix.resources.index++;
                            resolve(true);
                            return true;
                        }
                        Basix.resources.list[group][res].onerror = () => {
                            Basix.resources.log && console.log(`%c[Basix] > %c${group} : ${res} %c(Error)`, 'color: #E91E63', 'color: #1976D2', 'background: red;color: #fff;font-size: 9px');
                            Basix.resources.list[group][res] = res;
                            Basix.resources.index++;
                            resolve(false);
                            return true;
                        }
                    });
                    loadings.push(load);
                    await load;
                    Basix.resources.progress = Basix.resources.index / count;
                }
            }
            Promise.all(loadings).then(function(results) {
                if (!results.includes(false)) {
                    Basix.resources.log && console.log('%c[Basix] > %cAll resources loaded successfully !', 'color: #E91E63', 'font-weight: bold;color: #00C000');
                    pass(true);
                } else {
                    Basix.resources.log && console.log('%c[Basix] > %cSome of the resources may not be loaded !', 'color: #E91E63', 'font-weight: bold;color: #C00000');
                    pass(false);
                }
            });
        });
    }
}

// store mouse position on the window
Basix.mouse = {
    x: 0,
    y: 0
}
document.addEventListener('mousemove', e => {
    Basix.mouse.x = e.offsetX;
    Basix.mouse.y = e.offsetY;
});

// mouse and keyboard events
Basix.keydown = {};
Basix.mousedown = {};
document.addEventListener('mousedown', e => {
    if (e.target.tagName == 'CANVAS') {
        for (name in Basix.layers.list) {
            Basix.mousedown[['mouseleft', 'mousemiddle', 'mouseright'][e.button]] = true;
        }
    }
});
document.addEventListener('mouseup', e => {
    if (e.target.tagName == 'CANVAS') {
        for (name in Basix.layers.list) {
            Basix.mousedown[['mouseleft', 'mousemiddle', 'mouseright'][e.button]] = false;
        }
    }
});
document.addEventListener('keydown', e => {
    if (document.activeElement.tagName == 'BODY') {
        for (name in Basix.layers.list) {
            Basix.keydown[e.key] = true;
        }
    }
});
document.addEventListener('keyup', e => {
    if (document.activeElement.tagName == 'BODY') {
        for (name in Basix.layers.list) {
            Basix.keydown[e.key] = false;
        }
    }
});

// every Layer is a canvas element with desired settings such as different fps and tps
// @parameter {string}     name 		: id of canvas element (not much important)
// @parameter {number}  width 		: width of canvas
// @parameter {number}  height 	: height of canvas
// @parameter {integer}   fps 		: frames per second
// @parameter {integer}   tps 		: ticks per second
// @parameter {boolean}  alpha 		: canvas context alpha activation
Basix.Layer = class {
    constructor(args) {
        const def = {
            name: 'default',
            width: window.innerWidth,
            height: window.innerHeight,
            left: 0,
            top: 0,
            autofps: true,
            fps: 60,
            tps: 60,
            alpha: false,
            monitor: false,
            clear: true,
            background: false
        }
        args = {
            ...def,
            ...args
        };
        Basix.layers.list[args.name] = this;
        const body = document.querySelector('body');
        this.organ = document.createElement("canvas");
        this.organ.style.cursor = Basix.config.cursor;
        this.organ.style.position = "fixed";
        this.organ.style.zIndex = "-1";
        this.organ.style.left = args.left;
        this.organ.style.top = args.top;
        this.monitor = document.createElement("span");
        this.monitor.style.fontSize = "10px";
        this.monitor.style.padding = "5px 15px";
        this.monitor.style.fontWeight = "bold";
        this.monitor.style.fontFamily = "monospace";
        this.monitor.style.color = "#E1F5FE";
        this.monitor.style.background = "#E91E63";
        this.monitor.style.display = "block";
        this.monitor.style.margin = "10px";
        this.monitor.style.borderRadius = "6px";
        this.monitor.innerText = "-";
        body.append(this.organ);
        document.querySelector("#status").append(this.monitor);
        this.name = args.name;
        this.width = args.width;
        this.height = args.height;
        this.alpha = args.alpha;
        this.clear = args.clear;
        this.background = args.background;
        this.organ.setAttribute("id", args.name);
        this.organ.setAttribute("width", this.width);
        this.organ.setAttribute("height", this.height);
        this.organ.setAttribute("oncontextmenu", "return false");
        this.xCenter = this.width / 2;
        this.yCenter = this.height / 2;
        this.elements = [];
        this.autofps = args.autofps;
        this.fps = args.fps;
        this.tps = args.tps;
        this.pause = false;
        this.tile = {
            visible: false,
            size: 32,
            width: 0.2,
            color: "#00AA00",
        };
        // camera offset
        this.camera = {
            x: 0,
            y: 0
        };
        // elements size scale
        this.scale = 1;
        // context of the canvas
        this.context = this.organ.getContext("2d", {
            alpha: this.alpha
        });
        // to read real fps & tps
        this.status = {
            display: (mood = true) => {
                this.monitor.style.display = mood ? "block" : "none";
                setInterval(() => {
                    this.monitor.innerHTML = `[${this.name}] :: FPS : ${this.status.fps.last} | TPS : ${this.status.tps.last} | REN : ${(() => {
						return this.elements.filter(e => e.object.visible).length;
					}) ()}`;
                }, 1000);
            },
            fps: {
                counter: 0,
                last: null,
                start: (() => {
                    setInterval(() => {
                        this.status.fps.last = this.status.fps.counter;
                        this.status.fps.counter = 0;
                    }, 1000);
                })()
            },
            tps: {
                counter: 0,
                last: null,
                start: (() => {
                    setInterval(() => {
                        this.status.tps.last = this.status.tps.counter;
                        this.status.tps.counter = 0;
                    }, 1000);
                })()
            }
        }
        this.status.display(args.monitor);
    }
    // make all of its elements stop moving and pause animate and tick functions 
    freeze() {
        this.pause = true;
        this.elements.forEach(element => {
            element.object.stop();
        });
        return this;
    }
    // the logic of your creation executes here
    tick() {
        this.status.tps.counter++;
        if (!this.pause) {
            for (let i = 0; i < this.elements.length; i++) {
                this.elements[i].object.tick(this.elements[i]);
            }
        }
        const that = this;
        setTimeout(() => {
            that.tick();
        }, 1000 / this.tps);
        return this;
    }
    // clear the canvas and paint again
    animate() {
        this.status.fps.counter++;
        this.elements.sort(function(a, b) {
            if (a.object.z < b.object.z) return -1;
            if (a.object.z > b.object.z) return 1;
            return 0;
        });
        if (!this.pause) {
            if (this.clear) {
                if (this.background) {
                    this.context.fillStyle = this.background;
                    this.context.fillRect(0, 0, this.width, this.height);
                } else {
                    this.context.clearRect(0, 0, this.width, this.height);
                }
            }
            if (this.tile.visible) {
                this.context.strokeStyle = this.tile.color;
                for (let i = 0; i < this.width / this.tile.size; i++) {
                    this.context.lineWidth = this.tile.width;
                    this.context.moveTo(0, i * this.tile.size);
                    this.context.lineTo(this.width, i * this.tile.size);
                    this.context.moveTo(i * this.tile.size, 0);
                    this.context.lineTo(i * this.tile.size, this.height);
                }
                this.context.stroke();
                this.context.fill();
            }
            this.elements.forEach(element => {
                if (element.object.visible)
                    element.object.render(
                        this.context,
                        this.camera,
                        this.scale
                    );
            });
        }
        if (this.fps) {
            const that = this;
            if (this.autofps) {
                window.requestAnimationFrame(() => {
                    that.animate();
                });
            } else {
                setTimeout(() => {
                    that.animate();
                }, 1000 / this.fps);
            }
            return this;
        }
    }
}

// this class manages tileset image and make you able to draw it on canvas 
// @parameter {Image}    layer 		: Image object that you want to fuck the tileset out of it
// @parameter {number}  tileSize 	: size of every tile
Basix.Tileset = class {
    constructor(args) {
        const def = {
            image: null,
            tileSize: 32
        }
        args = {
            ...def,
            ...args
        }
        this.tileSize = args.tileSize;
        this.image = args.image;
    }
    draw(args) {
        const def = {
            layer: null,
            i: 0,
            j: 0,
            x: 0,
            y: 0,
            size: this.tileSize
        }
        args = {
            ...def,
            ...args
        };
        args.layer.context.drawImage(this.image, args.i * this.tileSize, args.j * this.tileSize, this.tileSize, this.tileSize, args.x, args.y, args.size, args.size);
        return this;
    }
    tileDraw(args) {
        const def = {
            layer: null,
            i: 0,
            j: 0,
            x: 0,
            y: 0
        }
        args = {
            ...def,
            ...args
        };
        args.layer.context.drawImage(this.image, args.i * this.tileSize, args.j * this.tileSize, this.tileSize, this.tileSize, args.x * this.tileSize, args.y * this.tileSize, this.tileSize, this.tileSize);
        return this;
    }
}

// this Element class has the main attributes of every element that is going to be created
// @parameter {string}    	layer 		: layer name in which your element will be rendered
// @parameter {number}    	x 			: x position of the element
// @parameter {number}    	y 			: y position of the element
// @parameter {number}    	size 		: size of the element [optional]
Basix.Element = class {
    constructor(args) {
        const def = {
            layer: "default",
            x: 0,
            y: 0,
            z: 0,
            size: 0
        }
        args = {
            ...def,
            ...args
        };
        if (Basix.layers.list[args.layer] == undefined) {
            Basix.error.add(`Layer '${args.layer}' is not defined !`);
        }
        this.layer = Basix.layers.list[args.layer];
        this.x = args.x;
        this.y = args.y;
        this.z = args.z;
        this.size = args.size;
        this.layer.elements.push({
            z: this.z,
            object: this
        });
        this.visible = true;
        this.idle = true;
        this.done = false;
        this.stop = () => {};
    }
    // removes element from layers element list
    remove() {
        if (!this.done) {
            this.done = true;
            this.stop();
        }
        this.layer.elements = this.layer.elements.filter(e => {
            return (e.object != this);
        });
    }
    // preform several move in sequence
    // @parameter {number}  x 				: destination x
    // @parameter {number}  y 				: destination y
    // @parameter {number}  duration 		: duration till element reach the destination (in 0.01s => 100 will be 1 sec)
    // @parameter {boolean}  relative		: if true destination x and y are relative to the current element position
    // @parameter {function} 	callback	: this function will be called after movement finished or element is stopped, pass true as input if element reached the destination and false if element is stopped 
    moveByDuration(args) {
        this.stop();
        return new Promise((resolve) => {
            const def = {
                x: 0,
                y: 0,
                duration: 100,
                relative: false,
                callback: () => {}
            }
            args = {
                ...def,
                ...args
            };
            if (args.relative) {
                args.x += this.x;
                args.y += this.y;
            }
            if (this.x == args.x && this.y == args.y) return true;
            const slop = Math.abs((args.y - this.y) / (args.x - this.x));
            const distance = ((args.y - this.y) ** 2 + (args.x - this.x) ** 2) ** 0.5;
            const speed = distance / args.duration;
            const angle = Math.atan(slop) * (180 / Math.PI);
            const xs = Math.sign(args.x - this.x) * Math.cos(angle / (180 / Math.PI));
            const ys = Math.sign(args.y - this.y) * Math.sin(angle / (180 / Math.PI));
            let driver = setInterval(() => {
                this.x += speed * xs;
                this.y += speed * ys;
            }, 10);
            this.stop = (status = false) => {
                if (driver) {
                    args.callback(status);
                    clearInterval(driver);
                    driver = false;
                    resolve(true);
                }
            }
            setTimeout(this.stop, args.duration * 10, true);
        });
    }
    // preform several move in sequence
    // @parameter {number}  x 				: destination x
    // @parameter {number}  y 				: destination y
    // @parameter {number}  speed 			: movement speed (pixels per 0.01)
    // @parameter {boolean}  relative		: if true destination x and y are relative to the current element position y
    // @parameter {function} 	callback	: this function will be called after movement finished or element is stopped, pass true as input if element reached the destination and false if element is stopped 
    moveBySpeed(args, priority = true) {
        if (priority)
            this.stop();
        return new Promise((resolve) => {
            const def = {
                x: 0,
                y: 0,
                speed: 10,
                relative: false,
                callback: () => {}
            }
            args = {
                ...def,
                ...args
            };
            if (args.relative) {
                args.x += this.x;
                args.y += this.y;
            }
            if (this.x == args.x && this.y == args.y) return true;
            const slop = Math.abs((args.y - this.y) / (args.x - this.x));
            const distance = ((args.y - this.y) ** 2 + (args.x - this.x) ** 2) ** 0.5;
            const duration = distance / args.speed;
            const angle = Math.atan(slop) * (180 / Math.PI);
            const xs = Math.sign(args.x - this.x) * Math.cos(angle / (180 / Math.PI));
            const ys = Math.sign(args.y - this.y) * Math.sin(angle / (180 / Math.PI));
            let driver = setInterval(() => {
                this.x += args.speed * xs;
                this.y += args.speed * ys;
            }, 1000 / this.layer.tps);
            this.stop = (status = false) => {
                if (driver) {
                    args.callback(status);
                    clearInterval(driver);
                    driver = false;
                    resolve(true);
                }
            }
            setTimeout(this.stop, duration * 10 + 5, true);
        });
    }
    // preform several move in sequence
    // @parameter {integer} cycle			: determine how many time task should repeat (set to Infinity if you want it to loop for ever)
    // @parameter {arrays->object} moves 	: store moves values
    // @parameter {number} x 				: destination x
    // @parameter {number} y 				: destination y
    // @Note : on of the following attribute are allowed to use
    // @parameter {number} speed 			: movement speed
    // @parameter {number} duration 		: movement duration
    task(args) {
        const def = {
            moves: [],
            cycle: 1,
            priority: false,
            callback: () => {}
        }
        if (this.idle != true) {
            return false;
        }
        args = {
            ...def,
            ...args
        };
        this.idle = false;
        let task = (async function(that) {
            const numberOfMoves = args.moves.length;
            const i = 0;
            const x = 0;
            while (i < numberOfMoves && !that.idle) {
                if (that.idle == false) {
                    if (args.moves[i].duration == undefined) {
                        await that.moveBySpeed({
                            x: args.moves[i].x,
                            y: args.moves[i].y,
                            speed: args.moves[i].speed,
                            callback: () => {
                                i++;
                            }
                        });
                    } else {
                        await that.moveByDuration({
                            x: args.moves[i].x,
                            y: args.moves[i].y,
                            duration: args.moves[i].duration,
                            callback: () => {
                                i++;
                            }
                        });
                    }
                }
                if (i == numberOfMoves && !that.idle) {
                    i = 0;
                    x++;
                }
                if (args.cycle == x) {
                    that.idle = true;
                }
            }
        })(this);
        task.then(args.callback);
        return this;
    }
    render() {
        // must be overwrite
    }
    tick() {
        // must be overwrite
    }
}

// loads Basix Models Scheme (bsm) file
// @parameter {string} src		: bsm file adress
// @parameter {number} scale	: bsm model scale
Basix.BMS = class {
    constructor(src, scale = 1) {
        this.src = src;
        this.scale = scale;
        this.decode = (b) => {
            var f, o;
            var a, e = {},
                d = b.split(""),
                c = f = d[0],
                g = [c],
                h = o = 256;
            for (b = 1; b < d.length; b++) a = d[b].charCodeAt(0), a = h > a ? d[b] : e[a] ? e[a] : f + c, g.push(a), c = a.charAt(0), e[o] = f + c, o++, f = a;
            return g.join("")
        }
        this.load = (() => {
            return new Promise(async r => {
                let resp = await fetch(src);
                this.data = this.decode(await resp.text());
                this.data = JSON.parse(this.data);
                this.width = this.data.length;
                this.height = this.data[0].length;
                this.update();
                r();
            });
        })();
        this.update = () => {
            this.figure = new OffscreenCanvas(this.width * this.scale, this.height * this.scale);
            let context = this.figure.getContext('2d');
            for (let i = 0; i < this.width; i++)
                for (let j = 0; j < this.height; j++) {
                    context.fillStyle = this.data[i][j];
                    context.fillRect(i * this.scale, j * this.scale, this.scale, this.scale);
                }
        }
    }
}

// initialize defualtLayer
Basix.init = () => {
    Basix.layers.add({
        name: 'default',
        autofps: true,
        tps: 60,
        monitor: true,
        clear: true
    });
}

// setting proper css style for document
const body = document.querySelector('body');
body.onselectstart = function() {
    return (false);
};
body.style.margin = 0;
body.style.padding = 0;
body.style.backgroundColor = '#E91E63';
let status = document.createElement("span");
status.setAttribute("id", "status");
status.style.position = "fixed";
status.style.left = 0;
status.style.top = 0;
status.style.zIndex = 1;
body.append(status);

console.info(`%c■ Powered by %cBasix %c${Basix.version}`, 'font-weight: bold', 'color: #E91E63;font-weight: bold', 'background: #00E676;color: #FFF;border-radius: 50px;font-size:9px;padding:2px 5px;');

export default Basix;