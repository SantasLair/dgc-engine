# DGC Engine – Improvement Proposal

Date: 2025-08-08
Status: Proposal (in progress)
Audience: Maintainers and contributors of dgc-engine

## Summary

This document proposes focused improvements to the current engine to increase determinism, performance, and developer ergonomics while aligning with the project’s GameMaker-style architecture and Rapid (rapid-render) immediate-mode rendering.

Goals:
- Single, consistent engine/drawing path (remove duplication)
- Deterministic, fixed-step simulation with clean event phases
- Preloaded, cached sprite/texture pipeline
- Correct input/coordinate mapping and cleanup
- Solid collision bounds with a path to scalable spatial queries
- Clear public API for object/room orchestration
- Debug controls without per-frame console noise
- Stronger typing and lifecycle hygiene

### Recent changes
- 2025-08-08: Removed legacy Rapid variants; only `DGCEngine` + `DGCDrawingSystem` remain. `.ai-context.md` updated.

## Prioritized Improvements

1) Unify engines and drawing systems (Done: remove duplicates)
- Background: Previously had `DGCEngine`/`DGCDrawingSystem` and `DGCRapidEngine`/`DGCRapidDrawingSystem`.
- Current: Only `DGCEngine` + `DGCDrawingSystem` remain (2025‑08‑08). Follow-ups:
  - Extract `InputManager` into `src/engine/InputManager.ts` and reuse.
  - Inject engine config/coord utilities into drawing system; remove hardcoded cell/offsets.
- Impacted files: `src/engine/DGCEngine.ts`, `src/engine/DGCDrawingSystem.ts`.
  - Note 2025‑08‑08: `DGCRapidDrawingSystem.ts` removed; `DGCRapidEngine.ts` not present/used.

2) Fixed timestep with clean phases (update vs render)
- Problem: The loop uses rAF with an “if delta >= targetFrameTime” gate, causing uneven updates; object events are processed during render.
- Plan:
  - Implement accumulator-based fixed-step (e.g., 1000/60 ms). While accumulator >= step: update(); cap max loops.
  - Phase separation:
    - Update phase: queue + process step events (begin/step/end).
    - Render phase: queue + process draw events (draw/draw_gui).
- Impacted files: `DGCEngine.ts`, `EventManager.ts` (phase-aware processing), `GameObjectManager.ts` (when to queue).

3) Event system determinism
- Problem: Event execution timing mixes with render; ordering not explicit.
- Plan:
  - Add `processStepEvents()` and `processDrawEvents()` (or a phase parameter) in `EventManager`.
  - Define ordering: step events by stable creation order (id); draw events by depth, stable for ties.
- Impacted: `EventManager.ts`, `GameObjectManager.ts`, `DGCEngine.ts`.

4) Texture/sprite preload and caching (zero-allocation render path)
- Problem: `DGCDrawingSystem.drawSpriteFromSprite` creates textures per frame asynchronously; leads to churn and flicker.
- Plan:
  - `SpriteManager` loads images and creates Rapid textures once; store on `DGCSprite` (image + texture, plus frame atlas if needed).
  - Drawing system uses the cached texture and sub-rects synchronously.
- Impacted: `DGCDrawingSystem.ts`, `DGCSprite.ts`, `SpriteManager.ts`.

5) Input handling extraction and correctness
- Problems: Input manager duplicated; no dispose; mouse coords may be wrong with CSS scaling/devicePixelRatio; global preventDefault can be intrusive.
- Plan:
  - New `InputManager` module taking a canvas reference; add `dispose()`.
  - Compute mouse position in canvas pixel space with rect scaling; provide helpers for grid coords.
  - Optional config flags (captureFocus, preventDefaultKeys).
- Impacted: new `src/engine/InputManager.ts`; update `DGCEngine.ts` and remove duplicate classes.

6) Correct collision bounds and prepare for spatial partitioning
- Problems: `boundingBox` defaults to zero; collision ignores origin/scale/sprite dimensions; `maskSprite` unused.
- Plan:
  - Maintain width/height or AABB per instance based on sprite frame size, origin, scale; recompute on changes.
  - Abstract collision set and add an optional spatial index (uniform grid or quadtree) for larger scenes.
- Impacted: `GameObject.ts`, `GameObjectManager.ts`.

7) Room orchestration inside the engine loop
- Problem: `RoomManager` lives in `DGCGame` but the engine loop doesn’t drive room step/draw explicitly.
- Plan:
  - Add `DGCEngine.setRoomManager(roomManager)` and call `roomManager.step()` during update and `roomManager.draw()` during render.
  - Ensure object transfers happen on room switch before first update/draw; sprite resolution runs once per activation.
- Impacted: `DGCEngine.ts`, `DGCGame.ts`, `RoomManager.ts`, `Room.ts`.

8) Public API for object creation and queries
- Problem: `DGCGame.createGameObject` pokes a private field (`engine['gameObjectManager']`).
- Plan:
  - Add `engine.createObject(type, x, y, props)` and `engine.removeObject(id|object)`; keep `getObjectManager()` for advanced cases.
- Impacted: `DGCEngine.ts`, `DGCGame.ts`.

9) Debug controls and logging hygiene
- Problem: Per-frame console logs in draw/update paths harm performance.
- Plan:
  - Add `debug` flags to config (e.g., `debug.logging`, `debug.overlay`).
  - Implement a lightweight debug overlay (FPS, objects, frame time) toggled by config or a key.
- Impacted: `DGCEngineConfig.ts`, `DGCEngine.ts`, `GameObjectManager.ts`.

10) Stronger typing and lifecycle hygiene
- Plan:
  - Event payloads as discriminated unions; typed `EventScript` per event.
  - Ensure `stop()` clears rAF, empties queues, and disposes input listeners; null checks for idempotency.
  - Add layers to reduce per-frame sorting (bucket by depth/layer).
- Impacted: `EventManager.ts`, `DGCEngine.ts`, `GameObjectManager.ts`, `InputManager.ts`.

11) Grid math centralization
- Plan:
  - Route all grid/screen conversions through engine helpers; drawing system receives a mapper or `DGCEngineConfig` reference.
- Impacted: `DGCDrawingSystem.ts`, `DGCEngine.ts`.

## Phased Migration Plan

Phase 1 (Low risk, fast wins)
- Extract `InputManager` module; wire into `DGCEngine`. Add dispose().
- Add `engine.createObject()` and remove reflective access in `DGCGame`.
- Remove per-frame logs; add `debug` flag in config.
- Make `DGCDrawingSystem` use engine grid helpers; remove hardcoded offsets.

Phase 2 (Core loop and events)
- Implement fixed-step accumulator in `DGCEngine`.
- Split `EventManager` processing into step vs draw phases; update `GameObjectManager` queue points.

Phase 3 (Sprites, bounds, collisions)
- Preload textures in `SpriteManager` and store on `DGCSprite`; update drawing to use cached textures.
- Compute instance AABBs from sprite/frame/scale/origin; fix `collidesWith`.
- Add a simple spatial partition hook (toggle via config).

Phase 4 (Rooms and layering)
- Add room manager wiring to engine loop; ensure room activation transfer order is correct.
- Introduce optional draw layers/buckets to avoid full sort each frame.

## Risks & Mitigations
- API breakage: Introduce deprecations and shims (e.g., keep old engine class for one release with warnings).
- Timing changes can reveal hidden bugs: Gate fixed-step behind a config flag (`useFixedTimestep`) for one milestone.
- Texture cache consistency: Validate `SpriteManager` lifecycle events (load/unload on room activate/deactivate).

## Acceptance Criteria
- Single engine/drawing path with no duplicated classes.
- Stable, deterministic step order; draw order by depth is stable for ties.
- No per-frame allocations or async in render path for sprites.
- Mouse coordinates and key states correct across DPI/CSS scales; listeners cleaned up on stop.
- Collision works with scaled/origin-adjusted sprites; optional spatial index is pluggable.
- Public API provides object creation/removal without private field access.
- Debug overlay replaces noisy logs and can be toggled at runtime.

## References (in-repo)
- `src/engine/DGCEngine.ts`, `src/engine/DGCGame.ts`
- `src/engine/DGCDrawingSystem.ts`
- `src/engine/GameObjectManager.ts`, `src/engine/GameObject.ts`, `src/engine/EventManager.ts`
- `src/engine/Room.ts`, `src/engine/RoomFactory.ts`, `src/engine/SpriteManager.ts`, `src/engine/DGCEngineConfig.ts`

---

Appendix: Quick Wins Checklist
- [x] Remove unused `DGCRapid*` files and update references (2025‑08‑08)
- [ ] Extract `InputManager` and wire dispose()
- [ ] Add `engine.createObject()` and update `DGCGame`
- [ ] Remove per-frame logs; add `debug.logging` flag
- [ ] Remove hardcoded grid math in drawing system
- [ ] Add fixed-step loop (guarded by config)
- [ ] Split event processing by phase
- [ ] Cache sprite textures; render sync only
- [ ] Compute correct AABB; update collidesWith
- [ ] Wire `RoomManager` into engine loop
- [ ] Add debug overlay toggle
