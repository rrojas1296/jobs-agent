import { ConfigService } from "@nestjs/config";
import { createApp } from "./bootstrap";
async function main() {
  const app = await createApp();
  await app.listen(app.get(ConfigService).getOrThrow<number>("PORT"), "127.0.0.1");
}
void main();
