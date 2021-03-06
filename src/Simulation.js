const { Scheduler, Grid } = require('js-simulator')
const Evaporator = require('./Evaporator')
const Ant = require('./Ant')

class Simulation {
  constructor () {
    this.tiles = 128
    this.target_x = Math.round(Math.random()*this.tiles - 8) + 4
    this.target_y = Math.round(Math.random()*this.tiles - 8) + 4
    this.tau_0 = 1 / (this.tiles * this.tiles)

    // Scheduler
    this.scheduler = new Scheduler()
    console.log('hello', this.scheduler)

    this.setupGrid()
    this.setupPheromones()
  }

  loop () {
    if (this.scheduler.current_time === 10000) {
      this.reset()
    }

    // random change target location
    if (Math.round((Math.random()*5000)) === 0) {
      try {
        this.target_x = Math.round(Math.random()*this.tiles - 8) + 4
        this.target_y = Math.round(Math.random()*this.tiles - 8) + 4
        if (!this.grid.isObstacle(this.target_x, this.target_y)) {
          this.grid.createTarget(this.target_x, this.target_y, 2)
          console.log('change location', this.scheduler.current_time, this.target_x, this.target_y)
        }
      }
      catch (e) {}
    }

    this.eventBox.innerHTML = `
      <p>Current time: ${this.scheduler.current_time}</p>
      <p>Events queue: ${this.scheduler.pq.s.length}</p>
      <p>Inbox: ${this.scheduler.messenger.inbox.length}</p>
      <p>Targets: ${this.grid.potentialField.length}</p>
    `

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

    for (let i=0; i < 5; i++) {
      let x = Math.round(Math.random()*this.tiles - 8) + 4
      let y = Math.round(Math.random()*this.tiles - 8) + 4
      let r = Math.round(Math.random()*10) + 10
      this.grid.createCylinder(x, y, r)
    }

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

    this.scheduler.scheduleRepeatingIn(new Evaporator(this.pheromones, this.grid, this), 1)
  }

  setupGrid () {
    this.grid = new Grid(this.tiles, this.tiles)
    this.grid.cellWidth = 5
    this.grid.cellHeight = 5
    this.grid.showTrails = true
    this.grid.showPotentialField = true
    this.grid.color = '#000000';
    this.grid.trailColor = '#ffffff';
    this.grid.obstacleColor = '#0000ff';
    this.grid.targetColor = '#39ff49';
  }

  setupPheromones () {
    this.pheromones = new Grid(this.tiles, this.tiles)
    this.pheromones.cellWidth = 5
    this.pheromones.cellHeight = 5
  }

  enableDebug (toolbar, eventBox) {
    this.toolbar = toolbar
    this.eventBox = eventBox
    this.eventBox.innerHTML = 'test'
  }
}

module.exports = Simulation
