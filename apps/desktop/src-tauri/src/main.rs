// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            runyard_core::commands::fs_list,
            runyard_core::commands::fs_read,
            runyard_core::commands::fs_write,
            runyard_core::commands::fs_watch,
            runyard_core::commands::git_branch,
            runyard_core::commands::get_home_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
