
import express from 'express'

import bodyParser from 'body-parser'
import fs from 'fs'

const app = express()
const port = 3001
// app.use(cors())
// app.use(express.json())
// app.use(bodyParser.json())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/saveModel', async (req, res) => {
    // console.debug("-----------------------------------")
    // console.debug(req.body)
    // console.debug("-----------------------------------")
    const name = req.body.data.name
    const modelData = req.body.data.modelData
    const weightsData = req.body.data.weightsData
    const trainingHistory = req.body.data.trainingHistory
    try{
        const result = await saveModel(name, modelData, weightsData, trainingHistory)
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})

async function saveModel(name, modelData, weightsData, trainingHistory){
    try{
        const newModelData = JSON.parse(modelData)
        // Convert base64-encoded weights back to buffer
        const weightsBuffer = Buffer.from(weightsData, 'base64');
        // console.debug(newModelData.weightSpecs)
        const modelJson = JSON.stringify({
            modelTopology: newModelData.modelTopology,
            weightsManifest: [{
                paths: ['weights.bin'],
                weights: newModelData.weightSpecs
            }]
        })
        console.debug(trainingHistory)
        // model.save(`file://../../public/${name}/`)
        fs.writeFileSync(`../../public/${name}/model.json`, modelJson)
        fs.writeFileSync(`../../public/${name}/weights.bin`, weightsBuffer)
        fs.writeFileSync(`../../public/${name}/trainingHistory`, trainingHistory, 'utf-8')
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    } catch(error){
        console.error(error)
    }
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/loadModel', async (req, res) => {
    const name = req.body.data.name
    try{
        const result = await loadModel(name)
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})

async function loadModel(name){
    try{
        let modelData = fs.readFileSync(`../../public/${name}/model.json`).toString('utf8')
        let weightsData = fs.readFileSync(`../../public/${name}/weights.bin`)
        let trainingHistory = fs.readFileSync(`../../public/${name}/trainingHistory`).toString('utf8')
        return new Promise((resolve, reject) => {
            const result = {
                modelData: modelData,//.modelTopology,
                weightsData: weightsData,
                trainingHistory: trainingHistory,
            }
            // console.debug(result)
            resolve(result)
        })
    } catch(error){
        console.error(error)
    }
}