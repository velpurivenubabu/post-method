const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "cricketTeam.db");
const sqlite3 = require("sqlite3");
const app = express();

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM
    cricket_team
    ORDER BY 
    player_id;`;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getplayerId = `
SELECT
*
FROM
cricket_team
WHERE 
player_id = ${playerId};`;
  const player = await db.get(getplayerId);
  response.send({
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  });
});

app.use(express.json());
app.post("/players/", async (request, response) => {
  const player_details = request.body;
  const { playerName, jerseyNumber, role } = player_details;
  const add_player = `
  INSERT INTO 
  cricket_team (player_name,jersey_number,role)
  '${playerName}',
   ${jerseyNumber},
    '${role}'

);`;
  const dbResponse = await db.run(add_player);
  const playerId = dbResponse.lastID;
  response.send("Player Added to team");
});
module.exports = app;
