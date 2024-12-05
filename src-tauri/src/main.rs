// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let mut ctx = tauri::generate_context!();

    logviewer_lib::run(ctx)
}
