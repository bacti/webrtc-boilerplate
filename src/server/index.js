const UUID = require("node-uuid");
const Server = require("./Server");
const RoomServer = require("./RoomServer");

Server.on("connection", client => {
  client.userid = UUID();
  client.setMaxListeners(0);
  client.emit("connected", { id: client.userid });

  client.on("message", message => RoomServer.OnMessage(client, message));
  client.on("disconnect", evt =>
    console.log(`User ${client.userid} disconnected`)
  );
});
