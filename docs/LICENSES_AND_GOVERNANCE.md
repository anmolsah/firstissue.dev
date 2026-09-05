# Open Source Licenses, Contributor Agreements (CLA/DCO) & Governance

Comprehensive developer guide on open source legalities, license selection, intellectual property, and community governance.

---

## 1. Understanding Open Source Licenses

An open source license grants users permission to use, copy, modify, and distribute software under specific conditions. Without a license, default copyright laws apply, meaning nobody can legally use, copy, or contribute to your repository.

### Permissive Licenses
Permissive licenses place minimal restrictions on how software can be used, modified, or redistributed:

1. **MIT License**:
   - **Characteristics**: Short, simple, and the most popular open source license globally.
   - **Permissions**: Commercial use, modification, distribution, sublicensing, private use.
   - **Requirements**: Preserve copyright and license notice.
   - **Ideal for**: Libraries, utilities, web frameworks, boilerplate starters.

2. **Apache License 2.0**:
   - **Characteristics**: Permissive like MIT, but provides an **explicit grant of patent rights** from contributors to users.
   - **Permissions**: Commercial use, modification, distribution, patent use.
   - **Requirements**: Preserve copyright, include notice file, state changes if files were modified.
   - **Ideal for**: Large frameworks, enterprise software, infrastructure projects (e.g., Kubernetes, Apache Kafka, Spark).

3. **BSD 2-Clause / 3-Clause**:
   - **Characteristics**: Similar to MIT. BSD 3-Clause explicitly prohibits using the author's or organization's name for marketing/endorsement without prior written permission.

### Copyleft (Share-Alike) Licenses
Copyleft licenses require that derivative works must be released under the same open-source license:

1. **GNU General Public License v3 (GPLv3)**:
   - **Characteristics**: Strong copyleft. Any software that links to or incorporates GPLv3 code must also be licensed under GPLv3.
   - **Protections**: Includes anti-tivoization clauses (hardware restrictions) and explicit patent retaliation clauses.
   - **Ideal for**: Standalone applications, developer tools, OS utilities (e.g., Linux kernel uses GPLv2, Git uses GPLv2).

2. **GNU Affero General Public License v3 (AGPLv3)**:
   - **Characteristics**: Network copyleft. Closes the "SaaS loophole" of GPL.
   - **Rule**: If software running over a network (e.g., as a cloud service) modifies AGPL code, the modified source code must be made available to remote users over that network.
   - **Ideal for**: Self-hosted backend services, databases, web platforms (e.g., Grafana, Mastodon).

3. **GNU Lesser General Public License (LGPLv3)**:
   - **Characteristics**: Weak copyleft. Allows proprietary applications to link to an LGPL library without making the entire application open source.

---

## 2. Contributor License Agreements (CLA) & Developer Certificate of Origin (DCO)

### Contributor License Agreement (CLA)
- A legal agreement between a contributor and a project/foundation.
- Asserts that the contributor has the right to contribute the intellectual property and grants the project rights to distribute and relicense the code.
- Often signed once via automated GitHub bots (e.g., CLA Assistant, EasyCLA).
- Used by: Google, Microsoft, Meta, Canonical, Linux Foundation projects.

### Developer Certificate of Origin (DCO)
- A lightweight, developer-friendly alternative to CLAs created by the Linux kernel team.
- Instead of signing a separate legal document, the developer signs off on each commit using the `-s` flag:
```bash
git commit -s -m "feat(api): implement oauth token refresh"
```
- Appends `Signed-off-by: Your Name <your.email@example.com>` to the commit message.
- Certifies that the contributor wrote the code or has the right to submit it under the project's open source license.

---

## 3. Governance Models in Open Source

1. **Benevolent Dictator for Life (BDFL)**:
   - A single founder or lead maintainer retains ultimate veto authority on design decisions (e.g., Linus Torvalds for Linux, Guido van Rossum historically for Python).
2. **Meritocracy**:
   - Decision-making power is earned through demonstrated technical contribution, peer review, and active participation (e.g., Apache Software Foundation model).
3. **Consensus & Steering Committees**:
   - Governed by elected Technical Steering Committees (TSC) or working groups with defined voting rules (e.g., Kubernetes, Node.js, Rust).
4. **Corporate-Backed**:
   - Maintained primarily by full-time engineers employed by a single corporate entity (e.g., React by Meta, Go by Google, VS Code by Microsoft), often with community RFC processes.
