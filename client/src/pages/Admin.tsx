import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { BarChart3, Users, Award, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const { data: stats } = trpc.admin.getStats.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted mt-1">Manage the certification system</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Total Applications</p>
              <BarChart3 className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats?.totalApplications || 0}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Pending Review</p>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats?.pendingApplications || 0}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Total Appeals</p>
              <Award className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats?.totalAppeals || 0}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Total Evaluators</p>
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats?.totalEvaluators || 0}</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="evaluators" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="evaluators">Evaluators</TabsTrigger>
            <TabsTrigger value="appeals">Appeals</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          {/* Evaluators Tab */}
          <TabsContent value="evaluators" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Evaluator Management</h3>
              <div className="space-y-3">
                <p className="text-muted">Manage evaluator eligibility and status</p>
                <Button variant="outline">View Evaluators</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Appeals Tab */}
          <TabsContent value="appeals" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Appeal Management</h3>
              <div className="space-y-3">
                <p className="text-muted">Review and manage certification appeals</p>
                <Button variant="outline">View Appeals</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Quality Metrics</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted mb-2">Total Applications</p>
                    <p className="text-2xl font-bold text-secondary">{stats?.totalApplications || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">Pending Applications</p>
                    <p className="text-2xl font-bold text-secondary">{stats?.pendingApplications || 0}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
