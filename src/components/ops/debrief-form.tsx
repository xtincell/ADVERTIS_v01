// ==========================================================================
// C.O8 — Debrief Form
// Post-mission debrief form.
// ==========================================================================

"use client";

/**
 * DebriefForm — Form for completing a mission debrief.
 * Required before closing a mission. Feeds learnings back into SIS.
 */

import { useState } from "react";
import { CheckCircle2, Plus, X, MessageSquare } from "lucide-react";
import { api } from "~/trpc/react";
import { ASSIGNMENT_ROLE_LABELS } from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

interface DebriefFormProps {
  missionId: string;
  onSuccess?: () => void;
}

export function DebriefForm({ missionId, onSuccess }: DebriefFormProps) {
  const [summary, setSummary] = useState("");
  const [clientFeedback, setClientFeedback] = useState("");
  const [qualityScore, setQualityScore] = useState(70);
  const [onTime, setOnTime] = useState(true);
  const [onBudget, setOnBudget] = useState(true);
  const [lessons, setLessons] = useState<string[]>([]);
  const [newLesson, setNewLesson] = useState("");

  // Load freelance assignment notes for this mission
  const { data: assignmentNotes } =
    api.mission.assignments.getByMission.useQuery(
      { missionId },
      { select: (data) => data.filter((a) => a.notes && a.notes.trim()) },
    );

  const createDebrief = api.mission.debrief.create.useMutation({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const addLesson = () => {
    if (newLesson.trim()) {
      setLessons((prev) => [...prev, newLesson.trim()]);
      setNewLesson("");
    }
  };

  const removeLesson = (index: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (summary.length < 10) return;
    createDebrief.mutate({
      missionId,
      summary,
      clientFeedback: clientFeedback || undefined,
      qualityScore,
      onTime,
      onBudget,
      lessonsLearned: lessons.length > 0 ? lessons : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Debrief Mission</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Freelance Field Notes (read-only) */}
        {assignmentNotes && assignmentNotes.length > 0 && (
          <div className="space-y-2 rounded-md border border-blue-200 bg-blue-50/50 p-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-blue-700">
              <MessageSquare className="h-4 w-4" />
              Notes terrain freelance
            </div>
            {assignmentNotes.map((a) => (
              <div key={a.id} className="rounded bg-white/80 p-2 text-sm">
                <span className="font-medium text-blue-600">
                  {ASSIGNMENT_ROLE_LABELS[
                    a.role as keyof typeof ASSIGNMENT_ROLE_LABELS
                  ] ?? a.role}
                </span>
                <p className="mt-0.5 text-muted-foreground">{a.notes}</p>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="space-y-2">
          <Label htmlFor="summary">Résumé *</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Résumé de la mission : objectifs atteints, difficultés rencontrées..."
            rows={4}
          />
        </div>

        {/* Client Feedback */}
        <div className="space-y-2">
          <Label htmlFor="feedback">Retour client</Label>
          <Textarea
            id="feedback"
            value={clientFeedback}
            onChange={(e) => setClientFeedback(e.target.value)}
            placeholder="Retour du client sur la mission..."
            rows={3}
          />
        </div>

        {/* Quality Score */}
        <div className="space-y-2">
          <Label>Qualité : {qualityScore}/100</Label>
          <input
            type="range"
            value={qualityScore}
            onChange={(e) => setQualityScore(Number(e.target.value))}
            min={0}
            max={100}
            step={5}
            className="w-full accent-primary"
          />
        </div>

        {/* On Time / On Budget */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onTime}
              onChange={(e) => setOnTime(e.target.checked)}
              className="rounded"
            />
            Dans les temps
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onBudget}
              onChange={(e) => setOnBudget(e.target.checked)}
              className="rounded"
            />
            Dans le budget
          </label>
        </div>

        {/* Lessons Learned */}
        <div className="space-y-2">
          <Label>Leçons apprises</Label>
          <div className="flex gap-2">
            <Input
              value={newLesson}
              onChange={(e) => setNewLesson(e.target.value)}
              placeholder="Ajouter une leçon..."
              onKeyDown={(e) => e.key === "Enter" && addLesson()}
            />
            <Button size="sm" variant="outline" onClick={addLesson}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {lessons.length > 0 && (
            <ul className="space-y-1">
              {lessons.map((lesson, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded bg-muted px-2 py-1 text-sm"
                >
                  <span className="flex-1">{lesson}</span>
                  <button
                    onClick={() => removeLesson(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={summary.length < 10 || createDebrief.isPending}
          className="w-full"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {createDebrief.isPending ? "Enregistrement..." : "Valider le debrief"}
        </Button>
      </CardContent>
    </Card>
  );
}
