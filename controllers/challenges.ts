import { Request, Response } from "express";
import { pool } from "../db/db";
import { ResultSetHeader } from "mysql2";
import { uploadMultipleImages } from "../util/cloudinary";

const createChallenge = async (req: Request, res: Response) => {
  const image_URLs = await uploadMultipleImages(req);

  const {
    challenge_title,
    brief_description,
    challenge_description,
    extra_tips,
    figma,
    difficulty_level,
    challenge_languages,
  } = req.body;

  const challenge_languages_to_array: string[] = challenge_languages.split("");

  const challenge_details = [
    [
      challenge_title,
      brief_description,
      challenge_description,
      extra_tips,
      figma,
      image_URLs.filter((img) => img.type === "featured")[0].url,
      difficulty_level,
    ],
  ];

  try {
    // Insert a new challenge
    const newChallengeQuery =
      "INSERT INTO challenges(challenge_title,brief_description,challenge_description,extra_tips,figma,featured_image,difficulty_level) VALUES ?";
    const [{ insertId }] = await pool.query<ResultSetHeader>(
      newChallengeQuery,
      [challenge_details]
    );

    const challenge_images_details = [
      [1, image_URLs.filter((img) => img.type === "desktop")[0].url, insertId],
      [
        2,
        image_URLs.filter((img) => img.type === "tablet")[0]?.url || null,
        insertId,
      ],
      [
        3,
        image_URLs.filter((img) => img.type === "mobile")[0]?.url || null,
        insertId,
      ],
    ];

    // Insert challenge images
    const challengeImagesQuery =
      "INSERT INTO challenge_images(image_type,image_link,challenge_id) VALUES ?";
    await pool.query(challengeImagesQuery, [challenge_images_details]);

    // Insert challenge languages, i.e: HTML, CSS, JS.
    for (let i = 0; i < challenge_languages_to_array.length; i++) {
      console.log(challenge_languages_to_array[i]);

      const challengeLanguagesQuery =
        "INSERT INTO challenge_languages(language_id,challenge_id) VALUES ?";
      await pool.query(challengeLanguagesQuery, [
        [[challenge_languages_to_array[i], insertId]],
      ]);
    }

    return res
      .status(201)
      .json({ message: "Challenge was created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const updateChallenge = async (req: Request, res: Response) => {
  const challenge_id = req.params.id;

  const {
    challenge_title,
    brief_description,
    challenge_description,
    extra_tips,
    figma,
    featured_image,
    difficulty_level,
  } = req.body;

  const image_URLs = await uploadMultipleImages(req);

  const updated_challenge_details = {
    challenge_title,
    brief_description,
    challenge_description,
    extra_tips,
    figma,
    featured_image:
      image_URLs.filter((img) => img.type === "featured")[0].url ||
      featured_image,
    difficulty_level,
  };

  try {
    // Update a challenge
    const updatedChallengeQuery = "UPDATE challenges SET ? WHERE id = ?";
    await pool.query<ResultSetHeader>(updatedChallengeQuery, [
      updated_challenge_details,
      challenge_id,
    ]);

    for (let i = 0; i < image_URLs.length; i++) {
      const updated_challenge_images_details = {
        image_link: image_URLs[i].url,
      };

      // Update challenge images
      const challengeImagesQuery =
        "UPDATE challenge_images SET ? WHERE challenge_id = ? AND image_type = ?";
      await pool.query(challengeImagesQuery, [
        updated_challenge_images_details,
        challenge_id,
        image_URLs[i].type === "desktop"
          ? 1
          : image_URLs[i].type === "tablet"
          ? 2
          : 3,
      ]);
    }

    return res
      .status(200)
      .json({ message: "Challenge was updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const deleteChallenge = async (req: Request, res: Response) => {
  const challenge_id = req.params.id;

  const deleteQuery = "DELETE FROM challenges WHERE id = ?";

  try {
    const result = await pool.query<ResultSetHeader>(deleteQuery, [
      challenge_id,
    ]);
    console.log(result);

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ message: "Challenge cannot be found!" });
    }
    return res.status(200).json({ message: "Challenge deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getAllChallenges = async (req: Request, res: Response) => {
  const query =
    "SELECT c.challenge_title, c.id, c.createdAt, c.challenge_description,c.extra_tips, c.figma,c.featured_image, d.levelName, c.brief_description, GROUP_CONCAT(DISTINCT i.image_link) AS challenge_images, GROUP_CONCAT(DISTINCT l.language_name) AS languages FROM challenges AS c LEFT JOIN challenge_languages AS cl ON c.id = cl.challenge_id LEFT JOIN languages AS l ON cl.language_id = l.id LEFT JOIN challenge_images AS i ON c.id = i.challenge_id LEFT JOIN difficulty_levels AS d ON c.difficulty_level = d.id GROUP BY c.id";

  try {
    const result = await pool.query<ResultSetHeader>(query);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getOneChallenge = async (req: Request, res: Response) => {
  const challenge_id = req.params.id;

  const query =
    "SELECT c.challenge_title, c.id, c.createdAt, c.challenge_description,c.extra_tips, c.figma,c.featured_image, d.levelName, c.brief_description, GROUP_CONCAT(DISTINCT i.image_link) AS challenge_images, GROUP_CONCAT(DISTINCT l.language_name) AS languages FROM challenges AS c LEFT JOIN challenge_languages AS cl ON c.id = cl.challenge_id LEFT JOIN languages AS l ON cl.language_id = l.id LEFT JOIN challenge_images AS i ON c.id = i.challenge_id LEFT JOIN difficulty_levels AS d ON c.difficulty_level = d.id WHERE c.id = ? GROUP BY c.id";

  try {
    const result = await pool.query<ResultSetHeader>(query, [challenge_id]);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllChallenges,
  getOneChallenge,
};
