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

  
router.post("/baseMaps", (req, res) => {
    res.json(baseMaps);
});

module.exports = router;