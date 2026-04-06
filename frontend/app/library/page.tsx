"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";

interface User {
  id: string;
  name: string;
  email?: string;
}

interface SavedArticle {
  id: number;
  title: string;
  url: string;
  urlToImage: string | null;
  sourceName: string;
  aiSummary: string | null;
}

async function getLibrary(userId: string): Promise<SavedArticle[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured.");
    }

    const res = await fetch(`${apiUrl}/library/get-articles/${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default function LibraryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibraryData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured.");
        }

        const userRes = await fetch(`${apiUrl}/auth/get-user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const userData = await userRes.json();

        if (!userRes.ok || !userData.user) {
          localStorage.removeItem("token");
          setLoading(false);
          return;
        }

        setUser(userData.user);

        const articles = await getLibrary(String(userData.user.id));
        setSavedArticles(articles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, []);

  const handleUnsave = async (url: string) => {
    if (!user?.id || removingUrl) {
      return;
    }

    setRemovingUrl(url);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const res = await fetch(`${apiUrl}/library/delete-article`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          url,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSavedArticles((currentArticles) =>
          currentArticles.filter((article) => article.url !== url),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingUrl(null);
    }
  };

  return (
    <div className="bg-[#F2F0EF] min-h-screen text-[#1c1b20]">
      <Navbar />

      <main className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Library</h1>
        {user && (
          <p className="text-sm text-gray-600 mb-8">
            Saved articles for {user.name}
          </p>
        )}

        {loading ? (
          <p>Loading your library...</p>
        ) : savedArticles.length === 0 ? (
          <p>Your library is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedArticles.map((article) => (
              <article
                key={article.id}
                className="relative bg-white rounded-xl p-5 shadow-sm border flex flex-col"
              >
                <button
                  onClick={() => handleUnsave(article.url)}
                  disabled={removingUrl === article.url}
                  className="absolute right-5 top-5 rounded-full border border-[#1c1b20]/10 bg-[#f7f2ee] px-3 py-1.5 text-xs font-semibold text-[#7a3b2e] transition hover:bg-[#efe4dd] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removingUrl === article.url ? "Removing..." : "Unsave"}
                </button>

                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}

                <h2 className="text-lg font-bold mb-4 pr-20">{article.title}</h2>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  {article.sourceName}
                </p>

                {article.aiSummary && (
                  <div className="mb-6 rounded-2xl border border-[#7da6c2]/25 bg-[linear-gradient(180deg,#f5f9fc_0%,#edf4f8_100%)] p-4 text-sm text-[#20303b]">
                    <span className="font-bold block mb-1">AI Summary:</span>
                    {article.aiSummary}
                  </div>
                )}

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-sm font-semibold bg-[#1c1b20] text-white px-4 py-2 rounded-full hover:bg-gray-800 transition text-center"
                >
                  Read Full Article
                </a>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
