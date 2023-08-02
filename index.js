const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const connectDB = require('./connect/db')
const ShortURL = require('./Model/Urlmodel')

dotenv.config();

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
    const allData = await ShortURL.find()
    res.render('index', { shortUrls: allData })
})

app.get('/:shortid', async (req, res) => {
    // grab the :shortid param
    const shortid = req.params.shortid

    // perform the mongoose call to find the long URL
    const rec = await ShortURL.findOne({ short: shortid })

    // if null, set status to 404 (res.sendStatus(404))
    if (!rec) return res.sendStatus(404)

    // if not null, increment the click count in database
    rec.clicks++
    await rec.save()

    // redirect the user to original link
    res.redirect(rec.full)
})

app.post('/short', async (req, res) => {
    // Grab the fullUrl parameter from the req.body
    const fullUrl = req.body.fullUrl
    console.log('URL requested: ', fullUrl)

    // insert and wait for the record to be inserted using the model
    const record = new ShortURL({
        full: fullUrl
    })

    await record.save()

    res.redirect('/')
})

// Setup your mongodb connection here
// console.log(mongoose.connect(`${process.env.MONGO_URL}`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }))
// mongoose.connection.on('open', () => {
//     // Wait for mongodb connection before server starts
//     app.listen(process.env.PUBLIC_PORT, () => {
//         console.log('Server started')
//     })
// })

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(process.env.PUBLIC_PORT, () => {
            console.log('conneted');
        })
    } catch (error) {
        console.log(error);
    }
}

start()