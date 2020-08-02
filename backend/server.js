const express = require('express')
const bodyParser = require('body-parser')
var CryptoJS = require("crypto-js");
const app = express()
const cors = require('cors')
const multer = require('multer');
fs = require('fs-extra')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
const MongoClient = require('mongodb').MongoClient
ObjectId = require('mongodb').ObjectId

const myurl = 'mongodb://localhost:27017/';


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    },
})
let maxSize = 20 * 1000 * 1000;

var upload = multer({ storage: storage, limits: { fileSize: maxSize } })

MongoClient.connect(myurl, (err, client) => {
    if (err) return console.log(err)
    db = client.db('Fileupload')
    app.listen(8080, () => {
        console.log('listening on 8080')
    })
})

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');

});

// upload single file
app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)

    }
    file["is_downloaded"] = false;
    db.collection('mycollection').insertOne(file, (err, result) => {
        if (err) {
            res.writeHead(500);
            return console.log(err)
        } else {
            console.log('saved to database')
            // res.redirect('/')
            console.log(result.insertedId)

            if (result && result.insertedId) {
                var response = {}
                let encryptID = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(result.insertedId)));
                response['downloadURL'] = "http://localhost:8080/downloadFile?id=" + encryptID
                res.send(response)
            }else{
              res.writeHead(500);
              res.end("Error while uploading file.")
            }
        }
    })

})

app.get('/downloadFile', (req, res) => {

    let decryptId = CryptoJS.enc.Base64.parse(req.query.id).toString(CryptoJS.enc.Utf8);
    db.collection('mycollection').findOne({ '_id': ObjectId(JSON.parse(decryptId)) }, (err, result) => {
        if (err) {
            res.writeHead(500);
            return console.log(err)
        } else {
            if (result) {
                if (result.is_downloaded) {
                    res.writeHead(500);
                    res.end("File doesn't exist.")
                } else {
                    var files = fs.createReadStream(__dirname + "/uploads/" + result.filename);
                    res.writeHead(200, { 'Content-disposition': 'attachment; filename=' + result.originalname });
                    files.pipe(res)
                    db.collection("mycollection").update({ '_id': ObjectId(JSON.parse(decryptId)) }, { $set: { "is_downloaded": true } }, (err, result) => {
                        if (err) return console.log(err)
                        else {
                            console.log("Success")
                        }
                    })
                }
            } else {
                res.writeHead(500);
                res.end("Please check the URL")
            }
        }
    })
})