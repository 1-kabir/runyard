use runyard_core::commands::{fs_list, fs_read, fs_write, fs_watch, git_branch, get_home_dir};
use runyard_core::settings::{settings_load, settings_save};
use runyard_core::git_ops::{
    git_status, git_stage, git_unstage, git_discard, git_commit,
    git_log, git_branches, git_checkout, git_create_branch,
    git_worktrees, git_worktree_create, git_worktree_remove,
};
use runyard_core::lsp_manager::{lsp_start, lsp_send, lsp_stop, lsp_status, lsp_status_all};
use runyard_core::terminal::{terminal_create, terminal_write, terminal_resize, terminal_close, terminal_list};
use runyard_core::{TerminalState, LspState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // Managed state: terminal sessions and LSP servers
        .manage(TerminalState::default())
        .manage(LspState::default())
        .invoke_handler(tauri::generate_handler![
            // ── Filesystem ──────────────────────────────────────────────────
            fs_list,
            fs_read,
            fs_write,
            fs_watch,
            // ── Git (legacy single-command) ──────────────────────────────
            git_branch,
            // ── Git (M2 full operations) ─────────────────────────────────
            git_status,
            git_stage,
            git_unstage,
            git_discard,
            git_commit,
            git_log,
            git_branches,
            git_checkout,
            git_create_branch,
            git_worktrees,
            git_worktree_create,
            git_worktree_remove,
            // ── Settings ────────────────────────────────────────────────
            settings_load,
            settings_save,
            // ── Terminal ────────────────────────────────────────────────
            terminal_create,
            terminal_write,
            terminal_resize,
            terminal_close,
            terminal_list,
            // ── LSP ─────────────────────────────────────────────────────
            lsp_start,
            lsp_send,
            lsp_stop,
            lsp_status,
            lsp_status_all,
            // ── Misc ────────────────────────────────────────────────────
            get_home_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
