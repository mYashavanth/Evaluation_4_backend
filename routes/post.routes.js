const express = require("express");
const auth = require("../middlewares/auth.middleware");
const postRoutes = express.Router();
const Post = require("../models/post.modle");
const userAgent = require("useragent");

postRoutes.use(auth);

postRoutes.get("/", async (req, res) => {
  try {
    const { userID } = req.body;
    const posts = await Post.find({ userID: userID }).sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getDeviceType(useragent) {
  if (useragent.isDesktop) {
    return "PC";
  } else if (useragent.isTablet) {
    return "TABLET";
  } else if (useragent.isMobile) {
    return "MOBILE";
  } else {
    return "UNKNOWN";
  }
}

postRoutes.post("/add", async (req, res) => {
  try {
    const { title, body, userID } = req.body;
    console.log({ useragent: req.headers["user-agent"], body: req.body });
    const parsedUserAgent = userAgent.parse(req.headers["user-agent"]);
    const device = getDeviceType(parsedUserAgent);
    const post = new Post({
      title,
      body,
      device,
      userID,
    });
    await post
      .save()
      .then(() => {
        res.status(200).json({ msg: "Post added successfully" });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

postRoutes.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userID;

    await Post.updateOne({ _id: id, userID: userId }, req.body)
      .then(() => {
        res.status(200).json({ msg: "Post updated successfully" });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

postRoutes.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userID;
    await Post.deleteOne({ _id: id, userID: userId })
      .then(() => {
        res.status(200).json({ msg: "Post deleted successfully" });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = postRoutes;
