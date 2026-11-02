//! The panels of the UI (ports of `app/lib/ui/metapolator/*-panel`).

use crate::{ctx, util};
use leptos::ev::{KeyboardEvent, MouseEvent};
use leptos::prelude::*;
use mp_app::params::{self, Level, OPERATORS, PARAMETERS};
use mp_app::specimen::{self, Cell, FontBy, SAMPLES};
use mp_app::App;

// ---------------------------------------------------------------- menubar

#[component]
pub fn Menubar() -> impl IntoView {
    let c = ctx();
    let new_project = move |_| match App::empty() {
        Ok(app) => { c.replace(app); c.info("New, empty project. Import UFOs (zipped) in the masters panel.") }
        Err(e) => c.error(e),
    };
    let default_project = move |_| match App::with_default_project() {
        Ok(app) => { c.replace(app); c.info("Loaded the demo project.") }
        Err(e) => c.error(e),
    };
    let open_project = move |_| util::pick_file(".zip,application/zip", move |name, data| {
        match App::from_project_zip(&data) {
            Ok(app) => { c.replace(app); c.info(format!("Opened {name}.")) }
            Err(e) => c.error(format!("{name}: {e}")),
        }
    });
    let save_project = move |_| {
        let name = format!("metapolator-project-{}", util::timestamp());
        match c.update(|a| a.project_zip(&name)) {
            Ok(data) => { util::download(&format!("{name}.zip"), &data, "application/zip"); c.info(format!("Saved {name}.zip")) }
            Err(e) => c.error(e),
        }
    };
    view! {
        <header class="menubar">
            <img class="logo" src="assets/img/metapolator-logo.svg" alt="Metapolator"/>
            <nav>
                <button on:click=new_project title="Start an empty project">"New"</button>
                <button on:click=default_project title="The demo project of Metapolator v0.4.0">"Demo"</button>
                <button on:click=open_project title="Open a project saved as ZIP">"Open…"</button>
                <button on:click=save_project title="Download the project as ZIP">"Save"</button>
            </nav>
            <div class="status" class:error=move || c.status.get().map(|s| s.0).unwrap_or(false)
                 on:click=move |_| c.status.set(None)>
                {move || c.status.get().map(|s| s.1).unwrap_or_default()}
            </div>
            <a class="about" href="https://github.com/metapolator/metapolator" target="_blank">"About"</a>
        </header>
    }
}

// ------------------------------------------------------------ parameters

/// one value field of an operator; `low != high` is a range over the
/// selection, typing replaces it for all elements
#[component]
fn OperatorField(level: Level, param: usize, op: usize, low: Option<f64>, high: Option<f64>) -> impl IntoView {
    let c = ctx();
    let def = &PARAMETERS[param];
    let fmt = move |v: Option<f64>| v.map(|x| mp_app::svg::fmt(params::round_decimals(x, def.decimals))).unwrap_or_default();
    let shown = if low == high { fmt(low) } else { format!("{} – {}", fmt(low), fmt(high)) };
    let apply = move |v: f64| {
        let v = params::round_decimals(v, def.decimals);
        c.update(|a| a.set_operator_value(level, param, op, Some(v)));
    };
    let on_key = move |ev: KeyboardEvent| {
        let input: web_sys::HtmlInputElement = event_target(&ev);
        match ev.key().as_str() {
            "Enter" => match params::eval_math(&input.value()) {
                Ok(v) => { input.class_list().remove_1("error").ok(); apply(v) }
                Err(e) => { input.class_list().add_1("error").ok(); c.error(e) }
            },
            k @ ("ArrowUp" | "ArrowDown") => {
                ev.prevent_default();
                let base = params::eval_math(&input.value()).ok().or(low).unwrap_or(0.0);
                let v = params::step_value(base, def.step, k == "ArrowUp", ev.shift_key(), ev.ctrl_key() || ev.alt_key());
                apply(v);
            }
            _ => {}
        }
    };
    let on_blur = move |ev: leptos::ev::FocusEvent| {
        let input: web_sys::HtmlInputElement = event_target(&ev);
        if let Ok(v) = params::eval_math(&input.value()) {
            if Some(params::round_decimals(v, def.decimals)) != low.map(|l| params::round_decimals(l, def.decimals)) || low != high { apply(v) }
        }
    };
    let unit = if OPERATORS[op].uses_unit { def.unit } else { "" };
    view! {
        <div class="operator">
            <span class="sign">{OPERATORS[op].sign}</span>
            <input type="text" prop:value=shown on:keydown=on_key on:blur=on_blur title="A number or a formula; arrow keys step (shift ×10, ctrl/alt ×0.1)"/>
            <span class="unit">{unit}</span>
            <button class="remove" title="Remove" on:click=move |_| c.update(|a| a.remove_operator(level, param, op))>"×"</button>
        </div>
    }
}

#[component]
fn SelectionLevel(level: Level) -> impl IntoView {
    let c = ctx();
    let adding = RwSignal::new(false);
    let chosen_param = RwSignal::new(None::<usize>);
    let chosen_op = RwSignal::new(None::<usize>);
    let try_add = move || {
        if let (Some(p), Some(o)) = (chosen_param.get_untracked(), chosen_op.get_untracked()) {
            c.update(|a| a.add_operator(level, p, o));
            adding.set(false);
            chosen_param.set(None);
            chosen_op.set(None);
        }
    };
    let count = move || c.with(|a| a.selection(level).len());
    view! {
        <Show when=move || { count() != 0 }>
            <div class="selection-level">
                <div class="head">
                    <span class="title">{level.name()}" "<small>{move || format!("({})", count())}</small></span>
                    <button class="add" title="Add a parameter operator" on:click=move |_| adding.update(|v| *v = !*v)>"+"</button>
                </div>
                <Show when=move || adding.get()>
                    <div class="chooser">
                        <div class="row">
                            {PARAMETERS.iter().enumerate().map(|(i, p)| view! {
                                <button class:selected=move || chosen_param.get() == Some(i)
                                    on:click=move |_| { chosen_param.set(Some(i)); try_add() }>{p.name}</button>
                            }).collect_view()}
                        </div>
                        <div class="row">
                            {OPERATORS.iter().enumerate().map(|(i, o)| view! {
                                <button class:selected=move || chosen_op.get() == Some(i) title=o.name
                                    on:click=move |_| { chosen_op.set(Some(i)); try_add() }>{o.sign}</button>
                            }).collect_view()}
                        </div>
                        <button on:click=move |_| adding.set(false)>"Cancel"</button>
                    </div>
                </Show>
                {move || {
                    let sel = c.with(|_| ()); let _ = sel;
                    let params = c.app.try_update_value(|a| a.selection_parameters(level)).unwrap_or_default();
                    params.into_iter().map(|sp| {
                        let def = &PARAMETERS[sp.param];
                        let eff = sp.effective.map(|(l, h)| {
                            let f = |x: f64| mp_app::svg::fmt(params::round_decimals(x, def.decimals));
                            if l == h { f(l) } else { format!("{} – {}", f(l), f(h)) }
                        });
                        view! {
                            <div class="parameter">
                                <div class="name">{def.name}
                                    {eff.map(|e| view! { <span class="effective" title="effective value">{e}" "{def.unit}</span> })}
                                </div>
                                {sp.operators.into_iter().map(|(o, lo, hi)| view! {
                                    <OperatorField level=level param=sp.param op=o low=lo high=hi/>
                                }).collect_view()}
                            </div>
                        }
                    }).collect_view()
                }}
            </div>
        </Show>
    }
}

#[component]
pub fn ParameterPanel() -> impl IntoView {
    let c = ctx();
    view! {
        <h2>"Parameters"</h2>
        <Show when=move || c.with(|a| a.selection(Level::Master).is_empty())>
            <p class="hint">"Select masters in the masters panel, and glyphs by clicking them in the specimen."</p>
        </Show>
        <SelectionLevel level=Level::Master/>
        <SelectionLevel level=Level::Glyph/>
    }
}

// --------------------------------------------------------------- specimen

/// the specimen panel: `instances` shows the current (and displayed)
/// instances, otherwise the selected (and displayed) masters
#[component]
pub fn SpecimenPanel(instances: bool) -> impl IntoView {
    let c = ctx();
    let sample = RwSignal::new(0usize);
    let own_text = RwSignal::new(SAMPLES[0].2.to_string());
    let filter = RwSignal::new(String::new());
    let strict = RwSignal::new(0u8);
    let font_by = RwSignal::new(FontBy::Specimen);
    let size = RwSignal::new(if instances { 64.0 } else { 96.0 });
    let line_height = RwSignal::new(1.0f64);
    // the master specimen also offers "Glyph Range": every glyph of the
    // master (upstream this sample had no text and broke `glyphsIn`)
    let glyph_range = SAMPLES.len();
    let text = move || if sample.get() == 0 { own_text.get() } else if sample.get() == glyph_range { String::new() } else { SAMPLES[sample.get()].2.to_string() };
    // the rubberband: (start, current) in client coordinates
    let band = RwSignal::new(None::<((f64, f64), (f64, f64))>);
    let field = NodeRef::<leptos::html::Div>::new();
    // (name, fill colour, selectable)
    let shown = move || c.with(|a| -> Vec<(String, String, bool)> {
        if instances {
            a.instances.iter().filter(|i| Some(i.id) == a.current_instance || i.display)
                .map(|i| (i.name.clone(), i.color.to_string(), false)).collect()
        } else {
            a.masters.iter().filter(|m| m.edit || m.display).map(|m| (m.name.clone(), "#515151".into(), m.edit)).collect()
        }
    });
    let cells = move || {
        let masters = shown();
        let out = if !instances && sample.get() == glyph_range {
            masters.first().map(|m| c.with(|a| a.glyph_names(&m.0))).unwrap_or_default()
        } else {
            specimen::glyphs_out(&text(), &filter.get(), strict.get())
        };
        let cells = c.with(|a| specimen::filtered_glyphs(&out, masters.len(), font_by.get(),
            &|i, g| a.find_glyph(&masters[i].0, g).is_some()));
        (masters, cells)
    };
    view! {
        <div class="specimen-panel" class:instance-specimen=instances>
            <div class="specimen-tools">
                <select on:change=move |ev| sample.set(event_target_value(&ev).parse().unwrap_or(0))>
                    {SAMPLES.iter().enumerate().map(|(i, s)| view! { <option value=i.to_string() selected=move || sample.get() == i>{s.1}</option> }).collect_view()}
                    {(!instances).then(|| view! { <option value=glyph_range.to_string()>"Glyph Range"</option> })}
                </select>
                <Show when=move || sample.get() == 0>
                    <input class="own-text" type="text" prop:value=move || own_text.get()
                        on:input=move |ev| own_text.set(event_target_value(&ev))/>
                </Show>
                <label title="Mix these glyphs into the text">"filter "
                    <input class="filter" type="text" prop:value=move || filter.get() on:input=move |ev| filter.set(event_target_value(&ev))/>
                </label>
                <select title="How the filter mixes in" on:change=move |ev| strict.set(event_target_value(&ev).parse().unwrap_or(0))>
                    <option value="0">"loose"</option><option value="1">"normal"</option><option value="2">"tight"</option>
                </select>
                <select title="Alternate the fonts by" on:change=move |ev| font_by.set(match event_target_value(&ev).as_str() {
                        "Glyph" => FontBy::Glyph, "Word" => FontBy::Word, _ => FontBy::Specimen })>
                    <option>"Specimen"</option><option>"Word"</option><option>"Glyph"</option>
                </select>
                <label>"size "<input class="num" type="number" min="8" max="400" prop:value=move || size.get()
                    on:change=move |ev| size.set(event_target_value(&ev).parse().unwrap_or(96.0))/></label>
                <label>"line "<input class="num" type="number" step="0.1" min="0.5" max="3" prop:value=move || line_height.get()
                    on:change=move |ev| line_height.set(event_target_value(&ev).parse().unwrap_or(1.0))/></label>
            </div>
            <div class="specimen-field" node_ref=field style:line-height=move || format!("{}px", size.get() * line_height.get())
                on:mousedown=move |ev: MouseEvent| if !instances && ev.button() == 0 {
                    let p = (ev.client_x() as f64, ev.client_y() as f64);
                    band.set(Some((p, p)));
                    ev.prevent_default();
                }
                on:mousemove=move |ev: MouseEvent| if let Some((s, _)) = band.get_untracked() {
                    band.set(Some((s, (ev.client_x() as f64, ev.client_y() as f64))));
                }
                on:mouseleave=move |_| band.set(None)
                on:mouseup=move |ev: MouseEvent| {
                    let Some((s, e)) = band.get_untracked() else { return };
                    band.set(None);
                    let toggle = ev.shift_key() || ev.meta_key() || ev.alt_key();
                    let (x0, x1, y0, y1) = (s.0.min(e.0), s.0.max(e.0), s.1.min(e.1), s.1.max(e.1));
                    if x1 - x0 < 4.0 && y1 - y0 < 4.0 {
                        // a click: on a glyph its own handler selects, elsewhere deselect all
                        let on_glyph = ev.target().and_then(|t| wasm_bindgen::JsCast::dyn_into::<web_sys::Element>(t).ok())
                            .and_then(|t| t.closest(".glyph").ok().flatten()).is_some();
                        if !on_glyph && !toggle { c.update(|a| a.select_glyph_set(&[], false)); }
                        return;
                    }
                    let Some(f) = field.get_untracked() else { return };
                    let Ok(nodes) = f.query_selector_all(".glyph.selectable") else { return };
                    let mut set = vec![];
                    for i in 0..nodes.length() {
                        let Some(el) = nodes.item(i).and_then(|n| wasm_bindgen::JsCast::dyn_into::<web_sys::Element>(n).ok()) else { continue };
                        let r = el.get_bounding_client_rect();
                        if r.right() >= x0 && r.left() <= x1 && r.bottom() >= y0 && r.top() <= y1 {
                            if let (Some(m), Some(g)) = (el.get_attribute("data-master"), el.get_attribute("data-glyph")) { set.push((m, g)); }
                        }
                    }
                    set.dedup();
                    c.update(|a| a.select_glyph_set(&set, toggle));
                }>
                {move || band.get().map(|(s, e)| view! {
                    <div class="rubberband" style:left=format!("{}px", s.0.min(e.0)) style:top=format!("{}px", s.1.min(e.1))
                        style:width=format!("{}px", (s.0 - e.0).abs()) style:height=format!("{}px", (s.1 - e.1).abs())></div>
                })}
                {move || {
                    let (masters, cells) = cells();
                    if masters.is_empty() {
                        return view! { <p class="hint">{if instances { "No instance yet: add masters to the design space." } else { "No master selected." }}</p> }.into_any();
                    }
                    let px = size.get();
                    cells.into_iter().map(|cell| match cell {
                        Cell::Glyph(i, g) => {
                            let (m, fill, selectable) = masters[i].clone();
                            let svg = c.with(|a| a.glyph_view(&m, &g)).map(|v| (v.to_svg(px, &fill), v.error));
                            let (svg, error) = svg.unwrap_or_default();
                            let (mm, gg) = (m.clone(), g.clone());
                            let selected = move || c.with(|a| a.selected_glyphs.contains(&(mm.clone(), gg.clone())));
                            let (m2, g2) = (m.clone(), g.clone());
                            let click = move |ev: MouseEvent| if selectable {
                                c.update(|a| a.select_glyph(&m2, &g2, ev.shift_key() || ev.meta_key() || ev.alt_key()));
                            };
                            view! {
                                <span class="glyph" class:selected=selected class:selectable=selectable class:has-error=error.is_some()
                                    data-master=m.clone() data-glyph=g.clone()
                                    title=error.map(|e| format!("{g}: {e}")).unwrap_or_else(|| format!("{g} ({m})"))
                                    on:click=click inner_html=svg></span>
                            }.into_any()
                        }
                        Cell::LineBreak => view! { <span class="break"></span> }.into_any(),
                        Cell::ParagraphBreak => view! { <span class="break paragraph"></span> }.into_any(),
                        Cell::SpecimenBreak => view! { <span class="break specimen-break"></span> }.into_any(),
                    }).collect_view().into_any()
                }}
            </div>
        </div>
    }
}

// ---------------------------------------------------------------- masters

#[component]
pub fn MasterPanel() -> impl IntoView {
    let c = ctx();
    let renaming = RwSignal::new(None::<String>);
    let import = move |_| util::pick_file(".zip,application/zip", move |name, data| {
        match c.update(|a| a.import_ufo_zip(&data)) {
            Ok(results) => {
                let (ok, bad): (Vec<_>, Vec<_>) = results.into_iter().partition(|r| r.is_ok());
                let ok: Vec<String> = ok.into_iter().filter_map(|r| r.ok()).collect();
                let bad: Vec<String> = bad.into_iter().filter_map(|r| r.err()).collect();
                if bad.is_empty() { c.info(format!("Imported {}", ok.join(", "))) }
                else { c.error(format!("{name}: imported {}; failed: {}", ok.join(", "), bad.join("; "))) }
            }
            Err(e) => c.error(format!("{name}: {e}")),
        }
    });
    let duplicate = move |_| match c.update(|a| a.duplicate_selected_masters()) {
        Ok(v) if v.is_empty() => c.info("Select masters to duplicate."),
        Ok(v) => c.info(format!("Duplicated as {}", v.join(", "))),
        Err(e) => c.error(e),
    };
    let remove = move |_| {
        let n = c.untracked(|a| a.masters.iter().filter(|m| m.edit).count());
        if n == 0 { return c.info("Select masters to delete."); }
        let ok = web_sys::window().and_then(|w| w.confirm_with_message(&format!("Delete {n} master(s)?")).ok()).unwrap_or(false);
        if !ok { return; }
        match c.update(|a| a.remove_selected_masters()) {
            Ok((_, kept)) if !kept.is_empty() => c.error(format!("Instances depend on {}; remove them first.", kept.join(", "))),
            Ok(_) => c.info("Deleted."),
            Err(e) => c.error(e),
        }
    };
    view! {
        <h2>"Masters"</h2>
        <div class="toolbar">
            <button on:click=import title="Import zipped UFOs (one or more *.ufo directories, or *.ufo.zip files, in a ZIP)">"Import UFO"</button>
            <button on:click=duplicate>"Duplicate"</button>
            <button on:click=remove>"Delete"</button>
        </div>
        <ul class="list masters-list">
            {move || c.with(|a| a.masters.clone()).into_iter().map(|m| {
                let name = m.name.clone();
                let in_space = c.with(|a| a.current_design_space.and_then(|d| a.design_space(d)).map(|d| d.axes.contains(&name)).unwrap_or(false));
                let (n1, n2, n3, n4, n5) = (name.clone(), name.clone(), name.clone(), name.clone(), name.clone());
                let is_renaming = { let n = name.clone(); move || renaming.get().as_deref() == Some(n.as_str()) };
                view! {
                    <li class:selected=m.edit>
                        <span class="eye" class:on=m.display title="Also show in the master specimen"
                            on:click=move |_| { let d = !m.display; c.update(|a| if let Some(x) = a.master_mut(&n1) { x.display = d }) }>"◉"</span>
                        <Show when=is_renaming.clone() fallback={
                            let dn = m.display_name.clone();
                            move || {
                                let (n2, n3) = (n2.clone(), n3.clone());
                                view! {
                                    <span class="name" title="click: select, shift-click: add to selection, double-click: rename"
                                        on:click=move |ev: MouseEvent| c.update(|a| a.select_master(&n2, ev.shift_key() || ev.meta_key()))
                                        on:dblclick=move |_| renaming.set(Some(n3.clone()))>{dn.clone()}</span>
                                }
                            }
                        }>
                            {
                                let n4 = n4.clone();
                                view! {
                                    <input class="rename" type="text" value=m.display_name.clone() autofocus=true
                                        on:keydown=move |ev: KeyboardEvent| if ev.key() == "Enter" || ev.key() == "Escape" {
                                            if ev.key() == "Enter" { let v = event_target_value(&ev); c.update(|a| a.rename_master(&n4, &v)); }
                                            renaming.set(None);
                                        }
                                        on:blur=move |_| renaming.set(None)/>
                                }
                            }
                        </Show>
                        <button class="to-space" disabled=in_space title="Add to the current design space"
                            on:click=move |_| if let Err(e) = c.update(|a| a.add_master_to_design_space(&n5)) { c.error(e) }>"→"</button>
                    </li>
                }
            }).collect_view()}
        </ul>
    }
}

// ----------------------------------------------------------- design space

#[component]
pub fn DesignSpacePanel() -> impl IntoView {
    let c = ctx();
    let current = move || c.with(|a| a.current_design_space.and_then(|d| a.design_space(d)).cloned());
    let instance = move || c.with(|a| {
        let ds = a.current_design_space?;
        a.current_instance.and_then(|i| a.instance(i)).filter(|i| i.design_space == ds).cloned()
    });
    view! {
        <h2>"Design space"</h2>
        <div class="tabs">
            {move || {
                let cur = c.with(|a| a.current_design_space);
                c.with(|a| a.design_spaces.clone()).into_iter().map(|d| view! {
                    <button class="tab" class:selected=cur == Some(d.id) on:click=move |_| c.update(|a| a.select_design_space(d.id))>{d.name.clone()}</button>
                }).collect_view()
            }}
            <button title="New design space" on:click=move |_| { c.update(|a| a.add_design_space()); }>"+"</button>
            <button title="Clone the design space with its instances" on:click=move |_| if let Err(e) = c.update(|a| a.clone_design_space()) { c.error(e) }>"clone"</button>
            <button title="Delete the design space and its instances" on:click=move |_| {
                let Some(d) = current() else { return };
                let n = c.untracked(|a| a.instances.iter().filter(|i| i.design_space == d.id).count());
                if n > 0 && !web_sys::window().and_then(|w| w.confirm_with_message(&format!("Delete {} and its {n} instance(s)?", d.name)).ok()).unwrap_or(false) { return; }
                if let Err(e) = c.update(|a| a.remove_design_space(d.id)) { c.error(e) }
            }>"delete"</button>
        </div>
        {move || match current() {
            None => view! { <p class="hint">"No design space. Add one with +."</p> }.into_any(),
            Some(d) if d.axes.is_empty() => view! { <p class="hint">"Add masters with → in the masters panel."</p> }.into_any(),
            Some(d) => {
                let inst = instance();
                let many = d.axes.len() > 2;
                let names: Vec<String> = c.with(|a| d.axes.iter().map(|m| a.master(m).map(|x| x.display_name.clone()).unwrap_or(m.clone())).collect());
                view! {
                    <div class="axes">
                        {d.axes.iter().enumerate().map(|(i, m)| {
                            let value = inst.as_ref().and_then(|x| x.axes.get(i)).map(|x| (x.axis_value, x.metapolation_value));
                            let id = inst.as_ref().map(|x| x.id);
                            let slack = d.slack == i && d.axes.len() > 1;
                            let m2 = m.clone();
                            let did = d.id;
                            view! {
                                <div class="axis" class:slack=slack>
                                    <span class="master">{names[i].clone()}</span>
                                    <input type="range" min="0" max="100" step="0.1" disabled=id.is_none()
                                        style:direction=if slack { "rtl" } else { "ltr" }
                                        prop:value=value.map(|v| v.0).unwrap_or(0.0)
                                        on:change=move |ev| if let (Some(id), Ok(v)) = (id, event_target_value(&ev).parse::<f64>()) {
                                            if let Err(e) = c.update(|a| a.set_axis_value(id, i, v)) { c.error(e) }
                                        }/>
                                    <span class="value">{value.map(|v| format!("{:.1} · {:.0}%", v.0, v.1 * 100.0)).unwrap_or_default()}</span>
                                    <Show when=move || many>
                                        <input type="radio" name="slack" checked=slack title="Slack master: its slider scales the others"
                                            on:change=move |_| if let Err(e) = c.update(|a| a.set_slack(did, i)) { c.error(e) }/>
                                    </Show>
                                    <button class="remove" title="Remove from the design space" on:click={
                                        let m2 = m2.clone();
                                        move |_| {
                                            let msg = if c.untracked(|a| a.design_space(did).map(|d| d.axes.len()).unwrap_or(0)) == 1 {
                                                "Remove master? This removes the instances as well." } else { "Remove master? It will no longer be part of the instances." };
                                            if web_sys::window().and_then(|w| w.confirm_with_message(msg).ok()).unwrap_or(false) {
                                                if let Err(e) = c.update(|a| a.remove_axis(did, &m2)) { c.error(e) }
                                            }
                                        }
                                    }>"×"</button>
                                </div>
                            }
                        }).collect_view()}
                    </div>
                }.into_any()
            }
        }}
    }
}

// -------------------------------------------------------------- instances

#[component]
pub fn InstancePanel() -> impl IntoView {
    let c = ctx();
    let renaming = RwSignal::new(None::<u32>);
    let export = move |_| {
        let ts = util::timestamp();
        match c.untracked(|a| a.export_bundle(&ts)) {
            Ok((name, data, errors)) => {
                util::download(&name, &data, "application/zip");
                if errors.is_empty() { c.info(format!("Exported {name}")) } else { c.error(format!("Exported {name} with errors: {}", errors.join("; "))) }
            }
            Err(e) => c.error(e),
        }
    };
    view! {
        <h2>"Instances"</h2>
        <div class="toolbar">
            <button title="A new instance in the current design space" on:click=move |_| match c.update(|a| a.add_instance()) {
                Ok(None) => c.info("Add masters to the design space first."), Ok(_) => {}, Err(e) => c.error(e) }>"Add"</button>
            <button on:click=move |_| if let Err(e) = c.update(|a| a.clone_instance()) { c.error(e) }>"Duplicate"</button>
            <button on:click=move |_| {
                let Some(id) = c.untracked(|a| a.current_instance) else { return };
                let last = c.untracked(|a| { let ds = a.instance(id).map(|i| i.design_space); a.instances.iter().filter(|i| Some(i.design_space) == ds).count() == 1 });
                if last && !web_sys::window().and_then(|w| w.confirm_with_message("Delete instance? This also deletes its design space.").ok()).unwrap_or(false) { return; }
                if let Err(e) = c.update(|a| a.remove_instance(id)) { c.error(e) }
            }>"Delete"</button>
        </div>
        <ul class="list instances-list">
            {move || {
                let cur = c.with(|a| a.current_instance);
                c.with(|a| a.instances.clone()).into_iter().map(|i| {
                    let id = i.id;
                    let space = c.with(|a| a.design_space(i.design_space).map(|d| d.name.clone()).unwrap_or_default());
                    view! {
                        <li class:selected=cur == Some(id) on:click=move |_| c.update(|a| { a.set_current_instance(id); if let Some(ds) = a.instance(id).map(|x| x.design_space) { a.current_design_space = Some(ds) } })>
                            <span class="swatch" style:background=i.color></span>
                            <Show when=move || renaming.get() == Some(id) fallback={
                                let dn = i.display_name.clone();
                                move || view! { <span class="name" on:dblclick=move |_| renaming.set(Some(id)) title="double-click: rename">{dn.clone()}</span> }
                            }>
                                <input class="rename" type="text" value=i.display_name.clone()
                                    on:keydown=move |ev: KeyboardEvent| if ev.key() == "Enter" || ev.key() == "Escape" {
                                        if ev.key() == "Enter" { let v = event_target_value(&ev); c.update(|a| a.rename_instance(id, &v)); }
                                        renaming.set(None);
                                    }
                                    on:blur=move |_| renaming.set(None)/>
                            </Show>
                            <small class="space">{space}</small>
                            <label title="Also show in the instance specimen"><input type="checkbox" checked=i.display
                                on:click=move |ev| ev.stop_propagation()
                                on:change=move |ev| { let v = event_target_checked(&ev); c.update(|a| a.set_instance_flags(id, None, Some(v))) }/>"show"</label>
                            <label title="Include in the export"><input type="checkbox" checked=i.export
                                on:click=move |ev| ev.stop_propagation()
                                on:change=move |ev| { let v = event_target_checked(&ev); c.update(|a| a.set_instance_flags(id, Some(v), None)) }/>"export"</label>
                        </li>
                    }
                }).collect_view()
            }}
        </ul>
        <div class="export">
            <div class="toolbar">
                <button on:click=move |_| c.update(|a| a.set_all_export(true))>"Check all"</button>
                <button on:click=move |_| c.update(|a| a.set_all_export(false))>"Uncheck all"</button>
            </div>
            <button class="primary" on:click=export title="OTF and UFO of every instance marked for export, in one ZIP">"Export fonts"</button>
        </div>
    }
}
