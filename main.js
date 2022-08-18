const { response } = require("express");
const express = require("express");
const Conteiner = require("./Conteiner");
const exp = require("constants");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");

const app = express();
const port = process.env.PORT || 4000;
const conteiner = new Conteiner("Trabajo.txt");
const conteiner2 = new Conteiner("comentarios.txt");
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

io.on("connection", async (socket) => {
  console.log(socket.id)
  console.log("a user connected");
  let productos = await conteiner.bringAll();
  const mensaje = {
    productos,
  };
  socket.emit("mensaje-servidor", mensaje);
  socket.on("producto-nuevo", async (producto) => {
    conteiner.save(producto);
    let productos = await conteiner.bringAll();
    const mensaje = {
      productos,
    };
    io.sockets.emit("mensaje-servidor", mensaje);
  });
});

io.on("connection", async (socket) => {
  console.log("a user connected");
  let comentarios = await conteiner2.bringAll();
  const datos = {
    comentarios,
  };
  socket.emit("mensaje-servidor-com", datos);
  socket.on("comentario-nuevo", async (mensaje) => {
    console.log(mensaje);
    conteiner2.save(mensaje);
    let comentarios = await conteiner2.bringAll();

    const datos = {
      comentarios,
    };
    io.sockets.emit("mensaje-servidor-com", datos);
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
