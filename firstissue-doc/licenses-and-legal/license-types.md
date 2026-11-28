---
title: "Understanding Open Source Licenses (MIT, Apache, GPL & More)"
description: "Compare permissive vs copyleft software licenses and learn how to pick the right one for your project."
readTime: "9 min read"
updated: "today"
difficulty: "Beginner"
order: 1
---
Without an open source license, standard copyright laws apply by default — meaning you retain exclusive rights and nobody else can legally copy, distribute, or modify your code, even if it's hosted publicly on GitHub.

## 1. Permissive Licenses (Build with Freedom)

Permissive licenses give users maximum freedom to modify, redistribute, and even incorporate the code into closed-source commercial software:

- MIT License: Short, simple, and permissive. Users can do whatever they want as long as they include the original copyright notice.
- Apache License 2.0: Permissive like MIT, but provides an explicit grant of patent rights and protects against patent infringement lawsuits.
- BSD 3-Clause: Similar to MIT, with a specific clause barring the use of the project author's name for marketing/endorsement without permission.

## 2. Copyleft Licenses (Share and Share Alike)

Copyleft licenses require that anyone distributing derivative works of your code must also release their source code under the same license:

- GNU GPLv3 (General Public License): Strong copyleft. Any application that modifies or links to GPLv3 code must also be licensed under GPLv3.
- GNU AGPLv3 (Affero GPL): Network copyleft. Closes the cloud/SaaS loophole — if modified code runs as a remote network service, the full source code must be made available to network users.
- GNU LGPLv3 (Lesser GPL): Weak copyleft. Allows proprietary programs to link dynamically to LGPL libraries without forcing the proprietary program to be open source.
