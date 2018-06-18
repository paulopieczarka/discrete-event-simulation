(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require('./src/jssim');
},{"./src/jssim":2}],2:[function(require,module,exports){
var jssim = jssim || {};

(function (jss) {
    jss.exchange = function (a, i, j) {
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    };
    
    jss.shuffle = function (a) {
        var n = a.length;
        for (var i = 1; i < n; ++i) {
            var j = Math.floor(Math.random() * (1+i));
            jss.exchange(a, i, j);
        }
    };
    
    jss.s4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    
    jss.guid = function () {
        return jss.s4() + jss.s4() + '-' + jss.s4() + '-' + jss.s4() + '-' + jss.s4() + '-' + jss.s4() + jss.s4() + jss.s4();
    };
	
    var MinPQ = function (compare) {
        if(!compare){
            compare = function(a1, a2) {
                return a1 - a2;
            };
        }
        this.s = [];
        this.N = 0;
        this.compare = compare;
    };
    
    MinPQ.prototype.less = function (a1, a2){
        return this.compare(a1, a2) < 0;
    };
    
    MinPQ.prototype.enqueue = function (item) {
        while(this.s.length <= this.N + 1){
            this.s.push(0);
        }  
        this.s[++this.N] = item;
        this.swim(this.N);
    };
    
    MinPQ.prototype.delMin = function () {
        if(this.N == 0) {
            return null;
        }  
        
        var item = this.s[1];
        jss.exchange(this.s, 1, this.N--);
        this.sink(1);
        return item;
    };
    
    MinPQ.prototype.min = function() {
        if(this.N == 0) {
            return null;
        }  
        return this.s[1];
    };
    
    MinPQ.prototype.sink = function (k) {
        while (k * 2 <= this.N) {
            var child = k * 2;
            if (child < this.N && this.less(this.s[child+1], this.s[child])){
                child++;
            }
            if(this.less(this.s[child], this.s[k])){
                jss.exchange(this.s, child, k);
                k = child;
            } else {
                break;
            }
        }  
    };
    
    MinPQ.prototype.swim = function (k) {
        while(k > 1) {
            var parent = Math.floor(k / 2);
            if(this.less(this.s[k], this.s[parent])) {
                jss.exchange(this.s, k, parent);
                k = parent;
            } else {
                break;
            }
        }  
    };
    
    MinPQ.prototype.clear = function () {
        this.s = [];
        this.N = 0;
    };
    
    MinPQ.prototype.size = function () {
        return this.N;
    };
    
    MinPQ.prototype.isEmpty = function () {
        return this.N == 0;
    };
    
    jss.MinPQ = MinPQ;
    
    var StackNode = function(value) {
        this.value = value;
        this.next = null;
    };
    
    jss.StackNode = StackNode;
    
    var Stack = function (){
        this.N = 0;
        this.first = null;
    };
    
    Stack.prototype.push = function(item) {
        var oldFirst = this.first;
        this.first = new jss.StackNode(item);
        this.first.next = oldFirst;
        this.N++;
    };
    
    Stack.prototype.pop = function (item) {
        var oldFirst = this.first;
        if(oldFirst == null) {
            return null;
        }
        var item = oldFirst.value;
        this.first = oldFirst.next;
        this.N--;
        return item;
    };
    
    Stack.prototype.clear = function () {
        this.N = 0;
        this.first = null;
    };
    
    Stack.prototype.size = function () {
        return this.N;
    };
    
    Stack.prototype.isEmpty = function () {
        return this.N == 0;
    };
    
    jss.Stack = Stack;
    
    var QueueNode = function (value) {
        this.value = value;
        this.next = null;
    };
    
    jss.QueueNode = QueueNode;
    
    var Queue = function () {
        this.first = null;
        this.last = null;
        this.N = 0;
    };
    
    Queue.prototype.enqueue = function (item) {
        var oldLast = this.last;
        this.last = new jss.QueueNode(item);
        if(oldLast != null) {
            oldLast.next = this.last;
        }
        if(this.first == null) {
            this.first = this.last;
        }
        this.N++;
    };
    
    Queue.prototype.dequeue = function () {
        var oldFirst = this.first;
        if(oldFirst == null) {
            return null;
        }
        var item = oldFirst.value;
        this.first = oldFirst.next;
        if(this.first == null) {
            this.last = null;
        }
        this.N--;
        return item;
    };
    
    Queue.prototype.clear = function () {
        this.first = null;
        this.last = null;
        this.N = 0;
    };
    
    Queue.prototype.isEmpty = function () {
        return this.N == 0;
    };
    
    Queue.prototype.size = function() {
        return this.N;
    };
    
    jss.Queue = Queue;
    
    var SimEvent = function (rank){
        this.time = 0;
        if(rank){
            this.rank = rank;
        } else {
            this.rank = 1;
        }
    };
    
    SimEvent.prototype.guid = function () {
        if(this.id) {
            return this.id;
        } else {
            this.id = jss.guid();
            return this.id;
        }
    };
    
    SimEvent.prototype.sendMsg = function (recipient, message) {
        this.scheduler.messenger.sendMsg(this.guid(), recipient, message);
    };
    
    SimEvent.prototype.readInBox = function () {
        return this.scheduler.messenger.readInBox(this.guid());
    };
    
    jss.SimEvent = SimEvent;
    
    var Scheduler = function () {
        this.pq = new jss.MinPQ(function(evt1, evt2){
            var time_diff = evt1.time - evt2.time;
            if(time_diff == 0) {
                return evt2.rank - evt1.rank;
            } else {
                return time_diff;
            }
        });  
        this.current_time = null;
        this.current_rank = null;
        this.messenger = new jss.Messenger(this);
    };
    
    Scheduler.prototype.update = function () {
        var current_rank = null;
        var current_time = null;
        
        while(!this.pq.isEmpty()){
            var evt = this.pq.min();
            var time = evt.time;
            var rank = evt.rank;
            if(current_time == null) {
                current_time = time;
            } else if(current_time != time) {
                break;
            }
            
            this.update_mini();
        }  
        
        this.messenger.update(0);
    };
    
    Scheduler.prototype.update_mini = function () {
        var current_time = null;
        var current_rank = null;
        var events = [];
        while(!this.pq.isEmpty()){
            var evt = this.pq.min();
            var time = evt.time;
            var rank = evt.rank;
            if(current_time == null) {
                current_time = time;
            } else if(current_time != time) {
                break;
            }
            
            if(current_rank == null) {
                current_rank = rank;
            } else if(current_rank != rank) {
                break;
            }
            
            events.push(this.pq.delMin());
        }  
        
        jss.shuffle(events);
        
        var old_time = this.current_time;
        if(events.length > 0){
            this.current_time = current_time;
            this.current_rank = current_rank;
        } 
        
        for(var i = 0; i < events.length; ++i){
            var deltaTime = 0;
            if(this.current_time != null) {
                deltaTime = current_time - old_time;
            } else {
                deltaTime = current_time;
            }
            if(!events[i].update){
                console.log('event does not define update(deltaTime) method!!!');
            } else {
                events[i].update(deltaTime);
            }
        }
        
        
        
        for(var i = 0; i < events.length; ++i) {
            if(events[i].repeatInterval) {
                this.scheduleRepeatingAt(events[i], this.current_time + events[i].repeatInterval, events[i].repeatInterval);
            }
        }
        
        return events;
    };
    
    Scheduler.prototype.schedule = function (evt, time) {
        evt.time = time;
        if(!evt.scheduler) {
            evt.scheduler = this;
        }
        this.pq.enqueue(evt);  
    };
    
    Scheduler.prototype.hasEvents = function () {
        return !this.pq.isEmpty();  
    };
    
    // Method that schedules an event to fire once at delta time later (than the current time) 
    Scheduler.prototype.scheduleOnceIn = function (evt, deltaTime) {
        var start_time = this.current_time;
        if(this.current_time == null) {
            start_time = 0;
        }
        if(!evt.scheduler) {
            evt.scheduler = this;
        }
        evt.time = start_time + deltaTime;
        this.pq.enqueue(evt);
    };
    
    // Method that schedules an event to fire at interval of delta time from now on (other than the current time)
    Scheduler.prototype.scheduleRepeatingIn = function (evt, deltaTime) {
        var start_time = this.current_time;
        if(this.current_time == null) {
            start_time = 0;
        }
        if(!evt.scheduler) {
            evt.scheduler = this;
        }
        this.scheduleRepeatingAt(evt, start_time+deltaTime, deltaTime);
    };
    
    // Method that schedules an event to fire at interval of delta time, with first event fired at the time specified
    Scheduler.prototype.scheduleRepeatingAt = function (evt, startTime, deltaTime) {
        evt.time = startTime;
        evt.repeatInterval = deltaTime;
        if(!evt.scheduler) {
            evt.scheduler = this;
        }
        this.pq.enqueue(evt);
    };
    
    Scheduler.prototype.reset = function (){
        this.current_rank = null;
        this.current_time = null;
        this.pq.clear();
        this.messenger.reset();
    };
    
    jss.Scheduler = Scheduler;
    
    var Vector2D = function(x, y) {
        this.x = x;
        this.y = y;
    };
    
    Vector2D.prototype.distance = function (that) {
        var dx = this.x - that.x;
        var dy = this.y - that.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    
    Vector2D.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);  
    };
    
    Vector2D.prototype.resize = function (len) {
        var current_len = this.length();
        if(current_len == 0){
            return;
        }
        var ratio = len / current_len;
        
        this.x *= ratio;
        this.y *= ratio;
    };
    
    Vector2D.prototype.addIn = function (f) {
        this.x += f.x;
        this.y += f.y;
    };
    
    Vector2D.prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
    };
    
    jss.Vector2D = Vector2D;
    
    var Line2D = function (x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    };
    
    jss.Line2D = Line2D;
    
    var Space2D = function () {
        this.locations = [];
        this.agents = [];
        this.width = 100;
        this.height = 100;
        this.lines = [];
        this.cellWidth = 1;
        this.cellHeight = 1;
        this.network = null;
    };
    
    Space2D.prototype.reset = function () {
        this.locations = [];
        this.agents = [];
        this.lines = [];
        if(this.network != null) {
            this.network.reset();
        }
    };
    
    Space2D.prototype.getLocation = function (agentId) {
        return this.locations[agentId];
    };
    
    Space2D.prototype.getAgent = function (agentId) {
        return this.agents[agentId];
    };
    
    Space2D.prototype.updateAgent = function (agent, x, y) {
        this.locations[agent.id] = new jss.Vector2D(x, y);
        this.agents[agent.id] = agent;
    };
    
    Space2D.prototype.findAllAgents = function () {
        return this.agents;  
    };
    
    Space2D.prototype.drawLine = function(x1, y1, x2, y2) {
        this.lines.push(new jss.Line2D(x1, y1, x2, y2));  
    };
    
    Space2D.prototype.clearLines = function () {
        this.lines = [];  
    };
    
    Space2D.prototype.render = function (canvas) {
        if(!canvas) {
            return;
        }
        
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        
        
        if(this.network != null) {
            context.strokeStyle = this.network.lineColor;
            for(var v = 0; v < this.network.V; ++v) {
                var adj_v = this.network.adj(v);
                if(adj_v.length == 0) continue;
                var me = this.locations[v];
                var x1 = me.x;
                var y1 = me.y;
                for(var i=0; i < adj_v.length; ++i) {
                    var e = adj_v[i];
                    if(e.either() == v) {
                        var w = e.other(v);
                        var him = this.locations[w];
                        
                        var x2 = him.x;
                        var y2 = him.y;
                        console.log(x1 + ', ' + y1 + ' == ' + x0 + y0);
                        x0 = x2;
                        y0 = y2;
                        context.moveTo(x1 * this.cellWidth, canvas.height - y1 * this.cellHeight);
                        context.lineTo(x2 * this.cellWidth, canvas.height - y2 * this.cellHeight);
                        context.stroke();
                    }
                }
            }
        }
        
        context.strokeStyle = "#0000FF";
        
        var x0 = 0;
        var y0 = 0;
        for(var i=0; i < this.lines.length; ++i) {
            context.beginPath();
            var line = this.lines[i];
            var x1 = line.x1;
            var y1 = line.y1;
            var x2 = line.x2;
            var y2 = line.y2;
            console.log(x1 + ', ' + y1 + ' == ' + x0 + y0);
            x0 = x2;
            y0 = y2;
            context.moveTo(x1 * this.cellWidth, canvas.height - y1 * this.cellHeight);
            context.lineTo(x2 * this.cellWidth, canvas.height - y2 * this.cellHeight);
            context.stroke();
        }
        
        
        
        for(id in this.locations){
            var agent = this.agents[id];
            var pos = this.locations[id];
            
            if(agent.draw) {
                agent.draw(context, new jss.Vector2D(pos.x, canvas.height - pos.y));
            } else {
                context.fillStyle="#000000";
                if(agent.color) {
                    context.fillStyle = agent.color;
                }
                var width = 20;
                var height = 20;
                if(agent.size) {
                    width = agent.size.x;
                    height = agent.size.y;
                }
                if(!width) {
                    width = 20;
                }
                if(!height) {
                    height = 20;
                }
                if(agent.id){
                    context.font = "12 Arial";
                    context.fillText("" + agent.id,pos.x, canvas.height - pos.y);
                } 
                context.fillRect(pos.x, canvas.height - pos.y, width,height);
            }
        }  
    };
    
    Space2D.prototype.getNeighborsWithinDistance = function(loc, distance) {
        var result = [];
        for(id in this.locations) {
            var loc2 = this.locations[id];
            if(loc2.distance(loc) < distance){
                result.push(this.agents[id]);
            }
        }    
        return result;
    };
    
    jss.Space2D = Space2D;
    
    
    
    var Grid = function (width, height) {
        this.width = width;
        this.height = height;
        this.cells = [];
        this.trails = [];
        this.potentialField = [];
        this.obstacles = [];
        this.targets = [];
        for(var i = 0; i < width; ++i) {
            this.cells.push([]);
            this.trails.push([]);
            this.obstacles.push([]);
            this.targets.push([]);
            this.potentialField.push([]);
            for(var j=0; j < height; ++j) {
                this.cells[i].push(0);
                this.trails[i].push(0);
                this.obstacles[i].push(0);
                this.targets[i].push(0);
                this.potentialField[i].push(0);
            }
        }
        this.color = '#ff0000';
        this.trailColor = '#55aa55';
        this.obstacleColor = '#888888';
        this.targetColor = '#0000ff';
        this.cellWidth = 10;
        this.cellHeight = 10;
        this.showTrails = false;
        this.showPotentialField = false;
        this.maxPotential = -1000000.0;
        this.minPotential = 1000000.0;
    };
    
    Grid.prototype.setCell = function(x, y, value) {
        this.cells[x][y] = value;
        if(value > 0) {
            this.trails[x][y] += 1;
        }
    };
    
    Grid.prototype.setObstable = function(x, y, value) {
        this.obstacles[x][y] = value;
    };
    
    Grid.prototype.setPotential = function(x, y, value) {
        this.potentialField[x][y] = value;
        if(value > this.maxPotential) {
            this.maxPotential = value;
        }
        if(value < this.minPotential) {
            this.minPotential = value;
        }
    };
    
    Grid.prototype.setTarget = function(x, y, value) {
        this.targets[x][y] = value;
    };
    
    Grid.prototype.createCylinder = function(x, y, radius) {
        var min_x = x - radius;
        var max_x = x + radius;
        var min_y = y - radius;
        var max_y = y + radius;
        if(min_x < 0) min_x = 0;
        if(max_x >= this.width) max_x = this.width -1;
        if(min_y < 0) min_y = 0;
        if(max_y >= this.height) max_y = this.height - 1;
        for(var _x = min_x; _x <= max_x; ++_x) {
            for(var _y = min_y; _y <= max_y; ++_y) {
                var dx = _x - x;
                var dy = _y - y;
                var _radius = Math.sqrt(dx * dx + dy * dy);
                if(_radius <= radius) {
                    this.obstacles[_x][_y] = 1;
                }
            }
        }
    };
    
    Grid.prototype.createTarget = function(x, y, size) {
        var size2 = Math.floor(size / 2);
        var min_x = x - size2;  
        var max_x = min_x + size;
        var min_y = y - size2;
        var max_y = min_y + size;
        for(var _x = min_x; _x <= max_x; ++_x) {
            for(var _y = min_y; _y <= max_y; ++_y) {
                this.targets[_x][_y]  = 1;
            }
        }
    };
    
    
    Grid.prototype.getCell = function(x, y) {
        return this.cells[x][y];
    };
    
    Grid.prototype.makeCopy = function () {
        var grid = new Grid(this.width, this.height);  
        for(var i=0; i < this.width; ++i) {
            for(var j=0; j < this.height; ++j) {
                grid.cells[i][j] = this.cells[i][j];
                grid.potentialField[i][j] = this.potentialField[i][j];
                grid.obstacles[i][j] = this.obstacles[i][j];
                grid.targets[i][j] = this.targets[i][j];
                grid.trails[i][j] = this.trails[i][j];
            }
        }
        grid.showPotentialField = this.showPotentialField;
        grid.showTrails = this.showTrails;
        grid.minPotential = this.minPotential;
        grid.maxPotential = this.maxPotential;
        grid.cellWidth = this.cellWidth;
        grid.cellHeight = this.cellHeight;
        grid.color = this.color;
        grid.trailColor = this.trailColor;
        grid.targetColor = this.targetColor;
        grid.obstacleColor = this.obstacleColor;
        return grid;
    };
    
    Grid.prototype.reset = function () {
        for(var i=0; i < this.width; ++i) {
            for(var j=0; j < this.height; ++j) {
                this.cells[i][j] = 0;
                this.trails[i][j] = 0;
                this.obstacles[i][j] = 0;
                this.targets[i][j] = 0;
                this.potentialField[i][j] = 0;
            }
        }  
        
        this.maxPotential = -1000000.0;
        this.minPotential = 1000000.0;
    };
    
    Grid.prototype.isOccupied = function (x, y) {
        if(x < 0 || x >= this.width) return false;
        if(y < 0 || y >= this.height) return false;
        return this.cells[x][y] > 0;
    };
    
    Grid.prototype.isObstacle = function (x, y) {
        if(x < 0 || x >= this.width) return false;
        if(y < 0 || y >= this.height) return false;
        return this.obstacles[x][y] > 0;
    };
    
    Grid.prototype.isTarget = function(x, y) {
        if(x < 0 || x >= this.width) return false;
        if(y < 0 || y >= this.height) return false;
        return this.targets[x][y] > 0;
    };
    
    Grid.prototype.render = function (canvas) {
        if(!canvas) {
            return;
        }
        
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle=this.color;
        

        for(var i=0; i < this.width; ++i){
            for(var j=0; j < this.height; ++j) {
                if(this.showTrails && this.trails[i][j] > 0) {
                    context.fillStyle=this.trailColor;
                    context.fillRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth-1, this.cellHeight-1);
                } 
                if(this.showPotentialField && this.potentialField[i][j] != 0) {
                    var potential = this.potentialField[i][j];
                    var r = 255;
                    var g = 100 + Math.floor(155 * (potential - this.minPotential) / (this.maxPotential - this.minPotential));
                    var b = Math.floor(255 * (potential - this.minPotential) / (this.maxPotential - this.minPotential));
                    context.fillStyle =  "rgb("+r+","+g+","+b+")";
                    context.fillRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth-1, this.cellHeight-1);
                }
                if(this.obstacles[i][j] > 0) {
                    context.fillStyle = this.obstacleColor;
                    context.fillRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth-1, this.cellHeight-1);
                }
                if(this.cells[i][j] > 0) {
                    context.fillStyle=this.color;
                    context.fillRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth-1, this.cellHeight-1);
                } 
                if(this.targets[i][j] > 0) {
                    context.fillStyle = this.targetColor;
                    context.fillRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth-1, this.cellHeight-1);
                }
            }

            
        }  
    };
    
    jss.Grid = Grid;
    
    var Edge = function(v, w, info) {
        this.v = v;
        this.w = w;
        this.info = info;
    };
    
    Edge.prototype.other = function(x) {
        return x == this.v ? this.w : this.v;
    };
    
    Edge.prototype.either = function () {
        return this.v;
    };
    
    jss.Edge = Edge;
    
    var Network = function(V) {
        this.V = V;
        this.adjList = [];
        for(var v=0; v < V; ++v) {
            this.adjList.push([]);
        }
        this.lineColor = "#cccccc";
    };
    
    Network.prototype.adj = function(v) {
        return this.adjList[v];  
    };
    
    Network.prototype.reset = function() {
        this.adjList = [];
        for(var v=0; v < this.V; ++v) {
            this.adjList.push([]);
        }
    };
    
    Network.prototype.addEdge = function(e) {
        var v = e.either();
        var w = e.other(v);
        this.adjList[v].push(e);
        this.adjList[w].push(e);
    };
    
    Network.prototype.connected = function(v, w){
        var edges1 = this.adjList[v];
        for(var i=0; i < edges1.length; ++i){
            var e = edges1[i];
            if(e.other(v) == w){
                return true;
            }
        }
        var edges2 = this.adjList[w];
        for(var i=0; i < edges2.length; ++i) {
            var e = edges2[i];
            if(e.other(w) == v){
                return true;
            }
        }
        return false;
    };
    
    jss.Network = Network;
    
    var Messenger = function(scheduler) {
        jss.SimEvent(this, -1000000000);
        this.inbox = {};
        this.scheduler = scheduler;
    };
    
    Messenger.prototype = Object.create(jss.SimEvent.prototype);
    
    Messenger.prototype.update = function(deltaTime) {
        for(recipient in this.inbox){
            var recipient_inbox = this.inbox[recipient];
            if(recipient_inbox.size() > 10) {
                var sender_msg = recipient_inbox.min();
                while(sender_msg != null && sender_msg.time < this.scheduler.current_time) {
                    recipient_inbox.delMin();
                    if(recipient_inbox.isEmpty()) {
                        break;
                    }
                    sender_msg = recipient_inbox.min();
                }
            }
        }  
    };
    
    Messenger.prototype.sendMsg = function(sender, recipient, message) {
        if(!message.recipient){
            message.recipient = recipient;
        }
        if(!message.sender) {
            message.sender = sender;
        }
        var recipient_inbox = null;
        if(recipient in this.inbox) {
            recipient_inbox = this.inbox[recipient];
        } else {
            recipient_inbox = new jss.MinPQ(function(m1,m2){
                var diff = m1.time - m2.time;
                if(diff == 0) {
                    return m1.rank - m2.rank; 
                } else {
                    return diff;
                }
            });
            this.inbox[recipient] = recipient_inbox;
        }
        if(!message.rank) {
            message.rank = 1;
        }
        if(!message.time) {
            message.time = this.scheduler.current_time;
        }
        recipient_inbox.enqueue(message);
    };
    
    Messenger.prototype.reset = function() {
        this.inbox = [];
    };
    
    Messenger.prototype.readInBox = function (recipient) {
        var recipient_inbox = null;
        if(recipient in this.inbox) {
            recipient_inbox = this.inbox[recipient];
        } else {
            recipient_inbox = new jss.MinPQ(function(m1,m2){
                var diff = m1.time - m2.time;
                if(diff == 0) {
                    return m1.rank - m2.rank; 
                } else {
                    return diff;
                }
            });
            this.inbox[recipient] = recipient_inbox;
        }
        var sender_msg = recipient_inbox.min();
        var result = [];
        while(sender_msg != null && sender_msg.time <= this.scheduler.current_time) {
            recipient_inbox.delMin();
            result.push(sender_msg);
            if(recipient_inbox.isEmpty()) {
                break;
            }
            sender_msg = recipient_inbox.min();
        }
        return result;
    };
    
    jss.Messenger = Messenger;
    

})(jssim);

var module = module || {};
if(module) {
	module.exports = jssim;
}
},{}],3:[function(require,module,exports){
const { SimEvent } = require('js-simulator')

class Ant extends SimEvent {
  constructor (id, grid, pheromones, x, y, simulation) {
    super()
    this.id = id
    this.x = x
    this.y = y
    this.init_x = x
    this.init_y = y
    this.prev_x = x
    this.prev_y = y
    this.grid = grid
    this.pheromones = pheromones
    this.grid.setCell(this.x, this.y, 1)
    this.path = []
    this.age = 0
    this.life = 150
    this.simulation = simulation
  }

  update () {
    this.age++
    
    if (this.age >= this.life) {
        this.reset()
    }

    var candidates = this.getCandidateMoves()
    if (candidates.length == 0) return
    
    var max_i = this.selectMove(candidates)
    var act_x = this.x
    var act_y = this.y
    
    if (max_i != -1) {
      act_x = candidates[max_i].x
      act_y = candidates[max_i].y
      this.path.push(candidates[max_i])
    }
    
    this.moveTo(act_x, act_y)
  }

  reset () {
    this.grid.setCell(this.x, this.y, 0)
    this.x = this.init_x
    this.y = this.init_y
    this.prev_x = this.x
    this.prev_y = this.y
    this.grid.setCell(this.x, this.y, 1)
    this.age = 0
    this.path = []
  }

  depositPheromones () {
    for(var i = 0; i < this.path.length; ++i) {
      var move = this.path[i]
      this.pheromones.setCell(move.x, move.y, this.pheromones.getCell(move.x, move.y) + 1.0 / this.path.length)
      this.grid.setPotential(move.x, move.y, this.pheromones.getCell(move.x, move.y))
    }
  }

  getCandidateMoves () {
    var candidates = []
    
    for (var dx = -1; dx <= 1; ++dx) {
      for (var dy = -1; dy <= 1; ++dy) {
        var _x = this.x + dx
        var _y = this.y + dy
        
        if (_x == this.prev_x && _y == this.prev_y) continue
        if (_x == this.x && _y == this.y) continue
        if (this.grid.isObstacle(_x, _y)) continue
        if (this.grid.isOccupied(_x, _y)) continue

        if (this.grid.isTarget(_x, _y)) {
          this.depositPheromones()
          this.reset()

          return candidates
        }
            
        candidates.push({ x: _x, y: _y })
      }
    }
    
    return candidates
  }

  selectMove (candidates) {
    var heuristics = [];
    
    var dx2 = this.simulation.target_x - this.x
    var dy2 = this.simulation.target_y - this.y
    var dlen2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
    for(var i = 0; i < candidates.length; ++i) {
      var move = candidates[i]
      var dx = move.x - this.x
      var dy = move.y - this.y
      var dlen = Math.sqrt(dx * dx + dy * dy)
        
      var heuristic_b = ((dx * dx2 + dy * dy2) / (dlen * dlen2) + 1) / (this.simulation.tiles * this.simulation.tiles)
      var heuristic_a = this.pheromones.getCell(move.x, move.y)
      var heuristic = heuristic_a * Math.pow(heuristic_b, 2.0)
        
      heuristics.push(heuristic)
    }
    
    var r = Math.random()
    
    if (r < 0.9) {
      // Exploitation
      var max_i = -1
      var max_heuristic = 0
      
      for (var i=0; i < candidates.length; ++i) {
        if (heuristics[i] > max_heuristic) {
          max_heuristic = heuristics[i]
          max_i = i
        }
      }
      
      return max_i
    } 
    else {
      // Exploration
      r = Math.random()
      var heuristic_sum = 0
      
      for(var i = 0; i < candidates.length; ++i) {
        heuristic_sum += heuristics[i]
        heuristics[i] = heuristic_sum
      }
      
      for(var i = 0; i < candidates.length; ++i) {
        heuristics[i] /= heuristic_sum
      }
      
      for(var i = 0; i < candidates.length; ++i) {
        if(r <= heuristics[i]) {
          return i
        }
      }
    }

    return -1
  }

  moveTo (act_x, act_y) {
    this.grid.setCell(this.x, this.y, 0)
    this.prev_x = this.x
    this.prev_y = this.y
    this.x = act_x
    this.y = act_y
    this.grid.setCell(this.x, this.y, 1)
  }
}

module.exports = Ant

},{"js-simulator":1}],4:[function(require,module,exports){
const { SimEvent } = require('js-simulator')

class Evaporator extends SimEvent {
  constructor (pheromones, grid) {
    super()
    this.pheromones = pheromones
    this.grid = grid
  }

  update () {
    for (let x=0; x < this.tiles; x++) {
      for (let y=0; y < this.tiles; y++) {
        let t = .9 * this.pheromones.getCell(x, y)

        if (t < this.tau_0) {
          t = tau_0
          this.grid.setPotential(x, y, 0)
        }
        else {
          this.grid.setPotential(x, y, t)
        }

        this.pheromones.setCell(x, y, t)
      }
    }
  }
}

module.exports = Evaporator

},{"js-simulator":1}],5:[function(require,module,exports){
const { Scheduler, Grid } = require('js-simulator')
const Evaporator = require('./Evaporator')
const Ant = require('./Ant')

class Simulation {
  constructor () {
    this.target_x = 10
    this.target_y = 10
    this.tiles = 128
    this.tau_0 = 1 / (this.tiles * this.tiles)

    // Scheduler
    this.scheduler = new Scheduler()

    this.setupGrid()
    this.setupPheromones()
  }

  loop () {
    if (this.scheduler.current_time === 10000) {
      this.reset()
    }

    // random change target location
    if (Math.round((Math.random()*100)) === 0) {
      console.log('change location', this.scheduler.current_time)
      this.target_x = Math.round(Math.random()*this.tiles)
      this.target_y = Math.round(Math.random()*this.tiles)
      this.grid.createTarget(this.target_x, this.target_y, 2)
    }

    this.scheduler.update()
    this.grid.render(canvas)
    // console.log('current simulation time: ' + this.scheduler.current_time)
    window.requestAnimationFrame(this.loop.bind(this))
  }

  start (canvas) {
    this.reset()
    window.requestAnimationFrame(this.loop.bind(this))
  }

  reset () {
    this.scheduler.reset()
    this.grid.reset()
    this.pheromones.reset()

    this.grid.createCylinder(50, 80, 20)
    this.grid.createCylinder(30, 100, 10)
    this.grid.createCylinder(80, 50, 21)
    this.grid.createCylinder(80, 28, 11)
    this.grid.createCylinder(75, 35, 11)
    this.grid.createCylinder(103, 26, 11)

    for(let x=0; x < this.tiles; x++){
      for(let y=0; y < this.tiles; y++) {
          this.pheromones.setCell(x, y, this.tau_0)
      }
    }
  
    this.grid.createTarget(this.target_x, this.target_y, 4)
  
    for(let i = 0; i < 30; i++) {
        let dx = Math.floor(Math.random() * 10) - 5
        let dy = Math.floor(Math.random() * 10) - 5
        
        let ant = new Ant(i, this.grid, this.pheromones, 10+dx, 50+dy, this)
        this.scheduler.scheduleRepeatingIn(ant, 1)
    }

    this.scheduler.scheduleRepeatingIn(new Evaporator(this.pheromones, this.grid), 1)
  }

  setupGrid () {
    this.grid = new Grid(this.tiles, this.tiles)
    this.grid.cellWidth = 5
    this.grid.cellHeight = 5
    this.grid.showTrails = true
    this.grid.showPotentialFiel = true
  }

  setupPheromones () {
    this.pheromones = new Grid(this.tiles, this.tiles)
    this.pheromones.cellWidth = 5
    this.pheromones.cellHeight = 5
  }
}

module.exports = Simulation

},{"./Ant":3,"./Evaporator":4,"js-simulator":1}],6:[function(require,module,exports){
const Simulation = require('./Simulation')

const canvas = document.getElementById('canvas')
const simulation = new Simulation()
simulation.start(canvas)

},{"./Simulation":5}]},{},[3,4,5,6]);
