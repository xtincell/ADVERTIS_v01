// ==========================================================================
// PAGE P.OS.VAULT — Brand Vault (Asset Library)
// Brand asset management in Brand OS portal.
// ==========================================================================

"use client";

import { useBrandId } from "~/components/brand-os/brand-os-provider";
import { BrandVaultGallery } from "~/components/brand-os/brand-vault-gallery";

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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <BrandVaultGallery strategyId={brandId} />
    </div>
  );
}
