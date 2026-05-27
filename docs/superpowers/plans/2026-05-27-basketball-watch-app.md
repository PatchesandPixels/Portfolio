# Basketball Score Recorder — Apple Watch App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a watchOS SwiftUI app that lets a pickup basketball player track a two-team game with a configurable win score and scoring type.

**Architecture:** Linear three-screen flow (SetupView → GameView → WinView) driven by a `NavigationStack` with a typed path. All game state lives in a single `GameViewModel` (`ObservableObject`) created at the app root and shared via `@EnvironmentObject`.

**Tech Stack:** Swift 5.10, SwiftUI, watchOS 10+, XCTest for unit tests, WKInterfaceDevice for haptics.

---

## File Map

| File | Responsibility |
|---|---|
| `BasketballScore Watch App/Models.swift` | `ScoringType`, `Team`, `ScoreAction`, `AppScreen` |
| `BasketballScore Watch App/GameViewModel.swift` | All game state and mutation logic |
| `BasketballScore Watch App/SetupView.swift` | Pre-game config: win score + scoring type |
| `BasketballScore Watch App/GameView.swift` | Live scoring screen with undo |
| `BasketballScore Watch App/WinView.swift` | Win celebration + new game reset |
| `BasketballScore Watch App/BasketballScoreApp.swift` | App entry, NavigationStack, EnvironmentObject injection |
| `BasketballScoreTests/GameViewModelTests.swift` | Unit tests for all ViewModel logic |

---

## Task 1: Create Xcode Project & Initialize Git

**Files:**
- Create: new Xcode project at `~/Desktop/BasketballScore/`

- [ ] **Step 1: Create the Xcode project**

  Open Xcode. Choose **File > New > Project**.
  - Platform: **watchOS**
  - Template: **App**
  - Product Name: `BasketballScore`
  - Organization Identifier: `com.andy` (or your own)
  - Bundle Identifier: `com.andy.BasketballScore`
  - Language: **Swift**
  - Interface: **SwiftUI**
  - Uncheck "Include paired iPhone app" if offered
  - Check "Include Tests"
  - Save to `~/Desktop/BasketballScore/`

  Xcode will create:
  ```
  BasketballScore/
  ├── BasketballScore.xcodeproj/
  ├── BasketballScore Watch App/
  │   ├── Assets.xcassets/
  │   ├── Preview Content/
  │   ├── BasketballScoreApp.swift
  │   └── ContentView.swift         ← delete this
  └── BasketballScoreTests/
      └── BasketballScoreTests.swift ← delete this, we'll replace it
  ```

- [ ] **Step 2: Clean up default files**

  In Xcode's Project Navigator, delete `ContentView.swift` (move to trash).
  Delete `BasketballScoreTests.swift` (move to trash).

- [ ] **Step 3: Initialize git and make the first commit**

  ```bash
  cd ~/Desktop/BasketballScore
  git init
  git add .
  git commit -m "feat: scaffold watchOS project"
  ```

---

## Task 2: Define Models

**Files:**
- Create: `BasketballScore Watch App/Models.swift`

- [ ] **Step 1: Create Models.swift**

  In Xcode, right-click the `BasketballScore Watch App` group → **New File → Swift File** → name it `Models.swift`. Add to the Watch App target.

  Paste this content:

  ```swift
  import Foundation

  enum ScoringType: String, CaseIterable, Identifiable, Equatable {
      case oneAndTwo = "1s & 2s"
      case oneAndTwoAndThree = "1s, 2s & 3s"

      var id: String { rawValue }

      var pointOptions: [Int] {
          switch self {
          case .oneAndTwo: return [1, 2]
          case .oneAndTwoAndThree: return [1, 2, 3]
          }
      }
  }

  enum Team: Equatable {
      case home, away

      var label: String {
          switch self {
          case .home: return "Home"
          case .away: return "Away"
          }
      }
  }

  struct ScoreAction {
      let team: Team
      let points: Int
  }

  enum AppScreen: Hashable {
      case game
      case win
  }
  ```

- [ ] **Step 2: Build to verify no compiler errors**

  In Xcode press **⌘B**. Expected: Build Succeeded with 0 errors.

- [ ] **Step 3: Commit**

  ```bash
  cd ~/Desktop/BasketballScore
  git add "BasketballScore Watch App/Models.swift"
  git commit -m "feat: add ScoringType, Team, ScoreAction, AppScreen models"
  ```

---

## Task 3: Build GameViewModel with TDD

**Files:**
- Create: `BasketballScore Watch App/GameViewModel.swift`
- Create: `BasketballScoreTests/GameViewModelTests.swift`

- [ ] **Step 1: Create GameViewModelTests.swift**

  In Xcode, right-click the `BasketballScoreTests` group → **New File → Swift File** → name it `GameViewModelTests.swift`. Add to the test target only.

  Paste this content:

  ```swift
  import XCTest
  @testable import BasketballScore_Watch_App

  // NOTE: If the module name doesn't match, check your Watch App target's
  // "Product Module Name" in Build Settings and use that name here.

  final class GameViewModelTests: XCTestCase {
      var vm: GameViewModel!

      override func setUp() {
          super.setUp()
          vm = GameViewModel()
      }

      // MARK: - Initial State

      func test_initialState_winScore_is15() {
          XCTAssertEqual(vm.winScore, 15)
      }

      func test_initialState_scoringType_isOneAndTwo() {
          XCTAssertEqual(vm.scoringType, .oneAndTwo)
      }

      func test_initialState_scoresAreZero() {
          XCTAssertEqual(vm.homeScore, 0)
          XCTAssertEqual(vm.awayScore, 0)
      }

      func test_initialState_lastActionIsNil() {
          XCTAssertNil(vm.lastAction)
      }

      func test_initialState_winnerIsNil() {
          XCTAssertNil(vm.winner)
      }

      func test_initialState_canUndoIsFalse() {
          XCTAssertFalse(vm.canUndo)
      }

      // MARK: - addPoints

      func test_addPoints_home_incrementsHomeScore() {
          vm.addPoints(team: .home, points: 2)
          XCTAssertEqual(vm.homeScore, 2)
          XCTAssertEqual(vm.awayScore, 0)
      }

      func test_addPoints_away_incrementsAwayScore() {
          vm.addPoints(team: .away, points: 3)
          XCTAssertEqual(vm.awayScore, 3)
          XCTAssertEqual(vm.homeScore, 0)
      }

      func test_addPoints_setsLastAction() {
          vm.addPoints(team: .home, points: 2)
          XCTAssertEqual(vm.lastAction?.team, .home)
          XCTAssertEqual(vm.lastAction?.points, 2)
      }

      func test_addPoints_setsCandUndo() {
          vm.addPoints(team: .away, points: 1)
          XCTAssertTrue(vm.canUndo)
      }

      // MARK: - undo

      func test_undo_reversesHomeScore() {
          vm.addPoints(team: .home, points: 2)
          vm.undo()
          XCTAssertEqual(vm.homeScore, 0)
      }

      func test_undo_reversesAwayScore() {
          vm.addPoints(team: .away, points: 3)
          vm.undo()
          XCTAssertEqual(vm.awayScore, 0)
      }

      func test_undo_clearsLastAction() {
          vm.addPoints(team: .home, points: 2)
          vm.undo()
          XCTAssertNil(vm.lastAction)
          XCTAssertFalse(vm.canUndo)
      }

      func test_undo_onlyUndoesLastAction() {
          vm.addPoints(team: .home, points: 2)
          vm.addPoints(team: .away, points: 1)
          vm.undo()
          XCTAssertEqual(vm.homeScore, 2)
          XCTAssertEqual(vm.awayScore, 0)
      }

      func test_undo_whenNoAction_doesNothing() {
          vm.undo()
          XCTAssertEqual(vm.homeScore, 0)
          XCTAssertEqual(vm.awayScore, 0)
      }

      // MARK: - winner

      func test_winner_isNilWhenBothScoresBelowWinScore() {
          vm.winScore = 15
          vm.homeScore = 14
          vm.awayScore = 14
          XCTAssertNil(vm.winner)
      }

      func test_winner_isHomeWhenHomeReachesWinScore() {
          vm.winScore = 15
          vm.addPoints(team: .home, points: 15)
          XCTAssertEqual(vm.winner, .home)
      }

      func test_winner_isAwayWhenAwayReachesWinScore() {
          vm.winScore = 15
          vm.addPoints(team: .away, points: 15)
          XCTAssertEqual(vm.winner, .away)
      }

      func test_winner_isHomeWhenHomeExceedsWinScore() {
          vm.winScore = 11
          vm.homeScore = 13
          XCTAssertEqual(vm.winner, .home)
      }

      // MARK: - resetGame

      func test_resetGame_clearsScoresAndLastAction() {
          vm.addPoints(team: .home, points: 3)
          vm.addPoints(team: .away, points: 2)
          vm.resetGame()
          XCTAssertEqual(vm.homeScore, 0)
          XCTAssertEqual(vm.awayScore, 0)
          XCTAssertNil(vm.lastAction)
      }

      func test_resetGame_preservesSettings() {
          vm.winScore = 21
          vm.scoringType = .oneAndTwoAndThree
          vm.resetGame()
          XCTAssertEqual(vm.winScore, 21)
          XCTAssertEqual(vm.scoringType, .oneAndTwoAndThree)
      }

      // MARK: - resetAll

      func test_resetAll_clearsScoresAndLastAction() {
          vm.addPoints(team: .home, points: 5)
          vm.resetAll()
          XCTAssertEqual(vm.homeScore, 0)
          XCTAssertEqual(vm.awayScore, 0)
          XCTAssertNil(vm.lastAction)
      }

      func test_resetAll_restoresDefaultSettings() {
          vm.winScore = 21
          vm.scoringType = .oneAndTwoAndThree
          vm.resetAll()
          XCTAssertEqual(vm.winScore, 15)
          XCTAssertEqual(vm.scoringType, .oneAndTwo)
      }

      // MARK: - ScoringType helpers

      func test_scoringType_oneAndTwo_pointOptions() {
          XCTAssertEqual(ScoringType.oneAndTwo.pointOptions, [1, 2])
      }

      func test_scoringType_oneAndTwoAndThree_pointOptions() {
          XCTAssertEqual(ScoringType.oneAndTwoAndThree.pointOptions, [1, 2, 3])
      }
  }
  ```

- [ ] **Step 2: Run tests to verify they all fail**

  Press **⌘U** in Xcode.
  Expected: Build fails or all tests fail with "cannot find type GameViewModel". This confirms the tests need the implementation.

- [ ] **Step 3: Create GameViewModel.swift**

  In Xcode, right-click the `BasketballScore Watch App` group → **New File → Swift File** → name it `GameViewModel.swift`. Add to the Watch App target.

  ```swift
  import SwiftUI

  class GameViewModel: ObservableObject {
      // MARK: - Setup (persists between games)
      @Published var winScore: Int = 15
      @Published var scoringType: ScoringType = .oneAndTwo

      // MARK: - Game state (cleared on reset)
      @Published var homeScore: Int = 0
      @Published var awayScore: Int = 0
      @Published var lastAction: ScoreAction? = nil

      // MARK: - Derived

      var winner: Team? {
          if homeScore >= winScore { return .home }
          if awayScore >= winScore { return .away }
          return nil
      }

      var canUndo: Bool { lastAction != nil }

      // MARK: - Actions

      func addPoints(team: Team, points: Int) {
          lastAction = ScoreAction(team: team, points: points)
          switch team {
          case .home: homeScore += points
          case .away: awayScore += points
          }
      }

      func undo() {
          guard let last = lastAction else { return }
          switch last.team {
          case .home: homeScore -= last.points
          case .away: awayScore -= last.points
          }
          lastAction = nil
      }

      /// Clears scores only — keeps win score and scoring type for the next game.
      func resetGame() {
          homeScore = 0
          awayScore = 0
          lastAction = nil
      }

      /// Full reset — clears scores and restores default settings.
      func resetAll() {
          winScore = 15
          scoringType = .oneAndTwo
          homeScore = 0
          awayScore = 0
          lastAction = nil
      }
  }
  ```

- [ ] **Step 4: Run tests to verify they all pass**

  Press **⌘U**.
  Expected: All tests pass. If the module import fails, go to the Watch App target → Build Settings → search "Product Module Name" and copy the exact value. Use it in the `@testable import` line.

- [ ] **Step 5: Commit**

  ```bash
  cd ~/Desktop/BasketballScore
  git add "BasketballScore Watch App/GameViewModel.swift" \
          "BasketballScoreTests/GameViewModelTests.swift"
  git commit -m "feat: add GameViewModel with full test coverage"
  ```

---

## Task 4: Build SetupView

**Files:**
- Create: `BasketballScore Watch App/SetupView.swift`

- [ ] **Step 1: Create SetupView.swift**

  New File → Swift File → `SetupView.swift`. Add to Watch App target.

  ```swift
  import SwiftUI

  struct SetupView: View {
      @EnvironmentObject var vm: GameViewModel
      @Binding var path: NavigationPath

      let winOptions = [11, 15, 21, 25, 32]

      var body: some View {
          ScrollView {
              VStack(spacing: 10) {
                  // Win Score
                  VStack(spacing: 4) {
                      Text("Win Score")
                          .font(.caption)
                          .foregroundStyle(.secondary)

                      Picker("Win Score", selection: $vm.winScore) {
                          ForEach(winOptions, id: \.self) { score in
                              Text("\(score)").tag(score)
                          }
                      }
                      .pickerStyle(.wheel)
                      .frame(height: 80)
                  }

                  // Scoring Type
                  VStack(spacing: 4) {
                      Text("Scoring")
                          .font(.caption)
                          .foregroundStyle(.secondary)

                      Picker("Scoring Type", selection: $vm.scoringType) {
                          ForEach(ScoringType.allCases) { type in
                              Text(type.rawValue).tag(type)
                          }
                      }
                      .pickerStyle(.wheel)
                      .frame(height: 60)
                  }

                  // Start
                  Button("Start Game") {
                      vm.resetGame()
                      path.append(AppScreen.game)
                  }
                  .buttonStyle(.borderedProminent)
                  .tint(.orange)
              }
              .padding(.horizontal, 4)
          }
          .navigationTitle("Setup")
      }
  }

  #Preview {
      NavigationStack {
          SetupView(path: .constant(NavigationPath()))
              .environmentObject(GameViewModel())
      }
  }
  ```

- [ ] **Step 2: Build and preview**

  Press **⌘B**. Open the Preview canvas for `SetupView.swift`. Verify both pickers render and the Start Game button appears.

- [ ] **Step 3: Commit**

  ```bash
  git add "BasketballScore Watch App/SetupView.swift"
  git commit -m "feat: add SetupView with win score and scoring type pickers"
  ```

---

## Task 5: Build GameView

**Files:**
- Create: `BasketballScore Watch App/GameView.swift`

- [ ] **Step 1: Create GameView.swift**

  New File → Swift File → `GameView.swift`. Add to Watch App target.

  ```swift
  import SwiftUI

  struct GameView: View {
      @EnvironmentObject var vm: GameViewModel
      @Binding var path: NavigationPath

      var body: some View {
          VStack(spacing: 0) {
              // Home team
              teamSection(team: .home, score: vm.homeScore)
                  .frame(maxHeight: .infinity)

              Divider()

              // Away team
              teamSection(team: .away, score: vm.awayScore)
                  .frame(maxHeight: .infinity)

              Divider()

              // Undo
              Button(action: vm.undo) {
                  Label("Undo", systemImage: "arrow.uturn.backward")
                      .font(.caption2)
              }
              .buttonStyle(.bordered)
              .tint(.orange)
              .disabled(!vm.canUndo)
              .padding(.vertical, 4)
          }
          .navigationTitle("Game")
          .navigationBarBackButtonHidden(true)
          .onChange(of: vm.winner) { _, winner in
              if winner != nil {
                  path.append(AppScreen.win)
              }
          }
      }

      @ViewBuilder
      private func teamSection(team: Team, score: Int) -> some View {
          VStack(spacing: 2) {
              Text(team.label)
                  .font(.caption2)
                  .foregroundStyle(.secondary)

              Text("\(score)")
                  .font(.system(size: 26, weight: .bold, design: .rounded))
                  .monospacedDigit()

              HStack(spacing: 4) {
                  ForEach(vm.scoringType.pointOptions, id: \.self) { pts in
                      Button("+\(pts)") {
                          vm.addPoints(team: team, points: pts)
                      }
                      .buttonStyle(.bordered)
                      .tint(team == .home ? .blue : .red)
                      .font(.caption)
                  }
              }
          }
          .padding(.vertical, 4)
      }
  }

  #Preview {
      NavigationStack {
          GameView(path: .constant(NavigationPath()))
              .environmentObject(GameViewModel())
      }
  }
  ```

- [ ] **Step 2: Build and preview**

  Press **⌘B**. Open Preview canvas. Verify Home and Away sections render with score buttons. Try switching the ViewModel's `scoringType` in the preview to `.oneAndTwoAndThree` to confirm three buttons appear.

- [ ] **Step 3: Commit**

  ```bash
  git add "BasketballScore Watch App/GameView.swift"
  git commit -m "feat: add GameView with score buttons, undo, and win detection"
  ```

---

## Task 6: Build WinView

**Files:**
- Create: `BasketballScore Watch App/WinView.swift`

- [ ] **Step 1: Create WinView.swift**

  New File → Swift File → `WinView.swift`. Add to Watch App target.

  ```swift
  import SwiftUI
  import WatchKit

  struct WinView: View {
      @EnvironmentObject var vm: GameViewModel
      @Binding var path: NavigationPath

      var body: some View {
          VStack(spacing: 8) {
              Text("🏀")
                  .font(.title2)

              Text("\(vm.winner?.label ?? "") Wins!")
                  .font(.headline)
                  .multilineTextAlignment(.center)

              Text("\(vm.homeScore) – \(vm.awayScore)")
                  .font(.subheadline)
                  .foregroundStyle(.secondary)

              Button("New Game") {
                  vm.resetAll()
                  path = NavigationPath()
              }
              .buttonStyle(.borderedProminent)
              .tint(.green)
          }
          .navigationBarBackButtonHidden(true)
          .onAppear {
              WKInterfaceDevice.current().play(.success)
          }
      }
  }

  #Preview {
      let vm = GameViewModel()
      vm.homeScore = 21
      vm.awayScore = 18
      vm.winScore = 21
      return NavigationStack {
          WinView(path: .constant(NavigationPath()))
              .environmentObject(vm)
      }
  }
  ```

- [ ] **Step 2: Build and preview**

  Press **⌘B**. Open Preview canvas. Verify "Home Wins!" displays with the score `21 – 18`.

- [ ] **Step 3: Commit**

  ```bash
  git add "BasketballScore Watch App/WinView.swift"
  git commit -m "feat: add WinView with haptic feedback and new game reset"
  ```

---

## Task 7: Wire Up App Entry Point

**Files:**
- Modify: `BasketballScore Watch App/BasketballScoreApp.swift`

- [ ] **Step 1: Open BasketballScoreApp.swift**

  It currently contains the default app scaffold. Replace its entire contents:

  ```swift
  import SwiftUI

  @main
  struct BasketballScoreApp: App {
      @StateObject private var vm = GameViewModel()
      @State private var path = NavigationPath()

      var body: some Scene {
          WindowGroup {
              NavigationStack(path: $path) {
                  SetupView(path: $path)
                      .navigationDestination(for: AppScreen.self) { screen in
                          switch screen {
                          case .game:
                              GameView(path: $path)
                          case .win:
                              WinView(path: $path)
                          }
                      }
              }
              .environmentObject(vm)
          }
      }
  }
  ```

- [ ] **Step 2: Build and run on the Watch Simulator**

  Select the **Watch Simulator** target (e.g. Apple Watch Series 9 - 45mm). Press **⌘R**.

  Verify the full flow manually:
  1. SetupView loads with win score defaulting to 15
  2. Digital Crown scrolls the win score picker
  3. Tap "Start Game" → GameView appears
  4. Tap +1/+2 buttons for both teams — scores increment
  5. Tap Undo — last score reverses, Undo button grays out if no more history
  6. Score a team to the win score → WinView appears automatically
  7. Feel haptic on WinView arrival (physical device only)
  8. Tap "New Game" → returns to SetupView with all state reset

- [ ] **Step 3: Run all unit tests one final time**

  Press **⌘U**. Expected: All tests pass.

- [ ] **Step 4: Commit**

  ```bash
  git add "BasketballScore Watch App/BasketballScoreApp.swift"
  git commit -m "feat: wire NavigationStack, EnvironmentObject, and full screen flow"
  ```

---

## Done

The app is complete. All screens are wired, all ViewModel logic is tested, and the full pickup game flow works end-to-end.
