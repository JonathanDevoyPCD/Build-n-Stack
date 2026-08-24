"use strict";

const ADMIN_CONFIG = {
    password: "MEDICUS",
    runsKey: "buildnstack.runs.v1"
};

const elements = {
    loginPanel: document.querySelector("#loginPanel"),
    dashboard: document.querySelector("#adminDashboard"),
    loginForm: document.querySelector("#adminLoginForm"),
    password: document.querySelector("#adminPassword"),
    loginError: document.querySelector("#adminLoginError"),
    totalAttempts: document.querySelector("#totalAttempts"),
    uniquePlayers: document.querySelector("#uniquePlayers"),
    highestScore: document.querySelector("#highestScore"),
    pendingSync: document.querySelector("#pendingSync"),
    tableBody: document.querySelector("#resultsTableBody"),
    empty: document.querySelector("#adminEmpty"),
    refreshButton: document.querySelector("#refreshButton"),
    exportButton: document.querySelector("#exportButton"),
    clearDataButton: document.querySelector("#clearDataButton"),
    clearDialog: document.querySelector("#clearDataDialog"),
    clearConfirmation: document.querySelector("#clearConfirmation"),
    clearError: document.querySelector("#clearDataError"),
    confirmClear: document.querySelector("#confirmClearDataButton")
};

function readRuns() {
    try {
        const parsed = JSON.parse(localStorage.getItem(ADMIN_CONFIG.runsKey) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Could not read local Build n' Stack data.", error);
        return [];
    }
}

function openDashboard() {
    elements.loginPanel.hidden = true;
    elements.dashboard.hidden = false;
    renderDashboard();
}

function renderDashboard() {
    const runs = readRuns().sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
    const identities = new Set(runs.map((run) => String(run.email || `${run.playerName}-${run.contactNumber}`).toLowerCase()));
    elements.totalAttempts.textContent = runs.length;
    elements.uniquePlayers.textContent = identities.size;
    elements.highestScore.textContent = runs.reduce((best, run) => Math.max(best, Number(run.score) || 0), 0);
    elements.pendingSync.textContent = runs.filter((run) => !run.synced).length;
    elements.tableBody.replaceChildren();

    runs.forEach((run) => {
        const row = document.createElement("tr");
        const values = [
            formatDate(run.completedAt),
            run.playerName,
            run.contactNumber,
            run.email,
            run.score,
            formatDuration(run.durationMs),
            run.synced ? "Synced" : "Pending"
        ];
        values.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            if (index === 6 && !run.synced) cell.className = "sync-pending";
            row.append(cell);
        });
        elements.tableBody.append(row);
    });

    elements.empty.hidden = runs.length > 0;
    elements.exportButton.disabled = runs.length === 0;
    elements.clearDataButton.disabled = runs.length === 0;
}

function exportCsv() {
    const runs = readRuns();
    if (!runs.length) return;
    const headers = ["run_id", "player_name", "contact_number", "email", "score", "duration_ms", "consent_version", "consent_at", "completed_at", "synced"];
    const rows = runs.map((run) => [
        run.runId,
        run.playerName,
        run.contactNumber,
        run.email,
        run.score,
        run.durationMs,
        run.consentVersion,
        run.consentAt,
        run.completedAt,
        run.synced
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `build-n-stack-player-results-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function csvCell(value) {
    const string = String(value ?? "");
    return `"${string.replaceAll('"', '""')}"`;
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function formatDuration(milliseconds) {
    const seconds = Math.max(0, Math.round((Number(milliseconds) || 0) / 1000));
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

elements.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (elements.password.value !== ADMIN_CONFIG.password) {
        elements.loginError.textContent = "Incorrect password.";
        elements.password.select();
        return;
    }
    elements.loginError.textContent = "";
    openDashboard();
});

elements.refreshButton.addEventListener("click", renderDashboard);
elements.exportButton.addEventListener("click", exportCsv);
elements.clearDataButton.addEventListener("click", () => {
    elements.clearConfirmation.value = "";
    elements.clearError.textContent = "";
    elements.clearDialog.showModal();
    window.setTimeout(() => elements.clearConfirmation.focus(), 0);
});
elements.confirmClear.addEventListener("click", () => {
    if (elements.clearConfirmation.value !== "CLEAR") {
        elements.clearError.textContent = "Type CLEAR exactly to continue.";
        elements.clearConfirmation.select();
        return;
    }
    localStorage.removeItem(ADMIN_CONFIG.runsKey);
    elements.clearDialog.close();
    renderDashboard();
});
