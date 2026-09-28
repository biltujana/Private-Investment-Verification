async function run() {
  const query = `{
    contractType: __type(name: "Contract") {
      fields {
        name
        type {
          name
          kind
          ofType { name kind }
        }
      }
    }
    contractActionType: __type(name: "ContractAction") {
      fields {
        name
        type {
          name
          kind
          ofType { name kind }
        }
      }
    }
    transactionType: __type(name: "Transaction") {
      fields {
        name
        type {
          name
          kind
          ofType { name kind }
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
