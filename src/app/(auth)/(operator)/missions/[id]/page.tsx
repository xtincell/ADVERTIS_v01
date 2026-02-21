// ==========================================================================
// PAGE P.6 — Mission Detail
// Thin wrapper around MissionDetail component with route param unwrapping.
// ==========================================================================

"use client";

/**
 * MissionDetailPage — Unwraps the dynamic [id] param and renders MissionDetail.
 */

import { use } from "react";
import { useRouter } from "next/navigation";

import { MissionDetail } from "~/components/ops/mission-detail";

export default function MissionDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();

  return (
    <div className="p-4 pb-24 md:p-6">
      <MissionDetail
        missionId={params.id}
        onBack={() => router.push("/missions")}
      />
    </div>
  );
}
