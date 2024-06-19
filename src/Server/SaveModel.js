import * as tf from '@tensorflow/tfjs'
import express from 'express'
import cors from 'cors'
// import bodyParser from 'body-parser'
import fs from 'fs'

const app = express()
const port = 3001
app.use(cors())
app.use(express.json())
// app.use(bodyParser.json())


app.post('/saveModel', async (req, res) => {
    console.debug("-----------------------------------")
    console.debug(req.body)
    console.debug("-----------------------------------")
    const name = req.body.data.name
    const modelData = JSON.stringify(req.body.data.modelData)
    const weightsData = req.body.data.weightsData
    const trainingHistory = req.body.data.trainingHistory
    const scoreHistory = req.body.data.scoreHistory
    try{
        const result = await saveModel(name, modelData, weightsData, trainingHistory, scoreHistory)
        res.json({response: result})
    } catch(error){
        console.error('Error:', error.message)
        res.status(500).json({error: 'Internal Server Error.'})
    }
})

async function saveModel(name, modelData, weightsData, trainingHistory, scoreHistory){
    try{
        // Convert base64-encoded weights back to buffer
        const weightsBuffer = Buffer.from(weightsData, 'base64');

        // model.save(`file://../../public/${name}/`)
        fs.writeFile(`../../public/${name}/model.json`, modelData, (err) => {
            if (err) {
                throw new Error('Error saving model JSON', err);
            }
        })
        fs.writeFile(`../../public/${name}/weights.bin`, weightsBuffer, (err) => {
            if (err) {
                throw new Error('Error saving weights', err);
            }
        })
        fs.writeFile(`../../public/${name}/trainingHistory`, JSON.stringify(trainingHistory), 'utf-8', (err) => {
            if (err) {
                throw new Error('Error saving trainingHistory', err);
            }
        })
        fs.writeFile(`../../public/${name}/scoreHistory`, JSON.stringify(scoreHistory), 'utf-8', (err) => {
            if (err) {
                throw new Error('Error saving scoreHistory', err);
            }
        })
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