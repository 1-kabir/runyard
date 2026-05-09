// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use runyard_core::{fs_list, fs_read, fs_write, fs_watch, git_branch};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fs_list,
            fs_read,
            fs_write,
            fs_watch,
            git_branch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
