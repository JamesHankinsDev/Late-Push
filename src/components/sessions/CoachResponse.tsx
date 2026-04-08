"use client";

interface CoachResponseProps {
  response: string;
  loading?: boolean;
}

export default function CoachResponse({ response, loading }: CoachResponseProps) {
  if (loading) {
    return (
      <div className="bg-concrete-800 border border-concrete-700 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-skate-purple/20 flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Your Skate Coach</p>
            <p className="text-[10px] text-concrete-500">Powered by Claude</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-concrete-700 rounded animate-pulse w-full" />
          <div className="h-3 bg-concrete-700 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-concrete-700 rounded animate-pulse w-4/6" />
          <div className="h-3 bg-concrete-700 rounded animate-pulse w-full" />
          <div className="h-3 bg-concrete-700 rounded animate-pulse w-3/6" />
        </div>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="bg-concrete-800 border border-skate-purple/30 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-skate-purple/20 flex items-center justify-center">
          <span className="text-sm">🤖</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Your Skate Coach</p>
          <p className="text-[10px] text-concrete-500">Powered by Claude</p>
        </div>
      </div>
      <div className="text-sm text-concrete-200 leading-relaxed whitespace-pre-wrap">
        {response}
      </div>
    </div>
  );
}
