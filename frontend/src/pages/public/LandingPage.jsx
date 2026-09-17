import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Award,
  ArrowRight,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Scale,
  FileCheck2,
  QrCode,
  Sparkles,
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useAuth, USER_ROLES } from "../../context/AuthContext";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const [searchId, setSearchId] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify/${searchId.trim().toUpperCase()}`);
    }
  };

  const faqs = [
    {
      q: "Which weighing and measuring instruments require mandatory verification under Legal Metrology?",
      a: "Under the Legal Metrology Act, 2009, all weighing and measuring instruments used in commercial trade, transaction, human health, or industrial production protection (e.g., commercial scales, heavy weighbridges, fuel dispensing pumps, liquid flow meters, storage tank gauges) must undergo mandatory initial verification and periodic re-verification.",
    },
    {
      q: "What is the standard validity period of a Legal Metrology Verification Certificate?",
      a: "Standard verification certificates are valid for 12 months (1 year) for commercial scales, petrol pumps, and weighbridges. High-precision or specialized measures may have custom re-verification intervals set by the State Legal Metrology Controller.",
    },
    {
      q: "What is the difference between an LMO Inspector and a Government Approved Test Centre (GATC)?",
      a: "A Legal Metrology Officer (LMO) is a government inspector authorized directly under the Legal Metrology Department. A Government Approved Test Centre (GATC) is an accredited private/public technical body authorized to perform physical testing and calibration verification on specified classes of instruments under government supervision.",
    },
    {
      q: "What are the penalties for operating an instrument with an expired verification seal?",
      a: "Operating unverified or expired weighing instruments is a punishable offense under Section 24 & Section 33 of the Legal Metrology Act, 2009, incurring mandatory seizure of the instrument and financial penalties up to ₹25,000 per violation.",
    },
    {
      q: "How can the public or inspectors verify a digital certificate?",
      a: "Every digital certificate issued on MaapSetu features a unique QR code and Certificate ID. Anyone can scan the QR code using any smartphone or enter the Certificate ID on the public verification portal to inspect real-time certificate validity.",
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="bg-white border border-neutral-300 rounded-card p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>
              Ministry of Consumer Affairs • Smart India Hackathon 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
            Digital Verification & Certification Platform for Weighing and
            Measuring Instruments
          </h1>

          <p className="text-base text-neutral-600 leading-relaxed">
            MaapSetu streamlines the end-to-end verification lifecycle under
            India's Legal Metrology Act, 2009. Connect instrument owners, LMD
            administrators, and verification officers seamlessly with digital
            applications, and cryptographically verifiable QR certificates.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/login?role=business">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Register as a Business
              </Button>
            </Link>
            <Link to={currentRole === USER_ROLES.BUSINESS ? "/business/applications" : "/login?role=business&redirect=/business/applications"}>
              <Button variant="secondary" size="lg">
                Track an Application
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Certificate Search Bar Widget */}
        <div className="mt-8 pt-6 border-t border-neutral-300">
          <Card className="bg-neutral-100/80 border-neutral-300">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-600">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter Certificate ID to verify (e.g. CERT-2026-8891)..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-input border border-neutral-300 bg-white text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" variant="accent" size="md" icon={QrCode}>
                Verify Certificate
              </Button>
            </form>
            <p className="text-xs text-neutral-600 mt-2">
              Try demo IDs:{" "}
              <button
                type="button"
                onClick={() => setSearchId("CERT-2026-8891")}
                className="text-primary font-mono hover:underline"
              >
                CERT-2026-8891
              </button>{" "}
              (Valid Weighbridge) or{" "}
              <button
                type="button"
                onClick={() => setSearchId("CERT-2025-3310")}
                className="text-danger font-mono hover:underline"
              >
                CERT-2025-3310
              </button>{" "}
              (Expired Fuel Pump).
            </p>
          </Card>
        </div>
      </section>

      {/* Three User Roles Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Platform Ecosystem & Roles
          </h2>
          <p className="text-sm text-neutral-600">
            Unified workflow serving all stakeholders in Legal Metrology
            verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Business / Owner */}
          <Card className="h-full flex flex-col justify-between hover:border-primary/50 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Instrument Owner / Business
              </h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Register instruments manually via a simple digital process
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Submit verification & re-verification applications
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Track inspection status and download digital certificates
                  </span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-neutral-300 mt-4">
              <Link to="/login?role=business">
                <Button variant="secondary" size="sm" className="w-full">
                  Access Owner Portal →
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 2: LMD Administrator */}
          <Card className="h-full flex flex-col justify-between hover:border-primary/50 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                LMD Administrator
              </h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Review incoming applications & inspect documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Assign LMO inspectors and GATC test centres</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Monitor pendency, compliance, and expiring certificates
                  </span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-neutral-300 mt-4">
              <Link to="/login?role=lmd">
                <Button variant="secondary" size="sm" className="w-full">
                  Access Admin Portal →
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 3: LMO / GATC Officer */}
          <Card className="h-full flex flex-col justify-between hover:border-primary/50 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                LMO / GATC Officer
              </h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Access assigned field inspection queue and specs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Record physical observations, seals & MPE error checks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Submit PASS/FAIL decisions and issue digital certificates
                  </span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-neutral-300 mt-4">
              <Link to="/login?role=officer">
                <Button variant="secondary" size="sm" className="w-full">
                  Access Officer Portal →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* How it Works Sequence */}
      <section className="bg-white border border-neutral-300 rounded-card p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">How It Works</h2>
          <p className="text-sm text-neutral-600">
            End-to-end 4-step digital verification workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h4 className="font-semibold text-neutral-900 text-base">
              Register Instrument
            </h4>
            <p className="text-xs text-neutral-600">
              Enter your instrument details securely through our digital forms.
            </p>
          </div>

          <div className="space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h4 className="font-semibold text-neutral-900 text-base">
              Apply for Verification
            </h4>
            <p className="text-xs text-neutral-600">
              Select verification type, upload calibration certificates, and
              request inspection slot.
            </p>
          </div>

          <div className="space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="font-semibold text-neutral-900 text-base">
              Field Inspection
            </h4>
            <p className="text-xs text-neutral-600">
              LMD officer or GATC center conducts physical testing, checks MPE
              error bounds, and attaches lead seals.
            </p>
          </div>

          <div className="space-y-2 relative">
            <div className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-sm">
              4
            </div>
            <h4 className="font-semibold text-neutral-900 text-base">
              Digital Certification
            </h4>
            <p className="text-xs text-neutral-600">
              Upon PASS result, a tamper-proof digital certificate with QR code
              is generated instantly.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-neutral-600">
            Common questions about Legal Metrology rules, verification cycles,
            and certificates.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-neutral-300 rounded-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-neutral-900 text-sm hover:bg-neutral-100/50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
