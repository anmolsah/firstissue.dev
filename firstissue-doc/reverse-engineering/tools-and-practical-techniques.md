---
title: "Reverse Engineering Tools & Practical Beginner Workflows"
description: "Hands-on guide to Ghidra, Wireshark, Browser DevTools, and bytecode decompilers with real step-by-step examples."
readTime: "15 min read"
updated: "today"
difficulty: "Beginner"
order: 2
---
You don't need a supercomputer or expensive proprietary software licenses to start reverse engineering. Today, some of the most powerful analysis frameworks in the world are 100% free, open-source, and beginner-accessible.

## 1. The Essential Reverse Engineering Toolbelt

- Ghidra: Developed by the National Security Agency (NSA) and released as free, open-source software under the Apache 2.0 license. Ghidra includes an exceptional C decompiler, disassembler, scriptable Java/Python API, and supports virtually all processor architectures (x86, ARM, MIPS, PowerPC, RISC-V).
- Wireshark: The undisputed world champion of network packet capture and protocol analysis. It lets you record every single byte entering or leaving your network card, inspect handshakes, and reconstruct communication sessions.
- Browser DevTools: Built right into Google Chrome, Firefox, Safari, and Brave. Pressing F12 gives you the Network tab, JavaScript debugger, DOM inspector, and console—making it the fastest way to reverse engineer modern web apps and REST/GraphQL APIs.
- mitmproxy: A lightweight, open-source Man-in-the-Middle HTTPS interception proxy. It allows you to intercept, modify, and replay encrypted network calls from desktop applications and mobile apps on the fly.
- JADX: An open-source DEX-to-Java decompiler that takes compiled Android APK packages and turns them back into readable Java and Kotlin source code.
- REA (Reverse Engineer Anything - rea.tools): A open-source tool (https://rea.tools / GitHub: morluto/rea) built specifically for AI coding agents. It connects directly with your coding assistant, giving it tools to inspect running applications, executables, and web pages, retrieve assembly, and explain or rebuild features.
- Command-Line Swiss Army Knives: Built-in Linux/macOS utilities like 'file' (identifies binary format), 'strings' (extracts human-readable text), 'ltrace' (traces library calls), and 'strace' (traces operating system kernel calls).

## 2. Practical Walkthrough: Reverse Engineering a Web API in 5 Minutes

Let's start with the most practical skill for open-source contributors: discovering undocumented web APIs so you can build your own automation scripts, bots, or alternative user interfaces.

1. Open your target web app in your browser (e.g. Chrome or Firefox).
2. Press F12 or right-click anywhere and select 'Inspect' to open Developer Tools.
3. Click on the 'Network' tab and select the 'Fetch/XHR' filter so images and CSS files are hidden.
4. Interact with the web page: click a button, perform a search, or load the next page.
5. Look at the requests appearing in the list. Click on any interesting endpoint and inspect the 'Headers' tab (shows the HTTP URL and Authorization tokens), the 'Payload' tab (shows the parameters sent), and the 'Preview/Response' tab (shows the JSON data returned).
6. Right-click the request row -> Select 'Copy' -> Click 'Copy as cURL'. You can now paste this directly into your terminal or convert it into a Python script!

Here is how you turn that copied browser network request into a clean, reusable Python script:

```python
# Example: Replicating an intercepted private API call in Python
import requests

url = "https://api.example.com/v1/user/contributions"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Authorization": "Bearer YOUR_INTERCEPTED_SESSION_TOKEN",
    "Accept": "application/json"
}
params = {
    "filter": "open-source",
    "limit": 20
}

response = requests.get(url, headers=headers, params=params)
if response.status_code == 200:
    data = response.json()
    print(f"Successfully fetched {len(data['items'])} items!")
    for item in data["items"]:
        print(f"- {item['title']} (PR #{item['pr_id']})")
else:
    print(f"Error {response.status_code}: {response.text}")
```

## 3. Practical Walkthrough: Peeking Inside a Compiled Binary with Ghidra

When you have a compiled C or C++ binary, you cannot open it in a regular text editor like VS Code because it looks like random gibberish bytes. Here is the step-by-step beginner workflow to analyze it:

Step 1: The Quick Reconnaissance with 'strings'. Before launching heavy tools, run the 'strings' command in your terminal. This prints out every human-readable string embedded inside the binary:

```bash
# Find all ASCII and UTF-8 strings in the binary:
strings ./mystery_program | grep -E "(http|key|pass|admin|error)"

# Example output:
# Welcome to SecureApp v1.0
# Error: Invalid license key format
# https://auth.license-server.local/verify
# SecretMasterKey2026!
```

Step 2: Importing into Ghidra. Open Ghidra, create a new project, drag and drop your binary into the window, and double-click to open it in CodeBrowser. When prompted 'Would you like to analyze it now?', click 'Yes' and accept the default analyzers.

Step 3: Finding the Main Function. In the left sidebar under 'Symbol Tree', expand the 'Functions' folder and click on 'main'. In the center window, you will see the Assembly listing; in the right window, you will see Ghidra's decompiler output showing clean, readable C pseudocode!

```c
// Ghidra Decompiler Output (Reconstructed from raw assembly bytes)
int main(int argc, char **argv) {
    char userInput[64];
    int isAuthenticated = 0;
    
    printf("Enter the secret passcode: ");
    fgets(userInput, 64, stdin);
    
    // Ghidra reveals the hidden comparison!
    if (strncmp(userInput, "SuperSecretPass2026", 19) == 0) {
        isAuthenticated = 1;
        printf("Access Granted! Welcome, Administrator.\n");
    } else {
        printf("Access Denied. Intrusion recorded.\n");
    }
    
    return isAuthenticated;
}
```

> [!INFO] The Ghidra Renaming Trick
> When decompiling, variable names often look like 'uVar1' or 'iVar2'. In Ghidra, you can right-click any variable and press 'L' (Rename) to change it to something descriptive (like 'userPassword' or 'retryCount'). As you rename variables, the decompiled code becomes as easy to read as your own code!

## 4. REA (rea.tools): AI-Powered Reverse Engineering for Coding Agents

One of the most exciting breakthroughs in reverse engineering today is REA (Reverse Engineer Anything), an open-source framework hosted at https://rea.tools and developed on GitHub (morluto/rea). Instead of manually deciphering thousands of lines of assembly or network packets alone, REA empowers your AI coding agent (like Claude Code, Cursor, Copilot, or Antigravity) to act as your expert reverse-engineering co-pilot.

How REA Works: You provide your coding agent with an application, a compiled binary, or a website and ask a question. REA equips the agent with inspection tools to analyze the running program, extract decompiled handlers, trace instructions, decode the logic, and guide you in rebuilding the feature from scratch in clean, modern code.

> [!INFO] Quick 60-Second Setup
> To connect REA to your coding agent or terminal, simply run the setup command below in your PowerShell or terminal:

```bash
# Install REA and configure it for your coding agent:
npx rea-agents@latest setup

# Or copy this prompt directly into your AI coding assistant:
# "Install REA and connect it to this coding agent using npx rea-agents@latest setup.
# Show me the setup plan for approval, then verify the installation."
```

### Real-World Examples from REA Showcases

- The Chrome Dinosaur Game: Why does the offline T-Rex get faster as you run? By inspecting the running code with REA, the agent reveals that speed starts at 6 and increments by 0.001 per frame while below 13, enabling developers to recreate the mini-game with custom speed sliders.
- Windows Calculator's % Button: Why does '200 + 10%' equal 220 instead of 20? REA inspects calc.exe and its helper DLLs, decompiles the CMP EAX, 0x5c (multiplication) and 0x5b (division) branch instructions, and reveals that Calculator calculates percentages differently depending on whether the preceding operator was + or ×.

For interactive showcases, documentation, and source code, visit the official site at https://rea.tools/ and the open-source repository at https://github.com/morluto/rea.

## 5. Where Freshers Can Practice Safely and Legally

Never reverse engineer live commercial software or bypass security controls on applications without explicit permission. Instead, hone your skills on these world-class, legal platforms designed specifically for students and beginners:

- PicoCTF: Created by Carnegie Mellon University for students. Contains friendly beginner challenges in binary exploitation and reverse engineering with step-by-step hints.
- Crackmes.one: A vibrant open-source repository where developers upload puzzle binaries (crackmes) specifically for other developers to reverse engineer and write solutions for.
- OverTheWire (Bandit & Narnia): Gamified Linux terminal and binary reverse engineering wargames that take you from total novice to command-line wizard.
- The Self-Compilation Lab: The best way to learn! Write a 20-line C or Go program with an if-statement, a for-loop, and a struct. Compile it with gcc or clang, open the output in Ghidra, and see how the compiler transformed your code.
