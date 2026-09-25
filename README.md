# Metrika

### Digital Verification & Certification Platform for Weighing and Measuring Instruments

**Team Delmora**
**Smart India Hackathon 2026 — Problem Statement 26036**

---

## 📌 About the Project

**Metrika** is a secure digital platform designed to streamline and manage the verification and re-verification lifecycle of weighing and measuring instruments under the Legal Metrology framework.

The platform connects **instrument owners, Legal Metrology Departments (LMDs), Legal Metrology Officers (LMOs), and Government Approved Test Centres (GATCs)** through a unified digital workflow.

Instead of relying heavily on fragmented/manual processes for applications, scheduling, verification records, certificates, and expiry tracking, Metrika provides a centralized digital system for managing these activities.

> **Physical verification remains the responsibility of authorized officers/GATCs. Metrika digitizes the workflow, records, evidence, certification and lifecycle management surrounding that verification.**

---

## 🎯 Problem Statement

### SIH 26036

**Development of an Online Verification System for Weighing and Measuring Instruments**

Under the Legal Metrology Act, 2009 and the Legal Metrology (General) Rules, 2011, weighing and measuring instruments used in regulated transactions are required to be periodically verified and stamped.

Existing processes can involve:

* Manual application submission
* Physical documentation
* Manual scheduling
* Assignment of verification activities
* Physical inspection
* Manual recording of observations
* Certificate management
* Difficulty tracking expiry and re-verification
* Fragmented records and systems

The objective of Metrika is to bring these workflows into a unified digital platform.

---

# 🚀 Our Solution

Metrika provides an end-to-end digital workflow:

```text
Instrument Owner
       │
       ▼
Register Instrument
       │
       ▼
Submit Verification Request
       │
       ▼
LMD Reviews Application
       │
       ▼
Assign LMO / GATC
       │
       ▼
Schedule Verification
       │
       ▼
Physical Verification
       │
       ▼
LMO / GATC Records Result
       │
       ├───────────────┐
       ▼               ▼
     PASS             FAIL
       │               │
       ▼               ▼
Digital           Rework /
Certificate       Re-verification
       │
       ▼
QR Verification
       │
       ▼
Expiry & Re-verification Tracking
```

---

# 👥 User Roles

## 🏪 Instrument Owner / Business

The instrument owner can:

* Register an instrument
* Submit verification/re-verification applications
* Upload documents and photographs
* Track application status
* View verification history
* Download digital certificates
* Check certificate validity
* Receive expiry reminders

---

## 🏛️ LMD Administrator

The Legal Metrology Department administrator can:

* View incoming applications
* Review submitted information
* Process applications
* Assign LMO/GATC
* Schedule verification
* Monitor verification status
* Track pending applications
* View verification records
* Monitor certificate expiry
* Access dashboards and reports

---

## 👮 LMO / GATC

The verification officer/test centre can:

* View assigned verification requests
* Access instrument details
* Perform physical inspection
* Record verification observations
* Upload photographs/evidence
* Submit PASS/FAIL results
* Complete verification records

> The actual physical testing and regulatory decision remains with the authorized LMO/GATC.

---

# 🤖 AI-Assisted Features

Metrika is designed to use AI where it provides practical value rather than adding AI unnecessarily.







```text
Manufacturer
Model
Serial Number
Capacity
```

Example:

```text
Image
  ↓

  ↓
Extracted Information
  ↓
User Confirmation
  ↓
Instrument Record
```

The extracted information is always reviewed by the user before being saved.

### Future AI Capabilities

The platform can be extended with:

* Document information extraction
* Instrument identity matching
* Image quality checking
* Serial-number mismatch detection
* Smart compliance assistance
* AI-assisted field inspection

AI acts as **decision support**, not as a replacement for authorized Legal Metrology officers.

---

# 📜 Digital Verification Certificate

After a successful verification, Metrika can generate a digital verification certificate containing information such as:

* Certificate ID
* Instrument ID
* Owner
* Manufacturer
* Model
* Serial Number
* Capacity
* Verification date
* Validity / due date
* Verification authority
* Verification result
* QR code

The QR code provides a convenient way to access and verify the certificate information.

---

# 🔎 QR-Based Certificate Verification

Anyone with access to the certificate QR code can verify the associated certificate record.

Example:

```text
Scan QR
   ↓
Certificate ID
   ↓
Retrieve Certificate
   ↓
Check Authenticity / Status
   ↓
Display Instrument Information
```

Possible status:

### 🟢 VERIFIED

```text
Instrument: XYZ WM-300
Serial No: 928374
Verified On: DD/MM/YYYY
Valid Until: DD/MM/YYYY

Verification Status:
VALID
```

---

# 📊 Dashboard

### LMD Dashboard

The administrator dashboard can provide an overview of:

```text
Total Instruments
Pending Applications
Scheduled Verifications
Completed Verifications
Failed Verifications
Expiring Certificates
Expired Certificates
```

This allows authorities to monitor verification activities and pending work from a centralized interface.

---

# 🔐 Security & Access Control

Metrika follows a role-based approach.

Different users have access to different functionalities:

```text
                Metrika
                   │
       ┌───────────┼───────────┐
       │           │           │
    Business      LMD       LMO/GATC
       │           │           │
   Applications  Admin     Verification
   Instruments   Assign    Inspection
   Certificates  Monitor   Results
```

Potential security measures include:

* Role-Based Access Control (RBAC)
* Secure authentication
* API authorization
* Input validation
* Audit logs
* Secure document storage
* Certificate verification
* Data integrity checks

---

# 🏗️ High-Level Architecture

```text
                    ┌──────────────────────┐
                    │      Frontend        │
                    │   Web / Mobile UI    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Backend API     │
                    │ Authentication       │
                    │ Workflow Management  │
                    │ Verification         │
                    │ Certificates         │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐     ┌───────────┐    ┌──────────┐

        │          │     │  Module   │    │          │
        └──────────┘     └───────────┘    └──────────┘
```

---

# 🗂️ Core Modules

```text
Authentication
│
├── User Registration
├── Login
└── Role-Based Access

Instrument Management
│
├── Instrument Registration
├── Instrument Details
└── Verification History

Application Management
│
├── Verification Application
├── Re-verification Application
├── Document Upload
└── Status Tracking

Verification Management
│
├── Scheduling
├── LMO/GATC Assignment
├── Inspection
├── Observations
└── PASS / FAIL

Certificate Management
│
├── Digital Certificate
├── QR Generation
├── Certificate Verification
└── Certificate History

Compliance
│
├── Expiry Tracking
├── Renewal Reminders
└── Alerts

Analytics
│
├── Dashboard
├── Reports
└── Pendency Monitoring

AI
│

├── Data Extraction
└── Future Intelligent Assistance
```

---

# 🧑‍💻 Team Delmora

| Member     | Role                      |
| ---------- | ------------------------- |
| **Sameer** | Team Lead & Frontend Lead |
| **Ayesh**  | Backend Lead              |
| **Kartik** | Database Lead             |
| **Manik**  | AI/ML Lead                |

---

# 🛠️ Technology Stack

> The final technology stack may be updated during development.

### Frontend

* React / Next.js
* HTML5
* CSS / Tailwind CSS
* JavaScript / TypeScript

### Backend

* REST API
* Node.js / Express or selected backend framework

### Database

* PostgreSQL / MySQL or selected database


### Other

* QR Code generation
* Digital certificate generation
* File/document storage
* Authentication & RBAC

---

# 🗺️ Development Roadmap

## Phase 1 — Internal SIH Prototype

Focus on the complete core workflow:

* [ ] Authentication
* [ ] Role-based dashboards
* [ ] Instrument registration
* [ ] Verification application
* [ ] LMD application management
* [ ] LMO/GATC assignment
* [ ] Verification workflow
* [ ] PASS/FAIL result
* [ ] Digital certificate
* [ ] QR verification
* [ ] Expiry tracking
* [ ] Basic dashboard


---

## Phase 2 — Post Internal Selection

After the internal round, the platform can be enhanced with:


* [ ] Instrument digital identity
* [ ] Offline-first field verification
* [ ] Advanced evidence integrity
* [ ] GPS/location validation
* [ ] Document verification
* [ ] Smart scheduling
* [ ] Compliance analytics
* [ ] Geographic monitoring
* [ ] Advanced audit trails
* [ ] Government system integrations

---

# 🎬 Demonstration Flow

The main demonstration will follow a single instrument through the complete lifecycle.

### Step 1 — Business

Register instrument.

### Step 2 — Application

Submit verification request.

### Step 3 — LMD

Review and assign LMO/GATC.

### Step 4 — LMO/GATC

Open assigned request and record verification.

### Step 5 — Result

Submit PASS/FAIL.

### Step 6 — Certificate

Generate digital verification certificate.

### Step 7 — QR

Scan QR and verify certificate.

### Step 8 — Dashboard

Show updated verification status and validity.

---

# 🎯 Project Vision

Our goal is not simply to create another government portal.

The long-term vision of **Metrika** is to create a unified digital lifecycle for regulated weighing and measuring instruments:

```text
REGISTER
   ↓
VERIFY
   ↓
CERTIFY
   ↓
TRACK
   ↓
RE-VERIFY
   ↓
MAINTAIN HISTORY
```

This creates greater transparency, easier compliance, better record management and more efficient monitoring for the Legal Metrology ecosystem.

---

# 📌 Problem Statement

**SIH Problem Statement ID:** 26036

**Title:** Development of an Online Verification System for Weighing and Measuring Instruments

**Organization:** Ministry of Consumer Affairs, Food & Public Distribution

**Department:** Department of Consumer Affairs

**Category:** Software

**Team:** Delmora

**Project:** Metrika

---

## ⭐ Team Delmora

> **Digitizing trust in every measurement.**


