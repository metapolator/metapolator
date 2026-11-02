//! `metapolator`: the command line interface, replacing `bin/metapolator-*`.
//!
//! Masters are addressed as `[project/]master`; without a `/` the project is
//! the current directory (like the old `parseArgs.projectMaster`).

use mp_cps::{NodeId, Value};
use mp_io::{DiskIo, Io};
use mp_mom::Project;
use std::process::ExitCode;
use std::rc::Rc;

const USAGE: &str = "\
Usage: metapolator <command> [arguments]

Commands:
  init <project>                         create a new, empty project
  import <ufo> <[project/]master> [-g glyph,glyph,...]
                                         import a UFO as a (base) master
  import-ui <ufo> <project> [--name n]   import like the UI: base-<n> plus the
                                         editable master-<n>
  export <[project/]master> <target> [<master> <target> ...] [-p n] [--ufo2]
                                         export masters; the target's extension
                                         picks the format: .otf or a UFO dir.
                                         -p: decimal places (default 3, -1: no
                                         rounding); --ufo2: UFO format 2
  interpolate <m1,m2,...> <p1,p2,...> <[project/]new-master>
                                         a new instance metapolating masters
  delete <[project/]master> [--force] [--base-chain]
  list [project]                         list the masters of a project
  get <[project/]master> <selector> <property> [<property> ...]
                                         print computed CPS values
  query <[project/]master> <selector>    list the nodes a selector matches
  cps <file.cps>                         parse a CPS file and print it as
                                         parsed (@imports are not followed)
  serve [project] [-p port] [--addr host:port] [--ui dir]
                                         serve the web UI, opening <project>
                                         (default: the demo project); --ui:
                                         the built UI (default target/ui, see
                                         tools/build-ui.sh); default address
                                         127.0.0.1:8080
  help                                   this text
";

mod serve;

/// replaces bin/metapolator-dev-playground-cps (already broken upstream)
fn cmd_cps(args: Vec<String>) -> R {
    struct Empty;
    impl mp_cps::document::ImportResolver for Empty {
        fn get_rule(&mut self, _: &str) -> mp_cps::Result<Rc<mp_cps::document::Collection>> { Ok(Rc::new(Default::default())) }
    }
    let file = args.first().ok_or("usage: metapolator cps <file.cps>")?;
    let text = std::fs::read_to_string(file).map_err(|e| format!("{file}: {e}"))?;
    let c = mp_cps::document::parse_cps(&text, &mut Empty).map_err(|e| format!("{file}: {e}"))?;
    println!("{c}");
    Ok(())
}

fn cmd_serve(mut args: Vec<String>) -> R {
    let port = take_option(&mut args, &["-p", "--port"])?;
    let addr = take_option(&mut args, &["--addr"])?
        .unwrap_or_else(|| format!("127.0.0.1:{}", port.as_deref().unwrap_or("8080")));
    let ui = take_option(&mut args, &["--ui"])?.unwrap_or_else(|| "target/ui".into());
    let project = args.first().map(std::path::PathBuf::from);
    serve::serve(std::path::Path::new(&ui), project.as_deref(), &addr)
}

fn split_master(arg: &str) -> (String, String) {
    match arg.rfind('/') {
        Some(p) => (arg[..p].to_string(), arg[p + 1..].to_string()),
        None => (".".to_string(), arg.to_string()),
    }
}

fn disk() -> Rc<dyn Io> {
    Rc::new(DiskIo::new(std::env::current_dir().unwrap_or_else(|_| ".".into())))
}

type R = Result<(), String>;

fn open(dir: &str) -> Result<Project, String> {
    Project::load(disk(), dir).map_err(|e| format!("can't load project \"{dir}\": {}", e.message))
}

fn take_flag(args: &mut Vec<String>, names: &[&str]) -> bool {
    match args.iter().position(|a| names.contains(&a.as_str())) {
        Some(i) => { args.remove(i); true }
        None => false,
    }
}

fn take_option(args: &mut Vec<String>, names: &[&str]) -> Result<Option<String>, String> {
    match args.iter().position(|a| names.contains(&a.as_str())) {
        Some(i) => {
            if i + 1 >= args.len() { return Err(format!("option {} needs a value", args[i])); }
            let v = args.remove(i + 1);
            args.remove(i);
            Ok(Some(v))
        }
        None => Ok(None),
    }
}

fn cmd_init(args: Vec<String>) -> R {
    let [dir] = args.as_slice() else { return Err("usage: metapolator init <project>".into()) };
    Project::init(disk(), dir).map_err(|e| e.message)?;
    println!("initialized project {dir}");
    Ok(())
}

fn cmd_import(mut args: Vec<String>) -> R {
    let glyphs = take_option(&mut args, &["-g", "--glyphs"])?
        .map(|g| g.split(',').map(String::from).collect::<Vec<_>>());
    let [ufo, target] = args.as_slice() else { return Err("usage: metapolator import <ufo> <[project/]master>".into()) };
    let (dir, master) = split_master(target);
    let mut p = open(&dir)?;
    let io = disk();
    let m = p.import_ufo(&master, &*io, ufo, glyphs.as_deref()).map_err(|e| e.message)?;
    let id = p.mom().node(m).id.clone().unwrap_or_default();
    p.save().map_err(|e| e.message)?;
    println!("imported {ufo} as master {id} ({} glyphs)", p.mom().node(m).children.len());
    Ok(())
}

fn cmd_import_ui(mut args: Vec<String>) -> R {
    let name = take_option(&mut args, &["--name"])?;
    let [ufo, dir] = args.as_slice() else { return Err("usage: metapolator import-ui <ufo> <project> [--name n]".into()) };
    let name = name.unwrap_or_else(|| {
        let base = ufo.trim_end_matches('/').rsplit('/').next().unwrap_or(ufo);
        base.strip_suffix(".ufo").unwrap_or(base).to_string()
    });
    let mut p = open(dir)?;
    let io = disk();
    let (b, u) = p.import_ui_master(&name, &*io, ufo).map_err(|e| e.message)?;
    p.save().map_err(|e| e.message)?;
    println!("imported {ufo} as {} and {}", p.mom().node(b).id.clone().unwrap_or_default(),
             p.mom().node(u).id.clone().unwrap_or_default());
    Ok(())
}

fn cmd_export(mut args: Vec<String>) -> R {
    let precision = match take_option(&mut args, &["-p", "--precision"])? {
        Some(p) => { let v: i64 = p.parse().map_err(|_| format!("bad precision {p}"))?; if v < 0 { None } else { Some(v) } }
        None => Some(3),
    };
    let ufo2 = take_flag(&mut args, &["--ufo2"]);
    if args.is_empty() || args.len() % 2 != 0 {
        return Err("usage: metapolator export <[project/]master> <target> [<master> <target> ...]".into());
    }
    let (dir, _) = split_master(&args[0]);
    let mut p = open(&dir)?;
    // open everything: instances query their masters by id
    p.open_all_masters().map_err(|e| e.message)?;
    let io = disk();
    for pair in args.chunks(2) {
        let (_, master) = split_master(&pair[0]);
        let target = &pair[1];
        let m = p.master_by_name(&master).ok_or_else(|| format!("no master \"{master}\""))?;
        if target.ends_with(".otf") {
            let bytes = mp_mom::export_otf::export_otf(&p.engine, m, &p.project_fontinfo())?;
            io.write(target, &bytes).map_err(|e| e.to_string())?;
        } else {
            if io.exists(target) { return Err(format!("\"{target}\" exists, not overwriting")); }
            mp_mom::export::export_ufo_format(&p.engine, m, &*io, target, precision, if ufo2 { 2 } else { 3 })?;
        }
        eprintln!("exported {master} to {target}");
    }
    Ok(())
}

fn cmd_interpolate(args: Vec<String>) -> R {
    let [masters, proportions, target] = args.as_slice() else {
        return Err("usage: metapolator interpolate <m1,m2,...> <p1,p2,...> <[project/]new-master>".into())
    };
    let masters: Vec<String> = masters.split(',').map(String::from).collect();
    let props: Vec<f64> = proportions.split(',').map(|p| p.parse::<f64>().map_err(|_| format!("bad proportion {p}")))
        .collect::<Result<_, _>>()?;
    if masters.len() != props.len() { return Err("number of proportions must match number of masters".into()); }
    let (dir, name) = split_master(target);
    let mut p = open(&dir)?;
    let axes: Vec<(String, f64)> = masters.into_iter().zip(props).collect();
    let m = p.create_instance(&name, &axes).map_err(|e| e.message)?;
    p.save().map_err(|e| e.message)?;
    println!("created instance {}", p.mom().node(m).id.clone().unwrap_or_default());
    Ok(())
}

fn cmd_delete(mut args: Vec<String>) -> R {
    let force = take_flag(&mut args, &["--force"]);
    let chain = take_flag(&mut args, &["--base-chain"]);
    let [target] = args.as_slice() else { return Err("usage: metapolator delete <[project/]master>".into()) };
    let (dir, name) = split_master(target);
    let mut p = open(&dir)?;
    p.open_all_masters().map_err(|e| e.message)?;
    if !p.delete_master(&name, chain, force).map_err(|e| e.message)? {
        return Err(format!("\"{name}\" has dependants; use --force"));
    }
    p.save().map_err(|e| e.message)?;
    println!("deleted {name}");
    Ok(())
}

fn cmd_list(args: Vec<String>) -> R {
    let dir = args.first().cloned().unwrap_or_else(|| ".".into());
    let mut p = open(&dir)?;
    let mut names = p.persisted_masters.clone();
    names.sort();
    p.open_all_masters().map_err(|e| e.message)?;
    for n in names {
        let m = p.master_by_name(&n);
        let base = m.and_then(|m| p.mom().node(m).base_node).and_then(|b| p.mom().node(b).id.clone());
        let glyphs = m.map(|m| p.mom().node(m).children.len()).unwrap_or(0);
        println!("{n}\t{glyphs} glyphs{}", base.map(|b| format!("\tbase: {b}")).unwrap_or_default());
    }
    Ok(())
}

fn show(v: &Value, p: &Project) -> String {
    match v {
        Value::Node(n) => format!("<{} {}>", p.mom().kind(*n).type_name(), mp_cps::Model::particulars(p.mom(), *n)),
        Value::Array(a) => format!("[{}]", a.iter().map(|x| show(x, p)).collect::<Vec<_>>().join(", ")),
        other => other.to_string(),
    }
}

fn resolve(p: &mut Project, target: &str, selector: &str) -> Result<Vec<NodeId>, String> {
    let (_, name) = split_master(target);
    p.open_all_masters().map_err(|e| e.message)?;
    let m = p.master_by_name(&name).ok_or_else(|| format!("no master \"{name}\""))?;
    p.engine.query_all_str(m, selector).map_err(|e| e.message)
}

fn cmd_get(args: Vec<String>) -> R {
    if args.len() < 3 { return Err("usage: metapolator get <[project/]master> <selector> <property>...".into()); }
    let (dir, _) = split_master(&args[0]);
    let mut p = open(&dir)?;
    for n in resolve(&mut p, &args[0], &args[1])? {
        let part = mp_cps::Model::particulars(p.mom(), n);
        for key in &args[2..] {
            match p.engine.get(n, key) {
                Ok(v) => println!("{part}\t{key}: {}", show(&v, &p)),
                Err(e) => println!("{part}\t{key}: ERROR {}", e.message),
            }
        }
    }
    Ok(())
}

fn cmd_query(args: Vec<String>) -> R {
    let [target, selector] = args.as_slice() else { return Err("usage: metapolator query <[project/]master> <selector>".into()) };
    let (dir, _) = split_master(target);
    let mut p = open(&dir)?;
    for n in resolve(&mut p, target, selector)? {
        println!("{}", mp_cps::Model::particulars(p.mom(), n));
    }
    Ok(())
}

fn main() -> ExitCode {
    let mut args: Vec<String> = std::env::args().skip(1).collect();
    if args.is_empty() {
        eprint!("{USAGE}");
        return ExitCode::from(2);
    }
    let cmd = args.remove(0);
    let r = match cmd.as_str() {
        "init" => cmd_init(args),
        "import" => cmd_import(args),
        "import-ui" => cmd_import_ui(args),
        "export" => cmd_export(args),
        "interpolate" => cmd_interpolate(args),
        "delete" => cmd_delete(args),
        "list" => cmd_list(args),
        "get" => cmd_get(args),
        "query" => cmd_query(args),
        "serve" => cmd_serve(args),
        "cps" => cmd_cps(args),
        "help" | "--help" | "-h" => { print!("{USAGE}"); Ok(()) }
        other => Err(format!("unknown command \"{other}\"\n\n{USAGE}")),
    };
    match r {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => { eprintln!("metapolator: {e}"); ExitCode::FAILURE }
    }
}
