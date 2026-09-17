import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Sparkles,
  ArrowRight,
  Award,
  Lock,
  FileText,
  Users,
  Star,
  Menu,
  X,
  Building2,
  QrCode,
  Search,
  Camera,
  AlertTriangle,
  Clock,
  UserCheck,
  BookOpen,
  Eye,
  Download,
  Printer,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth, USER_ROLES } from "../context/AuthContext";

export const ComplexLawHomePage = () => {
  const navigate = useNavigate();
  const { certificates } = useData();
  const { currentRole } = useAuth();

  // Navigation & UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  // Act & Rules Preview Reader Modal State
  const [viewingDoc, setViewingDoc] = useState(null);

  // Smooth Scrolling Handler with Sticky Header Offset
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 95;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Quick Verification Widget State
  const [searchCertId, setSearchCertId] = useState("CERT-2026-8891");
  const [searchCategory, setSearchCategory] = useState(
    "Heavy Electronic Weighbridge",
  );
  const [lookupResult, setLookupResult] = useState({
    found: true,
    id: "CERT-2026-8891",
    status: "VERIFIED",
    instrument: "Heavy Electronic Weighbridge (AV-984210-IN)",
    owner: "Apex Logistics & Freight Corp",
    validUntil: "2027-01-19",
    officer: "Inspector Rajesh V. Sharma (Badge #LMO-NGP-442)",
  });

  const handleSearchVerify = (e) => {
    e.preventDefault();
    if (!searchCertId.trim()) return;

    const query = searchCertId.trim().toUpperCase();
    if (query === "CERT-2025-3310") {
      setLookupResult({
        found: true,
        id: "CERT-2025-3310",
        status: "EXPIRED",
        instrument: "Fuel Dispensing Meter (GV-330198-F)",
        owner: "Apex Logistics & Freight Corp",
        validUntil: "2026-08-04 (EXPIRED)",
        officer: "Inspector Harish Chandra (Badge #LMO-AMB-019)",
      });
    } else {
      setLookupResult({
        found: true,
        id: query,
        status: "VERIFIED",
        instrument: `${searchCategory} (SN-2026-X)`,
        owner: "Apex Logistics & Freight Corp",
        validUntil: "2027-03-04",
        officer: "Legal Metrology Officer (Govt Stamped)",
      });
    }
  };

  const actAndRulesList = [
    {
      id: "act-2009",
      title: "Legal Metrology Act, 2009",
      desc: "Central Act regulating weights, measures & commercial instruments across India",
      docType: "Official Government Act (Act No. 1 of 2010)",
      enactmentDate: "14th January, 2010",
      sections: [
        {
          num: "Section 15",
          title: "Power of Inspection, Seizure & Forfeiture",
          text: "Any Legal Metrology Officer may, at all reasonable times, enter any place where weights or measures are manufactured, repaired, or used in commercial transactions to inspect and test compliance.",
        },
        {
          num: "Section 24",
          title: "Mandatory Verification and Stamping",
          text: "Every person having any weight or measure in possession, custody or control in trade shall get such weight or measure verified and stamped before putting it into use, and at prescribed 12-month re-verification intervals.",
        },
        {
          num: "Section 33",
          title: "Penalty for Use of Unverified Weights or Measures",
          text: "Whoever uses any unverified weight or measure in any transaction or industrial measurement shall be punished with fine up to ₹25,000, and for a second offense, imprisonment up to one year.",
        },
      ],
    },
    {
      id: "rules-2011",
      title: "Legal Metrology (General) Rules, 2011",
      desc: "Mandatory verification specifications, Maximum Permissible Error (MPE) tolerances & testing standards",
      docType: "Ministry Statutory Rules (GSR 71(E))",
      enactmentDate: "1st April, 2011",
      sections: [
        {
          num: "Rule 3",
          title: "Accuracy Classes of Weighing Instruments",
          text: "Establishes technical standards for Special Accuracy (Class I), High Accuracy (Class II), Medium Accuracy (Class III), and Ordinary Accuracy (Class IV) weighing scales.",
        },
        {
          num: "Rule 11",
          title: "Maximum Permissible Error (MPE)",
          text: "Defines maximum allowable error limits during initial verification and in-service inspections for weighbridges, retail counter scales, petrol pump meters, and flowmeters.",
        },
        {
          num: "Rule 18",
          title: "Provisions for Lead Sealing & Digital QR Stamps",
          text: "Mandates tamper-proof lead sealing on adjustment mechanisms and affixing of cryptographically signed digital QR verification certificates.",
        },
      ],
    },
    {
      id: "state-rules",
      title: "State Legal Metrology Rules",
      desc: "Statewise enforcement regulations, licensing procedures & verification fee schedules",
      docType: "State Legal Metrology Department Gazette",
      enactmentDate: "State Specific Guidelines",
      sections: [
        {
          num: "Rule 5",
          title: "Licensing of Manufacturers, Dealers & Repairers",
          text: "Regulates mandatory state licensing for commercial dealers, manufacturers, and repairers of weighing and measuring instruments.",
        },
        {
          num: "Rule 9",
          title: "Verification Fee & Stamping Charge Schedules",
          text: "Prescribes official government fee rates for field inspection, verification, and stamping based on instrument capacity (e.g. Weighbridge up to 100t, Fuel Dispenser nozzles).",
        },
        {
          num: "Rule 16",
          title: "Appeals, Compounding & Inspection Roster",
          text: "Outlines procedures for departmental appeals against inspection rejection, compounding of offenses, and assignment of Government Approved Test Centres (GATC).",
        },
      ],
    },
  ];

  // Local Download Handler
  const handleDownloadDoc = (e, doc) => {
    e.preventDefault();
    e.stopPropagation();

    let textContent = `====================================================================
${doc.title.toUpperCase()}
${doc.docType.toUpperCase()}
MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
GOVERNMENT OF INDIA
====================================================================

Enactment Date: ${doc.enactmentDate}
Description: ${doc.desc}

KEY SECTIONS & STATUTORY PROVISIONS:

`;

    doc.sections.forEach((sec) => {
      textContent += `[ ${sec.num} - ${sec.title} ]\n${sec.text}\n\n`;
    });

    textContent += `--------------------------------------------------------------------
Verified & Certified by MaapSetu Legal Metrology Platform (SIH 26036)
Central Registry Reference: ${doc.id}
--------------------------------------------------------------------`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const faqs = [
    {
      q: "Which weighing and measuring instruments require mandatory verification on MaapSetu?",
      a: "Under the Legal Metrology Act, 2009 and Rules 2011, all commercial weighing instruments (retail scales, weighbridges, warehouse platform scales) and measuring devices (petrol pumps, flowmeters, tank measures) used in trade or transaction require mandatory initial verification and annual re-verification.",
    },
    {
      q: "What is the difference between an LMO Inspector and a Government Approved Test Centre (GATC)?",
      a: "A Legal Metrology Officer (LMO) is a government inspector authorized directly under the Legal Metrology Department. A Government Approved Test Centre (GATC) is an accredited private/public technical body authorized to perform physical testing and calibration verification on specified classes of instruments under government supervision.",
    },
    {
      q: "How can anyone verify a digital verification certificate using the QR code?",
      a: "Every digital certificate issued on MaapSetu features a unique QR code and Certificate ID. Anyone can scan the QR code using any smartphone or enter the Certificate ID on the public verification portal to inspect real-time certificate validity.",
    },
    {
      q: "What are the penalties for operating an unverified or expired instrument?",
      a: "Operating unverified or expired weighing instruments is a punishable offense under Section 24 & Section 33 of the Legal Metrology Act, 2009, incurring mandatory seizure of the instrument and financial penalties up to ₹25,000 per violation.",
    },
  ];

  return (
    <div className="w-full bg-[#FDF9F6] text-[#003943] font-sans antialiased min-h-screen selection:bg-[#02B7BF] selection:text-white overflow-x-hidden">
      {/* 1. MAIN NAVIGATION BAR */}
      <header className="w-full relative z-40 bg-[#FDF9F6] border-b border-[#003943]/10 px-4 py-6 sm:py-7 shadow-sm">
        <div className="w-full flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#003943] text-[#02B7BF] flex items-center justify-center shadow-lg group-hover:bg-[#002B33] transition-all transform group-hover:scale-105">
              <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-[#02B7BF]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#003943] font-serif">
                Maap
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#00959C] font-serif italic">
                Setu
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-base sm:text-lg font-bold text-[#003943]">
            {/* User Portals Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2 hover:text-[#00959C] transition-colors py-2 font-extrabold"
              >
                <span>User Portals</span>
                <ChevronDown className="w-5 h-5 text-[#003943]/70 group-hover:text-[#00959C] transition-transform group-hover:rotate-180" />
              </button>

              {/* Mega Menu Dropdown */}
              <div className="absolute top-full -left-12 w-[580px] bg-[#FDF9F6] border border-[#003943]/15 rounded-3xl shadow-2xl p-7 hidden group-hover:grid grid-cols-2 gap-8 z-50 animate-in fade-in duration-150">
                <div className="space-y-4">
                  <p className="text-xs uppercase font-extrabold tracking-wider text-[#00959C] flex items-center gap-2 pb-2 border-b border-[#003943]/10">
                    <Building2 className="w-4 h-4" /> Instrument Owners
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#003943]/90">
                    <li>
                      <Link
                        to="/login?role=business"
                        className="hover:text-[#00959C] font-bold block text-base"
                      >
                        Business Owner Portal
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login?role=business"
                        className="hover:text-[#00959C] block font-medium"
                      >
                        Register Instrument
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login?role=business"
                        className="hover:text-[#00959C] block font-medium"
                      >
                        Submit Verification Request
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login?role=business"
                        className="hover:text-[#00959C] block font-medium"
                      >
                        My Digital Certificates
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <p className="text-xs uppercase font-extrabold tracking-wider text-[#00959C] flex items-center gap-2 pb-2 border-b border-[#003943]/10">
                    <ShieldCheck className="w-4 h-4" /> LMD Authorities &
                    Officers
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#003943]/90">
                    <li>
                      <Link
                        to="/login?role=lmd"
                        className="hover:text-[#00959C] font-bold block text-base"
                      >
                        LMD Administrator Portal
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login?role=officer"
                        className="hover:text-[#00959C] font-bold block text-base"
                      >
                        LMO / GATC Officer Queue
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login?role=lmd"
                        className="hover:text-[#00959C] block font-medium"
                      >
                        Review Applications Queue
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login?role=lmd"
                        className="hover:text-[#00959C] block font-medium"
                      >
                        Statewide Compliance Records
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ACT & RULES HOVER DROPDOWN (NAVBAR) */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-[#00959C] transition-colors py-2 font-extrabold text-[#003943]"
              >
                <BookOpen className="w-5 h-5 text-[#00959C]" />
                <span>Act & Rules</span>
                <ChevronDown className="w-4 h-4 text-[#003943]/70 group-hover:text-[#00959C] transition-transform group-hover:rotate-180" />
              </button>

              {/* Act & Rules Hover Popover Menu */}
              <div className="absolute top-full right-0 lg:-left-24 w-[420px] bg-[#FDF9F6] border border-[#003943]/20 rounded-2xl shadow-2xl p-5 hidden group-hover:block z-50 animate-in fade-in duration-150 space-y-4">
                <div className="pb-3 border-b border-[#003943]/10 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#00959C] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Official Legal Framework
                  </span>
                  <span className="text-[10px] bg-[#003943]/10 text-[#003943] px-2 py-0.5 rounded font-mono font-bold">
                    GOVT GAZETTE
                  </span>
                </div>

                <div className="space-y-4">
                  {actAndRulesList.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-white rounded-xl border border-[#003943]/10 space-y-2 hover:border-[#00959C]/40 transition-colors"
                    >
                      <div>
                        <h4 className="font-serif font-bold text-[#003943] text-sm sm:text-base leading-snug">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-[#003943]/70 leading-relaxed mt-0.5">
                          {doc.desc}
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#003943]/5">
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E0F5F6] text-[#003943] font-bold text-xs hover:bg-[#00959C] hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadDoc(e, doc)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#003943] text-white font-bold text-xs hover:bg-[#002B33] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-[#02B7BF]" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="#verify-widget"
              onClick={(e) => handleSmoothScroll(e, "verify-widget")}
              className="hover:text-[#00959C] font-extrabold transition-colors text-[#00959C]"
            >
              Verify QR Certificate
            </a>

            <a
              href="#services"
              onClick={(e) => handleSmoothScroll(e, "services")}
              className="hover:text-[#00959C] transition-colors font-bold"
            >
              Core Modules
            </a>

            <a
              href="#rules"
              onClick={(e) => handleSmoothScroll(e, "rules")}
              className="hover:text-[#00959C] transition-colors font-bold"
            >
              Rules & Compliance
            </a>

            <a
              href="#faq"
              onClick={(e) => handleSmoothScroll(e, "faq")}
              className="hover:text-[#00959C] transition-colors font-bold"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="dashed-border-btn inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#E0F5F6] text-[#003943] font-extrabold text-base sm:text-lg hover:bg-[#00959C] hover:text-white transition-all shadow-sm"
            >
              <span>Portal Login</span>
              <div className="w-7 h-7 rounded-full bg-[#003943] text-white flex items-center justify-center text-sm group-hover:bg-white group-hover:text-[#00959C] transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-2xl text-[#003943] hover:bg-[#003943]/10 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FDF9F6] border-t border-[#003943]/10 px-6 py-8 space-y-5 shadow-2xl animate-in slide-in-from-top duration-200">
            <Link
              to="/login?role=business"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-bold text-[#00959C] py-2 border-b border-[#003943]/10"
            >
              Business Owner Portal
            </Link>
            <Link
              to="/login?role=lmd"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-bold text-[#003943] py-2 border-b border-[#003943]/10"
            >
              LMD Administrator Portal
            </Link>
            <Link
              to="/login?role=officer"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-bold text-[#003943] py-2 border-b border-[#003943]/10"
            >
              LMO / GATC Officer Queue
            </Link>

            {/* Act & Rules Mobile Accordion */}
            <div className="py-2 border-b border-[#003943]/10 space-y-3">
              <span className="block text-lg font-bold text-[#003943]">
                Act & Rules
              </span>
              <div className="space-y-2 pl-2">
                {actAndRulesList.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white rounded-xl border border-[#003943]/10 space-y-1.5"
                  >
                    <p className="font-bold text-xs text-[#003943]">
                      {doc.title}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setViewingDoc(doc);
                        }}
                        className="px-2.5 py-1 bg-[#E0F5F6] text-[#003943] font-bold text-[11px] rounded"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadDoc(e, doc)}
                        className="px-2.5 py-1 bg-[#003943] text-white font-bold text-[11px] rounded"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="#verify-widget"
              onClick={(e) => handleSmoothScroll(e, "verify-widget")}
              className="block text-lg font-bold text-[#00959C] py-2 border-b border-[#003943]/10"
            >
              Public QR Verification
            </a>
            <a
              href="#services"
              onClick={(e) => handleSmoothScroll(e, "services")}
              className="block text-lg font-bold text-[#003943] py-2 border-b border-[#003943]/10"
            >
              Core Modules
            </a>
            <a
              href="#rules"
              onClick={(e) => handleSmoothScroll(e, "rules")}
              className="block text-lg font-bold text-[#003943] py-2 border-b border-[#003943]/10"
            >
              Rules & Compliance
            </a>
            <a
              href="#faq"
              onClick={(e) => handleSmoothScroll(e, "faq")}
              className="block text-lg font-bold text-[#003943] py-2"
            >
              FAQ
            </a>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="w-full pt-12 pb-24 px-6 sm:px-12 lg:px-20 2xl:px-24 bg-[#FDF9F6] relative overflow-hidden">
        <div className="w-full max-w-6xl mx-auto text-center space-y-6 relative z-10">
          {/* Main Hero Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-[#003943] tracking-tight leading-[1.08]">
              Making Instrument Verification <br className="hidden sm:inline" />
              <span className="relative inline-block font-serif italic text-[#00959C]">
                Simple
                <svg
                  viewBox="0 0 257 20"
                  fill="none"
                  className="absolute left-0 -bottom-3 w-full h-6 text-[#00959C]"
                >
                  <path
                    d="M109.8 10.4C117 9.9 124.2 9.4 131.4 9C157.6 7.4 183.8 5.6 210.1 5.4C223.3 5.4 236.5 5.9 249.7 8C251.7 8.4 253.7 8.9 255.7 9.4C256.2 9.5 257 9.8 256.9 10.6C256.9 11.4 256.1 11.4 255.5 11.5C254.7 11.6 253.8 11.6 253 11.6C235 11.4 217 10.7 199 11.2C154.5 12.5 110.1 14.7 65.7 18.4C61.5 18.8 57.3 19.4 53.1 19.9C52.8 19.9 52.4 20 52 19.9C50.9 19.9 50.1 19.4 49.9 18.1C49.8 16.9 50.4 16 51.5 15.8C53.2 15.4 55 15.2 56.7 15C76 12.8 95.1 9.3 114.1 5C115.6 4.6 127.8 4.5 122 4.1C112.2 3.4 102.4 3.9 92.6 4.5C79.4 5.3 66.2 6.5 53.1 8C39.5 9.6 26 11.3 12.7 14.9C9 15.9 5.5 17.2 2.2 19.2C1.6 19.6 0.6 20.3 0.1 19.4C-0.3 18.6 0.6 17.9 1.2 17.4C3.5 15.5 6.2 14.4 9 13.4C16.9 10.6 25.2 9 33.4 7.7C55.5 4.1 77.8 1.9 100.1 0.5C108 0 115.9-0.2 123.9 0.3C125.4 0.5 127 0.7 128.5 1.3C131.7 2.6 130 3.3 129.1 4C127.7 5.1 126 5.7 124.4 6.3C119.6 8 114.7 9 109.8 10.4Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="max-w-4xl mx-auto text-base sm:text-xl text-[#003943]/85 leading-relaxed font-normal">
            Streamlining India's Legal Metrology verification lifecycle for
            weighing and measuring instruments. Connect instrument owners, LMD
            administrators, and verification officers seamlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/login?role=business"
              className="dashed-border-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#E0F5F6] text-[#003943] font-bold text-base hover:bg-[#00959C] hover:text-white transition-all shadow-md"
            >
              <Camera className="w-5 h-5 text-[#00959C] group-hover:text-white" />
              <span>Register Instrument</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>

            <Link
              to={currentRole === USER_ROLES.BUSINESS ? "/business/applications" : "/login?role=business&redirect=/business/applications"}
              className="dashed-border-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-[#003943] font-bold text-base hover:border-[#00959C] hover:text-[#00959C] transition-all shadow-md"
            >
              <FileText className="w-5 h-5 text-[#003943]" />
              <span>Track Application Status</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* HIGH-RES ISOMETRIC WORKFLOW IMAGE CONTAINER (STATIC CLEAN IMAGE) */}
        <div className="w-full max-w-[1500px] mx-auto mt-12 px-2 sm:px-4 relative">
          <div className="w-full bg-white rounded-3xl p-4 sm:p-8 shadow-xl border border-[#003943]/15 relative overflow-hidden">
            <img
              src="/maapsetu_hero_workflow.png"
              alt="MaapSetu End-to-End Legal Metrology Verification Workflow"
              className="w-full h-auto object-cover rounded-2xl shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* 4. INFINITE MEDIA & REGULATORY TICKER */}
      <section className="w-full py-6 border-y border-[#003943]/10 bg-white/60 overflow-hidden">
        <div className="w-full px-4 mb-3 text-center">
          <p className="text-[11px] font-bold tracking-widest text-[#003943]/50 uppercase">
            Built Around Legal Metrology Framework Standards & Ministry
            Compliance
          </p>
        </div>
        <div className="flex overflow-hidden whitespace-nowrap space-x-12 select-none py-2">
          <div className="flex space-x-12 items-center text-[#003943]/70 font-bold text-sm tracking-wider animate-marquee">
            <span>BUILT AROUND MINISTRY OF CONSUMER AFFAIRS</span> •{" "}
            <span>BUILT AROUND LEGAL METROLOGY ACT, 2009</span> •{" "}
            <span>BUILT AROUND RULES 2011 COMPLIANT</span> •{" "}
            <span className="text-[#00959C]">
              BUILT AROUND SIH PROBLEM STATEMENT 26036
            </span>{" "}
            • <span>BUILT AROUND GATC APPROVED TEST CENTRES</span> •{" "}
            <span>
              BUILT AROUND NATIONAL PHYSICAL LABORATORY (NPL) CALIBRATION
            </span>{" "}
            • <span>BUILT AROUND ISO/IEC 17025 ACCREDITATION</span>
          </div>
          <div
            className="flex space-x-12 items-center text-[#003943]/70 font-bold text-sm tracking-wider animate-marquee"
            aria-hidden="true"
          >
            <span>BUILT AROUND MINISTRY OF CONSUMER AFFAIRS</span> •{" "}
            <span>BUILT AROUND LEGAL METROLOGY ACT, 2009</span> •{" "}
            <span>BUILT AROUND RULES 2011 COMPLIANT</span> •{" "}
            <span className="text-[#00959C]">
              BUILT AROUND SIH PROBLEM STATEMENT 26036
            </span>{" "}
            • <span>BUILT AROUND GATC APPROVED TEST CENTRES</span> •{" "}
            <span>
              BUILT AROUND NATIONAL PHYSICAL LABORATORY (NPL) CALIBRATION
            </span>{" "}
            • <span>BUILT AROUND ISO/IEC 17025 ACCREDITATION</span>
          </div>
        </div>
      </section>

      {/* 5. SERVICES SECTION */}
      <section
        id="services"
        className="w-full py-24 px-6 sm:px-12 lg:px-20 2xl:px-24 space-y-14"
      >
        <div className="text-center space-y-3 max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#003943]">
            Verification workflows{" "}
            <em className="italic text-[#00959C]">tailored to your role</em>
          </h2>
          <p className="text-base sm:text-lg text-[#003943]/80 leading-relaxed">
            MaapSetu connects all stakeholders in the Legal Metrology ecosystem
            — Business Owners, LMD Authorities, and LMO/GATC Inspection
            Officers.
          </p>
        </div>

        {/* 3 Interactive Portal Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Instrument Owner / Business */}
          <div className="card-hover-tilt group relative bg-[#F9ECEB] rounded-3xl p-8 sm:p-10 border-2 border-dashed border-[#552019]/25 hover:border-[#552019] shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#552019]/10 text-[#552019] flex items-center justify-center font-bold">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#552019]">
                Instrument Owner
              </h3>
              <p className="text-sm sm:text-base text-[#552019]/80 leading-relaxed">
                Register weighing & measuring instruments manually via a simple
                digital process. Submit verification applications, track live
                status, and download stamped digital certificates.
              </p>
            </div>
            <div className="pt-8">
              <Link
                to="/login?role=business"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#552019] group-hover:underline"
              >
                Access Business Portal <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Card 2: LMD Administrator */}
          <div className="card-hover-tilt group relative bg-white rounded-3xl p-8 sm:p-10 border-2 border-dashed border-[#003943]/20 hover:border-[#00959C] shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00959C]/10 text-[#00959C] flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#003943]">
                LMD Administrator
              </h3>
              <p className="text-sm sm:text-base text-[#003943]/80 leading-relaxed">
                Review incoming business applications, verify calibration
                reports, assign LMO inspectors or GATC testing centers, and
                monitor pendency analytics statewide.
              </p>
            </div>
            <div className="pt-8">
              <Link
                to="/login?role=lmd"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#00959C] group-hover:underline"
              >
                Access LMD Admin Portal <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Card 3: LMO / GATC Officer */}
          <div className="card-hover-tilt group relative bg-[#EAF6F8] rounded-3xl p-8 sm:p-10 border-2 border-dashed border-[#00959C]/30 hover:border-[#00959C] shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00959C] text-white flex items-center justify-center font-bold">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#003943]">
                LMO / GATC Officer
              </h3>
              <p className="text-sm sm:text-base text-[#003943]/80 leading-relaxed">
                Access field inspection queue, record visual lead seal
                intactness, test Maximum Permissible Error (MPE) tolerances,
                upload photo evidence, and submit PASS/FAIL outcomes.
              </p>
            </div>
            <div className="pt-8">
              <Link
                to="/login?role=officer"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#00959C] group-hover:underline"
              >
                Access Officer Queue <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR PROMISE SECTION */}
      <section
        id="rules"
        className="w-full py-20 px-6 sm:px-12 lg:px-20 2xl:px-24 bg-white border-y border-[#003943]/10"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F5F6] text-[#00959C] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Platform Guarantee
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#003943] leading-tight">
              Legal Metrology is{" "}
              <em className="italic text-[#00959C]">complex</em>, but your
              compliance doesn’t have to be
            </h2>
            <p className="text-base sm:text-lg text-[#003943]/80 leading-relaxed">
              We translate regulatory Legal Metrology rules into a seamless
              4-step digital workflow — keeping your commercial instruments
              verified, stamped, and fully compliant.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-[#FDF9F6] rounded-2xl border border-[#003943]/10 space-y-2 hover:border-[#00959C] transition-colors">
              <QrCode className="w-7 h-7 text-[#00959C]" />
              <h4 className="font-bold text-[#003943] text-lg">
                Tamper-Proof QR Stamps
              </h4>
              <p className="text-xs sm:text-sm text-[#003943]/70">
                Verifiable digital certificates with instant QR lookup.
              </p>
            </div>

            <div className="p-6 bg-[#FDF9F6] rounded-2xl border border-[#003943]/10 space-y-2 hover:border-[#00959C] transition-colors">
              <Clock className="w-7 h-7 text-[#00959C]" />
              <h4 className="font-bold text-[#003943] text-lg">
                Expiry & Renewal Alerts
              </h4>
              <p className="text-xs sm:text-sm text-[#003943]/70">
                Automated reminders prior to 12-month re-verification deadlines.
              </p>
            </div>

            <div className="p-6 bg-[#FDF9F6] rounded-2xl border border-[#003943]/10 space-y-2 hover:border-[#00959C] transition-colors">
              <Award className="w-7 h-7 text-[#00959C]" />
              <h4 className="font-bold text-[#003943] text-lg">
                GATC & LMO Roster
              </h4>
              <p className="text-xs sm:text-sm text-[#003943]/70">
                Unified assignment of government inspectors and approved test
                centres.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SPOTLIGHT: PUBLIC CERTIFICATE VERIFICATION SEARCH WIDGET */}
      <section
        id="verify-widget"
        className="w-full py-20 px-6 sm:px-12 lg:px-20 2xl:px-24"
      >
        <div className="w-full bg-[#003943] text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-[#00959C]/40 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00959C]/30 text-emerald-300 text-xs font-semibold">
                <QrCode className="w-4 h-4" /> Public Certificate Verification
                Registry
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                Verify any Legal Metrology <br />
                <span className="text-[#02B7BF] italic">
                  Certificate & Lead Seal
                </span>
              </h2>

              <p className="text-base sm:text-lg text-[#E0F5F6]/85 leading-relaxed">
                Scan the QR code printed on physical instrument verification
                certificates or query the central registry using Certificate ID.
              </p>

              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-[#E0F5F6]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant
                  Public Lookup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No Login
                  Required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Official
                  Lead Seal Verification
                </span>
              </div>
            </div>

            {/* Quick QR Lookup Widget */}
            <div className="lg:col-span-5 bg-[#FDF9F6] text-[#003943] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#003943]/20 space-y-4">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#003943]">
                Instant Certificate Lookup
              </h3>

              <form onSubmit={handleSearchVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#003943]/70 mb-1">
                    Instrument Category
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full bg-white border border-[#003943]/20 rounded-lg p-2.5 text-xs font-semibold text-[#003943]"
                  >
                    <option value="Heavy Electronic Weighbridge">
                      Heavy Electronic Weighbridge
                    </option>
                    <option value="Retail Digital Counter Scale">
                      Retail Digital Counter Scale
                    </option>
                    <option value="Fuel Dispensing Meter">
                      Fuel Dispensing Meter (Multi-Product)
                    </option>
                    <option value="Industrial Flowmeter">
                      Industrial Liquid Flowmeter
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#003943]/70 mb-1">
                    Certificate ID
                  </label>
                  <input
                    type="text"
                    value={searchCertId}
                    onChange={(e) => setSearchCertId(e.target.value)}
                    placeholder="e.g. CERT-2026-8891 or CERT-2025-3310"
                    className="w-full bg-white border border-[#003943]/20 rounded-lg p-2.5 text-xs font-mono font-bold uppercase text-[#003943]"
                  />
                  <p className="text-[10px] text-[#003943]/60 mt-1">
                    Try demo IDs:{" "}
                    <button
                      type="button"
                      onClick={() => setSearchCertId("CERT-2026-8891")}
                      className="text-[#00959C] underline"
                    >
                      CERT-2026-8891
                    </button>{" "}
                    (Valid) or{" "}
                    <button
                      type="button"
                      onClick={() => setSearchCertId("CERT-2025-3310")}
                      className="text-danger underline"
                    >
                      CERT-2025-3310
                    </button>{" "}
                    (Expired).
                  </p>
                </div>

                {lookupResult && (
                  <div className="p-4 bg-[#E0F5F6] rounded-xl border border-[#00959C]/30 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-[#003943]">
                        {lookupResult.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${lookupResult.status === "VERIFIED" ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"}`}
                      >
                        {lookupResult.status}
                      </span>
                    </div>
                    <p className="font-bold text-[#003943]">
                      {lookupResult.instrument}
                    </p>
                    <p className="text-[11px] text-[#003943]/70">
                      Owner: {lookupResult.owner}
                    </p>
                    <p className="text-[11px] text-[#003943]/70">
                      Valid Until:{" "}
                      <span className="font-semibold text-[#003943]">
                        {lookupResult.validUntil}
                      </span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#00959C] hover:bg-[#003943] text-[#FDF9F6] font-semibold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify Full Certificate Record</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section
        id="faq"
        className="w-full py-24 px-6 sm:px-12 lg:px-20 2xl:px-24 bg-white border-t border-[#003943]/10"
      >
        <div className="w-full space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#003943]">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-xl text-[#003943]/70 font-normal">
              Everything you need to know about Legal Metrology rules and
              MaapSetu verification.
            </p>
          </div>

          <div className="w-full space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`w-full border rounded-2xl overflow-hidden transition-all duration-300 shadow-xs ${
                    isOpen
                      ? "border-[#00959C] bg-[#FDF9F6] shadow-md ring-1 ring-[#00959C]/30"
                      : "border-[#003943]/15 bg-white hover:border-[#00959C]/40 hover:bg-[#FDF9F6]/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between gap-6 font-serif font-bold text-lg sm:text-xl text-[#003943] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "bg-[#00959C] text-white rotate-180"
                          : "bg-[#E0F5F6] text-[#003943]"
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {/* Butter-Smooth Height Grid Animation */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-8 pb-7 pt-2 text-base sm:text-lg text-[#003943]/85 leading-relaxed border-t border-[#003943]/10 font-normal">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FOOTER CTA BANNER */}
      <footer id="contact" className="w-full bg-[#002B33] text-[#E0F5F6] py-16">
        <div className="w-full px-6 sm:px-12 lg:px-20 2xl:px-24">
          <div className="w-full bg-[#003943] p-8 sm:p-14 rounded-3xl border border-[#00959C]/40 text-center space-y-6 shadow-2xl relative">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white">
              Digitizing trust in{" "}
              <em className="italic text-[#02B7BF]">every measurement</em>
            </h2>
            <p className="text-sm sm:text-base text-[#E0F5F6]/80 max-w-xl mx-auto">
              Start your instrument verification application online or sign in
              to your departmental portal.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-20">
              <Link
                to="/login?role=business"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#02B7BF] hover:bg-white text-[#003943] font-bold text-base transition-colors shadow-lg"
              >
                <span>Business Owner Login</span>
                <ArrowUpRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login?role=lmd"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-base transition-colors"
              >
                <span>LMD Admin & Inspector Login</span>
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* 10. IN-APP LEGAL METROLOGY ACT & RULES VIEWER MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-[#003943]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#FDF9F6] text-[#003943] rounded-3xl shadow-2xl border border-[#00959C]/40 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-[#003943] text-white flex items-center justify-between border-b border-[#00959C]/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#02B7BF] text-[#003943] flex items-center justify-center font-bold">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                    {viewingDoc.title}
                  </h3>
                  <p className="text-xs text-[#E0F5F6]/80 flex items-center gap-2">
                    <span>{viewingDoc.docType}</span> •{" "}
                    <span>Enactment: {viewingDoc.enactmentDate}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Viewer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body / Legal Text Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-sm sm:text-base leading-relaxed">
              <div className="p-4 bg-[#E0F5F6] border border-[#00959C]/30 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#00959C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#003943] text-sm">
                    Official Legal Metrology Department Reference
                  </h4>
                  <p className="text-xs text-[#003943]/80 mt-0.5">
                    {viewingDoc.desc}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-serif font-bold text-[#003943] border-b border-[#003943]/10 pb-2">
                  Statutory Provisions & Key Rules
                </h4>

                {viewingDoc.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white rounded-2xl border border-[#003943]/15 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-[#003943] text-white text-xs font-mono font-bold">
                        {sec.num}
                      </span>
                      <span className="text-xs font-semibold text-[#00959C]">
                        Govt Certified Standard
                      </span>
                    </div>
                    <h5 className="font-bold text-[#003943] text-base sm:text-lg">
                      {sec.title}
                    </h5>
                    <p className="text-xs sm:text-sm text-[#003943]/80 leading-relaxed">
                      {sec.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 bg-[#F4F8F9] border-t border-[#003943]/10 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <span className="text-xs text-[#003943]/60 font-mono">
                MaapSetu Digital Registry • Ref #{viewingDoc.id}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleDownloadDoc(e, viewingDoc)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003943] text-white font-bold text-xs hover:bg-[#002B33] transition-colors"
                >
                  <Download className="w-4 h-4 text-[#02B7BF]" />
                  <span>Download File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-200 text-[#003943] font-bold text-xs hover:bg-gray-300 transition-colors"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
