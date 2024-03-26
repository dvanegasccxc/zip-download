const express = require("express");
const multer = require("multer");
var cors = require("cors");
const app = express();
const port = 4000;
const fs = require("fs");
const zip = require("./zip/zip");
const os = require("os");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createTmpFIle = () => {
    const appPrefix = "my-app";
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
    return tmpDir;
};

const deleteTmpFile = (currentPath) => {
    const files = fs.readdirSync(currentPath);

    files.forEach((item) => {
        const filePath = path.join(currentPath, item);
        fs.unlinkSync(filePath);
    });
};

const tmpPath = createTmpFIle();

const storage = multer.diskStorage({
    destination: function (_, _, cb) {
        cb(null, tmpPath);
    },
    filename: function (_, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.post("/download", upload.array("files"), (req, res) => {
    var archive = new zip();
    const files = req.files.map((item) => ({
        name: item.originalname,
        path: item.path,
    }));
    archive.addFiles(files, (err) => {
        if (err) return console.log("err while adding files", err);
        var buff = archive.toBuffer();
        fs.writeFile(`${tmpPath}/tmp.zip`, buff, function () {
            res.download(`${tmpPath}/tmp.zip`, "prueba.zip", () => {
                deleteTmpFile(tmpPath);
            });
            console.log(tmpPath);
        });
    });
});

app.listen(port, () => {
    console.log("Listen in port" + " " + port);
});
