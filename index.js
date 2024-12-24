const express = require("express");
const app = express();
const {
  getJoyas,
  getJoyasFilter,
  convertHATEOAS,
  reportRequest,
} = require("./requests");

app.use(express.json());

app.listen(3000, console.log("Servidor en linea"));

app.get("/joyas", reportRequest, async (req, res) => {
  try {
    let result = await getJoyas(req.query);
    const HATEOAS = await convertHATEOAS(result);
    res.status(200).json(HATEOAS);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/joyas/filtros", reportRequest, async (req, res) => {
  try {
    let result = await getJoyasFilter(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Ruta no encontrada");
});
