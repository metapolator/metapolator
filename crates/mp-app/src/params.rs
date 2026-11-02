//! The parameter panel's model: port of `models/metapolator/masters/
//! {_ElementModel,ParameterModel,OperatorModel}.js` and the definitions in
//! `ui-tools/selectionTools.js`.
//!
//! Operators live on master and glyph elements (the only levels with a "+"
//! in the parameter panel). A parameter is *effective* on one level (Width:
//! glyph, Weight: point), where the combined operators of the element and
//! its ancestors give an effective value, written to CPS as a correction
//! factor (`WidthF`/`WeightF`); `multiply`/`divide` are also written
//! directly as a factor on the element that holds them.
//!
//! Differences from the JS, all deliberate:
//! - operators are kept destacked (one per operator kind and element):
//!   the JS merged stacked operators whenever the selection changed;
//! - every glyph counts as displayed: the JS wrote CPS only for glyphs
//!   shown so far and caught the others up when they were shown (and
//!   before export), so the end state is the same; initial values are
//!   measured for a whole master before its first parameter change, as
//!   if all its glyphs had been displayed already;
//! - "points" are only penstroke centers: the JS treated every glyph child
//!   as a penstroke, measured contour points as 0 and wrote `WeightF: NaN`
//!   onto them, which no CPS rule reads.

use mp_cps::{NodeId, Value};
use mp_mom::project::Project;
use mp_mom::tree::Kind;
use std::collections::BTreeMap;

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Level { Master, Glyph, Penstroke, Point }

impl Level {
    pub fn name(self) -> &'static str {
        match self { Level::Master => "master", Level::Glyph => "glyph", Level::Penstroke => "penstroke", Level::Point => "point" }
    }
}

pub struct ParamDef {
    pub name: &'static str,
    pub cps_key: &'static str,
    pub unit: &'static str,
    pub step: f64,
    pub decimals: usize,
    pub effective_level: Level,
}

/// `selectionTools.baseParameters`
pub const PARAMETERS: &[ParamDef] = &[
    ParamDef { name: "Width", cps_key: "WidthF", unit: "em", step: 0.005, decimals: 4, effective_level: Level::Glyph },
    ParamDef { name: "Weight", cps_key: "WeightF", unit: "em", step: 0.1, decimals: 2, effective_level: Level::Point },
];

pub struct OpDef {
    pub name: &'static str,
    pub sign: &'static str,
    pub standard: Option<f64>,
    /// "stack" (may combine) or "unique"
    pub stack: bool,
    pub uses_unit: bool,
    pub effective_local: bool,
}

/// `selectionTools.baseOperators`, in their `order`
pub const OPERATORS: &[OpDef] = &[
    OpDef { name: "multiply", sign: "×", standard: Some(1.0), stack: true, uses_unit: false, effective_local: true },
    OpDef { name: "divide", sign: "∕", standard: Some(1.0), stack: true, uses_unit: false, effective_local: true },
    OpDef { name: "add", sign: "+", standard: Some(0.0), stack: true, uses_unit: true, effective_local: false },
    OpDef { name: "subtract", sign: "−", standard: Some(0.0), stack: true, uses_unit: true, effective_local: false },
    OpDef { name: "is", sign: "=", standard: None, stack: false, uses_unit: true, effective_local: false },
    OpDef { name: "min", sign: "min", standard: Some(0.0), stack: false, uses_unit: true, effective_local: false },
    OpDef { name: "max", sign: "max", standard: Some(0.0), stack: false, uses_unit: true, effective_local: false },
];

pub fn param_index(name: &str) -> Option<usize> { PARAMETERS.iter().position(|p| p.name == name) }
pub fn op_index(name: &str) -> Option<usize> { OPERATORS.iter().position(|o| o.name == name) }

/// A parameter-carrying element of the master model.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Elem {
    Master(String),
    Glyph(String, String),
    /// (master, glyph, penstroke index)
    Penstroke(String, String, usize),
    /// (master, glyph, penstroke index, point index)
    Point(String, String, usize, usize),
}

impl Elem {
    pub fn level(&self) -> Level {
        match self { Elem::Master(_) => Level::Master, Elem::Glyph(..) => Level::Glyph, Elem::Penstroke(..) => Level::Penstroke, Elem::Point(..) => Level::Point }
    }
    pub fn master(&self) -> &str {
        match self { Elem::Master(m) | Elem::Glyph(m, _) | Elem::Penstroke(m, ..) | Elem::Point(m, ..) => m }
    }
    pub fn parent(&self) -> Option<Elem> {
        match self {
            Elem::Master(_) => None,
            Elem::Glyph(m, _) => Some(Elem::Master(m.clone())),
            Elem::Penstroke(m, g, _) => Some(Elem::Glyph(m.clone(), g.clone())),
            Elem::Point(m, g, p, _) => Some(Elem::Penstroke(m.clone(), g.clone(), *p)),
        }
    }
    fn with_master(&self, name: &str) -> Elem {
        let n = name.to_string();
        match self.clone() {
            Elem::Master(_) => Elem::Master(n),
            Elem::Glyph(_, g) => Elem::Glyph(n, g),
            Elem::Penstroke(_, g, p) => Elem::Penstroke(n, g, p),
            Elem::Point(_, g, p, q) => Elem::Point(n, g, p, q),
        }
    }
}

/// `ParameterModel` of one element
#[derive(Clone, Debug, Default, PartialEq)]
pub struct ElemParam {
    /// (operator index, value); `None` is the JS `null` of a fresh `is`
    pub operators: Vec<(usize, Option<f64>)>,
    pub initial: Option<f64>,
    pub effective: Option<f64>,
}

impl ElemParam {
    /// `getCPSFactor`: the product of the local operators, `None` if none
    pub fn cps_factor(&self) -> Option<f64> {
        let mut factor = 1.0;
        let mut has = false;
        for (op, v) in self.operators.iter().rev() {
            let def = &OPERATORS[*op];
            if !def.effective_local { continue; }
            has = true;
            let v = v.unwrap_or(f64::NAN);
            if def.name == "multiply" { factor *= v } else if def.name == "divide" { factor /= v }
        }
        if has { Some(factor) } else { None }
    }
    pub fn has_non_local(&self) -> bool { self.operators.iter().any(|(o, _)| !OPERATORS[*o].effective_local) }
    pub fn value(&self, op: usize) -> Option<Option<f64>> { self.operators.iter().find(|(o, _)| *o == op).map(|(_, v)| *v) }
}

/// All parameters of all elements, keyed by (element, parameter index).
#[derive(Clone, Debug, Default)]
pub struct Params {
    pub map: BTreeMap<(Elem, usize), ElemParam>,
    /// masters whose initial values have been measured
    measured: std::collections::BTreeSet<String>,
}

/// JS truthiness of a number-or-null
fn truthy(v: Option<f64>) -> bool { matches!(v, Some(x) if x != 0.0 && !x.is_nan()) }

impl Params {
    pub fn get(&self, e: &Elem, p: usize) -> Option<&ElemParam> { self.map.get(&(e.clone(), p)) }

    /// `_ElementModel.setInitialParameters`: does `e` carry parameter `p`
    /// (either effective on its level, or holding operators)?
    pub fn has(&self, e: &Elem, p: usize) -> bool {
        PARAMETERS[p].effective_level == e.level() || self.map.contains_key(&(e.clone(), p))
    }

    fn entry(&mut self, e: &Elem, p: usize) -> &mut ElemParam { self.map.entry((e.clone(), p)).or_default() }

    /// copy every parameter of master `from` to master `to` (master duplication)
    pub fn clone_master(&mut self, from: &str, to: &str) {
        let copies: Vec<_> = self.map.iter().filter(|((e, _), _)| e.master() == from)
            .map(|((e, p), v)| ((e.with_master(to), *p), v.clone())).collect();
        self.map.extend(copies);
        if self.measured.contains(from) { self.measured.insert(to.to_string()); }
    }

    pub fn forget_master(&mut self, master: &str) {
        self.map.retain(|(e, _), _| e.master() != master);
        self.measured.remove(master);
    }
}

/// The MOM node of an element (`None` if it does not exist)
pub fn node_of(project: &Project, e: &Elem) -> Option<NodeId> {
    let mom = project.mom();
    let master = project.master_by_name(e.master())?;
    let glyph = |g: &str| mom.node(master).children.iter().copied().find(|c| mom.node(*c).id.as_deref() == Some(g));
    match e {
        Elem::Master(_) => Some(master),
        Elem::Glyph(_, g) => glyph(g),
        Elem::Penstroke(_, g, i) => mom.node(glyph(g)?).children.get(*i).copied(),
        Elem::Point(_, g, i, j) => mom.node(*mom.node(glyph(g)?).children.get(*i)?).children.get(*j).copied(),
    }
}

/// `getEffectedElements(effectiveLevel)`: the descendants of `e` (or `e`)
/// on `level`. Points are penstroke centers only (see the module docs).
pub fn effected_elements(project: &Project, e: &Elem, level: Level) -> Vec<Elem> {
    let mom = project.mom();
    let mut cur = vec![e.clone()];
    while !cur.is_empty() && cur[0].level() != level {
        let mut next = vec![];
        for el in &cur {
            let Some(n) = node_of(project, el) else { continue };
            match el {
                Elem::Master(m) => for g in &mom.node(n).children {
                    if let Some(id) = &mom.node(*g).id { next.push(Elem::Glyph(m.clone(), id.clone())); }
                },
                Elem::Glyph(m, g) => for (i, c) in mom.node(n).children.iter().enumerate() {
                    if mom.kind(*c) == Kind::PenStroke { next.push(Elem::Penstroke(m.clone(), g.clone(), i)); }
                },
                Elem::Penstroke(m, g, i) => for (j, c) in mom.node(n).children.iter().enumerate() {
                    if mom.kind(*c) == Kind::Center { next.push(Elem::Point(m.clone(), g.clone(), *i, j)); }
                },
                Elem::Point(..) => {}
            }
        }
        cur = next;
    }
    cur
}

fn number(project: &Project, n: NodeId, key: &str) -> f64 {
    match project.engine.get(n, key) { Ok(Value::Number(v)) => v, _ => f64::NAN }
}

/// `baseParameter.getInitial(momElement)`
pub fn measure(project: &Project, e: &Elem, p: usize) -> f64 {
    let Some(n) = node_of(project, e) else { return 0.0 };
    match PARAMETERS[p].name {
        "Width" => number(project, n, "width"),
        _ => {
            let mom = project.mom();
            match mom.node(n).children.iter().copied().find(|c| mom.kind(*c) == Kind::Right) {
                Some(right) => number(project, right, "onLength"),
                None => 0.0,
            }
        }
    }
}

impl Params {
    /// measure the initial values of every effective element of `master`
    /// (as if all its glyphs had been displayed before any change)
    pub fn ensure_measured(&mut self, project: &Project, master: &str) {
        if self.measured.contains(master) { return; }
        self.measured.insert(master.to_string());
        let root = Elem::Master(master.to_string());
        for (p, def) in PARAMETERS.iter().enumerate() {
            for e in effected_elements(project, &root, def.effective_level) {
                let ep = self.entry(&e, p);
                if ep.initial.is_none() {
                    let v = measure(project, &e, p);
                    ep.initial = Some(v);
                    ep.effective = Some(v);
                }
            }
        }
    }

    /// `ParameterModel.updateEffectiveValue(writeCPS)` for the effective element `e`
    pub fn update_effective(&mut self, project: &mut Project, e: &Elem, p: usize, write_cps: bool) {
        let (mut min, mut max, mut is) = (None, None, None);
        let mut plus: Vec<Vec<f64>> = vec![];
        let mut multiply: Vec<Vec<f64>> = vec![];
        let initial = {
            let ep = self.entry(e, p);
            if !truthy(ep.initial) {
                let v = measure(project, e, p);
                ep.initial = Some(v);
                ep.effective = Some(v);
            }
            ep.initial
        };
        let mut level = Some(e.clone());
        let mut counter = 0;
        while let Some(el) = level {
            if let Some(ep) = self.map.get(&(el.clone(), p)) {
                for (op, v) in &ep.operators {
                    while plus.len() <= counter { plus.push(vec![]); }
                    while multiply.len() <= counter { multiply.push(vec![]); }
                    let v = *v;
                    let x = v.unwrap_or(f64::NAN);
                    match OPERATORS[*op].name {
                        "min" if !truthy(min) => min = v,
                        "max" if !truthy(max) => max = v,
                        "is" if !truthy(is) => is = v,
                        "add" => plus[counter].push(x),
                        "subtract" => plus[counter].push(-x),
                        "multiply" => multiply[counter].push(x),
                        "divide" => multiply[counter].push(1.0 / x),
                        _ => {}
                    }
                }
            }
            counter += 1;
            level = el.parent();
        }
        let mut value = if truthy(is) { is.unwrap() } else { initial.unwrap_or(0.0) };
        for set in multiply.iter().rev() { for m in set.iter().rev() { value *= m; } }
        for set in plus.iter().rev() { for a in set.iter().rev() { value += a; } }
        if truthy(max) && value > max.unwrap() { value = max.unwrap(); }
        else if truthy(min) && value < min.unwrap() { value = min.unwrap(); }
        self.entry(e, p).effective = Some(value);
        if write_cps {
            // _setCorrectedCPSfactor
            let parents = self.parents_factor(e, p);
            let correction = value / parents / initial.unwrap_or(0.0);
            write_factor(project, e, p, correction);
        }
    }

    /// `findParentsFactor`: product of the local factors from `e` up
    pub fn parents_factor(&self, e: &Elem, p: usize) -> f64 {
        let mut f = 1.0;
        let mut level = Some(e.clone());
        while let Some(el) = level {
            if let Some(v) = self.map.get(&(el.clone(), p)).and_then(|ep| ep.cps_factor()) { f *= v; }
            level = el.parent();
        }
        f
    }

    /// `ParameterModel.changedOperator`
    pub fn changed_operator(&mut self, project: &mut Project, e: &Elem, p: usize, op: usize) {
        let level = PARAMETERS[p].effective_level;
        let effected = effected_elements(project, e, level);
        if OPERATORS[op].effective_local {
            let factor = self.get(e, p).and_then(|ep| ep.cps_factor());
            // writeValueInCPSfile(false) would write `WidthF: false`; there
            // is always a local operator here, so a factor exists
            write_factor(project, e, p, factor.unwrap_or(1.0));
            for el in effected { self.update_effective(project, &el, p, false); }
        } else {
            for el in effected { self.update_effective(project, &el, p, true); }
        }
    }

    /// set (adding if needed) operator `op` of parameter `p` on `e` and apply it
    pub fn set_operator(&mut self, project: &mut Project, e: &Elem, p: usize, op: usize, value: Option<f64>) {
        self.ensure_measured(project, e.master());
        let ep = self.entry(e, p);
        match ep.operators.iter_mut().find(|(o, _)| *o == op) {
            Some(slot) => slot.1 = value,
            None => ep.operators.push((op, value)),
        }
        self.changed_operator(project, e, p, op);
    }

    /// `addOperator` with the operator's standard value (no CPS effect)
    pub fn add_operator(&mut self, project: &Project, e: &Elem, p: usize, op: usize) {
        self.ensure_measured(project, e.master());
        let ep = self.entry(e, p);
        if !ep.operators.iter().any(|(o, _)| *o == op) { ep.operators.push((op, OPERATORS[op].standard)); }
    }

    /// `removeOperator`: reset it to its standard value, apply, remove
    pub fn remove_operator(&mut self, project: &mut Project, e: &Elem, p: usize, op: usize) {
        if self.get(e, p).and_then(|ep| ep.value(op)).is_none() { return; }
        self.set_operator(project, e, p, op, OPERATORS[op].standard);
        if let Some(ep) = self.map.get_mut(&(e.clone(), p)) { ep.operators.retain(|(o, _)| *o != op); }
    }

    /// the effective value of `e` (measuring it if needed)
    pub fn effective(&mut self, project: &Project, e: &Elem, p: usize) -> f64 {
        let ep = self.entry(e, p);
        if let Some(v) = ep.effective { return v; }
        let v = measure(project, e, p);
        ep.initial = Some(v);
        ep.effective = Some(v);
        v
    }
}

/// `writeValueInCPSfile`: `cpsTools.setProperty(element.properties, cpsKey, factor)`
pub fn write_factor(project: &mut Project, e: &Elem, p: usize, factor: f64) {
    let Some(n) = node_of(project, e) else { return };
    if !factor.is_finite() { return; }
    let _ = project.set_property(n, PARAMETERS[p].cps_key, &mp_math::js_num(factor));
}
