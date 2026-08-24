"use strict";

/*
 * BUILD N' STACK - MASTER TUNING CONTROLS
 * ------------------------------------------------------------
 * All important gameplay values live in GAME_CONFIG. Units are noted beside
 * each value. Open the game with ?debug=1 to adjust the most useful values
 * live. The debug panel can copy the complete config as JSON.
 */
const GAME_CONFIG = {
    world: {
        logicalHeight: 1000,       // Canvas world height in logical pixels.
        minimumWidth: 620,         // Narrowest logical world shown on portrait devices.
        maximumWidth: 1500,        // Widest logical world shown on landscape devices.
        groundScreenY: 0.82,       // Ground position as a fraction of screen height at camera Y=0.
        foundationWidth: 540,      // Width of the solid starting platform in world pixels.
        foundationHeight: 130,     // Thickness of the platform physics body.
        pixelRatioCap: 2           // Caps rendering work on very high-density screens.
    },

    physics: {
        gravityY: 1.02,            // Matter.js gravity strength. Higher values fall faster.
        gravityScale: 0.001,       // Gravity scale. Usually keep close to Matter's default.
        fixedStepMs: 1000 / 60,    // Fixed physics update interval for consistent devices.
        maxUpdatesPerFrame: 5,     // Prevents a slow frame from creating a physics spiral.
        positionIterations: 10,    // Higher values improve stacked-body stability at a CPU cost.
        velocityIterations: 8,
        constraintIterations: 4,
        enableSleeping: true       // Lets stable boxes sleep, improving long-run performance.
    },

    crane: {
        startSpeed: 112,           // Hook travel speed in world pixels per second.
        maximumSpeed: 245,         // Fastest hook speed after difficulty increases.
        speedIncreasePerBox: 3.5,  // Extra hook speed for each safely placed box.
        travelMargin: 115,         // Distance kept clear from each side of the visible world.
        dropGap: 500,              // Vertical space from tower top to crane hook.
        hookSpriteSize: 96,        // Display width/height of crane-hook.svg in logical pixels.
        hookContactOffset: 35,     // Hook pivot to its visible bottom edge; tune after editing the SVG.
        hookBoxOverlap: 8,         // Pixels of hook hidden behind the attached box so no gap is visible.
        inheritHorizontalSpeed: false, // False makes blocks fall straight down as requested.
        inheritedSpeedFactor: 0.28,
        spawnDelayMs: 650,         // Pause after a successful landing before the next block.
        cableSwayAmount: 2.5       // Small visual sway in pixels; it does not affect physics.
    },

    blockDefaults: {
        density: 0.0027,           // Overall mass per area. Individual types can override it.
        friction: 0.72,            // Sliding friction between blocks.
        frictionStatic: 0.95,      // Resistance before a resting block begins sliding.
        frictionAir: 0.008,        // Air resistance while falling.
        restitution: 0.035,        // Bounce. Keep low for heavy construction materials.
        chamferRadius: 2            // Tiny rounded physics corners reduce collision snagging.
    },

    landing: {
        minimumAirTimeMs: 180,     // Earliest time a drop may be accepted as landed.
        maxLinearSpeed: 0.32,      // Body speed must remain below this value to count.
        maxAngularSpeed: 0.018,    // Rotation speed must remain below this value to count.
        stableHoldMs: 620,         // Time the block must stay stable before score is awarded.
        perfectOffset: 13,         // Centre offset in pixels that earns PERFECT feedback.
        hardImpactSpeed: 7.5       // Impact speed that triggers stronger shake and particles.
    },

    loss: {
        fallDistanceFromRest: 125, // A scored block dropping this far causes game over.
        missedTowerDistance: 390,  // Current block may not fall this far below the tower top.
        horizontalWorldPadding: 260, // Extra side distance before an escaped block is lost.
        gameOverDelayMs: 360       // Lets the failure remain visible before showing the overlay.
    },

    camera: {
        smoothing: 0.075,          // 0 = no movement, 1 = instant movement.
        targetTopOffset: 205,      // Headroom logic: larger values delay upward movement.
        shakeDecay: 0.88,
        maximumShake: 13,
        foregroundParallax: 0.48,
        midgroundParallax: 0.2,
        cloudParallax: 0.08
    },

    difficulty: {
        randomizeBlockOrder: true, // False cycles through the six block types in order.
        activeDynamicBlocks: 48    // Older off-screen blocks are frozen for endless performance.
    },

    scoring: {
        pointsPerBlock: 1,         // Simple and transparent leaderboard scoring.
        leaderboardSize: 10
    },

    atmosphere: {
        startPhase: 0.16,          // Starts each run in a bright morning sky.
        dayNightCycleSeconds: 210, // Full morning-to-night-to-morning cycle duration.
        cloudSpeed: 7,             // Logical pixels per second.
        birdSpeed: 15,
        particleCount: 12,
        maxParticles: 100
    },

    audio: {
        enabledByDefault: true,
        masterVolume: 0.16,
        dropFrequency: 130,
        landingFrequency: 82,
        perfectFrequency: 520,
        failureFrequency: 58
    },

    storage: {
        runsKey: "buildnstack.runs.v1",
        soundKey: "buildnstack.sound.v1",
        playerKey: "buildnstack.player.v1",
        adminPassword: "MEDICUS", // Convenience lock only; never production-grade security.
        consentVersion: "prototype-2026-08"
    },

    assets: {
        loadCustomSprites: true, // Loads the editable SVG starter kit from assets/images/.
        hook: "./assets/images/crane/crane-hook.svg",
        foreground: "./assets/images/backgrounds/foreground.svg",
        midground: "./assets/images/backgrounds/midground.svg",
        clouds: [
            "./assets/images/backgrounds/cloud-01.svg",
            "./assets/images/backgrounds/cloud-02.svg",
            "./assets/images/backgrounds/cloud-03.svg"
        ],
        birds: [
            "./assets/images/backgrounds/bird-01.svg",
            "./assets/images/backgrounds/bird-02.svg",
            "./assets/images/backgrounds/bird-03.svg"
        ]
    },

    /*
     * Open the six SVG files below directly in Illustrator. Physics width,
     * height and material values can be tuned separately for every variation.
     */
    boxes: [
        { id: "timber-crate", label: "Timber Crate", texture: "./assets/images/boxes/box-01-timber-crate.svg", width: 156, height: 108, density: 0.0023, color: "#c88b3a", pattern: "crate" },
        { id: "red-bricks", label: "Red Bricks", texture: "./assets/images/boxes/box-02-red-bricks.svg", width: 166, height: 92, density: 0.0032, color: "#a94c34", pattern: "bricks" },
        { id: "wood-beams", label: "Wood Beams", texture: "./assets/images/boxes/box-03-wood-beams.svg", width: 190, height: 74, density: 0.0024, color: "#b77a35", pattern: "wood" },
        { id: "steel-beams", label: "Steel Beams", texture: "./assets/images/boxes/box-04-steel-beams.svg", width: 188, height: 70, density: 0.0038, color: "#657178", pattern: "steel" },
        { id: "window-bricks", label: "Bricks with Window", texture: "./assets/images/boxes/box-05-window-bricks.svg", width: 158, height: 116, density: 0.003, color: "#b3613f", pattern: "window" },
        { id: "cat-cargo", label: "CAT Cargo", texture: "./assets/images/boxes/box-06-cat-cargo.svg", width: 164, height: 102, density: 0.0028, color: "#e3a900", pattern: "cargo" }
    ],

    debug: {
        showBodies: false
    }
};

const DEFAULT_CONFIG = JSON.parse(JSON.stringify(GAME_CONFIG));
window.BuildNStackConfig = GAME_CONFIG;

const DOM = {
    screens: {
        menu: document.querySelector("#menuScreen"),
        form: document.querySelector("#formScreen"),
        game: document.querySelector("#gameScreen"),
        leaderboard: document.querySelector("#leaderboardScreen"),
        gameOver: document.querySelector("#gameOverScreen")
    },
    beginButton: document.querySelector("#beginButton"),
    menuLeaderboardButton: document.querySelector("#menuLeaderboardButton"),
    playerForm: document.querySelector("#playerForm"),
    scoreValue: document.querySelector("#scoreValue"),
    soundButton: document.querySelector("#soundButton"),
    quitButton: document.querySelector("#quitButton"),
    gamePrompt: document.querySelector("#gamePrompt"),
    placementMessage: document.querySelector("#placementMessage"),
    finalScore: document.querySelector("#finalScore"),
    bestScore: document.querySelector("#bestScore"),
    gameOverReason: document.querySelector("#gameOverReason"),
    playAgainButton: document.querySelector("#playAgainButton"),
    gameOverLeaderboardButton: document.querySelector("#gameOverLeaderboardButton"),
    leaderboardList: document.querySelector("#leaderboardList"),
    leaderboardEmpty: document.querySelector("#leaderboardEmpty"),
    clearLeaderboardButton: document.querySelector("#clearLeaderboardButton"),
    passwordDialog: document.querySelector("#passwordDialog"),
    clearPassword: document.querySelector("#clearPassword"),
    passwordError: document.querySelector("#passwordError"),
    confirmClearButton: document.querySelector("#confirmClearButton"),
    debugPanel: document.querySelector("#debugPanel"),
    canvas: document.querySelector("#gameCanvas")
};

const StorageService = {
    read(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.warn("Build n' Stack could not read local data.", error);
            return fallback;
        }
    },

    write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn("Build n' Stack could not save local data.", error);
            return false;
        }
    },

    getRuns() {
        const runs = this.read(GAME_CONFIG.storage.runsKey, []);
        return Array.isArray(runs) ? runs : [];
    },

    saveRun(player, score, durationMs) {
        const runs = this.getRuns();
        const record = {
            runId: createRunId(),
            playerName: player.name.trim(),
            contactNumber: player.phone.trim(),
            email: player.email.trim().toLowerCase(),
            score,
            durationMs: Math.max(0, Math.round(durationMs)),
            consentVersion: GAME_CONFIG.storage.consentVersion,
            consentAt: player.consentAt,
            completedAt: new Date().toISOString(),
            synced: false
        };
        runs.push(record);
        this.write(GAME_CONFIG.storage.runsKey, runs);
        return record;
    },

    getLeaderboard() {
        const bestByEmail = new Map();
        this.getRuns().forEach((run) => {
            const identity = run.email || `${run.playerName}-${run.contactNumber}`;
            const previous = bestByEmail.get(identity);
            if (!previous || run.score > previous.score || (run.score === previous.score && run.completedAt < previous.completedAt)) {
                bestByEmail.set(identity, run);
            }
        });

        return [...bestByEmail.values()]
            .sort((a, b) => b.score - a.score || a.completedAt.localeCompare(b.completedAt))
            .slice(0, GAME_CONFIG.scoring.leaderboardSize);
    },

    getBestScore(email) {
        const normalized = String(email || "").trim().toLowerCase();
        return this.getRuns()
            .filter((run) => run.email === normalized)
            .reduce((best, run) => Math.max(best, Number(run.score) || 0), 0);
    },

    clearRuns() {
        try {
            localStorage.removeItem(GAME_CONFIG.storage.runsKey);
            return true;
        } catch (error) {
            return false;
        }
    }
};

const AudioService = {
    context: null,
    enabled: StorageService.read(GAME_CONFIG.storage.soundKey, GAME_CONFIG.audio.enabledByDefault),

    unlock() {
        if (!this.context) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) this.context = new AudioContextClass();
        }
        if (this.context?.state === "suspended") this.context.resume();
    },

    toggle() {
        this.enabled = !this.enabled;
        StorageService.write(GAME_CONFIG.storage.soundKey, this.enabled);
        updateSoundButton();
        if (this.enabled) {
            this.unlock();
            this.tone(420, 0.06, "square", 0.4);
        }
    },

    tone(frequency, duration, type = "sine", volumeFactor = 1, slideTo = null) {
        if (!this.enabled) return;
        this.unlock();
        if (!this.context) return;

        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(Math.max(20, frequency), now);
        if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
        gain.gain.setValueAtTime(GAME_CONFIG.audio.masterVolume * volumeFactor, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
    },

    drop() { this.tone(GAME_CONFIG.audio.dropFrequency, 0.12, "triangle", 0.65, 72); },
    land(hard = false) { this.tone(GAME_CONFIG.audio.landingFrequency, hard ? 0.18 : 0.11, "square", hard ? 0.95 : 0.55, 46); },
    perfect() { this.tone(GAME_CONFIG.audio.perfectFrequency, 0.14, "sine", 0.75, 760); },
    fail() { this.tone(GAME_CONFIG.audio.failureFrequency, 0.6, "sawtooth", 0.8, 28); }
};

class StackGame {
    constructor(canvas, callbacks = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", { alpha: false });
        this.callbacks = callbacks;
        this.assets = new Map();
        this.stars = this.createStars(72);
        this.clouds = this.createClouds();
        this.birds = this.createBirds();
        this.boundFrame = (time) => this.frame(time);
        this.handleResize = () => this.resize();
        this.handlePointer = (event) => {
            if (event.target.closest?.(".game-hud, .debug-panel")) return;
            event.preventDefault();
            this.dropBlock();
        };
        this.preloadAssets();
        window.addEventListener("resize", this.handleResize, { passive: true });
        canvas.addEventListener("pointerdown", this.handlePointer);
    }

    preloadAssets() {
        const sources = [
            GAME_CONFIG.assets.hook,
            GAME_CONFIG.assets.foreground,
            GAME_CONFIG.assets.midground,
            ...GAME_CONFIG.assets.clouds,
            ...GAME_CONFIG.assets.birds,
            ...GAME_CONFIG.boxes.map((box) => box.texture)
        ];

        if (!GAME_CONFIG.assets.loadCustomSprites) {
            sources.forEach((source) => this.assets.set(source, null));
            return;
        }

        sources.forEach((source) => {
            const image = new Image();
            this.assets.set(source, null);
            image.decoding = "async";
            image.onload = () => this.assets.set(source, image);
            image.onerror = () => this.assets.set(source, null);
            image.src = source;
        });
    }

    start() {
        if (!window.Matter) throw new Error("Matter.js did not load. Check the network connection and reload.");
        this.stop();
        this.reset();
        this.active = true;
        this.lastFrameTime = performance.now();
        this.runStartedAt = this.lastFrameTime;
        this.spawnBlock();
        this.rafId = requestAnimationFrame(this.boundFrame);
    }

    reset() {
        const { Engine, Bodies, Composite } = Matter;
        this.engine = Engine.create({ enableSleeping: GAME_CONFIG.physics.enableSleeping });
        this.engine.gravity.y = GAME_CONFIG.physics.gravityY;
        this.engine.gravity.scale = GAME_CONFIG.physics.gravityScale;
        this.engine.positionIterations = GAME_CONFIG.physics.positionIterations;
        this.engine.velocityIterations = GAME_CONFIG.physics.velocityIterations;
        this.engine.constraintIterations = GAME_CONFIG.physics.constraintIterations;

        this.score = 0;
        this.phase = "starting";
        this.currentBlock = null;
        this.settledBlocks = [];
        this.particles = [];
        this.accumulator = 0;
        this.runTimeMs = 0;
        this.cameraY = 0;
        this.cameraTargetY = 0;
        this.cameraShake = 0;
        this.hookX = 0;
        this.hookDirection = 1;
        this.hookY = -GAME_CONFIG.crane.dropGap;
        this.settleTimer = 0;
        this.nextSpawnAt = 0;
        this.gameOverReason = "A block fell from the stack.";
        this.variantCursor = 0;

        this.resize();
        this.ground = Bodies.rectangle(
            0,
            GAME_CONFIG.world.foundationHeight / 2,
            GAME_CONFIG.world.foundationWidth,
            GAME_CONFIG.world.foundationHeight,
            { isStatic: true, label: "foundation", friction: 0.92, frictionStatic: 1.1, restitution: 0 }
        );
        Composite.add(this.engine.world, this.ground);
        this.callbacks.onScore?.(0);
    }

    stop() {
        this.active = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }

    resize() {
        const bounds = this.canvas.getBoundingClientRect();
        const cssWidth = Math.max(1, bounds.width || window.innerWidth);
        const cssHeight = Math.max(1, bounds.height || window.innerHeight);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, GAME_CONFIG.world.pixelRatioCap);
        this.canvas.width = Math.round(cssWidth * pixelRatio);
        this.canvas.height = Math.round(cssHeight * pixelRatio);
        this.view = {
            width: clamp(GAME_CONFIG.world.logicalHeight * (cssWidth / cssHeight), GAME_CONFIG.world.minimumWidth, GAME_CONFIG.world.maximumWidth),
            height: GAME_CONFIG.world.logicalHeight,
            scale: this.canvas.height / GAME_CONFIG.world.logicalHeight,
            pixelRatio
        };
    }

    spawnBlock() {
        if (!this.active || this.phase === "game-over") return;
        const { Bodies, Body, Composite } = Matter;
        const variant = this.pickVariant();
        this.hookY = this.getTowerTop() - GAME_CONFIG.crane.dropGap;
        const body = Bodies.rectangle(
            this.hookX,
            this.getAttachedBlockY(variant),
            variant.width,
            variant.height,
            {
                isStatic: false,
                label: `block:${variant.id}`,
                density: variant.density ?? GAME_CONFIG.blockDefaults.density,
                friction: variant.friction ?? GAME_CONFIG.blockDefaults.friction,
                frictionStatic: variant.frictionStatic ?? GAME_CONFIG.blockDefaults.frictionStatic,
                frictionAir: variant.frictionAir ?? GAME_CONFIG.blockDefaults.frictionAir,
                restitution: variant.restitution ?? GAME_CONFIG.blockDefaults.restitution,
                chamfer: { radius: GAME_CONFIG.blockDefaults.chamferRadius },
                collisionFilter: { category: 0x0002, mask: 0 }
            }
        );
        Body.setAngle(body, 0);
        body.plugin.stackData = {
            variant,
            state: "attached",
            droppedAt: 0,
            impactPlayed: false,
            restY: null,
            restX: null,
            frozen: false
        };
        Composite.add(this.engine.world, body);
        Matter.Sleeping.set(body, true);
        this.currentBlock = body;
        this.phase = "ready";
        this.settleTimer = 0;
        this.callbacks.onReady?.();
    }

    getAttachedBlockY(variant) {
        return this.hookY
            + GAME_CONFIG.crane.hookContactOffset
            + variant.height / 2
            - GAME_CONFIG.crane.hookBoxOverlap;
    }

    pickVariant() {
        if (!GAME_CONFIG.difficulty.randomizeBlockOrder) {
            const variant = GAME_CONFIG.boxes[this.variantCursor % GAME_CONFIG.boxes.length];
            this.variantCursor += 1;
            return variant;
        }
        return GAME_CONFIG.boxes[Math.floor(Math.random() * GAME_CONFIG.boxes.length)];
    }

    dropBlock() {
        if (!this.active || this.phase !== "ready" || !this.currentBlock) return false;
        const { Body, Sleeping } = Matter;
        const block = this.currentBlock;
        Sleeping.set(block, false);
        block.collisionFilter.mask = 0xFFFFFFFF;
        Body.setVelocity(block, {
            x: GAME_CONFIG.crane.inheritHorizontalSpeed
                ? this.getCraneSpeed() * this.hookDirection * GAME_CONFIG.crane.inheritedSpeedFactor / 60
                : 0,
            y: 0
        });
        Body.setAngularVelocity(block, 0);
        block.plugin.stackData.state = "falling";
        block.plugin.stackData.droppedAt = this.runTimeMs;
        block.plugin.stackData.towerTopAtDrop = this.getTowerTop();
        this.phase = "falling";
        this.settleTimer = 0;
        AudioService.drop();
        this.callbacks.onDrop?.();
        return true;
    }

    frame(time) {
        if (!this.active) return;
        const elapsed = Math.min(100, time - this.lastFrameTime);
        this.lastFrameTime = time;
        this.accumulator += elapsed;
        this.runTimeMs += elapsed;

        let updates = 0;
        while (this.accumulator >= GAME_CONFIG.physics.fixedStepMs && updates < GAME_CONFIG.physics.maxUpdatesPerFrame) {
            this.update(GAME_CONFIG.physics.fixedStepMs);
            this.accumulator -= GAME_CONFIG.physics.fixedStepMs;
            updates += 1;
        }
        if (updates === GAME_CONFIG.physics.maxUpdatesPerFrame) this.accumulator = 0;

        this.updateVisuals(elapsed);
        this.render();
        this.rafId = requestAnimationFrame(this.boundFrame);
    }

    update(stepMs) {
        const { Body, Engine } = Matter;
        const dt = stepMs / 1000;

        this.engine.gravity.y = GAME_CONFIG.physics.gravityY;
        this.engine.gravity.scale = GAME_CONFIG.physics.gravityScale;

        if (this.phase === "ready" && this.currentBlock) {
            const halfTravel = Math.max(90, this.view.width / 2 - GAME_CONFIG.crane.travelMargin);
            this.hookX += this.getCraneSpeed() * this.hookDirection * dt;
            if (this.hookX >= halfTravel) {
                this.hookX = halfTravel;
                this.hookDirection = -1;
            } else if (this.hookX <= -halfTravel) {
                this.hookX = -halfTravel;
                this.hookDirection = 1;
            }
            const variant = this.currentBlock.plugin.stackData.variant;
            Body.setPosition(this.currentBlock, { x: this.hookX, y: this.getAttachedBlockY(variant) });
            Body.setVelocity(this.currentBlock, { x: 0, y: 0 });
            Matter.Sleeping.set(this.currentBlock, true);
        }

        Engine.update(this.engine, stepMs);

        if (this.phase === "falling") this.updateFallingBlock(stepMs);
        this.checkSettledBlocks();

        if (this.phase === "waiting-next" && this.runTimeMs >= this.nextSpawnAt) this.spawnBlock();
    }

    updateFallingBlock(stepMs) {
        if (!this.currentBlock) return;
        const block = this.currentBlock;
        const data = block.plugin.stackData;
        const supports = [this.ground, ...this.settledBlocks];
        const collisions = Matter.Query.collides(block, supports);
        const hasSupport = collisions.length > 0;
        const airTime = this.runTimeMs - data.droppedAt;

        if (hasSupport && !data.impactPlayed) {
            data.impactPlayed = true;
            const hard = block.speed >= GAME_CONFIG.landing.hardImpactSpeed;
            AudioService.land(hard);
            this.cameraShake = Math.min(
                GAME_CONFIG.camera.maximumShake,
                this.cameraShake + block.speed * (hard ? 1.25 : 0.65)
            );
            this.createImpactParticles(block.position.x, block.bounds.max.y, hard ? 1.6 : 1);
        }

        const isSlow = block.speed <= GAME_CONFIG.landing.maxLinearSpeed;
        const isRotationSlow = Math.abs(block.angularSpeed) <= GAME_CONFIG.landing.maxAngularSpeed;
        if (hasSupport && airTime >= GAME_CONFIG.landing.minimumAirTimeMs && isSlow && isRotationSlow) {
            this.settleTimer += stepMs;
            if (this.settleTimer >= GAME_CONFIG.landing.stableHoldMs) this.acceptPlacement(collisions);
        } else {
            this.settleTimer = 0;
        }

        const missedLimit = data.towerTopAtDrop + GAME_CONFIG.loss.missedTowerDistance;
        const horizontalLimit = this.view.width / 2 + GAME_CONFIG.loss.horizontalWorldPadding;
        if (block.position.y > missedLimit || Math.abs(block.position.x) > horizontalLimit) {
            this.triggerGameOver("The dropped block missed the structure.");
        }
    }

    acceptPlacement(collisions) {
        if (!this.currentBlock || this.phase !== "falling") return;
        const block = this.currentBlock;
        const data = block.plugin.stackData;
        data.state = "settled";
        data.restY = block.position.y;
        data.restX = block.position.x;
        data.restAngle = block.angle;
        this.settledBlocks.push(block);

        const supportingBody = collisions
            .map((collision) => collision.bodyA === block ? collision.bodyB : collision.bodyA)
            .sort((a, b) => a.position.y - b.position.y)[0] || this.ground;
        const offset = Math.abs(block.position.x - supportingBody.position.x);
        const perfect = offset <= GAME_CONFIG.landing.perfectOffset;

        this.currentBlock = null;
        this.score += GAME_CONFIG.scoring.pointsPerBlock;
        this.phase = "waiting-next";
        this.nextSpawnAt = this.runTimeMs + GAME_CONFIG.crane.spawnDelayMs;
        this.cameraTargetY = Math.min(0, this.getTowerTop() + GAME_CONFIG.camera.targetTopOffset);
        this.freezeOldBlocks();

        if (perfect) AudioService.perfect();
        this.callbacks.onScore?.(this.score);
        this.callbacks.onPlacement?.(perfect ? "PERFECT" : "SECURE");
    }

    checkSettledBlocks() {
        if (this.phase === "game-over") return;
        const horizontalLimit = this.view.width / 2 + GAME_CONFIG.loss.horizontalWorldPadding;
        const fallen = this.settledBlocks.find((block) => {
            const data = block.plugin.stackData;
            if (data.frozen || data.restY === null) return false;
            return block.position.y > data.restY + GAME_CONFIG.loss.fallDistanceFromRest
                || Math.abs(block.position.x) > horizontalLimit;
        });
        if (fallen) this.triggerGameOver("A placed block fell from the stack.");
    }

    freezeOldBlocks() {
        const activeBlocks = this.settledBlocks.filter((block) => !block.plugin.stackData.frozen);
        const extra = activeBlocks.length - GAME_CONFIG.difficulty.activeDynamicBlocks;
        if (extra <= 0) return;
        activeBlocks.slice(0, extra).forEach((block) => {
            Matter.Body.setStatic(block, true);
            block.plugin.stackData.frozen = true;
        });
    }

    triggerGameOver(reason) {
        if (!this.active || this.phase === "game-over") return;
        this.phase = "game-over";
        this.gameOverReason = reason;
        AudioService.fail();
        this.cameraShake = GAME_CONFIG.camera.maximumShake;
        const duration = this.runTimeMs;
        window.setTimeout(() => {
            if (this.phase !== "game-over") return;
            this.stop();
            this.callbacks.onGameOver?.({ score: this.score, durationMs: duration, reason });
        }, GAME_CONFIG.loss.gameOverDelayMs);
    }

    updateVisuals(elapsedMs) {
        const cameraEase = 1 - Math.pow(1 - GAME_CONFIG.camera.smoothing, elapsedMs / 16.667);
        this.cameraY += (this.cameraTargetY - this.cameraY) * cameraEase;
        this.cameraShake *= Math.pow(GAME_CONFIG.camera.shakeDecay, elapsedMs / 16.667);

        const dt = elapsedMs / 1000;
        this.particles.forEach((particle) => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vy += 75 * dt;
            particle.life -= dt;
        });
        this.particles = this.particles.filter((particle) => particle.life > 0).slice(-GAME_CONFIG.atmosphere.maxParticles);
    }

    render() {
        if (!this.view) return;
        const ctx = this.ctx;
        const shakeX = this.cameraShake ? (Math.random() - 0.5) * this.cameraShake : 0;
        const shakeY = this.cameraShake ? (Math.random() - 0.5) * this.cameraShake : 0;
        ctx.setTransform(this.view.scale, 0, 0, this.view.scale, shakeX * this.view.scale, shakeY * this.view.scale);
        ctx.clearRect(-20, -20, this.view.width + 40, this.view.height + 40);

        this.drawSky(ctx);
        this.drawStars(ctx);
        this.drawSunAndMoon(ctx);
        this.drawClouds(ctx);
        this.drawMidground(ctx);
        this.drawFoundation(ctx);
        this.drawCrane(ctx);
        this.drawBlocks(ctx);
        this.drawParticles(ctx);
        this.drawForeground(ctx);
        if (GAME_CONFIG.debug.showBodies) this.drawPhysicsOutlines(ctx);
    }

    drawSky(ctx) {
        const phase = this.getAtmospherePhase();
        const palette = getSkyPalette(phase);
        const gradient = ctx.createLinearGradient(0, 0, 0, this.view.height);
        gradient.addColorStop(0, palette.top);
        gradient.addColorStop(0.62, palette.bottom);
        gradient.addColorStop(1, palette.horizon);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.view.width, this.view.height);
    }

    drawStars(ctx) {
        const phase = this.getAtmospherePhase();
        const night = smoothNightAmount(phase);
        if (night <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = night * 0.9;
        this.stars.forEach((star, index) => {
            const pulse = 0.65 + Math.sin(this.runTimeMs * 0.002 + index) * 0.25;
            ctx.fillStyle = `rgba(255,255,230,${pulse})`;
            ctx.beginPath();
            ctx.arc(star.x * this.view.width, star.y * this.view.height * 0.72, star.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawSunAndMoon(ctx) {
        const phase = this.getAtmospherePhase();
        const angle = phase * Math.PI * 2 - Math.PI;
        const x = this.view.width * (0.5 + Math.cos(angle) * 0.42);
        const y = this.view.height * (0.63 + Math.sin(angle) * 0.52);
        const night = smoothNightAmount(phase);
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = night > 0.5 ? "#eef2d3" : "#ffe082";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(x, y, night > 0.5 ? 28 : 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawClouds(ctx) {
        const cameraShift = -this.cameraY * GAME_CONFIG.camera.cloudParallax;
        this.clouds.forEach((cloud, index) => {
            const travel = this.runTimeMs / 1000 * GAME_CONFIG.atmosphere.cloudSpeed * cloud.speed;
            const x = wrap(cloud.x * this.view.width + travel, -180, this.view.width + 180);
            const y = wrap(cloud.y + cameraShift, -160, this.view.height * 0.72);
            const source = GAME_CONFIG.assets.clouds[index % GAME_CONFIG.assets.clouds.length];
            const image = this.assets.get(source);
            ctx.save();
            ctx.globalAlpha = cloud.alpha;
            if (image) {
                const width = cloud.size * 2.2;
                ctx.drawImage(image, x - width / 2, y - cloud.size / 2, width, cloud.size);
            } else {
                this.drawFallbackCloud(ctx, x, y, cloud.size);
            }
            ctx.restore();
        });
    }

    drawFallbackCloud(ctx, x, y, size) {
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.72, size * 0.28, 0, 0, Math.PI * 2);
        ctx.ellipse(x - size * 0.3, y - size * 0.13, size * 0.32, size * 0.28, 0, 0, Math.PI * 2);
        ctx.ellipse(x + size * 0.12, y - size * 0.22, size * 0.42, size * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMidground(ctx) {
        const parallaxY = this.view.height * GAME_CONFIG.world.groundScreenY - this.cameraY * GAME_CONFIG.camera.midgroundParallax;
        const image = this.assets.get(GAME_CONFIG.assets.midground);
        if (image) {
            const ratio = image.width / image.height;
            const width = Math.max(this.view.width, 900);
            const height = width / ratio;
            ctx.drawImage(image, (this.view.width - width) / 2, parallaxY - height, width, height);
        } else {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = "#154d73";
            const base = parallaxY;
            const widths = [95, 150, 80, 125, 190, 88, 145, 110];
            let x = -20;
            widths.forEach((width, index) => {
                const height = 110 + ((index * 73) % 180);
                ctx.fillRect(x, base - height, width, height);
                ctx.fillStyle = "rgba(255,255,255,0.38)";
                for (let wy = base - height + 24; wy < base - 18; wy += 34) {
                    for (let wx = x + 18; wx < x + width - 12; wx += 27) ctx.fillRect(wx, wy, 11, 16);
                }
                ctx.fillStyle = "#154d73";
                x += width + 18;
            });
            ctx.restore();
        }

        this.drawBirds(ctx, parallaxY);
    }

    drawBirds(ctx, baseY) {
        this.birds.forEach((bird, index) => {
            const x = wrap(bird.x + this.runTimeMs / 1000 * GAME_CONFIG.atmosphere.birdSpeed * bird.speed, -100, this.view.width + 100);
            const y = baseY - bird.y + Math.sin(this.runTimeMs * 0.003 + index) * 6;
            const source = GAME_CONFIG.assets.birds[index % GAME_CONFIG.assets.birds.length];
            const image = this.assets.get(source);
            ctx.save();
            ctx.globalAlpha = 0.44;
            if (image) {
                ctx.drawImage(image, x - 24, y - 13, 48, 26);
            } else {
                ctx.strokeStyle = "#173d52";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x - 7, y, 8, Math.PI * 1.1, Math.PI * 1.9);
                ctx.arc(x + 7, y, 8, Math.PI * 1.1, Math.PI * 1.9);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    drawFoundation(ctx) {
        const top = this.worldToScreen(0, 0).y;
        ctx.fillStyle = "#6d7846";
        ctx.fillRect(0, top, this.view.width, this.view.height - top + 20);
        ctx.fillStyle = "#81943d";
        ctx.fillRect(0, top, this.view.width, 24);

        const left = this.worldToScreen(-GAME_CONFIG.world.foundationWidth / 2, 0).x;
        ctx.fillStyle = "#c5c2b7";
        ctx.fillRect(left, top, GAME_CONFIG.world.foundationWidth, 82);
        ctx.strokeStyle = "#555b5e";
        ctx.lineWidth = 4;
        ctx.strokeRect(left, top, GAME_CONFIG.world.foundationWidth, 82);
        ctx.fillStyle = "rgba(16,18,20,0.13)";
        for (let x = left + 38; x < left + GAME_CONFIG.world.foundationWidth; x += 84) {
            ctx.beginPath();
            ctx.arc(x, top + 34 + (x % 3) * 5, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBlocks(ctx) {
        const bodies = [...this.settledBlocks];
        if (this.currentBlock) bodies.push(this.currentBlock);
        bodies.forEach((body) => this.drawBlock(ctx, body));
    }

    drawBlock(ctx, body) {
        const data = body.plugin.stackData;
        if (!data?.variant) return;
        const variant = data.variant;
        const point = this.worldToScreen(body.position.x, body.position.y);
        const image = this.assets.get(variant.texture);
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(body.angle);
        if (image) {
            ctx.drawImage(image, -variant.width / 2, -variant.height / 2, variant.width, variant.height);
        } else {
            this.drawFallbackBlock(ctx, variant);
        }
        ctx.restore();
    }

    drawFallbackBlock(ctx, variant) {
        const x = -variant.width / 2;
        const y = -variant.height / 2;
        ctx.fillStyle = variant.color;
        ctx.fillRect(x, y, variant.width, variant.height);
        ctx.strokeStyle = "#2a261f";
        ctx.lineWidth = 5;
        ctx.strokeRect(x, y, variant.width, variant.height);

        if (variant.pattern === "crate") {
            ctx.lineWidth = 9;
            ctx.strokeStyle = "#68451e";
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 10); ctx.lineTo(x + variant.width - 10, y + variant.height - 10);
            ctx.moveTo(x + variant.width - 10, y + 10); ctx.lineTo(x + 10, y + variant.height - 10);
            ctx.stroke();
        } else if (variant.pattern === "bricks" || variant.pattern === "window") {
            ctx.strokeStyle = "rgba(50,28,20,0.58)";
            ctx.lineWidth = 3;
            for (let row = 1; row < 4; row += 1) {
                const rowY = y + row * variant.height / 4;
                ctx.beginPath(); ctx.moveTo(x, rowY); ctx.lineTo(x + variant.width, rowY); ctx.stroke();
                const offset = row % 2 ? variant.width / 6 : 0;
                for (let column = offset; column < variant.width; column += variant.width / 3) {
                    ctx.beginPath(); ctx.moveTo(x + column, rowY - variant.height / 4); ctx.lineTo(x + column, rowY); ctx.stroke();
                }
            }
            if (variant.pattern === "window") {
                ctx.fillStyle = "#9ed2e6";
                ctx.fillRect(-30, -35, 60, 70);
                ctx.strokeStyle = "#272b2c";
                ctx.lineWidth = 5;
                ctx.strokeRect(-30, -35, 60, 70);
                ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(0, 35); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.stroke();
            }
        } else if (variant.pattern === "wood" || variant.pattern === "steel") {
            ctx.strokeStyle = variant.pattern === "steel" ? "#d5dadd" : "#6d451d";
            ctx.lineWidth = 8;
            for (let line = 1; line < 4; line += 1) {
                const lineY = y + line * variant.height / 4;
                ctx.beginPath(); ctx.moveTo(x + 7, lineY); ctx.lineTo(x + variant.width - 7, lineY); ctx.stroke();
            }
        } else {
            ctx.fillStyle = "#111315";
            ctx.font = "900 30px 'Barlow Condensed', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("CAT", 0, 2);
            ctx.fillStyle = "#f2b705";
            ctx.beginPath(); ctx.moveTo(-12, 15); ctx.lineTo(12, 15); ctx.lineTo(0, -1); ctx.closePath(); ctx.fill();
        }
    }

    drawCrane(ctx) {
        if (!this.currentBlock || !["ready", "falling"].includes(this.phase)) return;
        const attached = this.phase === "ready";
        const hookWorldX = this.hookX;
        const hookPoint = this.worldToScreen(hookWorldX, this.hookY);
        const railY = Math.max(72, hookPoint.y - 150);
        const sway = Math.sin(this.runTimeMs * 0.004) * GAME_CONFIG.crane.cableSwayAmount;

        ctx.save();
        ctx.strokeStyle = "rgba(35,40,42,0.72)";
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(0, railY); ctx.lineTo(this.view.width, railY); ctx.stroke();
        ctx.strokeStyle = "#41484c";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(hookPoint.x + sway, railY); ctx.lineTo(hookPoint.x, hookPoint.y - 34); ctx.stroke();

        const image = this.assets.get(GAME_CONFIG.assets.hook);
        const spriteSize = GAME_CONFIG.crane.hookSpriteSize;
        if (image) {
            ctx.drawImage(image, hookPoint.x - spriteSize / 2, hookPoint.y - spriteSize / 2, spriteSize, spriteSize);
        } else {
            this.drawFallbackHook(ctx, hookPoint.x, hookPoint.y, spriteSize);
        }
        ctx.restore();
    }

    drawFallbackHook(ctx, x, y, spriteSize) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(spriteSize / 96, spriteSize / 96);
        ctx.fillStyle = "#171a1c";
        ctx.fillRect(-34, -40, 68, 44);
        ctx.save();
        ctx.beginPath(); ctx.rect(-34, -40, 68, 44); ctx.clip();
        ctx.strokeStyle = "#f2b705";
        ctx.lineWidth = 11;
        for (let stripe = -75; stripe < 90; stripe += 28) {
            ctx.beginPath(); ctx.moveTo(stripe, 12); ctx.lineTo(stripe + 54, -48); ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = "#555e63";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(0, 21, 31, Math.PI * 1.42, Math.PI * 0.48, false);
        ctx.stroke();
        ctx.restore();
    }

    drawForeground(ctx) {
        const normalGroundY = this.worldToScreen(0, 0).y;
        const parallaxGroundY = this.view.height * GAME_CONFIG.world.groundScreenY - this.cameraY * GAME_CONFIG.camera.foregroundParallax;
        const image = this.assets.get(GAME_CONFIG.assets.foreground);
        if (image) {
            const ratio = image.width / image.height;
            const width = Math.max(this.view.width, 900);
            const height = width / ratio;
            ctx.drawImage(image, (this.view.width - width) / 2, parallaxGroundY - height * 0.72, width, height);
            return;
        }
        if (normalGroundY > this.view.height + 140) return;
        ctx.save();
        ctx.fillStyle = "#35462c";
        for (let x = -20; x < this.view.width + 40; x += 42) {
            const height = 22 + ((x * 17) % 36 + 36) % 36;
            ctx.beginPath();
            ctx.arc(x, normalGroundY + 10, height, Math.PI, 0);
            ctx.fill();
        }
        ctx.restore();
    }

    drawParticles(ctx) {
        this.particles.forEach((particle) => {
            const point = this.worldToScreen(particle.x, particle.y);
            ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    drawPhysicsOutlines(ctx) {
        ctx.save();
        ctx.strokeStyle = "#ff2f72";
        ctx.lineWidth = 2;
        [this.ground, ...this.settledBlocks, ...(this.currentBlock ? [this.currentBlock] : [])].forEach((body) => {
            const vertices = body.vertices.map((vertex) => this.worldToScreen(vertex.x, vertex.y));
            ctx.beginPath();
            vertices.forEach((vertex, index) => index ? ctx.lineTo(vertex.x, vertex.y) : ctx.moveTo(vertex.x, vertex.y));
            ctx.closePath();
            ctx.stroke();
        });
        ctx.restore();
    }

    createImpactParticles(x, y, strength = 1) {
        const count = Math.round(GAME_CONFIG.atmosphere.particleCount * strength);
        for (let index = 0; index < count; index += 1) {
            const life = 0.35 + Math.random() * 0.45;
            this.particles.push({
                x: x + (Math.random() - 0.5) * 60,
                y,
                vx: (Math.random() - 0.5) * 120 * strength,
                vy: -25 - Math.random() * 90 * strength,
                size: 3 + Math.random() * 8,
                life,
                maxLife: life,
                color: Math.random() > 0.3 ? "#c5bca7" : "#8c795f"
            });
        }
    }

    getTowerTop() {
        if (!this.settledBlocks.length) return 0;
        return Math.min(...this.settledBlocks.map((block) => block.bounds.min.y));
    }

    getCraneSpeed() {
        return Math.min(
            GAME_CONFIG.crane.maximumSpeed,
            GAME_CONFIG.crane.startSpeed + this.score * GAME_CONFIG.crane.speedIncreasePerBox
        );
    }

    getAtmospherePhase() {
        return (GAME_CONFIG.atmosphere.startPhase + this.runTimeMs / 1000 / GAME_CONFIG.atmosphere.dayNightCycleSeconds) % 1;
    }

    worldToScreen(x, y) {
        return {
            x: this.view.width / 2 + x,
            y: y - this.cameraY + this.view.height * GAME_CONFIG.world.groundScreenY
        };
    }

    createStars(count) {
        return Array.from({ length: count }, (_, index) => ({
            x: seededRandom(index * 17 + 3),
            y: seededRandom(index * 29 + 11),
            radius: 0.8 + seededRandom(index * 41 + 7) * 2.1
        }));
    }

    createClouds() {
        return [
            { x: 0.08, y: 170, size: 82, speed: 0.76, alpha: 0.62 },
            { x: 0.44, y: 315, size: 116, speed: 0.48, alpha: 0.4 },
            { x: 0.8, y: 220, size: 96, speed: 0.63, alpha: 0.52 },
            { x: 0.23, y: 510, size: 72, speed: 0.9, alpha: 0.3 },
            { x: 0.66, y: 580, size: 104, speed: 0.56, alpha: 0.35 }
        ];
    }

    createBirds() {
        return [
            { x: 80, y: 330, speed: 0.9 },
            { x: 360, y: 420, speed: 0.68 },
            { x: 690, y: 280, speed: 0.8 }
        ];
    }

    getState() {
        return {
            active: this.active,
            phase: this.phase,
            score: this.score,
            settledBlocks: this.settledBlocks.length,
            cameraY: this.cameraY,
            craneSpeed: this.getCraneSpeed(),
            hook: { x: this.hookX, y: this.hookY },
            currentBlock: this.currentBlock ? {
                x: this.currentBlock.position.x,
                y: this.currentBlock.position.y,
                angle: this.currentBlock.angle,
                speed: this.currentBlock.speed,
                type: this.currentBlock.plugin.stackData.variant.id
            } : null
        };
    }
}

let currentPlayer = StorageService.read(GAME_CONFIG.storage.playerKey, null);
let game = null;

function showScreen(name) {
    Object.entries(DOM.screens).forEach(([screenName, element]) => {
        if (!element) return;
        const visible = screenName === name;
        element.hidden = !visible;
        element.classList.toggle("is-active", visible);
    });
    if (name === "leaderboard") renderLeaderboard();
}

function startGame() {
    if (!currentPlayer) {
        showScreen("form");
        return;
    }
    showScreen("game");
    DOM.gamePrompt.classList.remove("is-hidden");
    DOM.placementMessage.classList.remove("is-visible");
    AudioService.unlock();
    if (!game) {
        game = new StackGame(DOM.canvas, {
            onScore: (score) => { DOM.scoreValue.textContent = score; },
            onReady: () => { DOM.gamePrompt.classList.remove("is-hidden"); },
            onDrop: () => { DOM.gamePrompt.classList.add("is-hidden"); },
            onPlacement: showPlacementMessage,
            onGameOver: finishGame
        });
    }
    try {
        game.start();
    } catch (error) {
        console.error(error);
        window.alert(error.message);
        showScreen("menu");
    }
}

function finishGame(result) {
    StorageService.saveRun(currentPlayer, result.score, result.durationMs);
    const best = StorageService.getBestScore(currentPlayer.email);
    DOM.finalScore.textContent = result.score;
    DOM.bestScore.textContent = best;
    DOM.gameOverReason.textContent = result.reason;
    DOM.screens.game.hidden = false;
    DOM.screens.gameOver.hidden = false;
}

function showPlacementMessage(message) {
    DOM.placementMessage.textContent = message;
    DOM.placementMessage.classList.remove("is-visible");
    void DOM.placementMessage.offsetWidth;
    DOM.placementMessage.classList.add("is-visible");
}

function returnToMenu() {
    game?.stop();
    showScreen("menu");
}

function renderLeaderboard() {
    const leaders = StorageService.getLeaderboard();
    DOM.leaderboardList.replaceChildren();
    leaders.forEach((leader) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const score = document.createElement("strong");
        name.className = "leaderboard-name";
        score.className = "leaderboard-score";
        name.textContent = leader.playerName;
        score.textContent = leader.score;
        item.append(name, score);
        DOM.leaderboardList.append(item);
    });
    DOM.leaderboardEmpty.hidden = leaders.length > 0;
}

function validatePlayerForm(form) {
    const data = new FormData(form);
    const values = {
        name: String(data.get("name") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        email: String(data.get("email") || "").trim(),
        consent: data.get("consent") === "on"
    };
    const errors = {};
    if (values.name.length < 2) errors.name = "Enter your name.";
    if (!/^[+\d][\d\s()\-]{6,23}$/.test(values.phone)) errors.phone = "Enter a valid contact number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
    if (!values.consent) errors.consent = "Consent is required to enter the promotion.";

    form.querySelectorAll(".field-error").forEach((error) => {
        const fieldName = error.dataset.errorFor;
        error.textContent = errors[fieldName] || "";
    });
    form.querySelectorAll("input").forEach((input) => input.classList.toggle("is-invalid", Boolean(errors[input.name])));
    return Object.keys(errors).length ? null : values;
}

function prefillPlayerForm() {
    if (!currentPlayer) return;
    document.querySelector("#playerName").value = currentPlayer.name || "";
    document.querySelector("#playerPhone").value = currentPlayer.phone || "";
    document.querySelector("#playerEmail").value = currentPlayer.email || "";
}

function updateSoundButton() {
    DOM.soundButton.textContent = AudioService.enabled ? "SOUND ON" : "SOUND OFF";
    DOM.soundButton.setAttribute("aria-label", AudioService.enabled ? "Mute sound" : "Enable sound");
}

function setupDebugPanel() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") !== "1") return;
    DOM.debugPanel.hidden = false;
    const controls = [
        ["Gravity", "physics.gravityY", 0.2, 2.5, 0.02],
        ["Crane start speed", "crane.startSpeed", 30, 350, 5],
        ["Crane max speed", "crane.maximumSpeed", 80, 500, 5],
        ["Speed per block", "crane.speedIncreasePerBox", 0, 15, 0.5],
        ["Drop gap", "crane.dropGap", 250, 700, 10],
        ["Hook sprite size", "crane.hookSpriteSize", 48, 160, 1],
        ["Hook contact offset", "crane.hookContactOffset", 0, 80, 1],
        ["Hook/box overlap", "crane.hookBoxOverlap", 0, 30, 1],
        ["Block friction", "blockDefaults.friction", 0.05, 1.5, 0.05],
        ["Static friction", "blockDefaults.frictionStatic", 0.05, 2, 0.05],
        ["Bounce", "blockDefaults.restitution", 0, 0.6, 0.01],
        ["Stable hold ms", "landing.stableHoldMs", 100, 1800, 50],
        ["Fall distance", "loss.fallDistanceFromRest", 30, 400, 5],
        ["Camera smoothing", "camera.smoothing", 0.01, 0.4, 0.005],
        ["Day/night seconds", "atmosphere.dayNightCycleSeconds", 30, 900, 10]
    ];

    DOM.debugPanel.innerHTML = "<h2>Live tuner</h2><p>Changes apply immediately where possible. Restart the run after changing block material values.</p>";
    controls.forEach(([labelText, path, min, max, step]) => {
        const wrapper = document.createElement("div");
        wrapper.className = "debug-control";
        const label = document.createElement("label");
        const input = document.createElement("input");
        label.textContent = labelText;
        input.type = "number";
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = getConfigValue(path);
        input.addEventListener("change", () => setConfigValue(path, Number(input.value)));
        wrapper.append(label, input);
        DOM.debugPanel.append(wrapper);
    });

    const outlineRow = document.createElement("label");
    outlineRow.className = "debug-control";
    outlineRow.innerHTML = `<span>Physics outlines</span><input type="checkbox" ${GAME_CONFIG.debug.showBodies ? "checked" : ""}>`;
    outlineRow.querySelector("input").addEventListener("change", (event) => { GAME_CONFIG.debug.showBodies = event.target.checked; });
    DOM.debugPanel.append(outlineRow);

    const actions = document.createElement("div");
    actions.className = "debug-actions";
    const copyButton = document.createElement("button");
    const resetButton = document.createElement("button");
    copyButton.type = "button";
    resetButton.type = "button";
    copyButton.textContent = "Copy config";
    resetButton.textContent = "Reset values";
    copyButton.addEventListener("click", async () => {
        await navigator.clipboard?.writeText(JSON.stringify(GAME_CONFIG, null, 2));
        copyButton.textContent = "Copied";
        window.setTimeout(() => { copyButton.textContent = "Copy config"; }, 900);
    });
    resetButton.addEventListener("click", () => {
        replaceObjectContents(GAME_CONFIG, DEFAULT_CONFIG);
        setupDebugPanelRefreshValues();
    });
    actions.append(copyButton, resetButton);
    DOM.debugPanel.append(actions);
}

function setupDebugPanelRefreshValues() {
    const inputs = [...DOM.debugPanel.querySelectorAll("input[type='number']")];
    const paths = [
        "physics.gravityY", "crane.startSpeed", "crane.maximumSpeed", "crane.speedIncreasePerBox",
        "crane.dropGap", "crane.hookSpriteSize", "crane.hookContactOffset", "crane.hookBoxOverlap",
        "blockDefaults.friction", "blockDefaults.frictionStatic", "blockDefaults.restitution",
        "landing.stableHoldMs", "loss.fallDistanceFromRest", "camera.smoothing", "atmosphere.dayNightCycleSeconds"
    ];
    inputs.forEach((input, index) => { input.value = getConfigValue(paths[index]); });
}

function getConfigValue(path) {
    return path.split(".").reduce((object, key) => object[key], GAME_CONFIG);
}

function setConfigValue(path, value) {
    const keys = path.split(".");
    const finalKey = keys.pop();
    const parent = keys.reduce((object, key) => object[key], GAME_CONFIG);
    parent[finalKey] = value;
}

function replaceObjectContents(target, source) {
    Object.keys(target).forEach((key) => delete target[key]);
    Object.assign(target, JSON.parse(JSON.stringify(source)));
}

function createRunId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSkyPalette(phase) {
    const stops = [
        { at: 0, top: "#142642", bottom: "#334f72", horizon: "#d47c55" },
        { at: 0.16, top: "#63b4e4", bottom: "#8bd0ef", horizon: "#d7e0c0" },
        { at: 0.48, top: "#4da8df", bottom: "#84cbed", horizon: "#c4d99d" },
        { at: 0.67, top: "#6b5b91", bottom: "#df7b69", horizon: "#f2b267" },
        { at: 0.82, top: "#111c38", bottom: "#263b61", horizon: "#664862" },
        { at: 1, top: "#142642", bottom: "#334f72", horizon: "#d47c55" }
    ];
    const nextIndex = stops.findIndex((stop) => stop.at >= phase);
    const right = stops[Math.max(1, nextIndex)];
    const left = stops[Math.max(0, nextIndex - 1)];
    const amount = (phase - left.at) / Math.max(0.0001, right.at - left.at);
    return {
        top: mixColor(left.top, right.top, amount),
        bottom: mixColor(left.bottom, right.bottom, amount),
        horizon: mixColor(left.horizon, right.horizon, amount)
    };
}

function smoothNightAmount(phase) {
    if (phase < 0.1 || phase > 0.76) return clamp((phase > 0.76 ? phase - 0.76 : 0.1 - phase) / 0.16, 0, 1);
    return 0;
}

function mixColor(a, b, amount) {
    const parse = (color) => color.match(/\w\w/g).map((value) => parseInt(value, 16));
    const [ar, ag, ab] = parse(a);
    const [br, bg, bb] = parse(b);
    const channel = (start, end) => Math.round(start + (end - start) * clamp(amount, 0, 1)).toString(16).padStart(2, "0");
    return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`;
}

function seededRandom(seed) {
    const value = Math.sin(seed * 999) * 43758.5453;
    return value - Math.floor(value);
}

function wrap(value, minimum, maximum) {
    const range = maximum - minimum;
    return ((value - minimum) % range + range) % range + minimum;
}

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

DOM.beginButton.addEventListener("click", () => {
    prefillPlayerForm();
    showScreen("form");
});
DOM.menuLeaderboardButton.addEventListener("click", () => showScreen("leaderboard"));
DOM.playerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = validatePlayerForm(event.currentTarget);
    if (!values) return;
    currentPlayer = {
        name: values.name,
        phone: values.phone,
        email: values.email.toLowerCase(),
        consentAt: new Date().toISOString()
    };
    StorageService.write(GAME_CONFIG.storage.playerKey, currentPlayer);
    startGame();
});
DOM.soundButton.addEventListener("click", () => AudioService.toggle());
DOM.quitButton.addEventListener("click", returnToMenu);
DOM.playAgainButton.addEventListener("click", startGame);
DOM.gameOverLeaderboardButton.addEventListener("click", () => showScreen("leaderboard"));
document.querySelectorAll("[data-action='menu']").forEach((button) => button.addEventListener("click", returnToMenu));
DOM.clearLeaderboardButton.addEventListener("click", () => {
    DOM.clearPassword.value = "";
    DOM.passwordError.textContent = "";
    DOM.passwordDialog.showModal();
    window.setTimeout(() => DOM.clearPassword.focus(), 0);
});
DOM.confirmClearButton.addEventListener("click", () => {
    if (DOM.clearPassword.value !== GAME_CONFIG.storage.adminPassword) {
        DOM.passwordError.textContent = "Incorrect password.";
        DOM.clearPassword.select();
        return;
    }
    StorageService.clearRuns();
    DOM.passwordDialog.close();
    renderLeaderboard();
});
window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || DOM.screens.game.hidden || !DOM.screens.gameOver.hidden) return;
    event.preventDefault();
    game?.dropBlock();
});
window.addEventListener("storage", (event) => {
    if (event.key === GAME_CONFIG.storage.runsKey && !DOM.screens.leaderboard.hidden) renderLeaderboard();
});

updateSoundButton();
setupDebugPanel();
showScreen("menu");

window.BuildNStack = {
    config: GAME_CONFIG,
    start: startGame,
    drop: () => game?.dropBlock(),
    getState: () => game?.getState() || null,
    getRuns: () => StorageService.getRuns(),
    getLeaderboard: () => StorageService.getLeaderboard(),
    clearLocalData: () => StorageService.clearRuns(),
    useTestPlayer() {
        currentPlayer = { name: "Test Builder", phone: "0800000000", email: "test@example.com", consentAt: new Date().toISOString() };
        startGame();
    }
};
