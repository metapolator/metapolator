//! The Metapolator web UI: a port of the AngularJS app in `app/lib/ui`
//! to Leptos (client side rendering), on top of [`mp_app::App`].
//!
//! Panels, left to right as in the original: parameters, master
//! specimen, masters, design space with the instance specimen, instances
//! and export.

mod panels;
mod util;

use leptos::prelude::*;
use mp_app::App;

/// The app and a revision counter: every change bumps the revision and
/// every view that reads the app depends on it.
#[derive(Clone, Copy)]
pub struct Ctx {
    app: StoredValue<App, LocalStorage>,
    rev: RwSignal<u64>,
    /// (is_error, message) shown in the menubar
    status: RwSignal<Option<(bool, String)>>,
}

impl Ctx {
    pub fn with<R>(&self, f: impl FnOnce(&App) -> R) -> R {
        self.rev.track();
        self.app.with_value(f)
    }
    pub fn untracked<R>(&self, f: impl FnOnce(&App) -> R) -> R { self.app.with_value(f) }
    pub fn update<R>(&self, f: impl FnOnce(&mut App) -> R) -> R {
        let r = self.app.try_update_value(f).expect("app disposed");
        self.rev.update(|r| *r += 1);
        r
    }
    pub fn replace(&self, app: App) {
        self.app.set_value(app);
        self.rev.update(|r| *r += 1);
    }
    pub fn info(&self, msg: impl Into<String>) { self.status.set(Some((false, msg.into()))) }
    pub fn error(&self, msg: impl Into<String>) { self.status.set(Some((true, msg.into()))) }
}

pub fn ctx() -> Ctx { expect_context::<Ctx>() }

#[component]
fn Metapolator() -> impl IntoView {
    let app = App::with_default_project().unwrap_or_else(|e| panic!("default project: {e}"));
    let ctx = Ctx { app: StoredValue::new_local(app), rev: RwSignal::new(0), status: RwSignal::new(None) };
    provide_context(ctx);
    view! {
        <panels::Menubar/>
        <main class="landscape">
            <section class="panel parameters"><panels::ParameterPanel/></section>
            <section class="panel specimen"><panels::SpecimenPanel instances=false/></section>
            <section class="panel masters"><panels::MasterPanel/></section>
            <section class="panel design">
                <panels::DesignSpacePanel/>
                <panels::SpecimenPanel instances=true/>
            </section>
            <section class="panel instances"><panels::InstancePanel/></section>
        </main>
    }
}

#[wasm_bindgen::prelude::wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
    if let Some(l) = web_sys::window().and_then(|w| w.document()).and_then(|d| d.get_element_by_id("loading")) { l.remove(); }
    mount_to_body(Metapolator);
}
