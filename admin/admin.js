"use strict";

const ADMIN_CONFIG = {
    resultsTable: "build_n_stack_player_results",
    adminsTable: "build_n_stack_admins"
};

const elements = {
    loginPanel: document.querySelector("#loginPanel"),
    dashboard: document.querySelector("#adminDashboard"),
    loginForm: document.querySelector("#adminLoginForm"),
    email: document.querySelector("#adminEmail"),
    password: document.querySelector("#adminPassword"),
    loginError: document.querySelector("#adminLoginError"),
    totalAttempts: document.querySelector("#totalAttempts"),
    uniquePlayers: document.querySelector("#uniquePlayers"),
    highestScore: document.querySelector("#highestScore"),
    cloudStatus: document.querySelector("#cloudStatus"),
    dataSource: document.querySelector("#adminDataSource"),
    tableBody: document.querySelector("#resultsTableBody"),
    empty: document.querySelector("#adminEmpty"),
    refreshButton: document.querySelector("#refreshButton"),
    exportButton: document.querySelector("#exportButton"),
    clearDataButton: document.querySelector("#clearDataButton"),
    signOutButton: document.querySelector("#signOutButton"),
    clearDialog: document.querySelector("#clearDataDialog"),
    clearConfirmation: document.querySelector("#clearConfirmation"),
    clearError: document.querySelector("#clearDataError"),
    confirmClear: document.querySelector("#confirmClearDataButton")
};

let client = null;
let currentRuns = [];

function initializeSupabase() {
    const settings = window.BuildNStackSupabase;
    if (!settings?.url || !settings?.publishableKey || !window.supabase?.createClient) {
        elements.loginError.textContent = "Supabase could not be initialized. Check the project configuration.";
        elements.loginForm.querySelector("button").disabled = true;
        return false;
    }
    client = window.supabase.createClient(settings.url, settings.publishableKey);
    return true;
}

async function hasAdminAccess(userId) {
    const { data, error } = await client
        .from(ADMIN_CONFIG.adminsTable)
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
    if (error) throw error;
    return Boolean(data);
}

async function openDashboard(user) {
    if (!await hasAdminAccess(user.id)) {
        await client.auth.signOut();
        throw new Error("This Supabase account is not approved for Build n' Stack admin access.");
    }
    elements.loginPanel.hidden = true;
    elements.dashboard.hidden = false;
    await renderDashboard();
}

async function renderDashboard() {
    setDashboardBusy(true, "Refreshing protected Supabase results...");
    try {
        currentRuns = await fetchAllRuns();
    } catch (error) {
        setDashboardBusy(false, `Could not load results: ${error.message}`);
        throw error;
    }

    const identities = new Set(currentRuns.map((run) => String(run.email).toLowerCase()));
    elements.totalAttempts.textContent = currentRuns.length;
    elements.uniquePlayers.textContent = identities.size;
    elements.highestScore.textContent = currentRuns.reduce((best, run) => Math.max(best, Number(run.score) || 0), 0);
    elements.cloudStatus.textContent = "LIVE";
    elements.tableBody.replaceChildren();

    currentRuns.forEach((run) => {
        const row = document.createElement("tr");
        const values = [
            formatDate(run.completed_at),
            run.player_name,
            run.contact_number,
            run.email,
            run.score,
            formatDuration(run.duration_ms),
            run.consent_version
        ];
        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.append(cell);
        });
        elements.tableBody.append(row);
    });

    elements.empty.hidden = currentRuns.length > 0;
    setDashboardBusy(false, `Showing ${currentRuns.length} protected cloud ${currentRuns.length === 1 ? "submission" : "submissions"}.`);
}

async function fetchAllRuns() {
    const pageSize = 1000;
    const runs = [];
    for (let from = 0; ; from += pageSize) {
        const { data, error } = await client
            .from(ADMIN_CONFIG.resultsTable)
            .select("run_id,player_name,contact_number,email,score,duration_ms,consent_version,consent_at,completed_at,created_at")
            .order("completed_at", { ascending: false })
            .range(from, from + pageSize - 1);
        if (error) throw error;
        runs.push(...(data || []));
        if (!data || data.length < pageSize) return runs;
    }
}

function setDashboardBusy(busy, message) {
    elements.dataSource.textContent = message;
    elements.refreshButton.disabled = busy;
    elements.exportButton.disabled = busy || currentRuns.length === 0;
    elements.clearDataButton.disabled = busy || currentRuns.length === 0;
}

function exportCsv() {
    if (!currentRuns.length) return;
    const headers = ["run_id", "player_name", "contact_number", "email", "score", "duration_ms", "consent_version", "consent_at", "completed_at", "created_at"];
    const rows = currentRuns.map((run) => headers.map((header) => run[header]));
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

async function restoreSession() {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session?.user) return;
    try {
        await openDashboard(data.session.user);
    } catch (accessError) {
        elements.loginError.textContent = accessError.message;
    }
}

elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    elements.loginError.textContent = "Signing in...";
    const submitButton = elements.loginForm.querySelector("button");
    submitButton.disabled = true;

    try {
        const { data, error } = await client.auth.signInWithPassword({
            email: elements.email.value.trim().toLowerCase(),
            password: elements.password.value
        });
        if (error) throw error;
        await openDashboard(data.user);
        elements.loginError.textContent = "";
        elements.password.value = "";
    } catch (error) {
        elements.loginError.textContent = error.message || "Admin sign-in failed.";
        elements.password.select();
    } finally {
        submitButton.disabled = false;
    }
});

elements.refreshButton.addEventListener("click", () => {
    void renderDashboard().catch((error) => console.error(error));
});
elements.exportButton.addEventListener("click", exportCsv);
elements.signOutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    currentRuns = [];
    elements.dashboard.hidden = true;
    elements.loginPanel.hidden = false;
    elements.email.focus();
});
elements.clearDataButton.addEventListener("click", () => {
    elements.clearConfirmation.value = "";
    elements.clearError.textContent = "";
    elements.clearDialog.showModal();
    window.setTimeout(() => elements.clearConfirmation.focus(), 0);
});
elements.confirmClear.addEventListener("click", async () => {
    if (elements.clearConfirmation.value !== "CLEAR") {
        elements.clearError.textContent = "Type CLEAR exactly to continue.";
        elements.clearConfirmation.select();
        return;
    }

    elements.confirmClear.disabled = true;
    elements.clearError.textContent = "Clearing protected cloud data...";
    const { error } = await client
        .from(ADMIN_CONFIG.resultsTable)
        .delete()
        .gte("created_at", "1970-01-01T00:00:00.000Z");
    elements.confirmClear.disabled = false;

    if (error) {
        elements.clearError.textContent = error.message;
        return;
    }
    elements.clearDialog.close();
    await renderDashboard();
});

if (initializeSupabase()) void restoreSession();
