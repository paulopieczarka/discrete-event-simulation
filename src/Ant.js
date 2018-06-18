const jssim = require('js-simulator')

class Ant {
  constructor (id, grid, pheromones, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.init_x = x;
    this.init_y = y;
    this.prev_x = x;
    this.prev_y = y;
    this.grid = grid;
    this.pheromones = pheromones;
    this.grid.setCell(this.x, this.y, 1);
    this.path = [];
    this.age = 0;
    this.life = 150;
  }

  update () {
    this.age++;
    
    if (this.age >= this.life) {
        this.reset();
    }

    var candidates = this.getCandidateMoves();   
    if (candidates.length == 0) return;
    
    var max_i = this.selectMove(candidates);
    var act_x = this.x;
    var act_y = this.y;
    
    if (max_i != -1) {
      act_x = candidates[max_i].x;
      act_y = candidates[max_i].y;
      this.path.push(candidates[max_i]);
    }
    
    this.moveTo(act_x, act_y);
  }

  reset () {
    this.grid.setCell(this.x, this.y, 0);
    this.x = this.init_x;
    this.y = this.init_y;
    this.prev_x = this.x;
    this.prev_y = this.y;
    this.grid.setCell(this.x, this.y, 1);
    this.age = 0;
    this.path = [];
  }

  depositPheromones () {
    for(var i = 0; i < this.path.length; ++i) {
      var move = this.path[i];
      this.pheromones.setCell(move.x, move.y, this.pheromones.getCell(move.x, move.y) + 1.0 / this.path.length);
      this.grid.setPotential(move.x, move.y, this.pheromones.getCell(move.x, move.y));
    }
  }

  getCandidateMoves () {
    var candidates = [];
    
    for (var dx = -1; dx <= 1; ++dx) {
      for (var dy = -1; dy <= 1; ++dy) {
        var _x = this.x + dx;
        var _y = this.y + dy;
        
        if (_x == this.prev_x && _y == this.prev_y) continue;
        if (_x == this.x && _y == this.y) continue;
        if (this.grid.isObstacle(_x, _y)) continue;

        if (this.grid.isOccupied(_x, _y)) continue;

        if (this.grid.isTarget(_x, _y)) {
          this.depositPheromones();
          this.reset();
          return candidates;
        }
            
        candidates.push({ x: _x, y: _y });
      }
    }
    
    return candidates;
  }

  selectMove () {
    var heuristics = [];
    
    var dx2 = target_x - this.x;
    var dy2 = target_y - this.y;
    var dlen2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    for(var i = 0; i < candidates.length; ++i) {
      var move = candidates[i];
      var dx = move.x - this.x;
      var dy = move.y - this.y;
      var dlen = Math.sqrt(dx * dx + dy * dy);
        
      var heuristic_b = ((dx * dx2 + dy * dy2) / (dlen * dlen2) + 1) / (tiles * tiles); 
      var heuristic_a = this.pheromones.getCell(move.x, move.y);
      var heuristic = heuristic_a * Math.pow(heuristic_b, 2.0);
        
      heuristics.push(heuristic);
    }
    
    var r = Math.random();
    
    if (r < 0.9) {
      // Exploitation
      var max_i = -1;
      var max_heuristic = 0;
      
      for (var i=0; i < candidates.length; ++i) {
        if (heuristics[i] > max_heuristic) {
          max_heuristic = heuristics[i];
          max_i = i;
        }
      }
      
      return max_i;
    } 
    else {
      // Exploration
      r = Math.random();
      var heuristic_sum = 0;
      
      for(var i = 0; i < candidates.length; ++i) {
        heuristic_sum += heuristics[i];
        heuristics[i] = heuristic_sum;
      }
      
      for(var i = 0; i < candidates.length; ++i) {
        heuristics[i] /= heuristic_sum;
      }
      
      for(var i = 0; i < candidates.length; ++i) {
        if(r <= heuristics[i]) {
          return i;
        }
      }
    }

    return -1;
  }

  moveTo () {
    this.grid.setCell(this.x, this.y, 0);
    this.prev_x = this.x;
    this.prev_y = this.y;
    this.x = act_x;
    this.y = act_y;
    this.grid.setCell(this.x, this.y, 1);
  }
}
