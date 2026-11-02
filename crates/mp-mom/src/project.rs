//! A Metapolator project on disk (or in memory): port of the synchronous
//! paths of Atem-MOM `project/Project.js` and `project/IOProjectPersistence.js`.
//!
//! Layout: `<base>/data/com.metapolator/{project.yaml, MOM/*.yaml, CPS/*.cps}`.

use crate::generators;
use crate::js::{parse_yaml, Json};
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
