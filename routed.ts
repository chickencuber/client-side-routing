const params = (() => {
    const obj: Record<string, string> = {};
    new URLSearchParams(location.search).forEach((v, k) => (obj[k] = v));
    const params: Record<string, string> = {};
    let urlParams = "";
    if(obj.params) {
        const p = Object.entries(JSON.parse(obj.params));
        p.forEach(([k, v]) => params[k] = v as string);
        urlParams = "?" + p.map(([k, v]) => `${k}=${v}`).join("&");
        delete obj.params;
    }
    if(obj.redirect) {
        history.replaceState(null, "", obj.redirect + urlParams);
        delete obj.redirect;
    }
    Object.entries(obj).forEach(([k, v]) => {
      params[k] = v;
    })
    Object.freeze(params);
    return params;
  })()
