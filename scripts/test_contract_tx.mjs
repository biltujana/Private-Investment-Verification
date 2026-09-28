async function run() {
  const clean = "f300c8ef23885f1cc04e6879ec5085f0845eff81c79d5ef6066f176af11df09f";
  const query = `{
    contractAction(address: "${clean}") {
      address
      transaction {
        id
        hash
        block {
          height
          hash
        }
      }
    }
  }`;
  const res = await fetch("https://indexer.preview.midnight.network/api/v4/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}
run();
