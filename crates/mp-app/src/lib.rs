//! The Metapolator application model, independent of any GUI toolkit:
//! a port of the JS app's `app/lib/models/metapolator` (removed from the
//! tree; `tools/js-reference/fetch-deps.sh` restores it into
//! `tools/js-reference/legacy/`) (AppModel, master/instance
//! sequences, design spaces) and the UI tools that drive the engine
//! (`ui-tools/instanceTools`, `selectionTools`, the master and instance
//! panels' import/export code).
//!
//! The project lives in memory (`MemIo`), as in the web app.

pub mod compat;
pub mod params;
pub mod specimen;
pub mod svg;
pub mod zipio;

use mp_io::{Io, MemIo};
use mp_mom::project::Project;
use params::{Elem, Level, Params, OPERATORS, PARAMETERS};
use std::collections::BTreeSet;
use std::rc::Rc;

include!(concat!(env!("OUT_DIR"), "/default_project.rs"));

/// the project directory inside the in-memory file system
pub const PROJECT_DIR: &str = "project";

/// `InstanceSequenceModel.colors`
pub const INSTANCE_COLORS: &[&str] = &["#DC1F20", "#C95399", "#9E42F4", "#5939EC", "#5A86FE", "#A4E5FD", "#85C5A5", "#A9D323", "#F2E21D", "#D07f2C"];

/// `MasterModel` (the UI's view of a `master-…` MOM master)
#[derive(Clone, Debug, PartialEq)]
pub struct Master {
    /// the MOM master id
    pub name: String,
    pub display_name: String,
    /// selected for editing (parameters, master specimen)
    pub edit: bool,
    /// shown in the instance specimen as well
    pub display: bool,
    pub sequence_id: u32,
    pub id: u32,
}

/// `AxisModel`
#[derive(Clone, Debug, PartialEq)]
pub struct Axis {
    pub master: String,
    /// slider position, 0…100 (one decimal)
    pub axis_value: f64,
    pub metapolation_value: f64,
}

/// `InstanceModel`
#[derive(Clone, Debug, PartialEq)]
pub struct Instance {
    pub id: u32,
    /// the MOM master id
    pub name: String,
    pub display_name: String,
    pub axes: Vec<Axis>,
    pub design_space: u32,
    pub color: &'static str,
    pub export: bool,
    pub display: bool,
    cps_axes_count: usize,
}

/// `DesignSpaceModel`
#[derive(Clone, Debug, PartialEq)]
pub struct DesignSpace {
    pub id: u32,
    pub name: String,
    /// master names
    pub axes: Vec<String>,
    pub slack: usize,
    pub last_instance: Option<u32>,
}

pub struct App {
    pub io: Rc<MemIo>,
    pub project: Project,
    pub masters: Vec<Master>,
    master_counter: u32,
    pub design_spaces: Vec<DesignSpace>,
    design_space_counter: u32,
    pub current_design_space: Option<u32>,
    pub instances: Vec<Instance>,
    instance_counter: u32,
    pub current_instance: Option<u32>,
    pub params: Params,
    /// selected glyphs: (master name, glyph name)
    pub selected_glyphs: BTreeSet<(String, String)>,
}

pub type Result<T> = std::result::Result<T, String>;

fn e2s<E: std::fmt::Display>(e: E) -> String { e.to_string() }

/// JS `Math.round(x * 10) / 10` then `toFixed(1)`, as a number
fn round1(x: f64) -> f64 { (x * 10.0 + 0.5).floor() / 10.0 }

impl App {
    /// an app on a project already in `io` at [`PROJECT_DIR`]
    /// (`main.js`: load, openSession, `loadMOMmastersIntoMetapolator`)
    pub fn load(io: Rc<MemIo>) -> Result<App> {
        let dyn_io: Rc<dyn Io> = io.clone();
        let mut project = Project::load(dyn_io, PROJECT_DIR).map_err(e2s)?;
        project.open_session().map_err(e2s)?;
        let mut app = App {
            io, project, masters: vec![], master_counter: 0,
            design_spaces: vec![], design_space_counter: 0, current_design_space: None,
            instances: vec![], instance_counter: 0, current_instance: None,
            params: Params::default(), selected_glyphs: BTreeSet::new(),
        };
        app.create_design_space();
        for m in app.project.open_masters() {
            let id = app.project.mom().node(m).id.clone().unwrap_or_default();
            if id.starts_with("master-") { app.push_master(&id); }
        }
        Ok(app)
    }

    /// the project the deployed web app started with (one master, "regular")
    pub fn with_default_project() -> Result<App> {
        let io = Rc::new(MemIo::new());
        for (path, data) in DEFAULT_PROJECT {
            io.write(&mp_io::join(PROJECT_DIR, path), data).map_err(e2s)?;
        }
        App::load(io)
    }

    /// a new, empty project
    pub fn empty() -> Result<App> {
        let io = Rc::new(MemIo::new());
        let dyn_io: Rc<dyn Io> = io.clone();
        Project::init(dyn_io, PROJECT_DIR).map_err(e2s)?;
        App::load(io)
    }

    /// a project from a ZIP made by [`App::project_zip`]
    pub fn from_project_zip(data: &[u8]) -> Result<App> {
        let io = Rc::new(MemIo::new());
        let tmp = MemIo::new();
        zipio::unpack(data, &tmp, "")?;
        // the archive holds one top level directory (the project)
        let top = tmp.read_dir("").map_err(e2s)?.into_iter().find(|e| e.ends_with('/'))
            .ok_or("the ZIP contains no project directory")?;
        tmp.copy_to(top.trim_end_matches('/'), &*io, PROJECT_DIR).map_err(e2s)?;
        App::load(io)
    }

    /// save the project and return it as a ZIP (`<name>/…`)
    pub fn project_zip(&mut self, name: &str) -> Result<Vec<u8>> {
        self.project.save().map_err(e2s)?;
        let files: Vec<(String, Vec<u8>)> = zipio::mem_files(&self.io, PROJECT_DIR).into_iter()
            .map(|(p, d)| (format!("{name}/{p}"), d)).collect();
        zipio::pack_files(&files)
    }

    fn push_master(&mut self, name: &str) -> usize {
        let id = self.master_counter;
        self.master_counter += 1;
        self.masters.push(Master { name: name.into(), display_name: name.into(), edit: true, display: false, sequence_id: 0, id });
        self.masters.len() - 1
    }

    pub fn master(&self, name: &str) -> Option<&Master> { self.masters.iter().find(|m| m.name == name) }
    pub fn master_mut(&mut self, name: &str) -> Option<&mut Master> { self.masters.iter_mut().find(|m| m.name == name) }
    pub fn instance(&self, id: u32) -> Option<&Instance> { self.instances.iter().find(|i| i.id == id) }
    fn instance_mut(&mut self, id: u32) -> Option<&mut Instance> { self.instances.iter_mut().find(|i| i.id == id) }
    pub fn design_space(&self, id: u32) -> Option<&DesignSpace> { self.design_spaces.iter().find(|d| d.id == id) }
    fn design_space_mut(&mut self, id: u32) -> Option<&mut DesignSpace> { self.design_spaces.iter_mut().find(|d| d.id == id) }

    /// glyph names of a master or instance (MOM order)
    pub fn glyph_names(&self, master: &str) -> Vec<String> {
        let Some(m) = self.project.master_by_name(master) else { return vec![] };
        let mom = self.project.mom();
        mom.node(m).children.iter().filter_map(|g| mom.node(*g).id.clone()).collect()
    }

    /// the glyph of `master` named `name`; falls back to a glyph whose
    /// `unicodes` contain the character `name` (the JS UI had no such
    /// mapping, so it showed only a–z, A–Z and `<glyphname>`)
    pub fn find_glyph(&self, master: &str, name: &str) -> Option<mp_cps::NodeId> {
        let m = self.project.master_by_name(master)?;
        let mom = self.project.mom();
        let children = &mom.node(m).children;
        if let Some(g) = children.iter().copied().find(|g| mom.node(*g).id.as_deref() == Some(name)) { return Some(g); }
        let mut chars = name.chars();
        let (Some(c), None) = (chars.next(), chars.next()) else { return None };
        let code = c as u32 as f64;
        children.iter().copied().find(|g| {
            mom.attachment(*g, "unicodes", true).and_then(|u| u.as_array())
                .map(|a| a.iter().any(|v| v.as_f64() == Some(code))).unwrap_or(false)
        })
    }

    /// render one glyph of a master or instance
    pub fn glyph_view(&self, master: &str, glyph: &str) -> Option<svg::GlyphView> {
        let g = self.find_glyph(master, glyph)?;
        Some(svg::glyph_view(&self.project.engine, g))
    }
}

// ---------------------------------------------------------------- masters

impl App {
    /// `Project.unpackImportBlob` + `ImportProcess`: import every `*.ufo`
    /// directory at the top level of a ZIP (top level `*.ufo.zip` files are
    /// unpacked first) as `base-<name>` plus the UI master `master-<name>`.
    /// Returns the new UI masters; failures are reported per UFO.
    pub fn import_ufo_zip(&mut self, data: &[u8]) -> Result<Vec<std::result::Result<String, String>>> {
        let mem = MemIo::new();
        zipio::unpack(data, &mem, "")?;
        for entry in mem.read_dir("").map_err(e2s)? {
            if entry.ends_with(".ufo.zip") {
                let inner = mem.read(&entry).map_err(e2s)?;
                mem.remove_file(&entry).map_err(e2s)?;
                zipio::unpack(&inner, &mem, "")?;
            }
        }
        let mut out = vec![];
        let mut entries = mem.read_dir("").map_err(e2s)?;
        entries.sort();
        for entry in entries {
            let Some(dir) = entry.strip_suffix('/') else { continue };
            let Some(name) = dir.strip_suffix(".ufo") else { continue };
            let r = self.project.import_ui_master(name, &mem, dir).map_err(e2s).map(|(_, ui)| {
                let id = self.project.mom().node(ui).id.clone().unwrap_or_default();
                self.push_master(&id);
                id
            });
            out.push(r);
        }
        if out.is_empty() { return Err("no *.ufo directory found in the ZIP".into()); }
        Ok(out)
    }

    /// select `name` alone, or toggle it with `add`
    pub fn select_master(&mut self, name: &str, add: bool) {
        for m in &mut self.masters {
            if m.name == name { m.edit = if add { !m.edit } else { true }; }
            else if !add { m.edit = false; }
        }
        let editing: BTreeSet<String> = self.masters.iter().filter(|m| m.edit).map(|m| m.name.clone()).collect();
        self.selected_glyphs.retain(|(m, _)| editing.contains(m));
    }

    pub fn rename_master(&mut self, name: &str, display_name: &str) {
        if let Some(m) = self.master_mut(name) { m.display_name = display_name.into(); }
    }

    /// `duplicateMasters`: clone every selected master (MOM, CPS and
    /// parameters); the clones become the selection
    pub fn duplicate_selected_masters(&mut self) -> Result<Vec<String>> {
        let selected: Vec<Master> = self.masters.iter().filter(|m| m.edit).cloned().collect();
        let mut clones = vec![];
        for src in selected {
            let id = self.master_counter;
            self.master_counter += 1;
            let m = self.project.clone_master(&src.name, &format!("master-{}-{}", src.sequence_id, id)).map_err(e2s)?;
            let name = self.project.mom().node(m).id.clone().unwrap_or_default();
            self.params.clone_master(&src.name, &name);
            if let Some(s) = self.master_mut(&src.name) { s.edit = false; }
            clones.push(Master { name: name.clone(), display_name: format!("{} copy", src.display_name), edit: true, display: src.display, sequence_id: src.sequence_id, id });
        }
        let names = clones.iter().map(|c| c.name.clone()).collect();
        self.masters.extend(clones);
        self.selected_glyphs.clear();
        Ok(names)
    }

    /// `removeMasters` / `MasterModel.remove`: delete the selected masters
    /// (with their base masters). A master that instances depend on is
    /// kept, as in the JS; its name is returned in the second list.
    pub fn remove_selected_masters(&mut self) -> Result<(Vec<String>, Vec<String>)> {
        let selected: Vec<String> = self.masters.iter().filter(|m| m.edit).map(|m| m.name.clone()).collect();
        let (mut removed, mut kept) = (vec![], vec![]);
        for name in selected {
            if !self.project.delete_master(&name, true, false).map_err(e2s)? { kept.push(name); continue; }
            for ds in self.design_spaces.iter().map(|d| d.id).collect::<Vec<_>>() {
                if self.design_space(ds).map(|d| d.axes.contains(&name)).unwrap_or(false) {
                    self.remove_axis(ds, &name)?;
                }
            }
            self.masters.retain(|m| m.name != name);
            self.params.forget_master(&name);
            self.selected_glyphs.retain(|(m, _)| *m != name);
            removed.push(name);
        }
        Ok((removed, kept))
    }

    /// `master.isInterpolationCompatible(other)`: (compatible, messages)
    pub fn compatible(&self, a: &str, b: &str) -> (bool, Vec<String>) {
        match (self.project.master_by_name(a), self.project.master_by_name(b)) {
            (Some(x), Some(y)) => compat::is_interpolation_compatible(self.project.mom(), x, y),
            _ => (false, vec!["unknown master".into()]),
        }
    }
}

// ---------------------------------------------------------- design spaces

impl App {
    /// `AppModel.createNewDesignSpace` (becomes current)
    pub fn create_design_space(&mut self) -> u32 {
        let id = self.design_space_counter;
        self.design_space_counter += 1;
        self.design_spaces.push(DesignSpace { id, name: format!("Space {id}"), axes: vec![], slack: 0, last_instance: None });
        self.current_design_space = Some(id);
        id
    }

    /// `selectDesignSpace`: also selects its last instance
    pub fn select_design_space(&mut self, id: u32) {
        self.current_design_space = Some(id);
        self.current_instance = self.design_space(id).and_then(|d| d.last_instance);
    }

    /// `addDesignSpace` button: a new empty design space, no current instance
    pub fn add_design_space(&mut self) -> u32 {
        let id = self.create_design_space();
        self.current_instance = None;
        id
    }

    /// `cloneDesignSpace`: same axes and slack, a clone of each instance
    pub fn clone_design_space(&mut self) -> Result<Option<u32>> {
        let Some(old) = self.current_design_space.and_then(|i| self.design_space(i)).cloned() else { return Ok(None) };
        let id = self.design_space_counter;
        self.design_space_counter += 1;
        self.design_spaces.push(DesignSpace { id, name: format!("Space {id}"), axes: old.axes.clone(), slack: old.slack, last_instance: None });
        self.current_design_space = Some(id);
        let olds: Vec<Instance> = self.instances.iter().filter(|i| i.design_space == old.id).cloned().rev().collect();
        for inst in olds {
            self.new_instance(inst.axes.clone(), id)?;
        }
        Ok(Some(id))
    }

    /// `removeDesignSpace` (with its instances)
    pub fn remove_design_space(&mut self, id: u32) -> Result<()> {
        let ids: Vec<u32> = self.instances.iter().filter(|i| i.design_space == id).map(|i| i.id).collect();
        for i in ids { self.remove_instance_only(i)?; }
        let Some(index) = self.design_spaces.iter().position(|d| d.id == id) else { return Ok(()) };
        self.design_spaces.remove(index);
        // _findNewCurrentDesignSpace
        let l = self.design_spaces.len();
        self.current_design_space = if l > index { Some(self.design_spaces[index].id) }
            else if l == 0 { None } else { Some(self.design_spaces[l - 1].id) };
        Ok(())
    }

    /// `addMasterToDesignSpace` (the drop on the design space panel)
    pub fn add_master_to_design_space(&mut self, master: &str) -> Result<()> {
        self.add_master_to_design_space_checked(master, true)
    }

    /// [`App::add_master_to_design_space`]; `check: false` skips the
    /// interpolation compatibility test (as `Project.createDerivedMaster`
    /// does, e.g. in tools/js-reference/workflow-golden.js)
    pub fn add_master_to_design_space_checked(&mut self, master: &str, check: bool) -> Result<()> {
        let ds_id = match self.current_design_space { Some(d) => d, None => self.create_design_space() };
        let ds = self.design_space(ds_id).cloned().ok_or("no design space")?;
        if ds.axes.iter().any(|a| a == master) { return Ok(()); }
        if ds.axes.is_empty() {
            self.design_space_mut(ds_id).unwrap().axes.push(master.into());
            self.new_instance(vec![Axis { master: master.into(), axis_value: 50.0, metapolation_value: 1.0 }], ds_id)?;
            return Ok(());
        }
        let (ok, messages) = if check { self.compatible(&ds.axes[0], master) } else { (true, vec![]) };
        if !ok {
            return Err(format!("The masters are not compatible for metapolation:\n{}",
                messages.iter().map(|m| format!("* {m}")).collect::<Vec<_>>().join("\n")));
        }
        self.design_space_mut(ds_id).unwrap().axes.push(master.into());
        let ids: Vec<u32> = self.instances.iter().filter(|i| i.design_space == ds_id).map(|i| i.id).rev().collect();
        for id in ids {
            let inst = self.instance_mut(id).unwrap();
            let v = if inst.axes.len() == 1 { 100.0 - inst.axes[0].axis_value } else { 0.0 };
            inst.axes.push(Axis { master: master.into(), axis_value: v, metapolation_value: 0.0 });
            set_metapolation_values_in_model(&mut inst.axes);
            self.update_instance_cps(id)?;
        }
        Ok(())
    }

    /// `DesignSpaceModel.removeAxis` (the "remove master" of the panel)
    pub fn remove_axis(&mut self, ds_id: u32, master: &str) -> Result<()> {
        let Some(ds) = self.design_space_mut(ds_id) else { return Ok(()) };
        let Some(index) = ds.axes.iter().position(|a| a == master) else { return Ok(()) };
        ds.axes.remove(index);
        if index < ds.slack { ds.slack -= 1 } else if index == ds.slack { ds.slack = 0 }
        if ds.axes.len() < 3 { ds.slack = 0 }
        let empty = ds.axes.is_empty();
        let affected: Vec<u32> = self.instances.iter()
            .filter(|i| i.design_space == ds_id && i.axes.iter().any(|a| a.master == master)).map(|i| i.id).rev().collect();
        for id in affected {
            if empty {
                self.remove_instance_only(id)?;
            } else {
                // AxisModel.remove
                let slack = self.design_space(ds_id).map(|d| d.slack).unwrap_or(0);
                let inst = self.instance_mut(id).unwrap();
                inst.axes.retain(|a| a.master != master);
                redistribute_axes(&mut inst.axes, slack);
                set_metapolation_values_in_model(&mut inst.axes);
                self.update_instance_cps(id)?;
            }
        }
        Ok(())
    }

    /// `changeSlackMaster`
    pub fn set_slack(&mut self, ds_id: u32, slack: usize) -> Result<()> {
        let Some(ds) = self.design_space_mut(ds_id) else { return Ok(()) };
        if slack >= ds.axes.len() { return Ok(()); }
        ds.slack = slack;
        let ids: Vec<u32> = self.instances.iter().filter(|i| i.design_space == ds_id).map(|i| i.id).collect();
        for id in ids {
            let inst = self.instance_mut(id).unwrap();
            redistribute_axes(&mut inst.axes, slack);
        }
        Ok(())
    }
}

/// `InstanceModel._setMetapolationValuesInModel`. With all sliders at 0
/// the JS divided 0 by 0 and wrote NaN proportions; here the masters then
/// share equally.
pub fn set_metapolation_values_in_model(axes: &mut [Axis]) {
    if axes.len() == 1 { axes[0].metapolation_value = 1.0; return; }
    let cake: f64 = axes.iter().rev().map(|a| a.axis_value).sum();
    let n = axes.len() as f64;
    for a in axes.iter_mut().rev() {
        a.metapolation_value = if cake == 0.0 { 1.0 / n } else { a.axis_value / cake };
    }
}

/// `InstanceModel.reDestributeAxes`
fn redistribute_axes(axes: &mut [Axis], slack: usize) {
    if axes.len() <= 1 || slack >= axes.len() { return; }
    let mut max: Option<f64> = None;
    for (i, a) in axes.iter().enumerate() {
        if i != slack && max.map(|m| a.axis_value >= m).unwrap_or(true) { max = Some(a.axis_value); }
    }
    let ratio = 100.0 / (max.unwrap_or(0.0) + axes[slack].axis_value);
    for a in axes.iter_mut() {
        // (ratio * value).toFixed(1)
        a.axis_value = (ratio * a.axis_value * 10.0).round() / 10.0;
    }
}

// -------------------------------------------------------------- instances

impl App {
    /// `createNewInstance` + `instanceTools.registerInstance` + `addInstance`
    fn new_instance(&mut self, mut axes: Vec<Axis>, ds: u32) -> Result<u32> {
        let id = self.instance_counter;
        self.instance_counter += 1;
        set_metapolation_values_in_model(&mut axes);
        let spec: Vec<(String, f64)> = axes.iter().map(|a| (a.master.clone(), a.metapolation_value)).collect();
        let node = self.project.create_instance(&format!("instance-{id}"), &spec).map_err(e2s)?;
        let name = self.project.mom().node(node).id.clone().unwrap_or_default();
        let n = axes.len();
        self.instances.push(Instance {
            id, name, display_name: format!("Instance {id}"), axes, design_space: ds,
            color: INSTANCE_COLORS[id as usize % INSTANCE_COLORS.len()], export: true, display: false, cps_axes_count: n,
        });
        self.set_current_instance(id);
        Ok(id)
    }

    /// `InstanceModel.setCurrent`
    pub fn set_current_instance(&mut self, id: u32) {
        let Some(ds) = self.instance(id).map(|i| i.design_space) else { return };
        self.current_instance = Some(id);
        if let Some(d) = self.design_space_mut(ds) { d.last_instance = Some(id); }
    }

    /// `addInstance`: a new instance in the current instance's design space,
    /// every axis at 50
    pub fn add_instance(&mut self) -> Result<Option<u32>> {
        let ds_id = match self.current_instance.and_then(|i| self.instance(i)) {
            Some(i) => i.design_space,
            None => match self.current_design_space { Some(d) => d, None => return Ok(None) },
        };
        let ds = self.design_space(ds_id).cloned().ok_or("no design space")?;
        if ds.axes.is_empty() { return Ok(None); }
        let n = ds.axes.len() as f64;
        let axes = ds.axes.iter().map(|m| Axis { master: m.clone(), axis_value: 50.0, metapolation_value: 1.0 / n }).collect();
        self.new_instance(axes, ds_id).map(Some)
    }

    /// `cloneInstance`
    pub fn clone_instance(&mut self) -> Result<Option<u32>> {
        let Some(cur) = self.current_instance.and_then(|i| self.instance(i)).cloned() else { return Ok(None) };
        let ds = self.current_design_space.unwrap_or(cur.design_space);
        self.new_instance(cur.axes.clone(), ds).map(Some)
    }

    fn remove_instance_only(&mut self, id: u32) -> Result<bool> {
        let Some(inst) = self.instance(id).cloned() else { return Ok(false) };
        if !self.project.delete_master(&inst.name, false, false).map_err(e2s)? { return Ok(false); }
        let index = self.instances.iter().position(|i| i.id == id).unwrap();
        self.instances.remove(index);
        for d in &mut self.design_spaces { if d.last_instance == Some(id) { d.last_instance = None; } }
        // _findNewCurrentInstance
        if self.current_instance == Some(id) {
            let l = self.instances.len();
            self.current_instance = None;
            if l > index { self.set_current_instance(self.instances[index].id); }
            else if l > 0 { self.set_current_instance(self.instances[l - 1].id); }
        }
        Ok(true)
    }

    /// `removeInstance`: the last instance of a design space takes the
    /// design space with it
    pub fn remove_instance(&mut self, id: u32) -> Result<()> {
        let Some(ds) = self.instance(id).map(|i| i.design_space) else { return Ok(()) };
        let n = self.instances.iter().filter(|i| i.design_space == ds).count();
        if n == 1 {
            self.remove_design_space(ds)
        } else {
            self.remove_instance_only(id).map(|_| ())
        }
    }

    pub fn rename_instance(&mut self, id: u32, display_name: &str) {
        if let Some(i) = self.instance_mut(id) { i.display_name = display_name.into(); }
    }

    pub fn set_instance_flags(&mut self, id: u32, export: Option<bool>, display: Option<bool>) {
        if let Some(i) = self.instance_mut(id) {
            if let Some(e) = export { i.export = e; }
            if let Some(d) = display { i.display = d; }
        }
    }

    /// `instanceTools.update`
    fn update_instance_cps(&mut self, id: u32) -> Result<()> {
        let inst = self.instance(id).cloned().ok_or("no such instance")?;
        let node = self.project.master_by_name(&inst.name).ok_or("instance master is not open")?;
        let spec: Vec<(String, f64)> = inst.axes.iter().map(|a| (a.master.clone(), a.metapolation_value)).collect();
        self.project.update_instance(node, &spec).map_err(e2s)?;
        self.instance_mut(id).unwrap().cps_axes_count = inst.axes.len();
        Ok(())
    }

    /// The slider of axis `index` of instance `id` moved to `value` (0…100):
    /// the design space control's drag logic (the slack master's slider is
    /// reversed and scales the others), then `setMetapolationValues`.
    pub fn set_axis_value(&mut self, id: u32, index: usize, value: f64) -> Result<()> {
        let Some(ds_id) = self.instance(id).map(|i| i.design_space) else { return Ok(()) };
        let slack = self.design_space(ds_id).map(|d| d.slack).unwrap_or(0);
        let value = value.clamp(0.0, 100.0);
        {
            let inst = self.instance_mut(id).unwrap();
            let axes = &mut inst.axes;
            if index >= axes.len() { return Ok(()); }
            if axes.len() > 1 && index == slack {
                // dragging the slack master (its slider runs reversed):
                // `value` is its own share, the others scale along
                let pos = 100.0 - value;
                let highest = (0..axes.len()).filter(|i| *i != slack)
                    .fold(None, |h: Option<usize>, i| match h { Some(j) if axes[j].axis_value > axes[i].axis_value => Some(j), _ => Some(i) });
                let max = highest.map(|h| axes[h].axis_value).unwrap_or(0.0);
                let ratios: Vec<f64> = axes.iter().map(|a| if max != 0.0 { a.axis_value / max } else { 1.0 }).collect();
                axes[index].axis_value = round1(value);
                for i in 0..axes.len() {
                    if i != slack { axes[i].axis_value = round1(pos * ratios[i]); }
                }
            } else {
                axes[index].axis_value = round1(value);
                // the largest slider drags the slack master's with it
                if axes.len() > 1 && (0..axes.len()).all(|i| i == index || i == slack || axes[i].axis_value <= value) {
                    axes[slack].axis_value = round1(100.0 - value);
                }
            }
            set_metapolation_values_in_model(axes);
        }
        self.write_proportions(id)
    }

    /// `_setMetapolationValuesInCPS` (and the CPS file if the axis count changed)
    fn write_proportions(&mut self, id: u32) -> Result<()> {
        let inst = self.instance(id).cloned().ok_or("no such instance")?;
        if inst.cps_axes_count != inst.axes.len() { return self.update_instance_cps(id); }
        let node = self.project.master_by_name(&inst.name).ok_or("instance master is not open")?;
        for (i, a) in inst.axes.iter().enumerate() {
            self.project.set_property(node, &format!("proportion{i}"), &mp_math::js_num(a.metapolation_value)).map_err(e2s)?;
        }
        Ok(())
    }
}

// ------------------------------------------------------------- parameters

/// The parameter panel's view of one parameter on one selection level
/// (`SelectionParameter`)
#[derive(Clone, Debug, PartialEq)]
pub struct SelectionParameter {
    pub param: usize,
    /// (operator index, low, high): `low != high` shows a range
    pub operators: Vec<(usize, Option<f64>, Option<f64>)>,
    /// (low, high) of the effective values, on the effective level only
    pub effective: Option<(f64, f64)>,
}

impl App {
    /// the selected elements of a level: edit masters, or selected glyphs
    pub fn selection(&self, level: Level) -> Vec<Elem> {
        match level {
            Level::Master => self.masters.iter().filter(|m| m.edit).map(|m| Elem::Master(m.name.clone())).collect(),
            Level::Glyph => self.selected_glyphs.iter().filter(|(m, _)| self.master(m).map(|x| x.edit).unwrap_or(false))
                .map(|(m, g)| Elem::Glyph(m.clone(), g.clone())).collect(),
            _ => vec![],
        }
    }

    /// select a glyph (exclusively, or toggled with `add`) — specimen click
    pub fn select_glyph(&mut self, master: &str, glyph: &str, add: bool) {
        let key = (master.to_string(), glyph.to_string());
        if !add { self.selected_glyphs.clear(); }
        if add && self.selected_glyphs.contains(&key) { self.selected_glyphs.remove(&key); } else { self.selected_glyphs.insert(key); }
    }

    /// the specimen rubberband: `selectSet` (replacing the selection) or,
    /// with a modifier key, `toggleSet`
    pub fn select_glyph_set(&mut self, set: &[(String, String)], toggle: bool) {
        if !toggle { self.selected_glyphs.clear(); }
        for k in set {
            if toggle && self.selected_glyphs.contains(k) { self.selected_glyphs.remove(k); } else { self.selected_glyphs.insert(k.clone()); }
        }
    }

    /// the font export panel's "Check All" / "Uncheck All"
    pub fn set_all_export(&mut self, export: bool) {
        for i in &mut self.instances { i.export = export; }
    }

    /// `Selection.updateParameters` for `level`
    pub fn selection_parameters(&mut self, level: Level) -> Vec<SelectionParameter> {
        let elems = self.selection(level);
        let mut out = vec![];
        for (p, def) in PARAMETERS.iter().enumerate() {
            if !elems.iter().any(|e| self.params.has(e, p)) { continue; }
            let mut ops = vec![];
            for (o, odef) in OPERATORS.iter().enumerate() {
                let vals: Vec<Option<f64>> = elems.iter().filter_map(|e| self.params.get(e, p).and_then(|ep| ep.value(o))).collect();
                if vals.is_empty() { continue; }
                let nums: Vec<f64> = vals.iter().flatten().copied().collect();
                let (mut low, mut high) = (nums.iter().copied().reduce(f64::min), nums.iter().copied().reduce(f64::max));
                if vals.len() < elems.len() {
                    if let Some(s) = odef.standard {
                        low = Some(low.map_or(s, |l| l.min(s)));
                        high = Some(high.map_or(s, |h| h.max(s)));
                    }
                }
                ops.push((o, low, high));
            }
            let effective = if def.effective_level == level && !elems.is_empty() {
                for e in &elems { self.params.ensure_measured(&self.project, e.master()); }
                let vals: Vec<f64> = elems.iter().map(|e| self.params.effective(&self.project, e, p)).collect();
                Some((vals.iter().copied().fold(f64::INFINITY, f64::min), vals.iter().copied().fold(f64::NEG_INFINITY, f64::max)))
            } else { None };
            out.push(SelectionParameter { param: p, operators: ops, effective });
        }
        out
    }

    /// add `op` of `param` to every selected element of `level`
    pub fn add_operator(&mut self, level: Level, param: usize, op: usize) {
        for e in self.selection(level) { self.params.add_operator(&self.project, &e, param, op); }
    }

    /// set the value of `op` of `param` on every selected element of `level`
    pub fn set_operator_value(&mut self, level: Level, param: usize, op: usize, value: Option<f64>) {
        for e in self.selection(level) { self.params.set_operator(&mut self.project, &e, param, op, value); }
    }

    pub fn remove_operator(&mut self, level: Level, param: usize, op: usize) {
        for e in self.selection(level) { self.params.remove_operator(&mut self.project, &e, param, op); }
    }
}

// ----------------------------------------------------------------- export

impl App {
    /// the UI's UFO export of a master or instance: UFO 2, unrounded,
    /// zipped as `<file_name>.ufo/…` (`ExportObject` + `zipUtil.pack`)
    pub fn export_ufo_zip(&self, master: &str, file_name: &str) -> Result<Vec<u8>> {
        let node = self.project.master_by_name(master).ok_or_else(|| format!("no master {master}"))?;
        let mem = MemIo::new();
        let dir = format!("{file_name}.ufo");
        mp_mom::export::export_ufo_format(&self.project.engine, node, &mem, &dir, None, 2)?;
        zipio::pack_dir(&mem, &dir)
    }

    /// the OTF export of a master or instance
    pub fn export_otf(&self, master: &str) -> Result<Vec<u8>> {
        let node = self.project.master_by_name(master).ok_or_else(|| format!("no master {master}"))?;
        mp_mom::export_otf::export_otf(&self.project.engine, node, &self.project.project_fontinfo())
    }

    /// `exportFonts`: every instance marked for export as
    /// `<display name>.otf` and `<display name>.ufo.zip` in
    /// `metapolator-export-<timestamp>/`, zipped. `timestamp` is
    /// `YYYYMMDD-hhmmss`. Returns (file name, data) and the failures.
    pub fn export_bundle(&self, timestamp: &str) -> Result<(String, Vec<u8>, Vec<String>)> {
        let folder = format!("metapolator-export-{timestamp}");
        let mut files = vec![];
        let mut errors = vec![];
        for inst in self.instances.iter().filter(|i| i.export) {
            match self.export_otf(&inst.name) {
                Ok(d) => files.push((format!("{folder}/{}.otf", inst.display_name), d)),
                Err(e) => errors.push(format!("{}.otf: {e}", inst.display_name)),
            }
            match self.export_ufo_zip(&inst.name, &inst.display_name) {
                Ok(d) => files.push((format!("{folder}/{}.ufo.zip", inst.display_name), d)),
                Err(e) => errors.push(format!("{}.ufo: {e}", inst.display_name)),
            }
        }
        if files.is_empty() && errors.is_empty() { return Err("no instance is marked for export".into()); }
        Ok((format!("{folder}.zip"), zipio::pack_files(&files)?, errors))
    }
}

// ------------------------------------------------------------ test support

impl App {
    /// The state that `tools/js-reference/ui-model-golden.js` records after
    /// every step: effective Width of every glyph of every master,
    /// effective Weight of every point of `weight_glyphs`, instance axes.
    /// Numbers are JS `String(x)`; missing values are null.
    pub fn ui_snapshot(&self, weight_glyphs: &[String]) -> serde_json::Value {
        use serde_json::{json, Map, Value as Json};
        let (w, wt) = (params::param_index("Width").unwrap(), params::param_index("Weight").unwrap());
        let s = |v: Option<f64>| v.map(|x| Json::String(mp_math::js_num(x))).unwrap_or(Json::Null);
        let (mut widths, mut weights) = (Map::new(), Map::new());
        for m in &self.masters {
            let mut gw = Map::new();
            for g in self.glyph_names(&m.name) {
                gw.insert(g.clone(), s(self.params.get(&Elem::Glyph(m.name.clone(), g), w).and_then(|p| p.effective)));
            }
            widths.insert(m.name.clone(), Json::Object(gw));
            let mut pw = Map::new();
            let mom = self.project.mom();
            let master = self.project.master_by_name(&m.name);
            for g in weight_glyphs {
                let glyph = master.and_then(|mn| mom.node(mn).children.iter().copied().find(|c| mom.node(*c).id.as_deref() == Some(g)));
                let Some(glyph) = glyph else { continue };
                let arr: Vec<Json> = mom.node(glyph).children.iter().enumerate().map(|(i, c)| {
                    Json::Array((0..mom.node(*c).children.len()).map(|j| {
                        s(self.params.get(&Elem::Point(m.name.clone(), g.clone(), i, j), wt).and_then(|p| p.effective))
                    }).collect())
                }).collect();
                pw.insert(g.clone(), Json::Array(arr));
            }
            weights.insert(m.name.clone(), Json::Object(pw));
        }
        let instances: Vec<Json> = self.instances.iter().map(|i| json!({
            "name": i.name,
            "axes": i.axes.iter().map(|a| json!([a.master, mp_math::js_num(a.axis_value), mp_math::js_num(a.metapolation_value)])).collect::<Vec<_>>(),
        })).collect();
        json!({ "widths": widths, "weights": weights, "instances": instances })
    }

    /// apply one step of `tools/js-reference/ui-model-steps.json`
    pub fn apply_ui_step(&mut self, step: &serde_json::Value) -> Result<()> {
        let a = step.as_array().ok_or("a step is an array")?;
        let level = |v: &serde_json::Value| if v == "master" { Level::Master } else { Level::Glyph };
        let pid = |v: &serde_json::Value| params::param_index(v.as_str().unwrap_or("")).ok_or("unknown parameter");
        let oid = |v: &serde_json::Value| params::op_index(v.as_str().unwrap_or("")).ok_or("unknown operator");
        match a[0].as_str().unwrap_or("") {
            "selectMasters" => {
                let names: Vec<&str> = a[1].as_array().ok_or("names")?.iter().filter_map(|x| x.as_str()).collect();
                for m in self.masters.iter_mut() { m.edit = names.contains(&m.name.as_str()); }
                self.selected_glyphs.clear();
            }
            "selectGlyphs" => {
                self.selected_glyphs.clear();
                for p in a[1].as_array().ok_or("pairs")? {
                    self.select_glyph(p[0].as_str().unwrap_or(""), p[1].as_str().unwrap_or(""), true);
                }
            }
            "set" => {
                let (p, o) = (pid(&a[2])?, oid(&a[3])?);
                self.add_operator(level(&a[1]), p, o);
                self.set_operator_value(level(&a[1]), p, o, a[4].as_f64());
            }
            "remove" => { let (p, o) = (pid(&a[2])?, oid(&a[3])?); self.remove_operator(level(&a[1]), p, o); }
            "duplicate" => { self.duplicate_selected_masters()?; }
            "designSpace" => self.add_master_to_design_space(a[1].as_str().unwrap_or(""))?,
            "axes" => {
                // the drag of the last (non-slack) slider sets the others
                let id = self.current_instance.ok_or("no current instance")?;
                let vals = a[1].as_array().ok_or("values")?;
                self.set_axis_value(id, vals.len() - 1, vals[vals.len() - 1].as_f64().unwrap_or(0.0))?;
            }
            other => return Err(format!("unknown step {other}")),
        }
        Ok(())
    }
}
