GLOBAL INFRASTRUCTURE ADVISORY
Repository Governance Policy (Public Summary)
1. Purpose
This policy defines the governance, security, and operational standards for all GitHub repositories maintained by Global Infrastructure Advisory. It ensures consistency, integrity, and compliance across all digital assets supporting advisory, engineering, and donor‑funded program delivery.

2. Scope
This policy applies to:

All repositories under the Global Infrastructure Advisory GitHub organization

All contributors with write or administrative access

All code, documentation, and digital assets stored in GitHub

3. Repository Structure & Ownership
3.1 Repository Types
Public Repositories  
Used for the corporate website, documentation, and non‑sensitive assets.

Private Repositories  
Used for internal tools, secure infrastructure logic, client portal development, and proprietary templates.

3.2 Ownership
Each repository must have:

A designated Repository Owner

A designated Technical Maintainer

4. Access Control
4.1 Least Privilege
Write access limited to essential personnel

Admin access restricted to the Technical Operations Lead

4.2 Authentication
MFA required for all users

Fine‑grained personal access tokens only

5. Branch Protection
Required rules for the main branch:

Require pull request before merging

Require status checks to pass (CodeQL + Pages)

Require branches to be up to date

Require linear history

Include administrators

Restrict who can push

Prevent force pushes

Prevent branch deletion

6. Code Scanning & Security Automation
6.1 CodeQL
Mandatory for all repositories

Runs on push, pull request, and weekly schedule

Fail threshold: Errors + Warnings

6.2 Secret Scanning
Enabled for all repositories

Push protection enabled for all contributors

7. Repository Features
The following features are disabled to maintain a clean, professional, non‑interactive public presence:

Wikis

Issues

Discussions

Sponsorships

Models

8. Incident Response
If a security issue is detected:

Lock protected branches

Revoke tokens

Review audit logs

Restore from known‑good commit

Document the incident

Notify leadership if required

9. Review Cycle
This policy is reviewed annually or after any major security event.

Security & Compliance (Public Summary)
Global Infrastructure Advisory maintains an enterprise‑grade digital environment designed to protect client information, ensure operational continuity, and support donor‑funded and federal‑aligned programs.

Infrastructure Security
Our systems incorporate:

Cloudflare security (DDoS, WAF, SSL/TLS Full Strict)

Global CDN distribution

DNSSEC and DNS monitoring

Automated threat mitigation

Data Protection
We maintain strict controls over all client‑related information:

Encrypted cloud storage (OneDrive Business / SharePoint)

Access logging and version control

No client data stored on public‑facing systems

MFA enforced for all administrative accounts

Secure Development Practices
All code deployed to our public website and internal systems is governed by:

Protected GitHub branches

Mandatory CodeQL scanning

Secret scanning and push protection

Controlled deployment workflows

Continuity & Redundancy
We maintain:

Monthly offline backups

Encrypted external storage

24‑hour recovery objectives

Redundant hosting and CDN layers

Compliance Alignment
Our digital operations align with:

Federal acquisition security expectations

Donor‑funded program requirements

Industry best practices for secure development
