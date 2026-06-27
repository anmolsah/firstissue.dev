// Data source for the programmatic SEO pages under /good-first-issues/<slug>.
//
// Each entry drives one statically-generated landing page. The per-language
// `intro`, `setup`, and `tips` exist to give every page genuinely unique,
// useful content (not just a swapped variable) — that is what keeps these
// pages out of Google's thin-content bucket. The live issue list rendered on
// top of this (with real counts + freshness) is the other half of the value.
//
// `gh` is the GitHub code-search `language:` qualifier value.

export const LABELS = ["good first issue", "help wanted"];

// Minimum number of quality issues required to publish (and index) a page.
// Below this we skip the page entirely rather than ship a thin one.
export const MIN_ISSUES = 6;

// Max issues rendered per page.
export const MAX_ISSUES = 24;

export const LANGUAGES = [
  {
    slug: "javascript",
    name: "JavaScript",
    gh: "javascript",
    intro:
      "JavaScript is the most common entry point into open source — almost every web project has beginner-friendly issues, from small UI fixes to documentation.",
    setup:
      "Most JavaScript projects use npm or pnpm. Clone the repo, run the install command in the README, and look for a CONTRIBUTING.md before you start.",
    tips: [
      "Start with documentation, test, or small UI bugs before tackling logic-heavy issues.",
      "Run the project's linter and tests locally before opening a PR — JS projects usually gate on CI.",
      "Frameworks matter: a React issue is very different from a Node.js one. Read the repo's stack first.",
    ],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    gh: "typescript",
    intro:
      "TypeScript projects are great for beginners because the type system documents intent — the compiler often tells you exactly what a fix needs.",
    setup:
      "Run the install command, then the build/typecheck script (often `npm run build` or `tsc --noEmit`) so you can see type errors as you work.",
    tips: [
      "Let the compiler guide you — a red squiggle usually points straight at the change required.",
      "Avoid `any`; maintainers will ask you to type things properly in review.",
      "Small typing-improvement issues are an ideal first contribution.",
    ],
  },
  {
    slug: "python",
    name: "Python",
    gh: "python",
    intro:
      "Python's readability makes it one of the friendliest languages for a first contribution, spanning web, data, ML, and tooling projects.",
    setup:
      "Create a virtual environment (`python -m venv .venv`), install dev dependencies (often `pip install -e .[dev]` or via `requirements-dev.txt`), then run the tests.",
    tips: [
      "Match the project's formatting — most use black/ruff and will reject unformatted PRs.",
      "Write or update a test for your change; Python projects value coverage.",
      "Docstring and typing improvements are well-scoped first issues.",
    ],
  },
  {
    slug: "java",
    name: "Java",
    gh: "java",
    intro:
      "Java powers a huge amount of enterprise and Android open source. Issues are often well-specified, which suits methodical first-time contributors.",
    setup:
      "Projects use Maven (`mvn install`) or Gradle (`./gradlew build`). Build once to confirm your JDK version matches what the README requires.",
    tips: [
      "Confirm the required JDK version before building — version mismatches are the #1 setup snag.",
      "Follow the project's existing patterns; Java codebases value consistency.",
      "Look for issues tagged with a component label that matches a class you understand.",
    ],
  },
  {
    slug: "go",
    name: "Go",
    gh: "go",
    intro:
      "Go's small standard library and strict formatting make its projects approachable — the toolchain enforces a lot of consistency for you.",
    setup:
      "Run `go build ./...` and `go test ./...` after cloning. `gofmt`/`go vet` keep style uniform automatically.",
    tips: [
      "Run `gofmt` and `go vet` before pushing — CI will fail otherwise.",
      "Keep changes idiomatic and minimal; Go reviewers prefer simple over clever.",
      "Error-handling and docs issues are good, well-bounded starters.",
    ],
  },
  {
    slug: "rust",
    name: "Rust",
    gh: "rust",
    intro:
      "Rust communities are famously welcoming and many projects label mentored beginner issues with extra guidance.",
    setup:
      "Use `cargo build` and `cargo test`. `cargo clippy` and `cargo fmt` catch most style and lint problems before review.",
    tips: [
      "Run `cargo clippy` and `cargo fmt` — they catch most review comments preemptively.",
      "Read the borrow-checker errors carefully; they usually describe the exact fix.",
      "Look for issues labelled `E-easy` or `E-mentor` for guided first contributions.",
    ],
  },
  {
    slug: "cpp",
    name: "C++",
    gh: "c++",
    intro:
      "C++ open source spans game engines, databases, and systems tools. Build setup is the main hurdle — once it compiles, many issues are tractable.",
    setup:
      "Most projects use CMake (`cmake -B build && cmake --build build`). Match the compiler/standard version the README specifies.",
    tips: [
      "Get a clean build first — toolchain setup is the hardest part of C++ contributing.",
      "Keep memory safety in mind; reviewers scrutinise pointers and lifetimes.",
      "Documentation and build-script fixes are good ways to start.",
    ],
  },
  {
    slug: "csharp",
    name: "C#",
    gh: "c#",
    intro:
      "C# and the .NET ecosystem have a strong open source presence, with clear project structure that helps newcomers navigate.",
    setup:
      "Install the .NET SDK version from the README, then `dotnet build` and `dotnet test`. Most issues reproduce easily in this flow.",
    tips: [
      "Use `dotnet format` to match style before opening a PR.",
      "Reproduce the issue with a test first, then fix it.",
      "Look for `up-for-grabs` labels common across .NET repos.",
    ],
  },
  {
    slug: "php",
    name: "PHP",
    gh: "php",
    intro:
      "PHP underpins a large share of the web (WordPress, Laravel, Symfony). Many projects have approachable, well-documented beginner issues.",
    setup:
      "Install dependencies with Composer (`composer install`), then run the test suite (often `vendor/bin/phpunit`).",
    tips: [
      "Follow PSR coding standards; most projects enforce them in CI.",
      "Start in docs or small bug fixes within a feature you already use.",
      "Confirm the PHP version locally matches the project's requirement.",
    ],
  },
  {
    slug: "ruby",
    name: "Ruby",
    gh: "ruby",
    intro:
      "Ruby (and Rails) communities prize readable code and good onboarding, making them welcoming for first-time contributors.",
    setup:
      "Run `bundle install`, then the test suite with `bundle exec rspec` or `rake test`. Use the Ruby version in `.ruby-version`.",
    tips: [
      "Match the project's RuboCop config — style is usually enforced.",
      "Write a spec for your change; Ruby projects expect tests.",
      "Documentation and refactor issues are good, low-risk starters.",
    ],
  },
  {
    slug: "swift",
    name: "Swift",
    gh: "swift",
    intro:
      "Swift open source covers server frameworks, tooling, and cross-platform libraries beyond just Apple platforms.",
    setup:
      "Use Swift Package Manager (`swift build`, `swift test`) or open the Xcode project as the README directs.",
    tips: [
      "Run `swift test` locally before submitting.",
      "Keep API changes minimal; Swift libraries care about source stability.",
      "Look for documentation or example-code issues to start.",
    ],
  },
  {
    slug: "kotlin",
    name: "Kotlin",
    gh: "kotlin",
    intro:
      "Kotlin is popular for Android and increasingly for backend (Ktor). Its concise syntax helps newcomers read codebases quickly.",
    setup:
      "Build with Gradle (`./gradlew build`). Android projects open cleanly in Android Studio.",
    tips: [
      "Run the Gradle build and tests before pushing.",
      "Follow the project's ktlint/detekt config for style.",
      "Small UI or null-safety fixes make good first issues.",
    ],
  },
  {
    slug: "dart",
    name: "Dart",
    gh: "dart",
    intro:
      "Dart, powered by Flutter, has a fast-growing open source ecosystem with many beginner-labelled UI and package issues.",
    setup:
      "Run `dart pub get` (or `flutter pub get`), then `dart test`. Flutter apps run with `flutter run`.",
    tips: [
      "Run `dart format` and `dart analyze` before opening a PR.",
      "Widget and documentation fixes are approachable starters in Flutter repos.",
      "Match the SDK constraints in `pubspec.yaml`.",
    ],
  },
  {
    slug: "c",
    name: "C",
    gh: "c",
    intro:
      "C open source includes foundational tools, embedded projects, and libraries. Issues are often small in scope but high in impact.",
    setup:
      "Most projects use Make (`make`) or CMake. Read the build instructions carefully — flags and dependencies vary.",
    tips: [
      "Compile cleanly with the project's warning flags before submitting.",
      "Be careful with memory management; reviewers look closely at allocations.",
      "Documentation and portability fixes are good first contributions.",
    ],
  },
  {
    slug: "scala",
    name: "Scala",
    gh: "scala",
    intro:
      "Scala blends functional and object-oriented styles; its open source projects often have well-structured, mentored beginner issues.",
    setup:
      "Use sbt (`sbt compile`, `sbt test`). The first build downloads a lot — give it time.",
    tips: [
      "Follow the project's scalafmt config for formatting.",
      "Start with documentation or small functional refactors.",
      "Read existing tests to learn the project's idioms.",
    ],
  },
  {
    slug: "elixir",
    name: "Elixir",
    gh: "elixir",
    intro:
      "Elixir has a tight-knit, beginner-friendly community and excellent documentation conventions that make first contributions smooth.",
    setup:
      "Run `mix deps.get`, then `mix test`. The `mix` tool handles most workflows.",
    tips: [
      "Run `mix format` before opening a PR.",
      "Doc and typespec improvements are valued and well-scoped.",
      "Write a test with your change; Elixir projects expect coverage.",
    ],
  },
];
