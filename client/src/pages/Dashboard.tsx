import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { Award, FileText, Clock, CheckCircle2, AlertCircle, Download, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const { data: applications, isLoading: appsLoading } = trpc.applications.getMyApplications.useQuery();
  const { data: certificates, isLoading: certsLoading } = trpc.certificates.getMyCertificates.useQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>;
      case "appealed":
        return <Badge className="bg-blue-100 text-blue-700">Under Appeal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCertificateLevelBadge = (level: string) => {
    switch (level) {
      case "gold":
        return <Badge className="bg-amber-100 text-amber-700">Gold (90-100)</Badge>;
      case "silver":
        return <Badge className="bg-gray-100 text-gray-700">Silver (80-89)</Badge>;
      case "bronze":
        return <Badge className="bg-orange-100 text-orange-700">Bronze (70-79)</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
              <p className="text-muted mt-1">Welcome back, {user?.name}</p>
            </div>
            <Button asChild>
              <Link href="/apply">New Application</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {appsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="grid gap-4">
                {applications.map((app: any) => (
                  <Card key={app.id} className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-secondary" />
                          <h3 className="text-lg font-semibold text-primary">{app.boardCategory}</h3>
                        </div>
                        <p className="text-sm text-muted">Submitted on {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 py-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted mb-1">Evaluations</p>
                        <p className="text-2xl font-bold text-primary">{app.evaluationCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Avg Score</p>
                        <p className="text-2xl font-bold text-secondary">{app.avgScore ? app.avgScore.toFixed(1) : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Attempts</p>
                        <p className="text-2xl font-bold text-primary">{app.attemptCount}/3</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Status</p>
                        <p className="text-sm font-medium text-muted">
                          {app.status === "pending" ? "Awaiting review" : app.status}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/application/${app.id}`}>View Details</Link>
                      </Button>
                      {app.status === "rejected" && app.attemptCount < 3 && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/appeal/${app.id}`}>Appeal Decision</Link>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center space-y-4">
                <FileText className="w-12 h-12 text-muted mx-auto opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">No Applications Yet</h3>
                  <p className="text-muted mb-4">Start your certification journey by submitting your first application.</p>
                  <Button asChild>
                    <Link href="/apply">Submit Application</Link>
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            {certsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
              </div>
            ) : certificates && certificates.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {certificates.map((cert: any) => (
                  <Card key={cert.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-accent" />
                        <div>
                          <h3 className="font-semibold text-primary">{cert.boardCategory}</h3>
                          <p className="text-xs text-muted">ID: {cert.certificateId}</p>
                        </div>
                      </div>
                      {getCertificateLevelBadge(cert.level)}
                    </div>

                    <div className="space-y-2 py-4 border-t border-border">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Score</span>
                        <span className="font-semibold text-primary">{cert.score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Issued</span>
                        <span className="text-sm text-primary">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Expires</span>
                        <span className="text-sm text-primary">{new Date(cert.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/certificate/${cert.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center space-y-4">
                <Award className="w-12 h-12 text-muted mx-auto opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">No Certificates Yet</h3>
                  <p className="text-muted">Your approved applications will appear here as certificates.</p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Account Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted">Name</label>
                    <p className="text-primary font-medium mt-1">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Email</label>
                    <p className="text-primary font-medium mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Bitcointalk Profile</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted">Username</label>
                    <p className="text-primary font-medium mt-1">{user?.bitcointalkUsername || "Not linked"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Rank</label>
                    <p className="text-primary font-medium mt-1">{user?.bitcointalkRank || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Trust Score</label>
                    <p className="text-primary font-medium mt-1">{user?.trustScore || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted">Member Since</label>
                    <p className="text-primary font-medium mt-1">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <Button variant="outline">Update Profile</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
