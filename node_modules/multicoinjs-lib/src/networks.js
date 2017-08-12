// https://en.bitcoin.it/wiki/List_of_address_prefixes
// Dogecoin BIP32 is a proposed standard: https://bitcointalk.org/index.php?topic=409731

module.exports = {
  bitcoin: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
    dustThreshold: 546, // https://github.com/bitcoin/bitcoin/blob/v0.9.2/src/core.h#L151-L162
    isPoS: false
  },
  testnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
    dustThreshold: 546,
    isPoS: false
  },
  litecoin: {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe
    },
    pubKeyHash: 0x30,
    scriptHash: 0x05,
    wif: 0xb0,
    dustThreshold: 0, // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.cpp#L360-L365
    isPoS: false
  },
  dogecoin: {
    messagePrefix: '\x19Dogecoin Signed Message:\n',
    bip32: {
      public: 0x02facafd,
      private: 0x02fac398
    },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e,
    dustThreshold: 0, // https://github.com/dogecoin/dogecoin/blob/v1.7.1/src/core.h#L155-L160
    isPoS: false
  },
  peercoin: {
    messagePrefix: '\x17PPCoin Signed Message:\n',
    bip32: {
      public: 0x01da950b,  // start with "Ppub..."
      private: 0x01da90d0  // start with "Pprv..."
    },
    pubKeyHash: 0x37,
    scriptHash: 0x75,
    wif: 0xb7,
    dustThreshold: 0,
    isPoS: true
  },
  novacoin: {
    messagePrefix: '\x19NovaCoin Signed Message:\n',
    bip32: {
      public: 0x01da950b,  // TODO (start with "Ppub...)"
      private: 0x01da90d0  // TODO (start with "Pprv...)"
    },
    pubKeyHash: 0x08,
    scriptHash: 0x14,
    wif: 0x88,
    dustThreshold: 0,
    isPoS: true
  },
  dash: {
    messagePrefix: '\x19DarkCoin Signed Message:\n', // https://github.com/dashpay/dash/blob/master/src/main.cpp#L90
    bip32: {
      public: 0x02fe52f8, // https://github.com/dashpay/dash/blob/master/src/chainparams.cpp#L172
      private: 0x02fe52cc // https://github.com/dashpay/dash/blob/master/src/chainparams.cpp#L173
    },
    pubKeyHash: 0x4c, // https://github.com/dashpay/dash/blob/master/src/chainparams.cpp#L169
    scriptHash: 0x10, // https://github.com/dashpay/dash/blob/master/src/chainparams.cpp#L170
    wif: 0xcc, // https://github.com/dashpay/dash/blob/master/src/chainparams.cpp#L171
    dustThreshold: 5460, // https://github.com/dashpay/dash/blob/v0.12.0.x/src/primitives/transaction.h#L144-L155
    isPoS: false
  },
  sib: {
    messagePrefix: '\x18SibCoin Signed Message:\n', // https://github.com/ivansib/sibcoin/blob/master/src/main.cpp#L91
    bip32: {
      public: 0x0488b21e, // https://github.com/ivansib/sibcoin/blob/master/src/chainparams.cpp#L175
      private: 0x0488ade4 // https://github.com/ivansib/sibcoin/blob/master/src/chainparams.cpp#L176
    },
    pubKeyHash: 0x3f, // https://github.com/ivansib/sibcoin/blob/master/src/chainparams.cpp#L172
    scriptHash: 0x28, // https://github.com/ivansib/sibcoin/blob/master/src/chainparams.cpp#L173
    wif: 0x80, // https://github.com/ivansib/sibcoin/blob/master/src/chainparams.cpp#L174
    dustThreshold: 5460, // https://github.com/ivansib/sibcoin/blob/master/src/primitives/transaction.h#L144-L155
    isPoS: false
  },
  e51: {
    messagePrefix: '\x14E51 Signed Message:\n',
    bip32: {
      public: 0x04088B21E, 
      private: 0x0488ade4 
    },
    pubKeyHash: 0x5c, 
    scriptHash: 0x06, 
    wif: 0x81, 
    dustThreshold: 546, 
    isPoS: false
  },
  cby: {
    messagePrefix: '\x14Y51 Signed Message:\n',
    bip32: {
      public: 0x04088B21E, 
      private: 0x0488ade4 
    },
    pubKeyHash: 78, 
    scriptHash: 11, 
    wif: 134, 
    dustThreshold: 546, 
    isPoS: false
  },
  cbr: {
    messagePrefix: '\x14R51 Signed Message:\n',
    bip32: {
      public: 0x04088B21E, 
      private: 0x0488ade4 
    },
    pubKeyHash: 60, 
    scriptHash: 7, 
    wif: 130, 
    dustThreshold: 546, 
    isPoS: false
  },
  cbd: {
    messagePrefix: '\x14D51 Signed Message:\n',
    bip32: {
      public: 0x04088B21E, 
      private: 0x0488ade4 
    },
    pubKeyHash: 30, 
    scriptHash: 13, 
    wif: 136, 
    dustThreshold: 546, 
    isPoS: false
  },
  cbmt: {
    messagePrefix: '\x18CBToken Signed Message:\n',
    bip32: {
      public: 0x04088B21E, 
      private: 0x0488ade4 
    },
    pubKeyHash: 65, 
    scriptHash: 16, 
    wif: 139, 
    dustThreshold: 546, 
    isPoS: false
  },
  smailcoin: {
    messagePrefix: '\x1ASmailCoin Signed Message:\n',
    bip32: {
      public: 0x04088B21E, 
      private: 0x0488ade4 
    },
    pubKeyHash: 0x3F, 
    scriptHash: 0x06, 
    wif: 0x81, 
    dustThreshold: 546, 
    isPoS: false
  },
  natcoin: {
    messagePrefix: '\x18NatCoin Signed Message:\n',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe
    },
    pubKeyHash: 52,
    scriptHash: 0x05,
    wif: 0xb4,
    dustThreshold: 0, // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.cpp#L360-L365
    isPoS: false
  },
  
  marycoin: {
    messagePrefix: '\x19Marycoin Signed Message:\n',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 50,
    scriptHash: 0x06,
    wif: 0x81,
    dustThreshold: 546, // https://github.com/bitcoin/bitcoin/blob/v0.9.2/src/core.h#L151-L162
    isPoS: false
  },
  
}
