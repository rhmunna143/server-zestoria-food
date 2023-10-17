const express = require('express');

const app = express()
const port = process.env.PORT || 7000;

app.get("/", (req, res) => {
    res.send("running zestoria server : 200 OK!")
})






app.listen(port, () => {
    console.log(`zestoria listening on port ${port}`);
})