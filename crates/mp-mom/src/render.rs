//! Rendering MOM glyphs to a point pen: port of Atem-MOM `rendering/basics.es6.js`.

use crate::tree::{Kind, Mom};
use mp_cps::{CpsError, Engine, NodeId, Result, Value};
use mp_ufo::PointPen;

fn vec_of(engine: &Engine<Mom>, n: NodeId, key: &str) -> Result<[f64; 2]> {
    match engine.get(n, key)? {
        Value::Vector(v) => Ok([v.x, v.y]),
        // `.valueOf()` of a non-Vector: the pen then rejects it
        other => Err(CpsError::type_error(format!("\"{key}\" is not a Vector: {other}"))),
    }
}

#[derive(Clone, Copy, PartialEq)]
enum Terminal { None, Start, End }

/// `getControlsFromStyle(p0, p1, terminal)`
fn controls(engine: &Engine<Mom>, p0: NodeId, p1: NodeId, t: Terminal) -> Result<[[f64; 2]; 2]> {
    let a = vec_of(engine, p0, if t == Terminal::Start { "in" } else { "out" })?;
    let b = vec_of(engine, p1, if t == Terminal::End { "out" } else { "in" })?;
    Ok([a, b])
}

/// `renderPenstrokeOutline`
pub fn render_penstroke_outline(engine: &Engine<Mom>, pen: &mut dyn PointPen, penstroke: NodeId) -> Result<()> {
    let mom = &engine.model;
    let points = mom.node(penstroke).children.clone();
    let left = |i: usize| mom.node(points[i]).children[0];
    let right = |i: usize| mom.node(points[i]).children[1];
    let l = points.len();
    pen.begin_path();
    for i in 0..l {
        let point = right(i);
        let (pre, terminal) = if i == 0 { (left(0), Terminal::Start) } else { (right(i - 1), Terminal::None) };
        let c = controls(engine, pre, point, terminal)?;
        pen.add_point(c[0], None);
        pen.add_point(c[1], None);
        pen.add_point(vec_of(engine, point, "on")?, Some("curve"));
    }
    for i in (0..l).rev() {
        let mut point = left(i);
        let (pre, terminal) = if i == l - 1 {
            (right(i), Terminal::End)
        } else {
            let pre = point;
            point = left(i + 1);
            (pre, Terminal::None)
        };
        let mut c = controls(engine, pre, point, terminal)?;
        if terminal == Terminal::None {
            c.reverse();
            point = pre;
        }
        pen.add_point(c[0], None);
        pen.add_point(c[1], None);
        pen.add_point(vec_of(engine, point, "on")?, Some("curve"));
    }
    pen.end_path();
    Ok(())
}

/// `renderContour`
pub fn render_contour(engine: &Engine<Mom>, pen: &mut dyn PointPen, contour: NodeId) -> Result<()> {
    pen.begin_path();
    for p in engine.model.node(contour).children.clone() {
        pen.add_point(vec_of(engine, p, "in")?, None);
        pen.add_point(vec_of(engine, p, "on")?, Some("curve"));
        pen.add_point(vec_of(engine, p, "out")?, None);
    }
    pen.end_path();
    Ok(())
}

/// `renderComponent`
pub fn render_component(engine: &Engine<Mom>, pen: &mut dyn PointPen, component: NodeId) -> Result<()> {
    let name = match engine.get(component, "baseGlyphName")? {
        Value::String(s) => s.to_string(),
        other => other.to_string(),
    };
    let t = match engine.get(component, "transformation")? {
        Value::Transform(t) => t.0,
        _ => return Err(CpsError::type_error("transformation is not a Transformation")),
    };
    pen.add_component(&name, t);
    Ok(())
}

/// `renderPenstrokeCenterline` (used by the UI)
pub fn render_penstroke_centerline(engine: &Engine<Mom>, pen: &mut dyn PointPen, penstroke: NodeId) -> Result<()> {
    let points = engine.model.node(penstroke).children.clone();
    pen.begin_path();
    for (i, p) in points.iter().enumerate() {
        if i != 0 {
            let c = controls(engine, points[i - 1], *p, Terminal::None)?;
            pen.add_point(c[0], None);
            pen.add_point(c[1], None);
            pen.add_point(vec_of(engine, *p, "on")?, Some("curve"));
        } else {
            pen.add_point(vec_of(engine, *p, "on")?, Some("move"));
        }
    }
    pen.end_path();
    Ok(())
}

/// `drawPoints(glyph, pen)` with the outlines renderer
pub fn draw_glyph(engine: &Engine<Mom>, glyph: NodeId, pen: &mut dyn PointPen) -> Result<()> {
    for child in engine.model.node(glyph).children.clone() {
        match engine.model.kind(child) {
            Kind::PenStroke => render_penstroke_outline(engine, pen, child)?,
            Kind::Contour => render_contour(engine, pen, child)?,
            Kind::Component => render_component(engine, pen, child)?,
            _ => {}
        }
    }
    Ok(())
}
