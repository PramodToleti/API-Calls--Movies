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
  const convertObjectToResponse = (obj) => {
    return {
      movieName: obj.movie_name,
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

//GET Movie Details API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT 
          *
        FROM 
          movie 
        WHERE 
          movie_id = ${movieId};
    `;

  const dbObject = await db.get(getMovieQuery);
  if (dbObject === undefined) {
    response.send("Movie Not Found");
  } else {
    //Converting to response
    const convertObjectToResponse = (dbObject) => {
      return {
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor,
      };
    };
    response.send(convertObjectToResponse(dbObject));
  }
});

//UPDATE Movie Details API
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
        UPDATE 
          movie 
        SET 
          director_id = '${directorId}',
          movie_name = '${movieName}',
          lead_actor = '${leadActor}';
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//REMOVE Movie Details API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM 
          movie
        WHERE 
          movie_id = ${movieId};
    `;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET Directors Details API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT 
          * 
        FROM 
          director;
    `;

  const dbObject = await db.all(getDirectorsQuery);

  const convertObjToResponse = (obj) => {
    return {
      directorId: obj.director_id,
      directorName: obj.director_name,
    };
  };
  let directorsDetails = [];
  for (let obj of dbObject) {
    directorsDetails.push(convertObjToResponse(obj));
  }
  response.send(directorsDetails);
});

//GET Movies of Director API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
        SELECT 
          *
        FROM 
          movie 
        WHERE 
          director_id = ${directorId};
    `;

  const dbResponse = await db.all(getDirectorMoviesQuery);
  const convertObjectToResponse = (obj) => {
    return {
      movieName: obj.movie_name,
    };
  };
  let moviesDetails = [];
  for (let obj of dbResponse) {
    moviesDetails.push(convertObjectToResponse(obj));
  }

  response.send(moviesDetails);
});
