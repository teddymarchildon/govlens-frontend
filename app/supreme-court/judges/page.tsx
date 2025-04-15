"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Judge } from "@/types/types";

export default function JudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchJudges = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("judge").select("*");
      if (!error && data) setJudges(data);
      setLoading(false);
    };
    fetchJudges();
  }, []);

  const filteredJudges = judges.filter(j => j.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Supreme Court Judges</h1>
      <input
        type="text"
        placeholder="Search judges..."
        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJudges.map(judge => (
            <Link key={judge.id} href={`/supreme-court/judges/${judge.id}`} className="block">
              <div className="bg-white rounded-lg shadow hover:shadow-md p-6 transition-shadow">
                <h2 className="text-xl font-semibold mb-2">{judge.full_name}</h2>
                <div className="text-gray-600 text-sm">{judge.first_name} {judge.last_name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
