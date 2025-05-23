import { getToken } from "next-auth/jwt";
import News from "../../../../../models/News";
import db from "../../../../../utils/db";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send("signin required");
  }

  if (req.method === "GET") {
    return getHandler(req, res);
  } else if (req.method === "PUT") {
    return putHandler(req, res);
  } else if (req.method === "DELETE") {
    return deleteHandler(req, res);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

const getHandler = async (req, res) => {
  await db.connect(true);
  const news = await News.findById(req.query.id);

  res.send(news);
};

const putHandler = async (req, res) => {
  await db.connect(true);
  const news = await News.findById(req.query.id);
  if (news) {
    // Update news properties here
    news.title = req.body.title;
    news.slug = req.body.slug;
    news.content = req.body.content;
    news.category = req.body.category;
    news.tags = req.body.tags;
    news.imageUrl = req.body.imageUrl;
    news.author = req.body.author;
    news.sources = req.body.sources.map((source) => ({
      title: source.title,
      url: source.url,
    }));

    await news.save();

    res.send({ message: "News updated successfully" });
  } else {
    res.status(404).send({ message: "News not found" });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect(true);
  const news = await News.findById(req.query.id);
  if (news) {
    await News.findByIdAndDelete(req.query.id);

    res.send({ message: "News deleted successfully" });
  } else {
    res.status(404).send({ message: "News not found" });
  }
};

export default handler;
