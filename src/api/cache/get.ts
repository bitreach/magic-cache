import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";
import { z } from "zod";

import {
  APIError,
  BadRequestError,
  InternalError,
  NotFoundError,
  UnauthenticatedError,
} from "../../common/errors/api_error";
import { EmbeddingHelper } from "../../helpers/embedding_helper";
import { getUserFromJWT, supabaseClient } from "../../lib/supabase";

dotenv.config();

const payloadSchema = z.object({
  prompt: z.string().nonempty(),
  //   parse string into number
  similarity_threshold: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive().max(1)
  ),
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

    const zodRes = payloadSchema.safeParse(req.query);
    if (!zodRes.success)
      throw new BadRequestError(
        zodRes.error.errors
          .map((error: any) => `${error.code} ${error.path} ${error.message}`)
          .join(",")
      );

    const payload: Payload = zodRes.data;

    console.log(payload);

    const promptEmbedding = await EmbeddingHelper.computeEmbedding(
      payload.prompt
    );

    console.log(promptEmbedding);

    const { data: documents } = await supabaseClient.rpc(
      "match_prompts_cosine_auth",
      {
        query_embedding: promptEmbedding,
        match_threshold: payload.similarity_threshold, // Similarity threshold
        match_count: 10, // Number of match
        auth_user_id: user.id,
      }
    );

    if (!documents || documents.length === 0)
      throw new NotFoundError("No documents found");

    return res.json(documents);
  } catch (e) {
    console.error(e);
    if (e instanceof APIError) throw e;
    throw new InternalError((e as Error).message);
  }
};
