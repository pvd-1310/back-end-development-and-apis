import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../utils/db.js";

const router = Router();

router.use(authenticate);

router.get("/:userId", (req, res, next) => {
  try {
    const watchlist = getWatchlist(Number(req.params.userId));

    if (watchlist === null) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json(watchlist);
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/:userId/movies",
  authorizeModification,
  (req, res, next) => {
    try {
      const movie = addMovie(Number(req.params.userId), req.body);

      if (movie === null) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.status(201).json(movie);
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  "/:userId/movies/:movieId",
  authorizeModification,
  (req, res, next) => {
    try {
      const movie = updateMovie(
        Number(req.params.userId),
        Number(req.params.movieId),
        req.body
      );

      if (movie === null) {
        return res.status(404).json({
          error: "User or movie not found.",
        });
      }

      return res.status(200).json(movie);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete(
  "/:userId/movies/:movieId",
  authorizeModification,
  (req, res, next) => {
    try {
      const deleted = deleteMovie(
        Number(req.params.userId),
        Number(req.params.movieId)
      );

      if (deleted === null) {
        return res.status(404).json({
          error: "User or movie not found.",
        });
      }

      return res.status(200).json({
        message: "Movie removed.",
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;