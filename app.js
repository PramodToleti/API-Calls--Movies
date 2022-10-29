const express = require("express");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

//initializing Database and Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET Movies Details API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT 
          *
        FROM 
          movie;
    `;

  const dbObject = await db.all(getMoviesQuery);

  //converting into required response
  const convertObjectToResponse = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  let moviesDetails = [];
  for (let obj of dbObject) {
    moviesDetails.push(convertObjectToResponse(obj));
  }

  response.send(moviesDetails);
});

//ADD Movie details API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
    INSERT INTO 
      movie(director_id, movie_name, lead_actor)
    VALUES (
        '${directorId}',
        '${movieName}',
        '${leadActor}'
    );
  `;

  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
  //console.log(movieId);
});
