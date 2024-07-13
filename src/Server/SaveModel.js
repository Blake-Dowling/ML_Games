
import express from 'express'

import bodyParser from 'body-parser'
import fs from 'fs'

const app = express()
const port = 3001

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.post('/saveTrainingHistory', async (req, res) => {
    const name = req.body.data.name
    const trainingHistory = req.body.data.trainingHistory
    try{
        const result = await saveTrainingHistory(name, trainingHistory)
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})
app.post('/saveDeepQNetwork', async (req, res) => {
    const name = req.body.data.name
    const modelData = req.body.data.modelData
    const weightsData = req.body.data.weightsData
    try{
        const result = await saveDeepQNetwork(name, modelData, weightsData)
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})
app.post('/saveGeneticArray', async (req, res) => {
    const name = req.body.data.name
    const arrayData = req.body.data.arrayData
    try{
        const result = await saveGeneticArray(name, arrayData)
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})
async function saveTrainingHistory(name, trainingHistory){
    try{
        fs.writeFileSync(`../../public/${name}/trainingHistory`, trainingHistory, 'utf-8')
    } catch(error){
        console.error(error)
    }
}
async function saveDeepQNetwork(name, modelData, weightsData){
    try{
        await saveNeuralNetwork(name, modelData, weightsData)
    } catch(error){
        console.error(error)
    }
}
async function saveGeneticArray(name, arrayData){
    try{
        fs.writeFileSync(`../../public/${name}/arrayData`, arrayData, 'utf-8')
    } catch(error){
        console.error(error)
    }
}
async function saveNeuralNetwork(name, modelData, weightsData){
    try{
        const newModelData = JSON.parse(modelData)
        const weightsBuffer = Buffer.from(weightsData, 'base64');
        const modelJson = JSON.stringify({
            modelTopology: newModelData.modelTopology,
            weightsManifest: [{
                paths: ['weights.bin'],
                weights: newModelData.weightSpecs
            }]
        })
        fs.writeFileSync(`../../public/${name}/model.json`, modelJson)
        fs.writeFileSync(`../../public/${name}/weights.bin`, weightsBuffer)
    } catch(error){
        console.error(error)
    }
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/loadTrainingHistory', async (req, res) => {
    const name = req.body.data.name
    try{
        const result = await loadTrainingHistory(name)  
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})
app.post('/loadDeepQNetwork', async (req, res) => {
    const name = req.body.data.name
    try{
        const result = await loadDeepQNetwork(name)
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})
app.post('/loadGeneticArray', async (req, res) => {
    const name = req.body.data.name
    try{
        const result = await loadGeneticArray(name)
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})
async function loadTrainingHistory(name){
    try{
        let trainingHistory = fs.readFileSync(`../../public/${name}/trainingHistory`).toString('utf8')
        return new Promise((resolve, reject) => {
            const result = {
                trainingHistory: trainingHistory,
            }
            resolve(result)
        })
    } catch(error){
        console.error(error)
    }
}
async function loadDeepQNetwork(name){
    try{
        const neuralNetwork = await loadNeuralNetwork(name)
        let modelData = neuralNetwork.modelData
        let weightsData = neuralNetwork.weightsData
        return new Promise((resolve, reject) => {
            const result = {
                modelData: modelData,
                weightsData: weightsData,
            }
            resolve(result)
        })
    } catch(error){
        console.error(error)
    }
}
async function loadGeneticArray(name){
    try{
        let arrayData = fs.readFileSync(`../../public/${name}/arrayData`).toString('utf8')
        return new Promise((resolve, reject) => {
            const result = {
                arrayData: arrayData,
            }
            resolve(result)
        })
    } catch(error){
        console.error(error)
    }
}
async function loadNeuralNetwork(name){
    try{
        let modelData = fs.readFileSync(`../../public/${name}/model.json`).toString('utf8')
        let weightsData = fs.readFileSync(`../../public/${name}/weights.bin`)
        return new Promise((resolve, reject) => {
            const result = {
                modelData: modelData,
                weightsData: weightsData
            }
            resolve(result)
        })
    } catch(error){
        console.error(error)
    }
}