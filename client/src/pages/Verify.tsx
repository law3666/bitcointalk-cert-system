import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2, QrCode } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Verify() {
  const [certificateId, setCertificateId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);

  const { data: certificate, isLoading: isVerifying } = trpc.certificates.getByCertificateId.useQuery(
    { certificateId: searchId },
    { enabled: !!searchId }
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      toast.error("Please enter a certificate ID");
      return;
    }
    setSearchId(certificateId.trim());
  };

  const getCertificateLevelColor = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-amber-50 border-amber-200";
      case "Silver":
        return "bg-gray-50 border-gray-200";
      case "Bronze":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getCertificateLevelBadge = (level: string) => {
    switch (level) {
      case "Gold":
        return <Badge className="bg-amber-100 text-amber-700">Gold (90-100)</Badge>;
      case "Silver":
        return <Badge className="bg-gray-100 text-gray-700">Silver (80-89)</Badge>;
      case "Bronze":
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
          <h1 className="text-3xl font-bold text-primary">Verify Certificate</h1>
          <p className="text-muted mt-1">Validate the authenticity of Bitcointalk certification credentials</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12 max-w-2xl">
        {!certificate ? (
          <Card className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="certificateId" className="text-base font-semibold">
                  Certificate ID or QR Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="certificateId"
                    placeholder="e.g., BT-2026-00001"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={() => setShowQrScanner(!showQrScanner)}>
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted">Enter the certificate ID found on the certificate or scan the QR code</p>
              </div>

              {showQrScanner && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">QR code scanner would be integrated here</p>
                </div>
              )}

              <Button type="submit" disabled={isVerifying} className="w-full">
                {isVerifying ? "Verifying..." : "Verify Certificate"}
              </Button>
            </form>

            {/* Info Section */}
            <div className="mt-12 pt-8 border-t border-border space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">How to Verify</h3>
                <div className="space-y-3">
                  {[
                    "Find the Certificate ID on the certificate (format: BT-YYYY-NNNNN)",
                    "Enter it in the field above or scan the QR code",
                    "Our system will instantly verify the certificate's authenticity",
                    "View detailed information about the certification",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-semibold">
                        {i + 1}
                      </div>
                      <p className="text-muted pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Certification Levels</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { level: "Bronze", score: "70-79", desc: "Solid expertise" },
                    { level: "Silver", score: "80-89", desc: "Strong expertise" },
                    { level: "Gold", score: "90-100", desc: "Outstanding expertise" },
                  ].map((item) => (
                    <Card key={item.level} className="p-4 text-center">
                      <p className="font-semibold text-primary mb-1">{item.level}</p>
                      <p className="text-2xl font-bold text-secondary mb-2">{item.score}</p>
                      <p className="text-sm text-muted">{item.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Certificate Verified</h3>
                  <p className="text-sm text-green-800">This is a valid and authentic Bitcointalk certification</p>
                </div>
              </div>
            </Card>

            {/* Certificate Details */}
            <Card className={`p-8 border-2 ${getCertificateLevelColor(certificate.level)}`}>
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <Award className="w-16 h-16 text-accent" />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-primary mb-2">Bitcointalk Certification</h2>
                  <p className="text-muted">Community-Verified Expertise</p>
                </div>

                <div className="flex justify-center">
                  {getCertificateLevelBadge(certificate.level)}
                </div>

                <div className="grid md:grid-cols-2 gap-8 py-6 border-t border-b border-border/50">
                  <div>
                    <p className="text-sm text-muted mb-1">Certification Score</p>
                    <p className="text-4xl font-bold text-secondary">{certificate.finalScore}</p>
                    <p className="text-xs text-muted mt-1">out of 100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Certificate ID</p>
                    <p className="text-lg font-mono font-bold text-primary">{certificate.certificateId}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted mb-1">Issued</p>
                    <p className="font-medium text-primary">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Expires</p>
                    <p className="font-medium text-primary">{certificate.expiresAt ? new Date(certificate.expiresAt).toLocaleDateString() : "Never"}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button onClick={() => { setCertificateId(""); setSearchId(""); }} className="w-full">
              Verify Another Certificate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
