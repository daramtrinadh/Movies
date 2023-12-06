const express = require("express");
const path = require("path");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
app.use(express.json());
const initiliazeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initiliazeDBAndServer();

app.get("/movies/", async (request, response) => {
  const moviesListQuery = `select movie.movie_name as movieName from movie order by movie_id ;`;
  const movies = await db.all(moviesListQuery);
  response.send(movies);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `insert into movie (director_id,movie_name,lead_actor) 
    values (${directorId},
        '${movieName}',
        '${leadActor}') ;`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send(`Movie Successfully Added`);
});
const convertToDbResponse = (dbResponse) => {
  return {
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `select * from movie where movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertToDbResponse(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const bodyDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = bodyDetails;
  const updateQuery = `
    update movie set director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}' where movie_id=${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `delete from movie where movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `select director.director_id as directorId,director.director_name as directorName from director order by director.director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieListQuery = `select movie.movie_name as movieName from movie where movie.director_id=${directorId};`;
  const moviesArray = await db.all(getMovieListQuery);
  response.send(moviesArray);
});
module.exports = app;
