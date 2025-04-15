"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Judge } from "@/types/types";

interface CourtOpinion {
  id: string;
  title: string;
  date: string;
  cluster_id: string;
  html_file_path?: string;
}

export default function JudgeDetailPage() {
  const params = useParams();
  const judgeId = params.id as string;
  const [judge, setJudge] = useState<Judge | null>(null);
  const [opinions, setOpinions] = useState<CourtOpinion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJudge = async () => {
      setLoading(true);
      const { data: judgeData } = await supabase.from("judge").select("*").eq("id", judgeId).single();
      setJudge(judgeData);
      const { data: opinionsData } = await supabase
        .from("court_opinion")
        .select("id, title, date, cluster_id, html_file_path")
        .eq("author_id", judgeId)
        .order("date", { ascending: false });
      setOpinions(opinionsData || []);
      setLoading(false);
    };
    if (judgeId) fetchJudge();
  }, [judgeId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  if (!judge) {
    return <div className="container mx-auto px-4 py-8">Judge not found.</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{judge.full_name}</h1>
      <div className="mb-8 text-gray-700">
        <div><span className="font-semibold">First Name:</span> {judge.first_name}</div>
        <div><span className="font-semibold">Last Name:</span> {judge.last_name}</div>
        {judge.suffix && <div><span className="font-semibold">Suffix:</span> {judge.suffix}</div>}
      </div>
      <h2 className="text-2xl font-semibold mb-4">Opinions Authored</h2>
      {opinions.length === 0 ? (
        <div className="text-gray-500">No opinions found for this judge.</div>
      ) : (
        <div className="space-y-4">
          {opinions.map(op => (
            <Link key={op.id} href={`/supreme-court/${op.cluster_id}`} className="block">
              <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div className="font-semibold text-lg">{op.title || `Opinion ${op.id}`}</div>
                <div className="text-gray-500 text-sm">{op.date && new Date(op.date).toLocaleDateString()}</div>
                {op.html_file_path && (
                  <div className="text-xs text-blue-600 mt-2">HTML Available</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
