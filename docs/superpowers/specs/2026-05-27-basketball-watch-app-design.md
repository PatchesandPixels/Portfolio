# Basketball Score Recorder — Apple Watch App Design

**Date:** 2026-05-27
**Status:** Approved

---

## Overview

A watchOS app for tracking the score of a pickup basketball game. Designed for the player wearing the watch — one-handed, glanceable, fast to operate mid-game. No persistence, no series tracking, no cloud sync. One game at a time.

---

## Screen Flow

```
SetupView
   ↓ "Start Game" button
GameView
   ↓ win condition met (score reaches winScore)
WinView
   ↓ "New Game" button
SetupView  ← resets all state
```

Built with SwiftUI for watchOS. Navigation managed by `NavigationStack`. A single `GameViewModel` (`ObservableObject`) is instantiated at the app root and injected via `@EnvironmentObject` into all three views.

---

## Setup Screen (`SetupView`)

Two configurable settings before the game starts:

### Win Score
- `Picker` in `.wheel` style, driven by the Digital Crown
- Options: `11, 15, 21, 25, 32`
- **Default: 15**

### Scoring Type
- Segmented or list-style `Picker` with two options:
  - `1s & 2s` — score buttons award 1 or 2 points
  - `1s, 2s & 3s` — score buttons award 1, 2, or 3 points
- Default: `1s & 2s`

### Action
- **"Start Game"** button at the bottom — pushes to `GameView`

---

## Game Screen (`GameView`)

Screen is split into two halves — **Home** (top) and **Away** (bottom).

Each half shows:
- Team label: `Home` or `Away`
- Current score — large, bold display
- Score buttons:
  - `1s & 2s` mode: `+1` and `+2`
  - `1s, 2s & 3s` mode: `+1`, `+2`, and `+3`

At the bottom of the screen:
- **⟲ Undo** button — reverses the most recent scoring action (single level of undo). Disabled if no action has been taken yet.

### Win Detection
When either team's score reaches `winScore`, the app immediately navigates to `WinView`. No confirmation required.

---

## Win Screen (`WinView`)

Displayed when a team reaches the win score.

Content:
- `🏀 [Home / Away] Wins!` — large, prominent text
- Final score displayed beneath — e.g. `21 – 18`
- **"New Game"** button — resets `GameViewModel` to defaults and pops back to `SetupView`

### Haptic
On arrival, fires `WKInterfaceDevice.current().play(.success)` so the win registers even without looking at the watch.

---

## Data Model

One `GameViewModel` class owns all state. No persistence — state is reset on new game.

```swift
enum ScoringType {
    case oneAndTwo          // 1s & 2s
    case oneAndTwoAndThree  // 1s, 2s & 3s
}

enum Team {
    case home
    case away
}

struct ScoreAction {
    let team: Team
    let points: Int
}

class GameViewModel: ObservableObject {
    // Setup
    @Published var winScore: Int = 15
    @Published var scoringType: ScoringType = .oneAndTwo

    // Game
    @Published var homeScore: Int = 0
    @Published var awayScore: Int = 0
    @Published var lastAction: ScoreAction? = nil

    // Derived
    var winner: Team? {
        if homeScore >= winScore { return .home }
        if awayScore >= winScore { return .away }
        return nil
    }

    // Actions
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

    func reset() {
        winScore = 15
        scoringType = .oneAndTwo
        homeScore = 0
        awayScore = 0
        lastAction = nil
    }
}
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Platform | watchOS 10+ |
| UI Framework | SwiftUI |
| State Management | `ObservableObject` + `@EnvironmentObject` |
| Navigation | `NavigationStack` |
| Haptics | `WKInterfaceDevice` |
| Persistence | None |

---

## Out of Scope

- Companion iPhone app
- Game history / persistence
- Custom team names
- Series tracking (first to win N games)
- Shot clock or game timer
- Player statistics
