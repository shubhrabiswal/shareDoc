const multer = require('multer')
const dotenv = require('dotenv')
const path = require('path')
const File = require('../model/file.model')
const { v4: uuid4 } = require('uuid');
dotenv.config();

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    }
})

let upload = multer({
    storage,
    limit: { fileSize: 1000000 * 100 }   ////100MB
}).single('myfile')

exports.fileadd = (req, res) => {
    //Validate request

    // Store file
    upload(req, res, async (err) => {
        if (!req.file) {
            return res.json({ error: 'All fields are required' })
        }
        if (err) {
            return res.status(500).send({ error: err.message })
        }
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),  //////048cbb54-be6a-4bb3-afb0-7c565ac30b0e
            path: req.file.path,
            size: req.file.size
        })

        const response = await file.save();
        return res.json({ response, file: `${process.env.APP_BASE_URL}/files/${response.uuid}` })
        //download link will be  similar to http://localhost:5000/files/048cbb54-be6a-4bb3-afb0-7c565ac30b0e
    })
}

exports.showfile = async (req, res) => {
    // console.log("req-------------",req.params.uuid)

    // console
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        // console.log("file",file)
        // console.log("uuid",file.uuid)
        // console.log("fileName",file.filename)
        // console.log("fileSize",file.size)

        if (!file) {
            return res.render('download', { error: 'Link has been expired' })
        }
        return res.render('download', {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
            ///will be attached to download link http://localhost:5000/files/download/048cbb54-be6a-4bb3-afb0-7c565ac30b0e
        })

    } catch (err) {
        return res.render('download', { error: `Something went wrong ${err}` });
    }
}

exports.download = async (req, res) => {
    const file = await File.findOne({ uuid: req.params.uuid })

    if (!file) {
        return res.render('download', { error: 'Link has been expired' })
    }

    const filePath = `${__dirname}/../${file.path}`;
    res.download(filePath)
}

exports.sendViaEmail = async (req, res) => {

    const { uuid, emailTo, emailFrom } = req.body;  ///destructuring

    //validate request

    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: "All fields are required" })
    }

    // Get data from database
    try {
        const file = await File.findOne({ uuid: uuid });
        // if (file.sender) {
        //     return res.status(422).send({ error: "Email already sent" });
        // }

        file.sender = emailFrom;
        file.receiver = emailTo;
        const response = await file.save();

        //Send email
        const sendMail = require('../services/emailService')
        sendMail({
            from: emailFrom,
            to: emailTo,
            subject: 'File sharing through shareDoc',
            text: `${emailFrom} shared a file with you.`,
            html: require('../services/emailTemplate')({
                emailFrom: emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
                size: parseInt(file.size / 1000) + 'KB',
                expires: '24 hours'
            })
        }).then(() => {
            return res.json({ success: true });
        }).catch((err) => {
            return res.status(500).json({ error: `Error in email sending...   ${err}` });
        });
    } catch (err) {
        return res.status(500).send({ error: 'Something went wrong.' });
    }
}