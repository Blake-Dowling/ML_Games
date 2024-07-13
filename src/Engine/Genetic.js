import { GeneticArray } from '../Server/ModelManagement.js'
import * as tf from '@tensorflow/tfjs'

export class Genetic {
    constructor(params, sequenceLength, populationSize){
        this.BATCH_SIZE = populationSize * sequenceLength
        this.sequenceLength = sequenceLength
        this.populationSize = populationSize

        this.step = 0
        this.model = this.loadModel(params)
    }
    loadModel(params){
        const name = params[0]
        const outputShape = params[2]
        let model = new GeneticArray(name, outputShape, this.sequenceLength, this.populationSize)
        model.init()
        model.loadModel()
        return model
    }

    async getPrediction(state){
        const sequence = parseInt(this.step / this.sequenceLength)
        const index = parseInt(this.step % this.sequenceLength)
        // console.debug(sequence, index)

        const action = this.model[sequence].sequence[index]
        // console.debug()
        this.step = (this.step + 1)// % (this.sequenceLength * this.populationSize)

        return action
    }
    // trainModel()
    pushDataPoint(state, action, reward, done){
        const sequence = parseInt(this.step / this.sequenceLength)
        this.population[sequence].fitness += reward
        if(this.step >= this.BATCH_SIZE){
            this.sortPopulation()
            this.mutatePopulation()
            this.step = 0
        }
        // console.debug(this.population[sequence].fitness)
    }
    sortPopulation(){
        this.population.sort((a, b) => b.fitness - a.fitness)
        for(let i=parseInt(this.population.length/10); i<this.population.length; i++){
            this.population[i] = this.population[Math.floor(Math.random()*parseInt(this.population.length/10))].clone()
        }
        for(let i=0; i<this.population.length; i++){
            this.population[i].fitness = 0
        }

    }
    mutatePopulation(){
        for(let i=0; i<this.population.length; i++){
            this.population[i].mutate()
        }
    }
}
