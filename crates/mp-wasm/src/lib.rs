//! A JavaScript API for Metapolator (wasm-bindgen over [`mp_app::App`]).
//!
//! Structured results are JSON strings; binary data is `Uint8Array`.
//! Errors are thrown as JS `Error`s with the message.
//!
//! Build: `wasm-pack build crates/mp-wasm --target web` (browser) or
//! `--target nodejs` (see tests/node/README.md).

use mp_app::params::{Level, OPERATORS, PARAMETERS};
use mp_app::{specimen, App};
use serde_json::{json, Value as Json};
use wasm_bindgen::prelude::*;

fn err(e: impl std::fmt::Display) -> JsError { JsError::new(&e.to_string()) }

fn level(s: &str) -> Result<Level, JsError> {
    match s { "master" => Ok(Level::Master), "glyph" => Ok(Level::Glyph), _ => Err(err(format!("unknown level {s}"))) }
}

/// One Metapolator session: an in-memory project and the UI model.
#[wasm_bindgen]
pub struct Metapolator { app: App, last_bundle: String }

#[wasm_bindgen]
impl Metapolator {
    /// the project the v0.4.0 web app started with
    #[wasm_bindgen(js_name = withDefaultProject)]
    pub fn with_default_project() -> Result<Metapolator, JsError> { App::with_default_project().map(|app| Metapolator { app, last_bundle: String::new() }).map_err(err) }

    /// an empty project
    pub fn empty() -> Result<Metapolator, JsError> { App::empty().map(|app| Metapolator { app, last_bundle: String::new() }).map_err(err) }

    /// a project saved with `projectZip`
    #[wasm_bindgen(js_name = fromProjectZip)]
    pub fn from_project_zip(data: &[u8]) -> Result<Metapolator, JsError> { App::from_project_zip(data).map(|app| Metapolator { app, last_bundle: String::new() }).map_err(err) }

    /// save and zip the project as `<name>/…`
    #[wasm_bindgen(js_name = projectZip)]
    pub fn project_zip(&mut self, name: &str) -> Result<Vec<u8>, JsError> { self.app.project_zip(name).map_err(err) }

    /// masters, design spaces, instances and the selection, as JSON
    pub fn state(&self) -> String {
        let a = &self.app;
        json!({
            "masters": a.masters.iter().map(|m| json!({"name": m.name, "displayName": m.display_name, "edit": m.edit, "display": m.display})).collect::<Vec<_>>(),
            "designSpaces": a.design_spaces.iter().map(|d| json!({"id": d.id, "name": d.name, "axes": d.axes, "slack": d.slack})).collect::<Vec<_>>(),
            "currentDesignSpace": a.current_design_space,
            "instances": a.instances.iter().map(|i| json!({
                "id": i.id, "name": i.name, "displayName": i.display_name, "designSpace": i.design_space,
                "color": i.color, "export": i.export, "display": i.display,
                "axes": i.axes.iter().map(|x| json!({"master": x.master, "axisValue": x.axis_value, "metapolationValue": x.metapolation_value})).collect::<Vec<_>>(),
            })).collect::<Vec<_>>(),
            "currentInstance": a.current_instance,
            "selectedGlyphs": a.selected_glyphs.iter().collect::<Vec<_>>(),
        }).to_string()
    }

    /// the parameter and operator definitions, as JSON
    pub fn definitions() -> String {
        json!({
            "parameters": PARAMETERS.iter().map(|p| json!({"name": p.name, "cpsKey": p.cps_key, "unit": p.unit, "step": p.step, "decimals": p.decimals, "effectiveLevel": p.effective_level.name()})).collect::<Vec<_>>(),
            "operators": OPERATORS.iter().map(|o| json!({"name": o.name, "sign": o.sign, "standardValue": o.standard, "type": if o.stack { "stack" } else { "unique" }, "usesUnit": o.uses_unit, "effectiveLocal": o.effective_local})).collect::<Vec<_>>(),
        }).to_string()
    }

    // masters

    /// import every UFO of a ZIP; JSON list of `{ok: name}` / `{error: message}`
    #[wasm_bindgen(js_name = importUfoZip)]
    pub fn import_ufo_zip(&mut self, data: &[u8]) -> Result<String, JsError> {
        let r = self.app.import_ufo_zip(data).map_err(err)?;
        Ok(Json::Array(r.into_iter().map(|x| match x { Ok(n) => json!({"ok": n}), Err(e) => json!({"error": e}) }).collect()).to_string())
    }
    #[wasm_bindgen(js_name = selectMaster)]
    pub fn select_master(&mut self, name: &str, add: bool) { self.app.select_master(name, add) }
    #[wasm_bindgen(js_name = setMasterDisplay)]
    pub fn set_master_display(&mut self, name: &str, display: bool) { if let Some(m) = self.app.master_mut(name) { m.display = display } }
    #[wasm_bindgen(js_name = renameMaster)]
    pub fn rename_master(&mut self, name: &str, display_name: &str) { self.app.rename_master(name, display_name) }
    #[wasm_bindgen(js_name = duplicateMasters)]
    pub fn duplicate_masters(&mut self) -> Result<String, JsError> { self.app.duplicate_selected_masters().map(|v| json!(v).to_string()).map_err(err) }
    /// JSON `{removed: [...], kept: [...]}` (kept: instances depend on them)
    #[wasm_bindgen(js_name = removeMasters)]
    pub fn remove_masters(&mut self) -> Result<String, JsError> {
        self.app.remove_selected_masters().map(|(r, k)| json!({"removed": r, "kept": k}).to_string()).map_err(err)
    }
    #[wasm_bindgen(js_name = glyphNames)]
    pub fn glyph_names(&self, master: &str) -> String { json!(self.app.glyph_names(master)).to_string() }
    #[wasm_bindgen(js_name = selectGlyph)]
    pub fn select_glyph(&mut self, master: &str, glyph: &str, add: bool) { self.app.select_glyph(master, glyph, add) }
    #[wasm_bindgen(js_name = clearGlyphSelection)]
    pub fn clear_glyph_selection(&mut self) { self.app.selected_glyphs.clear() }

    /// JSON `{path, width, height, moveUp, error}` or `null`
    #[wasm_bindgen(js_name = glyphView)]
    pub fn glyph_view(&self, master: &str, glyph: &str) -> String {
        match self.app.glyph_view(master, glyph) {
            Some(v) => json!({"path": v.path, "width": v.width, "height": v.height, "moveUp": v.move_up, "error": v.error}).to_string(),
            None => "null".into(),
        }
    }

    // design spaces and instances

    #[wasm_bindgen(js_name = addMasterToDesignSpace)]
    pub fn add_master_to_design_space(&mut self, master: &str, check: bool) -> Result<(), JsError> { self.app.add_master_to_design_space_checked(master, check).map_err(err) }
    #[wasm_bindgen(js_name = removeAxis)]
    pub fn remove_axis(&mut self, design_space: u32, master: &str) -> Result<(), JsError> { self.app.remove_axis(design_space, master).map_err(err) }
    #[wasm_bindgen(js_name = setSlack)]
    pub fn set_slack(&mut self, design_space: u32, slack: usize) -> Result<(), JsError> { self.app.set_slack(design_space, slack).map_err(err) }
    #[wasm_bindgen(js_name = addDesignSpace)]
    pub fn add_design_space(&mut self) -> u32 { self.app.add_design_space() }
    #[wasm_bindgen(js_name = cloneDesignSpace)]
    pub fn clone_design_space(&mut self) -> Result<Option<u32>, JsError> { self.app.clone_design_space().map_err(err) }
    #[wasm_bindgen(js_name = removeDesignSpace)]
    pub fn remove_design_space(&mut self, id: u32) -> Result<(), JsError> { self.app.remove_design_space(id).map_err(err) }
    #[wasm_bindgen(js_name = selectDesignSpace)]
    pub fn select_design_space(&mut self, id: u32) { self.app.select_design_space(id) }
    #[wasm_bindgen(js_name = addInstance)]
    pub fn add_instance(&mut self) -> Result<Option<u32>, JsError> { self.app.add_instance().map_err(err) }
    #[wasm_bindgen(js_name = cloneInstance)]
    pub fn clone_instance(&mut self) -> Result<Option<u32>, JsError> { self.app.clone_instance().map_err(err) }
    #[wasm_bindgen(js_name = removeInstance)]
    pub fn remove_instance(&mut self, id: u32) -> Result<(), JsError> { self.app.remove_instance(id).map_err(err) }
    #[wasm_bindgen(js_name = selectInstance)]
    pub fn select_instance(&mut self, id: u32) { self.app.set_current_instance(id) }
    #[wasm_bindgen(js_name = renameInstance)]
    pub fn rename_instance(&mut self, id: u32, display_name: &str) { self.app.rename_instance(id, display_name) }
    #[wasm_bindgen(js_name = setInstanceFlags)]
    pub fn set_instance_flags(&mut self, id: u32, export: Option<bool>, display: Option<bool>) { self.app.set_instance_flags(id, export, display) }
    #[wasm_bindgen(js_name = setAxisValue)]
    pub fn set_axis_value(&mut self, id: u32, index: usize, value: f64) -> Result<(), JsError> { self.app.set_axis_value(id, index, value).map_err(err) }

    // parameters

    /// JSON list of `{param, operators: [[op, low, high]], effective: [low, high] | null}`
    #[wasm_bindgen(js_name = selectionParameters)]
    pub fn selection_parameters(&mut self, lvl: &str) -> Result<String, JsError> {
        let l = level(lvl)?;
        Ok(Json::Array(self.app.selection_parameters(l).into_iter().map(|p| json!({
            "param": p.param, "operators": p.operators, "effective": p.effective,
        })).collect()).to_string())
    }
    #[wasm_bindgen(js_name = addOperator)]
    pub fn add_operator(&mut self, lvl: &str, param: usize, op: usize) -> Result<(), JsError> { self.app.add_operator(level(lvl)?, param, op); Ok(()) }
    #[wasm_bindgen(js_name = setOperatorValue)]
    pub fn set_operator_value(&mut self, lvl: &str, param: usize, op: usize, value: Option<f64>) -> Result<(), JsError> { self.app.set_operator_value(level(lvl)?, param, op, value); Ok(()) }
    #[wasm_bindgen(js_name = removeOperator)]
    pub fn remove_operator(&mut self, lvl: &str, param: usize, op: usize) -> Result<(), JsError> { self.app.remove_operator(level(lvl)?, param, op); Ok(()) }

    // export

    #[wasm_bindgen(js_name = exportUfoZip)]
    pub fn export_ufo_zip(&self, master: &str, file_name: &str) -> Result<Vec<u8>, JsError> { self.app.export_ufo_zip(master, file_name).map_err(err) }
    #[wasm_bindgen(js_name = exportOtf)]
    pub fn export_otf(&self, master: &str) -> Result<Vec<u8>, JsError> { self.app.export_otf(master).map_err(err) }
    /// the export bundle of all instances marked for export; the file name
    /// and errors via `lastBundleInfo`
    #[wasm_bindgen(js_name = exportBundle)]
    pub fn export_bundle(&mut self, timestamp: &str) -> Result<Vec<u8>, JsError> {
        let (name, data, errors) = self.app.export_bundle(timestamp).map_err(err)?;
        self.last_bundle = json!({"fileName": name, "errors": errors}).to_string();
        Ok(data)
    }

    /// JSON `{fileName, errors}` of the last `exportBundle`
    #[wasm_bindgen(js_name = lastBundleInfo)]
    pub fn last_bundle_info(&self) -> String { self.last_bundle.clone() }

    // test support

    /// `App::ui_snapshot` (tools/js-reference/ui-model-golden.js format)
    #[wasm_bindgen(js_name = uiSnapshot)]
    pub fn ui_snapshot(&self, weight_glyphs_json: &str) -> Result<String, JsError> {
        let g: Vec<String> = serde_json::from_str(weight_glyphs_json).map_err(err)?;
        Ok(self.app.ui_snapshot(&g).to_string())
    }
    /// `App::apply_ui_step`
    #[wasm_bindgen(js_name = applyUiStep)]
    pub fn apply_ui_step(&mut self, step_json: &str) -> Result<(), JsError> {
        let s: Json = serde_json::from_str(step_json).map_err(err)?;
        self.app.apply_ui_step(&s).map_err(err)
    }
    /// measure every effective element of a master (what displaying all
    /// its glyphs did in the JS UI)
    #[wasm_bindgen(js_name = measureMaster)]
    pub fn measure_master(&mut self, master: &str) { self.app.params.ensure_measured(&self.app.project, master) }
}

/// `glyphsOut` of the specimen panel, as a JSON list of glyph names
#[wasm_bindgen(js_name = specimenGlyphsOut)]
pub fn specimen_glyphs_out(text: &str, filter: &str, strict: u8) -> String { json!(specimen::glyphs_out(text, filter, strict)).to_string() }
