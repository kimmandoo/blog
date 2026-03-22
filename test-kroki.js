fetch("https://kroki.io/", {
  method: "POST",
  body: JSON.stringify({
    diagram_source: "graph TD\n  A --> B",
    diagram_type: "mermaid",
    output_format: "svg"
  })
}).then(res => res.text()).then(console.log).catch(console.error);
