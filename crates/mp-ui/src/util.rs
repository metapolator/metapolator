//! Browser plumbing: files in and out, timestamps, numeric input.

use wasm_bindgen::JsCast;

/// let the user pick a file, then call `done(name, bytes)`
pub fn pick_file(accept: &str, done: impl Fn(String, Vec<u8>) + 'static) {
    let doc = web_sys::window().unwrap().document().unwrap();
    let input: web_sys::HtmlInputElement = doc.create_element("input").unwrap().unchecked_into();
    input.set_type("file");
    input.set_accept(accept);
    let done = std::rc::Rc::new(done);
    let inp = input.clone();
    let cb = wasm_bindgen::closure::Closure::<dyn FnMut()>::new(move || {
        let Some(file) = inp.files().and_then(|f| f.get(0)) else { return };
        let done = done.clone();
        leptos::task::spawn_local(async move {
            let name = file.name();
            if let Ok(buf) = wasm_bindgen_futures::JsFuture::from(file.array_buffer()).await {
                done(name, js_sys::Uint8Array::new(&buf).to_vec());
            }
        });
    });
    input.set_onchange(Some(cb.as_ref().unchecked_ref()));
    cb.forget();
    input.click();
}

/// offer `data` as a download called `name`
pub fn download(name: &str, data: &[u8], mime: &str) {
    let arr = js_sys::Uint8Array::from(data);
    let parts = js_sys::Array::of1(&arr);
    let opts = web_sys::BlobPropertyBag::new();
    opts.set_type(mime);
    let Ok(blob) = web_sys::Blob::new_with_u8_array_sequence_and_options(&parts, &opts) else { return };
    let Ok(url) = web_sys::Url::create_object_url_with_blob(&blob) else { return };
    let doc = web_sys::window().unwrap().document().unwrap();
    let a: web_sys::HtmlAnchorElement = doc.create_element("a").unwrap().unchecked_into();
    a.set_href(&url);
    a.set_download(name);
    a.click();
    let _ = web_sys::Url::revoke_object_url(&url);
}

/// `getTimestamp()` of the instance panel: local `YYYYMMDD-hhmmss`
pub fn timestamp() -> String {
    let d = js_sys::Date::new_0();
    format!("{:04}{:02}{:02}-{:02}{:02}{:02}", d.get_full_year(), d.get_month() + 1, d.get_date(),
            d.get_hours(), d.get_minutes(), d.get_seconds())
}
