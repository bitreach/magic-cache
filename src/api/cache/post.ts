import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";
import { z } from "zod";
import {
  APIError,
  BadRequestError,
  InternalError,
  UnauthenticatedError,
} from "../../common/errors/api_error";
import { getUserFromJWT, supabaseClient } from "../../lib/supabase";
import { EmbeddingHelper } from "../../helpers/embedding_helper";
dotenv.config();

const payloadSchema = z.object({
  prompt: z.string().nonempty(),
  completion: z.string(),
});

// extract the inferred type
type Payload = z.infer<typeof payloadSchema>;

export default async (req: express.Request, res: express.Response) => {
  try {
    const user = await getUserFromJWT(req.headers.authorization as string);
    if (!user)
      throw new UnauthenticatedError(
        "Expecting a valid JWT token in the Authorization header."
      );

    const zodRes = payloadSchema.safeParse(req.body);
    if (!zodRes.success)
      throw new BadRequestError(
        zodRes.error.errors
          .map((error: any) => `${error.code} ${error.path} ${error.message}`)
          .join(",")
      );

    const payload: Payload = zodRes.data;

    const promptEmbedding = await EmbeddingHelper.computeEmbedding(
      payload.prompt
    );

    // Store the vector in Postgres
    const { data, error } = await supabaseClient.from("cache_entries").insert({
      prompt: payload.prompt,
      completion: payload.completion,
      prompt_embedding: promptEmbedding,
      user_id: user.id,
    });

    if (error) throw new InternalError(error.message);

    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    if (e instanceof APIError) throw e;
    throw new InternalError((e as Error).message);
  }
};
