// =============================================================================
// COMP C.VAULT — Brand Vault Gallery
// =============================================================================
// Asset library gallery with grid view, search, category filter,
// stats summary, and upload dialog.
// =============================================================================

"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
} from "~/lib/constants";
import {
  Search,
  Upload,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  Package,
  HardDrive,
  Eye,
  Download,
  Clock,
  Grid3x3,
  Loader2,
  FolderOpen,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatFileSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return ImageIcon;
  if (fileType.startsWith("video/")) return Film;
  if (fileType.startsWith("audio/")) return Music;
  return FileText;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function BrandVaultGallery({ strategyId }: { strategyId: string }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // ── Form state ──
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("OTHER");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formFileType, setFormFileType] = useState("image/png");
  const [formTags, setFormTags] = useState("");

  const utils = api.useUtils();

  // ── Queries ──
  const assetsQuery = api.brandVault.list.useQuery({
    strategyId,
    category: categoryFilter !== "ALL" ? categoryFilter : undefined,
    search: search || undefined,
  });

  const statsQuery = api.brandVault.getStats.useQuery({ strategyId });

  const selectedAssetQuery = api.brandVault.getById.useQuery(
    { id: selectedAssetId ?? "" },
    { enabled: !!selectedAssetId },
  );

  const versionsQuery = api.brandVault.getVersions.useQuery(
    { assetId: selectedAssetId ?? "" },
    { enabled: !!selectedAssetId },
  );

  // ── Mutations ──
  const createAsset = api.brandVault.create.useMutation({
    onSuccess: () => {
      void utils.brandVault.list.invalidate();
      void utils.brandVault.getStats.invalidate();
      setCreateOpen(false);
      resetForm();
    },
  });

  const deleteAsset = api.brandVault.delete.useMutation({
    onSuccess: () => {
      void utils.brandVault.list.invalidate();
      void utils.brandVault.getStats.invalidate();
      setSelectedAssetId(null);
    },
  });

  function resetForm() {
    setFormName("");
    setFormDesc("");
    setFormCategory("OTHER");
    setFormFileUrl("");
    setFormFileType("image/png");
    setFormTags("");
  }

  const handleCreate = () => {
    if (!formName.trim() || !formFileUrl.trim()) return;
    createAsset.mutate({
      strategyId,
      name: formName.trim(),
      description: formDesc.trim() || undefined,
      category: formCategory,
      fileUrl: formFileUrl.trim(),
      fileType: formFileType,
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  const assets = assetsQuery.data ?? [];
  const stats = statsQuery.data;
  const selectedAsset = selectedAssetQuery.data;
  const versions = versionsQuery.data ?? [];

  // ── Categories for filter ──
  const categoryOptions = Object.entries(ASSET_CATEGORIES) as [string, string][];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Brand Vault</h2>
          <p className="text-sm text-muted-foreground">
            Bibliothèque centralisée des assets de marque
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Ajouter un asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvel asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Nom de l'asset *"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optionnel)"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(([key, val]) => (
                      <SelectItem key={key} value={val}>
                        {ASSET_CATEGORY_LABELS[val as keyof typeof ASSET_CATEGORY_LABELS] ?? val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formFileType} onValueChange={setFormFileType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de fichier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                    <SelectItem value="image/svg+xml">SVG</SelectItem>
                    <SelectItem value="application/pdf">PDF</SelectItem>
                    <SelectItem value="video/mp4">MP4</SelectItem>
                    <SelectItem value="audio/mp3">MP3</SelectItem>
                    <SelectItem value="application/zip">ZIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="URL du fichier *"
                value={formFileUrl}
                onChange={(e) => setFormFileUrl(e.target.value)}
              />
              <Input
                placeholder="Tags (séparés par des virgules)"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
              />
              <Button
                onClick={handleCreate}
                disabled={!formName.trim() || !formFileUrl.trim() || createAsset.isPending}
                className="w-full gap-2"
              >
                {createAsset.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Stats row ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total assets</p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actifs</p>
                <p className="text-lg font-bold">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <HardDrive className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taille totale</p>
                <p className="text-lg font-bold">{stats.totalSizeFormatted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Grid3x3 className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Catégories</p>
                <p className="text-lg font-bold">
                  {Object.keys(stats.perCategory).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes les catégories</SelectItem>
            {categoryOptions.map(([key, val]) => (
              <SelectItem key={key} value={val}>
                {ASSET_CATEGORY_LABELS[val as keyof typeof ASSET_CATEGORY_LABELS] ?? val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Asset grid ── */}
      {assets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <FolderOpen className="h-12 w-12 opacity-30" />
          <p className="text-sm">Aucun asset trouvé</p>
          <p className="text-xs text-center max-w-sm">
            {search || categoryFilter !== "ALL"
              ? "Modifiez vos filtres pour afficher plus de résultats."
              : "Ajoutez votre premier asset de marque à la bibliothèque."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => {
            const FileIcon = getFileIcon(asset.fileType);
            const catLabel =
              ASSET_CATEGORY_LABELS[asset.category as keyof typeof ASSET_CATEGORY_LABELS] ??
              asset.category;

            return (
              <Card
                key={asset.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
                  selectedAssetId === asset.id && "border-primary ring-1 ring-primary/20",
                )}
                onClick={() =>
                  setSelectedAssetId(selectedAssetId === asset.id ? null : asset.id)
                }
              >
                <CardContent className="p-0">
                  {/* Thumbnail area */}
                  <div className="h-36 bg-muted/30 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileIcon className="h-10 w-10 text-muted-foreground/40" />
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-[10px]"
                    >
                      v{asset.version}
                    </Badge>
                    <Badge
                      className={cn(
                        "absolute top-2 left-2 text-[10px]",
                        asset.status === "ACTIVE"
                          ? "bg-emerald-500/80"
                          : asset.status === "ARCHIVED"
                            ? "bg-zinc-500/80"
                            : "bg-amber-500/80",
                      )}
                    >
                      {asset.status}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <h4 className="text-sm font-semibold truncate">{asset.name}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{catLabel}</span>
                      <span>{formatFileSize(asset.fileSize)}</span>
                    </div>
                    {(() => {
                      const tags = Array.isArray(asset.tags)
                        ? asset.tags.filter((t): t is string => typeof t === "string")
                        : [];
                      if (tags.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(asset.updatedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Selected asset detail panel ── */}
      {selectedAsset && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{selectedAsset.name}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={selectedAsset.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5" />
                    Télécharger
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteAsset.mutate({ id: selectedAsset.id })}
                  disabled={deleteAsset.isPending}
                >
                  Supprimer
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Catégorie</p>
                <p className="font-medium">
                  {ASSET_CATEGORY_LABELS[
                    selectedAsset.category as keyof typeof ASSET_CATEGORY_LABELS
                  ] ?? selectedAsset.category}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium">{selectedAsset.fileType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taille</p>
                <p className="font-medium">{formatFileSize(selectedAsset.fileSize)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="font-medium">v{selectedAsset.version}</p>
              </div>
            </div>

            {selectedAsset.description && (
              <p className="text-sm text-muted-foreground mt-3">
                {selectedAsset.description}
              </p>
            )}

            {/* Version history */}
            {versions.length > 1 && (
              <div className="mt-4 pt-4 border-t">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">
                  Historique des versions ({versions.length})
                </h5>
                <div className="space-y-1">
                  {versions.map((v) => (
                    <div
                      key={v.id}
                      className={cn(
                        "flex items-center justify-between text-xs px-2 py-1.5 rounded",
                        v.isLatest ? "bg-primary/5 font-medium" : "text-muted-foreground",
                      )}
                    >
                      <span>
                        v{v.version} {v.isLatest && "(actuelle)"}
                      </span>
                      <span>{formatFileSize(v.fileSize)}</span>
                      <span>{formatDate(v.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
