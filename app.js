const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndResponse = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndResponse();
const convertDbToResponse = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
    directorName: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT * FROM movie;`;
  const movieArray = await db.all(getMovieQuery);
  response.send(
    movieArray.map((eachItem) => console.log(convertDbToResponse(eachItem)))
  );
});
app.get("movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getAMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const picture = await db.get(getAMovieQuery);
  response.send(convertDbToResponse(picture));
});
app.post("/movies/", async (request, response) => {
  const { movieName, directorId, leadActor } = request.body;
  const putMovieQuery = `INSERT INTO
    movie(movie_name,director_id,lead_actor)
    VALUES
    (${movieName},${directorId},${leadActor});`;
  const cinema = await db.run(putMovieQuery);
  response.send("Movie Successfully Added");
});
app.put("/movies/:moviesId/", async (request, response) => {
  const { movieName, directorId, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `UPDATE 
    movie
    set
    movie_name:${movieName},
    director_id:${directorId},
    lead_actor:${leadActor},
    WHERE movie_id:${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
const convertDataToResponse = (dataObject) => {
  return {
    directorId: dataObject.director_id,
    directorName: dataObject.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`;
  const director = await db.all(getDirectorQuery);
  response.send(director.map((eachItem) => convertDataToResponse(eachItem)));
});
const convertDBToResponse = (itemObject) => {
  return {
    movieName: itemObject.movie_name,
  };
};
app.get("/directors/:director_id/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDirectorQuery = `SELECT * movie WHERE director_id=${directorId};`;
  const script = await db.get(getMovieDirectorQuery);
  response.send(convertDBToResponse(script));
});
module.exports = app;
