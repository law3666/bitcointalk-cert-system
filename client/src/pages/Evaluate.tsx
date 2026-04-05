import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Evaluate() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [scores, setScores] = useState({
    technicalScore: 5,
    qualityScore: 5,
    helpfulnessScore: 5,
    consistencyScore: 5,
  });
  const [feedback, setFeedback] = useState("");

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const { data: applications, isLoading } = trpc.applications.getMyApplications.useQuery();
  const submitEvaluationMutation = trpc.evaluations.submit.useMutation({
    onSuccess: () => {
      toast.success("Evaluation submitted successfully!");
      setScores({ technicalScore: 5, qualityScore: 5, helpfulnessScore: 5, consistencyScore: 5 });
      setFeedback("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit evaluation");
    },
  });

  const handleSubmitEvaluation = (applicationId: number) => {
    if (!feedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }
    submitEvaluationMutation.mutate({
      applicationId,
      technicalScore: scores.technicalScore,
      qualityScore: scores.qualityScore,
      helpfulnessScore: scores.helpfulnessScore,
      consistencyScore: scores.consistencyScore,
      comment: feedback,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-primary">Evaluation Dashboard</h1>
          <p className="text-muted mt-1">Review and score certification applications</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {!isLoading && applications && applications.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-muted mx-auto opacity-50" />
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">All Caught Up!</h3>
              <p className="text-muted">There are no pending applications to evaluate right now.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications?.map((app: any) => (
              <Card key={app.id} className="p-8 space-y-6">
                {/* Application Header */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-primary">{app.boardCategory}</h2>
                  <p className="text-muted">Application ID: {app.id}</p>
                </div>

                {/* Application Details */}
                <div className="grid md:grid-cols-2 gap-6 py-6 border-t border-b border-border">
                  <div>
                    <p className="text-sm text-muted mb-1">Applicant</p>
                    <p className="font-semibold text-primary">{app.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Submitted</p>
                    <p className="font-semibold text-primary">{new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Bitcointalk Rank</p>
                    <p className="font-semibold text-primary">{app.user.bitcointalkRank}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Trust Score</p>
                    <p className="font-semibold text-primary">{app.user.trustScore}</p>
                  </div>
                </div>

                {/* Application Text */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Application Statement</Label>
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-foreground whitespace-pre-wrap">{app.applicationText}</p>
                  </div>
                </div>

                {/* Supporting Evidence */}
                {app.supportingEvidence && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Supporting Evidence</Label>
                    <div className="p-4 bg-background rounded-lg border border-border">
                      <p className="text-foreground whitespace-pre-wrap">{app.supportingEvidence}</p>
                    </div>
                  </div>
                )}

                {/* Scoring Section */}
                <div className="space-y-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-primary">Your Evaluation</h3>

                  {/* Technical Knowledge */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-semibold">Technical Knowledge (35%)</Label>
                      <span className="text-lg font-bold text-secondary">{scores.technicalScore}/10</span>
                    </div>
                    <Slider
                      value={[scores.technicalScore]}
                      onValueChange={(value) => setScores({ ...scores, technicalScore: value[0] })}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Contribution Quality */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-semibold">Contribution Quality (30%)</Label>
                      <span className="text-lg font-bold text-secondary">{scores.qualityScore}/10</span>
                    </div>
                    <Slider
                      value={[scores.qualityScore]}
                      onValueChange={(value) => setScores({ ...scores, qualityScore: value[0] })}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Helpfulness */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-semibold">Helpfulness (20%)</Label>
                      <span className="text-lg font-bold text-secondary">{scores.helpfulnessScore}/10</span>
                    </div>
                    <Slider
                      value={[scores.helpfulnessScore]}
                      onValueChange={(value) => setScores({ ...scores, helpfulnessScore: value[0] })}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Consistency */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-semibold">Consistency (15%)</Label>
                      <span className="text-lg font-bold text-secondary">{scores.consistencyScore}/10</span>
                    </div>
                    <Slider
                      value={[scores.consistencyScore]}
                      onValueChange={(value) => setScores({ ...scores, consistencyScore: value[0] })}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Calculated Score */}
                  <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                    <p className="text-sm text-muted mb-1">Weighted Score</p>
                    <p className="text-3xl font-bold text-secondary">
                      {(
                        scores.technicalScore * 0.35 +
                        scores.qualityScore * 0.3 +
                        scores.helpfulnessScore * 0.2 +
                        scores.consistencyScore * 0.15
                      ).toFixed(1)}
                      /10
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="font-semibold">
                    Feedback & Comments
                  </Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide constructive feedback for the applicant..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleSubmitEvaluation(app.id)}
                    disabled={submitEvaluationMutation.isPending}
                    className="flex-1"
                  >
                    {submitEvaluationMutation.isPending ? "Submitting..." : "Submit Evaluation"}
                  </Button>
                  <Button variant="outline">Skip</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
