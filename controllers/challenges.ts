import { Request, Response } from "express";
import { pool } from "../db/db";
import { UserRequest } from "../util/token";
import { ResultSetHeader } from "mysql2";

import { v2 as cloudinary } from "cloudinary";
// require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

type UploadedImageType = { type: string; url: string };

async function uploadMultipleImages(req: Request) {
  const files = req.files as Express.Multer.File[];

  const image_URLs: UploadedImageType[] = [];

  await Promise.all(
    files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI, {
        resource_type: "image",
        format: "webp",
      });
      image_URLs.push({ type: file.fieldname, url: res.secure_url });
    })
  );

  return image_URLs;
}

const createChallenge = async (req: Request, res: Response) => {
  const image_URLs = await uploadMultipleImages(req);

  const {
    challenge_title,
    brief_description,
    challenge_description,
    extra_tips,
    figma,
    difficulty_level,
  } = req.body;

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
    return res
      .status(200)
      .json({ message: "Challenge was created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const updateChallenge = async (req: UserRequest, res: Response) => {
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
  const query = "SELECT * FROM challenges";

  try {
    const result = await pool.query<ResultSetHeader>(query);
    console.log(result[0]);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getOneChallenge = async (req: Request, res: Response) => {
  const challenge_id = req.params.id;

  const query = "SELECT * FROM challenges WHERE id = ?";

  try {
    const result = await pool.query<ResultSetHeader>(query, [challenge_id]);
    console.log(result[0]);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

// const getChallengesByCategory = (req: UserRequest, res: Response) => {
//   const user_id = req.user;

//   const category = req.params.id;

//   const query = "SELECT * FROM `notes` WHERE user_id = ? AND category = ?";

//   connection.query(query, [user_id, category], (err, results) => {
//     if (err) {
//       console.log(err);

//       res.status(500).send("Internal Server Error");
//     } else {
//       res.status(200).json(results);
//     }
//   });
// };

// const getNotesByQuery = (req: UserRequest, res: Response) => {
//   const user_id = req.user;

//   const searchQuery = req.query.search;

//   const query =
//     "SELECT * FROM `notes` WHERE user_id = ? AND title LIKE '%?%' OR body LIKE '%?'";

//   connection.query(query, [user_id, searchQuery], (err, results) => {
//     if (err) {
//       console.log(err);

//       res.status(500).send("Internal Server Error");
//     } else {
//       res.status(200).json(results);
//     }
//   });
// };

export {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllChallenges,
  getOneChallenge,
};
