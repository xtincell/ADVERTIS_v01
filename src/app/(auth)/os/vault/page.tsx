// ==========================================================================
// PAGE P.OS.VAULT — Brand Vault (Asset Library)
// Brand asset management in Brand OS portal.
// ==========================================================================

"use client";

import { Image, FileText, HardDrive, FolderOpen } from "lucide-react";
import { useBrandId } from "~/components/brand-os/brand-os-provider";
import { BrandVaultGallery } from "~/components/brand-os/brand-vault-gallery";
import { api } from "~/trpc/react";

function VaultHeader({ brandId }: { brandId: string }) {
  const { data: stats } = api.brandVault.getStats.useQuery(
    { strategyId: brandId },
    { enabled: !!brandId },
  );

  const categoryCount = stats?.perCategory
    ? Object.keys(stats.perCategory).length
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Brand Vault</h1>
        <p className="text-sm text-muted-foreground">
          Bibliothèque centralisée des assets de la marque
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Image className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Total assets</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {stats?.total ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Actifs</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {stats?.active ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <HardDrive className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Taille totale</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {stats?.totalSizeFormatted ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Catégories</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {categoryCount || "—"}
          </p>
        </div>
      </div>

      <div className="section-divider" />
    </div>
  );
}

export default function BrandVaultPage() {
  const brandId = useBrandId();

  if (!brandId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-muted-foreground text-sm">
          Sélectionnez une marque pour accéder au Brand Vault.
        </p>
        <p className="text-muted-foreground text-xs max-w-sm text-center">
          Utilisez le sélecteur de marque dans le header pour choisir une marque.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <VaultHeader brandId={brandId} />
      <BrandVaultGallery strategyId={brandId} />
    </div>
  );
}
