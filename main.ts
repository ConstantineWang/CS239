import { faast } from "faastjs";
import * as funcs from "./functions.js";

(async () => {
    const m = await faast("local", funcs);

    const { hello } = m.functions;

    const start = process.hrtime.bigint();
    const result = await hello("world!");

    const promises: Promise<string>[] = [];
    for (let i = 0; i < 10; i++) {
        promises.push(hello(`world ${i}!`));
    }
    await Promise.all(promises);

    const end = process.hrtime.bigint();
    console.log(result);

    const executionTimeMs = Number(end - start) / 1_000_000;
    console.log(`Execution Time: ${executionTimeMs.toFixed(2)} ms`);

    const cost = estimateLambdaCost(executionTimeMs, 128);
    console.log(`Estimated AWS Lambda Cost: $${cost.toFixed(6)}`);

    await m.cleanup();
})();

function estimateLambdaCost(executionTimeMs: number, memoryMb: number): number {
    const awsLambdaPricePerMs = (memoryMb / 1024); 
    return executionTimeMs * awsLambdaPricePerMs;
}
