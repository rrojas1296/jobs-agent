import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { PasswordHasher } from "../domain/session";
@Injectable()
export class ArgonPasswordHasher extends PasswordHasher {
  hash(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
  }
  verify(hash: string, password: string) {
    return argon2.verify(hash, password);
  }
}
