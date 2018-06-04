module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*"
        },
        ropsten:  {
            network_id: 3,
            host: "localhost",
            port:  8545,
            gas:   21000
        }
    },
    rpc: {
        host: 'localhost',
        post:8080
    }
}
