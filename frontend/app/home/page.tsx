import Navbar from "@/app/components/navbar";
import SearchBar from "@/app/components/searchBar";
import NewsCard from "@/app/components/newsCard";
interface Article {
  source: {
    id: string | null;
    name: string;
  };
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
}

const getNews = async (query?: string): Promise<Article[]> => {
  const apiKey = process.env.NEWS_API;
  const trimmedQuery = query?.trim();
  const params = new URLSearchParams({ apiKey: apiKey || "" });

  let url = "";

  if (trimmedQuery) {
    params.set("q", trimmedQuery);
    params.set("language", "en");
    params.set("sortBy", "relevancy");
    url = `https://newsapi.org/v2/everything?${params.toString()}`;
  } else {
    params.set("sources", "bbc-news,reuters,al-jazeera-english,cnn");
    url = `https://newsapi.org/v2/top-headlines?${params.toString()}`;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.status === "ok") {
      return data.articles;
    } else {
      console.error(data.message);
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const queryValue = resolvedSearchParams?.query;
  const query = Array.isArray(queryValue)
    ? queryValue[0] || ""
    : queryValue || "";
  const articles = await getNews(query);

  return (
    <div className="bg-[#F2F0EF] min-h-screen text-[#1c1b20]">
      <Navbar />

      <main className="p-8 max-w-7xl mx-auto">
        <SearchBar />
        <h1 className="text-3xl font-bold mb-8">
          {query ? `Results for "${query}"` : "Latest Global  Headlines"}
        </h1>

        {articles.length === 0 ? (
          <p className="text-red-500 font-semibold">
            Failed to load news or no articles found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.url} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
