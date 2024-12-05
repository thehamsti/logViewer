use tauri::{
    menu::{AboutMetadata, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    Emitter, Listener, TitleBarStyle, WebviewUrl, WebviewWindowBuilder,
};

use tauri_plugin_updater::UpdaterExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn filter_and_sort(filter: String, sort: String) -> String {
    format!(
        "filterAndSort called with filter: '{}' and sort: '{}'",
        filter, sort
    )
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        // alternatively we could also call update.download() and update.install() separately
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(mut ctx: tauri::Context) {
    tauri::Builder::default()
        .plugin(tauri_plugin_theme::init(ctx.config_mut()))
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Hamsti's Log Viewer")
                .inner_size(800.0, 600.0);

            // set transparent title bar only when building for macOS
            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Transparent);

            let window = win_builder.build().unwrap();

            let handle = app.handle().clone();

            // Setup updater
            tauri::async_runtime::spawn(async move {
                update(handle).await.unwrap();
            });

            // Create the menu items
            let about_item = MenuItemBuilder::new("About")
                .id("about")
                .accelerator("CmdOrCtrl+A")
                .build(app)?;

            let open_item = MenuItemBuilder::new("Open")
                .id("open")
                .accelerator("CmdOrCtrl+O")
                .build(app)?;

            // Build the menu -- including open and about
            let submenu = SubmenuBuilder::new(app, "App")
                // .item(&about_item)
                .about(Some(AboutMetadata {
                    ..Default::default()
                }))
                .separator()
                .hide()
                .hide_others()
                .quit()
                .build()?;

            let file_submenu = SubmenuBuilder::new(app, "File")
                .item(&open_item)
                .separator()
                .build()?;

            let menu = MenuBuilder::new(app)
                .id("menu")
                .items(&[&submenu, &file_submenu])
                .build()?;

            // Set the menu
            app.set_menu(menu);

            app.on_menu_event(move |app, event| {
                if event.id() == open_item.id() {
                    let _open_event = app.emit("file-open", ());
                }
            });

            Ok(())
        })
        // .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![filter_and_sort])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
