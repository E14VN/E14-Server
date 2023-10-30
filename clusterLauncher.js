import cluster from "cluster";
import { availableParallelism } from "os";
var numCPUs = availableParallelism();
if (cluster.isPrimary) {
    console.log("Primary ".concat(process.pid, " is running."));
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
        console.log("Worker ".concat(worker.process.pid, " died."));
    });
}
else {
    console.log("Worker ".concat(process.pid, " started."));
}
