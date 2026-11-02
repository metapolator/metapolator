//! A Metapolator project on disk (or in memory): port of the synchronous
//! paths of Atem-MOM `project/Project.js` and `project/IOProjectPersistence.js`.
//!
//! Layout: `<base>/data/com.metapolator/{project.yaml, MOM/*.yaml, CPS/*.cps}`.

use crate::generators;
use crate::js::{parse_yaml, to_yaml, Json, JsonMap};
use crate::tree::{Kind, Mom};
use mp_cps::{CpsError, Engine, NodeId, Result, RuleController, SourceLoader};
use mp_io::{join, Io, IoError};
use std::rc::Rc;

pub const LIB_MOM_PRIMARY: &str = include_str!("../cpslib/MOM/primary.cps");
pub const LIB_METAPOLATOR: &[(&str, &str)] = &[
    ("metamaster.cps", include_str!("../cpslib/metapolator/metamaster.cps")),
    ("scale.cps", include_str!("../cpslib/metapolator/scale.cps")),
    ("single-inheritance.cps", include_str!("../cpslib/metapolator/single-inheritance.cps")),
    ("ui-master.cps", include_str!("../cpslib/metapolator/ui-master.cps")),
    ("weight.cps", include_str!("../cpslib/metapolator/weight.cps")),
];

/// The library CPS files mounted at `lib/MOM` and `lib/metapolator`.
pub fn library_source(name: &str) -> Option<std::result::Result<&'static str, ()>> {
    if let Some(rest) = name.strip_prefix("lib/MOM/") {
        return Some(if rest == "primary.cps" { Ok(LIB_MOM_PRIMARY) } else { Err(()) });
    }
    if let Some(rest) = name.strip_prefix("lib/metapolator/") {
        return Some(LIB_METAPOLATOR.iter().find(|(n, _)| *n == rest).map(|(_, s)| *s).ok_or(()));
    }
    None
}

pub fn io_err(e: IoError) -> CpsError {
    CpsError::new(mp_cps::ErrorKind::Cps, e.to_string())
}

struct Loader {
    io: Rc<dyn Io>,
    cps_dir: String,
}

impl SourceLoader for Loader {
    fn read(&self, source_name: &str) -> Result<String> {
        match library_source(source_name) {
            Some(Ok(s)) => Ok(s.to_string()),
            Some(Err(())) => Err(io_err(IoError::NotFound(join(&self.cps_dir, source_name)))),
            None => self.io.read_string(&join(&self.cps_dir, source_name)).map_err(io_err),
        }
    }
}

pub fn new_rule_controller(io: Rc<dyn Io>, cps_dir: &str) -> RuleController {
    let mut rc = RuleController::new(Box::new(Loader { io, cps_dir: cps_dir.to_string() }));
    rc.register_generator("interpolation", Box::new(generators::interpolation));
    rc.register_generator("metapolation", Box::new(generators::metapolation));
    rc
}

pub struct Project {
    pub io: Rc<dyn Io>,
    pub base_dir: String,
    pub engine: Engine<Mom>,
    /// `project.yaml`
    pub project: Json,
    /// names of the masters stored in `MOM/` (`_persistedMasters`)
    pub persisted_masters: Vec<String>,
    /// CPS files changed in memory: (source name, text) to write on save
    pub dirty_cps: Vec<(String, String)>,
}

impl Project {
    pub fn data_dir(&self) -> String { join(&self.base_dir, "data/com.metapolator") }
    pub fn cps_dir(&self) -> String { join(&self.data_dir(), "CPS") }
    pub fn mom_dir(&self) -> String { join(&self.data_dir(), "MOM") }

    fn read_yaml(io: &dyn Io, path: &str) -> Result<Json> {
        let s = io.read_string(path).map_err(io_err)?;
        parse_yaml(&s).map_err(|e| CpsError::cps(format!("{path}: {e}")))
    }

    /// `Project.load`
    pub fn load(io: Rc<dyn Io>, base_dir: &str) -> Result<Project> {
        let data_dir = join(base_dir, "data/com.metapolator");
        let project = Self::read_yaml(&*io, &join(&data_dir, "project.yaml"))?;
        let multivers = Self::read_yaml(&*io, &join(&data_dir, "MOM/multivers.yaml"))?;
        let mut mom = Mom::new();
        let root = mom.root();
        mom.load_tree(root, &multivers)?;
        let rules = new_rule_controller(io.clone(), &join(&data_dir, "CPS"));
        let mut p = Project {
            io,
            base_dir: base_dir.to_string(),
            engine: Engine::new(mom, rules),
            project,
            persisted_masters: vec![],
            dirty_cps: vec![],
        };
        p.persisted_masters = p.list_persisted_masters()?;
        Ok(p)
    }

    fn list_persisted_masters(&self) -> Result<Vec<String>> {
        let mut out = vec![];
        for item in self.io.read_dir(&self.mom_dir()).map_err(io_err)? {
            let Some(pos) = item.rfind(".yaml") else { continue };
            let name = &item[..pos];
            if let Some(p) = name.rfind(".master") {
                out.push(name[..p].to_string());
            }
        }
        Ok(out)
    }

    pub fn mom(&self) -> &Mom { &self.engine.model }

    pub fn univers(&self) -> NodeId {
        let root = self.mom().root();
        self.mom().node(root).children[0]
    }

    /// the masters currently open in the univers
    pub fn open_masters(&self) -> Vec<NodeId> {
        self.mom().node(self.univers()).children.clone()
    }

    pub fn master_by_name(&self, name: &str) -> Option<NodeId> {
        self.open_masters().into_iter().find(|m| self.mom().node(*m).id.as_deref() == Some(name))
    }

    /// `Project._openMaster`: load a master (and its base) into the univers.
    pub fn open_master(&mut self, name: &str) -> Result<NodeId> {
        if let Some(m) = self.master_by_name(name) {
            return Ok(m);
        }
        let data = Self::read_yaml(&*self.io, &join(&self.mom_dir(), &format!("{name}.master.yaml")))?;
        let master = if let Some(base) = data.get("base").filter(|b| !b.is_null()) {
            let base_name = crate::js::js_string(base);
            let base_master = self.open_master(&base_name)?;
            let mom = self.engine.model_mut();
            // id (1) classes (2) + setBaseNode (0x10)
            let m = mom.clone_node(base_master, 1 | 2 | 0x10);
            if let Some(Json::Object(dict)) = data.get("data") {
                mom.load_data_from_dict(m, dict)?;
            }
            mom.node_mut(m).id = Some(name.to_string());
            m
        } else {
            let mom = self.engine.model_mut();
            let m = mom.create(Kind::Master);
            mom.load_tree(m, &data)?;
            // the filename wins over a stored id
            mom.node_mut(m).id = Some(name.to_string());
            m
        };
        let univers = self.univers();
        self.engine.model_mut().add(univers, master)?;
        Ok(master)
    }

    /// open every persisted master (in name order, like tools/js-reference/golden.js)
    pub fn open_all_masters(&mut self) -> Result<Vec<NodeId>> {
        let mut names = self.persisted_masters.clone();
        names.sort();
        names.iter().map(|n| self.open_master(n)).collect()
    }
}

impl Project {
    /// `Project.init`: a fresh project directory (a UFO 3 with the
    /// Metapolator data in `data/com.metapolator`). Fails if it exists.
    pub fn init(io: Rc<dyn Io>, base_dir: &str) -> Result<Project> {
        if io.exists(base_dir) {
            return Err(CpsError::cps(format!("directory \"{base_dir}\" exists")));
        }
        // what ufoJS' UFOWriter creates for a new UFO 3
        let plist = |v: serde_json::Value| mp_ufo::plist::to_string(&v);
        io.write(&join(base_dir, "metainfo.plist"),
                 plist(serde_json::json!({"creator": "org.ufojs.lib", "formatVersion": 3})).as_bytes()).map_err(io_err)?;
        io.write(&join(base_dir, "layercontents.plist"),
                 plist(serde_json::json!([["public.default", "glyphs"]])).as_bytes()).map_err(io_err)?;
        io.write(&join(base_dir, "glyphs/contents.plist"), plist(serde_json::json!({})).as_bytes()).map_err(io_err)?;
        let data_dir = join(base_dir, "data/com.metapolator");
        let mut mom = Mom::new();
        let root = mom.root();
        let univers = mom.create(Kind::Univers);
        mom.add(root, univers)?;
        let rules = new_rule_controller(io.clone(), &join(&data_dir, "CPS"));
        let p = Project {
            io,
            base_dir: base_dir.to_string(),
            engine: Engine::new(mom, rules),
            project: serde_json::json!({"session": {"masters": []}}),
            persisted_masters: vec![],
            dirty_cps: vec![],
        };
        p.save_project()?;
        Ok(p)
    }

    fn write_yaml(&self, path: &str, v: &Json) -> Result<()> {
        self.io.write(path, to_yaml(v).as_bytes()).map_err(io_err)
    }

    /// `_saveProject`: multivers (without masters) and project.yaml
    pub fn save_project(&self) -> Result<()> {
        self.write_yaml(&join(&self.mom_dir(), "multivers.yaml"), &self.mom().dump_without_masters())?;
        self.write_yaml(&join(&self.data_dir(), "project.yaml"), &self.project)
    }

    /// `saveMaster`: a base master is dumped as a tree, a derived master as
    /// `{base, data}` with its own properties and attachments
    pub fn save_master(&mut self, master: NodeId) -> Result<()> {
        let mom = self.mom();
        let data = match mom.node(master).base_node {
            Some(base) => serde_json::json!({
                "base": mom.node(base).id.clone(),
                "data": Json::Object(mom.dump_data_to_dict(master)),
            }),
            None => mom.dump_tree(master).unwrap_or(Json::Null),
        };
        let name = mom.node(master).id.clone().ok_or_else(|| CpsError::cps("a master needs an id to be saved"))?;
        self.write_yaml(&join(&self.mom_dir(), &format!("{name}.master.yaml")), &data)?;
        if !self.persisted_masters.contains(&name) { self.persisted_masters.push(name); }
        Ok(())
    }

    /// `Project.save`: project file, every open master and changed CPS files
    pub fn save(&mut self) -> Result<()> {
        self.save_project()?;
        for m in self.open_masters() { self.save_master(m)?; }
        for (name, text) in self.dirty_cps.drain(..).collect::<Vec<_>>() {
            self.io.write(&join(&self.cps_dir(), &name), text.as_bytes()).map_err(io_err)?;
        }
        Ok(())
    }

    /// `hasMaster`
    pub fn has_master(&self, name: &str) -> bool {
        self.master_by_name(name).is_some() || self.persisted_masters.iter().any(|m| m == name)
    }

    /// `_getUniqueMasterName`
    pub fn unique_master_name(&self, name: &str) -> String {
        if !self.has_master(name) { return name.to_string(); }
        let (mut base, mut num) = (name.to_string(), 0u64);
        if let Some(pos) = name.rfind('_') {
            let tail = &name[pos + 1..];
            if !tail.is_empty() && tail.bytes().all(|b| b.is_ascii_digit()) {
                if let Ok(n) = tail.parse() { num = n; base = name[..pos].to_string(); }
            }
        }
        loop {
            let candidate = format!("{base}_{num}");
            num += 1;
            if !self.has_master(&candidate) { return candidate; }
        }
    }

    /// the project's glyph groups (`groups.plist` of the project UFO)
    fn glyph_classes(&self) -> std::collections::HashMap<String, Vec<String>> {
        let mut out: std::collections::HashMap<String, Vec<String>> = Default::default();
        if let Ok(text) = self.io.read_string(&join(&self.base_dir, "groups.plist")) {
            if let Ok(Json::Object(groups)) = mp_ufo::reader::parse_plist(&text) {
                for (group, names) in groups {
                    for n in names.as_array().cloned().unwrap_or_default() {
                        if let Some(n) = n.as_str() { out.entry(n.to_string()).or_default().push(group.clone()); }
                    }
                }
            }
        }
        out
    }

    /// `Project.import`: import a UFO from `ufo_io` as a new base master
    /// (not saved yet). The name is made unique; the master uses
    /// `lib/MOM/primary.cps`.
    pub fn import_ufo(&mut self, master_name: &str, ufo_io: &dyn Io, ufo_path: &str,
                      glyphs: Option<&[String]>) -> Result<NodeId> {
        let reader = mp_ufo::reader::UfoReader::new(ufo_io, ufo_path).map_err(|e| CpsError::cps(e.0))?;
        let opts = crate::import::ImportOptions { glyph_classes: Some(self.glyph_classes()), ..Default::default() };
        let name = self.unique_master_name(master_name);
        let univers = self.univers();
        let mom = self.engine.model_mut();
        let master = crate::import::import_ufo(mom, &reader, Some(master_name), glyphs, &opts)?;
        mom.node_mut(master).id = Some(name);
        mom.set_attachment(master, "cpsFile", Json::String("lib/MOM/primary.cps".into()));
        mom.add(univers, master)?;
        Ok(master)
    }

    /// `createDerivedMaster`: clone `base` (ids, classes, base nodes) as a
    /// new master named `name` (made unique) with its own CPS file.
    pub fn create_derived_master(&mut self, base: &str, name: &str, cps: &str) -> Result<NodeId> {
        let base_master = self.open_master(base)?;
        let name = self.unique_master_name(name);
        let cps_file = format!("{name}.master.cps");
        self.io.write(&join(&self.cps_dir(), &cps_file), cps.as_bytes()).map_err(io_err)?;
        let univers = self.univers();
        let mom = self.engine.model_mut();
        let m = mom.clone_node(base_master, 1 | 2 | 0x10);
        mom.node_mut(m).id = Some(name);
        let mut att = JsonMap::new();
        att.insert("cpsFile".into(), Json::String(cps_file));
        mom.node_mut(m).attachment = Some(att);
        mom.add(univers, m)?;
        Ok(m)
    }
}
