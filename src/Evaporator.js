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
