import prisma from "../config/prisma.js";

export const saveArticle = async (req, res) => {
  try {
    const { userId, article, aiSummary } = req.body;

    if (!userId || !article?.url || !article?.title || !article?.source?.name) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required article data" });
    }

    const saved = await prisma.savedArticle.upsert({
      where: {
        userId_url: { userId, url: article.url },
      },
      update: {
        title: article.title,
        urlToImage: article.urlToImage,
        sourceName: article.source.name,
        ...(typeof aiSummary === "string" && aiSummary.trim()
          ? { aiSummary }
          : {}),
      },
      create: {
        userId,
        title: article.title,
        url: article.url,
        urlToImage: article.urlToImage,
        sourceName: article.source.name,
        aiSummary:
          typeof aiSummary === "string" && aiSummary.trim() ? aiSummary : null,
      },
    });
    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save article" });
  }
};

export const getArticles = async (req, res) => {
  try {
    const { userId } = req.params;

    const articles = await prisma.savedArticle.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
    });

    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch library" });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { userId, url } = req.body;

    if (!userId || !url) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required article data" });
    }

    await prisma.savedArticle.delete({
      where: {
        userId_url: { userId, url },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to delete article" });
  }
};
