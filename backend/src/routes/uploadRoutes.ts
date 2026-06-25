import { Router, Request, Response } from "express";
import upload from "../config/upload";
import { protect } from "../middleware/auth";

const router = Router();

router.post(
  "/",
  protect,
  upload.array("images", 5),
  (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = files.map(
      (file) => `http://localhost:5000/uploads/${file.filename}`,
    );
    res.json({ urls });
  },
);

export default router;
