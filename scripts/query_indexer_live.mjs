const CONTRACT = '0xf300c8ef23885f1cc04e6879ec5085f0845eff81c79d5ef6066f176af11df09f';
const cleanAddr = CONTRACT.replace(/^0x/, '');
const INDEXER = 'https://indexer.preview.midnight.network/api/v4/graphql';

const query = {
  query: `{
    contract(address: "${cleanAddr}") {
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
    contractAction(address: "${cleanAddr}") {
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
  }`
};

try {
  const r = await fetch(INDEXER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });
  const j = await r.json();
  console.log(JSON.stringify(j, null, 2));
} catch (e) {
  console.error('Indexer error:', e.message);
}
