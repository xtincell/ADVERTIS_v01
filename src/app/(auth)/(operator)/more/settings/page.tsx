// ==========================================================================
// PAGE P.8G — Settings (Operator)
// User profile and account settings.
// ==========================================================================

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  Building,
  Mail,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Profile Section
// ---------------------------------------------------------------------------

function ProfileSection() {
  const { data: profile, isLoading } = api.auth.getProfile.useQuery();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const updateProfile = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès.");
      setIsDirty(false);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du profil.");
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setCompany(profile.company ?? "");
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({
      name: name || undefined,
      company: company || undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="size-5 text-primary" />
          <CardTitle>Profil</CardTitle>
        </div>
        <CardDescription>
          G&eacute;rez vos informations personnelles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsDirty(true);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">
            <div className="flex items-center gap-1.5">
              <Building className="size-3.5" />
              Entreprise
            </div>
          </Label>
          <Input
            id="company"
            placeholder="Nom de votre entreprise"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              setIsDirty(true);
            }}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!isDirty || updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            "Sauvegarder"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Account Section
// ---------------------------------------------------------------------------

function AccountSection() {
  const { data: profile, isLoading } = api.auth.getProfile.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-5 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-primary" />
          <CardTitle>Compte</CardTitle>
        </div>
        <CardDescription>
          Informations de votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
            Adresse email
          </Label>
          <p className="text-sm font-medium">
            {profile?.email ?? "Non renseigné"}
          </p>
        </div>

        <Separator />

        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              Membre depuis
            </div>
          </Label>
          <p className="text-sm font-medium">
            {profile?.createdAt ? formatDate(profile.createdAt) : "---"}
          </p>
        </div>

        <Separator />

        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
            R&ocirc;le
          </Label>
          <p className="text-sm font-medium capitalize">
            {profile?.role ?? "utilisateur"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Danger Zone
// ---------------------------------------------------------------------------

function DangerZoneSection() {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          <CardTitle className="text-destructive">Zone de danger</CardTitle>
        </div>
        <CardDescription>
          Actions irr&eacute;versibles sur votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          size="sm"
          disabled
          title="Bient&ocirc;t disponible"
        >
          Supprimer mon compte (Bient&ocirc;t disponible)
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------

export default function OperatorSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Param&egrave;tres
        </h1>
        <p className="text-muted-foreground">
          G&eacute;rez votre profil et les param&egrave;tres de votre compte.
        </p>
      </div>

      <ProfileSection />
      <AccountSection />
      <DangerZoneSection />
    </div>
  );
}
