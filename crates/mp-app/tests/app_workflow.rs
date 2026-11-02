//! The UI workflow through `mp_app::App`, against the JS golden of
//! tests/golden-workflow/merriweather-light-bold
//! (tools/js-reference/workflow-golden.js): import two zipped UFOs, drop
//! both UI masters on the design space (one instance, 50/50), save.
//!
//! The saved project must equal the JS one and the masters' UI exports
//! (UFO 2 unrounded, zipped; OTF) must be byte-identical to the golden
//! files. The instance export fails like the JS one did.
use mp_app::{zipio, App};
use mp_io::{join, DiskIo, Io, MemIo};
use mp_mom::js::parse_yaml;
use std::path::{Path, PathBuf};

fn repo() -> PathBuf { PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..") }

fn copy(src: &dyn Io, from: &str, dst: &dyn Io, to: &str) {
    for e in src.read_dir(from).unwrap() {
        match e.strip_suffix('/') {
            Some(d) => copy(src, &join(from, d), dst, &join(to, d)),
            None => dst.write(&join(to, &e), &src.read(&join(from, &e)).unwrap()).unwrap(),
        }
    }
}

/// `<name>.ufo/…` zipped, from a UFO on disk
fn ufo_zip(path: &str, name: &str) -> Vec<u8> {
    let mem = MemIo::new();
    copy(&DiskIo::new(repo()), path, &mem, &format!("{name}.ufo"));
    zipio::pack_dir(&mem, &format!("{name}.ufo")).unwrap()
}

fn walk(base: &Path, p: &Path, out: &mut Vec<String>) {
    for e in std::fs::read_dir(p).unwrap() {
        let p = e.unwrap().path();
        if p.is_dir() { walk(base, &p, out) } else { out.push(p.strip_prefix(base).unwrap().to_string_lossy().to_string()) }
    }
}

pub fn workflow_app() -> App {
    let mut app = App::empty().unwrap();
    for (name, path) in [("light", "data/fonts/subsets/Merriweather-Light-Subset-nop.ufo"),
                         ("bold", "data/fonts/subsets/Merriweather-Bold-Subset-nop.ufo")] {
        let r = app.import_ufo_zip(&ufo_zip(path, name)).unwrap();
        assert_eq!(r, vec![Ok(format!("master-{name}"))]);
    }
    app.add_master_to_design_space("master-light").unwrap();
    // these subsets are not compatible (bold has an extra glyph `e`), the
    // UI refuses; the JS golden skipped that test as well
    assert!(app.add_master_to_design_space("master-bold").unwrap_err().contains("excess glyphs in Master"));
    app.add_master_to_design_space_checked("master-bold", false).unwrap();
    app
}

#[test]
fn merriweather_light_bold_through_the_app() {
    let golden = repo().join("tests/golden-workflow/merriweather-light-bold");
    let mut app = workflow_app();
    assert_eq!(app.instances.len(), 1);
    let inst = &app.instances[0];
    assert_eq!(inst.name, "instance-0");
    assert_eq!(inst.axes.iter().map(|a| (a.axis_value, a.metapolation_value)).collect::<Vec<_>>(), vec![(50.0, 0.5), (50.0, 0.5)]);
    app.project.save().unwrap();

    let mut failures = vec![];
    let mut files = vec![];
    walk(&golden, &golden, &mut files);
    files.sort();
    let mut checked = 0;
    for f in files.iter().filter(|f| f.starts_with("project/")) {
        let want = std::fs::read_to_string(golden.join(f)).unwrap();
        let have = match app.io.read_string(f) { Ok(h) => h, Err(e) => { failures.push(format!("{f}: {e}")); continue } };
        checked += 1;
        let same = if f.ends_with(".yaml") { parse_yaml(&want).unwrap() == parse_yaml(&have).unwrap() } else { want == have };
        if !same { failures.push(format!("{f} differs")); }
    }
    println!("project: {checked} files compared");

    let mut same = 0;
    for m in ["base-light", "master-light", "base-bold", "master-bold"] {
        let zip = app.export_ufo_zip(m, m).unwrap();
        let out = MemIo::new();
        zipio::unpack(&zip, &out, "").unwrap();
        let prefix = format!("{m}.ufo2/");
        for f in files.iter().filter(|f| f.starts_with(&prefix)) {
            let want = std::fs::read(golden.join(f)).unwrap();
            let have = out.read(&format!("{m}.ufo/{}", &f[prefix.len()..]));
            if have.as_deref() == Ok(&want[..]) { same += 1 } else { failures.push(format!("{m} zipped UFO 2: {f} differs")) }
        }
        let n_out = out.files().len();
        let n_want = files.iter().filter(|f| f.starts_with(&prefix)).count();
        if n_out != n_want { failures.push(format!("{m}: {n_out} files in the zip, golden has {n_want}")) }
        let otf = app.export_otf(m).unwrap();
        if otf == std::fs::read(golden.join(format!("{m}.otf"))).unwrap() { same += 1 } else { failures.push(format!("{m}.otf differs")) }
    }
    println!("exports: {same} files identical");
    // the instance fails as in the JS (`one` has contours, which
    // metapolation.tpl does not cover; notes/rust-port/upstream-bugs.md)
    assert!(golden.join("instance-0.otf.error").exists());
    let err = app.export_otf("instance-0").unwrap_err();
    if !(err.contains("glyph#one") && err.contains("inLength")) { failures.push(format!("instance-0 OTF error: {err}")) }
    let (_, _, errors) = app.export_bundle("20260101-000000").unwrap();
    assert_eq!(errors.len(), 2, "{errors:?}");

    assert!(failures.is_empty(), "{} failures:\n{}", failures.len(), failures.join("\n"));
    assert!(checked > 10 && same > 100);
}

#[test]
fn width_parameter_scales_glyphs() {
    use mp_app::params::{op_index, param_index, Elem, Level};
    let mut app = workflow_app();
    app.select_master("master-light", false);
    let width = param_index("Width").unwrap();
    let multiply = op_index("multiply").unwrap();
    let add = op_index("add").unwrap();
    let a = Elem::Glyph("master-light".into(), "n".into());
    let before = app.params.effective(&app.project, &a, width);
    let w0 = app.glyph_view("master-light", "n").unwrap().width;
    assert_eq!(before, w0);

    app.add_operator(Level::Master, width, multiply);
    app.set_operator_value(Level::Master, width, multiply, Some(1.5));
    let w1 = app.glyph_view("master-light", "n").unwrap().width;
    assert!((w1 - w0 * 1.5).abs() < 1e-9, "{w0} → {w1}");
    assert_eq!(app.params.effective(&app.project, &a, width), w0 * 1.5);

    // a glyph-level add on top: effective = initial * 1.5 + 10
    app.select_glyph("master-light", "n", false);
    app.set_operator_value(Level::Glyph, width, add, Some(10.0));
    let w2 = app.glyph_view("master-light", "n").unwrap().width;
    assert!((w2 - (w0 * 1.5 + 10.0)).abs() < 1e-9, "{w2}");
    let sel = app.selection_parameters(Level::Glyph);
    assert_eq!(sel[0].operators, vec![(add, Some(10.0), Some(10.0))]);
    // the other glyphs only see the master factor
    let b0 = app.params.get(&Elem::Glyph("master-light".into(), "o".into()), width).unwrap().initial.unwrap();
    assert!((app.glyph_view("master-light", "o").unwrap().width - b0 * 1.5).abs() < 1e-9);

    // removing both restores the original widths
    app.remove_operator(Level::Glyph, width, add);
    app.select_master("master-light", false);
    app.remove_operator(Level::Master, width, multiply);
    assert!((app.glyph_view("master-light", "n").unwrap().width - w0).abs() < 1e-9);
}

#[test]
fn design_space_sliders() {
    let mut app = workflow_app();
    let id = app.instances[0].id;
    // slack is axis 0 (light); dragging bold to 80 drags light to 20
    app.set_axis_value(id, 1, 80.0).unwrap();
    let axes: Vec<_> = app.instances[0].axes.iter().map(|a| (a.axis_value, a.metapolation_value)).collect();
    assert_eq!(axes, vec![(20.0, 0.2), (80.0, 0.8)]);
    let props = app.project.mom().node(app.project.master_by_name("instance-0").unwrap()).properties.to_string();
    assert!(props.contains("proportion0: 0.2;") && props.contains("proportion1: 0.8;"), "{props}");
    // a second instance, then removing it
    let second = app.add_instance().unwrap().unwrap();
    assert_eq!(app.current_instance, Some(second));
    app.remove_instance(second).unwrap();
    assert_eq!(app.instances.len(), 1);
    // removing the last one removes the design space
    app.remove_instance(id).unwrap();
    assert!(app.design_spaces.is_empty() && app.instances.is_empty());
    assert!(app.project.master_by_name("instance-0").is_none());
}

/// the classic session: duplicate the default master, make the copy
/// bold with the Weight parameter, metapolate the two
#[test]
fn duplicate_bolden_metapolate() {
    use mp_app::params::{op_index, param_index, Level};
    let mut app = App::with_default_project().unwrap();
    let copies = app.duplicate_selected_masters().unwrap();
    assert_eq!(copies, vec!["master-0-1"]);
    assert_eq!(app.master("master-0-1").unwrap().display_name, "master-regular copy");
    let (weight, multiply) = (param_index("Weight").unwrap(), op_index("multiply").unwrap());
    app.set_operator_value(Level::Master, weight, multiply, Some(2.0));
    let (regular, bold) = (app.glyph_view("master-regular", "o").unwrap(), app.glyph_view("master-0-1", "o").unwrap());
    assert!(regular.error.is_none() && bold.error.is_none());
    assert_ne!(regular.path, bold.path);

    app.add_master_to_design_space("master-regular").unwrap();
    app.add_master_to_design_space("master-0-1").unwrap();
    let id = app.current_instance.unwrap();
    app.set_axis_value(id, 1, 75.0).unwrap();
    let inst = app.glyph_view("instance-0", "o").unwrap();
    assert!(inst.error.is_none(), "{:?}", inst.error);
    assert!(inst.path != regular.path && inst.path != bold.path);
    let (_, zip, errors) = app.export_bundle("20260101-000000").unwrap();
    assert!(errors.is_empty(), "{errors:?}");
    let out = MemIo::new();
    zipio::unpack(&zip, &out, "").unwrap();
    let files = out.files();
    assert!(files.contains(&"metapolator-export-20260101-000000/Instance 0.otf".to_string()), "{files:?}");
    assert!(files.contains(&"metapolator-export-20260101-000000/Instance 0.ufo.zip".to_string()), "{files:?}");
}

#[test]
fn default_project_loads_and_renders() {
    let app = App::with_default_project().unwrap();
    assert_eq!(app.masters.iter().map(|m| m.name.as_str()).collect::<Vec<_>>(), vec!["master-regular"]);
    let v = app.glyph_view("master-regular", "n").unwrap();
    assert!(v.error.is_none() && v.path.starts_with('M') && v.width > 0.0, "{v:?}");
    // unicode fallback for characters that are not glyph names
    assert!(app.find_glyph("master-regular", "1").is_some());
}

#[test]
fn project_zip_round_trip() {
    let mut app = workflow_app();
    let zip = app.project_zip("myproject").unwrap();
    let back = App::from_project_zip(&zip).unwrap();
    assert_eq!(back.masters.iter().map(|m| m.name.as_str()).collect::<Vec<_>>(), vec!["master-light", "master-bold"]);
    assert!(back.project.master_by_name("instance-0").is_some());
}

#[test]
fn operator_ranges_scale_proportionally() {
    use mp_app::params::{op_index, param_index, Elem, Level};
    let mut app = App::with_default_project().unwrap();
    let (w, add) = (param_index("Width").unwrap(), op_index("add").unwrap());
    for (g, v) in [("a", 10.0), ("b", 20.0), ("c", 40.0)] {
        app.select_glyph("master-regular", g, false);
        app.set_operator_value(Level::Glyph, w, add, Some(v));
    }
    app.selected_glyphs.clear();
    for g in ["a", "b", "c"] { app.select_glyph("master-regular", g, true); }
    let sel = app.selection_parameters(Level::Glyph);
    assert_eq!(sel[0].operators, vec![(add, Some(10.0), Some(40.0))]);
    // raise the high bound: 10..40 -> 10..70, b keeps its third
    app.set_operator_range(Level::Glyph, w, add, (10.0, 40.0), (10.0, 70.0)).unwrap();
    let v = |app: &App, g: &str| app.params.get(&Elem::Glyph("master-regular".into(), g.into()), w).unwrap().value(add).unwrap().unwrap();
    assert_eq!((v(&app, "a"), v(&app, "b"), v(&app, "c")), (10.0, 30.0, 70.0));
    assert!(app.set_operator_range(Level::Glyph, w, add, (10.0, 70.0), (80.0, 70.0)).is_err());
    // the widths follow: initial + add
    let a = Elem::Glyph("master-regular".into(), "c".into());
    let ep = app.params.get(&a, w).unwrap().clone();
    assert_eq!(ep.effective, Some(ep.initial.unwrap() + 70.0));
}
