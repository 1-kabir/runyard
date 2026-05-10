use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::io::Write;
use tauri::{AppHandle, Emitter, Runtime};
use notify::{Watcher, RecursiveMode, Config};
use git2::Repository;
use tempfile::NamedTempFile;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FsEntry {
    pub name: String,
    pub path: String,
    pub kind: String, // "file" | "dir"
    pub size: u64,
}

pub mod commands {
    use super::*;

    #[tauri::command]
    pub fn fs_list(path: String) -> Result<Vec<FsEntry>, String> {
        let entries = match fs::read_dir(&path) {
            Ok(e) => e,
            Err(e) => return Err(e.to_string()),
        };
        let mut result = Vec::new();

        for entry in entries {
            if let Ok(entry) = entry {
                let (kind, size) = match entry.metadata() {
                    Ok(meta) => (if meta.is_dir() { "dir" } else { "file" }, meta.len()),
                    Err(_) => ("file", 0) // Fallback if we can't read metadata (e.g. permissions)
                };
                result.push(FsEntry {
                    name: entry.file_name().to_string_lossy().into_owned(),
                    path: entry.path().to_string_lossy().into_owned(),
                    kind: kind.to_string(),
                    size,
                });
            }
        }
        Ok(result)
    }

    #[tauri::command]
    pub fn fs_read(path: String) -> Result<String, String> {
        fs::read_to_string(path).map_err(|e| e.to_string())
    }

    #[tauri::command]
    pub fn fs_write(path: String, contents: String) -> Result<(), String> {
        let path_buf = Path::new(&path);
        let dir = path_buf.parent().ok_or("Invalid path")?;
        
        let mut temp = NamedTempFile::new_in(dir).map_err(|e| e.to_string())?;
        temp.write_all(contents.as_bytes()).map_err(|e| e.to_string())?;
        temp.persist(path_buf).map_err(|e| e.to_string())?;
        
        Ok(())
    }

    #[tauri::command]
    pub fn fs_watch<R: Runtime>(app: AppHandle<R>, path: String) -> Result<(), String> {
        let path_clone = path.clone();
        
        std::thread::spawn(move || {
            let (tx, rx) = std::sync::mpsc::channel();
            let mut watcher = notify::RecommendedWatcher::new(tx, Config::default()).unwrap();

            watcher.watch(Path::new(&path_clone), RecursiveMode::Recursive).unwrap();

            for res in rx {
                match res {
                    Ok(event) => {
                        for path in event.paths {
                            let _ = app.emit("fs:changed", path.to_string_lossy().to_string());
                        }
                    }
                    Err(e) => println!("watch error: {:?}", e),
                }
            }
        });

        Ok(())
    }

    #[tauri::command]
    pub fn git_branch(path: String) -> Result<Option<String>, String> {
        let repo = Repository::discover(path).map_err(|e| e.to_string())?;
        let head = repo.head().map_err(|e| e.to_string())?;
        let branch = head.shorthand().map(|s| s.to_string());
        Ok(branch)
    }

    #[tauri::command]
    pub fn get_home_dir() -> Result<String, String> {
        // Try standard environment variables
        let path = if cfg!(target_os = "windows") {
            std::env::var("USERPROFILE")
                .or_else(|_| {
                    let drive = std::env::var("HOMEDRIVE").unwrap_or_default();
                    let path = std::env::var("HOMEPATH").unwrap_or_default();
                    if drive.is_empty() || path.is_empty() {
                        Err("No home".to_string())
                    } else {
                        Ok(format!("{}{}", drive, path))
                    }
                })
                .map_err(|e| e.to_string())?
        } else {
            std::env::var("HOME")
                .map_err(|e| e.to_string())?
        };
        
        // Ensure it's a valid directory and absolute
        let p = std::path::PathBuf::from(path);
        if p.exists() && p.is_dir() {
            Ok(p.to_string_lossy().to_string())
        } else {
            Err("Home directory not found or invalid".to_string())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::commands::*;
    use super::*;
    use std::fs::File;
    use tempfile::tempdir;

    #[test]
    fn test_fs_list() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        File::create(&file_path).unwrap();

        let results = fs_list(dir.path().to_str().unwrap().to_string()).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "test.txt");
        assert_eq!(results[0].kind, "file");
    }

    #[test]
    fn test_fs_read_write() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("write_test.txt");
        let path_str = file_path.to_str().unwrap().to_string();
        let content = "hello runyard";

        fs_write(path_str.clone(), content.to_string()).unwrap();
        let read_content = fs_read(path_str).unwrap();
        assert_eq!(read_content, content);
    }

    #[test]
    fn test_git_branch() {
        // Test on the current repository root
        let result = git_branch("../../".to_string());
        assert!(result.is_ok());
        let branch = result.unwrap();
        assert!(branch.is_some());
        println!("Current branch: {:?}", branch);
    }
}
