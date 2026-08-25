"use strict";

/*
 * Browser-safe Supabase connection settings.
 *
 * The publishable key is intentionally shipped with the static game. It only
 * receives the permissions granted by the database's Row Level Security
 * policies. Never place the database password, a secret key or service-role
 * key in this file.
 */
window.BuildNStackSupabase = Object.freeze({
    url: "https://ksgxhjqptwjcjffjlcos.supabase.co",
    publishableKey: "sb_publishable_VJ39nYcAs2pbiHuWoTleQw_QUfzFq3O"
});
