const Simulation = require('./Simulation')

const canvas = document.getElementById('canvas')
const toolbar = document.getElementById('toolbar')
const eventBox = document.getElementById('events')

const simulation = new Simulation()
simulation.enableDebug(toolbar, eventBox)
simulation.start(canvas)
