import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const BOARD_CATEGORIES = [
  "Bitcoin Technical",
  "Altcoins",
  "Mining",
  "Trading",
  "Security",
  "Development",
  "Economics",
  "Legal",
];

export default function Apply() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    boardCategory: "",
    applicationText: "",
    forumThreadUrl: "",
    portfolioUrl: "",
    supportingEvidence: "",
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const createAppMutation = trpc.applications.create.useMutation({
    onSuccess: (data) => {
      toast.success("Application submitted successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.boardCategory) {
      toast.error("Please select a board category");
      return;
    }
    createAppMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-primary">Apply for Certification</h1>
          <p className="text-muted mt-1">Submit your expertise and let our community evaluate your knowledge</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-2xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Requirements</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Sr. Member rank or higher</li>
                    <li>✓ +5 trust score</li>
                    <li>✓ Active for 2+ years</li>
                    <li>✓ Max 3 attempts</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">What We Evaluate</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Technical Knowledge</li>
                    <li>• Contribution Quality</li>
                    <li>• Helpfulness</li>
                    <li>• Consistency</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Board Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-semibold">
                    Board Category *
                  </Label>
                  <Select value={formData.boardCategory} onValueChange={(value) => setFormData({ ...formData, boardCategory: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your expertise area" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOARD_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Application Text */}
                <div className="space-y-2">
                  <Label htmlFor="applicationText" className="text-base font-semibold">
                    Why Should You Be Certified? *
                  </Label>
                  <Textarea
                    id="applicationText"
                    placeholder="Describe your expertise, key contributions, and why you deserve certification in this area..."
                    value={formData.applicationText}
                    onChange={(e) => setFormData({ ...formData, applicationText: e.target.value })}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted">Minimum 200 characters recommended</p>
                </div>

                {/* Forum Thread URL */}
                <div className="space-y-2">
                  <Label htmlFor="forumThreadUrl" className="text-base font-semibold">
                    Forum Thread URL
                  </Label>
                  <Input
                    id="forumThreadUrl"
                    type="url"
                    placeholder="https://bitcointalk.org/index.php?topic=..."
                    value={formData.forumThreadUrl}
                    onChange={(e) => setFormData({ ...formData, forumThreadUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted">Link to your most significant contribution</p>
                </div>

                {/* Portfolio URL */}
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl" className="text-base font-semibold">
                    Portfolio URL
                  </Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    placeholder="https://example.com/portfolio"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted">Your personal website or GitHub profile (optional)</p>
                </div>

                {/* Supporting Evidence */}
                <div className="space-y-2">
                  <Label htmlFor="supportingEvidence" className="text-base font-semibold">
                    Supporting Evidence
                  </Label>
                  <Textarea
                    id="supportingEvidence"
                    placeholder="List specific posts, guides, or projects that demonstrate your expertise..."
                    value={formData.supportingEvidence}
                    onChange={(e) => setFormData({ ...formData, supportingEvidence: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted">Links to your best work and achievements</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createAppMutation.isPending} className="flex-1">
                    {createAppMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                    Cancel
                  </Button>
                </div>

                {createAppMutation.isError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{createAppMutation.error?.message}</p>
                  </div>
                )}
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
