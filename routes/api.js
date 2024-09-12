// routes/api.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const baseMaps = [
    {
      name: "地理院地図",
      url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    },
    {
      name: "航空写真",
      url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
    },
    {
        name: "Open street Map",
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      },
];

//主題図側のリストを作成
const overlayMaps = [];

//主題図のデータの入ったディレクトリパス
const overlayPath = "./data";

//引数で指定されたディレクトリ内のファイルリストを作成
const fileNames = fs.readdirSync(overlayPath);

//正規表現で拡張子が.geojsonの物をフィルタリング
const fileNameList = fileNames.filter(RegExp.prototype.test, /.*\.geojson$/);

//リストからforeachを使って取り出す
fileNameList.forEach((fileName) => {
  const temp = fs.readFileSync(path.resolve(overlayPath, fileName), "utf8");
  overlayMaps.push(JSON.parse(temp));
});
  
router.post("/baseMaps", (req, res) => {
    res.json(baseMaps);
});

router.post("/overLayMaps", (req, res) => {
    res.json(overlayMaps);
  });
  

module.exports = router;