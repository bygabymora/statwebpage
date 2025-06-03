import { getToken } from "next-auth/jwt";
import News from "../../../../../models/News";
import db from "../../../../../utils/db";

const handler = async (req, res) => {
  // 1) Validación de token/permiso
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send("signin required");
  }

  // 2) Ruteo según método
  if (req.method === "GET") {
    return getHandler(req, res);
  } else if (req.method === "PUT") {
    return putHandler(req, res);
  } else if (req.method === "DELETE") {
    return deleteHandler(req, res);
  } else {
    // Si llega cualquier otro método (POST, PATCH, etc.), devolvemos 400
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
    // Actualiza campos
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
    return res.send({ message: "News updated successfully" });
  } else {
    return res.status(404).send({ message: "News not found" });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect(true);
  const news = await News.findById(req.query.id);
  if (news) {
    await News.findByIdAndDelete(req.query.id);
    return res.send({ message: "News deleted successfully" });
  } else {
    return res.status(404).send({ message: "News not found" });
  }
};

export default handler;
