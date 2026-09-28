async function run() {
  const query = `{
    __schema {
      queryType {
        fields {
          name
          description
          args {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  }`;
  const res = await fetch("https://indexer.preview.midnight.network/api/v4/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const fields = data.data.__schema.queryType.fields;
  console.log("GraphQL Query Fields:");
  fields.forEach(f => {
    console.log(`- ${f.name} (${f.args.map(a => a.name).join(", ")})`);
  });
}
run();
