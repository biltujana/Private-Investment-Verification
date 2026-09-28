async function run() {
  const clean = "f300c8ef23885f1cc04e6879ec5085f0845eff81c79d5ef6066f176af11df09f";
  const query = `{
    contract(address: "${clean}") {
      address
      actions {
        address
        transaction {
          id
          hash
          protocolVersion
          block {
            height
            hash
          }
        }
      }
    }
    contractAction(address: "${clean}") {
      address
      state
      transaction {
        id
        hash
        block {
          height
          hash
        }
      }
    }
    block {
      height
      hash
    }
  }`;
  const res = await fetch("https://indexer.preview.midnight.network/api/v4/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log("Combined Query Result:");
  console.log("contract actions:", data?.data?.contract?.actions?.length);
  console.log("action tx hash:", data?.data?.contractAction?.transaction?.hash);
  console.log("action tx block:", data?.data?.contractAction?.transaction?.block?.height);
  console.log("latest chain block:", data?.data?.block?.height);
}
run();
