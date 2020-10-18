function parseSignature(signature) {
  var r = signature.substring(0, 64);
  var s = signature.substring(64, 128);
  var v = signature.substring(128, 130);

  return {
      r: "0x" + r,
      s: "0x" + s,
      v: parseInt(v, 16)
  }
}

function genSolidityVerifier(signature, signer, chainId) {
	  
  return solidityCode
    .replace("<CHAINID>", chainId)
    .replace("<SIGR>", signature.r)
    .replace("<SIGS>", signature.s)
    .replace("<SIGV>", signature.v)
    .replace("<SIGNER>", signer);
}

window.onload = function (e) {
  var res = document.getElementById("response");
  res.style.display = "none";

  // force the user to unlock their MetaMask
  if (web3.eth.accounts[0] == null) {
    alert("Please unlock MetaMask first");
    // Trigger login request with MetaMask
    web3.currentProvider.enable().catch(alert)
  }

  var signBtn = document.getElementById("signBtn");
  signBtn.onclick = function(e) {
    if (web3.eth.accounts[0] == null) {
      return;
    }

    const domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      // { name: "salt", type: "bytes32" },
    ];

    const bid = [
      { name: "amount", type: "uint256" },
      { name: "bidder", type: "address" },
    ];

    const identity = [
      { name: "wallet", type: "address" },
      { name: "token", type: "address" },
    ];

    const chainId = parseInt(web3.version.network, 61);
  
    const domainData = {
      name: "Uniswap V2",
      version: "1",
      chainId: chainId,
      verifyingContract: "0xd8ebe4e6ac8d3c85e2f243e11e8b96c9b12c85af"
      // salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
    };

    var message = {
      amount: 1,
      bidder: {
        wallet: "0x5EF83Ab1155786f146c5A00722bEF7aB683Dc0DE",
        token: "0xd8ebe4e6ac8d3c85e2f243e11e8b96c9b12c85af"
      }
    };
    
    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        Bid: bid,
        Identity: identity,
      },
      domain: domainData,
      primaryType: "Bid",
      message: message
    });

    const signer = web3.toChecksumAddress(web3.eth.accounts[0]);

    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v3",
        params: [signer, data],
        from: signer
      }, 
      function(err, result) {
        if (err || result.error) {
          return console.error(result);
        }

        const signature = parseSignature(result.result.substring(2));

        res.style.display = "block";
        res.value = genSolidityVerifier(signature, signer, chainId);
      }
    );
  };
}
