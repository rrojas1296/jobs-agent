import { BadRequestException, PipeTransform } from "@nestjs/common";
import { z } from "zod";
export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: z.ZodType<T>) {}
  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success)
      throw new BadRequestException({
        message: "Revisa los campos del formulario",
        errors: z.flattenError(result.error).fieldErrors,
      });
    return result.data;
  }
}
