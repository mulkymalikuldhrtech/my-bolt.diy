# Bolt.AGI – The bolt.diy Revolution

[![Bolt.AGI: Full-Stack AGI Development Toolkit](./public/social_preview_index.jpg)](https://bolt.diy)

> **Bolt.AGI** is the next evolutionary step of **bolt.diy** – an **Autonomous General Intelligence (AGI) engineering platform** that unifies Web, Desktop *and* Mobile development in a single monorepo. The goal of this branch ( `agi-revolution` ) is simple:
>
> *  🔗  Seamlessly **merge** every community contribution into one superior, battle-tested code-base
> *  📦  Provide **zero-friction dependency installation** – one `pnpm install` for the whole workspace (`web`, `electron`, `mobile`)
> *  ⚡  Ship **ready-to-run binaries**: Electron installers for macOS / Windows / Linux **and** a signed **Android .apk**
> *  🧑‍💻  Guarantee that **UI, Front-End and Back-End** work together without errors out-of-the-box
>
> If you are reading this on any branch other than `agi-revolution`, switch now:
>
> ```bash
> git fetch origin && git checkout -b agi-revolution origin/main
> pnpm install
> ```
>
> The remainder of this README retains the historic documentation of bolt.diy. New AGI-specific sections are marked with "(AGI)" badges.

Welcome to bolt.diy, the official open source version of Bolt.new, which allows you to choose the LLM that you use for each prompt! Currently, you can use OpenAI, Anthropic, Ollama, OpenRouter, Gemini, LMStudio, Mistral, xAI, HuggingFace, DeepSeek, or Groq models - and it is easily extended to use any other model supported by the Vercel AI SDK! See the instructions below for running this locally and extending it to include more models.

-----
Check the [bolt.diy Docs](https://stackblitz-labs.github.io/bolt.diy/) for more offical installation instructions and more informations.

-----
Also [this pinned post in our community](https://thinktank.ottomator.ai/t/videos-tutorial-helpful-content/3243) has a bunch of incredible resources for running and deploying bolt.diy yourself!

We have also launched an experimental agent called the "bolt.diy Expert" that can answer common questions about bolt.diy. Find it here on the [oTTomator Live Agent Studio](https://studio.ottomator.ai/).

bolt.diy was originally started by [Cole Medin](https://www.youtube.com/@ColeMedin) but has quickly grown into a massive community effort to build the BEST open source AI coding assistant!

## Table of Contents

- [Join the Community](#join-the-community)
- [Requested Additions](#requested-additions)
- [Features](#features)
- [Setup](#setup)
- [Run the Application](#run-the-application)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [AI Multi-Agent Ecosystem (EX Machina)](#ai-multi-agent-ecosystem-ex-machina)

## Join the community

[Join the bolt.diy community here, in the oTTomator Think Tank!](https://thinktank.ottomator.ai)

## Project management

Bolt.diy is a community effort! Still, the core team of contributors aims at organizing the project in way that allows
you to understand where the current areas of focus are.

If you want to know what we are working on, what we are planning to work on, or if you want to contribute to the
project, please check the [project management guide](./PROJECT.md) to get started easily.

## Requested Additions

- ✅ OpenRouter Integration (@coleam00)
- ✅ Gemini Integration (@jonathands)
- ✅ Autogenerate Ollama models from what is downloaded (@yunatamos)
- ✅ Filter models by provider (@jasonm23)
- ✅ Download project as ZIP (@fabwaseem)
- ✅ Improvements to the main bolt.new prompt in `app\lib\.server\llm\prompts.ts` (@kofi-bhr)
- ✅ DeepSeek API Integration (@zenith110)
- ✅ Mistral API Integration (@ArulGandhi)
- ✅ "Open AI Like" API Integration (@ZerxZ)
- ✅ Ability to sync files (one way sync) to local folder (@muzafferkadir)
- ✅ Containerize the application with Docker for easy installation (@aaronbolton)
- ✅ Publish projects directly to GitHub (@goncaloalves)
- ✅ Ability to enter API keys in the UI (@ali00209)
- ✅ xAI Grok Beta Integration (@milutinke)
- ✅ LM Studio Integration (@karrot0)
- ✅ HuggingFace Integration (@ahsan3219)
- ✅ Bolt terminal to see the output of LLM run commands (@thecodacus)
- ✅ Streaming of code output (@thecodacus)
- ✅ Ability to revert code to earlier version (@wonderwhy-er)
- ✅ Chat history backup and restore functionality (@sidbetatester)
- ✅ Cohere Integration (@hasanraiyan)
- ✅ Dynamic model max token length (@hasanraiyan)
- ✅ Better prompt enhancing (@SujalXplores)
- ✅ Prompt caching (@SujalXplores)
- ✅ Load local projects into the app (@wonderwhy-er)
- ✅ Together Integration (@mouimet-infinisoft)
- ✅ Mobile friendly (@qwikode)
- ✅ Better prompt enhancing (@SujalXplores)
- ✅ Attach images to prompts (@atrokhym)(@stijnus)
- ✅ Added Git Clone button (@thecodacus)
- ✅ Git Import from url (@thecodacus)
- ✅ PromptLibrary to have different variations of prompts for different use cases (@thecodacus)
- ✅ Detect package.json and commands to auto install & run preview for folder and git import (@wonderwhy-er)
- ✅ Selection tool to target changes visually (@emcconnell)
- ✅ Detect terminal Errors and ask bolt to fix it (@thecodacus)
- ✅ Detect preview Errors and ask bolt to fix it (@wonderwhy-er)
- ✅ Add Starter Template Options (@thecodacus)
- ✅ Perplexity Integration (@meetpateltech)
- ✅ AWS Bedrock Integration (@kunjabijukchhe)
- ✅ Add a "Diff View" to see the changes (@toddyclipsgg)
- ⬜ **HIGH PRIORITY** - Prevent bolt from rewriting files as often (file locking and diffs)
- ⬜ **HIGH PRIORITY** - Better prompting for smaller LLMs (code window sometimes doesn't start)
- ⬜ **HIGH PRIORITY** - Run agents in the backend as opposed to a single model call
- ✅ Deploy directly to Netlify (@xKevIsDev)
- ✅ Supabase Integration (@xKevIsDev)
- ⬜ Have LLM plan the project in a MD file for better results/transparency
- ⬜ VSCode Integration with git-like confirmations
- ⬜ Upload documents for knowledge - UI design templates, a code base to reference coding style, etc.
- ✅ Voice prompting
- ⬜ Azure Open AI API Integration
- ⬜ Vertex AI Integration
- ⬜ Granite Integration
- ✅ Popout Window for Web Container(@stijnus)
- ✅ Ability to change Popout window size (@stijnus)

## Features

- **AI-powered full-stack web development** for **NodeJS based applications** directly in your browser.
- **Support for multiple LLMs** with an extensible architecture to integrate additional models.
- **Attach images to prompts** for better contextual understanding.
- **Integrated terminal** to view output of LLM-run commands.
- **Revert code to earlier versions** for easier debugging and quicker changes.
- **Download projects as ZIP** for easy portability Sync to a folder on the host.
- **Integration-ready Docker support** for a hassle-free setup.
- **Deploy** directly to **Netlify**

## Setup

If you're new to installing software from GitHub, don't worry! If you encounter any issues, feel free to submit an "issue" using the provided links or improve this documentation by forking the repository, editing the instructions, and submitting a pull request. The following instruction will help you get the stable branch up and running on your local machine in no time.

Let's get you up and running with the stable version of Bolt.DIY!

## Quick Download

[![Download Latest Release](https://img.shields.io/github/v/release/stackblitz-labs/bolt.diy?label=Download%20Bolt&sort=semver)](https://github.com/stackblitz-labs/bolt.diy/releases/latest) ← Click here to go the the latest release version!

- Next **click source.zip**

## Prerequisites

Before you begin, you'll need to install two important pieces of software:

### Install Node.js

Node.js is required to run the application.

1. Visit the [Node.js Download Page](https://nodejs.org/en/download/)
2. Download the "LTS" (Long Term Support) version for your operating system
3. Run the installer, accepting the default settings
4. Verify Node.js is properly installed:
   - **For Windows Users**:
     1. Press `Windows + R`
     2. Type "sysdm.cpl" and press Enter
     3. Go to "Advanced" tab → "Environment Variables"
     4. Check if `Node.js` appears in the "Path" variable
   - **For Mac/Linux Users**:
     1. Open Terminal
     2. Type this command:
        ```bash
        echo $PATH
        ```
     3. Look for `/usr/local/bin` in the output

## Running the Application

You have two options for running Bolt.DIY: directly on your machine or using Docker.

### Option 1: Direct Installation (Recommended for Beginners)

1. **Install Package Manager (pnpm)**:

   ```bash
   npm install -g pnpm
   ```

2. **Install Project Dependencies**:

   ```bash
   pnpm install
   ```

3. **Start the Application**:

   ```bash
   pnpm run dev
   ```
   
### Option 2: Using Docker

This option requires some familiarity with Docker but provides a more isolated environment.

#### Additional Prerequisite

- Install Docker: [Download Docker](https://www.docker.com/)

#### Steps:

1. **Build the Docker Image**:

   ```bash
   # Using npm script:
   npm run dockerbuild

   # OR using direct Docker command:
   docker build . --target bolt-ai-development
   ```

2. **Run the Container**:
   ```bash
   docker compose --profile development up
   ```

## Configuring API Keys and Providers

### Adding Your API Keys

Setting up your API keys in Bolt.DIY is straightforward:

1. Open the home page (main interface)
2. Select your desired provider from the dropdown menu
3. Click the pencil (edit) icon
4. Enter your API key in the secure input field

![API Key Configuration Interface](./docs/images/api-key-ui-section.png)

### Configuring Custom Base URLs

For providers that support custom base URLs (such as Ollama or LM Studio), follow these steps:

1. Click the settings icon in the sidebar to open the settings menu
   ![Settings Button Location](./docs/images/bolt-settings-button.png)

2. Navigate to the "Providers" tab
3. Search for your provider using the search bar
4. Enter your custom base URL in the designated field
   ![Provider Base URL Configuration](./docs/images/provider-base-url.png)

> **Note**: Custom base URLs are particularly useful when running local instances of AI models or using custom API endpoints.

### Supported Providers

- Ollama
- LM Studio
- OpenAILike

## Setup Using Git (For Developers only)

This method is recommended for developers who want to:

- Contribute to the project
- Stay updated with the latest changes
- Switch between different versions
- Create custom modifications

#### Prerequisites

1. Install Git: [Download Git](https://git-scm.com/downloads)

#### Initial Setup

1. **Clone the Repository**:

   ```bash
   git clone -b stable https://github.com/stackblitz-labs/bolt.diy.git
   ```

2. **Navigate to Project Directory**:

   ```bash
   cd bolt.diy
   ```

3. **Install Dependencies**:

   ```bash
   pnpm install
   ```

4. **Start the Development Server**:
   ```bash
   pnpm run dev
   ```

5. **(OPTIONAL)** Switch to the Main Branch if you want to use pre-release/testbranch:
   ```bash
   git checkout main
   pnpm install
   pnpm run dev
   ```
  Hint: Be aware that this can have beta-features and more likely got bugs than the stable release

>**Open the WebUI to test (Default: http://localhost:5173)**
>   - Beginngers: 
>     - Try to use a sophisticated Provider/Model like Anthropic with Claude Sonnet 3.x Models to get best results
>     - Explanation: The System Prompt currently implemented in bolt.diy cant cover the best performance for all providers and models out there. So it works better with some models, then other, even if the models itself are perfect for >programming
>     - Future: Planned is a Plugin/Extentions-Library so there can be different System Prompts for different Models, which will help to get better results

#### Staying Updated

To get the latest changes from the repository:

1. **Save Your Local Changes** (if any):

   ```bash
   git stash
   ```

2. **Pull Latest Updates**:

   ```bash
   git pull 
   ```

3. **Update Dependencies**:

   ```bash
   pnpm install
   ```

4. **Restore Your Local Changes** (if any):
   ```bash
   git stash pop
   ```

#### Troubleshooting Git Setup

If you encounter issues:

1. **Clean Installation**:

   ```bash
   # Remove node modules and lock files
   rm -rf node_modules pnpm-lock.yaml

   # Clear pnpm cache
   pnpm store prune

   # Reinstall dependencies
   pnpm install
   ```

2. **Reset Local Changes**:
   ```bash
   # Discard all local changes
   git reset --hard origin/main
   ```

Remember to always commit your local changes or stash them before pulling updates to avoid conflicts.

---

## Available Scripts

- **`pnpm run dev`**: Starts the development server.
- **`pnpm run build`**: Builds the project.
- **`pnpm run start`**: Runs the built application locally using Wrangler Pages.
- **`pnpm run preview`**: Builds and runs the production build locally.
- **`pnpm test`**: Runs the test suite using Vitest.
- **`pnpm run typecheck`**: Runs TypeScript type checking.
- **`pnpm run typegen`**: Generates TypeScript types using Wrangler.
- **`pnpm run deploy`**: Deploys the project to Cloudflare Pages.
- **`pnpm run lint:fix`**: Automatically fixes linting issues.

---

## Contributing

We welcome contributions! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

---

## Roadmap

Explore upcoming features and priorities on our [Roadmap](https://roadmap.sh/r/ottodev-roadmap-2ovzo).

---

## FAQ

For answers to common questions, issues, and to see a list of recommended models, visit our [FAQ Page](FAQ.md).

## AI Multi-Agent Ecosystem (EX Machina)

> **Status:** Experimental (Phase 0) – Foundations Only

This release introduces the first building blocks of the *EX Machina* multi-agent framework envisioned in the project roadmap.

### What's Included

1. **Core runtime**  (`agents/core`)
   • `BaseAgent` – abstract class every agent extends.
   • `AgentManager` – singleton registry + task delegation helper.

2. **Built-in agent example**
   • `VanguardAgent` – a placeholder "future research" agent that simply echoes received tasks for now.

3. **Auto-registration mechanism**
   • `agents/registry.ts` eagerly imports all built-in implementations so they become available system-wide without manual wiring.

4. **API endpoint**  `GET /api/agents`
   Returns a JSON list of the currently registered agents.

5. **UI**  `/agents` route (see sidebar or navigate directly)
   Minimal table to inspect agent id, name, description and skills.

These primitives will expand into the full-fledged Sentinel, Purifier, Jarvis, Mechanicus, etc. agents described in the design doc. Community PRs are welcome!

### Built-in Agents (Phase 0)

| ID | Name | Purpose |
|----|------|---------|
| vanguard | Vanguard | Future research & trend prediction |
| sentinel | Sentinel | Threat forecasting & security monitoring |
| purifier | Purifier | Malware/exploit eradication |
| jarvis | Jarvis | Device/IoT management |
| warlord | Warlord | Cyber-ops / offensive intelligence |
| mechanicus | Mechanicus | Robotics & hardware specialist |
| mbakdokter | MbakDokter | Medical research & advisory |
| donorseeker | DonorSeeker | Detect donation cases |
| fundraiser | FundRaiser | Run crowdfunding campaigns |
| autonomaton | Autonomaton | Self-governing supervisor |

Use the `/agents` UI or the `/api/agents` endpoint to inspect them.

### 🚀 Android (.apk) builds  (AGI)

Bolt.AGI ships with a **React-Native / Expo** client located in `/mobile`. You can run it instantly inside *Expo Go* or generate an installable `.apk` with a single command.

### 1️⃣ Live preview on device

```bash
pnpm run mobile:start     # alias for: expo start --clear
```
1. Install **Expo Go** from Google Play.
2. Scan the QR code shown in the terminal / browser.
3. The bundle will hot-reload on every save.

### 2️⃣ Generate debug APK locally

```bash
pnpm run mobile:build      # runs: eas build -p android --profile preview --non-interactive
```
This produces a **universal debug `app-debug.apk`** hosted on EAS. Download the link printed at the end of the build and install it on any Android 8+ device.

### 3️⃣ Production build (.aab) for Play Store

```bash
EAS_NO_VCS=1 eas build -p android --profile release --non-interactive
```
The generated **Android App Bundle** complies with Play Store requirements (ARM & x86 splits, 64-bit, etc.). Signing keys are managed by Expo.

> **Backend URL** – On first launch the app will attempt to reach `http://localhost:5173`. If your phone is not on the same machine, open the drawer → Settings → _Backend_ and enter your public URL (or the LAN IP of your computer).

### 📦 Offline (.apk) build inside repo  (AGI)

If you **cannot use remote EAS cloud builds**, generate the debug APK locally and place it in `release/android/`:

```bash
pnpm run build-apk     # shorthand for scripts/build-apk.sh
```

After completion you will find `release/android/ex-machina-mobile.apk` which can be sideloaded on any device.

> The script leverages **EAS Local Build**, so ensure Android SDK & JDK 17 are installed or use Docker (`eas build --local --docker`).

### 🏗️ CI Build
A preconfigured **GitHub Actions** workflow (`.github/workflows/build-apk.yml`) can build the debug APK entirely in CI and publish it as an artifact:
```bash
gh workflow run Android APK
# or trigger manually from the Actions tab
```
Once the job completes, download `ex-machina-mobile-apk` artifact – it will contain `ex-machina-mobile.apk` ready to install.

# Licensing
**Who needs a commercial WebContainer API license?**

bolt.diy source code is distributed as MIT, but it uses WebContainers API that [requires licensing](https://webcontainers.io/enterprise) for production usage in a commercial, for-profit setting. (Prototypes or POCs do not require a commercial license.) If you're using the API to meet the needs of your customers, prospective customers, and/or employees, you need a license to ensure compliance with our Terms of Service. Usage of the API in violation of these terms may result in your access being revoked.

### 🚀 Termux Quick Setup (AGI)

Run this one-liner inside the Termux app (Android 8+):

```bash
pkg update -y && pkg upgrade -y \
&& curl -fsSL https://raw.githubusercontent.com/stackblitz-labs/bolt.diy/agi-revolution/scripts/termux-setup.sh | bash \
&& git clone https://github.com/stackblitz-labs/bolt.diy.git && cd bolt.diy \
&& pnpm install && pnpm run dev
```

• The helper script installs **Node.js LTS**, **pnpm**, **Expo CLI**, **EAS CLI**, compilers and OpenSSL.  
• Electron apps cannot run under Termux, but the backend (`pnpm run dev`) and the Expo client (`pnpm run mobile:start`) work flawlessly.

---

## ⚙️ Core Features at a Glance (AGI)

| Layer | Capability | Status |
|-------|------------|--------|
| Orchestrator | Task queue, sub-task spawning, owner auth | ✅ Basic (v0) |
| Agents | Vanguard, Sentinel, Jarvis, etc. | ✅ Ported |
| Memory | In-memory (default), SQLite adapter | 🟡 WIP |
| Multimodal | Vision, OCR, Speech, Audio | 🟡 Planning |
| UI | AGI Dashboard, Voice Commands | ✅ |
| Mobile | React-Native client, offline APK build | ✅ |
| Desktop | Electron installers (.dmg/.exe/.AppImage) | ✅ |

---

## 🛠️ Local Installation (all stacks)

1. Clone & install deps
```bash
git clone -b agi-revolution https://github.com/stackblitz-labs/bolt.diy.git
cd bolt.diy
pnpm install      # one command for EVERY workspace (web, electron, mobile)
```

2. Start web backend + Bolt IDE:
```bash
pnpm run dev   # http://localhost:5173
```

3. Electron desktop (optional)
```bash
pnpm electron:build:dist  # outputs installers in dist/
```

4. Mobile
   * Live preview → `pnpm run mobile:start`
   * Debug APK → `pnpm run build-apk` (needs Android SDK / Docker)

5. Termux (Android)
```bash
pkg update -y && pkg upgrade -y \
&& curl -fsSL https://raw.githubusercontent.com/stackblitz-labs/bolt.diy/agi-revolution/scripts/termux-setup.sh | bash \
&& cd bolt.diy && pnpm install && pnpm run dev
```

All commands above honour **owner lock-in**: only requests with `owner:"Mulky Malikul Dhaher"` are accepted by the AGI Orchestrator.

---
