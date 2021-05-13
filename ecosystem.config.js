module.exports = {
  apps : [{
    name   : "meat-api",
    script : "./main.ts",
    instances: 0,
    exec_mode: "cluster",
    watch: true,
    merge_logs: true,
    env: {
      SERVER_PORT: 5000
    }
  }]
}
