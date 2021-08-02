const multer = require('multer')
const path = require('path')
const File = require('../model/file.model')
const {v4: uuid4} = require('uuid');

let storage = multer.diskStorage({
    destination:(req,file,cb) => cb(null, 'uploads'),
    filename:(req,file,cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage,
    limit: { fileSize: 1000000* 100}   ////100MB
}).single('myfile')

exports.fileadd = (req,res) => {
    //Validate request
    
    // Store file
    upload(req,res, async (err) => {
        if(!req.file) {
            return res.json({error: 'All fields are required'})
        }
        if(err) {
            return res.status(500).send({error: err.message})
        }
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),  //////048cbb54-be6a-4bb3-afb0-7c565ac30b0e
            path: req.file.path,
            size: req.file.size
        })

        const response = await file.save();
        return res.json({response,file: `${process.env.APP_BASE_URL}/files/${response.uuid}`})
        //download link will be  similar to http://localhost:5000/files/048cbb54-be6a-4bb3-afb0-7c565ac30b0e
    })
}

exports.showfile = async (req,res) => {
    // console.log("req-------------",req.params.uuid)

    // console
    try{
        const file = await File.findOne({ uuid : req.params.uuid });
        // console.log("file",file)
        // console.log("uuid",file.uuid)
        // console.log("fileName",file.filename)
        // console.log("fileSize",file.size)

        if(!file){
            return res.render('download', {error: 'Link has been expired'})
        }
        return res.render('download',{
            uuid:file.uuid,
            fileName:file.filename,
            fileSize:file.size,
            downloadLink:`${process.env.APP_BASE_URL}/files/download/${file.uuid}` 
            ///will be attached to download link http://localhost:5000/files/download/048cbb54-be6a-4bb3-afb0-7c565ac30b0e
        })

    } catch(err){
        return res.render('download',{error:`Something went wrong ${err}`});
    }
}

exports.download = async (req,res) => {
    const file = await File.findOne({uuid: req.params.uuid})

    if(!file){
        return res.render('download', {error: 'Link has been expired'})
    }

    const filePath = `${__dirname}/../${file.path}`;
    res.download(filePath)
}